import { describe, expect, it } from 'vitest';
import { decodeOcrOutput } from '../src/anpr/ocr.js';
import { OCR_PLATE_CONFIG } from '../src/anpr/model-manifest.js';
import { restoreBox } from '../src/image/resize.js';

describe('OCR decode', () => {
  it('decodes argmax slots and strips pad chars', () => {
    const vocab = OCR_PLATE_CONFIG.alphabet.length;
    const slots = OCR_PLATE_CONFIG.maxPlateSlots;
    const logits = new Float32Array(slots * vocab);
    const text = '06TM95____';
    for (let s = 0; s < slots; s += 1) {
      const ch = text[s];
      const idx = OCR_PLATE_CONFIG.alphabet.indexOf(ch);
      logits[s * vocab + idx] = 0.99;
    }
    const decoded = decodeOcrOutput(logits, [1, slots, vocab]);
    expect(decoded.text).toBe('06TM95');
    expect(decoded.charProbs[0]).toBeCloseTo(0.99);
  });
});

describe('detector coordinate restore', () => {
  it('maps letterboxed boxes back to original coords', () => {
    const restored = restoreBox(
      { x1: 100, y1: 50, x2: 200, y2: 100 },
      0.5,
      { dw: 20, dh: 10 },
    );
    expect(restored.x1).toBeCloseTo((100 - 20) / 0.5);
    expect(restored.y1).toBeCloseTo((50 - 10) / 0.5);
    expect(restored.x2).toBeCloseTo((200 - 20) / 0.5);
    expect(restored.y2).toBeCloseTo((100 - 10) / 0.5);
  });
});
