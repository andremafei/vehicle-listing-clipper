# LeadDesk CRM simulator

Local-only SPA for testing lead registration and a future Tampermonkey fill script. Data stays in the browser (**IndexedDB**). Served by `npm run dev` — no remote backend.

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
- Form fields use stable `data-field` attributes (e.g. `data-field="make"`) for userscript targeting.
- Seed leads (once per browser profile): plates `BC39VF`, `AA00BB`, `CD12EF`; phones `931636999`, `912345678`, `963852741`.

## Branding

Product name is **LeadDesk**. Do not use Flexicar (or `crm.flexicar.pt`) anywhere in this simulator. Saved HTML under `dev/fixtures/Lead*` is reference-only.
