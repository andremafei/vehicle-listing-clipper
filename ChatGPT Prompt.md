
# Build Vehicle Listing Clipper in small working stages

Act as a senior JavaScript, Tampermonkey, browser-computer-vision, and ONNX engineer.

Create a repository from zero named:

```text
vehicle-listing-clipper
````

Build the project incrementally. Each stage must produce a usable, tested version before proceeding to the next stage.

Do not attempt to implement every future feature at once.

The first goal is simple:

> On an OLX Portugal vehicle listing, click a Tampermonkey button, scan the listing images locally in Chrome, recognize the first reliable Portuguese license plate, and copy it to the clipboard.

Later stages should add vehicle-data extraction, an editable review form, and copying a complete formatted text block.

Do not use a backend API. Do not upload images or listing information anywhere. All inference must run locally in Chrome.

---

# 1. Technology stack

Use:

* Modern JavaScript.
* Tampermonkey as the primary userscript manager.
* Violentmonkey compatibility where practical.
* Vite or esbuild for bundling.
* `onnxruntime-web`.
* WebGPU as the preferred inference provider.
* WebAssembly as fallback.
* FastALPR-compatible ONNX plate detector.
* FastPlateOCR-compatible ONNX OCR model.
* IndexedDB to cache model files.
* Vitest for tests.
* GitHub for source code and production userscript hosting.
* GitHub Releases for ONNX model files when licensing permits.

No React, Vue, Angular, backend server, cloud function, hosted OCR API, database server, or GitHub Pages application.

---

# 2. Development and production versions

Create two separate Tampermonkey scripts.

## Local development script

Output:

```text
dist-dev/vehicle-listing-clipper-local.user.js
```

Tampermonkey name:

```text
Vehicle Listing Clipper [LOCAL DEV]
```

The local script should load the current development bundle from:

```text
http://127.0.0.1:4173/vehicle-listing-clipper.dev.js
```

The local development workflow should be:

```bash
npm install
npm run dev
```

`npm run dev` should:

1. Watch source files.
2. Rebuild the development bundle after changes.
3. Serve files on `http://127.0.0.1:4173`.
4. Serve the local Tampermonkey installation file.
5. Serve a local OLX-like fixture page.

After installing the local userscript once, testing a change should require only:

1. Save the source file.
2. Wait for the build.
3. Reload the OLX page.

The local version must display a clear:

```text
LOCAL DEV
```

indicator.

## Production script

Output:

```text
dist/vehicle-listing-clipper.user.js
```

Tampermonkey name:

```text
Vehicle Listing Clipper
```

The production script must:

* Be fully bundled.
* Not depend on localhost.
* Be installable from GitHub’s raw file URL.
* Not load application JavaScript dynamically.
* Have diagnostics disabled by default.
* Use different storage and IndexedDB names from the local version.

Example production URL:

```text
https://raw.githubusercontent.com/GITHUB_USERNAME/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
```

Add a build check that fails when the production file contains:

```text
localhost
127.0.0.1
4173
LOCAL DEV
```

Document that only one of the two scripts should normally be enabled at a time.

---

# 3. Implement the project in stages

Complete the following stages in order.

After every stage:

1. Run tests.
2. Run lint.
3. Run the relevant build.
4. Fix failures.
5. Update the README.
6. Create a Git commit.
7. Report what works and what remains.
8. Do not proceed until the current stage is functional.

---

# Stage 1 — Project skeleton and local testing

Create the basic repository and development workflow.

Required deliverables:

* `package.json`.
* Build configuration.
* Vitest configuration.
* ESLint or another lightweight linter.
* Local development server.
* Local development Tampermonkey loader.
* Production userscript build.
* A small floating panel on OLX pages.
* A local fixture page that resembles an OLX listing.
* Separate local and production environment configuration.
* Separate storage prefixes.

Initially, the floating panel only needs:

```text
Vehicle Listing Clipper
Read plate
Settings
```

The “Read plate” button may initially display:

```text
Plate recognition is not implemented yet.
```

The purpose of Stage 1 is to prove:

* The local userscript loads.
* The production userscript builds.
* The local development workflow is easy to use.
* The panel appears only once.
* Local and production instances do not collide.

Suggested commands:

