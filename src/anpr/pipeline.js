import { decodeImageBytes, bitmapToImageData } from '../image/decode.js';
import { cropImageData } from '../image/crop.js';
import { detectPlates } from './detector.js';
import { recognizePlate } from './ocr.js';
import { validatePortuguesePlate } from './portugal-plates.js';
import { getModelManifest } from './model-manifest.js';
import { loadModelAsset } from './model-cache.js';
import { createInferenceSession, getActiveProvider } from './runtime.js';

/**
 * @typedef {object} AnprDiagnostics
 * @property {string | null} provider
 * @property {boolean} detectorCacheHit
 * @property {boolean} ocrCacheHit
 * @property {number} imagesScanned
 * @property {number} detectionsTried
 * @property {number} elapsedMs
 */

/**
 * @typedef {object} AnprSuccess
 * @property {true} ok
 * @property {string} plate
 * @property {string} plateFormatted
 * @property {AnprDiagnostics} diagnostics
 */

/**
 * @typedef {object} AnprFailure
 * @property {false} ok
 * @property {string} reason
 * @property {AnprDiagnostics} diagnostics
 */

/** @type {{ detector: import('onnxruntime-web').InferenceSession, ocr: import('onnxruntime-web').InferenceSession } | null} */
let sessions = null;

/**
 * Ensure detector + OCR sessions are loaded (cached).
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 */
export async function ensureAnprSessions(options = {}) {
  if (sessions) {
    return { sessions, diagnostics: { provider: getActiveProvider(), detectorCacheHit: true, ocrCacheHit: true } };
  }

  const manifest = getModelManifest();
  const detectorAsset = await loadModelAsset(manifest.detector, options);
  const ocrAsset = await loadModelAsset(manifest.ocr, options);

  options.onStatus?.('Initializing ONNX Runtime…');
  const detector = await createInferenceSession(detectorAsset.bytes);
  const ocr = await createInferenceSession(ocrAsset.bytes);

  sessions = { detector: detector.session, ocr: ocr.session };
  return {
    sessions,
    diagnostics: {
      provider: detector.provider,
      detectorCacheHit: detectorAsset.cacheHit,
      ocrCacheHit: ocrAsset.cacheHit,
    },
  };
}

export function resetAnprSessions() {
  sessions = null;
}

/**
 * Scan downloaded listing images for the first reliable Portuguese plate.
 * @param {{ url: string, bytes: ArrayBuffer }[]} images
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<AnprSuccess | AnprFailure>}
 */
export async function recognizeFirstPlate(images, options = {}) {
  const started = Date.now();
  const { onStatus, signal } = options;

  const ensured = await ensureAnprSessions({ onStatus, signal });
  const { detector, ocr } = ensured.sessions;

  let detectionsTried = 0;
  let imagesScanned = 0;

  for (let i = 0; i < images.length; i += 1) {
    if (signal?.aborted) {
      return fail('cancelled', ensured.diagnostics, imagesScanned, detectionsTried, started);
    }

    onStatus?.(`Scanning image ${i + 1} of ${images.length}`);
    imagesScanned += 1;

    let imageData;
    try {
      const bitmap = await decodeImageBytes(images[i].bytes);
      imageData = bitmapToImageData(bitmap).imageData;
      bitmap.close?.();
    } catch {
      continue;
    }

    const boxes = await detectPlates(detector, imageData);
    for (const box of boxes) {
      if (signal?.aborted) {
        return fail('cancelled', ensured.diagnostics, imagesScanned, detectionsTried, started);
      }
      detectionsTried += 1;
      const crop = cropImageData(imageData, box);
      const ocrResult = await recognizePlate(ocr, crop);
      const validated = validatePortuguesePlate(ocrResult.text, ocrResult.charProbs);
      if (validated.accepted) {
        return {
          ok: true,
          plate: validated.plate,
          plateFormatted: validated.plateFormatted,
          diagnostics: {
            provider: getActiveProvider() || ensured.diagnostics.provider,
            detectorCacheHit: ensured.diagnostics.detectorCacheHit,
            ocrCacheHit: ensured.diagnostics.ocrCacheHit,
            imagesScanned,
            detectionsTried,
            elapsedMs: Date.now() - started,
          },
        };
      }
    }
  }

  return fail('no-reliable-plate', ensured.diagnostics, imagesScanned, detectionsTried, started);
}

function fail(reason, baseDiag, imagesScanned, detectionsTried, started) {
  return {
    ok: false,
    reason,
    diagnostics: {
      provider: getActiveProvider() || baseDiag.provider,
      detectorCacheHit: baseDiag.detectorCacheHit,
      ocrCacheHit: baseDiag.ocrCacheHit,
      imagesScanned,
      detectionsTried,
      elapsedMs: Date.now() - started,
    },
  };
}
