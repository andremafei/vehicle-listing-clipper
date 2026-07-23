import { resolveBestImageUrl } from '../../image/srcset.js';
import { readAdvertFromNextData } from './extract.js';
import { GALLERY_SELECTORS } from './selectors.js';

/**
 * @typedef {{ urls: string[], count: number, selectorUsed: string | null }} DiscoverResult
 */

/**
 * Absolutize relative URLs without rewriting already-absolute URLs.
 * @param {string} raw
 * @param {string} [baseHref]
 * @returns {string}
 */
export function toAbsoluteImageUrl(raw, baseHref) {
  if (!raw) {
    return raw;
  }
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return raw;
  }
  const base =
    baseHref ||
    (typeof location !== 'undefined' && location.href
      ? location.href
      : undefined);
  if (!base) {
    return raw;
  }
  try {
    return new URL(raw, base).href;
  } catch {
    return raw;
  }
}

/**
 * Image URLs from `__NEXT_DATA__` advert.images.photos.
 * @param {ParentNode} [root]
 * @returns {DiscoverResult | null}
 */
export function discoverImagesFromNextData(root = document) {
  const advert = readAdvertFromNextData(root);
  const photos = advert?.images?.photos;
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }
  const urls = [];
  const seen = new Set();
  for (const photo of photos) {
    const raw = photo?.url || photo?.src || '';
    if (!raw) {
      continue;
    }
    const url = toAbsoluteImageUrl(String(raw));
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);
    urls.push(url);
  }
  if (urls.length === 0) {
    return null;
  }
  return {
    urls,
    count: urls.length,
    selectorUsed: 'next-data:images.photos',
  };
}

/**
 * Query gallery images using primary then fallback selectors.
 * @param {ParentNode} root
 * @returns {{ images: HTMLImageElement[], selectorUsed: string | null }}
 */
export function queryGalleryImages(root = document) {
  for (const selector of GALLERY_SELECTORS) {
    const nodes = root.querySelectorAll(selector);
    if (nodes.length > 0) {
      return {
        images: [...nodes],
        selectorUsed: selector,
      };
    }
  }
  return { images: [], selectorUsed: null };
}

/**
 * Discover listing image URLs — prefer `__NEXT_DATA__`, then DOM gallery.
 * @param {ParentNode} [root]
 * @returns {DiscoverResult}
 */
export function discoverListingImages(root = document) {
  const fromNext = discoverImagesFromNextData(root);
  if (fromNext) {
    return fromNext;
  }

  const { images, selectorUsed } = queryGalleryImages(root);
  const urls = [];
  const seen = new Set();

  for (const img of images) {
    const raw = resolveBestImageUrl(img);
    if (!raw) {
      continue;
    }
    const url = toAbsoluteImageUrl(raw);
    if (seen.has(url)) {
      continue;
    }
    seen.add(url);
    urls.push(url);
  }

  return {
    urls,
    count: urls.length,
    selectorUsed,
  };
}

/**
 * Poll until gallery images appear or timeout.
 * @param {object} [options]
 * @param {ParentNode} [options.root]
 * @param {number} [options.timeoutMs]
 * @param {number} [options.intervalMs]
 * @returns {Promise<DiscoverResult>}
 */
export async function discoverListingImagesWithWait(options = {}) {
  const {
    root = document,
    timeoutMs = 2000,
    intervalMs = 100,
  } = options;

  let last = discoverListingImages(root);
  if (last.count > 0) {
    return last;
  }

  const hasGalleryShell = Boolean(
    root.querySelector('[data-testid="main-gallery"]') ||
      root.querySelector('[data-testid^="gallery-image-"]'),
  );

  if (!hasGalleryShell) {
    return last;
  }

  const deadline = Date.now() + timeoutMs;
  while (last.count === 0 && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    last = discoverListingImages(root);
  }

  return last;
}
