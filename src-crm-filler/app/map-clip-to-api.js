/**
 * Map LEAD_CLIP_V1 → CRM create payloads (from HAR shapes).
 */

/** HAR-observed defaults when live filtros are unavailable. */
export const HAR_DEFAULTS = {
  estado: { label: 'Avaliação mínima', value: 5 },
  origen: { label: 'Captación Central', value: 29 },
  forma_contacto: { label: 'Whatsapp', value: 5 },
  marca_comercial: { label: 'Flexicar', value: 3 },
  id_local_actual: 147,
};

/**
 * @param {string} value
 */
function digitsOnly(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * @param {string} value
 */
function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[\s\-.]/g, '');
}

/**
 * Effective CRM phone from LEAD_CLIP_V1.
 * Prefer `phone`; when empty, use all-digit `id` (random fallback `99XXXXX99`).
 * Plate-based ids contain letters and are never used as phone.
 * @param {{ phone?: string | null, id?: string | null } | null | undefined} clip
 * @returns {string}
 */
export function resolveClipPhone(clip) {
  const phone = digitsOnly(clip?.phone);
  if (phone) return phone;
  const id = String(clip?.id || '').trim();
  const idDigits = digitsOnly(id);
  if (idDigits && idDigits === id) return idDigits;
  return '';
}

/**
 * @param {string} label
 * @param {unknown} value
 */
function option(label, value) {
  return [{ label, value }];
}

/**
 * Pick first filtro option matching needle (case-insensitive) or first item.
 * @param {unknown} list
 * @param {string} [needle]
 */
function pickFiltro(list, needle = '') {
  const rows = Array.isArray(list) ? list : [];
  const normalized = needle.trim().toLowerCase();
  if (normalized) {
    const hit = rows.find((row) => {
      const label = String(row.label ?? row.nombre ?? row.name ?? '').toLowerCase();
      return label.includes(normalized);
    });
    if (hit) {
      return {
        label: hit.label ?? hit.nombre ?? hit.name,
        value: hit.value ?? hit.id,
      };
    }
  }
  if (rows[0]) {
    return {
      label: rows[0].label ?? rows[0].nombre ?? rows[0].name,
      value: rows[0].value ?? rows[0].id,
    };
  }
  return null;
}

/**
 * Split advertiser/client display name into CRM name parts (HAR shape).
 * Examples: "Paulo Pereira" → Paulo / Pereira; "RicardoM" → RicardoM / null.
 * Single-token OLX usernames must not invent a surname placeholder.
 * @param {unknown} raw
 * @returns {{ name: string, firstSurname: string | null, secondSurname: string | null }}
 */
