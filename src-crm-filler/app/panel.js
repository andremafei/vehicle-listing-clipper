/**
 * Floating CRM panel UI (bundled into Vehicle Listing Clipper).
 */

const STYLES = `
:host, .lcf-root {
  all: initial;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 13px;
  color: #222;
}
.lcf-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 360px;
  max-height: min(80vh, 640px);
  overflow: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0,0,0,.28);
  display: flex;
  flex-direction: column;
}
.lcf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: #2f2f2f;
  color: #fff;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}
.lcf-title { font-weight: 700; font-size: 13px; }
.lcf-badge {
  font-size: 11px;
  background: #f07a1a;
  color: #fff;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}
.lcf-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.lcf-hint {
  color: #666;
  font-size: 12px;
  line-height: 1.35;
}
.lcf-textarea {
  width: 100%;
  min-height: 72px;
  max-height: 140px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  resize: vertical;
  font: inherit;
}
.lcf-row { display: flex; flex-wrap: wrap; gap: 6px; }
.lcf-btn {
  border: 1px solid #bbb;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}
.lcf-btn:disabled { opacity: .5; cursor: not-allowed; }
.lcf-btn-primary { background: #f07a1a; border-color: #f07a1a; color: #fff; }
.lcf-btn-danger { background: #c62828; border-color: #c62828; color: #fff; }
.lcf-summary {
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.45;
}
.lcf-summary strong { display: inline-block; min-width: 72px; }
.lcf-section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #666;
  margin: 2px 0 0;
}
.lcf-matches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lcf-match {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  padding: 10px;
}
.lcf-match-title { font-weight: 700; font-size: 13px; }
.lcf-match-sub { color: #555; font-size: 12px; line-height: 1.35; }
.lcf-match-open {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #c45a00;
  font: inherit;
  font-weight: 700;
  font-size: 13px;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.lcf-match-open:hover { color: #f07a1a; }
.lcf-status {
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f3f3f3;
  border: 1px solid #e4e4e4;
  color: #444;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}
.lcf-status[data-tone="ok"] {
  background: #eef8ee;
  border-color: #c8e6c9;
  color: #1b5e20;
}
.lcf-status[data-tone="warn"] {
  background: #fff8e6;
  border-color: #ffe0a3;
  color: #7a4d00;
}
.lcf-status[data-tone="error"] {
  background: #fdecea;
  border-color: #f5c6c2;
  color: #8a1f1b;
}
.lcf-mini { border: none; background: transparent; color: #fff; cursor: pointer; font-size: 16px; }
`;

/**
 * @param {object} handlers
 */
