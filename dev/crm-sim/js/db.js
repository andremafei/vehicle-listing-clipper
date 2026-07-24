/**
 * LeadDesk local IndexedDB — clients + leads.
 * Data stays in the browser only.
 */

const DB_NAME = 'LeadDeskDB';
const DB_VERSION = 1;
const SEED_FLAG_KEY = 'leaddesk-seeded-v1';

/** @type {IDBDatabase | null} */
let dbPromise = null;

/**
 * Normalize Portuguese plate for lookup (uppercase, no spaces/dashes).
 * @param {string} value
 */
export function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[\s\-.]/g, '');
}

/**
 * Keep digits only for phone lookup.
 * @param {string} value
 */
export function normalizePhone(value) {
  return String(value || '').replace(/\D/g, '');
}

/**
 * Heuristic: mostly letters → plate; mostly digits → phone.
 * @param {string} raw
 * @returns {{ kind: 'plate' | 'phone', value: string, display: string }}
 */
export function classifyQuery(raw) {
  const trimmed = String(raw || '').trim();
  const digits = normalizePhone(trimmed);
  const plate = normalizePlate(trimmed);
  const letterCount = (trimmed.match(/[A-Za-z]/g) || []).length;

  if (letterCount > 0 && plate.length >= 4) {
    return { kind: 'plate', value: plate, display: trimmed.toUpperCase() };
  }
  if (digits.length >= 9) {
    return { kind: 'phone', value: digits, display: digits };
  }
  // Fallback: if any letters treat as plate, else phone
  if (letterCount > 0) {
    return { kind: 'plate', value: plate, display: trimmed.toUpperCase() };
  }
  return { kind: 'phone', value: digits || trimmed, display: trimmed };
}

/**
 * @returns {Promise<IDBDatabase>}
 */
export function openDb() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains('clients')) {
        const clients = db.createObjectStore('clients', { keyPath: 'id' });
        clients.createIndex('phone', 'phoneNormalized', { unique: false });
      }

      if (!db.objectStoreNames.contains('leads')) {
        const leads = db.createObjectStore('leads', { keyPath: 'id' });
        leads.createIndex('plate', 'plateNormalized', { unique: false });
        leads.createIndex('phone', 'phoneNormalized', { unique: false });
        leads.createIndex('clientId', 'clientId', { unique: false });
        leads.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

/**
 * @template T
 * @param {string} storeName
 * @param {IDBTransactionMode} mode
 * @param {(store: IDBObjectStore) => IDBRequest | Promise<T>} fn
 * @returns {Promise<T>}
 */
async function withStore(storeName, mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    let result;

    try {
      result = fn(store);
    } catch (err) {
      reject(err);
      return;
    }

    if (result && typeof result.then === 'function') {
      result.then(
        (value) => {
          tx.oncomplete = () => resolve(value);
        },
        reject,
      );
      tx.onerror = () => reject(tx.error);
      return;
    }

    /** @type {IDBRequest} */
    const req = /** @type {IDBRequest} */ (result);
    req.onsuccess = () => {
      resolve(/** @type {T} */ (req.result));
    };
    req.onerror = () => reject(req.error);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * @param {string} id
 */
export async function getClient(id) {
  return withStore('clients', 'readonly', (store) => store.get(id));
}

/**
 * @param {string} id
 */
export async function getLead(id) {
  return withStore('leads', 'readonly', (store) => store.get(id));
}

/**
 * @param {string} plateNormalized
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

/**
 * All leads, newest updates first.
 * @returns {Promise<object[]>}
 */
export async function getAllLeads() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('leads', 'readonly');
    const req = tx.objectStore('leads').getAll();
    req.onsuccess = () => {
      const rows = /** @type {object[]} */ (req.result || []);
      rows.sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));
      resolve(rows);
    };
    req.onerror = () => reject(req.error);
  });
}

/**
 * Filter leads by plate and/or phone substring (partial match).
 * Empty query returns all leads.
 * @param {string} query
 * @returns {Promise<object[]>}
 */
export async function searchLeads(query) {
  const all = await getAllLeads();
  const trimmed = String(query || '').trim();
  if (!trimmed) return all;

  const plateQ = normalizePlate(trimmed);
  const phoneQ = normalizePhone(trimmed);

  return all.filter((lead) => {
    const plate = String(lead.plateNormalized || normalizePlate(lead.plate) || '');
    const phone = String(lead.phoneNormalized || normalizePhone(lead.phone) || '');
    if (plateQ && plate.includes(plateQ)) return true;
    if (phoneQ && phone.includes(phoneQ)) return true;
    return false;
  });
}

/**
 * Persist client + lead in one transaction. Returns the lead id.
 * @param {object} client
 * @param {object} lead
 */
