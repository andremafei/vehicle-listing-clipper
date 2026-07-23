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
  AD_PRICE_SELECTOR,
  ASIDE_SELLER_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  CONTACT_PHONE_SELECTOR,
  CONTENT_CONTACT_SELECTOR,
  DESCRIPTION_SELECTOR,
  FALLBACK_GALLERY_SELECTOR,
  GALLERY_SELECTORS,
  NEXT_DATA_SELECTOR,
  OFFER_TITLE_SELECTOR,
  PRIMARY_GALLERY_SELECTOR,
} from './selectors.js';

export const siteId = 'standvirtual-pt';

export const standvirtualPtAdapter = {
  siteId,
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  extractListing,
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
  selectors: {
    PRIMARY_GALLERY_SELECTOR,
    FALLBACK_GALLERY_SELECTOR,
    GALLERY_SELECTORS,
    CONTACT_PHONE_SELECTOR,
    ASIDE_SELLER_SELECTOR,
    CONTENT_CONTACT_SELECTOR,
    AD_PRICE_SELECTOR,
    CANONICAL_LINK_SELECTOR,
    OFFER_TITLE_SELECTOR,
    DESCRIPTION_SELECTOR,
    NEXT_DATA_SELECTOR,
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
  PRIMARY_GALLERY_SELECTOR,
  FALLBACK_GALLERY_SELECTOR,
  GALLERY_SELECTORS,
  CONTACT_PHONE_SELECTOR,
  ASIDE_SELLER_SELECTOR,
  CONTENT_CONTACT_SELECTOR,
  AD_PRICE_SELECTOR,
  CANONICAL_LINK_SELECTOR,
  OFFER_TITLE_SELECTOR,
  DESCRIPTION_SELECTOR,
  NEXT_DATA_SELECTOR,
};
