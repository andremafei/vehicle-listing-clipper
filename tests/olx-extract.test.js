import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { extractListing } from '../src/adapters/olx-pt/extract.js';

const REAL_FIXTURE_PATH = resolve(
  process.cwd(),
  'dev/fixtures/olx-listing-real.html',
);
const hasRealFixture = existsSync(REAL_FIXTURE_PATH);

describe('olx-pt extractListing', () => {
  beforeEach(() => {
    document.documentElement.innerHTML = '';
  });

  it('extracts fields from a minimal OLX-like DOM', () => {
    document.documentElement.innerHTML = `
      <head>
        <link id="ssr_canonical" rel="canonical"
          href="https://www.olx.pt/d/anuncio/seat-ibiza-IDABC12.html?x=1" />
        <script type="application/ld+json">${JSON.stringify({
          '@type': 'Vehicle',
          brand: 'SEAT',
          model: 'Ibiza',
          productionDate: '2017',
          sku: '123',
          offers: { price: 10950, priceCurrency: 'EUR' },
          description: 'Test',
        })}</script>
      </head>
      <body>
        <main id="mainContent">
          <div data-testid="offer_title"><h4>SEAT Ibiza</h4></div>
          <div data-testid="ad-price-container"><h3>10.950 €</h3></div>
          <div data-testid="ad-parameters-container">
            <p>Ano: 2017</p>
            <p>Modelo: Ibiza</p>
            <p>Cilindrada: 1.0</p>
            <p>Combustível: Gasolina</p>
            <p>Potência: 95</p>
            <p>Quilómetros: 103.000 km</p>
            <p>Tipo de Caixa: Manual</p>
          </div>
        </main>
      </body>
    `;

    const result = extractListing(document);
    expect(result.url).toBe(
      'https://www.olx.pt/d/anuncio/seat-ibiza-IDABC12.html',
    );
    expect(result.make).toBe('SEAT');
    expect(result.model).toBe('IBIZA');
    expect(result.year).toBe('2017');
    expect(result.mileageKm).toBe('103000');
    expect(result.transmission).toBe('MANUAL');
    expect(result.fuel).toBe('GASOLINA');
    expect(result.engine).toBe('1.0');
    expect(result.powerCv).toBe('95 CV');
    expect(result.priceEur).toBe('10950');
    expect(result.listingId).toBe('123');
  });

  it.skipIf(!hasRealFixture)(
    'extracts fields from the real OLX fixture',
    () => {
      const REAL_FIXTURE = readFileSync(REAL_FIXTURE_PATH, 'utf8');
      document.documentElement.innerHTML = REAL_FIXTURE;
      const result = extractListing(document);
      expect(result.url).toBe(
        'https://www.olx.pt/d/anuncio/citroen-c4-x-como-novo-garantia-da-marca-at-2028-IDJuKTf.html',
      );
      expect(result.make).toMatch(/CITRO/i);
      expect(result.model).toBe('C4 X');
      expect(result.year).toBe('2023');
      expect(result.mileageKm).toBe('64408');
      expect(result.transmission).toBe('AUTOMÁTICA');
      expect(result.fuel).toBe('DIESEL');
      expect(result.engine).toBe('1.5');
      expect(result.powerCv).toBe('130 CV');
      expect(result.priceEur).toBe('24449');
      expect(result.listingId).toBe('672265209');
    },
  );
});