```bash
npm run dev
npm run test
npm run lint
npm run build
npm run release:check
```

---

# Stage 2 — OLX image discovery and downloading

Implement image discovery for OLX Portugal.

A representative listing is:

```text
https://www.olx.pt/d/anuncio/abarth-595-competizione-nacional-IDIZgLL.html
```

Use this selector as the first and preferred method:

```javascript
const PRIMARY_OLX_GALLERY_SELECTOR =
  '#mainContent div.swiper-wrapper > div.swiper-slide ' +
  'div.swiper-zoom-container > img';
```

Equivalent:

```javascript
document.querySelectorAll(
  '#mainContent div.swiper-wrapper > div.swiper-slide ' +
  'div.swiper-zoom-container > img'
);
```

Representative image:

```html
<img
  src="https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=750x1000"
  alt="Abarth 595 Competizione | Nacional"
  sizes="(min-width: 1100px) 992px, (min-width: 780px) 516px, 100vw"
  srcset="
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=389x272 420w,
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=516x361 780w,
    https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=1000x700 992w
  "
  data-testid="swiper-image-lazy"
>
```

For each matched image:

1. Parse `srcset`.
2. Prefer the candidate with the largest width descriptor.
3. Fall back to `currentSrc`.
4. Fall back to `src`.
5. Preserve explicit ports, semicolons, and query strings.
6. Deduplicate URLs.
7. Preserve gallery order.

For the example above, select:

```text
https://ireland.apollo.olxcdn.com:443/v1/files/n6oiesukt6b52-PT/image;s=1000x700
```

Use privileged Tampermonkey requests:

```javascript
GM.xmlHttpRequest
```

or the compatible legacy API.

The metadata should include:

```javascript
// @connect      ireland.apollo.olxcdn.com
```

Fallback selectors:

```css
#mainContent img[data-testid="swiper-image-lazy"]
```

and then:

```css
#mainContent div.swiper-wrapper img
```

Process images sequentially.

The Stage 2 panel should show:

```text
Found 8 listing images
Downloading image 1 of 8
```

Do not add ANPR yet.

Create tests for:

* Primary selector.
* Gallery order.
* Largest `srcset` candidate.
* `currentSrc` fallback.
* `src` fallback.
* Duplicate slides.
* `:443`.
* `image;s=1000x700`.
* Empty gallery.
* Dynamic gallery loading.

---

# Stage 3 — Local plate detection and OCR

Implement local Portuguese plate recognition.

Pipeline:

```text
OLX listing image
→ ONNX plate detector
→ crop detected plate
→ ONNX plate OCR
→ Portuguese plate validator
→ first reliable plate
→ clipboard
```

Preferred initial models:

```text
Detector: YOLOv9-t-384 FastALPR-compatible ONNX model
OCR: FastPlateOCR CCT-XS global ONNX model
```

Before implementing inference:

1. Inspect the exact upstream model files.
2. Inspect FastALPR and FastPlateOCR preprocessing.
3. Record model input names, shapes, types, normalization, output shapes, alphabet, and decoding.
4. Do not guess tensor formats.

Use:

```text
WebGPU first
WASM fallback
```

Load each model once and reuse the sessions.

Cache model files in IndexedDB so they are not downloaded for every scan.

For development, models may be served from:

```text
http://127.0.0.1:4173/models/
```

For production, use pinned GitHub Release asset URLs.

Verify model files using SHA-256.

Create:

```text
models/manifest.development.json
models/manifest.production.json
THIRD_PARTY_NOTICES.md
```

Do not redistribute a model unless its license allows it.

## Portuguese formats

Support:

```text
AA-00-00
00-00-AA
00-AA-00
AA-00-AA
```

Internally:

```text
LLDDDD
DDDDLL
DDLLDD
LLDDLL
```

Normalize the final result without separators for the initial clipboard behavior:

```text
06TM95
AB12CD
```

Also preserve a formatted version internally:

```text
06-TM-95
AB-12-CD
```

Possible OCR ambiguity corrections:

Letter positions:

```text
0 → O
1 → I
5 → S
8 → B
```

Digit positions:

```text
O → 0
I → 1
L → 1
S → 5
B → 8
```

Rules:

