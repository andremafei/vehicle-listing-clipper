import { describe, expect, it } from 'vitest';
import { formatFullText } from '../src/clipboard/full-text.js';
import {
  LEAD_CLIP_END,
  LEAD_CLIP_START,
  appendLeadClipJson,
  buildLeadClipPayload,
  parseLeadClip,
} from '../src/clipboard/lead-clip.js';
import { createListingRecord } from '../src/listing/record.js';

function sampleRecord() {
  return createListingRecord({
    plate: 'BC39VF',
    extracted: {
      siteId: 'olx-pt',
      url: 'https://www.olx.pt/d/anuncio/x-IDabc.html',
      listingId: '1',
      title: 'Citroën C4 X',
      description: 'Bom estado',
      clientName: 'RicardoM',
      make: 'CITROËN',
      model: 'C4 X',
      year: '2022',
      mileageKm: '24500',
      transmission: 'Manual',
      fuel: 'Gasolina',
      engine: '1.2',
      powerCv: '130',
      priceEur: '24449',
      extractedFields: [],
      warnings: [],
    },
  });
}

describe('LEAD_CLIP_V1', () => {
  it('builds a flat v1 payload with phone and id', () => {
    const payload = buildLeadClipPayload(sampleRecord(), {
      phone: '936968746',
    });
    expect(payload.v).toBe(1);
    expect(payload.id).toBe('BC39VF');
    expect(payload.phone).toBe('936968746');
    expect(payload.plate).toBe('BC39VF');
    expect(payload.make).toBe('CITROËN');
    expect(payload.siteId).toBe('olx-pt');
    expect(payload.url).toContain('olx.pt');
    expect(payload.clientName).toBe('RicardoM');
    const keys = Object.keys(payload);
    expect(keys.indexOf('clientName')).toBe(keys.indexOf('plate') + 1);
  });

  it('appends delimited JSON after full text', () => {
    const record = sampleRecord();
    const full = formatFullText(record.fields, { phone: '936968746' });
    const payload = buildLeadClipPayload(record, { phone: '936968746' });
    const text = appendLeadClipJson(full, payload);

    expect(text).toContain('ID: BC39VF');
    expect(text).toContain(LEAD_CLIP_START);
    expect(text).toContain(LEAD_CLIP_END);
    expect(text.indexOf(LEAD_CLIP_START)).toBeGreaterThan(text.indexOf('https://'));
  });

  it('parses a valid block and returns human text', () => {
    const record = sampleRecord();
    const full = formatFullText(record.fields, { phone: '912345678' });
    const payload = buildLeadClipPayload(record, { phone: '912345678' });
    const text = appendLeadClipJson(full, payload);

    const parsed = parseLeadClip(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload.phone).toBe('912345678');
    expect(parsed.payload.plate).toBe('BC39VF');
    expect(parsed.humanText).toContain('Matrícula: BC39VF');
    expect(parsed.humanText).not.toContain(LEAD_CLIP_START);
  });

  it('preserves newlines in description through LEAD_CLIP_V1', () => {
    const record = createListingRecord({
      plate: 'BC39VF',
      extracted: {
        siteId: 'olx-pt',
        url: 'https://www.olx.pt/d/anuncio/x-IDabc.html',
        listingId: '1',
        title: 'Citroën C4 X',
        description: 'Linha 1\n\nLinha 2\nLinha 3',
        make: 'CITROËN',
        model: 'C4 X',
        year: '2022',
        mileageKm: '24500',
        transmission: 'Manual',
        fuel: 'Gasolina',
        engine: '1.2',
        powerCv: '130',
        priceEur: '24449',
        extractedFields: [],
        warnings: [],
      },
    });
    const payload = buildLeadClipPayload(record, { phone: '936968746' });
    expect(payload.description).toBe('Linha 1\n\nLinha 2\nLinha 3');

    const text = appendLeadClipJson('ID: BC39VF\n', payload);
    expect(text).toContain('Linha 1\\n\\nLinha 2\\nLinha 3');
    const parsed = parseLeadClip(text);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload.description).toBe('Linha 1\n\nLinha 2\nLinha 3');
  });
});
