import { describe, expect, it } from 'vitest';
import {
  formatPlate,
  formatPlateConfidencePercent,
  isHighPlateConfidence,
  matchPatternId,
  normalizePlateRaw,
  preferPlateCandidate,
  validatePortuguesePlate,
} from '../src/anpr/portugal-plates.js';

describe('portuguese plates', () => {
  it('supports all four formats and strips hyphens', () => {
    expect(normalizePlateRaw('06-TM-95')).toBe('06TM95');
    expect(matchPatternId('06TM95')).toBe('DDLLDD');
    expect(matchPatternId('AB12CD')).toBe('LLDDLL');
    expect(matchPatternId('AB1234')).toBe('LLDDDD');
    expect(matchPatternId('1234AB')).toBe('DDDDLL');
    expect(formatPlate('06TM95')).toBe('06-TM-95');
  });

  it('accepts zero-correction high-confidence plates', () => {
    const result = validatePortuguesePlate('06TM95', [0.9, 0.9, 0.9, 0.9, 0.9, 0.9]);
    expect(result.accepted).toBe(true);
    expect(result.plate).toBe('06TM95');
    expect(result.corrections).toBe(0);
    expect(result.meanConfidence).toBeCloseTo(0.9);
  });

  it('applies a single ambiguity correction when confident', () => {
    // O in digit slot → 0 with one correction: O6TM95
    const result = validatePortuguesePlate('O6TM95', [0.8, 0.8, 0.8, 0.8, 0.8, 0.8]);
    expect(result.accepted).toBe(true);
    expect(result.plate).toBe('06TM95');
    expect(result.corrections).toBe(1);
  });

  it('rejects low-confidence corrected plates', () => {
    const result = validatePortuguesePlate('O6TM95', [0.2, 0.2, 0.2, 0.2, 0.2, 0.2]);
    expect(result.accepted).toBe(false);
    expect(result.reason).toBe('low-confidence');
  });

  it('rejects when more than one correction would be required', () => {
    // Two digit/letter swaps needed for a valid layout from gibberish letters in digit slots
    const result = validatePortuguesePlate('OOTMSS', [0.9, 0.9, 0.9, 0.9, 0.9, 0.9]);
    expect(result.accepted).toBe(false);
  });

  it('formats and thresholds plate confidence for confirmation', () => {
    expect(formatPlateConfidencePercent(0.874)).toBe(87);
    expect(isHighPlateConfidence(0.9)).toBe(true);
    expect(isHighPlateConfidence(0.899)).toBe(false);
    const weaker = {
      plate: 'AA00BB',
      plateFormatted: 'AA-00-BB',
      meanConfidence: 0.7,
      imageIndex: 1,
      imageUrl: 'a',
    };
    const stronger = { ...weaker, meanConfidence: 0.85, imageIndex: 2, imageUrl: 'b' };
    expect(preferPlateCandidate(weaker, stronger)).toEqual(stronger);
    expect(preferPlateCandidate(stronger, weaker)).toEqual(stronger);
  });
});
