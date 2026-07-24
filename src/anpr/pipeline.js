import { decodeImageBytes, bitmapToImageData } from '../image/decode.js';
import { downloadImage } from '../image/download.js';
import { cropImageData } from '../image/crop.js';
import {
  ANPR_MEDIUM_LONG_EDGE,
  toHighAnprImageUrl,
  toMediumAnprImageUrl,
} from '../image/anpr-resolution.js';
import { detectPlates } from './detector.js';
import { recognizePlate } from './ocr.js';
import {
  isHighPlateConfidence,
  preferPlateCandidate,
  validatePortuguesePlate,
} from './portugal-plates.js';
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
 * @property {number | null} meanConfidence Mean per-character OCR confidence (0–1)
 * @property {boolean} needsConfirmation True when best hit is below high-confidence threshold
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

/**
 * @typedef {{
 *   plate: string,
 *   plateFormatted: string,
 *   meanConfidence: number | null,
 *   imageIndex: number,
 *   imageUrl: string,
 * }} AnprPlateHit
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
 * @param {number} [options.maxLongEdge] Cap decode long edge (medium pass)
 * @returns {Promise<{ plate: string, plateFormatted: string, meanConfidence: number | null, detectionsTried: number } | null>}
 */
export async function scanImageForPlate(sessionPair, bytes, options = {}) {
  const { signal, maxLongEdge } = options;
  let detectionsTried = 0;

  let imageData;
  try {
    const bitmap = await decodeImageBytes(bytes);
    imageData = bitmapToImageData(bitmap, { maxLongEdge }).imageData;
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
        meanConfidence:
          typeof validated.meanConfidence === 'number' &&
          Number.isFinite(validated.meanConfidence)
            ? validated.meanConfidence
            : null,
        detectionsTried,
      };
    }
  }

  return {
    plate: '',
    plateFormatted: '',
    meanConfidence: null,
    detectionsTried,
  };
}

/**
 * @param {AnprPlateHit} hit
 * @param {object} ensuredDiag
 * @param {number} imagesScanned
 * @param {number} detectionsTried
 * @param {number} started
 * @param {boolean} needsConfirmation
 * @returns {AnprSuccess}
 */
function successFromHit(
  hit,
  ensuredDiag,
  imagesScanned,
  detectionsTried,
  started,
  needsConfirmation,
) {
  return {
    ok: true,
    plate: hit.plate,
    plateFormatted: hit.plateFormatted,
    meanConfidence: hit.meanConfidence,
    needsConfirmation,
    imageIndex: hit.imageIndex,
    imageUrl: hit.imageUrl,
    diagnostics: {
      provider: getActiveProvider() || ensuredDiag.provider,
      detectorCacheHit: ensuredDiag.detectorCacheHit,
      ocrCacheHit: ensuredDiag.ocrCacheHit,
      imagesScanned,
      detectionsTried,
      elapsedMs: Date.now() - started,
    },
  };
}

/**
 * Download + scan one gallery image at a given resolution.
 * @param {object} args
 * @param {{ detector: any, ocr: any }} args.sessionPair
 * @param {string} args.downloadUrl
 * @param {string} args.galleryUrl URL reported in the hit (discovery URL)
 * @param {number} args.imageIndex 1-based
 * @param {number | undefined} args.maxLongEdge
 * @param {AbortSignal | undefined} args.signal
 * @param {(opts: { method: string, url: string, responseType: string, signal?: AbortSignal }) => Promise<unknown>} [args.request]
 * @param {() => void} [args.onDownloaded] Called after a successful download, before scan
 * @param {typeof scanImageForPlate} args.scan
 * @returns {Promise<
 *   | { status: 'download-failed' }
 *   | { status: 'scanned', hit: AnprPlateHit | null, detectionsTried: number }
 * >}
 */
async function downloadAndScanImage(args) {
  const {
    sessionPair,
    downloadUrl,
    galleryUrl,
    imageIndex,
    maxLongEdge,
    signal,
    request,
    onDownloaded,
    scan,
  } = args;

  let downloaded;
  try {
    downloaded = await downloadImage(downloadUrl, { signal, request });
  } catch (error) {
    if (signal?.aborted || error?.name === 'AbortError') {
      throw error;
    }
    return { status: 'download-failed' };
  }

  onDownloaded?.();

  let result;
  try {
    result = await scan(sessionPair, downloaded.bytes, {
      signal,
      maxLongEdge,
    });
  } finally {
    downloaded = null;
  }

  if (!result || !result.plate) {
    return {
      status: 'scanned',
      hit: null,
      detectionsTried: result?.detectionsTried ?? 0,
    };
  }

  return {
    status: 'scanned',
    hit: {
      plate: result.plate,
      plateFormatted: result.plateFormatted,
      meanConfidence: result.meanConfidence,
      imageIndex,
      imageUrl: galleryUrl,
    },
    detectionsTried: result.detectionsTried,
  };
}