1. Prefer results requiring no correction.
2. Penalize every correction.
3. Allow at most one correction initially.
4. Require stronger confidence when a correction is used.
5. Do not accept a value only because it matches a regular expression.
6. Reject low-confidence or conflicting results.

Stop after the first reliable plate according to OLX gallery order.

On success:

```text
Plate found: 06TM95
Copied to clipboard
```

Initially copy only:

```text
06TM95
```

Required Stage 3 controls:

```text
Read plate
Cancel
Copy again
Clear model cache
Diagnostics
```

Required tests:

* Every Portuguese format.
* Character ambiguity correction.
* Excessive correction rejection.
* Detector coordinate restoration.
* OCR sequence decoding.
* Stable gallery order.
* First accepted plate.
* Clipboard fallback.
* WebGPU failure and WASM fallback.
* Model cache hit and miss.

Stage 3 is the first useful production release.

Do not begin vehicle-data extraction until Stage 3 works on real OLX listings.

---

# Stage 4 — Basic vehicle listing extraction

After plate recognition works, add structured page-data extraction.

Create a simple site-adapter architecture.

Initial adapter:

```text
olx-pt
```

The core application must not contain OLX selectors. OLX-specific logic belongs in:

```text
src/adapters/olx-pt/
```

The adapter should attempt to extract:

* Listing URL.
* Listing ID.
* Title.
* Make.
* Model.
* Year.
* Mileage.
* Transmission.
* Fuel.
* Engine.
* Power.
* Price.
* Description.

Prefer extraction sources in this order:

1. JSON-LD.
2. Stable embedded page data.
3. `data-testid`.
4. Semantic HTML.
5. Visible labels and values.
6. Conservative title parsing.

Do not rely primarily on generated CSS class names.

Normalize:

## Mileage

```text
103.000 km
103 000 km
103000 km
```

to:

```text
103000
```

## Price

```text
10.950 €
€10,950
```

to:

```text
10950
```

## Transmission

Normalize to Portuguese uppercase output:

```text
MANUAL
AUTOMÁTICA
```

## Fuel

Normalize common values to Portuguese uppercase:

```text
GASOLINA
DIESEL
ELÉTRICO
HÍBRIDO
GPL
```

## Power

Normalize to:

```text
95 CV
```

while preserving the original value.

Display the extracted fields in an editable review panel.

Do not copy the final large text template yet.

---

# Stage 5 — Complete editable vehicle form

Expand the review panel to include these fields:

```text
Matrícula
Marca
Modelo
Ano
Km
Tipo caixa
Combustivel
Motor
Potencia
Peças Pintura
Peças Chapa
Pneus
Valor cliente
Razão venda
Numero de Chaves
Iva dedutivel
URL
```

Use these initial rules:

## Automatically extracted or recognized when available

* Matrícula.
* Marca.
* Modelo.
* Ano.
* Km.
* Tipo caixa.
* Combustivel.
* Motor.
* Potencia.
* Valor cliente.
* URL.

## Primarily manual fields

These usually cannot be reliably extracted from the public listing and should be editable fields:

* Peças Pintura.
* Peças Chapa.
* Pneus.
* Razão venda.
* Numero de Chaves.
* Iva dedutivel.

Default suggestions:

```text
Peças Pintura: OK
Peças Chapa: OK
Pneus: OK
Razão venda: VENDA
Numero de Chaves: 2
Iva dedutivel: NÃO
```

Make all defaults configurable in Settings.

Do not pretend these manually defaulted values were extracted from OLX.

Visually distinguish:

* Extracted field.
* ANPR field.
* Default field.
* User-edited field.
* Missing field.

The user must be able to review and edit everything before copying.

Do not persist complete listing records.

Persist only settings and default values.

---

# Stage 6 — Final clipboard template

Add a “Copy full text” button.

Generate text in this exact order:

```text
Matrícula: 06TM95
Marca: SEAT
Modelo: IBIZA
Ano: 2017
Km: 103000
Tipo caixa: MANUAL
Combustivel: GASOLINA
Motor: 1.0
Potencia: 95 CV
Peças Pintura: OK
Peças Chapa: OK
Pneus: OK
Valor cliente: 10950 €
Razão venda: VENDA
Numero de Chaves: 2
Iva dedutivel: NÃO

https://www.olx.pt/d/anuncio/abarth-595-competizione-nacional-IDIZgLL.html
```