export function splitClientName(raw) {
  const parts = String(raw || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  if (parts.length === 0) {
    return { name: 'Lead', firstSurname: null, secondSurname: null };
  }
  if (parts.length === 1) {
    return { name: parts[0], firstSurname: null, secondSurname: null };
  }
  return {
    name: parts[0],
    firstSurname: parts[1],
    secondSurname: parts.length > 2 ? parts.slice(2).join(' ') : null,
  };
}

/**
 * @param {import('../../src/clipboard/lead-clip.js').LeadClipPayload} clip
 */
export function buildCreateClientBody(clip) {
  const phone = resolveClipPhone(clip);
  const { name, firstSurname, secondSurname } = splitClientName(clip.clientName);
  return {
    name,
    firstSurname,
    secondSurname,
    contact: {
      email: null,
      primaryPhone: phone || null,
    },
    address: {
      province: { id: null, name: null },
      municipality: null,
    },
  };
}

/**
 * @param {object} opts
 * @param {import('../../src/clipboard/lead-clip.js').LeadClipPayload} opts.clip
 * @param {number} opts.clientId
 * @param {{ id?: number, rolesId?: number[] }} opts.me
 * @param {number} opts.localId
 * @param {{ estado?: object, origen?: object, contacto?: object, marca?: object }} [opts.filters]
 * @param {object} [opts.vehicle]
 */
export function buildCreateLeadBody(opts) {
  const { clip, clientId, me, localId, filters = {}, vehicle = {} } = opts;
  const phone = resolveClipPhone(clip);
  const plate = normalizePlate(clip.plate);
  const agentId = me?.id ?? 0;
  const roles = Array.isArray(me?.rolesId) ? me.rolesId : [6];
  const { name, firstSurname, secondSurname } = splitClientName(clip.clientName);

  const estado = filters.estado || HAR_DEFAULTS.estado;
  const origen = filters.origen || HAR_DEFAULTS.origen;
  const forma = filters.contacto || HAR_DEFAULTS.forma_contacto;
  const marcaComercial = filters.marca || HAR_DEFAULTS.marca_comercial;

  const km = Number(String(clip.mileageKm || '').replace(/\D/g, '')) || 0;
  const priceRaw = String(clip.customerValueEur || '').replace(/[^\d.,]/g, '');
  const buscado = Number(priceRaw.replace(',', '.')) || null;

  const makeLabel = vehicle.makeLabel || clip.make || '';
  const modelLabel = vehicle.modelLabel || clip.model || '';
  const yearNum = Number(clip.year) || null;
  const fuelLabel = vehicle.fuelLabel || normalizeFuel(clip.fuel);
  const gearLabel = vehicle.transmissionLabel || normalizeTransmission(clip.transmission);

  return {
    data: {
      toggle: false,
      nombre: name,
      telefono1: phone || null,
      cliente: clientId,
      client_id: clientId,
      id_cliente_lead: clientId,
      id_existente_lead: null,
      condiciones: false,
      comercial: false,
      provincia: null,
      municipio: null,
      estado: option(estado.label, estado.value),
      origen: option(origen.label, origen.value),
      forma_contacto: option(forma.label, forma.value),
      marca_comercial: option(marcaComercial.label, marcaComercial.value),
      email: null,
      telefono2: null,
      apellido1: firstSurname,
      apellido2: secondSurname,
      kilometros: km,
      importado: false,
      matricula: plate || null,
      bastidor: null,
      tasacion_max: null,
      tasacion_min: null,
      buscado,
      pactado: null,
      url_anuncio: clip.url || null,
      platform: clip.siteId || null,
      publishedAt: null,
      extractedAt: null,
      comentarios: clip.url || clip.description || null,
      combustible: fuelLabel ? option(fuelLabel, vehicle.fuelValue ?? fuelLabel) : null,
      ccambios: gearLabel ? option(gearLabel, vehicle.transmissionValue ?? gearLabel) : null,
      itv: null,
      cita: null,
      local: null,
      carroceria: null,
      captacionAgreed: false,
      extras: null,
      estados: null,
      precio_preliminar_cd: null,
      precio_ofrecido_cd: null,
      precio_preliminar_gdv: null,
      precio_ofrecido_gdv: null,
      estimatedFinancedSalesPrice: null,
      estimatedCashSalesPrice: null,
    },
    agente: agentId,
    id_agente_modify: agentId,
    rol: roles,
    vehiculo: {
      marca_vehiculo: makeLabel
        ? option(makeLabel, vehicle.makeValue ?? makeLabel)
        : [],
      modelo: modelLabel
        ? option(modelLabel, vehicle.modelValue ?? modelLabel)
        : [],
      matriculacion: yearNum ? option(yearNum, yearNum) : [],
      combustible: fuelLabel
        ? option(fuelLabel, vehicle.fuelValue ?? fuelLabel)
        : [],
      ccambios: gearLabel
        ? option(gearLabel, vehicle.transmissionValue ?? gearLabel)
        : [],
      carroceria: [],
      version: clip.model
        ? [{ value: clip.model, label: clip.model, id: '' }]
        : [],
      jato: false,
      id_jato: null,
      vehicleType: 'passenger',
      modify: false,
    },
    extras: '[]',
    estados: [],
    precio_nuevo: null,
    precio_final: null,
    id_local_actual: localId || HAR_DEFAULTS.id_local_actual,
  };
}

/**
 * Pick first stock option matching needle (case-insensitive), or null.
 * Stock rows are typically `{ label, value }`.
 * @param {unknown} list
 * @param {string} [needle]
 */
export function pickStockOption(list, needle = '') {
  const rows = Array.isArray(list) ? list : [];
  const normalized = String(needle || '')
    .trim()
    .toLowerCase();
  if (!normalized) return null;

  const labelOf = (row) =>
    String(row?.label ?? row?.nombre ?? row?.name ?? '').trim();
  const valueOf = (row) => row?.value ?? row?.id;

  const exact = rows.find((row) => labelOf(row).toLowerCase() === normalized);
  if (exact) {
    return { label: labelOf(exact), value: valueOf(exact) };
  }

  const partial = rows.find((row) => {
    const label = labelOf(row).toLowerCase();
    return label.includes(normalized) || normalized.includes(label);
  });
  if (partial) {
    return { label: labelOf(partial), value: valueOf(partial) };
  }
  return null;
}

/**
 * Expand known clipper make abbreviations to catalog / select labels.
 * @param {string} make
 * @returns {string} canonical label, or '' if no alias
 */
export function expandMakeAlias(make) {
  const m = String(make || '').trim().toLowerCase();
  if (m === 'vw') return 'Volkswagen';
  return '';
}

/**
 * Resolve clip make/model/fuel/gear against Flexicar stock catalog IDs.
 * Without numeric `value`s the CRM create may persist text but the lead form
 * will not show Marca/Modelo selected (same class of bug as LeadDesk selects).
 * @param {import('../../src/clipboard/lead-clip.js').LeadClipPayload} clip
 * @param {(path: string, query?: Record<string, string>) => Promise<unknown[]>} fetchStock
 */
export async function resolveVehicleFromStock(clip, fetchStock) {
  /** @type {Record<string, string|number>} */
  const vehicle = {};
  if (!clip?.make || typeof fetchStock !== 'function') return vehicle;

  const makes = await fetchStock('makes');
  const make =
    pickStockOption(makes, clip.make) ||
    pickStockOption(makes, expandMakeAlias(clip.make));
  if (!make) return vehicle;

  vehicle.makeLabel = make.label;
  vehicle.makeValue = make.value;

  if (clip.model) {
    const models = await fetchStock('models', {
      makeId: String(make.value),
    });
    const model = pickStockOption(models, clip.model);
    if (model) {
      vehicle.modelLabel = model.label;
      vehicle.modelValue = model.value;

      const year = String(clip.year || '').trim();
      if (year) {
        const fuelNeedle = normalizeFuel(clip.fuel);
        if (fuelNeedle) {
          const fuels = await fetchStock('fuels', {
            makeId: String(make.value),
            modelId: String(model.value),
            year,
          });
          const fuel = pickStockOption(fuels, fuelNeedle);
          if (fuel) {
            vehicle.fuelLabel = fuel.label;
            vehicle.fuelValue = fuel.value;

            const gearNeedle = normalizeTransmission(clip.transmission);
            if (gearNeedle) {
              const gears = await fetchStock('transmissions', {
                makeId: String(make.value),
                modelId: String(model.value),
                year,
                fuelId: String(fuel.value),
              });
              const gear = pickStockOption(gears, gearNeedle);
              if (gear) {
                vehicle.transmissionLabel = gear.label;
                vehicle.transmissionValue = gear.value;
              }
            }
          }
        }
      }
    }
  }

  return vehicle;
}

/**
 * @param {string} fuel
 */
function normalizeFuel(fuel) {
  const f = String(fuel || '').toLowerCase();
  if (!f) return '';
  if (f.includes('diesel') || f.includes('gasóleo') || f.includes('gasoleo')) {
    return 'Diesel';
  }
  if (f.includes('híbrid') || f.includes('hybrid')) return 'Híbrido';
  if (f.includes('elétr') || f.includes('electr')) return 'Elétrico';
  if (f.includes('gpl') || f.includes('lpg')) return 'GPL';
  if (f.includes('gasol')) return 'Gasolina';
  return String(fuel);
}

/**
 * @param {string} transmission
 */
function normalizeTransmission(transmission) {
  const t = String(transmission || '').toLowerCase();
  if (!t) return '';
  if (t.includes('auto')) return 'Automática';
  if (t.includes('manual')) return 'Manual';
  return String(transmission);
}

export {
  digitsOnly,
  normalizePlate,
  pickFiltro,
  normalizeFuel,
  normalizeTransmission,
};
