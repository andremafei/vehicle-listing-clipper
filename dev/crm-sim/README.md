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
| `/crm/` · `/crm/leads` · `/crm/leads/list` | List of leads; filter by plate or phone |
| `/crm/leads/add` | **Adicionar Lead** modal (lookup by plate/phone) |
| `/crm/leads/new` | Draft contact + listing form (memory only until save) |
| `/crm/leads/:id` | Saved lead page |

## Flow

1. Browse/filter the list, or open **Adicionar Lead**.
2. If the plate/phone already exists → match list (phone+date or plate+date) → open lead.
3. If not → **Criar cliente** modal → form on `/crm/leads/new` (temporary).
4. Green **Guardar** FAB → write `clients` + `leads` to IndexedDB → redirect to `/crm/leads/:id`.

## Data

- Database name: `LeadDeskDB` (stores `clients`, `leads`).
- Form fields use stable `data-field` attributes (e.g. `data-field="make"`).
- Seed leads (once per browser profile): plates `BC39VF`, `AA00BB`, `CD12EF`; phones `931636999`, `912345678`, `963852741`.

## Branding

Product name is **LeadDesk**. Do not use Flexicar (or `crm.flexicar.pt`) anywhere in this simulator. Saved HTML under `dev/fixtures/Lead*` is reference-only.

## Fidelity checklist vs fixtures / screenshots

Compared against `dev/fixtures/Lead_pag_inicial`, `dev/fixtures/Lead Salvo`, and the registration screenshots:

| Area | LeadDesk | Notes / gaps |
| --- | --- | --- |
| Modal Adicionar Lead | Yes — placeholder `Telefone ou matrícula`, primary orange button | Aligned |
| Modal Criar cliente | Yes — required name/phone, Fechar + Guardar | Clipper has no client name → filler uses placeholder on real CRM |
| Dados de Contacto | Yes — names, phones, email, province, municipality, checkboxes | Aligned |
| Dados do Lead | Yes — status, origin, contact method, branch, portal, dates, description | Aligned |
| Dados do veículo | Yes — make/model/year, fuel, gearbox, body, KM, plate, chassis, imported, ITV | Aligned |
| Preços | Yes — customer price, warning, comments | Online valuation fields left as placeholders |
| FABs | Blue back + green save (+ print on detail) | Aligned |
| Match / exists list | Yes (IndexedDB) | Real CRM uses `/api/lead-clients` instead |
| Lead list page | Yes | Extra vs some fixture flows; useful for local browsing |

**Conscious gaps:** no real API, no image upload, clipper valuation fields (`paintParts`, etc.) not on CRM forms, URL stored in comments/description rather than a dedicated field.