export async function saveClientAndLead(client, lead) {
  const db = await openDb();
  const now = new Date().toISOString();

  const clientRecord = {
    ...client,
    phoneNormalized: normalizePhone(client.phone),
    updatedAt: now,
    createdAt: client.createdAt || now,
  };

  const leadRecord = {
    ...lead,
    clientId: clientRecord.id,
    plateNormalized: normalizePlate(lead.plate),
    phoneNormalized: normalizePhone(lead.phone || client.phone),
    updatedAt: now,
    createdAt: lead.createdAt || now,
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['clients', 'leads'], 'readwrite');
    tx.objectStore('clients').put(clientRecord);
    tx.objectStore('leads').put(leadRecord);
    tx.oncomplete = () => resolve(leadRecord.id);
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Update an existing lead (and optionally its client contact fields).
 * @param {object} client
 * @param {object} lead
 */
export async function updateClientAndLead(client, lead) {
  return saveClientAndLead(client, lead);
}

/**
 * Delete a lead. If its client has no remaining leads, delete the client too.
 * @param {string} id
 * @returns {Promise<boolean>} true if a lead was deleted
 */
export async function deleteLead(id) {
  const lead = await getLead(id);
  if (!lead) return false;

  const db = await openDb();
  const clientId = lead.clientId;

  return new Promise((resolve, reject) => {
    const tx = db.transaction(['clients', 'leads'], 'readwrite');
    const leadStore = tx.objectStore('leads');
    const clientStore = tx.objectStore('clients');

    const finish = (shouldDeleteClient) => {
      leadStore.delete(id);
      if (shouldDeleteClient && clientId) {
        clientStore.delete(clientId);
      }
    };

    if (!clientId) {
      finish(false);
    } else {
      const req = leadStore.index('clientId').getAll(clientId);
      req.onsuccess = () => {
        const siblings = /** @type {object[]} */ (req.result || []);
        const others = siblings.filter((row) => row.id !== id);
        finish(others.length === 0);
      };
      req.onerror = () => reject(req.error);
    }

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export { newId };

/**
 * Seed sample leads once per browser profile (localStorage flag).
 */
export async function ensureSeedData() {
  if (localStorage.getItem(SEED_FLAG_KEY) === '1') {
    await openDb();
    return;
  }

  const db = await openDb();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const clients = [
    {
      id: 'client_seed_1',
      firstName: 'Bruno',
      firstSurname: 'Ricardo',
      secondSurname: '',
      phone: '931636999',
      otherContact: '',
      email: 'bruno.ricardo@example.com',
      province: 'Lisboa',
      municipality: 'Lisboa',
      acceptTerms: true,
      acceptMarketing: false,
      phoneNormalized: '931636999',
      createdAt: new Date(now - 10 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      id: 'client_seed_2',
      firstName: 'Ana',
      firstSurname: 'Silva',
      secondSurname: 'Costa',
      phone: '912345678',
      otherContact: '',
      email: 'ana.silva@example.com',
      province: 'Porto',
      municipality: 'Porto',
      acceptTerms: true,
      acceptMarketing: true,
      phoneNormalized: '912345678',
      createdAt: new Date(now - 20 * day).toISOString(),
      updatedAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: 'client_seed_3',
      firstName: 'Miguel',
      firstSurname: 'Santos',
      secondSurname: '',
      phone: '963852741',
      otherContact: '210000111',
      email: '',
      province: 'Setúbal',
      municipality: 'Almada',
      acceptTerms: true,
      acceptMarketing: false,
      phoneNormalized: '963852741',
      createdAt: new Date(now - 30 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
  ];

  /** Two leads share plate BC39VF (different phones); two share phone 931636999 (different plates). */
  const leads = [
    {
      id: 'lead_seed_1',
      clientId: 'client_seed_1',
      plate: 'BC39VF',
      plateNormalized: 'BC39VF',
      phone: '931636999',
      phoneNormalized: '931636999',
      fullName: 'Bruno',
      firstSurname: 'Ricardo',
      secondSurname: '',
      otherContact: '',
      email: 'bruno.ricardo@example.com',
      province: 'Lisboa',
      municipality: 'Lisboa',
      acceptTerms: true,
      acceptMarketing: false,
      leadStatus: 'Novo',
      leadOrigin: 'Portal',
      contactMethod: 'Whatsapp',
      branch: 'Lisboa',
      commercialBrand: 'LeadDesk',
      portal: 'OLX',
      adId: 'ID123456',
      publicationDate: '2026-07-10',
      extractionDate: '2026-07-15',
      adDescription: 'Citroën C4 X em bom estado.',
      make: 'CITROËN',
      model: 'C4 X',
      year: '2022',
      fuel: 'Gasolina',
      transmission: 'Manual',
      bodyType: 'Sedan',
      version: 'Feel',
      mileageKm: '24500',
      chassis: '',
      imported: false,
      itvDate: '',
      engine: '1.2',
      powerCv: '130',
      customerValueEur: '24449',
      comments: '',
      createdAt: new Date(now - 10 * day).toISOString(),
      updatedAt: new Date(now - 2 * day).toISOString(),
    },
    {
      id: 'lead_seed_2',
      clientId: 'client_seed_2',
      plate: 'BC39VF',
      plateNormalized: 'BC39VF',
      phone: '912345678',
      phoneNormalized: '912345678',
      fullName: 'Ana',
      firstSurname: 'Silva',
      secondSurname: 'Costa',
      otherContact: '',
      email: 'ana.silva@example.com',
      province: 'Porto',
      municipality: 'Porto',
      acceptTerms: true,
      acceptMarketing: true,
      leadStatus: 'Em contacto',
      leadOrigin: 'Standvirtual',
      contactMethod: 'Telefone',
      branch: 'Porto',
      commercialBrand: 'LeadDesk',
      portal: 'Standvirtual',
      adId: 'SV998877',
      publicationDate: '2026-06-01',
      extractionDate: '2026-06-20',
      adDescription: 'Mesma matrícula, outro contacto.',
      make: 'CITROËN',
      model: 'C4 X',
      year: '2022',
      fuel: 'Gasolina',
      transmission: 'Manual',
      bodyType: 'Sedan',
      version: 'Feel',
      mileageKm: '26000',
      chassis: '',
      imported: false,
      itvDate: '',
      engine: '1.2',
      powerCv: '130',
      customerValueEur: '23900',
      comments: 'Lead anterior na mesma placa.',
      createdAt: new Date(now - 20 * day).toISOString(),
      updatedAt: new Date(now - 5 * day).toISOString(),
    },
    {
      id: 'lead_seed_3',
      clientId: 'client_seed_1',
      plate: 'AA00BB',
      plateNormalized: 'AA00BB',
      phone: '931636999',
      phoneNormalized: '931636999',
      fullName: 'Bruno',
      firstSurname: 'Ricardo',
      secondSurname: '',
      otherContact: '',
      email: 'bruno.ricardo@example.com',
      province: 'Lisboa',
      municipality: 'Lisboa',
      acceptTerms: true,
      acceptMarketing: false,
      leadStatus: 'Avaliado',
      leadOrigin: 'Portal',
      contactMethod: 'Email',
      branch: 'Lisboa',
      commercialBrand: 'LeadDesk',
      portal: 'OLX',
      adId: 'ID654321',
      publicationDate: '2026-05-12',
      extractionDate: '2026-05-18',
      adDescription: 'Renault Captur diesel.',
      make: 'Renault',
      model: 'Captur',
      year: '2017',
      fuel: 'Diesel',
      transmission: 'Manual',
      bodyType: 'Citadino',
      version: 'Intens',
      mileageKm: '98000',
      chassis: '',
      imported: false,
      itvDate: '2026-11-01',
      engine: '1.5',
      powerCv: '110',
      customerValueEur: '12490',
      comments: '',
      createdAt: new Date(now - 40 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
    {
      id: 'lead_seed_4',
      clientId: 'client_seed_3',
      plate: 'CD12EF',
      plateNormalized: 'CD12EF',
      phone: '963852741',
      phoneNormalized: '963852741',
      fullName: 'Miguel',
      firstSurname: 'Santos',
      secondSurname: '',
      otherContact: '210000111',
      email: '',
      province: 'Setúbal',
      municipality: 'Almada',
      acceptTerms: true,
      acceptMarketing: false,
      leadStatus: 'Novo',
      leadOrigin: 'Referência',
      contactMethod: 'Whatsapp',
      branch: 'Setúbal',
      commercialBrand: 'LeadDesk',
      portal: '',
      adId: '',
      publicationDate: '',
      extractionDate: '',
      adDescription: '',
      make: 'Peugeot',
      model: '208',
      year: '2019',
      fuel: 'Gasolina',
      transmission: 'Manual',
      bodyType: 'Citadino',
      version: 'Active',
      mileageKm: '42000',
      chassis: '',
      imported: true,
      itvDate: '',
      engine: '1.2',
      powerCv: '100',
      customerValueEur: '11500',
      comments: '',
      createdAt: new Date(now - 30 * day).toISOString(),
      updatedAt: new Date(now - 1 * day).toISOString(),
    },
  ];

  await new Promise((resolve, reject) => {
    const tx = db.transaction(['clients', 'leads'], 'readwrite');
    const clientStore = tx.objectStore('clients');
    const leadStore = tx.objectStore('leads');
    for (const c of clients) clientStore.put(c);
    for (const l of leads) leadStore.put(l);
    tx.oncomplete = () => resolve(undefined);
    tx.onerror = () => reject(tx.error);
  });

  localStorage.setItem(SEED_FLAG_KEY, '1');
}
