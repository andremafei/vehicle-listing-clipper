import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { extractListing } from '../src/adapters/standvirtual-pt/extract.js';

const FIXTURES = {
  fiatPre: resolve(
    process.cwd(),
    'dev/fixtures/standvirtual-real-pre-phone-review.html',
  ),
  mercedesPre: resolve(
    process.cwd(),
    'dev/fixtures/standvirtual-real-pre-phone-review-example-2.html',
  ),
};

const hasFiat = existsSync(FIXTURES.fiatPre);
const hasMercedes = existsSync(FIXTURES.mercedesPre);

function nextDataAdvert(overrides = {}) {
  return {
    id: '8097563983',
    title: 'Fiat 500 1.2 Lounge S&S',
    description: '<b>FIAT 500</b> em bom estado',
    url: 'https://www.standvirtual.com/carros/anuncio/fiat-500-ver-1-2-lounge-s-s-ID8Q0yiH.html',
    price: { value: '8400', currency: 'EUR' },
    seller: { type: 'PRIVATE', name: 'Ana Costa' },
    parametersDict: {
      make: { values: [{ value: 'fiat', label: 'Fiat' }] },
      model: { values: [{ value: '500', label: '500' }] },
      fuel_type: { values: [{ value: 'gaz', label: 'Gasolina' }] },
      first_registration_year: { values: [{ value: '2018', label: '2018' }] },
      mileage: { values: [{ value: '89000', label: '89 000 km' }] },
      engine_capacity: { values: [{ value: '1242', label: '1 242 cm3' }] },
      engine_power: { values: [{ value: '69', label: '69 cv' }] },
      gearbox: { values: [{ value: 'manual', label: 'Manual' }] },
      transmission: {
        values: [{ value: 'front-wheel-drive', label: 'Tracção dianteira' }],
      },
    },
    ...overrides,
  };
}

function mountWithNextData(advert) {
  document.documentElement.innerHTML = `
    <head>
      <script id="__NEXT_DATA__" type="application/json">${JSON.stringify({
        props: { pageProps: { advert } },
      })}</script>
    </head>
    <body>
      <h1 class="offer-title">${advert.title || ''}</h1>
      <div data-testid="ad-price"><h3 class="offer-price__number">${advert.price?.value || ''}</h3></div>
    </body>
  `;
}

