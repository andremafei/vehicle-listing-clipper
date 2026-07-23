import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  discoverListingImages,
  discoverImagesFromNextData,
} from '../src/adapters/standvirtual-pt/images.js';

const FIAT_PRE = resolve(
  process.cwd(),
  'dev/fixtures/standvirtual-real-pre-phone-review.html',
);
const hasFiatPre = existsSync(FIAT_PRE);

function mountWithPhotos(photos) {
  document.documentElement.innerHTML = `
    <head>
      <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
        props: {
          pageProps: {
            advert: {
              images: { photos },
            },
          },
        },
      })}</script>
    </head>
    <body></body>
  `;
}

describe('standvirtual-pt image discovery', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
  });

  it('reads image URLs from __NEXT_DATA__ photos', () => {
    mountWithPhotos([
      { url: 'https://ireland.apollo.olxcdn.com/v1/files/a/image' },
      { url: 'https://ireland.apollo.olxcdn.com/v1/files/b/image' },
      { url: 'https://ireland.apollo.olxcdn.com/v1/files/a/image' },
    ]);

    const fromNext = discoverImagesFromNextData(document);
    expect(fromNext?.count).toBe(2);
    expect(fromNext?.selectorUsed).toBe('next-data:images.photos');

    const result = discoverListingImages(document);
    expect(result.urls).toEqual([
      'https://ireland.apollo.olxcdn.com/v1/files/a/image',
      'https://ireland.apollo.olxcdn.com/v1/files/b/image',
    ]);
  });

  it('falls back to DOM gallery when Next data has no photos', () => {
    document.body.innerHTML = `
      <div data-testid="main-gallery">
        <img data-testid="gallery-image-0"
          src="https://cdn.example/one.jpg" />
        <img data-testid="gallery-image-1"
          src="https://cdn.example/two.jpg" />
      </div>
    `;
    const result = discoverListingImages(document);
    expect(result.count).toBe(2);
    expect(result.urls[0]).toContain('one.jpg');
    expect(result.urls[1]).toContain('two.jpg');
  });

  it.skipIf(!hasFiatPre)(
    'discovers photos from real PRE fixture via __NEXT_DATA__',
    () => {
      document.documentElement.innerHTML = readFileSync(FIAT_PRE, 'utf8');
      const result = discoverListingImages(document);
      expect(result.count).toBe(8);
      expect(result.selectorUsed).toBe('next-data:images.photos');
      expect(result.urls[0]).toMatch(/ireland\.apollo\.olxcdn\.com/);
    },
  );
});
