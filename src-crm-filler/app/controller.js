import { parseLeadClip } from '../../src/clipboard/lead-clip.js';
import { detectCrmContext } from './context.js';
import {
  createLeadClient,
  createLeadCompra,
  findLeadClients,
  getAuthMe,
  getPurchaseLeadsForClient,
  getUserLocal,
  fetchFiltro,
  fetchStockOptions,
} from './crm-api.js';
import {
  createLeadFromClip as createLeadDeskLead,
  findLeadsByPhone,
  findLeadsByPlate,
} from './leaddesk-db.js';
import {
  HAR_DEFAULTS,
  buildCreateClientBody,
  buildCreateLeadBody,
  normalizePlate,
  pickFiltro,
  resolveClipPhone,
  resolveVehicleFromStock,
} from './map-clip-to-api.js';
import { finishCreateInNewTab, openLeadInNewTab, reserveLeadTab } from './open-lead.js';
import { createFillerPanel } from './panel.js';

/**
 * @param {'new-tab' | 'same-tab'} mode
 * @param {string|number} leadId
 */
function statusAfterOpen(mode, leadId) {
  if (mode === 'new-tab') {
    return [`Lead ${leadId} aberto em nova aba.`, 'ok'];
  }
  return [
    `Lead ${leadId}: pop-up bloqueado — abrindo nesta aba…`,
    'warn',
  ];
}

/**
 * @returns {{ destroy: () => void }}
 */
