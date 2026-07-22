/**
 * OLX Portugal selectors (DOM only — prefer stable data-* over generated classes).
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

/** "Ver número" / contact phone reveal control. */
export const PHONE_REVEAL_BUTTON_SELECTOR =
  '#mainContent button[data-testid="ad-contact-phone"]';

/** Phone link that appears after reveal (or when already visible). */
export const CONTACT_PHONE_SELECTOR =
  '#mainContent a[data-testid="contact-phone"][href^="tel:"]';
