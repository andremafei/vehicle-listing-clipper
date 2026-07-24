# Decisions

## Bundler: Vite

Chosen over a standalone esbuild script for library IIFE builds, watch mode, and a simple path to later ONNX asset handling.

## GitHub owner: andremafei

Used in production `@namespace`, `@updateURL`, and `@downloadURL` to match the repository path.

## Local loader uses GM.xmlHttpRequest + eval

Injecting a `<script src="http://127.0.0.1:4173/...">` would run in the page world without GM APIs. Fetching the bundle with `GM.xmlHttpRequest` and evaluating it keeps LOCAL DEV inside the userscript sandbox.

## Production loader fetches the app from GitHub raw

Production mirrors the LOCAL DEV pattern: a thin Tampermonkey loader (`dist/vehicle-listing-clipper.user.js`) fetches `dist/vehicle-listing-clipper.bundle.js` from `raw.githubusercontent.com` on every page load and `eval`s it in the userscript sandbox. A push to `main` updates production without reinstalling; making the repository private breaks the fetch and stops the script. `@updateURL` / `@downloadURL` still point at the loader for rare grant/`@match`/`@require` changes.

## Separate storage / IndexedDB / panel IDs

Local and production builds use different prefixes and DOM IDs so both scripts do not collide if both are accidentally enabled.

## Stage 1 UI is a Shadow DOM floating panel

Isolates styles from OLX CSS. No framework (React/Vue) per project constraints.

## Absolute image URLs preserve explicit ports

`new URL(absoluteHttpsWith443).href` drops `:443`. Discovery keeps already-absolute URLs unchanged and only resolves relative paths against `location.href`.

## Interleaved download + scan

Stage 3 downloads gallery images lazily: download image N, run detector/OCR, discard the buffer, then continue only if no reliable plate was accepted. This avoids retaining every listing photo in memory when the plate appears early in the gallery.

## Local fixture images are served from the dev server

The OLX-like fixture uses `/fixtures/images/*.svg` so Stage 2 downloads succeed under LOCAL DEV without depending on live CDN assets. Unit tests still cover real `ireland.apollo.olxcdn.com:443` URL shapes.

## Stage 3 models: pin upstream MIT weights (not in git)

Detector and OCR ONNX files are downloaded from open-image-models / cnn-ocr-lp release assets, verified by SHA-256, and cached in IndexedDB. Local copies live under `models/` for `npm run dev` only.

## Stage 3 tensor contracts (inspected, not guessed)

- Detector input `images` float32 NCHW `[1,3,384,384]` RGB `/255` after letterbox pad 114; output `output0` `[N,7]` end2end NMS; restore `(coord-pad)/ratio`.
- OCR input `input` uint8 NHWC `[N,64,128,3]` RGB; output `plate` `[N,10,37]` argmax over `0-9A-Z_`, strip trailing `_`.

## ORT via Tampermonkey @require (not bundled)

Bundling `onnxruntime-web` into the IIFE ballooned the userscript past 50MB. Production and LOCAL DEV scripts `@require` `ort.min.js` from jsDelivr (pinned 1.22.0); WASM files still load from the same CDN package path. App code lives in the Vite IIFE bundle (free of localhost markers); production loads that bundle remotely from GitHub raw.

Tampermonkey runs `@require` as sandbox `var ort`, which is often **not** visible as `globalThis.ort`. The local and production loaders (and a small bridge prepended to the published bundle) assign `globalThis.ort = ort` before the app runs; `getOrt()` also falls back to sandbox scope via indirect eval.

## Clip listing: plate + phone reveal

The primary panel action is **Clip listing**. It extracts listing fields and runs plate ANPR **first** (works in background tabs), then **defers phone reveal** until the document is visible. After the tab is shown, `revealContactPhone` waits **2s**, checks for a visible reveal control, waits another **2s** if needed, then clicks and reads the `tel:` link — or finishes without a phone after **4s**. Copy stays disabled until that phase completes; useful clips show `ready to copy` (minimized panel uses dark green chrome).

**Clip again** (any clip after a listing record already exists, including cache restore) skips image discovery and ANPR. It reuses the prior plate (including manual edits), re-extracts listing text fields, and retries phone reveal only.

OLX often mounts **two** `button[data-testid="ad-contact-phone"]` nodes (one `display:none`, one visible). Prefer CSS visibility (`display !== none`) over `getBoundingClientRect` / `checkVisibility` alone: the Tampermonkey sandbox frequently reports `0×0` rects and false-negatives for real page nodes, which previously caused clicks on the hidden duplicate. Avoid `instanceof HTMLElement` checks across the sandbox/page realm boundary. Sites also delay showing the reveal control until the tab is foregrounded — hence the post-visibility 2×2s wait.

Standvirtual uses **Ver telefone** (no dedicated phone `data-testid` on the button). Prefer the aside seller panel, then the content contact box; after reveal read `a[href^="tel:"]`. Encrypted `phoneNumbers` in `__NEXT_DATA__` are ignored.

