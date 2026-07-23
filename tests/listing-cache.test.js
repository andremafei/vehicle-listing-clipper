import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  LISTING_CACHE_TTL_MS,
  getListingCacheEntry,
  loadListingCache,
  pruneListingCache,
  setListingCacheEntry,
} from '../src/storage/listing-cache.js';
import { __resetGmMemoryStore } from '../src/userscript/gm-api.js';
import { createListingRecord } from '../src/listing/record.js';

function sampleEntry(overrides = {}) {
  const listingRecord = createListingRecord({
    extracted: {
      siteId: 'olx-pt',
      url: 'https://www.olx.pt/d/anuncio/exemplo-ID123.html',
      listingId: 'ID123',
      title: 'Example',
      description: '',
      make: 'CITROEN',
      model: 'C4',
      year: '2020',
      mileageKm: '10000',
      transmission: 'Manual',
      fuel: 'Gasolina',
      engine: '1.2',
      powerCv: '110',
      priceEur: '10000',
      extractedFields: [],
      warnings: [],
    },
    plate: 'AB12CD',
  });
  return {
    processedAt: Date.now(),
    phone: '912345678',
    clipboard: 'ID: AB12CD\nTelefone: 912345678\n',
    listingRecord,
    ...overrides,
  };
}

describe('listing-cache', () => {
  beforeEach(() => {
    __resetGmMemoryStore();
  });

  afterEach(() => {
    __resetGmMemoryStore();
  });

  it('stores and loads an entry by canonical URL', async () => {
    const url = 'https://www.olx.pt/d/anuncio/exemplo-ID123.html';
    const entry = sampleEntry();
    const saved = await setListingCacheEntry(url, entry);
    expect(saved?.phone).toBe('912345678');

    const loaded = await getListingCacheEntry(url);
    expect(loaded?.clipboard).toBe(entry.clipboard);
    expect(loaded?.listingRecord?.fields?.plate).toBe('AB12CD');
  });

  it('prunes entries older than two days', async () => {
    const now = 1_700_000_000_000;
    const urlFresh = 'https://www.olx.pt/d/anuncio/fresh.html';
    const urlStale = 'https://www.olx.pt/d/anuncio/stale.html';

    await setListingCacheEntry(
      urlFresh,
      sampleEntry({ processedAt: now - 60_000 }),
      now,
    );
    await setListingCacheEntry(
      urlStale,
      sampleEntry({ processedAt: now - LISTING_CACHE_TTL_MS - 1 }),
      now,
    );

    const pruned = await pruneListingCache(now);
    expect(pruned[urlFresh]).toBeTruthy();
    expect(pruned[urlStale]).toBeUndefined();

    expect(await getListingCacheEntry(urlStale, now)).toBeNull();
    expect(await getListingCacheEntry(urlFresh, now)).toBeTruthy();
  });

  it('ignores corrupt entries', async () => {
    const url = 'https://www.olx.pt/d/anuncio/ok.html';
    await setListingCacheEntry(url, sampleEntry());

    const cache = await loadListingCache();
    cache['https://www.olx.pt/d/anuncio/bad.html'] = /** @type {any} */ ({
      processedAt: 'nope',
      phone: 1,
    });
    // Bypass API to inject corrupt data the same way GM would return it
    const { gmSetValue } = await import('../src/userscript/gm-api.js');
    const { STORAGE_PREFIX } = await import('../src/environment.js');
    await gmSetValue(`${STORAGE_PREFIX}listingCache`, {
      ...cache,
      'https://www.olx.pt/d/anuncio/bad.html': {
        processedAt: 'nope',
        phone: 1,
      },
    });

    const loaded = await loadListingCache();
    expect(loaded[url]).toBeTruthy();
    expect(loaded['https://www.olx.pt/d/anuncio/bad.html']).toBeUndefined();
    expect(await getListingCacheEntry('https://www.olx.pt/d/anuncio/bad.html')).toBeNull();
  });

  it('stores and restores fallbackId for listings without plate or phone', async () => {
    const url = 'https://www.olx.pt/d/anuncio/no-id-ID777.html';
    const entry = sampleEntry({
      phone: '',
      fallbackId: '9933344499',
      clipboard: 'ID: 9933344499\nTelefone: \n\nMatrícula: \n',
    });
    entry.listingRecord.fields.plate = '';
    await setListingCacheEntry(url, entry);

    const loaded = await getListingCacheEntry(url);
    expect(loaded?.fallbackId).toBe('9933344499');
    expect(loaded?.clipboard).toContain('ID: 9933344499');
  });

  it('rejects empty URL or invalid entry on set', async () => {
    expect(await setListingCacheEntry('', sampleEntry())).toBeNull();
    expect(
      await setListingCacheEntry('https://www.olx.pt/d/anuncio/x.html', {
        processedAt: Date.now(),
        phone: '1',
        clipboard: 'x',
        listingRecord: null,
      }),
    ).toBeNull();
  });
});
