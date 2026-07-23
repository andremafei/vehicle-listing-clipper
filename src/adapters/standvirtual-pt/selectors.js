/**
 * Standvirtual Portugal selectors (prefer stable data-testid / semantic classes).
 */

/** Next.js SSR payload with advert data. */
export const NEXT_DATA_SELECTOR = 'script#__NEXT_DATA__';

/** Offer title. */
export const OFFER_TITLE_SELECTOR =
  'h1.offer-title, [data-testid="summary-info-area"] h1';

/** Visible listing price. */
export const AD_PRICE_SELECTOR =
  '[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3';

/** Description section. */
export const DESCRIPTION_SELECTOR =
  '[data-testid="content-description-section"]';

/** Canonical link. */
export const CANONICAL_LINK_SELECTOR = 'link[rel="canonical"]';

/** Aside seller panel (preferred phone reveal location). */
export const ASIDE_SELLER_SELECTOR = '[data-testid="aside-seller-info"]';

/** Content seller contact box (secondary phone reveal). */
export const CONTENT_CONTACT_SELECTOR =
  '[data-testid="seller-info-contact-box"]';

/** Phone link after reveal. */
export const CONTACT_PHONE_SELECTOR =
  '[data-testid="aside-seller-info"] a[href^="tel:"], ' +
  '[data-testid="seller-info-contact-box"] a[href^="tel:"], ' +
  'a[href^="tel:"]';

/** Main gallery images. */
export const PRIMARY_GALLERY_SELECTOR =
  '[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img';

export const FALLBACK_GALLERY_SELECTOR =
  '[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]';

/** Ordered from most specific to least. */
export const GALLERY_SELECTORS = [
  PRIMARY_GALLERY_SELECTOR,
  FALLBACK_GALLERY_SELECTOR,
];

/** Detail parameter value: last paragraph under data-testid key. */
export function detailValueSelector(key) {
  return `[data-testid="${key}"] p:last-of-type`;
}
