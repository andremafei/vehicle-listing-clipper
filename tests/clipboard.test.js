import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyText } from '../src/clipboard/clipboard.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

describe('clipboard', () => {
  afterEach(() => {
    __resetGmMemoryStore();
    vi.unstubAllGlobals();
  });

  it('uses navigator clipboard fallback', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn(async () => undefined),
      },
    });
    const result = await copyText('06TM95');
    expect(result.ok).toBe(true);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('06TM95');
  });
});
