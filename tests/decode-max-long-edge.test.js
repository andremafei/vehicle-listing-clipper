import { describe, expect, it } from 'vitest';
import { resolveDecodeSize } from '../src/image/decode.js';

describe('resolveDecodeSize', () => {
  it('downscales when the long edge exceeds the cap', () => {
    expect(resolveDecodeSize(4000, 3000, 1440)).toEqual({
      width: 1440,
      height: 1080,
    });
    expect(resolveDecodeSize(3000, 4000, 1440)).toEqual({
      width: 1080,
      height: 1440,
    });
  });

  it('keeps native size when already within the cap', () => {
    expect(resolveDecodeSize(800, 600, 1440)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('keeps native size when maxLongEdge is omitted', () => {
    expect(resolveDecodeSize(2000, 1000)).toEqual({
      width: 2000,
      height: 1000,
    });
  });
});
