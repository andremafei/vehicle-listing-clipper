/**
 * LeadDesk IndexedDB access for local CRM panel testing (no CRM HTML changes).
 */

import { resolveClipPhone, splitClientName } from './map-clip-to-api.js';

const DB_NAME = 'LeadDeskDB';

/** Keep in sync with `dev/crm-sim/js/views.js` select options. */
const MAKES = [
  'Audi',
  'BMW',
  'BYD',
  'Citroën',
  'Cupra',
  'Dacia',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Jeep',
  'Kia',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Porsche',
  'Renault',
  'Seat',
  'Skoda',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];
const FUELS = ['Gasolina', 'Diesel', 'Híbrido', 'Elétrico', 'GPL', 'Outro'];
const TRANSMISSIONS = ['Manual', 'Automática'];

/**
 * Map clipper UPPERCASE values onto LeadDesk select labels.
 * @param {string[]} options
 * @param {string} value
 * @param {(raw: string) => string} [semanticNormalize]
 */
function matchSelectOption(options, value, semanticNormalize) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const exact = options.find((opt) => opt === raw);
  if (exact) return exact;
  const lower = raw.toLowerCase();
  const hit = options.find((opt) => opt.toLowerCase() === lower);
  if (hit) return hit;
  if (semanticNormalize) {
    const normalized = semanticNormalize(raw);
    if (normalized && options.includes(normalized)) return normalized;
  }
  return raw;
}

/**
 * @param {string} fuel
 */
function normalizeFuelLabel(fuel) {
  const f = String(fuel || '').toLowerCase();
  if (!f) return '';
  if (f.includes('diesel') || f.includes('gasóleo') || f.includes('gasoleo')) return 'Diesel';
  if (f.includes('híbrid') || f.includes('hybrid')) return 'Híbrido';
  if (f.includes('elétr') || f.includes('electr')) return 'Elétrico';
  if (f.includes('gpl') || f.includes('lpg')) return 'GPL';
  if (f.includes('gasol')) return 'Gasolina';
  return '';
}

/**
 * @param {string} transmission
 */
function normalizeTransmissionLabel(transmission) {
  const t = String(transmission || '').toLowerCase();
  if (!t) return '';
  if (t.includes('auto')) return 'Automática';
  if (t.includes('manual')) return 'Manual';
  return '';
}

/**
 * @param {string} value
 */
export function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[\s\-.]/g, '');
}

/**
 * @param {string} value
 */
export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * @returns {Promise<IDBDatabase>}
 */
function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME);
    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
    request.onsuccess = () => resolve(request.result);
  });
}

/**
 * @param {string} plateNormalized
 * @returns {Promise<object[]>}
 */
export async function findLeadsByPlate(plateNormalized) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('leads', 'readonly');
    const index = tx.objectStore('leads').index('plate');
    const req = index.getAll(plateNormalized);
    req.onsuccess = () => {
      const rows = /** @type {object[]} */ (req.result || []);
      rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * @param {string} phoneNormalized
 * @returns {Promise<object[]>}
 */
export async function findLeadsByPhone(phoneNormalized) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('leads', 'readonly');
    const index = tx.objectStore('leads').index('phone');
    const req = index.getAll(phoneNormalized);
    req.onsuccess = () => {
      const rows = /** @type {object[]} */ (req.result || []);
      rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * @param {import('../../src/clipboard/lead-clip.js').LeadClipPayload} clip
 * @returns {Promise<string>} lead id
 */
export async function createLeadFromClip(clip) {
  const db = await openDb();
  const now = new Date().toISOString();
  const phone = resolveClipPhone(clip);
  const plate = normalizePlate(clip.plate);
  const clientId = newId('client');
  const leadId = newId('lead');
  const {
    name: firstName,
    firstSurname: surname1,
    secondSurname: surname2,
  } = splitClientName(clip.clientName);
  const firstSurname = surname1 || '';
  const secondSurname = surname2 || '';

  const client = {
    id: clientId,
    firstName,
    firstSurname,
    secondSurname,
    phone,
    otherContact: '',
    email: '',
    province: '',
    municipality: '',
    acceptTerms: false,
    acceptMarketing: false,
    phoneNormalized: phone,
    createdAt: now,
    updatedAt: now,
  };

  const lead = {
    id: leadId,
    clientId,
    plate,
    plateNormalized: plate,
    phone,
    phoneNormalized: phone,
    fullName: firstName,
    firstSurname,
    secondSurname,
    otherContact: '',
    email: '',
    province: '',
    municipality: '',
    acceptTerms: false,
    acceptMarketing: false,
    leadStatus: 'Novo',
    leadOrigin: clip.siteId === 'standvirtual-pt' ? 'Standvirtual' : 'OLX',
    contactMethod: 'Whatsapp',
    branch: 'Lisboa',
    commercialBrand: 'LeadDesk',
    portal: clip.siteId === 'standvirtual-pt' ? 'Standvirtual' : 'OLX',
    adId: '',
    publicationDate: '',
    extractionDate: '',
    adDescription: clip.description || clip.url || '',
    make: matchSelectOption(MAKES, clip.make || ''),
    model: clip.model || '',
    year: clip.year || '',
    fuel: matchSelectOption(FUELS, clip.fuel || '', normalizeFuelLabel),
    transmission: matchSelectOption(
      TRANSMISSIONS,
      clip.transmission || '',
      normalizeTransmissionLabel,
    ),
    bodyType: '',
    version: '',
    mileageKm: clip.mileageKm || '0',
    chassis: '',
    imported: false,
    itvDate: '',
    engine: clip.engine || '',
    powerCv: clip.powerCv || '',
    customerValueEur: clip.customerValueEur || '',
    comments: clip.url || '',
    createdAt: now,
    updatedAt: now,
  };

  await new Promise((resolve, reject) => {
    const tx = db.transaction(['clients', 'leads'], 'readwrite');
    tx.objectStore('clients').put(client);
    tx.objectStore('leads').put(lead);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });

  return leadId;
}
