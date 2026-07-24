# LeadDesk CRM simulator

Local-only SPA for testing lead registration UI. Data stays in the browser (**IndexedDB**). Served by `npm run dev` — no remote backend.

The main Vehicle Listing Clipper userscript mounts a CRM panel on `crm.flexicar.pt` (API) and on local LeadDesk `/crm` (IndexedDB). LeadDesk is a **visual reference** only — see [docs/crm-api-from-hars.md](../docs/crm-api-from-hars.md).

## Open

With the dev server running:

```text
http://127.0.0.1:4173/crm/
```

## Routes

| Path | Purpose |
| --- | --- |
| `/crm/` · `/crm/leads` · `/crm/leads/list` | List of leads; filter by plate or phone; per-row **Excluir** |
| `/crm/leads/add` | **Adicionar Lead** modal (lookup by plate/phone) |
| `/crm/leads/new` | Draft contact + listing form (memory only until save) |
| `/crm/leads/:id` | Saved lead page (edit + red **Excluir** FAB) |

## Flow

1. Browse/filter the list, or open **Adicionar Lead**.
2. If the plate/phone already exists → match list (phone+date or plate+date) → open lead.
3. If not → **Criar cliente** modal → form on `/crm/leads/new` (temporary).
4. Green **Guardar** FAB → write `clients` + `leads` to IndexedDB → redirect to `/crm/leads/:id`.
5. **Excluir** (list button or detail FAB) → browser confirm → remove lead from IndexedDB (see below).

## Delete lead

LeadDesk-only helper for clearing local test data. Not present on Flexicar production CRM.

| Where | Control |
| --- | --- |
| List (`/crm/leads/list`) | Compact trash icon in the first column (click does not open the row) |
| Detail (`/crm/leads/:id`) | Red trash FAB in the bottom-left stack (with back / save / print) |

Behaviour (`deleteLead` in `js/db.js`):

1. `confirm(...)` — cancel leaves data unchanged.
2. Delete the `leads` record by id.
3. If that lead’s `clientId` has **no other** leads, delete the `clients` record too (avoids orphan clients). Shared clients (e.g. seed Bruno with two leads) stay until the last linked lead is removed.
4. List refreshes in place; detail navigates back to `/crm/leads/list` (replace).

## Data

- Database name: `LeadDeskDB` (stores `clients`, `leads`).
- Form fields use stable `data-field` attributes (e.g. `data-field="make"`).
- Seed leads (once per browser profile): plates `BC39VF`, `AA00BB`, `CD12EF`; phones `931636999`, `912345678`, `963852741`.
- After deleting seed leads, they are **not** re-seeded (seed runs once per profile via `leaddesk-seeded-v1`). Clear site data / IndexedDB to restore seeds.

## Branding

Product name is **LeadDesk**. Do not use Flexicar (or `crm.flexicar.pt`) anywhere in this simulator. Saved HTML under `dev/fixtures/Lead*` is reference-only.

## Fidelity checklist vs fixtures / screenshots

Compared against `dev/fixtures/Lead_pag_inicial`, `dev/fixtures/Lead Salvo`, and the registration screenshots:

| Area | LeadDesk | Notes / gaps |
| --- | --- | --- |
| Modal Adicionar Lead | Yes — placeholder `Telefone ou matrícula`, primary orange button | Aligned |
| Modal Criar cliente | Yes — required name/phone, Fechar + Guardar | Clipper `clientName` → filler `splitClientName` → Nome completo / Primeiro apelido (never listing `title`) |
| Dados de Contacto | Yes — names, phones, email, province, municipality, checkboxes | Aligned |
| Dados do Lead | Yes — status, origin, contact method, branch, portal, dates, description | Aligned |
| Dados do veículo | Yes — make/model/year, fuel, gearbox, body, KM, plate, chassis, imported, ITV | Aligned |
| Preços | Yes — customer price, warning, comments | Online valuation fields left as placeholders |
| FABs | Bottom-left: blue back + green save (+ print + red delete on detail) | Aligned (delete is LeadDesk-only helper) |
| Match / exists list | Yes (IndexedDB) | Real CRM uses `/api/lead-clients` instead |
| Lead list page | Yes — plate/phone filter + first-column delete icon | Extra vs some fixture flows; useful for local browsing |

**Conscious gaps:** no real API, no image upload, clipper valuation fields (`paintParts`, etc.) not on CRM forms, URL stored in comments/description rather than a dedicated field.
