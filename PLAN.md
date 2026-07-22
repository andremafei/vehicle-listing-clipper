# Plan

Incremental delivery for **vehicle-listing-clipper**.

## Stage 1 — Project skeleton and local testing (complete)

Verified on a real Tampermonkey install against the local fixture.

- Dual Tampermonkey scripts (LOCAL DEV loader + production bundle)
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

### Stage 3 follow-up — Clip listing + phone reveal (complete)

Verified on a real OLX.pt listing (LOCAL DEV).

- Panel action renamed to **Clip listing**
- Parallel reveal of **Ver número** via stable `data-testid` selectors
- Clipboard payload: plate and/or phone digits (newline-separated)
- Handles duplicate hidden/visible reveal buttons under the Tampermonkey sandbox

## Stage 4 — Basic vehicle listing extraction (next)

- Expand `olx-pt` adapter for structured fields
- Editable review of extracted fields

## Stage 5 — Complete editable vehicle form

- Full field set + configurable defaults
- Visual distinction of extracted / ANPR / default / edited / missing

## Stage 6 — Final clipboard template

- Copy plate only / full text / JSON
- Exact template formatting
