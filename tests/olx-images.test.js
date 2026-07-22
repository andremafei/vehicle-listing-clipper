import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PRIMARY_OLX_GALLERY_SELECTOR,
  discoverListingImages,
  discoverListingImagesWithWait,
} from '../src/adapters/olx-pt/index.js';

function mountGallery(html) {
  document.body.innerHTML = `<main id="mainContent">${html}</main>`;
  return document;
}

const SLIDE = (attrs) => `
  <div class="swiper-slide">
    <div class="swiper-zoom-container">
      <img ${attrs} />
    </div>
  </div>
`;

describe('olx-pt image discovery', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the primary selector', () => {
    mountGallery(`
      <div class="swiper-wrapper">
        ${SLIDE(`
          src="https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=750x1000"
          srcset="
            https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=389x272 420w,
            https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700 992w
          "
          data-testid="swiper-image-lazy"
        `)}
      </div>
    `);

    const result = discoverListingImages(document);
    expect(result.selectorUsed).toBe(PRIMARY_OLX_GALLERY_SELECTOR);
    expect(result.count).toBe(1);
    expect(result.urls[0]).toBe(
      'https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700',
    );
  });

  it('preserves gallery order', () => {
    mountGallery(`
      <div class="swiper-wrapper">
        ${SLIDE(`
          srcset="https://cdn/first;s=1000x700 992w"
          data-testid="swiper-image-lazy"
        `)}
        ${SLIDE(`
          srcset="https://cdn/second;s=1000x700 992w"
          data-testid="swiper-image-lazy"
        `)}
        ${SLIDE(`
          src="https://cdn/third;s=1000x700"
          data-testid="swiper-image-lazy"
        `)}
      </div>
    `);

    expect(discoverListingImages(document).urls).toEqual([
      'https://cdn/first;s=1000x700',
      'https://cdn/second;s=1000x700',
      'https://cdn/third;s=1000x700',
    ]);
  });

  it('deduplicates duplicate slides', () => {
    const url =
      'https://ireland.apollo.olxcdn.com:443/v1/files/dup-PT/image;s=1000x700';
    mountGallery(`
      <div class="swiper-wrapper">
        ${SLIDE(`src="${url}" data-testid="swiper-image-lazy"`)}
        ${SLIDE(`src="${url}" data-testid="swiper-image-lazy"`)}
      </div>
    `);

    const result = discoverListingImages(document);
    expect(result.count).toBe(1);
    expect(result.urls).toEqual([url]);
  });

  it('falls back to data-testid selector', () => {
    document.body.innerHTML = `
      <main id="mainContent">
        <img
          data-testid="swiper-image-lazy"
          src="https://cdn/fallback-testid;s=1000x700"
        />
      </main>
    `;
    const result = discoverListingImages(document);
    expect(result.count).toBe(1);
    expect(result.urls[0]).toContain('fallback-testid');
  });

  it('returns empty gallery', () => {
    mountGallery('<p>No gallery</p>');
    expect(discoverListingImages(document)).toEqual({
      urls: [],
      count: 0,
      selectorUsed: null,
    });
  });

  it('waits for a dynamic gallery', async () => {
    vi.useFakeTimers();
    mountGallery('<div class="swiper-wrapper"></div>');

    const pending = discoverListingImagesWithWait({
      root: document,
      timeoutMs: 1000,
      intervalMs: 100,
    });

    await vi.advanceTimersByTimeAsync(250);
    const wrapper = document.querySelector('.swiper-wrapper');
    wrapper.innerHTML = SLIDE(`
      src="https://cdn/late;s=1000x700"
      data-testid="swiper-image-lazy"
    `);

    await vi.advanceTimersByTimeAsync(150);
    const result = await pending;
    expect(result.count).toBe(1);
    expect(result.urls[0]).toBe('https://cdn/late;s=1000x700');
  });
});
