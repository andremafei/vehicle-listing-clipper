import { afterEach, describe, expect, it } from 'vitest';
import { downloadImagesSequential } from '../src/image/download.js';
import {
  __setGmXmlHttpRequestOverride,
  gmXmlHttpRequest,
} from '../src/userscript/gm-api.js';

describe('downloadImagesSequential', () => {
  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
  });

  it('downloads sequentially and reports 1-based progress', async () => {
    const order = [];
    __setGmXmlHttpRequestOverride(async ({ url }) => {
      order.push(`req:${url}`);
      const bytes = new Uint8Array([1, 2, 3, 4]);
      return bytes.buffer.slice(
        bytes.byteOffset,
        bytes.byteOffset + bytes.byteLength,
      );
    });

    const urls = [
      'https://cdn/a;s=1000x700',
      'https://cdn/b;s=1000x700',
      'https://cdn/c;s=1000x700',
    ];
    const progress = [];

    const results = await downloadImagesSequential(urls, {
      onProgress: (p) => progress.push({ index: p.index, total: p.total }),
      request: gmXmlHttpRequest,
    });

    expect(progress).toEqual([
      { index: 1, total: 3 },
      { index: 2, total: 3 },
      { index: 3, total: 3 },
    ]);
    expect(order).toEqual([
      'req:https://cdn/a;s=1000x700',
      'req:https://cdn/b;s=1000x700',
      'req:https://cdn/c;s=1000x700',
    ]);
    expect(results).toHaveLength(3);
    expect(results[0].bytes).toBeInstanceOf(ArrayBuffer);
  });

  it('rejects when response is not an ArrayBuffer', async () => {
    await expect(
      downloadImagesSequential(['https://cdn/x'], {
        request: async () => 'not-bytes',
      }),
    ).rejects.toThrow(/ArrayBuffer/);
  });
});
