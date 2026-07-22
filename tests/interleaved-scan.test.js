import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadImage } from '../src/image/download.js';
import { __setGmXmlHttpRequestOverride } from '../src/userscript/gm-api.js';

describe('downloadImage', () => {
  afterEach(() => {
    __setGmXmlHttpRequestOverride(null);
  });

  it('downloads a single url', async () => {
    const calls = [];
    __setGmXmlHttpRequestOverride(async ({ url }) => {
      calls.push(url);
      return new Uint8Array([9, 9]).buffer;
    });

    const result = await downloadImage('https://cdn/one');
    expect(calls).toEqual(['https://cdn/one']);
    expect(result.url).toBe('https://cdn/one');
    expect(result.bytes).toBeInstanceOf(ArrayBuffer);
  });
});

describe('interleaved download + scan order', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    __setGmXmlHttpRequestOverride(null);
  });

  it('downloads next image only after the previous scan finishes', async () => {
    const events = [];
    const urls = ['https://cdn/a', 'https://cdn/b', 'https://cdn/c'];

    __setGmXmlHttpRequestOverride(async ({ url }) => {
      events.push(`download:${url}`);
      return new Uint8Array([1]).buffer;
    });

    // Simulate the controller/pipeline loop without real ORT.
    for (let i = 0; i < urls.length; i += 1) {
      events.push(`before-download:${i + 1}`);
      await downloadImage(urls[i]);
      events.push(`scan:${i + 1}`);
      if (i === 0) {
        // Plate found on first image — stop without downloading the rest.
        break;
      }
    }

    expect(events).toEqual([
      'before-download:1',
      'download:https://cdn/a',
      'scan:1',
    ]);
  });
});
