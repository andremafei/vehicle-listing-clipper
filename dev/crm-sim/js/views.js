/**
 * LeadDesk views — search, match list, create flow, lead detail.
 */

import {
  classifyQuery,
  deleteLead,
  findLeadsByPhone,
  findLeadsByPlate,
  getClient,
  getLead,
  newId,
  normalizePhone,
  normalizePlate,
  saveClientAndLead,
  searchLeads,
  updateClientAndLead,
} from './db.js';
import { navigate } from './router.js';

/** In-memory draft for /crm/leads/new (not persisted until save). */
/** @type {{ query: string, queryKind: string, prefillPlate?: string, client: object | null } | null} */
let createDraft = null;

const PROVINCES = [
  'Aveiro',
  'Beja',
  'Braga',
  'Bragança',
  'Castelo Branco',
  'Coimbra',
  'Évora',
  'Faro',
  'Guarda',
  'Leiria',
  'Lisboa',
  'Portalegre',
  'Porto',
  'Santarém',
  'Setúbal',
  'Viana do Castelo',
  'Vila Real',
  'Viseu',
  'Açores',
  'Madeira',
];

/** Top marcas PT (ACAP 2025 ligeiros) + Honda (usado comum). Alphabetical. */
const MAKES = [
  'Audi',
  'BMW',
  'BYD',
  'Citroën',
  'Cupra',
  'Dacia',
  'Fiat',
  'Ford',
  'Honda',
  'Hyundai',
  'Jaguar',
  'Jeep',
  'Kia',
  'Mercedes-Benz',
  'MG',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Opel',
  'Peugeot',
  'Porsche',
  'Renault',
  'Seat',
  'Skoda',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

/**
 * Expand known clipper make abbreviations (keep in sync with map-clip-to-api).
 * @param {string} make
 * @returns {string}
 */
function expandMakeAlias(make) {
  const m = String(make || '').trim().toLowerCase();
  if (m === 'vw') return 'Volkswagen';
  return '';
}

/**
 * Match a saved/clip value to a select option (clipper stores UPPERCASE makes).
 * @param {string[]} options
 * @param {string} value
 * @param {(raw: string) => string} [semanticNormalize]
 * @returns {string}
 */
function matchSelectOption(options, value, semanticNormalize) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const exact = options.find((opt) => opt === raw);
  if (exact) return exact;
  const lower = raw.toLowerCase();
  const hit = options.find((opt) => opt.toLowerCase() === lower);
  if (hit) return hit;
  if (semanticNormalize) {
    const normalized = semanticNormalize(raw);
    if (normalized && options.includes(normalized)) return normalized;
  }
  return raw;
}

const FUELS = ['Gasolina', 'Diesel', 'Híbrido', 'Elétrico', 'GPL', 'Outro'];
const TRANSMISSIONS = ['Manual', 'Automática'];
const BODY_TYPES = ['Citadino', 'Sedan', 'Carrinha', 'SUV', 'Monovolume', 'Coupé', 'Cabrio', 'Outro'];
const LEAD_STATUSES = ['Novo', 'Em contacto', 'Avaliado', 'Proposta', 'Fechado', 'Perdido'];
const LEAD_ORIGINS = ['Portal', 'Standvirtual', 'OLX', 'Referência', 'Walk-in', 'Outro'];
const CONTACT_METHODS = ['Whatsapp', 'Telefone', 'Email', 'Presencial'];
const BRANCHES = ['Lisboa', 'Porto', 'Setúbal', 'Faro', 'Coimbra', 'Braga'];

/**
 * @param {HTMLElement} root
 */
export function clearRoot(root) {
  root.replaceChildren();
}

/**
 * @param {string} iso
 */
function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/**
 * @param {string} tag
 * @param {Record<string, string>} [attrs]
 * @param {(Node|string)[]} [children]
 */
function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (key === 'className') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value !== undefined && value !== null) {
      node.setAttribute(key, String(value));
    }
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(typeof child === 'string' ? document.createTextNode(child) : child);
  }
  return node;
}

function appShell(title, contentNodes, { showMenu = true } = {}) {
  const nav = showMenu
    ? el('nav', { className: 'app-nav' }, [
        el('button', {
          type: 'button',
          className: 'nav-link',
          text: 'Lista de leads',
          onclick: () => navigate('/leads/list'),
        }),
        el('button', {
          type: 'button',
          className: 'nav-link nav-link-primary',
          text: 'Adicionar Lead',
          onclick: () => navigate('/leads/add'),
        }),
      ])
    : null;

  const header = el('header', { className: 'app-header' }, [
    el('a', {
      className: 'brand',
      href: '/crm/leads/list',
      text: 'LeadDesk',
      onclick: (e) => {
        e.preventDefault();
        navigate('/leads/list');
      },
    }),
    nav,
  ]);
  const main = el('main', { className: 'app-main' }, contentNodes);
  document.title = title ? `${title} · LeadDesk` : 'LeadDesk';
  return [header, main];
}

function sectionHeader(label) {
  return el('div', { className: 'section-header' }, [
    el('span', { className: 'section-accent' }),
    el('h2', { text: label }),
  ]);
}

