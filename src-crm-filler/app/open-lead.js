/**
 * Open CRM lead detail pages in a new tab.
 * After async work, browsers often block window.open — reserve the tab
 * during the user gesture, then navigate it when the lead id is known.
 */

/**
 * @typedef {{
 *   open?: typeof window.open,
 *   assign?: (url: string) => void,
 *   origin?: string,
 * }} OpenLeadDeps
 */

/**
 * @param {string} path Absolute path on the current origin
 * @param {OpenLeadDeps} [deps]
 * @returns {'new-tab' | 'same-tab'}
 */
export function openLeadInNewTab(path, deps = {}) {
  const open = deps.open || ((...args) => window.open(...args));
  const assign = deps.assign || ((url) => location.assign(url));
  const origin = deps.origin || location.origin;
  const url = new URL(path, origin).href;
  const win = open(url, '_blank');
  if (win) {
    try {
      win.opener = null;
    } catch {
      /* ignore */
    }
    return 'new-tab';
  }
  assign(path);
  return 'same-tab';
}

/**
 * Open about:blank immediately (user gesture), then go(path) after create.
 * @param {OpenLeadDeps} [deps]
 * @returns {{ go: (path: string) => 'new-tab' | 'same-tab', cancel: () => void }}
 */
export function reserveLeadTab(deps = {}) {
  const open = deps.open || ((...args) => window.open(...args));
  const assign = deps.assign || ((url) => location.assign(url));
  const origin = deps.origin || location.origin;

  const win = open('about:blank', '_blank');
  if (win) {
    try {
      win.opener = null;
    } catch {
      /* ignore */
    }
  }

  return {
    /**
     * @param {string} path
     * @returns {'new-tab' | 'same-tab'}
     */
    go(path) {
      const url = new URL(path, origin).href;
      if (win && !win.closed) {
        win.location.href = url;
        return 'new-tab';
      }
      assign(path);
      return 'same-tab';
    },
    cancel() {
      try {
        win?.close();
      } catch {
        /* ignore */
      }
    },
  };
}

/**
 * After a successful create that opened a new tab, reload this page so the
 * leads list reflects the new lead. Same-tab fallback skips reload (already navigating).
 * @param {'new-tab' | 'same-tab'} mode
 * @param {string|number} leadId
 * @param {{ setStatus?: (message: string, tone?: string) => void } | null} panelApi
 * @param {() => void} [reload]
 */
export function finishCreateInNewTab(mode, leadId, panelApi, reload = () => location.reload()) {
  if (mode === 'new-tab') {
    panelApi?.setStatus?.(
      `Lead ${leadId} criado. Aberto em nova aba. A atualizar a lista…`,
      'ok',
    );
    reload();
    return;
  }
  panelApi?.setStatus?.(
    `Lead ${leadId} criado. Pop-up bloqueado — abrindo nesta aba…`,
    'warn',
  );
}
