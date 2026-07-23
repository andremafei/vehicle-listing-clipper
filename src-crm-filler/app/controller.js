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
  digitsOnly,
  normalizePlate,
  pickFiltro,
} from './map-clip-to-api.js';
import { createFillerPanel } from './panel.js';

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

  function refreshContext() {
    const ctx = detectCrmContext();
    panel?.setBadge(ctx.label);
    return ctx;
  }

  /**
   * @param {string} text
   */
  function applyParsedText(text) {
    const parsed = parseLeadClip(text);
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    if (!parsed.ok) {
      payload = null;
      panel?.setSummary(null);
      panel?.setVerifyEnabled(false);
      panel?.setStatus(`Parse falhou: ${parsed.error}`, 'error');
      return;
    }
    payload = parsed.payload;
    panel?.setText(text);
    panel?.setVerifyEnabled(true);
    panel?.setSummary(
      [
        `<div><strong>ID</strong> ${esc(payload.id)}</div>`,
        `<div><strong>Placa</strong> ${esc(payload.plate || '—')}</div>`,
        `<div><strong>Telefone</strong> ${esc(payload.phone || '—')}</div>`,
        `<div><strong>Viatura</strong> ${esc([payload.make, payload.model, payload.year].filter(Boolean).join(' · ') || '—')}</div>`,
        `<div><strong>URL</strong> ${esc(payload.url || '—')}</div>`,
      ].join(''),
    );
    refreshContext();
    panel?.setStatus('LEAD_CLIP_V1 detetado. Clique em Verificar cadastro.', 'ok');
  }

  async function onReadClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      panel?.setText(text);
      applyParsedText(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Clipboard indisponível';
      panel?.setStatus(
        `Não foi possível ler o clipboard (${message}). Cole o texto e use Parse.`,
        'warn',
      );
    }
  }

  /**
   * @param {string} text
   */
  function onParseText(text) {
    applyParsedText(text);
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
    panel?.setStatus('A verificar no LeadDesk (IndexedDB)…');
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    try {
      const plate = normalizePlate(payload.plate);
      const phone = digitsOnly(payload.phone);
      let leads = [];
      if (plate) {
        leads = await findLeadsByPlate(plate);
      }
      if (leads.length === 0 && phone) {
        leads = await findLeadsByPhone(phone);
      }
      if (!plate && !phone) {
        panel?.setStatus('Payload sem placa nem telefone.', 'warn');
        return;
      }
      if (leads.length === 0) {
        panel?.setStatus('Sem cadastro no LeadDesk. Pode criar um novo lead.', 'warn');
        panel?.setCreateVisible(true, true);
        return;
      }
      const items = leads.map((lead) => ({
        id: lead.id,
        title: `Lead ${lead.plate || lead.id}`,
        subtitle: `${lead.phone || '—'} · ${[lead.make, lead.model, lead.year].filter(Boolean).join(' · ') || '—'} · ${lead.leadStatus || ''} · ${lead.updatedAt || ''}`.trim(),
      }));
      panel?.setMatches(items, (id) => {
        location.assign(`/crm/leads/${id}`);
      });
      panel?.setStatus(
        items.length === 1
          ? '1 lead encontrado. Use Abrir lead, ou crie outro.'
          : `${items.length} leads encontrados. Use Abrir lead, ou crie outro.`,
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
    panel?.setStatus('A verificar via API…');
    panel?.clearMatches();
    panel?.setCreateVisible(false);
    try {
      const plate = normalizePlate(payload.plate);
      const phone = digitsOnly(payload.phone);
      let result;
      if (plate) {
        result = await findLeadClients({ plate });
        if (result.ok && Array.isArray(result.data) && result.data.length === 0 && phone) {
          result = await findLeadClients({ phone });
        }
      } else if (phone) {
        result = await findLeadClients({ phone });
      } else {
        panel?.setStatus('Payload sem placa nem telefone.', 'warn');
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
        panel?.setStatus('Sem cadastro para esta placa/telefone. Pode criar o lead.', 'warn');
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
              title: `Cliente #${client.id} (sem purchase lead)`,
              subtitle: `${client.name || ''} ${client.firstSurname || ''} · ${client.contact?.primaryPhone || ''}`.trim(),
            });
          }
        }
      }

      const openable = items.filter((i) => String(i.id).match(/^\d+$/));
      panel?.setMatches(openable.length ? openable : items, (id) => {
        if (String(id).startsWith('client:')) {
          panel?.setStatus('Cliente sem lead de compra. Pode criar um novo lead.', 'warn');
          panel?.setCreateVisible(true, true);
          return;
        }
        location.assign(`/main/lead-tasacion/${id}`);
      });
      panel?.setStatus(
        openable.length === 1
          ? '1 lead encontrado. Use Abrir lead, ou crie outro.'
          : openable.length > 1
            ? `${openable.length} leads encontrados. Use Abrir lead, ou crie outro.`
            : 'Cliente encontrado sem lead utilizável. Pode criar lead.',
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
    const phone = digitsOnly(payload.phone);
    if (!phone && !normalizePlate(payload.plate)) {
      panel?.setStatus('É necessário telefone ou placa para criar.', 'warn');
      return;
    }
    if (!confirm('Criar lead no LeadDesk local com os dados do clipboard?')) {
      return;
    }
    busy = true;
    panel?.setStatus('A criar no LeadDesk…');
    try {
      const leadId = await createLeadDeskLead(payload);
      panel?.setStatus(`Lead ${leadId} criado. A abrir página…`, 'ok');
      location.assign(`/crm/leads/${leadId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro';
      panel?.setStatus(`Erro ao criar no LeadDesk: ${message}`, 'error');
    } finally {
      busy = false;
    }
  }

  async function createOnFlexicar() {
    const phone = digitsOnly(payload.phone);
    if (!phone && !normalizePlate(payload.plate)) {
      panel?.setStatus('É necessário telefone ou placa para criar.', 'warn');
      return;
    }
    if (!confirm('Criar cliente/lead no CRM com os dados do clipboard?')) {
      return;
    }
    busy = true;
    panel?.setStatus('A criar via API…');
    try {
      const meRes = await getAuthMe();
      if (!meRes.ok || !meRes.data?.id) {
        panel?.setStatus(
          `auth/me falhou (HTTP ${meRes.status}). Inicie sessão no CRM.`,
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
          panel?.setStatus(
            `Falha ao criar cliente (HTTP ${created.status}): ${JSON.stringify(created.data)}`,
            'error',
          );
          return;
        }
      }
      if (!clientId) {
        panel?.setStatus('Não foi possível obter clientId.', 'error');
        return;
      }

      const body = buildCreateLeadBody({
        clip: payload,
        clientId,
        me,
        localId,
        filters,
      });
      const leadRes = await createLeadCompra(body);
      if (!leadRes.ok) {
        panel?.setStatus(
          `Falha create_lead_compra (HTTP ${leadRes.status}): ${JSON.stringify(leadRes.data)}`,
          'error',
        );
        return;
      }
      const idLead = leadRes.data?.id_lead;
      if (!idLead) {
        panel?.setStatus(`Resposta inesperada: ${JSON.stringify(leadRes.data)}`, 'error');
        return;
      }
      panel?.setStatus(`Lead ${idLead} criado. A abrir página…`, 'ok');
      location.assign(`/main/lead-tasacion/${idLead}`);
    } catch (error) {
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
      onVerify,
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