/**
 * @param {object} opts
 * @param {string} opts.label
 * @param {string} opts.name
 * @param {string} [opts.type]
 * @param {string} [opts.value]
 * @param {string} [opts.placeholder]
 * @param {boolean} [opts.required]
 * @param {boolean} [opts.readonly]
 * @param {string} [opts.dataField]
 * @param {string} [opts.className]
 */
function fieldInput(opts) {
  const wrap = el('label', { className: `field ${opts.className || ''}` }, [
    el('span', {
      className: 'field-label',
      text: opts.required ? `${opts.label}*` : opts.label,
    }),
  ]);
  const input = el('input', {
    type: opts.type || 'text',
    name: opts.name,
    id: `field-${opts.name}`,
    value: opts.value || '',
    placeholder: opts.placeholder || opts.label,
    ...(opts.required ? { required: 'required' } : {}),
    ...(opts.readonly ? { readonly: 'readonly' } : {}),
    ...(opts.dataField ? { 'data-field': opts.dataField } : { 'data-field': opts.name }),
  });
  wrap.append(input);
  return wrap;
}

/**
 * @param {object} opts
 */
function fieldSelect(opts) {
  const wrap = el('label', { className: `field ${opts.className || ''}` }, [
    el('span', {
      className: 'field-label',
      text: opts.required ? `${opts.label}*` : opts.label,
    }),
  ]);
  const select = el('select', {
    name: opts.name,
    id: `field-${opts.name}`,
    'data-field': opts.dataField || opts.name,
  });
  select.append(el('option', { value: '', text: opts.placeholder || 'Selecionar …' }));
  const selected = matchSelectOption(
    opts.options || [],
    opts.value || '',
    opts.semanticNormalize,
  );
  for (const opt of opts.options || []) {
    const o = el('option', { value: opt, text: opt });
    if (opt === selected) o.selected = true;
    select.append(o);
  }
  wrap.append(select);
  return wrap;
}

function fieldTextarea(opts) {
  const wrap = el('label', { className: `field field-full ${opts.className || ''}` }, [
    el('span', { className: 'field-label', text: opts.label }),
  ]);
  const ta = el('textarea', {
    name: opts.name,
    id: `field-${opts.name}`,
    rows: String(opts.rows || 4),
    placeholder: opts.placeholder || opts.label,
    'data-field': opts.dataField || opts.name,
  });
  ta.value = opts.value || '';
  wrap.append(ta);
  return wrap;
}

function fieldCheckbox(opts) {
  const wrap = el('label', { className: 'checkbox-field' }, []);
  const input = el('input', {
    type: 'checkbox',
    name: opts.name,
    id: `field-${opts.name}`,
    'data-field': opts.dataField || opts.name,
  });
  if (opts.checked) input.checked = true;
  wrap.append(input, document.createTextNode(` ${opts.label}`));
  return wrap;
}

/**
 * Read form values from a container.
 * @param {HTMLElement} form
 */
function readForm(form) {
  /** @type {Record<string, string|boolean>} */
  const data = {};
  form.querySelectorAll('[data-field]').forEach((node) => {
    const key = node.getAttribute('data-field');
    if (!key) return;
    if (node instanceof HTMLInputElement && node.type === 'checkbox') {
      data[key] = node.checked;
    } else if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) {
      data[key] = node.value;
    }
  });
  return data;
}

/**
 * @param {object} lead
 * @returns {string}
 */
function leadLabel(lead) {
  const plate = lead?.plate ? ` matrícula ${lead.plate}` : '';
  return `este lead${plate}`;
}

/**
 * Confirm and delete a lead from IndexedDB.
 * @param {object} lead
 * @param {{ onDeleted?: () => void }} [opts]
 */
async function confirmAndDeleteLead(lead, opts = {}) {
  const ok = confirm(
    `Excluir ${leadLabel(lead)}?\n\nEsta ação não pode ser desfeita.`,
  );
  if (!ok) return false;
  try {
    await deleteLead(lead.id);
    opts.onDeleted?.();
    return true;
  } catch (err) {
    console.error(err);
    alert('Não foi possível excluir o lead. Veja a consola.');
    return false;
  }
}

function fabBar({ onBack, onSave, onPrint, onDelete }) {
  const bar = el('div', { className: 'fab-bar' }, []);
  if (onBack) {
    bar.append(
      el('button', {
        type: 'button',
        className: 'fab fab-back',
        title: 'Voltar',
        'aria-label': 'Voltar',
        onclick: onBack,
      }, [el('span', { className: 'fab-icon', 'aria-hidden': 'true' })]),
    );
  }
  if (onSave) {
    bar.append(
      el('button', {
        type: 'button',
        className: 'fab fab-save',
        title: 'Guardar',
        'aria-label': 'Guardar',
        onclick: onSave,
      }, [el('span', { className: 'fab-icon', 'aria-hidden': 'true' })]),
    );
  }
  if (onPrint) {
    bar.append(
      el('button', {
        type: 'button',
        className: 'fab fab-print',
        title: 'Imprimir',
        'aria-label': 'Imprimir',
        onclick: onPrint,
      }, [el('span', { className: 'fab-icon', 'aria-hidden': 'true' })]),
    );
  }
  if (onDelete) {
    bar.append(
      el('button', {
        type: 'button',
        className: 'fab fab-delete',
        title: 'Excluir lead',
        'aria-label': 'Excluir lead',
        onclick: onDelete,
      }, [el('span', { className: 'fab-icon', 'aria-hidden': 'true' })]),
    );
  }
  return bar;
}

