import { letterboxToNchwFloat, restoreBox } from '../image/resize.js';
import { ort } from './runtime.js';

const INPUT_SIZE = 384;
const INPUT_NAME = 'images';
const OUTPUT_NAME = 'output0';

/**
 * @typedef {{ x1: number, y1: number, x2: number, y2: number, score: number, classId: number }} PlateBox
 */

/**
 * Run plate detector on RGBA ImageData.
 * @param {import('onnxruntime-web').InferenceSession} session
 * @param {ImageData} imageData
 * @param {object} [options]
 * @param {number} [options.confThresh]
 * @returns {Promise<PlateBox[]>}
 */
export async function detectPlates(session, imageData, options = {}) {
  const confThresh = options.confThresh ?? 0.4;
  const { tensor, ratio, pad } = letterboxToNchwFloat(imageData, INPUT_SIZE);
  const input = new ort.Tensor('float32', tensor, [
    1,
    3,
    INPUT_SIZE,
    INPUT_SIZE,
  ]);
  const outputs = await session.run({ [INPUT_NAME]: input });
  const output = outputs[OUTPUT_NAME] || Object.values(outputs)[0];
  if (!output) {
    return [];
  }

  const data = output.data;
  const dims = output.dims || [];
  const stride = dims.length >= 2 ? dims[dims.length - 1] : 7;
  const rows = Math.floor(data.length / stride);
  /** @type {PlateBox[]} */
  const boxes = [];

  for (let i = 0; i < rows; i += 1) {
    const off = i * stride;
    const x1 = data[off + 1];
    const y1 = data[off + 2];
    const x2 = data[off + 3];
    const y2 = data[off + 4];
    const classId = data[off + 5];
    const score = data[off + 6];
    if (score < confThresh) {
      continue;
    }
    const restored = restoreBox({ x1, y1, x2, y2 }, ratio, pad);
    boxes.push({
      ...restored,
      score: Number(score),
      classId: Number(classId),
    });
  }

  boxes.sort((a, b) => b.score - a.score);
  return boxes;
}

export { INPUT_SIZE, INPUT_NAME, OUTPUT_NAME, restoreBox };
