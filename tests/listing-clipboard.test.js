import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  formatFullText,
  generateFallbackId,
  parseClipboardId,
  resolveClipboardId,
} from '../src/clipboard/full-text.js';
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

describe('clipboard ID', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('prefers plate, then phone, then remembered fallback, then generated', () => {
    expect(resolveClipboardId({ plate: 'BC39VF', phone: '936968746' })).toBe(
      'BC39VF',
    );
    expect(resolveClipboardId({ plate: '', phone: '936968746' })).toBe(
      '936968746',
    );
    expect(
      resolveClipboardId({ plate: '', phone: '', fallbackId: '9911122299' }),
    ).toBe('9911122299');
    vi.spyOn(Math, 'random').mockReturnValue(0.01234);
    expect(resolveClipboardId({ plate: '', phone: '' })).toBe('990123499');
  });

  it('parses ID from clipboard text', () => {
    expect(parseClipboardId('ID: 9944455599\nTelefone: \n\n')).toBe(
      '9944455599',
    );
    expect(parseClipboardId('no id here')).toBe('');
  });

  it('reuses fallbackId across formatFullText calls', () => {
    const fields = {
      plate: '',
      make: 'SEAT',
      model: 'IBIZA',
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
      url: 'https://www.olx.pt/d/anuncio/x.html',
    };
    const first = formatFullText(fields, { fallbackId: '9977788899' });
    const second = formatFullText(fields, { fallbackId: '9977788899' });
    expect(first).toContain('ID: 9977788899');
    expect(second).toContain('ID: 9977788899');
    expect(parseClipboardId(first)).toBe(parseClipboardId(second));
  });

  it('generates IDs in 99XXXXX99 form', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(generateFallbackId()).toMatch(/^99\d{5}99$/);
    expect(generateFallbackId()).toBe('995000099');
  });
});

describe('full text clipboard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('formats the exact template order', () => {
    const text = formatFullText(
      {
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
      },
      { phone: '912345679' },
    );

    expect(text).toBe(
      [
        'ID: 06TM95',
        'Telefone: 912345679',
        '',
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

  it('uses phone as ID when plate is missing', () => {
    const text = formatFullText(
      {
        plate: '',
        make: 'CITROËN',
        model: 'C4 X',
        year: '2023',
        mileageKm: '64408',
        transmission: 'AUTOMÁTICA',
        fuel: 'DIESEL',
        engine: '1.5',
        powerCv: '130 CV',
        paintParts: 'OK',
        bodyParts: 'OK',
        tires: 'OK',
        customerValueEur: '24449',
        saleReason: 'VENDA',
        keyCount: '2',
        deductibleVat: 'NÃO',
        url: 'https://www.olx.pt/d/anuncio/citroen-c4-x-como-novo-garantia-da-marca-at-2028-IDJuKTf.html',
      },
      { phone: '936968746' },
    );

    expect(text.startsWith('ID: 936968746\nTelefone: 936968746\n\n')).toBe(
      true,
    );
  });

  it('keeps empty values without null/undefined', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.01234);
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
    expect(text).toContain('ID: 990123499');
    expect(text).toContain('Telefone: ');
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
