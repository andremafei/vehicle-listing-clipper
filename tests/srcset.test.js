import { describe, expect, it } from 'vitest';
import {
  parseSrcset,
  pickLargestSrcsetUrl,
  resolveBestImageUrl,
} from '../src/image/srcset.js';

describe('srcset helpers', () => {
  const srcset = `
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=389x272 420w,
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=516x361 780w,
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=1000x700 992w
  `;

  it('parses width descriptors', () => {
    const candidates = parseSrcset(srcset);
    expect(candidates).toHaveLength(3);
    expect(candidates[2].width).toBe(992);
    expect(candidates[2].url).toContain('image;s=1000x700');
  });

  it('picks the largest srcset candidate', () => {
    expect(pickLargestSrcsetUrl(srcset)).toBe(
      'https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=1000x700',
    );
  });

  it('preserves :443 and semicolon size tokens', () => {
    const url = pickLargestSrcsetUrl(srcset);
    expect(url).toContain(':443');
    expect(url).toContain('image;s=1000x700');
  });

  it('falls back to currentSrc then src', () => {
    const img = document.createElement('img');
    img.setAttribute('src', 'https://example.com/from-src.jpg');
    Object.defineProperty(img, 'currentSrc', {
      configurable: true,
      get() {
        return 'https://example.com/from-current.jpg';
      },
    });
    expect(resolveBestImageUrl(img)).toBe('https://example.com/from-current.jpg');

    Object.defineProperty(img, 'currentSrc', {
      configurable: true,
      get() {
        return '';
      },
    });
    expect(resolveBestImageUrl(img)).toBe('https://example.com/from-src.jpg');
  });

  it('prefers srcset over currentSrc', () => {
    const img = document.createElement('img');
    img.setAttribute(
      'srcset',
      'https://cdn.example/a 100w, https://cdn.example/b 200w',
    );
    Object.defineProperty(img, 'currentSrc', {
      configurable: true,
      get() {
        return 'https://cdn.example/current';
      },
    });
    expect(resolveBestImageUrl(img)).toBe('https://cdn.example/b');
  });
});
