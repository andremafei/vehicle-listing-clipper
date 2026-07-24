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
| `RicardoM` (single token) | `RicardoM` | `null` |
| empty / missing | `Lead` | `null` |

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

You should see a floating **Vehicle Listing Clipper** panel (starts minimized). The minimized title shows capture status: `waiting` → `analisando imagem N de M` while scanning the gallery → `lendo tel` / `Waiting for phone button…` when phone reveal is deferred → `ready to copy` (minimized panel turns **dark green**) or `data copied` after you click **Copy** (or press `Alt/⌥+C`). On empty/error pages it shows `No data found.` The **browser tab title** gets a matching emoji prefix so you can scan many open ads at a glance: ⏳ processing, 🔔 needs this tab visible for phone, 📋 ready to copy, ✅ copied, ⛔ no data. Drag the header to move the panel. Use the chevron control to expand/minimize. After the 5s auto-process (or **Clip listing**), data is prepared but **not** written to the clipboard until you click **Copy** / **Copy again** (or `Alt/⌥+C`); the button flashes green briefly on a successful copy. The button starts as **Copy**; after the first click it becomes **Copy again**. LOCAL DEV builds show a compact **LD** badge.

After load, the script waits **5 seconds** then auto-runs the clip pipeline (or click **Clip listing** earlier to start immediately):

1. **Extract** — structured listing fields into an editable review form (OLX: JSON-LD + `data-testid`, with description preferred from the DOM so line breaks survive; Standvirtual: `__NEXT_DATA__` + `data-testid`), including advertiser **Nome cliente** (`clientName`) under **Matrícula**. Engine displacement `1`, `99`, and `999` normalize to `1.0` liters.
2. **Plate** — discovers gallery image URLs, then downloads and scans **one image at a time**. Stops early when a Portuguese plate reaches **≥90%** mean OCR confidence; otherwise keeps the best lower-confidence hit and continues through the gallery. Models are cached in IndexedDB after the first download. Runs even when the tab is in the background. When a plate is found, the panel records the **1-based gallery image index**, URL, and confidence (also stored in listing-cache metadata).
3. **Phone** — deferred until the tab is **visible**. Then waits up to **2×2s** for a visible **Ver número** / **Ver telefone** control, clicks it, and captures the `tel:` link. If the button never appears, the clip finishes without a phone. Shown at the top of **Review listing** (`Telefone`), plus the clipboard/`status` lines.

When useful data is found, the panel shows **Ready to copy** (minimized title `ready to copy`, dark green chrome). Click **Copy** to write the Portuguese text template (`ID` / `Telefone` header, listing fields including **Nome cliente**, blank line, URL) **plus** a delimited `LEAD_CLIP_V1` JSON block for the CRM panel — status becomes **Data copied**. Use **Copy plate only** / **Copy full text** after editing fields. Valuation defaults are configurable in **Settings**. Empty or error pages show **No data found.** and do not copy or cache.

#### Plate image source (validate in the gallery)

After ANPR finds a plate:

| Panel state | Indication | Preview |
| --- | --- | --- |
| **Minimized** | Number next to the `P` chip (e.g. `3` = gallery image 3) | Image icon button opens a centered overlay with that photo |
| **Expanded** | Confidence badge (e.g. `87%`) + `img N` on **Matrícula** (no `ANPR` origin label). Confidence under 90% uses a warning style. | Same image icon button → same overlay |

Close the overlay with the backdrop, **X**, or `Escape`. Status also notes the source, e.g. `Plate found: AA00BB (imagem 3)`.

#### Low-confidence plate confirmation (&lt; 90%)

If no gallery image reaches **≥90%** confidence, the clip still surfaces the **best** reading, then:

1. Expands the panel and opens the plate-image overlay with an alert (**Confiança baixa**).
2. Asks whether to use the found value.
3. Offers **Usar este valor**, **Editar valor** (keeps the candidate and focuses the Matrícula field), or **Não usar placa** (clears plate / image / confidence). Escape / close maps to discard.

Minimized **Clip again** reuses a previously accepted plate and does **not** re-prompt.

#### Clip again vs Clip listing

