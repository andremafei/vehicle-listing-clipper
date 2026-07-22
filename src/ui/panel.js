import { APP_NAME, isLocal, PANEL_ROOT_ID } from '../environment.js';
import { PANEL_STYLES } from './styles.js';

/**
 * @typedef {object} PanelHandlers
 * @property {() => void} onReadPlate
 * @property {() => void} onSettings
 */

/**
 * Create the floating panel.
 * @param {PanelHandlers} handlers
 */
export function createPanel(handlers) {
  /** @type {HTMLElement | null} */
  let host = null;
  /** @type {HTMLElement | null} */
  let statusEl = null;
  /** @type {HTMLButtonElement | null} */
  let readBtn = null;

  function mount(target = document.body) {
    if (document.getElementById(PANEL_ROOT_ID)) {
      host = document.getElementById(PANEL_ROOT_ID);
      return host;
    }

    host = document.createElement('div');
    host.id = PANEL_ROOT_ID;
    host.setAttribute('data-vlc-panel', '1');

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = PANEL_STYLES;

    const panel = document.createElement('div');
    panel.className = 'vlc-panel';
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-label', APP_NAME);

    const header = document.createElement('div');
    header.className = 'vlc-header';

    const title = document.createElement('h1');
    title.className = 'vlc-title';
    title.textContent = APP_NAME;

    header.appendChild(title);

    if (isLocal) {
      const badge = document.createElement('span');
      badge.className = 'vlc-badge';
      badge.textContent = 'LOCAL DEV';
      header.appendChild(badge);
    }

    const actions = document.createElement('div');
    actions.className = 'vlc-actions';

    readBtn = document.createElement('button');
    readBtn.type = 'button';
    readBtn.className = 'vlc-btn';
    readBtn.textContent = 'Read plate';
    readBtn.addEventListener('click', () => handlers.onReadPlate());

    const settingsBtn = document.createElement('button');
    settingsBtn.type = 'button';
    settingsBtn.className = 'vlc-btn';
    settingsBtn.textContent = 'Settings';
    settingsBtn.addEventListener('click', () => handlers.onSettings());

    actions.append(readBtn, settingsBtn);

    statusEl = document.createElement('div');
    statusEl.className = 'vlc-status';
    statusEl.setAttribute('aria-live', 'polite');

    panel.append(header, actions, statusEl);
    shadow.append(style, panel);
    target.appendChild(host);
    return host;
  }

  /**
   * @param {string} message
   */
  function setStatus(message) {
    if (statusEl) {
      statusEl.textContent = message;
    }
  }

  /**
   * @param {boolean} busy
   */
  function setBusy(busy) {
    if (readBtn) {
      readBtn.disabled = Boolean(busy);
    }
  }

  function destroy() {
    host?.remove();
    host = null;
    statusEl = null;
    readBtn = null;
  }

  return {
    mount,
    setStatus,
    setBusy,
    destroy,
  };
}
