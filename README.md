# Vehicle Listing Clipper

Tampermonkey userscript for **OLX Portugal** and **Standvirtual** vehicle listings, plus a CRM lead panel on **`crm.flexicar.pt`**. On listing pages the floating panel starts **minimized**, waits **5 seconds**, then scans gallery images **locally in Chrome**, recognizes a Portuguese license plate, extracts listing fields (including phone when available), and prepares a formatted vehicle summary (with `LEAD_CLIP_V1` for the CRM panel).

**This tool does not upload listing images, extracted vehicle information, recognized license plates, or phone numbers. Extraction and inference run locally in Chrome.**

Enable **only one** of the two scripts at a time (LOCAL DEV or production).

## Supported sites

| Site | Listing URL shape | Phone control |
| --- | --- | --- |
| [OLX Portugal](https://www.olx.pt/) | `https://www.olx.pt/.../anuncio/...-ID….html` | **Ver número** |
| [Standvirtual](https://www.standvirtual.com/) | `https://www.standvirtual.com/carros/anuncio/...-ID….html` | **Ver telefone** |
| [Flexicar CRM](https://crm.flexicar.pt/) | `https://crm.flexicar.pt/*` | Lead verify/create (API) |
| LeadDesk (local) | `http://127.0.0.1:4173/crm/*` | Lead verify/create (IndexedDB) |

## Stages

```text
Stage 1: Complete
Stage 2: Complete
Stage 3: Complete
Stage 4: Complete
Stage 5: Complete
Stage 6: Complete
```

## Clipboard template

Copied text starts with `ID` and `Telefone`, then the listing fields, then a blank line and the canonical `.html` URL, then a `<<<LEAD_CLIP_V1>>>` JSON trailer used by the CRM panel (same userscript).

| Field | Source |
| --- | --- |
| `ID` | Plate if found; otherwise phone; otherwise a generated `99XXXXX99` (five random digits, e.g. `990123499`). Generated IDs are stored in the listing cache so **Copy** / revisit reuse the same value |
| `Telefone` | Revealed contact digits when **Ver número** (OLX) or **Ver telefone** (Standvirtual) succeeds; otherwise empty |

Example shape:

```text
ID: BC39VF
Telefone: 936968746

Matrícula: BC39VF
Marca: CITROËN
Modelo: C4 X
…
Valor cliente: 24449 €
…

https://www.olx.pt/d/anuncio/….html

<<<LEAD_CLIP_V1>>>
{
  "v": 1,
  "id": "BC39VF",
  "phone": "936968746",
  "plate": "BC39VF",
  "clientName": "RicardoM",
  "make": "CITROËN",
  …
}
<<<END_LEAD_CLIP>>>
```

### `LEAD_CLIP_V1.clientName` (advertiser → CRM client)

The machine trailer includes `clientName`: the listing advertiser/seller display name. The CRM panel splits it into first name + surname when creating a client/lead (never uses the vehicle title for that).

| Site | Capture source | Fixture example |
| --- | --- | --- |
| OLX | `[data-testid="user-profile-user-name"]` | `RicardoM` |
| Standvirtual | `__NEXT_DATA__` → `advert.seller.name` (DOM fallback: `[data-testid="seller-header"] p`) | `Filipe Magalhaes` |

CRM mapping (`splitClientName` in `src-crm-filler/app/map-clip-to-api.js`):

| `clientName` | `name` / `nombre` | `firstSurname` / `apellido1` |
| --- | --- | --- |
| `Paulo Pereira` | `Paulo` | `Pereira` |
| `Filipe Magalhaes` | `Filipe` | `Magalhaes` |
| `RicardoM` (single token) | `RicardoM` | `Anúncio` |
| empty / missing | `Lead` | `Anúncio` |

## Local development

```bash
npm install
npm run dev
```

### ONNX models (required for Clip listing / plate scan)

Download weights into `models/` (gitignored). See [models/README.md](models/README.md).

### Install in Tampermonkey (LOCAL DEV)

1. Keep `npm run dev` running.
2. In Chrome, open Tampermonkey.
3. Visit:

```text
http://127.0.0.1:4173/vehicle-listing-clipper-local.user.js
```

4. Click **Install** on the Tampermonkey confirmation page.
   Reinstall/update this URL whenever the local loader metadata changes (for example after ORT `@require` updates).
5. Open the fixture or a real OLX / Standvirtual listing:

```text
http://127.0.0.1:4173/
```

You should see a floating **Vehicle Listing Clipper** panel (starts minimized). The minimized title shows capture status: `waiting` → `analisando imagem N de M` while scanning the gallery → `waiting for tab` / `Waiting for phone button…` when phone reveal is deferred → `ready to copy` (minimized panel turns **dark green**) or `data copied` after you click **Copy**. On empty/error pages it shows `No data found.` Drag the header to move the panel. Use the chevron control to expand/minimize. After the 5s auto-process (or **Clip listing**), data is prepared but **not** written to the clipboard until you click **Copy** / **Copy again**; the button flashes green briefly on a successful copy. The button starts as **Copy**; after the first click it becomes **Copy again**. LOCAL DEV builds show a compact **LD** badge.

After load, the script waits **5 seconds** then auto-runs the clip pipeline (or click **Clip listing** earlier to start immediately):

1. **Extract** — structured listing fields into an editable review form (OLX: JSON-LD + `data-testid`; Standvirtual: `__NEXT_DATA__` + `data-testid`), including advertiser **Nome cliente** (`clientName`) under **Matrícula**. Engine displacement `1`, `99`, and `999` normalize to `1.0` liters.
2. **Plate** — discovers gallery image URLs, then downloads and scans **one image at a time** (stop at the first reliable Portuguese plate). Models are cached in IndexedDB after the first download. Runs even when the tab is in the background.
3. **Phone** — deferred until the tab is **visible**. Then waits up to **2×2s** for a visible **Ver número** / **Ver telefone** control, clicks it, and captures the `tel:` link. If the button never appears, the clip finishes without a phone. Shown at the top of **Review listing** (`Telefone`), plus the clipboard/`status` lines.

When useful data is found, the panel shows **Ready to copy** (minimized title `ready to copy`, dark green chrome). Click **Copy** to write the Portuguese text template (`ID` / `Telefone` header, listing fields including **Nome cliente**, blank line, URL) **plus** a delimited `LEAD_CLIP_V1` JSON block for the CRM panel — status becomes **Data copied**. Use **Copy plate only** / **Copy full text** after editing fields. Valuation defaults are configurable in **Settings**. Empty or error pages show **No data found.** and do not copy or cache.

### Listing cache (2 days)

After a successful clip with useful listing data (plate, phone, or vehicle fields — not URL alone), the processed listing (fields, phone, clipboard text, and any generated fallback `ID`) is stored locally in Tampermonkey storage for **2 days**, keyed by canonical listing URL. Opening the same ad again restores that data without re-scanning: status shows `Ready to copy`, the button is **Copy** (no auto-copy), and older or empty cache entries are pruned/ignored on load. Empty/error-page clips are not cached. **Clip listing** still reprocesses from scratch and overwrites the cache entry when data is useful.

Real listing HTML for local extract checks:

- OLX: `http://127.0.0.1:4173/fixtures/olx-listing-real.html`
- Standvirtual (pre/post phone): `http://127.0.0.1:4173/fixtures/standvirtual-real-pre-phone-review.html`

### LeadDesk CRM simulator (local)

Local-only lead registration UI for later Tampermonkey fill testing. Data stays in the browser (IndexedDB). No remote backend. Details: [dev/crm-sim/README.md](dev/crm-sim/README.md).

```text
http://127.0.0.1:4173/crm/
```

| Route | Purpose |
| --- | --- |
| `/crm/` or `/crm/leads/list` | List of registered leads + filter by plate/phone + **Excluir** |
| `/crm/leads/add` | Opens **Adicionar Lead** (phone or plate check) |
| `/crm/leads/new` | Draft form (in memory until save) |
| `/crm/leads/:id` | Saved lead detail (edit + red **Excluir** FAB) |

Flow:

1. **Lista** — browse all leads; type a plate or phone in the search box to filter.
2. **Adicionar Lead** — enter phone or plate.
3. **Match** — plate shows leads with phone + last edit; phone shows leads with plate + last edit. Click a row to open `/crm/leads/:id`.
4. **No match** — **Criar cliente** modal, then the contact + listing form on `/crm/leads/new` (in-memory draft until save).
5. **Guardar** (green FAB) — writes client + lead to IndexedDB and redirects to `/crm/leads/:id`.
6. **Excluir** — list first-column trash icon or detail red FAB (bottom-left); confirms, deletes the lead (and the client if it has no other leads). LeadDesk-only; see [dev/crm-sim/README.md](dev/crm-sim/README.md#delete-lead).

Seed examples (created once per browser profile):

| Query | Expected |
| --- | --- |
| `BC39VF` | 2 leads (phones `931636999`, `912345678`) |
| `931636999` | 2 leads (plates `BC39VF`, `AA00BB`) |
| `AA00BB` / `912345678` / `CD12EF` / `963852741` | 1 lead each |

Saved Flexicar HTML under `dev/fixtures/Lead*` is reference-only and is **not** part of this simulator.

### CRM lead panel (same Tampermonkey script)

On **`https://crm.flexicar.pt/*`** (and local LeadDesk at `/crm`), the same userscript mounts a CRM panel instead of the listing clipper. It parses `LEAD_CLIP_V1` from the clipboard (including `clientName` after `plate`), verifies leads via `/api/lead-clients`, can create leads via `/api/lead-clients` + `/api/create_lead_compra` mapping advertiser `clientName` (not listing `title`) into `name`/`firstSurname` (and LeadDesk **Nome completo** / **Primeiro apelido**), resolving vehicle **make/model/fuel/gear against the Flexicar stock catalog** before create, then opens `/main/lead-tasacion/{id}`. Requires a logged-in CRM session on Flexicar. Local LeadDesk uses IndexedDB and case-insensitive select matching for clipper UPPERCASE makes. API notes: [docs/crm-api-from-hars.md](docs/crm-api-from-hars.md).

**Install once** (LOCAL DEV or production — same URLs as above). Disable the old separate **Lead CRM Filler** userscript if you still have it.

Flow: Copy listing on OLX/Standvirtual → open CRM → **Ler área de transferência** (or paste). A valid `LEAD_CLIP_V1` triggers **Verificar cadastro** automatically → **Abrir lead** or **Criar lead**. Panel messages use neutral Portuguese (Portugal and Brazil).

Also available on listing pages: **Cancel**, **Copy again**, **Clear model cache**, **Diagnostics**.

After editing source files:

1. Wait for the rebuild (terminal watch).
2. Reload the page.

Disable the LOCAL DEV script when you are not developing.

## Production

```bash
npm run test
npm run lint
npm run build
npm run release:check
```

### Install in Tampermonkey (production)

Open the raw userscript URL and click **Install**:

```text
https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
```

Or import `dist/vehicle-listing-clipper.user.js` via Tampermonkey → Utilities → Import from file.

The production script is fully bundled application JavaScript. ONNX weights and ORT WASM binaries are fetched as data assets from pinned upstream / CDN URLs (SHA-256 verified for models).

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch + serve on `127.0.0.1:4173` (clipper + LeadDesk) |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run build` | Production userscript + local loader |
| `npm run release:check` | Fail if production bundle contains localhost / LOCAL DEV markers |

## Privacy

- No backend, analytics, telemetry, or API keys.
- Model files and settings may be cached locally. Processed listing payloads (including plate/phone when found) may be stored locally for up to 2 days so the same ad can be restored without re-scanning; older entries are removed automatically.
- The LOCAL DEV script executes JavaScript served from your own loopback server (`127.0.0.1:4173`).

See also [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [SECURITY.md](SECURITY.md).
