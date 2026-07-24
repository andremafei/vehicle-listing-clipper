import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/anpr/model-cache.js', () => ({
  loadModelAsset: vi.fn(async () => ({ bytes: new ArrayBuffer(8), cacheHit: true })),
}));

vi.mock('../src/anpr/runtime.js', () => ({
  createInferenceSession: vi.fn(async () => ({
    session: { mocked: true },
    provider: 'test',
  })),
  getActiveProvider: vi.fn(() => 'test'),
}));

vi.mock('../src/anpr/model-manifest.js', () => ({
  getModelManifest: vi.fn(() => ({
    detector: { id: 'det' },
    ocr: { id: 'ocr' },
  })),
}));

import {
  recognizeFirstPlateFromUrls,
  resetAnprSessions,
} from '../src/anpr/pipeline.js';
import {
  ANPR_MEDIUM_LONG_EDGE,
  toHighAnprImageUrl,
  toMediumAnprImageUrl,
} from '../src/image/anpr-resolution.js';

describe('recognizeFirstPlateFromUrls two-pass resolution', () => {
  /** @type {string[]} */
  let downloadedUrls = [];
  /** @type {{ url: string, maxLongEdge: number | undefined }[]} */
  let scanCalls = [];

  beforeEach(() => {
    downloadedUrls = [];
    scanCalls = [];
    resetAnprSessions();
  });

  afterEach(() => {
    resetAnprSessions();
    vi.clearAllMocks();
  });

  const gallery = [
    'https://ireland.apollo.olxcdn.com/v1/files/a/image',
    'https://ireland.apollo.olxcdn.com/v1/files/b/image;s=1000x700',
    'https://ireland.apollo.olxcdn.com/v1/files/c/image',
  ];

  function request({ url }) {
    downloadedUrls.push(url);
    return new ArrayBuffer(4);
  }

  /**
   * @param {(ctx: { downloadUrl: string, maxLongEdge: number | undefined, callIndex: number }) => object | null} decide
   */
  function makeScan(decide) {
    let callIndex = 0;
    return async (_sessions, _bytes, options = {}) => {
      const downloadUrl = downloadedUrls[downloadedUrls.length - 1];
      const maxLongEdge = options.maxLongEdge;
      scanCalls.push({ url: downloadUrl, maxLongEdge });
      const result = decide({
        downloadUrl,
        maxLongEdge,
        callIndex: callIndex++,
      });
      if (!result) {
        return {
          plate: '',
          plateFormatted: '',
          meanConfidence: null,
          detectionsTried: 0,
        };
      }
      return {
        detectionsTried: 1,
        ...result,
      };
    };
  }

  it('early-stops on medium ≥90% and never downloads high-res', async () => {
    const result = await recognizeFirstPlateFromUrls(gallery, {
      request,
      scanImageForPlate: makeScan(({ callIndex }) => {
        if (callIndex === 0) {
          return null;
        }
        return {
          plate: 'AA00BB',
          plateFormatted: 'AA-00-BB',
          meanConfidence: 0.95,
        };
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.meanConfidence).toBe(0.95);
    expect(result.needsConfirmation).toBe(false);
    expect(result.imageIndex).toBe(2);
    expect(downloadedUrls).toEqual([
      toMediumAnprImageUrl(gallery[0]),
      toMediumAnprImageUrl(gallery[1]),
    ]);
    expect(scanCalls.every((c) => c.maxLongEdge === ANPR_MEDIUM_LONG_EDGE)).toBe(
      true,
    );
    expect(downloadedUrls.some((u) => u === toHighAnprImageUrl(gallery[1]))).toBe(
      false,
    );
  });

  it('skips high-res when medium finds no plates', async () => {
    const result = await recognizeFirstPlateFromUrls(gallery, {
      request,
      scanImageForPlate: makeScan(() => null),
    });

    expect(result.ok).toBe(false);
    if (result.ok) {
      return;
    }
    expect(result.reason).toBe('no-reliable-plate');
    expect(downloadedUrls).toEqual(gallery.map((u) => toMediumAnprImageUrl(u)));
    expect(downloadedUrls.some((u) => !u.includes(';s=1440x0'))).toBe(false);
  });

  it('retries high-res only for low-confidence plate hits', async () => {
    const result = await recognizeFirstPlateFromUrls(gallery, {
      request,
      scanImageForPlate: makeScan(({ downloadUrl, maxLongEdge }) => {
        // Medium: plate only on image b (index 2), low confidence
        if (maxLongEdge === ANPR_MEDIUM_LONG_EDGE) {
          if (downloadUrl.includes('/b/')) {
            return {
              plate: 'AA00BB',
              plateFormatted: 'AA-00-BB',
              meanConfidence: 0.7,
            };
          }
          return null;
        }
        // High-res retry for b
        if (downloadUrl === toHighAnprImageUrl(gallery[1])) {
          return {
            plate: 'AA00BB',
            plateFormatted: 'AA-00-BB',
            meanConfidence: 0.96,
          };
        }
        return null;
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.needsConfirmation).toBe(false);
    expect(result.meanConfidence).toBe(0.96);
    expect(result.imageIndex).toBe(2);

    expect(downloadedUrls).toEqual([
      toMediumAnprImageUrl(gallery[0]),
      toMediumAnprImageUrl(gallery[1]),
      toMediumAnprImageUrl(gallery[2]),
      toHighAnprImageUrl(gallery[1]),
    ]);
  });

  it('returns needsConfirmation when high-res stays below 90%', async () => {
    const result = await recognizeFirstPlateFromUrls(gallery, {
      request,
      scanImageForPlate: makeScan(({ downloadUrl, maxLongEdge }) => {
        if (maxLongEdge === ANPR_MEDIUM_LONG_EDGE && downloadUrl.includes('/a/')) {
          return {
            plate: 'AA00BB',
            plateFormatted: 'AA-00-BB',
            meanConfidence: 0.6,
          };
        }
        if (maxLongEdge === ANPR_MEDIUM_LONG_EDGE && downloadUrl.includes('/c/')) {
          return {
            plate: 'CC11DD',
            plateFormatted: 'CC-11-DD',
            meanConfidence: 0.75,
          };
        }
        if (downloadUrl === toHighAnprImageUrl(gallery[0])) {
          return {
            plate: 'AA00BB',
            plateFormatted: 'AA-00-BB',
            meanConfidence: 0.65,
          };
        }
        if (downloadUrl === toHighAnprImageUrl(gallery[2])) {
          return {
            plate: 'CC11DD',
            plateFormatted: 'CC-11-DD',
            meanConfidence: 0.8,
          };
        }
        return null;
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.needsConfirmation).toBe(true);
    expect(result.plate).toBe('CC11DD');
    expect(result.meanConfidence).toBe(0.8);
    expect(result.imageIndex).toBe(3);

    // Medium all three, then high only for a and c (not b — no plate)
    expect(downloadedUrls).toEqual([
      toMediumAnprImageUrl(gallery[0]),
      toMediumAnprImageUrl(gallery[1]),
      toMediumAnprImageUrl(gallery[2]),
      toHighAnprImageUrl(gallery[0]),
      toHighAnprImageUrl(gallery[2]),
    ]);
  });

  it('passes medium long-edge cap on pass 1 and none on pass 2', async () => {
    await recognizeFirstPlateFromUrls([gallery[0]], {
      request,
      scanImageForPlate: makeScan(({ maxLongEdge }) => {
        if (maxLongEdge === ANPR_MEDIUM_LONG_EDGE) {
          return {
            plate: 'AA00BB',
            plateFormatted: 'AA-00-BB',
            meanConfidence: 0.5,
          };
        }
        return {
          plate: 'AA00BB',
          plateFormatted: 'AA-00-BB',
          meanConfidence: 0.55,
        };
      }),
    });

    expect(scanCalls[0].maxLongEdge).toBe(ANPR_MEDIUM_LONG_EDGE);
    expect(scanCalls[1].maxLongEdge).toBeUndefined();
  });
});
