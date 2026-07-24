/**
 * Listing record merge: extracted fields + ANPR + configurable defaults.
 */

/** @typedef {'extracted' | 'anpr' | 'default' | 'edited' | 'missing'} FieldOrigin */

/**
 * @typedef {object} ValuationDefaults
 * @property {string} paintParts
 * @property {string} bodyParts
 * @property {string} tires
 * @property {string} saleReason
 * @property {string} keyCount
 * @property {string} deductibleVat
 */

/** @type {ValuationDefaults} */
export const DEFAULT_VALUATION = {
  paintParts: 'OK',
  bodyParts: 'OK',
  tires: 'OK',
  saleReason: 'VENDA',
  keyCount: '2',
  deductibleVat: 'NÃO',
};

/**
 * Flat field keys used by the form and clipboard template.
 * @typedef {object} ListingFields
 * @property {string} plate
 * @property {string} clientName
 * @property {string} make
 * @property {string} model
 * @property {string} year
 * @property {string} mileageKm
 * @property {string} transmission
 * @property {string} fuel
 * @property {string} engine
 * @property {string} powerCv
 * @property {string} paintParts
 * @property {string} bodyParts
 * @property {string} tires
 * @property {string} customerValueEur
 * @property {string} saleReason
 * @property {string} keyCount
 * @property {string} deductibleVat
 * @property {string} url
 */

/** Ordered form / clipboard field ids. */
export const LISTING_FIELD_IDS = [
  'plate',
  'clientName',
  'make',
  'model',
  'year',
  'mileageKm',
  'transmission',
  'fuel',
  'engine',
  'powerCv',
  'paintParts',
  'bodyParts',
  'tires',
  'customerValueEur',
  'saleReason',
  'keyCount',
  'deductibleVat',
  'url',
];

/** Portuguese labels for the clipboard template and form. */
export const LISTING_FIELD_LABELS = {
  plate: 'Matrícula',
  clientName: 'Nome cliente',
  make: 'Marca',
  model: 'Modelo',
  year: 'Ano',
  mileageKm: 'Km',
  transmission: 'Tipo caixa',
  fuel: 'Combustivel',
  engine: 'Motor',
  powerCv: 'Potencia',
  paintParts: 'Peças Pintura',
  bodyParts: 'Peças Chapa',
  tires: 'Pneus',
  customerValueEur: 'Valor cliente',
  saleReason: 'Razão venda',
  keyCount: 'Numero de Chaves',
  deductibleVat: 'Iva dedutivel',
  url: 'URL',
};

/** Manual valuation field ids (defaults / settings). */
export const DEFAULTABLE_FIELD_IDS = [
  'paintParts',
  'bodyParts',
  'tires',
  'saleReason',
  'keyCount',
  'deductibleVat',
];

/**
 * @returns {ListingFields}
 */
export function emptyListingFields() {
  return {
    plate: '',
    make: '',
    model: '',
    year: '',
    mileageKm: '',
    transmission: '',
    fuel: '',
    engine: '',
    powerCv: '',
    paintParts: '',
    bodyParts: '',
    tires: '',
    customerValueEur: '',
    saleReason: '',
    keyCount: '',
    deductibleVat: '',
    url: '',
  };
}

/**
 * @param {Partial<ValuationDefaults>} [overrides]
 * @returns {ValuationDefaults}
 */
export function resolveDefaults(overrides = {}) {
  return {
    ...DEFAULT_VALUATION,
    ...overrides,
  };
}

/**
 * Build a listing record from extract + plate + defaults.
 * @param {{
 *   extracted?: Partial<import('../adapters/olx-pt/extract.js').ExtractedListing> | null,
 *   plate?: string | null,
 *   defaults?: Partial<ValuationDefaults>,
 * }} [input]
 */
