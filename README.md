# Vehicle Listing Clipper

Tampermonkey userscript for OLX Portugal vehicle listings. Click **Clip listing** to scan gallery images **locally in Chrome**, recognize a Portuguese license plate, extract listing fields, and copy a formatted vehicle summary (including phone when available).

**This tool does not upload listing images, extracted vehicle information, recognized license plates, or phone numbers. Extraction and inference run locally in Chrome.**

Enable **only one** of the two scripts at a time (LOCAL DEV or production).

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
| `ID` | Plate if found; otherwise phone; otherwise a generated `99XXXXX99` (five random digits, e.g. `990123499`) |
| `Telefone` | Revealed contact digits when **Ver número** succeeds; otherwise empty |

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
5. Open the fixture or a real OLX listing:

```text
http://127.0.0.1:4173/
```

You should see a floating **Vehicle Listing Clipper** panel with a **LOCAL DEV** badge.

**Clip listing** runs in parallel where possible:

1. **Extract** — structured OLX fields (JSON-LD + `data-testid` parameters) into an editable review form.
2. **Plate** — discovers gallery image URLs, then downloads and scans **one image at a time** (stop at the first reliable Portuguese plate). Models are cached in IndexedDB after the first download.
3. **Phone** — if the listing has **Ver número**, reveals the `tel:` link and includes it in the clipboard text (`Telefone`) and status line.

It then auto-copies the full Portuguese text template (`ID` / `Telefone` header, listing fields, blank line, URL). Use **Copy plate only** / **Copy full text** / **Copy JSON** after editing fields. Valuation defaults are configurable in **Settings**.

Real listing HTML for local extract checks: `http://127.0.0.1:4173/fixtures/olx-listing-real.html`.

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
- Model files and settings may be cached locally; listing records, plates, and phones are not persisted.
- The LOCAL DEV script executes JavaScript served from your own loopback server (`127.0.0.1:4173`).

See also [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [SECURITY.md](SECURITY.md).