/**
 * Overlay modal shell.
 * @param {string} title
 * @param {Node[]} bodyNodes
 * @param {Node[]} footerNodes
 * @param {() => void} onClose
 */
function modal(title, bodyNodes, footerNodes, onClose) {
  const backdrop = el('div', { className: 'modal-backdrop', role: 'presentation' }, []);
  const dialog = el('div', { className: 'modal', role: 'dialog', 'aria-modal': 'true' }, [
    el('div', { className: 'modal-header' }, [
      el('h1', { text: title }),
      el('button', {
        type: 'button',
        className: 'modal-close',
        'aria-label': 'Fechar',
        text: '×',
        onclick: onClose,
      }),
    ]),
    el('div', { className: 'modal-body' }, bodyNodes),
    el('div', { className: 'modal-footer' }, footerNodes),
  ]);
  backdrop.append(dialog);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) onClose();
  });
  return backdrop;
}

/**
 * Shared "Adicionar Lead" modal → match list or create-client modal.
 * @param {HTMLElement} root
 * @param {{ autoOpen?: boolean }} [opts]
 */
function openAddLeadFlow(root, opts = {}) {
  const existing = root.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const input = el('input', {
    type: 'text',
    id: 'search-query',
    name: 'query',
    className: 'modal-input',
    placeholder: 'Telefone ou matrícula',
    autocomplete: 'off',
    'data-field': 'searchQuery',
  });

  const close = () => {
    backdrop.remove();
    if (opts.autoOpen) {
      navigate('/leads/list', { replace: true });
    }
  };

  const submit = async () => {
    const raw = input.value.trim();
    if (!raw) {
      input.focus();
      input.classList.add('invalid');
      return;
    }
    input.classList.remove('invalid');
    const classified = classifyQuery(raw);
    let matches = [];
    if (classified.kind === 'plate') {
      matches = await findLeadsByPlate(classified.value);
    } else {
      matches = await findLeadsByPhone(classified.value);
    }

    backdrop.remove();

    if (matches.length > 0) {
      renderMatchList(root, {
        kind: classified.kind,
        query: classified.display,
        matches,
      });
      return;
    }

    openCreateClientModal(root, {
      query: classified.display,
      queryKind: classified.kind,
      prefillPhone: classified.kind === 'phone' ? classified.value : '',
      prefillPlate: classified.kind === 'plate' ? classified.value : '',
    });
  };

  const backdrop = modal(
    'Adicionar Lead',
    [input],
    [
      el('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: 'Adicionar Lead',
        onclick: () => void submit(),
      }),
    ],
    close,
  );

  root.append(backdrop);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void submit();
    }
  });
  setTimeout(() => input.focus(), 50);
}

/**
 * List of registered leads with plate/phone filter.
 * @param {HTMLElement} root
 */
