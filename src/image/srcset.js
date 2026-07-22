/**
 * Parse HTML srcset and pick the candidate with the largest width descriptor.
 */

/**
 * @typedef {{ url: string, width: number | null }} SrcsetCandidate
 */

/**
 * @param {string} srcset
 * @returns {SrcsetCandidate[]}
 */
export function parseSrcset(srcset) {
  if (!srcset || typeof srcset !== 'string') {
    return [];
  }

  return srcset
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const pieces = part.split(/\s+/);
      const url = pieces[0];
      const descriptor = pieces[1];
      let width = null;
      if (descriptor && /^\d+w$/i.test(descriptor)) {
        width = Number.parseInt(descriptor, 10);
      }
      return { url, width };
    })
    .filter((c) => Boolean(c.url));
}

/**
 * Prefer the candidate with the largest `Nw` width. If none have widths, use the last URL.
 * @param {string} srcset
 * @returns {string | null}
 */
export function pickLargestSrcsetUrl(srcset) {
  const candidates = parseSrcset(srcset);
  if (candidates.length === 0) {
    return null;
  }

  const withWidth = candidates.filter((c) => typeof c.width === 'number');
  if (withWidth.length === 0) {
    return candidates[candidates.length - 1].url;
  }

  let best = withWidth[0];
  for (let i = 1; i < withWidth.length; i += 1) {
    if (withWidth[i].width > best.width) {
      best = withWidth[i];
    }
  }
  return best.url;
}

/**
 * Resolve the best image URL from an <img> element.
 * Order: largest srcset → currentSrc → src.
 * @param {HTMLImageElement} img
 * @returns {string | null}
 */
export function resolveBestImageUrl(img) {
  if (!img) {
    return null;
  }

  const fromSrcset = pickLargestSrcsetUrl(img.getAttribute('srcset') || '');
  if (fromSrcset) {
    return fromSrcset;
  }

  if (img.currentSrc) {
    return img.currentSrc;
  }

  const src = img.getAttribute('src') || img.src;
  return src || null;
}
