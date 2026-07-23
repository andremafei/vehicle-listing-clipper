import { describe, expect, it } from 'vitest';
import {
  canonicalizeListingUrl,
  normalizeDescription,
  normalizeEngine,
  normalizeFuel,
  normalizeMileageKm,
  normalizePowerCv,
  normalizePriceEur,
  normalizeTransmission,
  normalizeUpper,
  normalizeYear,
  stripHtmlToText,
} from '../src/adapters/olx-pt/normalize.js';

describe('olx-pt normalize', () => {
  it('normalizes mileage', () => {
    expect(normalizeMileageKm('64.408 km')).toBe('64408');
    expect(normalizeMileageKm('103 000 km')).toBe('103000');
    expect(normalizeMileageKm('103000')).toBe('103000');
    expect(normalizeMileageKm('')).toBe('');
  });

  it('normalizes price', () => {
    expect(normalizePriceEur('24.449 €')).toBe('24449');
    expect(normalizePriceEur(24449)).toBe('24449');
    expect(normalizePriceEur('€10,950')).toBe('10950');
  });

  it('normalizes transmission and fuel', () => {
    expect(normalizeTransmission('Automática')).toBe('AUTOMÁTICA');
    expect(normalizeTransmission('Manual')).toBe('MANUAL');
    expect(normalizeFuel('Diesel')).toBe('DIESEL');
    expect(normalizeFuel('Gasolina')).toBe('GASOLINA');
    expect(normalizeFuel('Híbrido')).toBe('HÍBRIDO');
    expect(normalizeFuel('Elétrico')).toBe('ELÉTRICO');
  });

  it('normalizes engine displacement', () => {
    expect(normalizeEngine('1.500')).toBe('1.5');
    expect(normalizeEngine('1.0')).toBe('1.0');
    expect(normalizeEngine('1')).toBe('1.0');
    expect(normalizeEngine('99')).toBe('1.0');
    expect(normalizeEngine('999')).toBe('1.0');
    expect(normalizeEngine('')).toBe('');
  });

  it('normalizes power and year', () => {
    expect(normalizePowerCv('130')).toBe('130 CV');
    expect(normalizePowerCv('95 CV')).toBe('95 CV');
    expect(normalizeYear('2023')).toBe('2023');
    expect(normalizeYear('2023-07')).toBe('2023');
  });

  it('uppercases and canonicalizes URL', () => {
    expect(normalizeUpper('Citroën')).toBe('CITROËN');
    expect(
      canonicalizeListingUrl(
        'https://www.olx.pt/d/anuncio/foo-IDJuKTf.html?search_reason=x#main',
      ),
    ).toBe('https://www.olx.pt/d/anuncio/foo-IDJuKTf.html');
  });

  it('preserves line breaks in descriptions', () => {
    expect(normalizeDescription('A  B\n\n C \nD')).toBe('A B\n\nC\nD');
    expect(
      stripHtmlToText('<p>Linha 1</p><p>Linha 2<br/>Linha 3</p>'),
    ).toBe('Linha 1\nLinha 2\nLinha 3');
  });
});
