# Plan

Incremental delivery for **vehicle-listing-clipper**.

## Stage 1 — Project skeleton and local testing (complete)

Verified on a real Tampermonkey install against the local fixture.

- Dual Tampermonkey scripts (LOCAL DEV loader + production bundle)
- Vite build, Vitest, ESLint
- Floating panel on OLX / local fixture
- Separate local vs production storage prefixes
- “Read plate” stub only

## Stage 2 — OLX image discovery and downloading (complete)

Verified on a real Tampermonkey install against the local fixture.

- `olx-pt` adapter with primary + fallback gallery selectors
- Largest `srcset` URL selection (preserve `:443` and `;s=` tokens)
- Sequential download via `GM.xmlHttpRequest` into in-memory `ArrayBuffer`s (not saved to disk, not uploaded)
- Panel progress: Found N / Downloading i of N

## Stage 3 — Local plate detection and OCR (next)

- ONNX detector + OCR (WebGPU, WASM fallback)
- Portuguese plate validation
- IndexedDB model cache
- First reliable plate → clipboard

## Stage 4 — Basic vehicle listing extraction

- `olx-pt` site adapter
- Editable review of extracted fields

## Stage 5 — Complete editable vehicle form

- Full field set + configurable defaults
- Visual distinction of extracted / ANPR / default / edited / missing

## Stage 6 — Final clipboard template

- Copy plate only / full text / JSON
- Exact template formatting