export async function renderLeadList(root) {
  clearRoot(root);
  createDraft = null;

  const toolbar = el('div', { className: 'list-toolbar' }, []);
  const searchInput = el('input', {
    type: 'search',
    id: 'list-search',
    className: 'list-search-input',
    placeholder: 'Buscar por matrícula ou telefone',
    autocomplete: 'off',
    'aria-label': 'Buscar por matrícula ou telefone',
  });
  const countEl = el('p', { className: 'muted list-count', text: 'A carregar…' });
  const tableWrap = el('div', { className: 'leads-table-wrap' }, []);

  toolbar.append(
    searchInput,
    el('button', {
      type: 'button',
      className: 'btn btn-primary',
      text: 'Adicionar Lead',
      onclick: () => openAddLeadFlow(root),
    }),
  );

  const page = el('div', { className: 'page page-list' }, [
    el('h1', { className: 'page-title', text: 'Leads cadastrados' }),
    el('p', {
      className: 'muted intro',
      text: 'Pesquise por matrícula ou telefone. Clique numa linha para abrir o lead.',
    }),
    toolbar,
    countEl,
    tableWrap,
  ]);

  root.append(...appShell('Lista de leads', [page]));

  /**
   * @param {object[]} leads
   * @param {string} query
   */
  const paintRows = (leads, query) => {
    tableWrap.replaceChildren();
    if (leads.length === 0) {
      countEl.textContent = query
        ? `Nenhum lead encontrado para “${query}”.`
        : 'Ainda não há leads cadastrados.';
      tableWrap.append(
        el('p', {
          className: 'muted empty-state',
          text: query
            ? 'Tente outro termo ou adicione um novo lead.'
            : 'Use Adicionar Lead para criar o primeiro registo.',
        }),
      );
      return;
    }

    countEl.textContent = query
      ? `${leads.length} resultado(s) para “${query}”`
      : `${leads.length} lead(s)`;

    const thead = el('thead', {}, [
      el('tr', {}, [
        el('th', { className: 'cell-actions', text: '' , 'aria-label': 'Ações' }),
        el('th', { text: 'Matrícula' }),
        el('th', { text: 'Telefone' }),
        el('th', { text: 'Nome' }),
        el('th', { text: 'Veículo' }),
        el('th', { text: 'Estado' }),
        el('th', { text: 'Última edição' }),
      ]),
    ]);

    const tbody = el('tbody', {}, []);
    for (const lead of leads) {
      const name = [lead.fullName || lead.firstName, lead.firstSurname]
        .filter(Boolean)
        .join(' ')
        .trim() || '—';
      const vehicle = [lead.make, lead.model, lead.year].filter(Boolean).join(' · ') || '—';
      const deleteBtn = el(
        'button',
        {
          type: 'button',
          className: 'btn btn-danger btn-icon',
          title: 'Excluir lead',
          'aria-label': `Excluir lead ${lead.plate || lead.id}`,
          onclick: (e) => {
            e.preventDefault();
            e.stopPropagation();
            void confirmAndDeleteLead(lead, { onDeleted: () => void runSearch() });
          },
        },
        [el('span', { className: 'btn-icon-glyph', 'aria-hidden': 'true' })],
      );
      const row = el('tr', {
        className: 'leads-row',
        tabindex: '0',
        role: 'link',
        onclick: () => navigate(`/leads/${lead.id}`),
        onkeydown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            navigate(`/leads/${lead.id}`);
          }
        },
      }, [
        el('td', { className: 'cell-actions' }, [deleteBtn]),
        el('td', { className: 'cell-plate', text: lead.plate || '—' }),
        el('td', { className: 'cell-phone', text: lead.phone || '—' }),
        el('td', { className: 'cell-name', text: name, title: name }),
        el('td', { className: 'cell-vehicle', text: vehicle, title: vehicle }),
        el('td', { className: 'cell-status', text: lead.leadStatus || '—' }),
        el('td', { className: 'cell-date', text: formatDateTime(lead.updatedAt) }),
      ]);
      tbody.append(row);
    }

    tableWrap.append(el('table', { className: 'leads-table' }, [thead, tbody]));
  };

  const runSearch = async () => {
    const q = searchInput.value.trim();
    try {
      const leads = await searchLeads(q);
      paintRows(leads, q);
    } catch (err) {
      console.error(err);
      countEl.textContent = 'Erro ao carregar leads.';
    }
  };

  let debounceTimer = 0;
  searchInput.addEventListener('input', () => {
    window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => void runSearch(), 180);
  });

  await runSearch();
}

/**
 * Entry for /leads/add — opens the Adicionar Lead modal on the list shell.
 * @param {HTMLElement} root
 */
export function renderAddLead(root) {
  void renderLeadList(root).then(() => {
    openAddLeadFlow(root, { autoOpen: true });
  });
}

/**
 * @deprecated Use renderLeadList — kept as alias for older imports.
 * @param {HTMLElement} root
 */
export function renderSearch(root) {
  void renderLeadList(root);
}

/**
 * @param {HTMLElement} root
 * @param {{ kind: string, query: string, matches: object[] }} opts
 */
export function renderMatchList(root, opts) {
  clearRoot(root);

  const isPlate = opts.kind === 'plate';
  const title = isPlate
    ? `Leads com matrícula ${opts.query}`
    : `Leads com telefone ${opts.query}`;

  const list = el('ul', { className: 'match-list' }, []);
  for (const lead of opts.matches) {
    const primary = isPlate
      ? `Telefone: ${lead.phone || '—'}`
      : `Matrícula: ${lead.plate || '—'}`;
    const secondary = `Última edição: ${formatDateTime(lead.updatedAt)}`;
    const item = el('li', {}, [
      el('button', {
        type: 'button',
        className: 'match-item',
        onclick: () => navigate(`/leads/${lead.id}`),
      }, [
        el('span', { className: 'match-primary', text: primary }),
        el('span', { className: 'match-secondary', text: secondary }),
        el('span', {
          className: 'match-meta',
          text: [lead.make, lead.model, lead.year].filter(Boolean).join(' · ') || 'Sem veículo',
        }),
      ]),
    ]);
    list.append(item);
  }

  const page = el('div', { className: 'page' }, [
    el('h1', { className: 'page-title', text: title }),
    el('p', {
      className: 'muted',
      text: `${opts.matches.length} resultado(s). Clique para abrir o lead.`,
    }),
    list,
    el('div', { className: 'page-actions' }, [
      el('button', {
        type: 'button',
        className: 'btn btn-secondary',
        text: 'Nova pesquisa',
        onclick: () => navigate('/leads/list'),
      }),
      el('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: 'Criar novo lead mesmo assim',
        onclick: () => {
          openCreateClientModal(root, {
            query: opts.query,
            queryKind: opts.kind,
            prefillPhone: opts.kind === 'phone' ? normalizePhone(opts.query) : '',
            prefillPlate: opts.kind === 'plate' ? normalizePlate(opts.query) : '',
          });
        },
      }),
    ]),
  ]);

  root.append(...appShell(title, [page]));
}

/**
 * @param {HTMLElement} root
 * @param {{ query: string, queryKind: string, prefillPhone: string, prefillPlate: string }} ctx
 */
