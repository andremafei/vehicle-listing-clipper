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

/** Structured listing parameters (`Label: value` paragraphs). */
export const AD_PARAMETERS_SELECTOR =
  '#mainContent [data-testid="ad-parameters-container"]';

/** Visible listing price. */
export const AD_PRICE_SELECTOR =
  '#mainContent [data-testid="ad-price-container"] h3';

/** SSR canonical link (preferred listing URL). */
export const CANONICAL_LINK_SELECTOR = 'link#ssr_canonical[rel="canonical"]';

/** Offer title. */
export const OFFER_TITLE_SELECTOR =
  '#mainContent [data-testid="offer_title"]';

/** Listing description (DOM preserves <br>; JSON-LD flattens to spaces). */
export const DESCRIPTION_SELECTOR =
  '#mainContent [data-testid="ad_description"]';

/** Advertiser / seller display name (CRM client name). */
export const USER_PROFILE_NAME_SELECTOR =
  '#mainContent [data-testid="user-profile-user-name"], ' +
  '[data-testid="seller_card"] [data-testid="user-profile-user-name"], ' +
  '[data-testid="user-profile-user-name"]';

/** Breadcrumb items (brand often appears as /carros/{brand}/). */
export const BREADCRUMB_ITEM_SELECTOR =
  '#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], ' +
  '#mainContent [data-testid="breadcrumbs"] a';

/** JSON-LD blocks (Vehicle). */
export const JSON_LD_SELECTOR = 'script[type="application/ld+json"]';