export function createListingRecord({
  extracted = null,
  plate = '',
  defaults = {},
} = {}) {
  const vals = resolveDefaults(defaults);
  const fields = emptyListingFields();
  /** @type {Record<string, FieldOrigin>} */
  const origins = {};
  /** @type {string[]} */
  const extractedFields = [];
  /** @type {string[]} */
  const defaultedFields = [];
  /** @type {string[]} */
  const editedFields = [];
  /** @type {string[]} */
  const warnings = [...(extracted?.warnings || [])];

  /**
   * @param {keyof ListingFields} key
   * @param {string} value
   * @param {FieldOrigin} origin
   */
  function setField(key, value, origin) {
    const v = value == null ? '' : String(value);
    fields[key] = v;
    if (!v) {
      origins[key] = 'missing';
      return;
    }
    origins[key] = origin;
    if (origin === 'extracted' || origin === 'anpr') {
      extractedFields.push(key);
    } else if (origin === 'default') {
      defaultedFields.push(key);
    }
  }

  const plateValue = plate ? String(plate).trim() : '';
  setField('plate', plateValue, plateValue ? 'anpr' : 'missing');

  const clientNameValue = extracted?.clientName
    ? String(extracted.clientName).trim()
    : '';
  setField(
    'clientName',
    clientNameValue,
    clientNameValue ? 'extracted' : 'missing',
  );

  setField('make', extracted?.make || '', extracted?.make ? 'extracted' : 'missing');
  setField(
    'model',
    extracted?.model || '',
    extracted?.model ? 'extracted' : 'missing',
  );
  setField('year', extracted?.year || '', extracted?.year ? 'extracted' : 'missing');
  setField(
    'mileageKm',
    extracted?.mileageKm || '',
    extracted?.mileageKm ? 'extracted' : 'missing',
  );
  setField(
    'transmission',
    extracted?.transmission || '',
    extracted?.transmission ? 'extracted' : 'missing',
  );
  setField('fuel', extracted?.fuel || '', extracted?.fuel ? 'extracted' : 'missing');
  setField(
    'engine',
    extracted?.engine || '',
    extracted?.engine ? 'extracted' : 'missing',
  );
  setField(
    'powerCv',
    extracted?.powerCv || '',
    extracted?.powerCv ? 'extracted' : 'missing',
  );
  setField(
    'customerValueEur',
    extracted?.priceEur || '',
    extracted?.priceEur ? 'extracted' : 'missing',
  );
  setField('url', extracted?.url || '', extracted?.url ? 'extracted' : 'missing');

  setField('paintParts', vals.paintParts, 'default');
  setField('bodyParts', vals.bodyParts, 'default');
  setField('tires', vals.tires, 'default');
  setField('saleReason', vals.saleReason, 'default');
  setField('keyCount', vals.keyCount, 'default');
  setField('deductibleVat', vals.deductibleVat, 'default');

  return {
    source: {
      siteId: extracted?.siteId || 'olx-pt',
      url: fields.url,
      listingId: extracted?.listingId || '',
      title: extracted?.title || '',
      description: extracted?.description || '',
      clientName: fields.clientName || extracted?.clientName || '',
    },
    fields,
    origins,
    metadata: {
      extractedFields: [...new Set(extractedFields)],
      defaultedFields: [...new Set(defaultedFields)],
      editedFields,
      warnings,
    },
  };
}

/**
 * Whether a listing has contact or vehicle signal worth copying/caching.
 * URL-only (and valuation defaults) do not count — error pages often still have a URL.
 * @param {ReturnType<typeof createListingRecord> | null | undefined} record
 * @param {{ plate?: string | null, phone?: string | null }} [parts]
 * @returns {boolean}
 */
export function hasUsefulListingData(record, parts = {}) {
  if (String(parts.plate || '').trim() || String(parts.phone || '').trim()) {
    return true;
  }
  if (!record) {
    return false;
  }
  const plate = String(record.fields?.plate || '').trim();
  if (plate) {
    return true;
  }
  const extracted = record.metadata?.extractedFields || [];
  return extracted.some((key) => key && key !== 'url');
}

/**
 * Apply a user edit to a listing record (immutable).
 * @param {ReturnType<typeof createListingRecord>} record
 * @param {keyof ListingFields} fieldId
 * @param {string} value
 */
export function applyListingEdit(record, fieldId, value) {
  const nextValue = value == null ? '' : String(value);
  const fields = { ...record.fields, [fieldId]: nextValue };
  const origins = {
    ...record.origins,
    [fieldId]: nextValue ? 'edited' : 'missing',
  };
  const editedFields = [
    ...new Set([...(record.metadata.editedFields || []), fieldId]),
  ];
  return {
    ...record,
    fields,
    origins,
    source: {
      ...record.source,
      url: fieldId === 'url' ? nextValue : record.source.url,
      clientName:
        fieldId === 'clientName' ? nextValue : record.source.clientName,
    },
    metadata: {
      ...record.metadata,
      editedFields,
    },
  };
}
