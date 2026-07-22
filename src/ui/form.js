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
 * @property {() => void} onCopyJson
 * @property {() => void} [onBack]
 * @property {(defaults: Record<string, string>) => void} [onSaveDefaults]
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
   */
  function addFieldRow(fieldId, value, origin = 'missing') {
    const row = document.createElement('label');
    row.className = `vlc-field ${originClass(origin)}`;
    row.dataset.field = fieldId;

    const head = document.createElement('span');
    head.className = 'vlc-field-label';
    head.textContent = LISTING_FIELD_LABELS[fieldId] || fieldId;

    const originBadge = document.createElement('span');
    originBadge.className = 'vlc-field-origin';
    originBadge.textContent = origin;

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

    head.appendChild(originBadge);
    row.append(head, input);
    inputs.set(fieldId, input);
    root?.appendChild(row);
  }

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

    const jsonBtn = document.createElement('button');
    jsonBtn.type = 'button';
    jsonBtn.className = 'vlc-btn';
    jsonBtn.textContent = 'Copy JSON';
    jsonBtn.addEventListener('click', () => handlers.onCopyJson());

    actions.append(fullBtn, plateBtn, jsonBtn);
    root?.appendChild(actions);
  }

  /**
   * @param {ReturnType<typeof import('../listing/record.js').createListingRecord>} record
   */
  function showListing(record) {
    mode = 'listing';
    ensureRoot();
    clear();
    root.hidden = false;

    const heading = document.createElement('div');
    heading.className = 'vlc-form-heading';
    heading.textContent = 'Review listing';
    root.appendChild(heading);

    for (const id of LISTING_FIELD_IDS) {
      addFieldRow(id, record.fields[id] || '', record.origins[id] || 'missing');
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
   */
  function syncListingValues(record) {
    if (mode !== 'listing') {
      return;
    }
    for (const id of LISTING_FIELD_IDS) {
      const input = inputs.get(id);
      if (input && document.activeElement !== input) {
        input.value = record.fields[id] || '';
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
