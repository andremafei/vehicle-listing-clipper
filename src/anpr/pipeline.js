import { decodeImageBytes, bitmapToImageData } from '../image/decode.js';
import { downloadImage } from '../image/download.js';
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
 * @property {number} imageIndex 1-based gallery index of the matching image
 * @property {string} imageUrl
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
    return {
      sessions,
      diagnostics: {
        provider: getActiveProvider(),
        detectorCacheHit: true,
        ocrCacheHit: true,
      },
    };
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
 * Run detector + OCR on a single in-memory image.
 * @param {{ detector: any, ocr: any }} sessionPair
 * @param {ArrayBuffer} bytes
 * @param {object} [options]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<{ plate: string, plateFormatted: string, detectionsTried: number } | null>}
 */
export async function scanImageForPlate(sessionPair, bytes, options = {}) {
  const { signal } = options;
  let detectionsTried = 0;

  let imageData;
  try {
    const bitmap = await decodeImageBytes(bytes);
    imageData = bitmapToImageData(bitmap).imageData;
    bitmap.close?.();
  } catch {
    return null;
  }

  const boxes = await detectPlates(sessionPair.detector, imageData);
  for (const box of boxes) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }
    detectionsTried += 1;
    const crop = cropImageData(imageData, box);
    const ocrResult = await recognizePlate(sessionPair.ocr, crop);
    const validated = validatePortuguesePlate(
      ocrResult.text,
      ocrResult.charProbs,
    );
    if (validated.accepted) {
      return {
        plate: validated.plate,
        plateFormatted: validated.plateFormatted,
        detectionsTried,
      };
    }
  }

  return { plate: '', plateFormatted: '', detectionsTried };
}

/**
 * Download gallery URLs one at a time and stop at the first reliable plate.
 * Only one image buffer is held in memory at a time.
 *
 * @param {string[]} urls
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 * @param {(opts: { method: string, url: string, responseType: string, signal?: AbortSignal }) => Promise<unknown>} [options.request]
 * @returns {Promise<AnprSuccess | AnprFailure>}
 */
export async function recognizeFirstPlateFromUrls(urls, options = {}) {
  const started = Date.now();
  const { onStatus, signal, request } = options;
  const total = urls.length;

  const ensured = await ensureAnprSessions({ onStatus, signal });
  const { detector, ocr } = ensured.sessions;

  let detectionsTried = 0;
  let imagesScanned = 0;

  for (let i = 0; i < total; i += 1) {
    if (signal?.aborted) {
      return fail(
        'cancelled',
        ensured.diagnostics,
        imagesScanned,
        detectionsTried,
        started,
      );
    }

    const url = urls[i];
    onStatus?.(`Downloading image ${i + 1} of ${total}`);

    let downloaded;
    try {
      downloaded = await downloadImage(url, { signal, request });
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') {
        return fail(
          'cancelled',
          ensured.diagnostics,
          imagesScanned,
          detectionsTried,
          started,
        );
      }
      onStatus?.(`Failed to download image ${i + 1} of ${total}, skipping…`);
      continue;
    }

    onStatus?.(`Scanning image ${i + 1} of ${total}`);
    imagesScanned += 1;

    let hit;
    try {
      hit = await scanImageForPlate(
        { detector, ocr },
        downloaded.bytes,
        { signal },
      );
    } catch (error) {
      if (signal?.aborted || error?.name === 'AbortError') {
        return fail(
          'cancelled',
          ensured.diagnostics,
          imagesScanned,
          detectionsTried,
          started,
        );
      }
      continue;
    } finally {
      // Drop reference so the buffer can be GC'd before the next download.
      downloaded = null;
    }

    if (!hit) {
      continue;
    }

    detectionsTried += hit.detectionsTried;
    if (hit.plate) {
      return {
        ok: true,
        plate: hit.plate,
        plateFormatted: hit.plateFormatted,
        imageIndex: i + 1,
        imageUrl: url,
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

  return fail(
    'no-reliable-plate',
    ensured.diagnostics,
    imagesScanned,
    detectionsTried,
    started,
  );
}

/**
 * Scan already-downloaded images (tests / callers that prefetched bytes).
 * @param {{ url: string, bytes: ArrayBuffer }[]} images
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 * @returns {Promise<AnprSuccess | AnprFailure>}
 */
export async function recognizeFirstPlate(images, options = {}) {
  return recognizeFirstPlateFromUrls(
    images.map((image) => image.url),
    {
      ...options,
      // Feed preloaded bytes by short-circuiting download via custom request map.
      request: async ({ url }) => {
        const match = images.find((image) => image.url === url);
        if (!match) {
          throw new Error(`Missing preloaded bytes for ${url}`);
        }
        return match.bytes;
      },
    },
  );
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