Formatting requirements:

1. Preserve the exact field order.
2. Use the labels exactly as shown.
3. Use the plate without hyphens:

   ```text
   06TM95
   ```
4. Use raw integer mileage:

   ```text
   103000
   ```
5. Format customer value:

   ```text
   10950 €
   ```
6. Insert one blank line before the URL.
7. Do not add empty lines between fields.
8. Allow the user to edit every value before copying.
9. For missing values, leave the value empty rather than writing `null` or `undefined`.
10. Keep accents and spelling exactly as configured in the template.

Also retain buttons for:

```text
Copy plate only
Copy full text
Copy JSON
```

The JSON format should include extraction metadata, but the text format should include only the visible fields above.

---

# 4. Simplified normalized data object

Use a practical structure similar to:

```javascript
{
  source: {
    siteId: 'olx-pt',
    url: '',
    listingId: ''
  },

  vehicle: {
    plate: '',
    plateFormatted: '',
    make: '',
    model: '',
    year: '',
    mileageKm: '',
    transmission: '',
    fuel: '',
    engine: '',
    powerCv: ''
  },

  valuation: {
    paintParts: 'OK',
    bodyParts: 'OK',
    tires: 'OK',
    customerValueEur: '',
    saleReason: 'VENDA',
    keyCount: '2',
    deductibleVat: 'NÃO'
  },

  metadata: {
    extractedFields: [],
    defaultedFields: [],
    editedFields: [],
    warnings: []
  }
}
```

Keep the object simple. Do not create an unnecessarily complex enterprise schema.

---

# 5. Recommended repository structure

Use a structure close to:

```text
.
├── src/
│   ├── main.js
│   ├── environment.js
│   ├── config.js
│   ├── app/
│   │   ├── controller.js
│   │   └── state.js
│   ├── adapters/
│   │   ├── registry.js
│   │   └── olx-pt/
│   │       ├── index.js
│   │       ├── extract.js
│   │       ├── images.js
│   │       └── selectors.js
│   ├── anpr/
│   │   ├── runtime.js
│   │   ├── detector.js
│   │   ├── ocr.js
│   │   ├── model-cache.js
│   │   └── portugal-plates.js
│   ├── image/
│   │   ├── download.js
│   │   ├── decode.js
│   │   ├── resize.js
│   │   └── crop.js
│   ├── clipboard/
│   │   ├── full-text.js
│   │   └── clipboard.js
│   ├── ui/
│   │   ├── panel.js
│   │   ├── form.js
│   │   └── styles.js
│   ├── storage/
│   │   ├── indexed-db.js
│   │   └── settings.js
│   └── userscript/
│       ├── gm-api.js
│       ├── local-loader.js
│       └── production-metadata.js
├── dev/
│   ├── server.mjs
│   └── fixtures/
│       └── olx-listing.html
├── models/
│   ├── manifest.development.json
│   └── manifest.production.json
├── scripts/
│   ├── build-local-loader.mjs
│   ├── build-production.mjs
│   └── release-check.mjs
├── tests/
├── dist-dev/
│   ├── vehicle-listing-clipper-local.user.js
│   └── vehicle-listing-clipper.dev.js
├── dist/
│   └── vehicle-listing-clipper.user.js
├── README.md
├── PLAN.md
├── DECISIONS.md
├── SECURITY.md
├── THIRD_PARTY_NOTICES.md
├── package.json
└── vite.config.js
```

This is a suggestion, not a rigid requirement. Keep the repository understandable.

---

# 6. Userscript metadata

## Local development

Use metadata similar to:

```javascript
// ==UserScript==
// @name         Vehicle Listing Clipper [LOCAL DEV]
// @namespace    local.vehicle-listing-clipper
// @version      0.0.0-dev
// @match        https://www.olx.pt/*
// @match        http://127.0.0.1:4173/*
// @grant        GM.xmlHttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      127.0.0.1
// @connect      ireland.apollo.olxcdn.com
// @run-at       document-start
// ==/UserScript==
```

## Production

Use metadata similar to:

