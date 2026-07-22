import { describe, expect, it } from 'vitest';
import { formatFullText } from '../src/clipboard/full-text.js';
import { formatListingJson } from '../src/clipboard/json.js';
import {
  applyListingEdit,
  createListingRecord,
} from '../src/listing/record.js';

describe('listing record', () => {
  it('merges extract, plate, and defaults', () => {
    const record = createListingRecord({
      plate: '06TM95',
      extracted: {
        siteId: 'olx-pt',
        url: 'https://www.olx.pt/d/anuncio/x-IDabc.html',
        listingId: '1',
        title: 'SEAT Ibiza',
        description: '',
        make: 'SEAT',
        model: 'IBIZA',
        year: '2017',
        mileageKm: '103000',
        transmission: 'MANUAL',
        fuel: 'GASOLINA',
        engine: '1.0',
        powerCv: '95 CV',
        priceEur: '10950',
        extractedFields: [],
        warnings: [],
      },
    });

    expect(record.fields.plate).toBe('06TM95');
    expect(record.origins.plate).toBe('anpr');
    expect(record.fields.make).toBe('SEAT');
    expect(record.origins.make).toBe('extracted');
    expect(record.fields.paintParts).toBe('OK');
    expect(record.origins.paintParts).toBe('default');
    expect(record.fields.saleReason).toBe('VENDA');
    expect(record.fields.keyCount).toBe('2');
    expect(record.fields.deductibleVat).toBe('NÃO');
  });

  it('marks edits', () => {
    const base = createListingRecord({ plate: '06TM95' });
    const next = applyListingEdit(base, 'keyCount', '3');
    expect(next.fields.keyCount).toBe('3');
    expect(next.origins.keyCount).toBe('edited');
    expect(next.metadata.editedFields).toContain('keyCount');
  });
});

describe('full text clipboard', () => {
  it('formats the exact template order', () => {
    const text = formatFullText({
      plate: '06TM95',
      make: 'SEAT',
      model: 'IBIZA',
      year: '2017',
      mileageKm: '103000',
      transmission: 'MANUAL',
      fuel: 'GASOLINA',
      engine: '1.0',
      powerCv: '95 CV',
      paintParts: 'OK',
      bodyParts: 'OK',
      tires: 'OK',
      customerValueEur: '10950',
      saleReason: 'VENDA',
      keyCount: '2',
      deductibleVat: 'NÃO',
      url: 'https://www.olx.pt/d/anuncio/abarth-595-competizione-nacional-IDIZgLL.html',
    });

    expect(text).toBe(
      [
        'Matrícula: 06TM95',
        'Marca: SEAT',
        'Modelo: IBIZA',
        'Ano: 2017',
        'Km: 103000',
        'Tipo caixa: MANUAL',
        'Combustivel: GASOLINA',
        'Motor: 1.0',
        'Potencia: 95 CV',
        'Peças Pintura: OK',
        'Peças Chapa: OK',
        'Pneus: OK',
        'Valor cliente: 10950 €',
        'Razão venda: VENDA',
        'Numero de Chaves: 2',
        'Iva dedutivel: NÃO',
        '',
        'https://www.olx.pt/d/anuncio/abarth-595-competizione-nacional-IDIZgLL.html',
      ].join('\n'),
    );
  });

  it('keeps empty values without null/undefined', () => {
    const text = formatFullText({
      plate: '',
      make: '',
      model: '',
      year: '',
      mileageKm: '',
      transmission: '',
      fuel: '',
      engine: '',
      powerCv: '',
      paintParts: 'OK',
      bodyParts: 'OK',
      tires: 'OK',
      customerValueEur: '',
      saleReason: 'VENDA',
      keyCount: '2',
      deductibleVat: 'NÃO',
      url: '',
    });
    expect(text).toContain('Matrícula: ');
    expect(text).toContain('Valor cliente: ');
    expect(text).not.toContain('null');
    expect(text).not.toContain('undefined');
    expect(text.split('\n').at(-2)).toBe('');
  });

  it('includes metadata in JSON copy', () => {
    const record = createListingRecord({
      plate: '06TM95',
      extracted: {
        siteId: 'olx-pt',
        url: 'https://www.olx.pt/d/anuncio/x.html',
        listingId: '1',
        title: '',
        description: '',
        make: 'SEAT',
        model: 'IBIZA',
        year: '2017',
        mileageKm: '1',
        transmission: 'MANUAL',
        fuel: 'GASOLINA',
        engine: '1.0',
        powerCv: '95 CV',
        priceEur: '100',
        extractedFields: [],
        warnings: [],
      },
    });
    const json = JSON.parse(formatListingJson(record));
    expect(json.vehicle.plate).toBe('06TM95');
    expect(json.origins.plate).toBe('anpr');
    expect(json.metadata.defaultedFields).toContain('paintParts');
  });
});