export function createFillerPanel(handlers) {
  const host = document.createElement('div');
  host.id = 'lead-crm-filler-root';
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLES;

  const panel = document.createElement('div');
  panel.className = 'lcf-panel';

  const header = document.createElement('div');
  header.className = 'lcf-header';
  const title = document.createElement('div');
  title.className = 'lcf-title';
  title.textContent = 'CRM · Leads';
  const badge = document.createElement('span');
  badge.className = 'lcf-badge';
  badge.textContent = 'CRM';
  const miniBtn = document.createElement('button');
  miniBtn.type = 'button';
  miniBtn.className = 'lcf-mini';
  miniBtn.textContent = '–';
  header.append(title, badge, miniBtn);

  const body = document.createElement('div');
  body.className = 'lcf-body';

  const hint = document.createElement('div');
  hint.className = 'lcf-hint';
  hint.textContent = 'Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia o clipboard.';

  const textarea = document.createElement('textarea');
  textarea.className = 'lcf-textarea';
  textarea.placeholder = 'Cole aqui o texto do Clipper…';

  const summary = document.createElement('div');
  summary.className = 'lcf-summary';
  summary.hidden = true;

  const matchesLabel = document.createElement('div');
  matchesLabel.className = 'lcf-section-label';
  matchesLabel.textContent = 'Leads encontrados';
  matchesLabel.hidden = true;

  const matches = document.createElement('ul');
  matches.className = 'lcf-matches';

  const row1 = document.createElement('div');
  row1.className = 'lcf-row';
  const readBtn = document.createElement('button');
  readBtn.type = 'button';
  readBtn.className = 'lcf-btn';
  readBtn.textContent = 'Ler clipboard';
  const parseBtn = document.createElement('button');
  parseBtn.type = 'button';
  parseBtn.className = 'lcf-btn';
  parseBtn.textContent = 'Parse texto';
  const verifyBtn = document.createElement('button');
  verifyBtn.type = 'button';
  verifyBtn.className = 'lcf-btn lcf-btn-primary';
  verifyBtn.textContent = 'Verificar cadastro';
  verifyBtn.disabled = true;
  row1.append(readBtn, parseBtn, verifyBtn);

  const row2 = document.createElement('div');
  row2.className = 'lcf-row';
  const createBtn = document.createElement('button');
  createBtn.type = 'button';
  createBtn.className = 'lcf-btn lcf-btn-danger';
  createBtn.textContent = 'Criar lead';
  createBtn.disabled = true;
  createBtn.hidden = true;
  row2.append(createBtn);

  const status = document.createElement('div');
  status.className = 'lcf-status';
  status.dataset.tone = '';
  status.textContent = 'Aguardando dados do anúncio.';

  body.append(hint, textarea, summary, matchesLabel, matches, row1, row2, status);
  panel.append(header, body);
  shadow.append(style, panel);
  document.documentElement.append(host);

  let minimized = false;
  miniBtn.addEventListener('click', () => {
    minimized = !minimized;
    body.hidden = minimized;
    miniBtn.textContent = minimized ? '+' : '–';
  });

  // drag
  let dragging = false;
  let ox = 0;
  let oy = 0;
  header.addEventListener('pointerdown', (e) => {
    if (e.target === miniBtn) return;
    dragging = true;
    const rect = panel.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    header.setPointerCapture(e.pointerId);
  });
  header.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    panel.style.left = `${e.clientX - ox}px`;
    panel.style.top = `${e.clientY - oy}px`;
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  header.addEventListener('pointerup', () => {
    dragging = false;
  });

  readBtn.addEventListener('click', () => handlers.onReadClipboard());
  parseBtn.addEventListener('click', () => handlers.onParseText(textarea.value));
  textarea.addEventListener('paste', () => {
    setTimeout(() => handlers.onParseText(textarea.value), 0);
  });
  verifyBtn.addEventListener('click', () => handlers.onVerify());
  createBtn.addEventListener('click', () => handlers.onCreate());

  return {
    setBadge(label) {
      badge.textContent = label;
    },
    /**
     * @param {string} message
     * @param {'ok'|'warn'|'error'|''} [tone]
     */
    setStatus(message, tone = '') {
      status.textContent = message;
      status.dataset.tone = tone || '';
    },
    setText(value) {
      textarea.value = value;
    },
    getText() {
      return textarea.value;
    },
    setSummary(htmlOrNull) {
      if (!htmlOrNull) {
        summary.hidden = true;
        summary.textContent = '';
        return;
      }
      summary.hidden = false;
      summary.innerHTML = htmlOrNull;
    },
    setVerifyEnabled(on) {
      verifyBtn.disabled = !on;
    },
    setCreateVisible(on, enabled = true) {
      createBtn.hidden = !on;
      createBtn.disabled = !enabled;
    },
    /**
     * @param {Array<{ id: string|number, title: string, subtitle: string }>} items
     * @param {(id: string|number) => void} onOpen
     */
    setMatches(items, onOpen) {
      matches.replaceChildren();
      matchesLabel.hidden = items.length === 0;
      for (const item of items) {
        const li = document.createElement('li');
        const card = document.createElement('div');
        card.className = 'lcf-match';

        const titleEl = document.createElement('div');
        titleEl.className = 'lcf-match-title';
        titleEl.textContent = item.title;

        const subEl = document.createElement('div');
        subEl.className = 'lcf-match-sub';
        subEl.textContent = item.subtitle;

        const openLink = document.createElement('button');
        openLink.type = 'button';
        openLink.className = 'lcf-match-open';
        openLink.textContent = 'Abrir lead →';
        openLink.addEventListener('click', () => onOpen(item.id));

        card.append(titleEl, subEl, openLink);
        li.append(card);
        matches.append(li);
      }
    },
    clearMatches() {
      matches.replaceChildren();
      matchesLabel.hidden = true;
    },
    destroy() {
      host.remove();
    },
  };
}
