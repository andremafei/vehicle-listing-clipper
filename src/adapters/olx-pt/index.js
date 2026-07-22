import {
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
} from './contact.js';
import {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
} from './images.js';
import {
  CONTACT_PHONE_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  GALLERY_SELECTORS,
  PHONE_REVEAL_BUTTON_SELECTOR,
  PRIMARY_OLX_GALLERY_SELECTOR,
} from './selectors.js';

export const siteId = 'olx-pt';

export const olxPtAdapter = {
  siteId,
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
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
  },
};

export {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  findPhoneRevealButton,
  readRevealedPhone,
  revealContactPhone,
  PRIMARY_OLX_GALLERY_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
  GALLERY_SELECTORS,
  PHONE_REVEAL_BUTTON_SELECTOR,
  CONTACT_PHONE_SELECTOR,
};
