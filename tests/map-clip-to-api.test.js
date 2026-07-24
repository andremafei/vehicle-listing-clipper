import { describe, expect, it } from 'vitest';
import {
  buildCreateClientBody,
  buildCreateLeadBody,
  pickStockOption,
  resolveClipPhone,
  resolveVehicleFromStock,
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

  it('leaves surname empty when only a single token is present', () => {
    expect(splitClientName('RicardoM')).toEqual({
      name: 'RicardoM',
      firstSurname: null,
      secondSurname: null,
    });
    expect(splitClientName('luizsiqueirabiol')).toEqual({
      name: 'luizsiqueirabiol',
      firstSurname: null,
      secondSurname: null,
    });
  });

  it('falls back when clientName is missing', () => {
    expect(splitClientName('')).toEqual({
      name: 'Lead',
      firstSurname: null,
      secondSurname: null,
    });
  });
});

describe('resolveClipPhone', () => {
  it('prefers real phone over id', () => {
    expect(resolveClipPhone(sampleClip())).toBe('916465885');
  });

  it('uses all-digit fallback id when phone is empty', () => {
    expect(
      resolveClipPhone(
        sampleClip({ id: '991234599', phone: '', plate: '' }),
      ),
    ).toBe('991234599');
  });

  it('does not treat plate-based id as phone', () => {
    expect(
      resolveClipPhone(sampleClip({ id: 'BC39VF', phone: '', plate: 'BC39VF' })),
    ).toBe('');
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

  it('uses random fallback id as phone when clip has no phone', () => {
    const clip = sampleClip({
      id: '990123499',
      phone: '',
      plate: '',
    });
    const client = buildCreateClientBody(clip);
    expect(client.contact.primaryPhone).toBe('990123499');

    const lead = buildCreateLeadBody({
      clip,
      clientId: 1,
      me: { id: 1, rolesId: [6] },
      localId: 147,
    });
    expect(lead.data.telefono1).toBe('990123499');
  });

  it('does not use listing title when clientName is empty', () => {
    const client = buildCreateClientBody(
      sampleClip({ clientName: '', title: 'Citroen C4 X Como Novo' }),
    );
    expect(client.name).toBe('Lead');
    expect(client.firstSurname).toBeNull();
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

  it('uses stock catalog label/value for marca_vehiculo when resolved', () => {
    const lead = buildCreateLeadBody({
      clip: sampleClip({ make: 'NISSAN', model: 'MICRA' }),
      clientId: 1,
      me: { id: 1, rolesId: [6] },
      localId: 147,
      vehicle: {
        makeLabel: 'Nissan',
        makeValue: 40,
        modelLabel: 'Micra',
        modelValue: 848,
      },
    });
    expect(lead.vehiculo.marca_vehiculo).toEqual([{ label: 'Nissan', value: 40 }]);
    expect(lead.vehiculo.modelo).toEqual([{ label: 'Micra', value: 848 }]);
  });

  it('falls back to clip make text when stock ids are missing (broken UI selection risk)', () => {
    const lead = buildCreateLeadBody({
      clip: sampleClip({ make: 'NISSAN' }),
      clientId: 1,
      me: { id: 1, rolesId: [6] },
      localId: 147,
    });
    expect(lead.vehiculo.marca_vehiculo).toEqual([{ label: 'NISSAN', value: 'NISSAN' }]);
  });
});

describe('pickStockOption / resolveVehicleFromStock', () => {
  it('matches make case-insensitively against stock labels', async () => {
    expect(pickStockOption([{ label: 'Nissan', value: 40 }], 'NISSAN')).toEqual({
      label: 'Nissan',
      value: 40,
    });

    const vehicle = await resolveVehicleFromStock(
      sampleClip({ make: 'NISSAN', model: 'MICRA', year: '2017', fuel: 'GASOLINA' }),
      async (path) => {
        if (path === 'makes') return [{ label: 'Nissan', value: 40 }];
        if (path === 'models') return [{ label: 'Micra', value: 848 }];
        if (path === 'fuels') return [{ label: 'Gasolina', value: 2 }];
        if (path === 'transmissions') return [{ label: 'Manual', value: 1 }];
        return [];
      },
    );
    expect(vehicle).toMatchObject({
      makeLabel: 'Nissan',
      makeValue: 40,
      modelLabel: 'Micra',
      modelValue: 848,
      fuelLabel: 'Gasolina',
      fuelValue: 2,
      transmissionLabel: 'Manual',
      transmissionValue: 1,
    });
  });
});
