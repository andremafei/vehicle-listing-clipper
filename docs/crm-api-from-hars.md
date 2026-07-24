# CRM API notes (from HAR captures)

Derived from [`dev/fixtures/hars/`](../dev/fixtures/hars/). **No cookies, tokens, or secrets** are stored here. Live calls require an authenticated browser session on `https://crm.flexicar.pt`.

## HAR inventory

| File | Notes |
| --- | --- |
| `botao_criar_lead.har` | Buy-leads list |
| `form_criar_lead.har` | Opens `/main/lead-tasacion` (no create) |
| `criacao_lead.har` | Full create (client + lead) |
| `form_criar_lead_002.har` | Full create (other phone/plate) |
| `form_criar_lead_003.har` | Lookup of **existing** client/lead |

## Auth / session

- Same-origin `fetch` with session cookies (HARs often redact `Cookie`).
- Useful context:
  - `GET /api/auth/me` → `id` (agent), `rolesId`, `localesId`, `name`
  - `GET /api/get_user_local` → `[{ label, value }]` (store/local)

## Verify existence

```http
GET /api/lead-clients?phone={digits}
GET /api/lead-clients?plate={plate}
```

- Empty `[]` → no match.
- Hit example shape:

```json
[{
  "id": 170079,
  "name": "Bruno",
  "firstSurname": "Ricardo",
  "contact": { "email": null, "primaryPhone": "931636999" },
  "purchaseLead": {
    "id": 198070,
    "statusName": "Avaliação mínima",
    "idEmpleado": 648
  }
}]
```

Complementary list:

```http
GET /api/purchase-leads/clients/{clientId}?page=1
```

→ `results[].id`, `plate`, `lastAction`, `status`.

UI heuristic (from CRM JS): 9-digit input → phone; 6–7 char → plate.

Also present in app JS (less used in these HARs): `POST /api/getLeedPlate` with `{ "matricula": "…" }`.

## Create client

```http
POST /api/lead-clients
```

```json
{
  "name": "Paulo",
  "firstSurname": "Pereira",
  "secondSurname": null,
  "contact": { "email": null, "primaryPhone": "916465885" },
  "address": {
    "province": { "id": null, "name": null },
    "municipality": null
  }
}
```

- `201` → `{ "resourceId": <clientId> }`
- `409` → client already exists (re-fetch by phone)

### Name fields from Clipper (`clientName`)

`LEAD_CLIP_V1.clientName` is the listing advertiser name (JSON key right after `plate`). Mapped by `splitClientName` — **not** from `title` or `make` (listing titles often start with the vehicle brand).

| Input `clientName` | `name` | `firstSurname` | `secondSurname` |
| --- | --- | --- | --- |
| `Paulo Pereira` | `Paulo` | `Pereira` | `null` |
| `Bruno Ricardo Silva` | `Bruno` | `Ricardo` | `Silva` |
| `RicardoM` | `RicardoM` | `Anúncio` | `null` |
| *(empty)* | `Lead` | `Anúncio` | `null` |

Same split feeds lead create: `data.nombre` ← `name`, `data.apellido1` ← `firstSurname`, `data.apellido2` ← `secondSurname`. Local LeadDesk create (`src-crm-filler/app/leaddesk-db.js`) uses the same rules for **Nome completo** / **Primeiro apelido**.

Capture sources (fixtures under `dev/fixtures/`):

- OLX: `[data-testid="user-profile-user-name"]` → e.g. `RicardoM`
- Standvirtual: `advert.seller.name` in `__NEXT_DATA__` → e.g. `Filipe Magalhaes`

## Create purchase lead

```http
POST /api/create_lead_compra
```

Top-level keys: `data`, `agente`, `id_agente_modify`, `rol`, `vehiculo`, `extras`, `estados`, `precio_nuevo`, `precio_final`, `id_local_actual`.

Important `data` fields: `nombre`, `apellido1`, `telefono1`, `cliente` / `client_id` / `id_cliente_lead`, `matricula`, `kilometros`, `buscado`, `comentarios`, `estado` / `origen` / `forma_contacto` / `marca_comercial` as `[{label,value}]`.

`vehiculo`: `marca_vehiculo`, `modelo`, `matriculacion`, `combustible`, `ccambios`, `carroceria`, `version` (each `{label,value}`), `vehicleType: "passenger"`.

Success:

```json
{ "status": "create", "id_lead": 198064, "cliente": 170077 }
```

Then navigate to `/main/lead-tasacion/{id_lead}`.

## Defaults observed in HARs (non-secret UI ids)

| Field | Example |
| --- | --- |
| `estado` | Avaliação mínima / `5` |
| `origen` | Captación Central / `29` |
| `forma_contacto` | Whatsapp / `5` |
| `marca_comercial` | (commercial brand) / `3` |
| `id_local_actual` | Lisboa / `147` |

Prefer live values from `auth/me`, `get_user_local`, and `POST /api/filtros`.

## Dropdowns / catalog

- `POST /api/filtros` with `{ "dataCall": { "data_query": "<name>", "data_call": null|agentId } }`
  - Queries seen: `provincias`, `estado_lead_compra`, `origen_lead_compra`, `contacto`, `marcas_comerciales`
- Vehicle catalog host: `https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/...`
  - Create UI loads `makes` → `models?makeId=` → `years` → `fuels` → `transmissions` → `body`
  - HAR create bodies use catalog ids, e.g. `marca_vehiculo: [{ label: "Nissan", value: 40 }]` — not the clipper’s UPPERCASE `make` string. The filler resolves these via `resolveVehicleFromStock` before `create_lead_compra`.

## Post-create

- `POST /api/get_lead` `{ "lead_id": "198064" }` → array
- Optional: `get_images`, `get_tasaciones_previas`, `upload_files_multi`

## Sequence (new client)

```text
GET  /api/lead-clients?phone=…     → []
POST /api/lead-clients             → resourceId
POST /api/create_lead_compra       → id_lead
GET  /main/lead-tasacion/{id_lead}
```