/**
 * Two-pass gallery scan:
 * 1) All images at medium resolution (early-stop on ≥90% confidence).
 * 2) If none reached ≥90%, re-scan only low-confidence plate hits at high resolution.
 *
 * @param {string[]} urls
 * @param {object} [options]
 * @param {(msg: string) => void} [options.onStatus]
 * @param {AbortSignal} [options.signal]
 * @param {(opts: { method: string, url: string, responseType: string, signal?: AbortSignal }) => Promise<unknown>} [options.request]
 * @param {typeof scanImageForPlate} [options.scanImageForPlate] Test seam
 * @returns {Promise<AnprSuccess | AnprFailure>}
 */
export async function recognizeFirstPlateFromUrls(urls, options = {}) {
  const started = Date.now();
  const { onStatus, signal, request } = options;
  const scan = options.scanImageForPlate || scanImageForPlate;
  const total = urls.length;

  const ensured = await ensureAnprSessions({ onStatus, signal });
  const sessionPair = ensured.sessions;

  let detectionsTried = 0;
  let imagesScanned = 0;
  /** @type {AnprPlateHit[]} */
  const lowConfidenceHits = [];

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

    const galleryUrl = urls[i];
    const downloadUrl = toMediumAnprImageUrl(galleryUrl);
    onStatus?.(`Downloading image ${i + 1} of ${total}`);

    let scanned;
    try {
      scanned = await downloadAndScanImage({
        sessionPair,
        downloadUrl,
        galleryUrl,
        imageIndex: i + 1,
        maxLongEdge: ANPR_MEDIUM_LONG_EDGE,
        signal,
        request,
        scan,
        onDownloaded: () => {
          onStatus?.(`Scanning image ${i + 1} of ${total}`);
        },
      });
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

    if (scanned.status === 'download-failed') {
      onStatus?.(`Failed to download image ${i + 1} of ${total}, skipping…`);
      continue;
    }

    imagesScanned += 1;
    detectionsTried += scanned.detectionsTried;

    if (!scanned.hit) {
      continue;
    }

    if (isHighPlateConfidence(scanned.hit.meanConfidence)) {
      return successFromHit(
        scanned.hit,
        ensured.diagnostics,
        imagesScanned,
        detectionsTried,
        started,
        false,
      );
    }

    lowConfidenceHits.push(scanned.hit);
    onStatus?.(
      'Plate candidate below 90% confidence — scanning remaining images…',
    );
  }

  if (lowConfidenceHits.length === 0) {
    return fail(
      'no-reliable-plate',
      ensured.diagnostics,
      imagesScanned,
      detectionsTried,
      started,
    );
  }

  onStatus?.(
    `Re-scanning ${lowConfidenceHits.length} plate candidate(s) at high resolution…`,
  );

  /** @type {AnprPlateHit | null} */
  let bestBelowThreshold = null;
  for (const mediumHit of lowConfidenceHits) {
    bestBelowThreshold = preferPlateCandidate(bestBelowThreshold, mediumHit);

    if (signal?.aborted) {
      return fail(
        'cancelled',
        ensured.diagnostics,
        imagesScanned,
        detectionsTried,
        started,
      );
    }

    const galleryUrl = urls[mediumHit.imageIndex - 1] || mediumHit.imageUrl;
    const downloadUrl = toHighAnprImageUrl(galleryUrl);
    onStatus?.(
      `Downloading high-resolution candidate ${mediumHit.imageIndex} of ${total}`,
    );

    let scanned;
    try {
      scanned = await downloadAndScanImage({
        sessionPair,
        downloadUrl,
        galleryUrl,
        imageIndex: mediumHit.imageIndex,
        maxLongEdge: undefined,
        signal,
        request,
        scan,
      });
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
    }

    if (scanned.status === 'download-failed') {
      continue;
    }

    imagesScanned += 1;
    detectionsTried += scanned.detectionsTried;

    if (!scanned.hit) {
      continue;
    }

    if (isHighPlateConfidence(scanned.hit.meanConfidence)) {
      return successFromHit(
        scanned.hit,
        ensured.diagnostics,
        imagesScanned,
        detectionsTried,
        started,
        false,
      );
    }

    bestBelowThreshold = preferPlateCandidate(bestBelowThreshold, scanned.hit);
  }

  if (bestBelowThreshold) {
    return successFromHit(
      bestBelowThreshold,
      ensured.diagnostics,
      imagesScanned,
      detectionsTried,
      started,
      true,
    );
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
      request: async ({ url }) => {
        const match = images.find((image) => {
          return (
            image.url === url ||
            toMediumAnprImageUrl(image.url) === url ||
            toHighAnprImageUrl(image.url) === url
          );
        });
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
