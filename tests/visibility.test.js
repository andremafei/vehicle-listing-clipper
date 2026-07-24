import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  isDocumentVisible,
  waitForDocumentVisible,
} from '../src/dom/visibility.js';

describe('document visibility helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('treats visibilityState visible as visible', () => {
    expect(
      isDocumentVisible({
        visibilityState: 'visible',
        hidden: false,
      }),
    ).toBe(true);
    expect(
      isDocumentVisible({
        visibilityState: 'hidden',
        hidden: true,
      }),
    ).toBe(false);
  });

  it('resolves immediately when already visible', async () => {
    await expect(
      waitForDocumentVisible({
        doc: {
          visibilityState: 'visible',
          hidden: false,
          addEventListener() {},
          removeEventListener() {},
        },
      }),
    ).resolves.toBe('visible');
  });

  it('waits for visibilitychange when hidden', async () => {
    /** @type {Record<string, Set<Function>>} */
    const listeners = {};
    const doc = {
      visibilityState: 'hidden',
      hidden: true,
      addEventListener(type, fn) {
        (listeners[type] ??= new Set()).add(fn);
      },
      removeEventListener(type, fn) {
        listeners[type]?.delete(fn);
      },
    };

    const pending = waitForDocumentVisible({ doc });
    let settled = false;
    void pending.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    doc.visibilityState = 'visible';
    doc.hidden = false;
    for (const fn of listeners.visibilitychange || []) {
      fn();
    }

    await expect(pending).resolves.toBe('visible');
    expect(settled).toBe(true);
  });

  it('resolves cancelled when abort fires while waiting', async () => {
    const listeners = {};
    const doc = {
      visibilityState: 'hidden',
      hidden: true,
      addEventListener(type, fn) {
        (listeners[type] ??= new Set()).add(fn);
      },
      removeEventListener(type, fn) {
        listeners[type]?.delete(fn);
      },
    };
    const abort = new AbortController();
    const pending = waitForDocumentVisible({ doc, signal: abort.signal });
    abort.abort();
    await expect(pending).resolves.toBe('cancelled');
  });
});
