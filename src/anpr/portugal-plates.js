/**
 * Portuguese plate formats and OCR ambiguity handling.
 *
 * Patterns (no separators): LLDDDD, DDDDLL, DDLLDD, LLDDLL
 */

const LETTER = '[A-Z]';
const DIGIT = '[0-9]';

/** @type {{ id: string, re: RegExp }[]} */
export const PLATE_PATTERNS = [
  { id: 'LLDDDD', re: new RegExp(`^${LETTER}{2}${DIGIT}{4}$`) },
  { id: 'DDDDLL', re: new RegExp(`^${DIGIT}{4}${LETTER}{2}$`) },
  { id: 'DDLLDD', re: new RegExp(`^${DIGIT}{2}${LETTER}{2}${DIGIT}{2}$`) },
  { id: 'LLDDLL', re: new RegExp(`^${LETTER}{2}${DIGIT}{2}${LETTER}{2}$`) },
];

const LETTER_FIX = { '0': 'O', '1': 'I', '5': 'S', '8': 'B' };
const DIGIT_FIX = { O: '0', I: '1', L: '1', S: '5', B: '8' };

/**
 * @param {string} raw
 * @returns {string}
 */
export function normalizePlateRaw(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/**
 * @param {string} plate 6 chars without separators
 * @returns {string}
 */
export function formatPlate(plate) {
  const p = normalizePlateRaw(plate);
  if (p.length !== 6) {
    return p;
  }
  return `${p.slice(0, 2)}-${p.slice(2, 4)}-${p.slice(4, 6)}`;
}

/**
 * @param {string} plate
 * @returns {string | null}
 */
export function matchPatternId(plate) {
  const p = normalizePlateRaw(plate);
  if (p.length !== 6) {
    return null;
  }
  for (const pattern of PLATE_PATTERNS) {
    if (pattern.re.test(p)) {
      return pattern.id;
    }
  }
  return null;
}

/**
 * Generate plates reachable with at most `maxCorrections` ambiguity fixes.
 * @param {string} base 6-char normalized OCR
 * @param {number} maxCorrections
 * @returns {{ plate: string, corrections: number, patternId: string }[]}
 */
export function enumerateCorrectedPlates(base, maxCorrections) {
  const chars = normalizePlateRaw(base).slice(0, 6).split('');
  if (chars.length !== 6) {
    return [];
  }

  /** @type {{ plate: string, corrections: number, patternId: string }[]} */
  const results = [];

  function walk(index, corrections, current) {
    if (corrections > maxCorrections) {
      return;
    }
    if (index === 6) {
      const plate = current.join('');
      const patternId = matchPatternId(plate);
      if (patternId) {
        results.push({ plate, corrections, patternId });
      }
      return;
    }

    walk(index + 1, corrections, current);

    if (corrections >= maxCorrections) {
      return;
    }

    const ch = current[index];
    const letterAlt = LETTER_FIX[ch];
    if (letterAlt) {
      const next = current.slice();
      next[index] = letterAlt;
      walk(index + 1, corrections + 1, next);
    }
    const digitAlt = DIGIT_FIX[ch];
    if (digitAlt) {
      const next = current.slice();
      next[index] = digitAlt;
      walk(index + 1, corrections + 1, next);
    }
  }

  walk(0, 0, chars);
  results.sort((a, b) => a.corrections - b.corrections || b.plate.localeCompare(a.plate));
  return results;
}

/**
 * @param {number[]} charProbs
 * @param {number} length
 */
function meanConfidence(charProbs, length) {
  if (!charProbs?.length) {
    return 1;
  }
  const n = Math.min(length, charProbs.length);
  if (n === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    sum += charProbs[i] ?? 0;
  }
  return sum / n;
}

/**
 * Format mean OCR confidence as an integer percent for UI (0–100), or null.
 * @param {unknown} meanConfidence
 * @returns {number | null}
 */
export function formatPlateConfidencePercent(meanConfidence) {
  if (typeof meanConfidence !== 'number' || !Number.isFinite(meanConfidence)) {
    return null;
  }
  const ratio = meanConfidence > 1 ? meanConfidence / 100 : meanConfidence;
  const pct = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return pct;
}

/** Minimum mean OCR confidence to accept a plate without user confirmation. */
export const PLATE_HIGH_CONFIDENCE = 0.9;

/**
 * @param {unknown} meanConfidence
 * @returns {boolean}
 */
export function isHighPlateConfidence(meanConfidence) {
  return (
    typeof meanConfidence === 'number' &&
    Number.isFinite(meanConfidence) &&
    meanConfidence >= PLATE_HIGH_CONFIDENCE
  );
}

/**
 * Keep the stronger of two below-threshold plate hits (higher confidence wins).
 * @param {{
 *   plate: string,
 *   plateFormatted: string,
 *   meanConfidence: number | null,
 *   imageIndex: number,
 *   imageUrl: string,
 * } | null} current
 * @param {{
 *   plate: string,
 *   plateFormatted: string,
 *   meanConfidence: number | null,
 *   imageIndex: number,
 *   imageUrl: string,
 * }} candidate
 */
export function preferPlateCandidate(current, candidate) {
  if (!current) {
    return candidate;
  }
  const currentConf =
    typeof current.meanConfidence === 'number' &&
    Number.isFinite(current.meanConfidence)
      ? current.meanConfidence
      : -1;
  const nextConf =
    typeof candidate.meanConfidence === 'number' &&
    Number.isFinite(candidate.meanConfidence)
      ? candidate.meanConfidence
      : -1;
  return nextConf > currentConf ? candidate : current;
}

/**
 * Validate OCR text as a Portuguese plate.
 * Rules: prefer 0 corrections; allow at most 1; require confidence; reject regex-only weak hits.
 *
 * @param {string} rawOcr
 * @param {number[]} [charProbs]
 * @param {object} [options]
 * @param {number} [options.minConfidenceNoCorrection]
 * @param {number} [options.minConfidenceOneCorrection]
 */
export function validatePortuguesePlate(rawOcr, charProbs = [], options = {}) {
  const minNo = options.minConfidenceNoCorrection ?? 0.55;
  const minOne = options.minConfidenceOneCorrection ?? 0.72;
  const normalized = normalizePlateRaw(rawOcr);

  if (normalized.length < 6) {
    return {
      accepted: false,
      plate: normalized,
      plateFormatted: formatPlate(normalized),
      patternId: null,
      corrections: 0,
      meanConfidence: meanConfidence(charProbs, normalized.length),
      reason: 'too-short',
    };
  }

  const base = normalized.slice(0, 6);
  const conf = meanConfidence(charProbs, 6);

  const zero = enumerateCorrectedPlates(base, 0);
  if (zero.length > 0 && conf >= minNo) {
    const hit = zero[0];
    return {
      accepted: true,
      plate: hit.plate,
      plateFormatted: formatPlate(hit.plate),
      patternId: hit.patternId,
      corrections: 0,
      meanConfidence: conf,
    };
  }

  const one = enumerateCorrectedPlates(base, 1).filter((x) => x.corrections === 1);
  if (one.length > 0 && conf >= minOne) {
    const hit = one[0];
    return {
      accepted: true,
      plate: hit.plate,
      plateFormatted: formatPlate(hit.plate),
      patternId: hit.patternId,
      corrections: 1,
      meanConfidence: conf,
    };
  }

  const needsMany = enumerateCorrectedPlates(base, 2).some((x) => x.corrections > 1);
  if (needsMany && zero.length === 0 && one.length === 0) {
    return {
      accepted: false,
      plate: base,
      plateFormatted: formatPlate(base),
      patternId: null,
      corrections: 2,
      meanConfidence: conf,
      reason: 'excessive-corrections',
    };
  }

  if (zero.length > 0 || one.length > 0) {
    return {
      accepted: false,
      plate: base,
      plateFormatted: formatPlate(base),
      patternId: null,
      corrections: zero.length ? 0 : 1,
      meanConfidence: conf,
      reason: 'low-confidence',
    };
  }

  return {
    accepted: false,
    plate: base,
    plateFormatted: formatPlate(base),
    patternId: null,
    corrections: 0,
    meanConfidence: conf,
    reason: 'no-reliable-pattern',
  };
}
