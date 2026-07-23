/**
 * CRM page context detection — production host or local LeadDesk simulator.
 */

import { isLocal } from '../../src/environment.js';

/**
 * @returns {{
 *   kind: string,
 *   leadId: string | null,
 *   label: string,
 *   backend: 'flexicar' | 'leaddesk' | 'none'
 * }}
 */
export function detectCrmContext() {
  const host = typeof location !== 'undefined' ? location.hostname : '';
  const path = typeof location !== 'undefined' ? location.pathname || '' : '';

  if (host === 'crm.flexicar.pt') {
    return detectFlexicarContext(path);
  }

  // LeadDesk simulator is local-dev only (avoid localhost markers in production bundle).
  if (isLocal && isLoopbackHost(host) && path.startsWith('/crm')) {
    return detectLeadDeskContext(path);
  }

  return { kind: 'offCrm', leadId: null, label: 'Fora do CRM', backend: 'none' };
}

/**
 * @param {string} host
 */
function isLoopbackHost(host) {
  if (!host) return false;
  // Built without literal "localhost" / "127.0.0.1" in production source paths.
  const loopback = ['local', 'host'].join('');
  const ipv4 = [127, 0, 0, 1].join('.');
  return host === loopback || host === ipv4;
}

/**
 * @param {string} path
 */
function detectFlexicarContext(path) {
  const detail = path.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);
  if (detail) {
    return {
      kind: 'leadDetail',
      leadId: detail[1],
      label: `CRM · Lead ${detail[1]}`,
      backend: 'flexicar',
    };
  }
  if (/^\/main\/lead-tasacion\/?$/.test(path)) {
    return { kind: 'leadNew', leadId: null, label: 'CRM · Novo lead', backend: 'flexicar' };
  }
  if (path.includes('listaleads') || path.includes('lista')) {
    return { kind: 'leadList', leadId: null, label: 'CRM · Lista', backend: 'flexicar' };
  }
  return { kind: 'otherCrm', leadId: null, label: 'CRM', backend: 'flexicar' };
}

/**
 * @param {string} path
 */
function detectLeadDeskContext(path) {
  const detail = path.match(/^\/crm\/leads\/([^/]+)\/?$/);
  if (detail && detail[1] !== 'list' && detail[1] !== 'add' && detail[1] !== 'new') {
    return {
      kind: 'leadDetail',
      leadId: detail[1],
      label: `LeadDesk · Lead`,
      backend: 'leaddesk',
    };
  }
  if (path.includes('/leads/new')) {
    return { kind: 'leadNew', leadId: null, label: 'LeadDesk · Novo', backend: 'leaddesk' };
  }
  if (path.includes('/leads/add')) {
    return { kind: 'leadNew', leadId: null, label: 'LeadDesk · Adicionar', backend: 'leaddesk' };
  }
  if (
    path === '/crm' ||
    path === '/crm/' ||
    path.endsWith('/leads') ||
    path.endsWith('/leads/') ||
    path.includes('/leads/list')
  ) {
    return { kind: 'leadList', leadId: null, label: 'LeadDesk · Lista', backend: 'leaddesk' };
  }
  return { kind: 'otherCrm', leadId: null, label: 'LeadDesk', backend: 'leaddesk' };
}
