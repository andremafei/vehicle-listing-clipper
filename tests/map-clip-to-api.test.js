import { describe, expect, it } from 'vitest';
import {
  buildCreateClientBody,
  buildCreateLeadBody,
  splitClientName,
} from '../src-crm-filler/app/map-clip-to-api.js';

/** @type {import('../src/clipboard/lead-clip.js').LeadClipPayload} */
function sampleClip(overrides = {}) {
  return {
    v: 1,
    id: 'BC39VF',
    phone: '916465885',
    plate: 'BC39VF',
    clientName: 'Paulo Pereira',
    make: 'NISSAN',
    model: 'MICRA',
    year: '2015',
    mileageKm: '120000',
    transmission: 'MANUAL',
    fuel: 'GASOLINA',
    engine: '1.2',
    powerCv: '80 CV',
    customerValueEur: '13600',
    url: 'https://www.olx.pt/d/anuncio/x-IDabc.html',
    siteId: 'olx-pt',
    title: 'Nissan Micra Bose Deluxe',
    description: 'Bom estado',
    ...overrides,
  };
}

describe('splitClientName', () => {
  it('splits first and remaining parts like HAR creates', () => {
    expect(splitClientName('Paulo Pereira')).toEqual({
      name: 'Paulo',
      firstSurname: 'Pereira',
      secondSurname: null,
    });
    expect(splitClientName('Bruno Ricardo Silva')).toEqual({
      name: 'Bruno',
      firstSurname: 'Ricardo',
      secondSurname: 'Silva',
    });
  });

  it('uses Anúncio when only a single token is present', () => {
    expect(splitClientName('RicardoM')).toEqual({
      name: 'RicardoM',
      firstSurname: 'Anúncio',
      secondSurname: null,
    });
  });

  it('falls back when clientName is missing', () => {
    expect(splitClientName('')).toEqual({
      name: 'Lead',
      firstSurname: 'Anúncio',
      secondSurname: null,
    });
  });
});

describe('buildCreateClientBody / buildCreateLeadBody', () => {
  it('maps clientName into CRM name fields (not listing title)', () => {
    const clip = sampleClip();
    const client = buildCreateClientBody(clip);
    expect(client).toMatchObject({
      name: 'Paulo',
      firstSurname: 'Pereira',
      secondSurname: null,
      contact: { primaryPhone: '916465885' },
    });

    const lead = buildCreateLeadBody({
      clip,
      clientId: 170077,
      me: { id: 1, rolesId: [6] },
      localId: 147,
    });
    expect(lead.data.nombre).toBe('Paulo');
    expect(lead.data.apellido1).toBe('Pereira');
    expect(lead.data.apellido2).toBeNull();
    expect(lead.data.telefono1).toBe('916465885');
  });

  it('does not use listing title when clientName is empty', () => {
    const client = buildCreateClientBody(
      sampleClip({ clientName: '', title: 'Citroen C4 X Como Novo' }),
    );
    expect(client.name).toBe('Lead');
    expect(client.firstSurname).toBe('Anúncio');
  });

  it('would have used listing make/title before clientName fix (Standvirtual case)', () => {
    const clip = sampleClip({
      clientName: 'David Luz',
      make: 'MERCEDES-BENZ',
      title: 'Mercedes-Benz A 220 d 8G-DCT Progressive',
    });
    const client = buildCreateClientBody(clip);
    expect(client.name).toBe('David');
    expect(client.firstSurname).toBe('Luz');
    expect(client.name).not.toBe('Mercedes-Benz');
  });
});
