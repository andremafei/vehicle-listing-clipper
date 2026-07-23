/**
 * Same-origin CRM API helpers (authenticated session cookies).
 */

const API = '/api';

/**
 * @param {string} path
 * @param {RequestInit} [init]
 */
async function api(path, init = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

export async function getAuthMe() {
  return api(`${API}/auth/me`);
}

export async function getUserLocal() {
  return api(`${API}/get_user_local`);
}

/**
 * @param {{ phone?: string, plate?: string }} query
 */
export async function findLeadClients(query) {
  const params = new URLSearchParams();
  if (query.phone) params.set('phone', query.phone);
  if (query.plate) params.set('plate', query.plate);
  return api(`${API}/lead-clients?${params.toString()}`);
}

/**
 * @param {number|string} clientId
 */
export async function getPurchaseLeadsForClient(clientId) {
  return api(`${API}/purchase-leads/clients/${clientId}?page=1`);
}

/**
 * @param {object} body
 */
export async function createLeadClient(body) {
  return api(`${API}/lead-clients`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @param {object} body
 */
export async function createLeadCompra(body) {
  return api(`${API}/create_lead_compra`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * @param {string} queryName
 * @param {number|null} [agentId]
 */
export async function fetchFiltro(queryName, agentId = null) {
  return api(`${API}/filtros`, {
    method: 'POST',
    body: JSON.stringify({
      dataCall: { data_query: queryName, data_call: agentId },
    }),
  });
}

/**
 * Best-effort match of a label in stock catalog.
 * @param {string} pathSuffix
 * @param {Record<string, string>} [query]
 */
export async function fetchStockOptions(pathSuffix, query = {}) {
  const params = new URLSearchParams({
    mode: 'MANUAL',
    vehicleType: 'passenger',
    ...query,
  });
  const url = `https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${pathSuffix}?${params}`;
  try {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data?.data || data?.results || [];
  } catch {
    return [];
  }
}