function openCreateClientModal(root, ctx) {
  const existing = root.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const form = el('form', { className: 'client-form', id: 'create-client-form' }, [
    el('div', { className: 'form-grid two-col' }, [
      fieldInput({
        label: 'Nome próprio',
        name: 'firstName',
        dataField: 'firstName',
        required: true,
      }),
      fieldInput({
        label: 'Primeiro apelido',
        name: 'firstSurname',
        dataField: 'firstSurname',
      }),
      fieldInput({
        label: 'Segundo apelido',
        name: 'secondSurname',
        dataField: 'secondSurname',
      }),
      fieldInput({
        label: 'Telefone de contacto',
        name: 'phone',
        dataField: 'phone',
        value: ctx.prefillPhone,
        required: true,
        readonly: Boolean(ctx.prefillPhone),
        className: ctx.prefillPhone ? 'field-readonly' : '',
      }),
      fieldInput({ label: 'Email', name: 'email', dataField: 'email', type: 'email' }),
      fieldSelect({
        label: 'Província',
        name: 'province',
        dataField: 'province',
        options: PROVINCES,
      }),
      fieldInput({
        label: 'Município',
        name: 'municipality',
        dataField: 'municipality',
        className: 'field-span-1',
      }),
    ]),
  ]);

  const close = () => backdrop.remove();

  const saveModal = () => {
    const data = readForm(form);
    if (!data.firstName || !data.phone) {
      form.querySelector('[data-field="firstName"]')?.classList.add('invalid');
      form.querySelector('[data-field="phone"]')?.classList.add('invalid');
      return;
    }
    createDraft = {
      query: ctx.query,
      queryKind: ctx.queryKind,
      prefillPlate: ctx.prefillPlate,
      client: {
        firstName: String(data.firstName),
        firstSurname: String(data.firstSurname || ''),
        secondSurname: String(data.secondSurname || ''),
        phone: String(data.phone),
        email: String(data.email || ''),
        province: String(data.province || ''),
        municipality: String(data.municipality || ''),
        otherContact: '',
        acceptTerms: false,
        acceptMarketing: false,
      },
    };
    close();
    navigate('/leads/new');
  };

  const backdrop = modal(
    'Criar cliente',
    [form],
    [
      el('button', {
        type: 'button',
        className: 'btn btn-outline',
        text: 'Fechar',
        onclick: close,
      }),
      el('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: 'Guardar',
        onclick: saveModal,
      }),
    ],
    close,
  );

  root.append(backdrop);
  setTimeout(() => {
    const first = /** @type {HTMLInputElement|null} */ (form.querySelector('[data-field="firstName"]'));
    first?.focus();
  }, 50);
}

/**
 * Build contact + lead + vehicle + prices form.
 * @param {object} values
 * @param {{ editable?: boolean }} [opts]
 */
