import { APP_NAME, isLocal, PANEL_ROOT_ID } from '../environment.js';
import { createListingForm } from './form.js';
import { PANEL_STYLES } from './styles.js';

/**
 * @typedef {object} PanelHandlers
 * @property {() => void} onClipListing
 * @property {() => void} onCancel
 * @property {() => void} onCopyAgain
 * @property {() => void} onClearModelCache
 * @property {() => void} onToggleDiagnostics
 * @property {() => void} onSettings
 * @property {(fieldId: string, value: string) => void} onFieldChange
 * @property {() => void} onCopyFullText
 * @property {() => void} onCopyPlateOnly
 * @property {() => void} onCopyJson
 * @property {() => void} onSettingsBack
 * @property {(defaults: Record<string, string>) => void} onSaveDefaults
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
  /** @type {HTMLElement | null} */
  let diagEl = null;
  /** @type {HTMLButtonElement | null} */
  let clipBtn = null;
  /** @type {HTMLButtonElement | null} */
  let cancelBtn = null;
  /** @type {HTMLButtonElement | null} */
  let copyBtn = null;

  const form = createListingForm({
    onFieldChange: (fieldId, value) => handlers.onFieldChange(fieldId, value),
    onCopyFullText: () => handlers.onCopyFullText(),
    onCopyPlateOnly: () => handlers.onCopyPlateOnly(),
    onCopyJson: () => handlers.onCopyJson(),
    onBack: () => handlers.onSettingsBack(),
    onSaveDefaults: (defaults) => handlers.onSaveDefaults(defaults),
  });

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

    clipBtn = makeButton('Clip listing', () => handlers.onClipListing());
    cancelBtn = makeButton('Cancel', () => handlers.onCancel());
    cancelBtn.disabled = true;
    copyBtn = makeButton('Copy again', () => handlers.onCopyAgain());
    copyBtn.disabled = true;
    const clearBtn = makeButton('Clear model cache', () =>
      handlers.onClearModelCache(),
    );
    const diagBtn = makeButton('Diagnostics', () =>
      handlers.onToggleDiagnostics(),
    );
    const settingsBtn = makeButton('Settings', () => handlers.onSettings());

    actions.append(clipBtn, cancelBtn, copyBtn, clearBtn, diagBtn, settingsBtn);

    statusEl = document.createElement('div');
    statusEl.className = 'vlc-status';
    statusEl.setAttribute('aria-live', 'polite');

    diagEl = document.createElement('div');
    diagEl.className = 'vlc-diag';
    diagEl.hidden = true;

    const formEl = form.getElement();

    panel.append(header, actions, statusEl, diagEl, formEl);
    shadow.append(style, panel);
    target.appendChild(host);
    return host;
  }

  /**
   * @param {string} label
   * @param {() => void} onClick
   */
  function makeButton(label, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'vlc-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
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
    if (clipBtn) {
      clipBtn.disabled = Boolean(busy);
    }
    if (cancelBtn) {
      cancelBtn.disabled = !busy;
    }
  }

  /**
   * @param {boolean} enabled
   */
  function setCopyEnabled(enabled) {
    if (copyBtn) {
      copyBtn.disabled = !enabled;
    }
  }

  /**
   * @param {boolean} visible
   * @param {string} [text]
   */
  function setDiagnostics(visible, text = '') {
    if (!diagEl) {
      return;
    }
    diagEl.hidden = !visible;
    diagEl.textContent = text;
  }

  /**
   * @param {ReturnType<typeof import('../listing/record.js').createListingRecord>} record
   */
  function showListingForm(record) {
    form.showListing(record);
  }

  /**
   * @param {Record<string, string>} defaults
   */
  function showSettingsForm(defaults) {
    form.showSettings(defaults);
  }

  function hideForm() {
    form.hide();
  }

  function destroy() {
    host?.remove();
    host = null;
    statusEl = null;
    diagEl = null;
    clipBtn = null;
    cancelBtn = null;
    copyBtn = null;
  }

  return {
    mount,
    setStatus,
    setBusy,
    setCopyEnabled,
    setDiagnostics,
    showListingForm,
    showSettingsForm,
    hideForm,
    destroy,
  };
}
