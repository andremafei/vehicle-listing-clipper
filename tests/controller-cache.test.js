import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createController } from '../src/app/controller.js';
import { PANEL_ROOT_ID } from '../src/environment.js';
import { createListingRecord } from '../src/listing/record.js';
import { setListingCacheEntry } from '../src/storage/listing-cache.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';

const LISTING_URL = 'https://www.olx.pt/d/anuncio/cached-example-ID999.html';

describe('controller listing cache restore', () => {
  /** @type {ReturnType<typeof createController> | null} */
  let controller = null;

  beforeEach(() => {
    document.body.innerHTML = '';
    document.head.innerHTML = '';
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

  it('restores cached listing without copying until Copy is clicked', async () => {
    const link = document.createElement('link');
    link.id = 'ssr_canonical';
    link.rel = 'canonical';
    link.href = LISTING_URL;
    document.head.appendChild(link);
    document.body.innerHTML = '<main id="mainContent"><p>listing</p></main>';

    const listingRecord = createListingRecord({
      extracted: {
        siteId: 'olx-pt',
        url: LISTING_URL,
        listingId: 'ID999',
        title: 'Cached car',
        description: '',
        make: 'FORD',
        model: 'FOCUS',
        year: '2019',
        mileageKm: '50000',
        transmission: 'Manual',
        fuel: 'Diesel',
        engine: '1.5',
        powerCv: '120',
        priceEur: '12000',
        extractedFields: [],
        warnings: [],
      },
      plate: 'AA00BB',
    });

    await setListingCacheEntry(LISTING_URL, {
      processedAt: Date.now(),
      phone: '912000000',
      clipboard: 'ID: AA00BB\nTelefone: 912000000\n\nMatrícula: AA00BB\n',
      listingRecord,
    });

    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    controller = createController();
    controller.mount(document.body);

    await vi.waitFor(() => {
      expect(controller?.getState().listingRecord).toBeTruthy();
    });

    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    expect(writeText).not.toHaveBeenCalled();
    expect(shadow.querySelector('h1')?.textContent).toBe('data ready to copy');
    expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
      'Data ready to copy',
    );
    const headerCopy = shadow.querySelector('.vlc-btn-header-copy');
    expect(headerCopy?.textContent).toBe('Copy');
    expect(headerCopy?.disabled).toBe(false);

    headerCopy.click();
    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(shadow.querySelector('h1')?.textContent).toBe('data copied');
    });

    expect(headerCopy.textContent).toBe('Copy again');
    expect(shadow.querySelector('.vlc-status')?.textContent).toContain(
      'Data copied',
    );
  });

  it('ignores empty cache entries and schedules auto-clip', async () => {
    const link = document.createElement('link');
    link.id = 'ssr_canonical';
    link.rel = 'canonical';
    link.href = LISTING_URL;
    document.head.appendChild(link);
    document.body.innerHTML = '<main id="mainContent"><p>listing</p></main>';

    const listingRecord = createListingRecord({
      extracted: {
        siteId: 'olx-pt',
        url: LISTING_URL,
        listingId: '',
        title: '',
        description: '',
        make: '',
        model: '',
        year: '',
        mileageKm: '',
        transmission: '',
        fuel: '',
        engine: '',
        powerCv: '',
        priceEur: '',
        extractedFields: ['url'],
        warnings: ['missing-make-or-model'],
      },
    });

    await setListingCacheEntry(LISTING_URL, {
      processedAt: Date.now(),
      phone: '',
      clipboard: `ID: 9911122299\nTelefone: \n\nMatrícula: \n\n${LISTING_URL}\n`,
      listingRecord,
    });

    vi.useFakeTimers();
    controller = createController();
    controller.mount(document.body);

    await vi.waitFor(() => {
      expect(controller?.getState().listingRecord).toBeNull();
    });

    expect(
      document.getElementById(PANEL_ROOT_ID).shadowRoot.querySelector('h1')
        ?.textContent,
    ).toBe('waiting');

    await vi.advanceTimersByTimeAsync(5000);
    await vi.waitFor(() => {
      const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
      expect(shadow.querySelector('.vlc-status')?.textContent).toBe(
        'No data found.',
      );
      expect(shadow.querySelector('h1')?.textContent).toBe('No data found.');
    });

    vi.useRealTimers();
  });

  it('keeps the same fallback ID when Copy rebuilds from a cached listing', async () => {
    const link = document.createElement('link');
    link.id = 'ssr_canonical';
    link.rel = 'canonical';
    link.href = LISTING_URL;
    document.head.appendChild(link);
    document.body.innerHTML = '<main id="mainContent"><p>listing</p></main>';

    const listingRecord = createListingRecord({
      extracted: {
        siteId: 'olx-pt',
        url: LISTING_URL,
        listingId: 'ID999',
        title: 'Cached car',
        description: '',
        make: 'FORD',
        model: 'FOCUS',
        year: '2019',
        mileageKm: '50000',
        transmission: 'Manual',
        fuel: 'Diesel',
        engine: '1.5',
        powerCv: '120',
        priceEur: '12000',
        extractedFields: [],
        warnings: [],
      },
      plate: '',
    });

    const fallbackId = '991234599';
    await setListingCacheEntry(LISTING_URL, {
      processedAt: Date.now(),
      phone: '',
      fallbackId,
      clipboard: `ID: ${fallbackId}\nTelefone: \n\nMatrícula: \n`,
      listingRecord,
    });

    const writeText = vi.fn(async () => undefined);
    vi.stubGlobal('navigator', { clipboard: { writeText } });

    controller = createController();
    controller.mount(document.body);

    await vi.waitFor(() => {
      expect(controller?.getState().listingRecord).toBeTruthy();
    });
    expect(controller.getState().fallbackId).toBe(fallbackId);

    const shadow = document.getElementById(PANEL_ROOT_ID).shadowRoot;
    shadow.querySelector('.vlc-btn-header-copy').click();

    await vi.waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    const copied = writeText.mock.calls[0][0];
    expect(copied).toContain(`ID: ${fallbackId}`);
    expect(controller.getState().fallbackId).toBe(fallbackId);
  });
});