function buildLeadForm(values, opts = {}) {
  const v = values || {};
  const form = el('form', { className: 'lead-form', id: 'lead-form' }, []);

  form.append(sectionHeader('Dados de Contacto'));
  form.append(
    el('div', { className: 'form-grid three-col' }, [
      fieldInput({
        label: 'Nome completo',
        name: 'fullName',
        dataField: 'fullName',
        value: v.fullName || v.firstName || '',
      }),
      fieldInput({
        label: 'Primeiro apelido',
        name: 'firstSurname',
        dataField: 'firstSurname',
        value: v.firstSurname || '',
      }),
      fieldInput({
        label: 'Segundo apelido',
        name: 'secondSurname',
        dataField: 'secondSurname',
        value: v.secondSurname || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldInput({
        label: 'Telefone',
        name: 'phone',
        dataField: 'phone',
        value: v.phone || '',
      }),
      fieldInput({
        label: 'Outro contacto',
        name: 'otherContact',
        dataField: 'otherContact',
        value: v.otherContact || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid one-col' }, [
      fieldInput({
        label: 'Email',
        name: 'email',
        dataField: 'email',
        type: 'email',
        value: v.email || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldSelect({
        label: 'Província',
        name: 'province',
        dataField: 'province',
        options: PROVINCES,
        value: v.province || '',
      }),
      fieldInput({
        label: 'Município',
        name: 'municipality',
        dataField: 'municipality',
        value: v.municipality || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'checkbox-row' }, [
      fieldCheckbox({
        label: 'Li e aceito os termos e condições',
        name: 'acceptTerms',
        dataField: 'acceptTerms',
        checked: Boolean(v.acceptTerms),
      }),
      fieldCheckbox({
        label: 'Aceito receber comunicações comerciais',
        name: 'acceptMarketing',
        dataField: 'acceptMarketing',
        checked: Boolean(v.acceptMarketing),
      }),
    ]),
  );

  form.append(sectionHeader('Dados do Lead'));
  form.append(
    el('div', { className: 'form-grid one-col' }, [
      fieldSelect({
        label: 'Estado do Lead',
        name: 'leadStatus',
        dataField: 'leadStatus',
        options: LEAD_STATUSES,
        value: v.leadStatus || 'Novo',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldSelect({
        label: 'Origem do Lead',
        name: 'leadOrigin',
        dataField: 'leadOrigin',
        options: LEAD_ORIGINS,
        value: v.leadOrigin || '',
      }),
      fieldSelect({
        label: 'Forma de contacto',
        name: 'contactMethod',
        dataField: 'contactMethod',
        options: CONTACT_METHODS,
        value: v.contactMethod || 'Whatsapp',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldSelect({
        label: 'Local',
        name: 'branch',
        dataField: 'branch',
        options: BRANCHES,
        value: v.branch || 'Lisboa',
      }),
      fieldInput({
        label: 'Marca comercial',
        name: 'commercialBrand',
        dataField: 'commercialBrand',
        value: v.commercialBrand || 'LeadDesk',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldInput({
        label: 'Portal',
        name: 'portal',
        dataField: 'portal',
        value: v.portal || '',
      }),
      fieldInput({
        label: 'Anúncio',
        name: 'adId',
        dataField: 'adId',
        value: v.adId || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldInput({
        label: 'Data de publicação',
        name: 'publicationDate',
        dataField: 'publicationDate',
        type: 'date',
        value: v.publicationDate || '',
      }),
      fieldInput({
        label: 'Data de extração',
        name: 'extractionDate',
        dataField: 'extractionDate',
        type: 'date',
        value: v.extractionDate || '',
      }),
    ]),
  );
  form.append(
    fieldTextarea({
      label: 'Descrição do anúncio',
      name: 'adDescription',
      dataField: 'adDescription',
      value: v.adDescription || '',
      placeholder: 'Descrição do anúncio',
    }),
  );

  form.append(sectionHeader('Dados do veículo'));
  form.append(
    el('div', { className: 'subsection-title', text: 'Dados básicos do veículo' }),
  );
  form.append(
    el('div', { className: 'form-grid three-col' }, [
      fieldSelect({
        label: 'Marca',
        name: 'make',
        dataField: 'make',
        options: MAKES,
        value: v.make || '',
        placeholder: 'Marca',
        semanticNormalize: expandMakeAlias,
      }),
      fieldInput({
        label: 'Modelo',
        name: 'model',
        dataField: 'model',
        value: v.model || '',
        placeholder: 'Modelo',
      }),
      fieldInput({
        label: 'Ano',
        name: 'year',
        dataField: 'year',
        value: v.year || '',
        placeholder: 'Ano',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldSelect({
        label: 'Combustível',
        name: 'fuel',
        dataField: 'fuel',
        options: FUELS,
        value: v.fuel || '',
        placeholder: 'Combustível',
      }),
      fieldSelect({
        label: 'Caixa de velocidades',
        name: 'transmission',
        dataField: 'transmission',
        options: TRANSMISSIONS,
        value: v.transmission || '',
        placeholder: 'Caixa de velocidades',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldSelect({
        label: 'Carroçaria',
        name: 'bodyType',
        dataField: 'bodyType',
        options: BODY_TYPES,
        value: v.bodyType || '',
        placeholder: 'Carroçaria',
      }),
      fieldInput({
        label: 'Versão',
        name: 'version',
        dataField: 'version',
        value: v.version || '',
        placeholder: 'Versão',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid three-col' }, [
      fieldInput({
        label: 'KM',
        name: 'mileageKm',
        dataField: 'mileageKm',
        value: v.mileageKm || '0',
        placeholder: '0',
      }),
      fieldInput({
        label: 'Matrícula',
        name: 'plate',
        dataField: 'plate',
        value: v.plate || '',
        placeholder: 'Matrícula',
      }),
      fieldInput({
        label: 'Nº de chassis',
        name: 'chassis',
        dataField: 'chassis',
        value: v.chassis || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid two-col' }, [
      fieldInput({
        label: 'Motor',
        name: 'engine',
        dataField: 'engine',
        value: v.engine || '',
      }),
      fieldInput({
        label: 'Potência (CV)',
        name: 'powerCv',
        dataField: 'powerCv',
        value: v.powerCv || '',
      }),
    ]),
  );
  form.append(
    el('div', { className: 'checkbox-row' }, [
      fieldCheckbox({
        label: 'Importado?',
        name: 'imported',
        dataField: 'imported',
        checked: Boolean(v.imported),
      }),
    ]),
  );
  form.append(
    el('div', { className: 'form-grid one-col' }, [
      fieldInput({
        label: 'ITV',
        name: 'itvDate',
        dataField: 'itvDate',
        type: 'date',
        value: v.itvDate || '',
        placeholder: 'dd/mm/aaaa',
      }),
    ]),
  );

  form.append(sectionHeader('Preços'));
  form.append(
    el('div', { className: 'subsection-header' }, [
      el('span', { className: 'section-accent' }),
      el('h3', { text: 'Preço de compra direta' }),
    ]),
  );
  form.append(
    el('p', {
      className: 'muted price-meta',
      text: 'Avaliação online — Preço carro novo: — €',
    }),
  );
  form.append(
    el('div', { className: 'form-grid one-col' }, [
      fieldInput({
        label: 'Preço indicado pelo cliente',
        name: 'customerValueEur',
        dataField: 'customerValueEur',
        value: v.customerValueEur || '',
        placeholder: '0',
      }),
    ]),
  );
  form.append(
    el('p', {
      className: 'field-hint',
      text: '*A avaliação online não teve em conta o valor dos extras',
    }),
  );
  form.append(
    el('div', { className: 'alert alert-warning' }, [
      el('span', { className: 'alert-icon', 'aria-hidden': 'true' }),
      el('span', {
        text: 'Campos de preços bloqueados. Anexar imagens do veículo e designar local.',
      }),
    ]),
  );
  form.append(
    el('p', { className: 'muted', text: 'Preço preliminar: — €' }),
    el('p', { className: 'muted', text: 'Preço oferecido: — €' }),
  );
  form.append(
    fieldTextarea({
      label: 'Comentários',
      name: 'comments',
      dataField: 'comments',
      value: v.comments || '',
      placeholder: 'Comentários…',
      rows: 3,
    }),
  );

  if (opts.editable === false) {
    form.querySelectorAll('input, select, textarea').forEach((node) => {
      if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement || node instanceof HTMLTextAreaElement) {
        node.disabled = true;
      }
    });
  }

  return form;
}

/**
 * New lead page — draft in memory until FAB save.
 * @param {HTMLElement} root
 */
export function renderNewLead(root) {
  clearRoot(root);

  if (!createDraft?.client) {
    const page = el('div', { className: 'page' }, [
      el('h1', { className: 'page-title', text: 'Sem rascunho' }),
      el('p', {
        className: 'muted',
        text: 'Comece por pesquisar um telefone ou matrícula na página inicial.',
      }),
      el('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: 'Ir para pesquisa',
        onclick: () => navigate('/leads/list'),
      }),
    ]);
    root.append(...appShell('Novo lead', [page]));
    return;
  }

  const client = createDraft.client;
  const initial = {
    fullName: client.firstName,
    firstSurname: client.firstSurname,
    secondSurname: client.secondSurname,
    phone: client.phone,
    email: client.email,
    province: client.province,
    municipality: client.municipality,
    otherContact: client.otherContact || '',
    acceptTerms: client.acceptTerms,
    acceptMarketing: client.acceptMarketing,
    plate: createDraft.prefillPlate || '',
    leadStatus: 'Novo',
    contactMethod: 'Whatsapp',
    branch: 'Lisboa',
    commercialBrand: 'LeadDesk',
    mileageKm: '0',
  };

  const form = buildLeadForm(initial);
  const banner = el('div', { className: 'draft-banner' }, [
    el('strong', { text: 'Rascunho' }),
    document.createTextNode(
      ' — contacto e anúncio só são gravados ao clicar no botão verde Guardar.',
    ),
  ]);

  const page = el('div', { className: 'page page-edit' }, [banner, form]);
  root.append(...appShell('Novo lead', [page]));
  root.append(
    fabBar({
      onBack: () => {
        if (confirm('Descartar o rascunho e voltar?')) {
          createDraft = null;
          navigate('/leads/list');
        }
      },
      onSave: () => void persistNewLead(root, form),
    }),
  );
}

/**
 * @param {HTMLElement} root
 * @param {HTMLElement} form
 */
async function persistNewLead(root, form) {
  if (!createDraft?.client) return;
  const data = readForm(form);
  const nowClientId = newId('client');
  const nowLeadId = newId('lead');

  const client = {
    id: nowClientId,
    firstName: String(data.fullName || createDraft.client.firstName || ''),
    firstSurname: String(data.firstSurname || ''),
    secondSurname: String(data.secondSurname || ''),
    phone: String(data.phone || createDraft.client.phone || ''),
    otherContact: String(data.otherContact || ''),
    email: String(data.email || ''),
    province: String(data.province || ''),
    municipality: String(data.municipality || ''),
    acceptTerms: Boolean(data.acceptTerms),
    acceptMarketing: Boolean(data.acceptMarketing),
  };

  const lead = {
    id: nowLeadId,
    clientId: nowClientId,
    plate: String(data.plate || ''),
    phone: String(data.phone || client.phone),
    fullName: String(data.fullName || ''),
    firstSurname: String(data.firstSurname || ''),
    secondSurname: String(data.secondSurname || ''),
    otherContact: String(data.otherContact || ''),
    email: String(data.email || ''),
    province: String(data.province || ''),
    municipality: String(data.municipality || ''),
    acceptTerms: Boolean(data.acceptTerms),
    acceptMarketing: Boolean(data.acceptMarketing),
    leadStatus: String(data.leadStatus || ''),
    leadOrigin: String(data.leadOrigin || ''),
    contactMethod: String(data.contactMethod || ''),
    branch: String(data.branch || ''),
    commercialBrand: String(data.commercialBrand || ''),
    portal: String(data.portal || ''),
    adId: String(data.adId || ''),
    publicationDate: String(data.publicationDate || ''),
    extractionDate: String(data.extractionDate || ''),
    adDescription: String(data.adDescription || ''),
    make: String(data.make || ''),
    model: String(data.model || ''),
    year: String(data.year || ''),
    fuel: String(data.fuel || ''),
    transmission: String(data.transmission || ''),
    bodyType: String(data.bodyType || ''),
    version: String(data.version || ''),
    mileageKm: String(data.mileageKm || ''),
    chassis: String(data.chassis || ''),
    imported: Boolean(data.imported),
    itvDate: String(data.itvDate || ''),
    engine: String(data.engine || ''),
    powerCv: String(data.powerCv || ''),
    customerValueEur: String(data.customerValueEur || ''),
    comments: String(data.comments || ''),
  };

  try {
    await saveClientAndLead(client, lead);
    createDraft = null;
    navigate(`/leads/${nowLeadId}`, { replace: true });
  } catch (err) {
    console.error(err);
    alert('Não foi possível guardar o lead. Veja a consola.');
  }
}

/**
 * Saved lead detail / edit page.
 * @param {HTMLElement} root
 * @param {string} id
 */
export async function renderLeadDetail(root, id) {
  clearRoot(root);

  const lead = await getLead(id);
  if (!lead) {
    const page = el('div', { className: 'page' }, [
      el('h1', { className: 'page-title', text: 'Lead não encontrado' }),
      el('p', { className: 'muted', text: `Não existe lead com id ${id}.` }),
      el('button', {
        type: 'button',
        className: 'btn btn-primary',
        text: 'Voltar',
        onclick: () => navigate('/leads/list'),
      }),
    ]);
    root.append(...appShell('Lead', [page]));
    return;
  }

  const client = (await getClient(lead.clientId)) || {};
  const values = {
    ...lead,
    fullName: lead.fullName || client.firstName || '',
    firstSurname: lead.firstSurname || client.firstSurname || '',
    secondSurname: lead.secondSurname || client.secondSurname || '',
    phone: lead.phone || client.phone || '',
    email: lead.email || client.email || '',
  };

  const tabs = el('div', { className: 'tabs' }, [
    el('button', { type: 'button', className: 'tab active', text: 'DADOS' }),
    el('button', {
      type: 'button',
      className: 'tab',
      text: 'AVALIAÇÕES ANTERIORES',
      disabled: 'disabled',
    }),
  ]);

  const meta = el('p', {
    className: 'muted lead-meta',
    text: `Lead ${lead.id} · Atualizado ${formatDateTime(lead.updatedAt)}`,
  });

  const form = buildLeadForm(values);
  const page = el('div', { className: 'page page-edit' }, [tabs, meta, form]);
  root.append(...appShell(`Lead ${lead.plate || lead.id}`, [page]));
  root.append(
    fabBar({
      onBack: () => navigate('/leads/list'),
      onSave: () => void persistExistingLead(lead, client, form),
      onPrint: () => window.print(),
      onDelete: () =>
        void confirmAndDeleteLead(lead, {
          onDeleted: () => navigate('/leads/list', { replace: true }),
        }),
    }),
  );
}

/**
 * @param {object} existingLead
 * @param {object} existingClient
 * @param {HTMLElement} form
 */
async function persistExistingLead(existingLead, existingClient, form) {
  const data = readForm(form);
  const client = {
    id: existingClient.id || existingLead.clientId,
    firstName: String(data.fullName || existingClient.firstName || ''),
    firstSurname: String(data.firstSurname || ''),
    secondSurname: String(data.secondSurname || ''),
    phone: String(data.phone || ''),
    otherContact: String(data.otherContact || ''),
    email: String(data.email || ''),
    province: String(data.province || ''),
    municipality: String(data.municipality || ''),
    acceptTerms: Boolean(data.acceptTerms),
    acceptMarketing: Boolean(data.acceptMarketing),
    createdAt: existingClient.createdAt,
  };

  const lead = {
    ...existingLead,
    plate: String(data.plate || ''),
    phone: String(data.phone || ''),
    fullName: String(data.fullName || ''),
    firstSurname: String(data.firstSurname || ''),
    secondSurname: String(data.secondSurname || ''),
    otherContact: String(data.otherContact || ''),
    email: String(data.email || ''),
    province: String(data.province || ''),
    municipality: String(data.municipality || ''),
    acceptTerms: Boolean(data.acceptTerms),
    acceptMarketing: Boolean(data.acceptMarketing),
    leadStatus: String(data.leadStatus || ''),
    leadOrigin: String(data.leadOrigin || ''),
    contactMethod: String(data.contactMethod || ''),
    branch: String(data.branch || ''),
    commercialBrand: String(data.commercialBrand || ''),
    portal: String(data.portal || ''),
    adId: String(data.adId || ''),
    publicationDate: String(data.publicationDate || ''),
    extractionDate: String(data.extractionDate || ''),
    adDescription: String(data.adDescription || ''),
    make: String(data.make || ''),
    model: String(data.model || ''),
    year: String(data.year || ''),
    fuel: String(data.fuel || ''),
    transmission: String(data.transmission || ''),
    bodyType: String(data.bodyType || ''),
    version: String(data.version || ''),
    mileageKm: String(data.mileageKm || ''),
    chassis: String(data.chassis || ''),
    imported: Boolean(data.imported),
    itvDate: String(data.itvDate || ''),
    engine: String(data.engine || ''),
    powerCv: String(data.powerCv || ''),
    customerValueEur: String(data.customerValueEur || ''),
    comments: String(data.comments || ''),
  };

  try {
    await updateClientAndLead(client, lead);
    alert('Lead guardado.');
    navigate(`/leads/${lead.id}`, { replace: true });
  } catch (err) {
    console.error(err);
    alert('Erro ao guardar.');
  }
}
