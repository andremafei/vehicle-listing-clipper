/**
 * OLX Portugal gallery selectors (DOM only — no generated class names).
 */

export const PRIMARY_OLX_GALLERY_SELECTOR =
  '#mainContent div.swiper-wrapper > div.swiper-slide ' +
  'div.swiper-zoom-container > img';

export const FALLBACK_TESTID_SELECTOR =
  '#mainContent img[data-testid="swiper-image-lazy"]';

export const FALLBACK_SWIPER_IMG_SELECTOR =
  '#mainContent div.swiper-wrapper img';

/** Ordered from most specific to least. */
export const GALLERY_SELECTORS = [
  PRIMARY_OLX_GALLERY_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
];