describe('standvirtual-pt extractListing', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
  });

  it('extracts fields from __NEXT_DATA__ advert', () => {
    mountWithNextData(nextDataAdvert());
    const result = extractListing(document);

    expect(result.siteId).toBe('standvirtual-pt');
    expect(result.url).toBe(
      'https://www.standvirtual.com/carros/anuncio/fiat-500-ver-1-2-lounge-s-s-ID8Q0yiH.html',
    );
    expect(result.listingId).toBe('8Q0yiH');
    expect(result.title).toBe('Fiat 500 1.2 Lounge S&S');
    expect(result.make).toBe('FIAT');
    expect(result.model).toBe('500');
    expect(result.year).toBe('2018');
    expect(result.mileageKm).toBe('89000');
    expect(result.fuel).toBe('GASOLINA');
    expect(result.engine).toBe('1.2');
    expect(result.powerCv).toBe('69 CV');
    expect(result.transmission).toBe('MANUAL');
    expect(result.priceEur).toBe('8400');
    expect(result.description).toMatch(/FIAT 500/i);
    expect(result.clientName).toBe('Ana Costa');
  });

  it('uses gearbox for transmission, not drive traction', () => {
    mountWithNextData(
      nextDataAdvert({
        parametersDict: {
          ...nextDataAdvert().parametersDict,
          gearbox: { values: [{ value: 'automatic', label: 'Automática' }] },
        },
      }),
    );
    expect(extractListing(document).transmission).toBe('AUTOMÁTICA');
  });

  it('falls back to DOM data-testid when __NEXT_DATA__ is missing', () => {
    document.documentElement.innerHTML = `
      <body>
        <link rel="canonical"
          href="https://www.standvirtual.com/carros/anuncio/demo-IDABC12.html" />
        <h1 class="offer-title">Demo Car</h1>
        <div data-testid="ad-price"><h3 class="offer-price__number">12 500</h3></div>
        <div data-testid="make"><p>Marca</p><p>Seat</p></div>
        <div data-testid="model"><p>Modelo</p><p>Ibiza</p></div>
        <div data-testid="first_registration_year"><p>Ano</p><p>2019</p></div>
        <div data-testid="mileage"><p>Quilómetros</p><p>50 000 km</p></div>
        <div data-testid="fuel_type"><p>Combustível</p><p>Diesel</p></div>
        <div data-testid="gearbox"><p>Tipo de Caixa</p><p>Manual</p></div>
        <div data-testid="engine_capacity"><p>Cilindrada</p><p>1 598 cm3</p></div>
        <div data-testid="engine_power"><p>Potência</p><p>95 cv</p></div>
        <aside data-testid="aside-seller-info">
          <div data-testid="seller-header"><p class="font-bold">Pedro Alves</p></div>
        </aside>
      </body>
    `;
    const result = extractListing(document);
    expect(result.url).toBe(
      'https://www.standvirtual.com/carros/anuncio/demo-IDABC12.html',
    );
    expect(result.listingId).toBe('ABC12');
    expect(result.title).toBe('Demo Car');
    expect(result.make).toBe('SEAT');
    expect(result.model).toBe('IBIZA');
    expect(result.year).toBe('2019');
    expect(result.mileageKm).toBe('50000');
    expect(result.fuel).toBe('DIESEL');
    expect(result.transmission).toBe('MANUAL');
    expect(result.engine).toBe('1.6');
    expect(result.powerCv).toBe('95 CV');
    expect(result.priceEur).toBe('12500');
    expect(result.clientName).toBe('Pedro Alves');
  });

  it.skipIf(!hasFiat)('extracts Fiat fields from real PRE fixture', () => {
    document.documentElement.innerHTML = readFileSync(FIXTURES.fiatPre, 'utf8');
    const result = extractListing(document);
    expect(result.url).toBe(
      'https://www.standvirtual.com/carros/anuncio/fiat-500-ver-1-2-lounge-s-s-ID8Q0yiH.html',
    );
    expect(result.listingId).toBe('8Q0yiH');
    expect(result.make).toBe('FIAT');
    expect(result.model).toBe('500');
    expect(result.year).toBe('2018');
    expect(result.mileageKm).toBe('89000');
    expect(result.fuel).toBe('GASOLINA');
    expect(result.engine).toBe('1.2');
    expect(result.powerCv).toBe('69 CV');
    expect(result.transmission).toBe('MANUAL');
    expect(result.priceEur).toBe('8400');
    expect(result.clientName).toBe('Filipe Magalhaes');
  });

  it.skipIf(!hasMercedes)(
    'extracts Mercedes fields from real PRE fixture example 2',
    () => {
      document.documentElement.innerHTML = readFileSync(
        FIXTURES.mercedesPre,
        'utf8',
      );
      const result = extractListing(document);
      expect(result.url).toBe(
        'https://www.standvirtual.com/carros/anuncio/mercedes-benz-b-250-ver-e-ID8Q0KTg.html',
      );
      expect(result.listingId).toBe('8Q0KTg');
      expect(result.make).toMatch(/MERCEDES/i);
      expect(result.model).toMatch(/B 250/i);
      expect(result.year).toBe('2026');
      expect(result.mileageKm).toBe('105770');
      expect(result.fuel).toBe('HÍBRIDO');
      expect(result.engine).toBe('1.3');
      expect(result.powerCv).toBe('218 CV');
      expect(result.transmission).toBe('AUTOMÁTICA');
      expect(result.priceEur).toBe('26000');
    },
  );
});
