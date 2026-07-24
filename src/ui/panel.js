import { APP_NAME, isLocal, PANEL_ROOT_ID } from '../environment.js';
import { createListingForm } from './form.js';
import { PANEL_STYLES } from './styles.js';

/** @typedef {string} CapturePhase */

const COPY_SHORTCUT = 'Alt+C';
const COPY_SHORTCUT_MAC = '⌥C';

/**
 * @returns {boolean}
 */
function isApplePlatform() {
  return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || '')
    || /Mac OS/i.test(navigator.userAgent || '');
}

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
  let panelEl = null;
  /** @type {HTMLElement | null} */
  let headerEl = null;
  /** @type {HTMLElement | null} */
  let titleEl = null;
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
  /** @type {HTMLButtonElement | null} */
  let headerCopyBtn = null;
  /** @type {HTMLButtonElement | null} */
  let headerClipBtn = null;
  /** @type {HTMLElement | null} */
  let idSignalsEl = null;
  /** @type {HTMLElement | null} */
  let signalPlateEl = null;
  /** @type {HTMLElement | null} */
  let signalPhoneEl = null;
  /** @type {HTMLElement | null} */
  let signalRandomEl = null;
  /** @type {HTMLButtonElement | null} */
  let minimizeBtn = null;
  let minimized = true;
  /** @type {CapturePhase} */
  let capturePhase = 'waiting';
  let copyEnabled = false;
  let dragPointerId = null;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  /** @type {ReturnType<typeof setTimeout> | null} */
  let copyFlashTimer = null;
  const copyShortcutLabel = isApplePlatform()
    ? COPY_SHORTCUT_MAC
    : COPY_SHORTCUT;

  /**
   * @param {string} label
   */
  function withCopyShortcut(label) {
    return `${label} (${copyShortcutLabel})`;
  }

  const form = createListingForm({
    onFieldChange: (fieldId, value) => handlers.onFieldChange(fieldId, value),
    onCopyFullText: () => handlers.onCopyFullText(),
    onCopyPlateOnly: () => handlers.onCopyPlateOnly(),
    onBack: () => handlers.onSettingsBack(),
    onSaveDefaults: (defaults) => handlers.onSaveDefaults(defaults),
  });

  function syncTitle() {
    if (!titleEl) {
      return;
    }
    titleEl.textContent = minimized ? capturePhase : APP_NAME;
  }

  const ICON_EXPAND = `<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>`;
  const ICON_MINIMIZE = `<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>`;

  function syncMinimizeUi() {
    if (!panelEl || !minimizeBtn) {
      return;
    }
    panelEl.classList.toggle('vlc-panel--minimized', minimized);
    minimizeBtn.innerHTML = minimized ? ICON_EXPAND : ICON_MINIMIZE;
    minimizeBtn.setAttribute(
      'aria-label',
      minimized ? 'Expand panel' : 'Minimize panel',
    );
    minimizeBtn.title = minimized ? 'Expand' : 'Minimize';
    syncTitle();
  }

  function setMinimized(next) {
    minimized = Boolean(next);
    syncMinimizeUi();
  }

  function toggleMinimized() {
    setMinimized(!minimized);
  }

  /**
   * @param {CapturePhase} phase
   */
  function setCaptureStatus(phase) {
    capturePhase = phase;
    panelEl?.classList.toggle(
      'vlc-panel--ready',
      String(phase).toLowerCase() === 'ready to copy',
    );
    syncTitle();
  }

  function syncCopyEnabled() {
    if (copyBtn) {
      copyBtn.disabled = !copyEnabled;
    }
    if (headerCopyBtn) {
      headerCopyBtn.disabled = !copyEnabled;
    }
  }

  /**
   * @param {number} left
   * @param {number} top
   */
  function placePanel(left, top) {
    if (!panelEl) {
      return;
    }
    const rect = panelEl.getBoundingClientRect();
    const maxLeft = Math.max(0, window.innerWidth - rect.width);
    const maxTop = Math.max(0, window.innerHeight - rect.height);
    const nextLeft = Math.min(Math.max(0, left), maxLeft);
    const nextTop = Math.min(Math.max(0, top), maxTop);
    panelEl.style.left = `${nextLeft}px`;
    panelEl.style.top = `${nextTop}px`;
    panelEl.style.right = 'auto';
    panelEl.style.bottom = 'auto';
  }

  /**
   * @param {PointerEvent} event
   */
  function onHeaderPointerDown(event) {
    if (!panelEl || !headerEl) {
      return;
    }
    const target = /** @type {HTMLElement | null} */ (event.target);
    if (target?.closest('button')) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    const rect = panelEl.getBoundingClientRect();
    dragPointerId = event.pointerId;
    dragOffsetX = event.clientX - rect.left;
    dragOffsetY = event.clientY - rect.top;
    headerEl.classList.add('vlc-header--dragging');
    headerEl.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  /**
   * @param {PointerEvent} event
   */
  function onHeaderPointerMove(event) {
    if (dragPointerId !== event.pointerId) {
      return;
    }
    placePanel(event.clientX - dragOffsetX, event.clientY - dragOffsetY);
  }

  /**
   * @param {PointerEvent} event
   */
  function onHeaderPointerUp(event) {
    if (dragPointerId !== event.pointerId) {
      return;
    }
    dragPointerId = null;
    headerEl?.classList.remove('vlc-header--dragging');
    if (headerEl?.hasPointerCapture(event.pointerId)) {
      headerEl.releasePointerCapture(event.pointerId);
    }
  }

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

    panelEl = document.createElement('div');
    panelEl.className = 'vlc-panel';
    panelEl.setAttribute('role', 'region');
    panelEl.setAttribute('aria-label', APP_NAME);

    headerEl = document.createElement('div');
    headerEl.className = 'vlc-header';
    headerEl.addEventListener('pointerdown', onHeaderPointerDown);
    headerEl.addEventListener('pointermove', onHeaderPointerMove);
    headerEl.addEventListener('pointerup', onHeaderPointerUp);
    headerEl.addEventListener('pointercancel', onHeaderPointerUp);

    const headerMain = document.createElement('div');
    headerMain.className = 'vlc-header-main';

    const headerText = document.createElement('div');
    headerText.className = 'vlc-header-text';

    titleEl = document.createElement('h1');
    titleEl.className = 'vlc-title';
    titleEl.textContent = APP_NAME;
    headerText.appendChild(titleEl);

    idSignalsEl = document.createElement('div');
    idSignalsEl.className = 'vlc-id-signals';
    idSignalsEl.hidden = true;
    idSignalsEl.setAttribute('aria-label', 'Sinais de captura');

    signalPlateEl = makeSignal('P', 'Matrícula');
    signalPlateEl.classList.add('vlc-signal--plate');
    signalPhoneEl = makeSignal('T', 'Telefone');
    signalPhoneEl.classList.add('vlc-signal--phone');
    signalRandomEl = makeSignal('R', 'ID aleatório');
    signalRandomEl.classList.add('vlc-signal--random');
    idSignalsEl.append(signalPlateEl, signalPhoneEl, signalRandomEl);
    headerText.appendChild(idSignalsEl);

    headerMain.appendChild(headerText);

    if (isLocal) {
      const badge = document.createElement('span');
      badge.className = 'vlc-badge';
      badge.textContent = 'LD';
      badge.title = 'Local development';
      headerMain.appendChild(badge);
    }

    headerClipBtn = makeButton('Clip again', () => handlers.onClipListing());
    headerClipBtn.classList.add('vlc-btn-header-clip');

    headerCopyBtn = makeButton(withCopyShortcut('Copy again'), () =>
      handlers.onCopyAgain(),
    );
    headerCopyBtn.classList.add('vlc-btn-header-copy');
    headerCopyBtn.title = `Shortcut: ${copyShortcutLabel}`;
    headerCopyBtn.disabled = true;

    minimizeBtn = document.createElement('button');
    minimizeBtn.type = 'button';
    minimizeBtn.className = 'vlc-btn vlc-btn-icon';
    minimizeBtn.addEventListener('click', toggleMinimized);

    const headerActions = document.createElement('div');
    headerActions.className = 'vlc-header-actions';
    headerActions.append(headerClipBtn, headerCopyBtn, minimizeBtn);

    headerEl.append(headerMain, headerActions);

    const body = document.createElement('div');
    body.className = 'vlc-body';

    const actions = document.createElement('div');
    actions.className = 'vlc-actions';

    clipBtn = makeButton('Clip listing', () => handlers.onClipListing());
    cancelBtn = makeButton('Cancel', () => handlers.onCancel());
    cancelBtn.disabled = true;
    copyBtn = makeButton(withCopyShortcut('Copy again'), () =>
      handlers.onCopyAgain(),
    );
    copyBtn.title = `Shortcut: ${copyShortcutLabel}`;
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

    body.append(actions, statusEl, diagEl, formEl);
    panelEl.append(headerEl, body);
    shadow.append(style, panelEl);
    syncMinimizeUi();
    target.appendChild(host);
    window.addEventListener('keydown', onCopyShortcutKeyDown);
    return host;
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onCopyShortcutKeyDown(e) {
    // Alt/⌥+C — copy listing data (left-hand, two keys).
    if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
    if (e.code !== 'KeyC') return;
    if (!copyEnabled) return;
    e.preventDefault();
    handlers.onCopyAgain();
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
   * Compact capture indicator for the minimized header.
   * @param {string} letter
   * @param {string} title
   */
  function makeSignal(letter, title) {
    const el = document.createElement('span');
    el.className = 'vlc-signal';
    el.textContent = letter;
    el.title = title;
    el.setAttribute('aria-label', title);
    el.setAttribute('aria-pressed', 'false');
    return el;
  }

  /**
   * @param {HTMLElement | null} el
   * @param {boolean} on
   */
  function setSignalOn(el, on) {
    if (!el) {
      return;
    }
    el.classList.toggle('vlc-signal--on', Boolean(on));
    el.setAttribute('aria-pressed', on ? 'true' : 'false');
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
    const isBusy = Boolean(busy);
    if (clipBtn) {
      clipBtn.disabled = isBusy;
    }
    if (headerClipBtn) {
      headerClipBtn.disabled = isBusy;
    }
    if (cancelBtn) {
      cancelBtn.disabled = !isBusy;
    }
  }

  /**
   * Show capture signals in the minimized header.
   * Signals: P = matrícula, T = telefone, R = ID aleatório (99XXXXX99).
   * @param {{
   *   id?: string,
   *   isRandom?: boolean,
   *   hasPlate?: boolean,
   *   hasPhone?: boolean,
   * }} [info]
   */
  function setClipboardId({
    id = '',
    isRandom = false,
    hasPlate = false,
    hasPhone = false,
  } = {}) {
    if (!idSignalsEl) {
      return;
    }
    const plateOn = Boolean(hasPlate);
    const phoneOn = Boolean(hasPhone);
    const randomOn = Boolean(isRandom);
    const any =
      plateOn || phoneOn || randomOn || Boolean(String(id || '').trim());
    if (!any) {
      idSignalsEl.hidden = true;
      setSignalOn(signalPlateEl, false);
      setSignalOn(signalPhoneEl, false);
      setSignalOn(signalRandomEl, false);
      return;
    }
    idSignalsEl.hidden = false;
    setSignalOn(signalPlateEl, plateOn);
    setSignalOn(signalPhoneEl, phoneOn);
    setSignalOn(signalRandomEl, randomOn);
  }

  /**
   * @param {boolean} enabled
   */
  function setCopyEnabled(enabled) {
    copyEnabled = Boolean(enabled);
    syncCopyEnabled();
  }

  /**
   * @param {string} label
   */
  function setCopyLabel(label) {
    const text = withCopyShortcut(label || 'Copy again');
    if (copyBtn) {
      copyBtn.textContent = text;
      copyBtn.title = `Shortcut: ${copyShortcutLabel}`;
    }
    if (headerCopyBtn) {
      headerCopyBtn.textContent = text;
      headerCopyBtn.title = `Shortcut: ${copyShortcutLabel}`;
    }
  }

  /**
   * Briefly highlight Copy again buttons after a successful clipboard write.
   * @param {number} [durationMs]
   */
  function flashCopySuccess(durationMs = 2000) {
    if (copyFlashTimer != null) {
      clearTimeout(copyFlashTimer);
      copyFlashTimer = null;
    }
    for (const btn of [headerCopyBtn, copyBtn]) {
      if (!btn) {
        continue;
      }
      btn.classList.add('vlc-btn--copied');
    }
    copyFlashTimer = setTimeout(() => {
      copyFlashTimer = null;
      for (const btn of [headerCopyBtn, copyBtn]) {
        btn?.classList.remove('vlc-btn--copied');
      }
    }, durationMs);
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
   * @param {{ phone?: string }} [options]
   */
  function showListingForm(record, { phone = '' } = {}) {
    form.showListing(record, { phone });
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
    if (copyFlashTimer != null) {
      clearTimeout(copyFlashTimer);
      copyFlashTimer = null;
    }
    window.removeEventListener('keydown', onCopyShortcutKeyDown);
    if (headerEl) {
      headerEl.removeEventListener('pointerdown', onHeaderPointerDown);
      headerEl.removeEventListener('pointermove', onHeaderPointerMove);
      headerEl.removeEventListener('pointerup', onHeaderPointerUp);
      headerEl.removeEventListener('pointercancel', onHeaderPointerUp);
    }
    host?.remove();
    host = null;
    panelEl = null;
    headerEl = null;
    titleEl = null;
    statusEl = null;
    diagEl = null;
    clipBtn = null;
    cancelBtn = null;
    copyBtn = null;
    headerCopyBtn = null;
    headerClipBtn = null;
    idSignalsEl = null;
    signalPlateEl = null;
    signalPhoneEl = null;
    signalRandomEl = null;
    minimizeBtn = null;
    minimized = true;
    capturePhase = 'waiting';
    copyEnabled = false;
    dragPointerId = null;
  }

  return {
    mount,
    setStatus,
    setBusy,
    setClipboardId,
    setCopyEnabled,
    setCopyLabel,
    flashCopySuccess,
    setCaptureStatus,
    setDiagnostics,
    showListingForm,
    showSettingsForm,
    hideForm,
    setMinimized,
    toggleMinimized,
    destroy,
  };
}
