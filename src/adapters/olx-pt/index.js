import {
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
} from './contact.js';
import { extractListing } from './extract.js';
import {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
} from './images.js';
import {
  AD_PARAMETERS_SELECTOR,
  AD_PRICE_SELECTOR,
  BREADCRUMB_ITEM_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  CONTACT_PHONE_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  GALLERY_SELECTORS,
  JSON_LD_SELECTOR,
  OFFER_TITLE_SELECTOR,
  PHONE_REVEAL_BUTTON_SELECTOR,
  PRIMARY_OLX_GALLERY_SELECTOR,
} from './selectors.js';

export const siteId = 'olx-pt';

export const olxPtAdapter = {
  siteId,
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  extractListing,
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
  selectors: {
    PRIMARY_OLX_GALLERY_SELECTOR,
    FALLBACK_TESTID_SELECTOR,
    FALLBACK_SWIPER_IMG_SELECTOR,
    GALLERY_SELECTORS,
    PHONE_REVEAL_BUTTON_SELECTOR,
    CONTACT_PHONE_SELECTOR,
    AD_PARAMETERS_SELECTOR,
    AD_PRICE_SELECTOR,
    CANONICAL_LINK_SELECTOR,
    OFFER_TITLE_SELECTOR,
    BREADCRUMB_ITEM_SELECTOR,
    JSON_LD_SELECTOR,
  },
};

export {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  extractListing,
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
  PRIMARY_OLX_GALLERY_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
  GALLERY_SELECTORS,
  PHONE_REVEAL_BUTTON_SELECTOR,
  CONTACT_PHONE_SELECTOR,
  AD_PARAMETERS_SELECTOR,
  AD_PRICE_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  OFFER_TITLE_SELECTOR,
  BREADCRUMB_ITEM_SELECTOR,
  JSON_LD_SELECTOR,
};
