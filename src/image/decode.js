/**
 * Decode downloaded image bytes into ImageBitmap / canvas pixels.
 */

/**
 * Compute draw size for decode, optionally capping the long edge.
 * @param {number} width
 * @param {number} height
 * @param {number} [maxLongEdge]
 * @returns {{ width: number, height: number }}
 */
export function resolveDecodeSize(width, height, maxLongEdge) {
  let outW = width;
  let outH = height;

  if (
    typeof maxLongEdge === 'number' &&
    Number.isFinite(maxLongEdge) &&
    maxLongEdge > 0
  ) {
    const longEdge = Math.max(outW, outH);
    if (longEdge > maxLongEdge) {
      const scale = maxLongEdge / longEdge;
      outW = Math.max(1, Math.round(outW * scale));
      outH = Math.max(1, Math.round(outH * scale));
    }
  }

  return { width: outW, height: outH };
}

/**
 * @param {ArrayBuffer} bytes
 * @param {string} [mimeHint]
 * @returns {Promise<ImageBitmap>}
 */
export async function decodeImageBytes(bytes, mimeHint = '') {
  const types = mimeHint
    ? [mimeHint]
    : ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

  let lastError = null;
  for (const type of types) {
    try {
      const blob = new Blob([bytes], { type });
      return await createImageBitmap(blob);
    } catch (error) {
      lastError = error;
    }
  }

  try {
    const blob = new Blob([bytes]);
    return await createImageBitmap(blob);
  } catch (error) {
    throw lastError || error;
  }
}

/**
 * Draw ImageBitmap to a canvas and return ImageData (RGBA).
 * Optionally downscale so the long edge is at most `maxLongEdge`.
 * @param {ImageBitmap} bitmap
 * @param {object} [options]
 * @param {number} [options.maxLongEdge] When set and smaller than the bitmap long edge, downscale uniformly
 * @returns {{ canvas: HTMLCanvasElement, imageData: ImageData, width: number, height: number }}
 */
export function bitmapToImageData(bitmap, options = {}) {
  const { maxLongEdge } = options;
  const { width, height } = resolveDecodeSize(
    bitmap.width,
    bitmap.height,
    maxLongEdge,
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return { canvas, imageData, width, height };
}
