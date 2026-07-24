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
  /** @type {HTMLElement | null} */
  let plateImageMetaEl = null;
  /** @type {HTMLElement | null} */
  let plateImageIndexEl = null;
  /** @type {HTMLButtonElement | null} */
  let plateImagePreviewBtn = null;
  /** @type {HTMLElement | null} */
  let platePreviewOverlayEl = null;
  /** @type {HTMLImageElement | null} */
  let platePreviewImgEl = null;
  /** @type {HTMLElement | null} */
  let platePreviewCaptionEl = null;
  /** @type {HTMLElement | null} */
  let platePreviewConfirmEl = null;
  /** @type {HTMLElement | null} */
  let platePreviewConfirmMsgEl = null;
  /** @type {HTMLElement | null} */
  let platePreviewConfirmValueEl = null;
  /** @type {HTMLButtonElement | null} */
  let platePreviewCloseBtn = null;
  /** @type {HTMLButtonElement | null} */
  let platePreviewBackdropEl = null;
  /** @type {((choice: 'use' | 'edit' | 'discard') => void) | null} */
  let plateConfirmResolve = null;
  let plateConfirmActive = false;
  /** @type {HTMLButtonElement | null} */
  let minimizeBtn = null;
  let minimized = true;
  /** @type {CapturePhase} */
  let capturePhase = 'waiting';
  let copyEnabled = false;
  /** @type {number | null} */
  let plateImageIndex = null;
  /** @type {string} */
  let plateImageUrl = '';
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
    onPreviewPlateImage: () => openPlateImagePreview(),
  });

  const ICON_EXPAND = `<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>`;
  const ICON_MINIMIZE = `<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>`;
  const ICON_IMAGE = `<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>`;
  const ICON_CLOSE = `<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>`;

  function syncTitle() {
    if (!titleEl) {
      return;
    }
    titleEl.textContent = minimized ? capturePhase : APP_NAME;
  }

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

    plateImageMetaEl = document.createElement('span');
    plateImageMetaEl.className = 'vlc-plate-image-meta';
    plateImageMetaEl.hidden = true;

    plateImageIndexEl = document.createElement('span');
    plateImageIndexEl.className = 'vlc-plate-image-index';

    plateImagePreviewBtn = document.createElement('button');
    plateImagePreviewBtn.type = 'button';
    plateImagePreviewBtn.className = 'vlc-btn vlc-btn-icon vlc-btn-plate-preview';
    plateImagePreviewBtn.innerHTML = ICON_IMAGE;
    plateImagePreviewBtn.hidden = true;
    plateImagePreviewBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPlateImagePreview();
    });

    plateImageMetaEl.append(plateImageIndexEl, plateImagePreviewBtn);
    idSignalsEl.append(
      signalPlateEl,
      plateImageMetaEl,
      signalPhoneEl,
      signalRandomEl,
    );
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

    platePreviewOverlayEl = document.createElement('div');
    platePreviewOverlayEl.className = 'vlc-plate-preview-overlay';
    platePreviewOverlayEl.hidden = true;
    platePreviewOverlayEl.setAttribute('role', 'dialog');
    platePreviewOverlayEl.setAttribute('aria-modal', 'true');
    platePreviewOverlayEl.setAttribute('aria-label', 'Imagem da placa');

    platePreviewBackdropEl = document.createElement('button');
    platePreviewBackdropEl.type = 'button';
    platePreviewBackdropEl.className = 'vlc-plate-preview-backdrop';
    platePreviewBackdropEl.setAttribute('aria-label', 'Fechar preview');
    platePreviewBackdropEl.addEventListener('click', () => {
      if (plateConfirmActive) {
        return;
      }
      closePlateImagePreview();
    });

    const previewDialog = document.createElement('div');
    previewDialog.className = 'vlc-plate-preview-dialog';

    const previewHeader = document.createElement('div');
    previewHeader.className = 'vlc-plate-preview-header';

    platePreviewCaptionEl = document.createElement('div');
    platePreviewCaptionEl.className = 'vlc-plate-preview-caption';

    platePreviewCloseBtn = document.createElement('button');
    platePreviewCloseBtn.type = 'button';
    platePreviewCloseBtn.className = 'vlc-btn vlc-btn-icon';
    platePreviewCloseBtn.innerHTML = ICON_CLOSE;
    platePreviewCloseBtn.setAttribute('aria-label', 'Fechar');
    platePreviewCloseBtn.title = 'Fechar';
    platePreviewCloseBtn.addEventListener('click', () => {
      if (plateConfirmActive) {
        finishPlateConfirmation('discard');
        return;
      }
      closePlateImagePreview();
    });

    previewHeader.append(platePreviewCaptionEl, platePreviewCloseBtn);

    platePreviewImgEl = document.createElement('img');
    platePreviewImgEl.className = 'vlc-plate-preview-img';
    platePreviewImgEl.alt = 'Imagem onde a placa foi reconhecida';

    platePreviewConfirmEl = document.createElement('div');
    platePreviewConfirmEl.className = 'vlc-plate-confirm';
    platePreviewConfirmEl.hidden = true;

    const confirmAlert = document.createElement('div');
    confirmAlert.className = 'vlc-plate-confirm-alert';
    confirmAlert.textContent = 'Confiança baixa';

    platePreviewConfirmMsgEl = document.createElement('p');
    platePreviewConfirmMsgEl.className = 'vlc-plate-confirm-msg';

    platePreviewConfirmValueEl = document.createElement('p');
    platePreviewConfirmValueEl.className = 'vlc-plate-confirm-value';

    const confirmActions = document.createElement('div');
    confirmActions.className = 'vlc-plate-confirm-actions';

    const useBtn = makeButton('Usar este valor', () => {
      finishPlateConfirmation('use');
    });
    useBtn.classList.add('vlc-btn-primary');

    const editBtn = makeButton('Editar valor', () => {
      finishPlateConfirmation('edit');
    });

    const discardBtn = makeButton('Não usar placa', () => {
      finishPlateConfirmation('discard');
    });

    confirmActions.append(useBtn, editBtn, discardBtn);
    platePreviewConfirmEl.append(
      confirmAlert,
      platePreviewConfirmMsgEl,
      platePreviewConfirmValueEl,
      confirmActions,
    );

    previewDialog.append(
      previewHeader,
      platePreviewImgEl,
      platePreviewConfirmEl,
    );
    platePreviewOverlayEl.append(platePreviewBackdropEl, previewDialog);

    shadow.append(style, panelEl, platePreviewOverlayEl);
    syncMinimizeUi();
    syncPlateImageUi();
    target.appendChild(host);
    window.addEventListener('keydown', onCopyShortcutKeyDown);
    window.addEventListener('keydown', onPreviewEscapeKeyDown);
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
   * @param {KeyboardEvent} e
   */
  function onPreviewEscapeKeyDown(e) {
    if (e.key !== 'Escape') return;
    if (!platePreviewOverlayEl || platePreviewOverlayEl.hidden) return;
    e.preventDefault();
    if (plateConfirmActive) {
      finishPlateConfirmation('discard');
      return;
    }
    closePlateImagePreview();
  }

  function syncPlateImageUi() {
    const hasIndex =
      plateImageIndex != null &&
      Number.isFinite(plateImageIndex) &&
      plateImageIndex > 0;
    const hasUrl = Boolean(String(plateImageUrl || '').trim());
    if (plateImageMetaEl) {
      plateImageMetaEl.hidden = !hasIndex;
    }
    if (plateImageIndexEl) {
      plateImageIndexEl.textContent = hasIndex ? String(plateImageIndex) : '';
      plateImageIndexEl.title = hasIndex
        ? `Placa encontrada na imagem ${plateImageIndex}`
        : '';
    }
    if (plateImagePreviewBtn) {
      plateImagePreviewBtn.hidden = !(hasIndex && hasUrl);
      plateImagePreviewBtn.title = hasIndex
        ? `Ver imagem ${plateImageIndex}`
        : 'Ver imagem da placa';
      plateImagePreviewBtn.setAttribute(
        'aria-label',
        hasIndex
          ? `Ver imagem ${plateImageIndex} da placa`
          : 'Ver imagem da placa',
      );
    }
    if (signalPlateEl && hasIndex) {
      signalPlateEl.title = `Matrícula (imagem ${plateImageIndex})`;
      signalPlateEl.setAttribute(
        'aria-label',
        `Matrícula encontrada na imagem ${plateImageIndex}`,
      );
    } else if (signalPlateEl) {
      signalPlateEl.title = 'Matrícula';
      signalPlateEl.setAttribute('aria-label', 'Matrícula');
    }
  }

  /**
   * @param {{ index?: number | null, url?: string }} [info]
   */
  function setPlateImageSource({ index = null, url = '' } = {}) {
    const nextIndex =
      typeof index === 'number' && Number.isFinite(index) && index > 0
        ? Math.floor(index)
        : null;
    plateImageIndex = nextIndex;
    plateImageUrl = typeof url === 'string' ? url.trim() : '';
    syncPlateImageUi();
    if (!plateImageUrl) {
      closePlateImagePreview();
    }
  }

  function clearPlateConfirmUi() {
    plateConfirmActive = false;
    if (platePreviewConfirmEl) {
      platePreviewConfirmEl.hidden = true;
    }
    if (platePreviewBackdropEl) {
      platePreviewBackdropEl.disabled = false;
      platePreviewBackdropEl.style.cursor = 'pointer';
    }
    if (platePreviewCloseBtn) {
      platePreviewCloseBtn.hidden = false;
      platePreviewCloseBtn.title = 'Fechar';
      platePreviewCloseBtn.setAttribute('aria-label', 'Fechar');
    }
    if (platePreviewOverlayEl) {
      platePreviewOverlayEl.setAttribute('aria-label', 'Imagem da placa');
      platePreviewOverlayEl.classList.remove(
        'vlc-plate-preview-overlay--confirm',
      );
    }
  }

  /**
   * @param {'use' | 'edit' | 'discard'} choice
   */
  function finishPlateConfirmation(choice) {
    const resolve = plateConfirmResolve;
    plateConfirmResolve = null;
    clearPlateConfirmUi();
    if (platePreviewOverlayEl) {
      platePreviewOverlayEl.hidden = true;
    }
    if (platePreviewImgEl) {
      platePreviewImgEl.removeAttribute('src');
    }
    resolve?.(choice);
  }

  function openPlateImagePreview() {
    if (!platePreviewOverlayEl || !platePreviewImgEl || !plateImageUrl) {
      return;
    }
    clearPlateConfirmUi();
    platePreviewImgEl.src = plateImageUrl;
    if (platePreviewCaptionEl) {
      platePreviewCaptionEl.textContent =
        plateImageIndex != null && plateImageIndex > 0
          ? `Imagem ${plateImageIndex} — origem da placa`
          : 'Imagem — origem da placa';
    }
    platePreviewOverlayEl.hidden = false;
  }

  /**
   * Ask whether to keep a low-confidence plate reading.
   * @param {{
   *   plate: string,
   *   confidence?: number | null,
   *   imageIndex?: number | null,
   *   imageUrl?: string,
   * }} candidate
   * @returns {Promise<'use' | 'edit' | 'discard'>}
   */
  function promptLowConfidencePlate(candidate) {
    const url =
      typeof candidate.imageUrl === 'string' ? candidate.imageUrl.trim() : '';
    const index =
      typeof candidate.imageIndex === 'number' &&
      Number.isFinite(candidate.imageIndex) &&
      candidate.imageIndex > 0
        ? Math.floor(candidate.imageIndex)
        : null;
    if (url) {
      setPlateImageSource({ index, url });
    }

    if (!platePreviewOverlayEl || !platePreviewImgEl || !plateImageUrl) {
      return Promise.resolve('use');
    }

    if (plateConfirmResolve) {
      finishPlateConfirmation('discard');
    }

    setMinimized(false);
    clearPlateConfirmUi();
    plateConfirmActive = true;
    platePreviewImgEl.src = plateImageUrl;

    const pct =
      typeof candidate.confidence === 'number' &&
      Number.isFinite(candidate.confidence)
        ? Math.round(
            Math.min(
              1,
              Math.max(
                0,
                candidate.confidence > 1
                  ? candidate.confidence / 100
                  : candidate.confidence,
              ),
            ) * 100,
          )
        : null;

    if (platePreviewCaptionEl) {
      platePreviewCaptionEl.textContent =
        index != null
          ? `Imagem ${index} — confiança baixa`
          : 'Imagem — confiança baixa';
    }
    if (platePreviewConfirmMsgEl) {
      platePreviewConfirmMsgEl.textContent =
        pct != null
          ? `Nenhuma imagem atingiu 90% de confiança. A melhor leitura ficou em ${pct}%. Quer usar este valor?`
          : 'Nenhuma imagem atingiu 90% de confiança. Quer usar o valor encontrado?';
    }
    if (platePreviewConfirmValueEl) {
      platePreviewConfirmValueEl.textContent = `Valor encontrado: ${candidate.plate || '—'}`;
    }
    if (platePreviewConfirmEl) {
      platePreviewConfirmEl.hidden = false;
    }
    if (platePreviewBackdropEl) {
      platePreviewBackdropEl.disabled = true;
      platePreviewBackdropEl.style.cursor = 'default';
    }
    if (platePreviewCloseBtn) {
      platePreviewCloseBtn.title = 'Não usar placa';
      platePreviewCloseBtn.setAttribute('aria-label', 'Não usar placa');
    }
    if (platePreviewOverlayEl) {
      platePreviewOverlayEl.setAttribute(
        'aria-label',
        'Confirmar matrícula com confiança baixa',
      );
      platePreviewOverlayEl.classList.add(
        'vlc-plate-preview-overlay--confirm',
      );
      platePreviewOverlayEl.hidden = false;
    }

    return new Promise((resolve) => {
      plateConfirmResolve = resolve;
    });
  }

  function closePlateImagePreview() {
    if (plateConfirmActive && plateConfirmResolve) {
      return;
    }
    if (!platePreviewOverlayEl) {
      return;
    }
    platePreviewOverlayEl.hidden = true;
    if (platePreviewImgEl) {
      platePreviewImgEl.removeAttribute('src');
    }
    clearPlateConfirmUi();
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
   * @param {{ phone?: string, plateImageIndex?: number | null, plateImageUrl?: string, plateConfidence?: number | null }} [options]
   */
  function showListingForm(record, {
    phone = '',
    plateImageIndex: imgIndex,
    plateImageUrl: imgUrl,
    plateConfidence: confidence,
  } = {}) {
    const nextIndex =
      imgIndex !== undefined
        ? imgIndex
        : (record?.metadata?.plateImageIndex ?? plateImageIndex);
    const nextUrl =
      imgUrl !== undefined
        ? imgUrl
        : (record?.metadata?.plateImageUrl || plateImageUrl);
    setPlateImageSource({ index: nextIndex, url: nextUrl });
    const nextConfidence =
      confidence !== undefined
        ? confidence
        : (record?.metadata?.plateConfidence ?? null);
    form.showListing(record, {
      phone,
      plateImageIndex: plateImageIndex,
      plateImageUrl: plateImageUrl,
      plateConfidence: nextConfidence,
    });
  }

  function focusPlateField() {
    form.focusPlateField();
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
    window.removeEventListener('keydown', onPreviewEscapeKeyDown);
    closePlateImagePreview();
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
    plateImageMetaEl = null;
    plateImageIndexEl = null;
    plateImagePreviewBtn = null;
    platePreviewOverlayEl = null;
    platePreviewImgEl = null;
    platePreviewCaptionEl = null;
    platePreviewConfirmEl = null;
    platePreviewConfirmMsgEl = null;
    platePreviewConfirmValueEl = null;
    platePreviewCloseBtn = null;
    platePreviewBackdropEl = null;
    plateConfirmResolve = null;
    plateConfirmActive = false;
    minimizeBtn = null;
    minimized = true;
    capturePhase = 'waiting';
    copyEnabled = false;
    plateImageIndex = null;
    plateImageUrl = '';
    dragPointerId = null;
  }

  return {
    mount,
    setStatus,
    setBusy,
    setClipboardId,
    setPlateImageSource,
    openPlateImagePreview,
    closePlateImagePreview,
    promptLowConfidencePlate,
    setCopyEnabled,
    setCopyLabel,
    flashCopySuccess,
    setCaptureStatus,
    setDiagnostics,
    showListingForm,
    showSettingsForm,
    hideForm,
    focusPlateField,
    setMinimized,
    isMinimized: () => minimized,
    toggleMinimized,
    destroy,
  };
}
