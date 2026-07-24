import {
  DEFAULTABLE_FIELD_IDS,
  LISTING_FIELD_IDS,
  LISTING_FIELD_LABELS,
} from '../listing/record.js';

/**
 * @typedef {object} FormHandlers
 * @property {(fieldId: string, value: string) => void} onFieldChange
 * @property {() => void} onCopyFullText
 * @property {() => void} onCopyPlateOnly
 * @property {() => void} [onBack]
 * @property {(defaults: Record<string, string>) => void} [onSaveDefaults]
 * @property {() => void} [onPreviewPlateImage]
 */

/**
 * @param {string} origin
 * @returns {string}
 */
function originClass(origin) {
  switch (origin) {
    case 'extracted':
      return 'vlc-origin-extracted';
    case 'anpr':
      return 'vlc-origin-anpr';
    case 'default':
      return 'vlc-origin-default';
    case 'edited':
      return 'vlc-origin-edited';
    default:
      return 'vlc-origin-missing';
  }
}

/**
 * Create the listing review / settings form (mounted inside panel shadow).
 * @param {FormHandlers} handlers
 */
export function createListingForm(handlers) {
  /** @type {HTMLElement | null} */
  let root = null;
  /** @type {Map<string, HTMLInputElement>} */
  const inputs = new Map();
  /** @type {'listing' | 'settings'} */
  let mode = 'listing';

  function ensureRoot() {
    if (root) {
      return root;
    }
    root = document.createElement('div');
    root.className = 'vlc-form';
    root.hidden = true;
    return root;
  }

  function clear() {
    if (!root) {
      return;
    }
    root.replaceChildren();
    inputs.clear();
  }

  /**
   * @param {string} fieldId
   * @param {string} value
   * @param {string} [origin]
   * @param {string} [label]
   * @param {{ plateImageIndex?: number | null, plateImageUrl?: string }} [extras]
   */
  function addFieldRow(fieldId, value, origin = 'missing', label, extras = {}) {
    const row = document.createElement('label');
    row.className = `vlc-field ${originClass(origin)}`;
    row.dataset.field = fieldId;

    const head = document.createElement('span');
    head.className = 'vlc-field-label';

    const headTitle = document.createElement('span');
    headTitle.className = 'vlc-field-label-text';
    headTitle.textContent = label || LISTING_FIELD_LABELS[fieldId] || fieldId;

    const originBadge = document.createElement('span');
    originBadge.className = 'vlc-field-origin';
    originBadge.textContent = origin;

    const headMeta = document.createElement('span');
    headMeta.className = 'vlc-field-label-meta';
    headMeta.appendChild(originBadge);

    if (
      fieldId === 'plate' &&
      extras.plateImageIndex != null &&
      extras.plateImageIndex > 0
    ) {
      const imgBadge = document.createElement('span');
      imgBadge.className = 'vlc-plate-image-badge';
      imgBadge.textContent = `img ${extras.plateImageIndex}`;
      imgBadge.title = `Placa encontrada na imagem ${extras.plateImageIndex}`;
      headMeta.appendChild(imgBadge);

      if (extras.plateImageUrl) {
        const previewBtn = document.createElement('button');
        previewBtn.type = 'button';
        previewBtn.className = 'vlc-btn vlc-btn-icon vlc-btn-plate-preview';
        previewBtn.title = `Ver imagem ${extras.plateImageIndex}`;
        previewBtn.setAttribute(
          'aria-label',
          `Ver imagem ${extras.plateImageIndex} da placa`,
        );
        previewBtn.innerHTML = ICON_IMAGE;
        previewBtn.addEventListener('mousedown', (event) => {
          event.preventDefault();
        });
        previewBtn.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          handlers.onPreviewPlateImage?.();
        });
        headMeta.appendChild(previewBtn);
      }
    }

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'vlc-field-input';
    input.value = value ?? '';
    input.dataset.field = fieldId;
    input.addEventListener('input', () => {
      if (mode === 'listing') {
        handlers.onFieldChange(fieldId, input.value);
        row.className = `vlc-field ${originClass('edited')}`;
        originBadge.textContent = 'edited';
      }
    });

    head.append(headTitle, headMeta);
    row.append(head, input);
    inputs.set(fieldId, input);
    root?.appendChild(row);
  }

  const ICON_IMAGE = `<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>`;

  function addCopyActions() {
    const actions = document.createElement('div');
    actions.className = 'vlc-form-actions';

    const fullBtn = document.createElement('button');
    fullBtn.type = 'button';
    fullBtn.className = 'vlc-btn vlc-btn-primary';
    fullBtn.textContent = 'Copy full text';
    fullBtn.addEventListener('click', () => handlers.onCopyFullText());

    const plateBtn = document.createElement('button');
    plateBtn.type = 'button';
    plateBtn.className = 'vlc-btn';
    plateBtn.textContent = 'Copy plate only';
    plateBtn.addEventListener('click', () => handlers.onCopyPlateOnly());

    actions.append(fullBtn, plateBtn);
    root?.appendChild(actions);
  }

  /**
   * @param {ReturnType<typeof import('../listing/record.js').createListingRecord>} record
   * @param {{ phone?: string, plateImageIndex?: number | null, plateImageUrl?: string }} [options]
   */
  function showListing(record, { phone = '', plateImageIndex = null, plateImageUrl = '' } = {}) {
    mode = 'listing';
    ensureRoot();
    clear();
    root.hidden = false;

    const heading = document.createElement('div');
    heading.className = 'vlc-form-heading';
    heading.textContent = 'Review listing';
    root.appendChild(heading);

    const phoneValue = phone == null ? '' : String(phone).trim();
    addFieldRow(
      'phone',
      phoneValue,
      phoneValue ? 'extracted' : 'missing',
      'Telefone',
    );

    for (const id of LISTING_FIELD_IDS) {
      let value = record.fields[id] || '';
      let origin = record.origins[id] || 'missing';
      // Older cached records may only have advertiser name on source.
      if (id === 'clientName' && !value && record.source?.clientName) {
        value = String(record.source.clientName);
        origin = 'extracted';
      }
      const extras =
        id === 'plate'
          ? {
              plateImageIndex:
                plateImageIndex ?? record.metadata?.plateImageIndex ?? null,
              plateImageUrl:
                plateImageUrl || record.metadata?.plateImageUrl || '',
            }
          : {};
      addFieldRow(id, value, origin, undefined, extras);
    }
    addCopyActions();
  }

  /**
   * @param {Record<string, string>} defaults
   */
  function showSettings(defaults) {
    mode = 'settings';
    ensureRoot();
    clear();
    root.hidden = false;

    const heading = document.createElement('div');
    heading.className = 'vlc-form-heading';
    heading.textContent = 'Default values';
    root.appendChild(heading);

    for (const id of DEFAULTABLE_FIELD_IDS) {
      addFieldRow(id, defaults[id] || '', 'default');
    }

    const actions = document.createElement('div');
    actions.className = 'vlc-form-actions';

    const saveBtn = document.createElement('button');
    saveBtn.type = 'button';
    saveBtn.className = 'vlc-btn vlc-btn-primary';
    saveBtn.textContent = 'Save defaults';
    saveBtn.addEventListener('click', () => {
      /** @type {Record<string, string>} */
      const next = {};
      for (const id of DEFAULTABLE_FIELD_IDS) {
        next[id] = inputs.get(id)?.value ?? '';
      }
      handlers.onSaveDefaults?.(next);
    });

    const backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'vlc-btn';
    backBtn.textContent = 'Back';
    backBtn.addEventListener('click', () => handlers.onBack?.());

    actions.append(saveBtn, backBtn);
    root.appendChild(actions);
  }

  function hide() {
    if (root) {
      root.hidden = true;
    }
  }

  /**
   * Sync input values from record without rebuilding (keeps focus).
   * @param {ReturnType<typeof import('../listing/record.js').createListingRecord>} record
   * @param {{ phone?: string }} [options]
   */
  function syncListingValues(record, { phone } = {}) {
    if (mode !== 'listing') {
      return;
    }
    if (phone !== undefined) {
      const phoneInput = inputs.get('phone');
      if (phoneInput && document.activeElement !== phoneInput) {
        phoneInput.value = phone == null ? '' : String(phone);
      }
    }
    for (const id of LISTING_FIELD_IDS) {
      const input = inputs.get(id);
      if (input && document.activeElement !== input) {
        let value = record.fields[id] || '';
        if (id === 'clientName' && !value && record.source?.clientName) {
          value = String(record.source.clientName);
        }
        input.value = value;
      }
    }
  }

  return {
    ensureRoot,
    showListing,
    showSettings,
    syncListingValues,
    hide,
    getMode: () => mode,
    getElement: () => ensureRoot(),
  };
}
