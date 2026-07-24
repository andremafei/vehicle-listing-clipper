import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/anpr/pipeline.js', () => ({
  recognizeFirstPlateFromUrls: vi.fn(async () => ({
    ok: true,
    plate: 'AA00BB',
    plateFormatted: 'AA-00-BB',
    meanConfidence: 0.95,
    needsConfirmation: false,
    imageIndex: 1,
    imageUrl: 'https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700',
    diagnostics: {
      provider: 'test',
      detectorCacheHit: false,
      ocrCacheHit: false,
      imagesScanned: 1,
      detectionsTried: 1,
      elapsedMs: 1,
    },
  })),
  resetAnprSessions: vi.fn(),
}));

import { recognizeFirstPlateFromUrls } from '../src/anpr/pipeline.js';
import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

describe('controller Clip again vs expanded rescan', () => {
  /** @type {ReturnType<typeof createController> | null} */
  let controller = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.getElementById(PANEL_ROOT_ID)?.remove();
    __resetGmMemoryStore();
    recognizeFirstPlateFromUrls.mockClear();
    controller = null;
  });

  afterEach(() => {
    controller?.destroy();
    controller = null;
    __resetGmMemoryStore();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function mountListingWithGalleryAndPhone() {
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

  it('runs ANPR once then minimized Clip again only refreshes text and phone', async () => {
    vi.useFakeTimers();
    mountListingWithGalleryAndPhone();
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });

    controller = createController();
    controller.mount(document.body);

    const first = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);
    await first;

    expect(recognizeFirstPlateFromUrls).toHaveBeenCalledTimes(1);
    expect(controller.getState().lastPlate).toBe('AA00BB');
    expect(controller.getState().lastPhone).toBe('912345678');
    expect(controller.getState().plateImageIndex).toBe(1);
    expect(controller.getState().plateImageUrl).toContain('a-PT/image');
    expect(controller.getState().listingRecord).toBeTruthy();
    expect(controller.getState().listingRecord?.metadata?.plateImageIndex).toBe(
      1,
    );

    const oldButton = document.querySelector(
      'button[data-testid="ad-contact-phone"]',
    );
    const button = oldButton.cloneNode(false);
    button.textContent = 'Ver número';
    oldButton.replaceWith(button);
    button.addEventListener('click', () => {
      button.innerHTML =
        '<a href="tel:999888777" data-testid="contact-phone">999 888 777</a>';
    });

    const second = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);
    await second;

    expect(recognizeFirstPlateFromUrls).toHaveBeenCalledTimes(1);
    expect(controller.getState().lastPlate).toBe('AA00BB');
    expect(controller.getState().lastPhone).toBe('999888777');
    expect(controller.getState().listingRecord?.fields?.plate).toBe('AA00BB');
  });

  it('re-scans images when Clip listing is used with the panel expanded', async () => {
    vi.useFakeTimers();
    mountListingWithGalleryAndPhone();
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });

    controller = createController();
    const panel = controller.mount(document.body);

    const first = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);
    await first;
    expect(recognizeFirstPlateFromUrls).toHaveBeenCalledTimes(1);

    recognizeFirstPlateFromUrls.mockResolvedValueOnce({
      ok: true,
      plate: 'BB11CC',
      plateFormatted: 'BB-11-CC',
      meanConfidence: 0.96,
      needsConfirmation: false,
      imageIndex: 1,
      imageUrl:
        'https://ireland.apollo.olxcdn.com:443/v1/files/a-PT/image;s=1000x700',
      diagnostics: {
        provider: 'test',
        detectorCacheHit: true,
        ocrCacheHit: true,
        imagesScanned: 1,
        detectionsTried: 1,
        elapsedMs: 1,
      },
    });

    panel.setMinimized(false);
    const second = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);
    await second;

    expect(recognizeFirstPlateFromUrls).toHaveBeenCalledTimes(2);
    expect(controller.getState().lastPlate).toBe('BB11CC');
    expect(controller.getState().listingRecord?.fields?.plate).toBe('BB11CC');
  });

  it('skips ANPR after cache restore on minimized Clip again', async () => {
    vi.useFakeTimers();
    const { createListingRecord } = await import('../src/listing/record.js');
    const { setListingCacheEntry } = await import(
      '../src/storage/listing-cache.js'
    );

    const listingUrl =
      'https://www.olx.pt/d/anuncio/cached-clip-again-ID888.html';
    const link = document.createElement('link');
    link.id = 'ssr_canonical';
    link.rel = 'canonical';
    link.href = listingUrl;
    document.head.appendChild(link);

    document.body.innerHTML = `
      <main id="mainContent">
        <div class="swiper-wrapper">
          <div class="swiper-slide">
            <div class="swiper-zoom-container">
              <img
                src="https://ireland.apollo.olxcdn.com:443/v1/files/b-PT/image;s=1000x700"
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
        '<a href="tel:911222333" data-testid="contact-phone">911 222 333</a>';
    });

    const listingRecord = createListingRecord({
      extracted: {
        siteId: 'olx-pt',
        url: listingUrl,
        listingId: 'ID888',
        title: 'Cached',
        description: '',
        make: 'BMW',
        model: '320',
        year: '2020',
        mileageKm: '10000',
        transmission: 'Manual',
        fuel: 'Diesel',
        engine: '2.0',
        powerCv: '190',
        priceEur: '25000',
        extractedFields: [],
        warnings: [],
      },
      plate: 'ZZ99YY',
    });

    await setListingCacheEntry(listingUrl, {
      processedAt: Date.now(),
      phone: '900000000',
      clipboard: 'ID: ZZ99YY\nTelefone: 900000000\n',
      listingRecord,
    });

    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn(async () => undefined) },
    });

    controller = createController();
    controller.mount(document.body);
    await vi.waitFor(() => {
      expect(controller?.getState().listingRecord).toBeTruthy();
    });
    expect(controller.getState().lastPlate).toBe('ZZ99YY');

    const clipPromise = controller.onClipListing();
    await vi.advanceTimersByTimeAsync(4000);
    await clipPromise;

    expect(recognizeFirstPlateFromUrls).not.toHaveBeenCalled();
    expect(controller.getState().lastPlate).toBe('ZZ99YY');
    expect(controller.getState().lastPhone).toBe('911222333');
  });
});
