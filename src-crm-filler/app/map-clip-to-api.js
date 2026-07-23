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
 * @param {import('../../src/clipboard/lead-clip.js').LeadClipPayload} clip
 */
export function buildCreateClientBody(clip) {
  const phone = digitsOnly(clip.phone);
  const title = String(clip.title || '').trim();
  const nameParts = title.split(/\s+/).filter(Boolean);
  return {
    name: nameParts[0] || 'Lead',
    firstSurname: nameParts[1] || 'Anúncio',
    secondSurname: null,
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
  const phone = digitsOnly(clip.phone);
  const plate = normalizePlate(clip.plate);
  const agentId = me?.id ?? 0;
  const roles = Array.isArray(me?.rolesId) ? me.rolesId : [6];
  const title = String(clip.title || '').trim();
  const nameParts = title.split(/\s+/).filter(Boolean);

  const estado = filters.estado || HAR_DEFAULTS.estado;
  const origen = filters.origen || HAR_DEFAULTS.origen;
  const forma = filters.contacto || HAR_DEFAULTS.forma_contacto;
  const marcaComercial = filters.marca || HAR_DEFAULTS.marca_comercial;

  const km = Number(String(clip.mileageKm || '').replace(/\D/g, '')) || 0;
  const priceRaw = String(clip.customerValueEur || '').replace(/[^\d.,]/g, '');
  const buscado = Number(priceRaw.replace(',', '.')) || null;

  const makeLabel = clip.make || vehicle.makeLabel || '';
  const modelLabel = clip.model || vehicle.modelLabel || '';
  const yearNum = Number(clip.year) || null;
  const fuelLabel = normalizeFuel(clip.fuel);
  const gearLabel = normalizeTransmission(clip.transmission);

  return {
    data: {
      toggle: false,
      nombre: nameParts[0] || 'Lead',
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
      apellido1: nameParts[1] || 'Anúncio',
      apellido2: null,
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

export { digitsOnly, normalizePlate, pickFiltro };
