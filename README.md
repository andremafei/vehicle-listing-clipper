# Vehicle Listing Clipper

Tampermonkey userscript for **OLX Portugal** and **Standvirtual** vehicle listings. On listing pages the floating panel starts **minimized**, waits **5 seconds**, then scans gallery images **locally in Chrome**, recognizes a Portuguese license plate, extracts listing fields (including phone when available), and copies a formatted vehicle summary.

**This tool does not upload listing images, extracted vehicle information, recognized license plates, or phone numbers. Extraction and inference run locally in Chrome.**

Enable **only one** of the two scripts at a time (LOCAL DEV or production).

## Supported sites

| Site | Listing URL shape | Phone control |
| --- | --- | --- |
| [OLX Portugal](https://www.olx.pt/) | `https://www.olx.pt/.../anuncio/...-ID….html` | **Ver número** |
| [Standvirtual](https://www.standvirtual.com/) | `https://www.standvirtual.com/carros/anuncio/...-ID….html` | **Ver telefone** |

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

Copied text starts with `ID` and `Telefone`, then the listing fields, then a blank line and the canonical `.html` URL.

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
```

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

You should see a floating **Vehicle Listing Clipper** panel (starts minimized). The minimized title shows capture status: `waiting` → `reading` → `text copied` (or `cached (not copied yet)` when restoring a listing processed in the last 2 days). Drag the header to move the panel. Use the chevron control to expand/minimize. Use **Copy again** in the minimized chrome to re-copy the last clipboard payload without reprocessing (useful with multiple listing tabs); the button flashes green briefly on a successful copy. On a cache hit the button starts as **Copy** (no auto-copy); after the first click it becomes **Copy again**.

After load, the script waits **5 seconds** then auto-runs the clip pipeline (or click **Clip listing** earlier to start immediately):

1. **Extract** — structured listing fields into an editable review form (OLX: JSON-LD + `data-testid`; Standvirtual: `__NEXT_DATA__` + `data-testid`). Engine displacement `1`, `99`, and `999` normalize to `1.0` liters.
2. **Plate** — discovers gallery image URLs, then downloads and scans **one image at a time** (stop at the first reliable Portuguese plate). Models are cached in IndexedDB after the first download.
3. **Phone** — if the listing has **Ver número** (OLX) or **Ver telefone** (Standvirtual), reveals the `tel:` link and includes it in the clipboard text (`Telefone`) and status line.

It then auto-copies the full Portuguese text template (`ID` / `Telefone` header, listing fields, blank line, URL). Use **Copy plate only** / **Copy full text** / **Copy JSON** after editing fields. Valuation defaults are configurable in **Settings**.

### Listing cache (2 days)

After a successful clip, the processed listing (fields, phone, clipboard text, and any generated fallback `ID`) is stored locally in Tampermonkey storage for **2 days**, keyed by canonical listing URL. Opening the same ad again restores that data without re-scanning: the minimized status shows `cached (not copied yet)`, the button is **Copy** (no auto-copy), and older cache entries are pruned on load. **Clip listing** still reprocesses from scratch and overwrites the cache entry.

Real listing HTML for local extract checks:

- OLX: `http://127.0.0.1:4173/fixtures/olx-listing-real.html`
- Standvirtual (pre/post phone): `http://127.0.0.1:4173/fixtures/standvirtual-real-pre-phone-review.html`

Also available: **Cancel**, **Copy again**, **Clear model cache**, **Diagnostics**.

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
| `npm run dev` | Watch + serve on `127.0.0.1:4173` |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run build` | Production userscript + local loader |
| `npm run release:check` | Fail if production contains localhost / LOCAL DEV markers |

## Privacy

- No backend, analytics, telemetry, or API keys.
- Model files and settings may be cached locally. Processed listing payloads (including plate/phone when found) may be stored locally for up to 2 days so the same ad can be restored without re-scanning; older entries are removed automatically.
- The LOCAL DEV script executes JavaScript served from your own loopback server (`127.0.0.1:4173`).

See also [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [SECURITY.md](SECURITY.md).
