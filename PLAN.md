# Plan

Incremental delivery for **vehicle-listing-clipper**.

## Stage 1 — Project skeleton and local testing (complete)

Verified on a real Tampermonkey install against the local fixture.

- Dual Tampermonkey scripts (LOCAL DEV loader + production GitHub loader)
- Vite build, Vitest, ESLint
- Floating panel on OLX / local fixture
- Separate local vs production storage prefixes

## Stage 2 — OLX image discovery and downloading (complete)

Verified on a real Tampermonkey install against the local fixture.

- `olx-pt` adapter with primary + fallback gallery selectors
- Largest `srcset` URL selection (preserve `:443` and `;s=` tokens)
- Sequential download via `GM.xmlHttpRequest` into in-memory `ArrayBuffer`s (not saved to disk, not uploaded)
- Panel progress: Found N / Downloading i of N

## Stage 3 — Local plate detection and OCR (complete)

Verified on a real Tampermonkey install (LOCAL DEV), including interleaved download+scan (one image at a time; stop early).

- YOLOv9-t-384 detector + CCT-XS OCR via `onnxruntime-web` (WebGPU → WASM)
- IndexedDB model cache with SHA-256 verification
- Portuguese plate validation + clipboard copy of first reliable plate
- Cancel / Copy again / Clear model cache / Diagnostics
- ORT loaded via Tampermonkey `@require` (not bundled); WASM from jsDelivr
- Gallery images downloaded lazily: download → scan → discard → next only if needed

## Stage 4 — Basic vehicle listing extraction (complete)

- `olx-pt` `extractListing` from JSON-LD + `data-testid` parameters
- Normalized make/model/year/km/transmission/fuel/engine/power/price/URL

## Stage 5 — Complete editable vehicle form (complete)

- Full field set with configurable defaults (paint/body/tires/sale/keys/VAT)
- Visual origin badges: extracted / anpr / default / edited / missing

## Stage 6 — Final clipboard template (complete)

- Copy plate only / full text / JSON
- Exact Portuguese template + blank line before canonical `.html` URL
