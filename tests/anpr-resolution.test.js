import { describe, expect, it } from 'vitest';
import {
  ANPR_MEDIUM_APOLLO_SIZE,
  ANPR_MEDIUM_LONG_EDGE,
  toHighAnprImageUrl,
  toMediumAnprImageUrl,
  withApolloImageSize,
} from '../src/image/anpr-resolution.js';

describe('anpr-resolution helpers', () => {
  const apollo =
    'https://ireland.apollo.olxcdn.com/v1/files/token/image;s=1000x700';
  const apolloWithQ =
    'https://ireland.apollo.olxcdn.com/v1/files/token/image;s=360x0;q=80';
  const apolloBare =
    'https://ireland.apollo.olxcdn.com/v1/files/token/image';

  it('exports medium long-edge constant', () => {
    expect(ANPR_MEDIUM_LONG_EDGE).toBe(1440);
    expect(ANPR_MEDIUM_APOLLO_SIZE).toBe('1440x0');
  });

  it('rewrites Apollo URLs to medium size', () => {
    expect(toMediumAnprImageUrl(apollo)).toBe(
      'https://ireland.apollo.olxcdn.com/v1/files/token/image;s=1440x0',
    );
    expect(toMediumAnprImageUrl(apolloBare)).toBe(
      'https://ireland.apollo.olxcdn.com/v1/files/token/image;s=1440x0',
    );
    expect(toMediumAnprImageUrl(apolloWithQ)).toBe(
      'https://ireland.apollo.olxcdn.com/v1/files/token/image;s=1440x0;q=80',
    );
  });

  it('strips size for high-resolution Apollo URLs', () => {
    expect(toHighAnprImageUrl(apollo)).toBe(
      'https://ireland.apollo.olxcdn.com/v1/files/token/image',
    );
    expect(toHighAnprImageUrl(apolloWithQ)).toBe(
      'https://ireland.apollo.olxcdn.com/v1/files/token/image;q=80',
    );
    expect(toHighAnprImageUrl(apolloBare)).toBe(apolloBare);
  });

  it('leaves non-Apollo URLs unchanged', () => {
    const other = 'https://cdn.example/photo.jpg';
    expect(toMediumAnprImageUrl(other)).toBe(other);
    expect(toHighAnprImageUrl(other)).toBe(other);
    expect(withApolloImageSize(other, '1440x0')).toBe(other);
  });
});
