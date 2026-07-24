/**
 * LeadDesk IndexedDB access for local CRM panel testing (no CRM HTML changes).
 */

const DB_NAME = 'LeadDeskDB';

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
  const phone = normalizePhone(clip.phone);
  const plate = normalizePlate(clip.plate);
  const clientId = newId('client');
  const leadId = newId('lead');
  const nameParts = String(clip.clientName || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  const firstName = nameParts[0] || 'Lead';
  const firstSurname = nameParts[1] || 'Anúncio';
  const secondSurname =
    nameParts.length > 2 ? nameParts.slice(2).join(' ') : '';

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
    make: clip.make || '',
    model: clip.model || '',
    year: clip.year || '',
    fuel: clip.fuel || '',
    transmission: clip.transmission || '',
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
