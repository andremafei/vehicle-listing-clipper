/**
 * Decode downloaded image bytes into ImageBitmap / canvas pixels.
 */

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
 * @param {ImageBitmap} bitmap
 * @returns {{ canvas: HTMLCanvasElement, imageData: ImageData, width: number, height: number }}
 */
export function bitmapToImageData(bitmap) {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { canvas, imageData, width: canvas.width, height: canvas.height };
}
