import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/anpr/pipeline.js', () => ({
  recognizeFirstPlateFromUrls: vi.fn(async () => ({
    ok: true,
    plate: 'AA00BB',
    plateFormatted: 'AA-00-BB',
    meanConfidence: 0.82,
    needsConfirmation: true,
    imageIndex: 2,
    imageUrl:
      'https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700',
    diagnostics: {
      provider: 'test',
      detectorCacheHit: false,
      ocrCacheHit: false,
      imagesScanned: 2,
      detectionsTried: 2,
      elapsedMs: 1,
    },
  })),
  resetAnprSessions: vi.fn(),
}));

import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

describe('low-confidence plate confirmation', () => {
  /** @type {ReturnType<typeof createController> | null} */
  let controller = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __resetGmMemoryStore();
    controller = null;
  });

  afterEach(() => {
    controller?.destroy();
    controller = null;
    __resetGmMemoryStore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function mountListing() {
    document.body.innerHTML = `
      <main id="mainContent">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="swiper-zoom-container">
              <img
                src="https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700"
                data-testid="swiper-image-lazy"
              />
            </div>
          </div>
        </div>
        <button type="button" data-testid="ad-contact-phone">Ver número</button>
      </main>
    `;
    const button = document.querySelector(
      'button[data-testid="ad-contact-phone"]',
    );
    button.addEventListener('click', () => {
      button.innerHTML =
        '<a href="tel:912345678" data-testid="contact-phone">912 345 678</a>';
    });
  }

  it('prompts and discards a low-confidence plate', async () => {
    vi.useFakeTimers();
    mountListing();
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });

    controller = createController();
    controller.mount(document.body);

    const clipPromise = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);

    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    await vi.waitFor(() => {
      expect(shadow.querySelector('.vlc-plate-confirm')?.hidden).toBe(false);
    });

    const discardBtn = [...shadow.querySelectorAll('.vlc-plate-confirm-actions .vlc-btn')].find(
      (btn) => btn.textContent === 'Não usar placa',
    );
    expect(discardBtn).toBeTruthy();
    discardBtn.click();

    await clipPromise;

    expect(controller.getState().lastPlate).toBe('');
    expect(controller.getState().listingRecord?.fields?.plate).toBe('');
    expect(controller.getState().lastPhone).toBe('912345678');
  });

  it('keeps the plate when the user confirms use', async () => {
    vi.useFakeTimers();
    mountListing();
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });

    controller = createController();
    controller.mount(document.body);

    const clipPromise = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);

    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    await vi.waitFor(() => {
      expect(shadow.querySelector('.vlc-plate-confirm')?.hidden).toBe(false);
    });

    const useBtn = [...shadow.querySelectorAll('.vlc-plate-confirm-actions .vlc-btn')].find(
      (btn) => btn.textContent === 'Usar este valor',
    );
    useBtn.click();
    await clipPromise;

    expect(controller.getState().lastPlate).toBe('AA00BB');
    expect(controller.getState().plateConfidence).toBe(0.82);
  });
});