```javascript
// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/GITHUB_USERNAME/vehicle-listing-clipper
// @version      0.1.0
// @match        https://www.olx.pt/*
// @grant        GM.xmlHttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      ireland.apollo.olxcdn.com
// @connect      github.com
// @connect      objects.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/GITHUB_USERNAME/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @downloadURL  https://raw.githubusercontent.com/GITHUB_USERNAME/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @run-at       document-idle
// ==/UserScript==
```

Do not add permissions for unsupported future websites.

---

# 7. Privacy and security

The project must:

* Never upload listing images.
* Never upload plates.
* Never upload extracted vehicle data.
* Include no analytics.
* Include no telemetry.
* Include no external logging.
* Include no API keys.
* Include no backend.
* Not persist complete listing records.
* Not persist recognized plates.
* Cache only model files and user settings.

Document that the local development script executes JavaScript served from the developer’s own loopback server.

The production script must not execute remotely loaded application JavaScript.

---

# 8. Testing requirements

At minimum, test:

## Development and production builds

* Local loader is generated.
* Production bundle is generated.
* Production bundle contains no localhost reference.
* Local and production storage names differ.
* Userscript metadata appears first.
* Only one instance initializes.

## OLX images

* Exact primary selector.
* DOM order.
* Largest `srcset`.
* Duplicate slides.
* Dynamic gallery.
* Empty gallery.
* OLX CDN URL preservation.

## Portuguese plates

* `AA-00-00`.
* `00-00-AA`.
* `00-AA-00`.
* `AA-00-AA`.
* Hyphen removal.
* Ambiguity correction.
* Excessive correction rejection.
* First accepted result.

## Field normalization

* Mileage.
* Price.
* Transmission.
* Fuel.
* Power.
* Missing values.

## Clipboard

Verify the exact final output:

```text
Matrícula: 06TM95
Marca: SEAT
Modelo: IBIZA
Ano: 2017
Km: 103000
Tipo caixa: MANUAL
Combustivel: GASOLINA
Motor: 1.0
Potencia: 95 CV
Peças Pintura: OK
Peças Chapa: OK
Pneus: OK
Valor cliente: 10950 €
Razão venda: VENDA
Numero de Chaves: 2
Iva dedutivel: NÃO

https://www.olx.pt/d/anuncio/abarth-595-competizione-nacional-IDIZgLL.html
```

Test empty values, edited values, and clipboard fallback.

Do not commit real identifiable registration plates in photographs. Use synthetic fixtures where possible.

---

# 9. Documentation

Create a concise README containing:

## Local development

```bash
npm install
npm run dev
```

Install:

```text
http://127.0.0.1:4173/vehicle-listing-clipper-local.user.js
```

Then edit files and reload the OLX page.

## Production

```bash
npm run test
npm run lint
npm run build
npm run release:check
```

Commit:

```text
dist/vehicle-listing-clipper.user.js
```

Push to GitHub and install from its raw URL.

## Stages

Document which stages are complete.

Example:

```text
Stage 1: Complete
Stage 2: Complete
Stage 3: In progress
Stage 4: Planned
Stage 5: Planned
Stage 6: Planned
```

Include prominently:

```text
This tool does not upload listing images, extracted vehicle information, or recognized license plates. Extraction and inference run locally in Chrome.
```

---

# 10. Definition of done by stage

## Stage 1 complete

* Local development script works.
* Production script builds.
* Floating panel appears.
* Local fixture works.

## Stage 2 complete

* OLX gallery images are discovered.
* Highest-resolution URLs are selected.
* Images are downloaded locally.

## Stage 3 complete

* Detector runs.
* OCR runs.
* Portuguese plate is validated.
* First reliable plate is copied.
* Models are cached.
* WebGPU and WASM fallback work.

## Stage 4 complete

* Basic listing fields are extracted.
* Fields appear in an editable panel.

## Stage 5 complete

* Full vehicle review form exists.
* Manual/default fields are clearly identified.
* Defaults are configurable.

## Stage 6 complete

* Exact full text is generated.
* Text can be reviewed and edited.
* “Copy full text” works.
* “Copy plate only” works.
* JSON copy works.

Start with Stage 1.

Do not implement all stages in one uncontrolled pass.

Finish and verify each stage before moving forward.

The plate-recognition workflow in Stage 3 is the first major product milestone and must work before expanding into full listing extraction.
