/**
 * Minimal History API router for LeadDesk SPA under /crm.
 */

const BASE = '/crm';

/**
 * @typedef {{ name: string, params: Record<string, string> }} RouteMatch
 */

/**
 * @param {string} pathname
 * @returns {RouteMatch}
 */
export function matchRoute(pathname) {
  let path = pathname || '/';
  if (path.startsWith(BASE)) {
    path = path.slice(BASE.length) || '/';
  }
  if (!path.startsWith('/')) path = `/${path}`;
  // strip trailing slash except root
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);

  if (path === '/' || path === '/leads' || path === '/leads/list') {
    return { name: 'list', params: {} };
  }
  if (path === '/leads/new') {
    return { name: 'new', params: {} };
  }
  if (path === '/leads/add') {
    return { name: 'add', params: {} };
  }
  const leadMatch = path.match(/^\/leads\/([^/]+)$/);
  if (leadMatch) {
    return { name: 'lead', params: { id: decodeURIComponent(leadMatch[1]) } };
  }
  return { name: 'list', params: {} };
}

/**
 * @param {string} path relative to /crm, e.g. "/leads/123"
 * @param {{ replace?: boolean }} [opts]
 */
export function navigate(path, opts = {}) {
  const url = path.startsWith(BASE) ? path : `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
  if (opts.replace) {
    history.replaceState({}, '', url);
  } else {
    history.pushState({}, '', url);
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/**
 * @param {(route: RouteMatch) => void} handler
 */
export function startRouter(handler) {
  const run = () => handler(matchRoute(location.pathname));
  window.addEventListener('popstate', run);
  run();
}

export { BASE };