## Stages 4–6 shipped together

Extraction, editable form (with configurable defaults), and the final clipboard template were implemented in one delivery. Site selectors stay under `src/adapters/<site>/`. Motor comes from displacement / `engine_capacity`. Manual fields default to `OK` / `OK` / `OK` / `VENDA` / `2` / `NÃO` and are not claimed as site-extracted. Listing URL is canonicalized to a path ending in `.html`. Revealed phone is shown as the first **Review listing** field (`Telefone`). Advertiser `clientName` is an editable listing field (**Nome cliente**, under **Matrícula**) and stays in `LEAD_CLIP_V1` for CRM create.

## Useful-data gate and deferred clipboard

A clip is useful when it has a plate, phone, or extracted vehicle field other than URL alone. Useful clips format the clipboard payload, cache it, and show `Ready to copy` / minimized `ready to copy` without writing the system clipboard until **Copy**. Empty/error pages show `No data found.` (status and minimized title), skip copy/cache, and do not block a later good reload via empty cache hits.

## Multi-site adapters (OLX + Standvirtual)

`resolveAdapter(hostname)` picks `olx-pt` or `standvirtual-pt`. Field normalizers live in `src/adapters/shared/normalize.js`. Standvirtual extraction prefers `#__NEXT_DATA__` → `props.pageProps.advert` (DOM `data-testid` fallback). Record `transmission` maps to gearbox type, not drive traction (`parametersDict.transmission`). Advertiser name is stored as `clientName` (see “Advertiser name → clientName”).

## Local listing cache (2-day TTL)

After a successful clip with useful listing data, the listing payload (fields, plate, phone, clipboard text, fallback `ID`) is stored in Tampermonkey `GM` storage keyed by canonical URL. Auto-process prepares the payload and shows `Ready to copy` without writing the clipboard; an explicit **Copy** click writes it and shows `Data copied` (then **Copy again**). Revisiting within 2 days restores the form the same way. Empty/error-page results are not cached; empty cache hits are ignored so a later good page can re-extract. Older entries are pruned on listing page load.

## LEAD_CLIP_V1 clipboard trailer

Copy / Copy again / Copy full text append a machine-readable block after the human Portuguese template:

```text
<<<LEAD_CLIP_V1>>>
{ "v": 1, "id", "phone", "plate", "clientName", "make", "model", … }
<<<END_LEAD_CLIP>>>
```

Built/parsed in `src/clipboard/lead-clip.js`. Replaces the earlier standalone “Copy JSON” button so one clipboard paste carries both human text and CRM payload. Description newlines are preserved through `normalizeDescription` / HTML stripping.

When the listing has neither plate nor phone, `id` is a generated `99XXXXX99`. CRM verify/create (`resolveClipPhone`) treats that all-digit `id` as the lead phone so LeadDesk and Flexicar can still search and create; plate-based ids (letters) are never used as phone.

## Advertiser name → `clientName` → CRM lead name

Listing extractors store the seller/advertiser display name as `clientName` on the listing record (`fields.clientName` + `source.clientName`) and in `LEAD_CLIP_V1` (JSON key immediately after `plate`). **Review listing** shows it as **Nome cliente** under **Matrícula**; edits sync back into `source` / the CRM trailer.

| Site | Primary source | DOM fallback | Fixture example |
| --- | --- | --- | --- |
| OLX | `[data-testid="user-profile-user-name"]` | — | `RicardoM` |
| Standvirtual | `#__NEXT_DATA__` → `advert.seller.name` | `[data-testid="seller-header"] p` | `Filipe Magalhaes` |

The CRM panel **must** map `clientName` → person name fields — never `title` or `make`. An early create path used `clip.title`; on Standvirtual that produced `Nome completo` / `nombre` = `Mercedes-Benz` from titles like `Mercedes-Benz A 220 d …`. The same mistake would have hit Flexicar (`buildCreateClientBody` / `buildCreateLeadBody`) and LeadDesk (`createLeadFromClip`).

`splitClientName` (shared by Flexicar API payloads and LeadDesk IndexedDB) splits on spaces. Missing surname stays `null` (no invented placeholder like “Anúncio” — OLX usernames are often a single token):

| `clientName` | First name (`name` / `nombre`) | Surname (`firstSurname` / `apellido1`) |
| --- | --- | --- |
| `David Luz` | `David` | `Luz` |
| `RicardoM` | `RicardoM` | `null` |
| *(empty)* | `Lead` | `null` |

LeadDesk shows these as **Nome completo** + **Primeiro apelido**.

## One Tampermonkey script: listings + CRM

Listing pages mount the clipper panel; `crm.flexicar.pt` (and local LeadDesk `/crm` in LOCAL DEV) mount the CRM verify/create panel from `src-crm-filler/`. Same `@match` metadata and single production IIFE (`dist/vehicle-listing-clipper.user.js`). No separate Lead CRM Filler userscript.