export function createFillerController() {
  /** @type {import('../../src/clipboard/lead-clip.js').LeadClipPayload | null} */
  let payload = null;
  /** @type {ReturnType<typeof createFillerPanel> | null} */
  let panel = null;
  let busy = false;
  /** @type {MutationObserver | null} */
  let routeObserver = null;
  /** @type {string | null} */
  let lastKind = null;

  function refreshContext() {
    const ctx = detectCrmContext();
    panel?.setBadge(ctx.label);
    // Lead detail: always start minimized (new tab or SPA navigation into detail).
    // Do not re-force minimize on every DOM mutation while the user keeps the panel open.
    if (ctx.kind === 'leadDetail' && lastKind !== 'leadDetail') {
      panel?.setMinimized(true);
    }
    lastKind = ctx.kind;
    return ctx;
  }

  /**
   * @param {string} text
   * @returns {boolean} true when LEAD_CLIP_V1 parsed successfully
   */
  function applyParsedText(text) {
    const parsed = parseLeadClip(text);
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    if (!parsed.ok) {
      payload = null;
      panel?.setSummary(null);
      panel?.setStatus(`Falha ao analisar o texto: ${parsed.error}`, 'error');
      return false;
    }
    payload = parsed.payload;
    panel?.setText(text);
    const effectivePhone = resolveClipPhone(payload);
    panel?.setSummary(
      [
        `<div><strong>ID</strong> ${esc(payload.id)}</div>`,
        `<div><strong>Placa</strong> ${esc(payload.plate || '—')}</div>`,
        `<div><strong>Telefone</strong> ${esc(effectivePhone || '—')}</div>`,
        `<div><strong>Veículo</strong> ${esc([payload.make, payload.model, payload.year].filter(Boolean).join(' · ') || '—')}</div>`,
        `<div><strong>URL</strong> ${esc(payload.url || '—')}</div>`,
      ].join(''),
    );
    refreshContext();
    panel?.setStatus('LEAD_CLIP_V1 encontrado. Verificando cadastro…', 'ok');
    return true;
  }

  async function onReadClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      panel?.setText(text);
      if (applyParsedText(text)) {
        await onVerify();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'área de transferência indisponível';
      panel?.setStatus(
        `Não foi possível ler a área de transferência (${message}). Cole o texto do Clipper no campo acima.`,
        'warn',
      );
    }
  }

  /**
   * @param {string} text
   */
  async function onParseText(text) {
    if (applyParsedText(text)) {
      await onVerify();
    }
  }

  async function onVerify() {
    if (!payload || busy) return;
    const ctx = refreshContext();
    if (ctx.backend === 'leaddesk') {
      await verifyLeadDesk();
      return;
    }
    await verifyFlexicar();
  }

  async function verifyLeadDesk() {
    busy = true;
    panel?.setStatus('Verificando no LeadDesk…');
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    try {
      const plate = normalizePlate(payload.plate);
      const phone = resolveClipPhone(payload);
      let leads = [];
      if (plate) {
        leads = await findLeadsByPlate(plate);
      }
      if (leads.length === 0 && phone) {
        leads = await findLeadsByPhone(phone);
      }
      if (!plate && !phone) {
        panel?.setStatus('Os dados não têm placa nem telefone.', 'warn');
        return;
      }
      if (leads.length === 0) {
        panel?.setStatus(
          'Nenhum cadastro no LeadDesk. É possível criar um novo lead.',
          'warn',
        );
        panel?.setCreateVisible(true, true);
        return;
      }
      const items = leads.map((lead) => ({
        id: lead.id,
        title: `Lead ${lead.plate || lead.id}`,
        subtitle: `${lead.phone || '—'} · ${[lead.make, lead.model, lead.year].filter(Boolean).join(' · ') || '—'} · ${lead.leadStatus || ''} · ${lead.updatedAt || ''}`.trim(),
      }));
      panel?.setMatches(items, (id) => {
        const mode = openLeadInNewTab(`/crm/leads/${id}`);
        const [message, tone] = statusAfterOpen(mode, id);
        panel?.setStatus(message, tone);
      });
      panel?.setStatus(
        items.length === 1
          ? '1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.'
          : `${items.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`,
        'ok',
      );
      panel?.setCreateVisible(true, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro';
      panel?.setStatus(`Erro na verificação LeadDesk: ${message}`, 'error');
    } finally {
      busy = false;
    }
  }

  async function verifyFlexicar() {
    busy = true;
    panel?.setStatus('Verificando no CRM…');
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    try {
      const plate = normalizePlate(payload.plate);
      const phone = resolveClipPhone(payload);
      let result;
      if (plate) {
        result = await findLeadClients({ plate });
        if (result.ok && Array.isArray(result.data) && result.data.length === 0 && phone) {
          result = await findLeadClients({ phone });
        }
      } else if (phone) {
        result = await findLeadClients({ phone });
      } else {
        panel?.setStatus('Os dados não têm placa nem telefone.', 'warn');
        return;
      }

      if (!result.ok) {
        panel?.setStatus(
          `Falha na verificação (HTTP ${result.status}). Está autenticado no CRM?`,
          'error',
        );
        return;
      }

      const clients = Array.isArray(result.data) ? result.data : [];
      if (clients.length === 0) {
        panel?.setStatus(
          'Nenhum cadastro para esta placa/telefone. É possível criar o lead.',
          'warn',
        );
        panel?.setCreateVisible(true, true);
        return;
      }

      /** @type {Array<{ id: string|number, title: string, subtitle: string }>} */
      const items = [];
      for (const client of clients) {
        const leadId = client?.purchaseLead?.id;
        if (leadId) {
          items.push({
            id: leadId,
            title: `Lead #${leadId}`,
            subtitle: `${client.name || ''} ${client.firstSurname || ''} · ${client.contact?.primaryPhone || ''} · ${client.purchaseLead?.statusName || ''}`.trim(),
          });
        } else if (client?.id) {
          const leads = await getPurchaseLeadsForClient(client.id);
          const rows = leads.data?.results || [];
          for (const row of rows) {
            items.push({
              id: row.id,
              title: `Lead #${row.id}`,
              subtitle: `Placa ${row.plate || '—'} · ${row.status?.name || ''} · ${row.lastAction || ''}`.trim(),
            });
          }
          if (rows.length === 0) {
            items.push({
              id: `client:${client.id}`,
              title: `Cliente #${client.id} (sem lead de compra)`,
              subtitle: `${client.name || ''} ${client.firstSurname || ''} · ${client.contact?.primaryPhone || ''}`.trim(),
            });
          }
        }
      }

      const openable = items.filter((i) => String(i.id).match(/^\d+$/));
      panel?.setMatches(openable.length ? openable : items, (id) => {
        if (String(id).startsWith('client:')) {
          panel?.setStatus(
            'Cliente sem lead de compra. É possível criar um novo lead.',
            'warn',
          );
          panel?.setCreateVisible(true, true);
          return;
        }
        const mode = openLeadInNewTab(`/main/lead-tasacion/${id}`);
        const [message, tone] = statusAfterOpen(mode, id);
        panel?.setStatus(message, tone);
      });
      panel?.setStatus(
        openable.length === 1
          ? '1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.'
          : openable.length > 1
            ? `${openable.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`
            : 'Cliente encontrado sem lead válido para abrir. É possível criar um lead.',
        openable.length ? 'ok' : 'warn',
      );
      panel?.setCreateVisible(true, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro';
      panel?.setStatus(`Erro na verificação: ${message}`, 'error');
    } finally {
      busy = false;
    }
  }

  async function onCreate() {
    if (!payload || busy) return;
    const ctx = refreshContext();
    if (ctx.backend === 'leaddesk') {
      await createOnLeadDesk();
      return;
    }
    await createOnFlexicar();
  }

  async function createOnLeadDesk() {
    const phone = resolveClipPhone(payload);
    if (!phone && !normalizePlate(payload.plate)) {
      panel?.setStatus('É necessário telefone ou placa para criar.', 'warn');
      return;
    }
    // Reserve tab during the click gesture before awaits (popup blockers).
    const tab = reserveLeadTab();
    busy = true;
    panel?.setStatus('Criando no LeadDesk…');
    try {
      const leadId = await createLeadDeskLead(payload);
      const mode = tab.go(`/crm/leads/${leadId}`);
      finishCreateInNewTab(mode, leadId, panel);
    } catch (error) {
      tab.cancel();
      const message = error instanceof Error ? error.message : 'erro';
      panel?.setStatus(`Erro ao criar no LeadDesk: ${message}`, 'error');
    } finally {
      busy = false;
    }
  }

  async function createOnFlexicar() {
    const phone = resolveClipPhone(payload);
    if (!phone && !normalizePlate(payload.plate)) {
      panel?.setStatus('É necessário telefone ou placa para criar.', 'warn');
      return;
    }
    if (!confirm('Criar cliente/lead no CRM com os dados copiados?')) {
      return;
    }
    // Reserve tab during the click/confirm gesture before awaits (popup blockers).
    const tab = reserveLeadTab();
    busy = true;
    panel?.setStatus('Criando no CRM…');
    try {
      const meRes = await getAuthMe();
      if (!meRes.ok || !meRes.data?.id) {
        tab.cancel();
        panel?.setStatus(
          `Falha de autenticação (HTTP ${meRes.status}). Faça login no CRM.`,
          'error',
        );
        return;
      }
      const me = meRes.data;
      const localRes = await getUserLocal();
      const localId =
        (Array.isArray(localRes.data) && localRes.data[0]?.value) ||
        HAR_DEFAULTS.id_local_actual;

      const [estadoF, origenF, contactoF, marcaF] = await Promise.all([
        fetchFiltro('estado_lead_compra'),
        fetchFiltro('origen_lead_compra'),
        fetchFiltro('contacto'),
        fetchFiltro('marcas_comerciales', me.id),
      ]);

      const filters = {
        estado: pickFiltro(estadoF.data, 'Avaliação') || HAR_DEFAULTS.estado,
        origen: pickFiltro(origenF.data, 'Captación') || HAR_DEFAULTS.origen,
        contacto: pickFiltro(contactoF.data, 'Whatsapp') || HAR_DEFAULTS.forma_contacto,
        marca: pickFiltro(marcaF.data, '') || HAR_DEFAULTS.marca_comercial,
      };

      let clientId = null;
      if (phone) {
        const existing = await findLeadClients({ phone });
        if (existing.ok && Array.isArray(existing.data) && existing.data[0]?.id) {
          clientId = existing.data[0].id;
        }
      }
      if (!clientId) {
        const created = await createLeadClient(buildCreateClientBody(payload));
        if (created.status === 409) {
          const again = await findLeadClients({
            phone: phone || undefined,
            plate: normalizePlate(payload.plate) || undefined,
          });
          clientId = again.data?.[0]?.id;
        } else if (created.ok && created.data?.resourceId) {
          clientId = created.data.resourceId;
        } else {
          tab.cancel();
          panel?.setStatus(
            `Falha ao criar cliente (HTTP ${created.status}): ${JSON.stringify(created.data)}`,
            'error',
          );
          return;
        }
      }
      if (!clientId) {
        tab.cancel();
        panel?.setStatus('Não foi possível obter clientId.', 'error');
        return;
      }

      const vehicle = await resolveVehicleFromStock(payload, fetchStockOptions);
      const body = buildCreateLeadBody({
        clip: payload,
        clientId,
        me,
        localId,
        filters,
        vehicle,
      });
      const leadRes = await createLeadCompra(body);
      if (!leadRes.ok) {
        tab.cancel();
        panel?.setStatus(
          `Falha create_lead_compra (HTTP ${leadRes.status}): ${JSON.stringify(leadRes.data)}`,
          'error',
        );
        return;
      }
      const idLead = leadRes.data?.id_lead;
      if (!idLead) {
        tab.cancel();
        panel?.setStatus(`Resposta inesperada: ${JSON.stringify(leadRes.data)}`, 'error');
        return;
      }
      const mode = tab.go(`/main/lead-tasacion/${idLead}`);
      finishCreateInNewTab(mode, idLead, panel);
    } catch (error) {
      tab.cancel();
      const message = error instanceof Error ? error.message : 'erro';
      panel?.setStatus(`Erro ao criar: ${message}`, 'error');
    } finally {
      busy = false;
    }
  }

  function mount() {
    if (panel) return panel;
    panel = createFillerPanel({
      onReadClipboard,
      onParseText,
      onCreate,
    });
    refreshContext();
    window.addEventListener('popstate', refreshContext);
    // LeadDesk/Flexicar SPAs change content without always firing popstate.
    routeObserver = new MutationObserver(() => refreshContext());
    const appRoot = document.getElementById('app') || document.body;
    if (appRoot) {
      routeObserver.observe(appRoot, { childList: true, subtree: true });
    }
    // Best-effort auto-read clipboard on mount.
    void onReadClipboard();
    return panel;
  }

  function destroy() {
    window.removeEventListener('popstate', refreshContext);
    routeObserver?.disconnect();
    routeObserver = null;
    panel?.destroy();
    panel = null;
    payload = null;
    lastKind = null;
  }

  return { mount, destroy, refreshContext };
}

/**
 * @param {string} value
 */
function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
