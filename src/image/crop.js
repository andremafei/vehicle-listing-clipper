/**
 * Crop a region from ImageData (RGBA) into a new ImageData.
 * @param {ImageData} imageData
 * @param {{ x1: number, y1: number, x2: number, y2: number }} box
 * @returns {ImageData}
 */
export function cropImageData(imageData, box) {
  const x1 = Math.max(0, Math.floor(Math.min(box.x1, box.x2)));
  const y1 = Math.max(0, Math.floor(Math.min(box.y1, box.y2)));
  const x2 = Math.min(imageData.width, Math.ceil(Math.max(box.x1, box.x2)));
  const y2 = Math.min(imageData.height, Math.ceil(Math.max(box.y1, box.y2)));
  const w = Math.max(1, x2 - x1);
  const h = Math.max(1, y2 - y1);

  const canvas = document.createElement('canvas');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  const ctx = canvas.getContext('2d');
  ctx.putImageData(imageData, 0, 0);
  return ctx.getImageData(x1, y1, w, h);
}

/**
 * Resize crop to OCR input size as uint8 NHWC RGB.
 * @param {ImageData} crop
 * @param {number} height
 * @param {number} width
 * @returns {Uint8Array} shape [1, H, W, 3] flattened
 */
export function resizeCropToOcrUint8(crop, height, width) {
  const src = document.createElement('canvas');
  src.width = crop.width;
  src.height = crop.height;
  src.getContext('2d').putImageData(crop, 0, 0);

  const dst = document.createElement('canvas');
  dst.width = width;
  dst.height = height;
  const dctx = dst.getContext('2d');
  dctx.drawImage(src, 0, 0, width, height);
  const { data } = dctx.getImageData(0, 0, width, height);

  const out = new Uint8Array(1 * height * width * 3);
  let o = 0;
  for (let i = 0; i < height * width; i += 1) {
    out[o++] = data[i * 4];
    out[o++] = data[i * 4 + 1];
    out[o++] = data[i * 4 + 2];
  }
  return out;
}
