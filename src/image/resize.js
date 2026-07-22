/**
 * Letterbox resize matching open-image-models YOLOv9 preprocess.
 */

/**
 * @param {ImageData} imageData RGBA
 * @param {number} newSize square target (e.g. 384)
 * @param {[number, number, number]} [color] RGB pad
 * @returns {{
 *   tensor: Float32Array,
 *   ratio: number,
 *   pad: { dw: number, dh: number },
 *   size: number,
 * }}
 */
export function letterboxToNchwFloat(imageData, newSize, color = [114, 114, 114]) {
  const { width: origW, height: origH } = imageData;
  const r = Math.min(newSize / origH, newSize / origW);
  const newUnpadW = Math.round(origW * r);
  const newUnpadH = Math.round(origH * r);
  const dw = (newSize - newUnpadW) / 2;
  const dh = (newSize - newUnpadH) / 2;
  const top = Math.round(dh - 0.1);
  const left = Math.round(dw - 0.1);

  const srcCanvas = document.createElement('canvas');
  srcCanvas.width = origW;
  srcCanvas.height = origH;
  const sctx = srcCanvas.getContext('2d');
  sctx.putImageData(imageData, 0, 0);

  const dst = document.createElement('canvas');
  dst.width = newSize;
  dst.height = newSize;
  const dctx = dst.getContext('2d');
  dctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
  dctx.fillRect(0, 0, newSize, newSize);
  dctx.drawImage(srcCanvas, 0, 0, origW, origH, left, top, newUnpadW, newUnpadH);

  const out = dctx.getImageData(0, 0, newSize, newSize).data;
  // NCHW RGB float [0,1]
  const tensor = new Float32Array(1 * 3 * newSize * newSize);
  const plane = newSize * newSize;
  for (let i = 0; i < plane; i += 1) {
    const r8 = out[i * 4];
    const g8 = out[i * 4 + 1];
    const b8 = out[i * 4 + 2];
    tensor[i] = r8 / 255;
    tensor[plane + i] = g8 / 255;
    tensor[2 * plane + i] = b8 / 255;
  }

  return {
    tensor,
    ratio: r,
    pad: { dw, dh },
    size: newSize,
  };
}

/**
 * Restore detector box from letterboxed coords to original image coords.
 * @param {{ x1: number, y1: number, x2: number, y2: number }} box
 * @param {number} ratio
 * @param {{ dw: number, dh: number }} pad
 */
export function restoreBox(box, ratio, pad) {
  return {
    x1: (box.x1 - pad.dw) / ratio,
    y1: (box.y1 - pad.dh) / ratio,
    x2: (box.x2 - pad.dw) / ratio,
    y2: (box.y2 - pad.dh) / ratio,
  };
}
