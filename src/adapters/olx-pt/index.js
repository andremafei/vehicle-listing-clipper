import {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
} from './images.js';
import {
  FALLBACK_SWIPER_IMG_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  GALLERY_SELECTORS,
  PRIMARY_OLX_GALLERY_SELECTOR,
} from './selectors.js';

export const siteId = 'olx-pt';

export const olxPtAdapter = {
  siteId,
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  selectors: {
    PRIMARY_OLX_GALLERY_SELECTOR,
    FALLBACK_TESTID_SELECTOR,
    FALLBACK_SWIPER_IMG_SELECTOR,
    GALLERY_SELECTORS,
  },
};

export {
  discoverListingImages,
  discoverListingImagesWithWait,
  queryGalleryImages,
  PRIMARY_OLX_GALLERY_SELECTOR,
  FALLBACK_TESTID_SELECTOR,
  FALLBACK_SWIPER_IMG_SELECTOR,
  GALLERY_SELECTORS,
};