| Control | Where | Plate / gallery |
| --- | --- | --- |
| **Clip again** | Minimized header | Re-extracts listing text and retries phone; **reuses** the prior plate (skips ANPR), including after cache restore |
| **Clip listing** | Expanded body | Full pipeline again: rediscovers gallery URLs and **re-scans images** for a fresh plate |

### Listing cache (2 days)

After a successful clip with useful listing data (plate, phone, or vehicle fields — not URL alone), the processed listing (fields, phone, clipboard text, plate-image index/URL/confidence when known, and any generated fallback `ID`) is stored locally in Tampermonkey storage for **2 days**, keyed by canonical listing URL. Opening the same ad again restores that data without re-scanning: status shows `Ready to copy`, the button is **Copy** (no auto-copy), and older or empty cache entries are pruned/ignored on load. Empty/error-page clips are not cached. Useful results overwrite the cache entry.

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

On **`https://crm.flexicar.pt/*`** (and local LeadDesk at `/crm`), the same userscript mounts a CRM panel instead of the listing clipper. It parses `LEAD_CLIP_V1` from the clipboard (including `clientName` after `plate`), verifies leads via `/api/lead-clients`, can create leads via `/api/lead-clients` + `/api/create_lead_compra` mapping advertiser `clientName` (not listing `title`) into `name`/`firstSurname` (and LeadDesk **Nome completo** / **Primeiro apelido**), resolving vehicle **make/model/fuel/gear against the Flexicar stock catalog** before create, then opens `/main/lead-tasacion/{id}` **in a new tab**. Known make abbreviations are expanded first (e.g. clipper `VW` → catalog **Volkswagen** via `expandMakeAlias`). When neither plate nor phone is present, an all-digit fallback `id` (`99XXXXX99`) is used as the CRM phone via `resolveClipPhone`. On lead detail pages the CRM panel starts **minimized** (`–` / `+` to expand; **Alt/⌥+V** also expands before reading the clipboard). Requires a logged-in CRM session on Flexicar. Local LeadDesk uses IndexedDB, case-insensitive select matching for clipper UPPERCASE makes, the same `VW`→Volkswagen alias, and includes **Jaguar** in the make list. API notes: [docs/crm-api-from-hars.md](docs/crm-api-from-hars.md).

**Install once** (LOCAL DEV or production — same URLs as above). Disable the old separate **Lead CRM Filler** userscript if you still have it.

Flow: Copy listing on OLX/Standvirtual (`Alt/⌥+C`) → open CRM → **Ler área de transferência** (`Alt/⌥+V`, expands if minimized, or paste). A valid `LEAD_CLIP_V1` triggers verify automatically → **Abrir lead** (`Alt/⌥+A` opens the first match) or **Criar lead** (`Alt/⌥+B`). Panel messages use neutral Portuguese (Portugal and Brazil).

Also available on listing pages: **Cancel**, **Copy again** (`Alt/⌥+C`), **Clear model cache**, **Diagnostics**.

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

The installed file is a thin loader. On each page load it fetches and executes `dist/vehicle-listing-clipper.bundle.js` from GitHub raw (`main`). After `npm run build`, commit both `dist/*.js` files and push to `main` to update production (raw CDN may lag a few minutes). If the repository is made private, the fetch fails and the script stops running. ONNX weights and ORT WASM binaries are still fetched as data assets from pinned upstream / CDN URLs (SHA-256 verified for models).

If you previously installed the old fully-inlined production userscript, reinstall once from the URL above so Tampermonkey has the loader.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Watch + serve on `127.0.0.1:4173` (clipper + LeadDesk) |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run build` | Production loader + bundle + local loader |
| `npm run release:check` | Fail if production loader/bundle contain localhost / LOCAL DEV markers |

## Privacy

- No backend, analytics, telemetry, or API keys.
- Model files and settings may be cached locally. Processed listing payloads (including plate/phone when found) may be stored locally for up to 2 days so the same ad can be restored without re-scanning; older entries are removed automatically.
- The LOCAL DEV script executes JavaScript served from your own loopback server (`127.0.0.1:4173`).
- The production script executes application JavaScript fetched from this repository’s GitHub raw URL on each page load.

See also [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [SECURITY.md](SECURITY.md).
