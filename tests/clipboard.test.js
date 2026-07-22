import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  copyText,
  formatClipboardPayload,
} from '../src/clipboard/clipboard.js';
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

  it('formats plate and phone as newline-separated payload', () => {
    expect(formatClipboardPayload({ plate: '06TM95', phone: '926811992' })).toBe(
      '06TM95\n926811992',
    );
    expect(formatClipboardPayload({ plate: '06TM95' })).toBe('06TM95');
    expect(formatClipboardPayload({ phone: '926811992' })).toBe('926811992');
    expect(formatClipboardPayload({})).toBe('');
  });
});
