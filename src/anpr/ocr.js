import { OCR_PLATE_CONFIG } from './model-manifest.js';
import { resizeCropToOcrUint8 } from '../image/crop.js';
import { ort } from './runtime.js';

/**
 * @typedef {{ text: string, charProbs: number[] }} OcrResult
 */

/**
 * Decode plate head logits.
 * @param {Float32Array|ArrayLike<number>} logits
 * @param {number[]} dims
 * @param {typeof OCR_PLATE_CONFIG} [config]
 * @returns {OcrResult}
 */
export function decodeOcrOutput(logits, dims, config = OCR_PLATE_CONFIG) {
  const alphabet = config.alphabet;
  const slots = config.maxPlateSlots;
  const vocab = alphabet.length;
  const data = logits;

  const chars = [];
  const charProbs = [];
  for (let s = 0; s < slots; s += 1) {
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let v = 0; v < vocab; v += 1) {
      const val = Number(data[s * vocab + v]);
      if (val > bestVal) {
        bestVal = val;
        bestIdx = v;
      }
    }
    chars.push(alphabet[bestIdx]);
    charProbs.push(bestVal);
  }

  let text = chars.join('');
  if (config.padChar) {
    text = text.replace(new RegExp(`${escapeRegExp(config.padChar)}+$`), '');
  }

  return { text, charProbs: charProbs.slice(0, Math.max(text.length, 1)) };
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @param {import('onnxruntime-web').InferenceSession} session
 * @param {ImageData} crop
 * @returns {Promise<OcrResult>}
 */
export async function recognizePlate(session, crop) {
  const { imgHeight, imgWidth } = OCR_PLATE_CONFIG;
  const uint8 = resizeCropToOcrUint8(crop, imgHeight, imgWidth);
  const input = new ort.Tensor('uint8', uint8, [1, imgHeight, imgWidth, 3]);
  const outputs = await session.run({ input });
  const plateOut = outputs.plate || Object.values(outputs)[0];
  const dims =
    plateOut.dims ||
    [1, OCR_PLATE_CONFIG.maxPlateSlots, OCR_PLATE_CONFIG.alphabet.length];
  const vocab = dims[dims.length - 1];
  const slots = dims[dims.length - 2];
  const slotStride = slots * vocab;
  const flat = plateOut.data;
  const slice = flat.length >= slotStride ? flat.slice(0, slotStride) : flat;
  return decodeOcrOutput(slice, [1, slots, vocab]);
}