CRM actions use same-origin API (`/api/lead-clients`, `/api/create_lead_compra`, …) with the logged-in Flexicar session — not HTML form fill. Local LeadDesk testing talks to IndexedDB (`LeadDeskDB`) only in the local build (`isLocal`); production context detection omits loopback hosts so the release bundle stays free of `localhost` / `127.0.0.1` markers. HAR-derived API notes live in `docs/crm-api-from-hars.md`.

CRM panel copy is written in **neutral Portuguese** clear for both Portugal and Brazil (e.g. *encontrado* not *detetado*, *Verificando* not *A verificar*, *área de transferência*, *Veículo*).

Reading the clipboard (or pasting `LEAD_CLIP_V1` text) **auto-runs verify** — there is no separate Analyse/Verify button. Primary actions are **Ler área de transferência** (`Alt/⌥+V`, orange), **Abrir lead** on the first match (`Alt/⌥+A`), and **Criar lead** (`Alt/⌥+B`, green) — two-key, left-hand shortcuts. On listing pages, **Copy** / **Copy again** uses `Alt/⌥+C`. **Alt/⌥+V** on a **minimized** CRM panel **expands** it first, then reads the clipboard. On LeadDesk, **Criar lead** creates immediately (no `confirm` dialog); Flexicar production still confirms before API create.

**Criar lead** / **Abrir lead** open the lead detail URL in a **new tab** (`window.open`). Create reserves `about:blank` during the user gesture (before awaits) so popup blockers do not kill the tab after the API round-trip; if the popup is blocked, navigation falls back to the current tab. After a successful create that opened a new tab, the **current** page (usually the leads list) **reloads** so the list is up to date. On **lead detail** pages (`/main/lead-tasacion/{id}` / `/crm/leads/{id}`) the CRM panel **starts minimized**; `–` / `+` toggles expand. SPA entry into detail also minimizes once (does not re-collapse while the user keeps it open).

### Keyboard shortcuts (left hand)

| Context | Shortcut | Action |
| --- | --- | --- |
| Listing | `Alt/⌥+C` | Copy / Copy again (only when copy is enabled) |
| CRM | `Alt/⌥+V` | Expand panel if minimized → read clipboard → auto-verify |
| CRM | `Alt/⌥+A` | Open the first matched lead |
| CRM | `Alt/⌥+B` | Create lead (when the create button is available) |

## OLX description from the DOM

OLX JSON-LD flattens `<br>` in the description to spaces. Extract prefers `#mainContent [data-testid="ad_description"]` via `stripHtmlToText` (keeps line breaks), skipping a leading `Descrição` heading when present; JSON-LD is fallback only.

## LeadDesk local delete (not Flexicar)

LeadDesk exposes delete on the lead list (first-column trash icon) and a red delete FAB on lead detail (bottom-left with back/save/print) so local IndexedDB test data can be cleared without wiping the whole DB. This is a simulator convenience — Flexicar has no matching UI/API in this repo. `deleteLead` removes the lead and, only when no sibling leads share `clientId`, the client too. UI confirms with `confirm(...)` before write. Docs: `dev/crm-sim/README.md` (§ Delete lead).

## Portugal phone digits from `tel:` hrefs

Standvirtual/OLX often expose `tel:21 145 5787` or `tel:+351 914 746 358`. Capture must not stop at the first space (`tel:(\+?\d+)` was wrong). Shared helpers `phoneDigitsFromTelHref` / `normalizePtPhoneDigits` strip punctuation and drop the `351` / `00351` country code so the stored phone is national digits only (e.g. `914746358`).

## Minimized panel image progress

While the ANPR pipeline downloads/scans gallery images, the minimized title shows `analisando imagem N de M` (driven from `Downloading|Scanning image N of M` status updates) instead of a static `reading`.

## Ready-to-copy chrome

When capture status is `ready to copy`, the minimized panel adds `vlc-panel--ready` (dark green background) so background tabs that finished plate/text work are easy to spot before Copy. The class clears on other phases (`waiting`, `data copied`, `No data found.`, etc.).

## Flexicar create: stock catalog IDs for vehicle fields

HAR create bodies use catalog ids such as `marca_vehiculo: [{ label, value }]`, not the clipper’s UPPERCASE `make` string. Before `create_lead_compra`, the filler runs `resolveVehicleFromStock` (`makes` → `models?makeId=` → `fuels` → `transmissions`) via `fetchStockOptions` so Marca/Modelo (and fuel/gear when resolvable) persist as selected options in the CRM lead form. Notes: `docs/crm-api-from-hars.md`.

## LeadDesk selects vs clipper UPPERCASE

Clipper stores makes like `CITROËN` / `SEAT`; LeadDesk `<select>` options use title case (`Citroën`, `Seat`). `createLeadFromClip` and the simulator `fieldSelect` match options case-insensitively (with light fuel/transmission normalization) so Marca/Combustível/Tipo caixa prefill correctly.
