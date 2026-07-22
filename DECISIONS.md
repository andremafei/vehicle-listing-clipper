# Decisions

## Bundler: Vite

Chosen over a standalone esbuild script for library IIFE builds, watch mode, and a simple path to later ONNX asset handling.

## GitHub owner: andremafei

Used in production `@namespace`, `@updateURL`, and `@downloadURL` to match the repository path.

## Local loader uses GM.xmlHttpRequest + eval

Injecting a `<script src="http://127.0.0.1:4173/...">` would run in the page world without GM APIs. Fetching the bundle with `GM.xmlHttpRequest` and evaluating it keeps LOCAL DEV inside the userscript sandbox.

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

Bundling `onnxruntime-web` into the IIFE ballooned the userscript past 50MB. Production and LOCAL DEV scripts `@require` `ort.min.js` from jsDelivr (pinned 1.22.0); WASM files still load from the same CDN package path. App code stays fully bundled and free of localhost markers.

Tampermonkey runs `@require` as sandbox `var ort`, which is often **not** visible as `globalThis.ort`. The local loader and production bridge assign `globalThis.ort = ort` before the app runs; `getOrt()` also falls back to sandbox scope via indirect eval.

## Clip listing: plate + OLX phone reveal

The primary panel action is **Clip listing**. It runs listing-field extraction, plate ANPR, and phone reveal in parallel where possible, then builds an editable listing record and auto-copies the Stage 6 full-text template. Phone appears in the status line only (not in the text template).

OLX often mounts **two** `button[data-testid="ad-contact-phone"]` nodes (one `display:none`, one visible). Prefer CSS visibility (`display !== none`) over `getBoundingClientRect` / `checkVisibility` alone: the Tampermonkey sandbox frequently reports `0×0` rects and false-negatives for real page nodes, which previously caused clicks on the hidden duplicate. Avoid `instanceof HTMLElement` checks across the sandbox/page realm boundary.

## Stages 4–6 shipped together

Extraction, editable form (with configurable defaults), and the final clipboard template were implemented in one delivery. Selectors stay under `src/adapters/olx-pt/`. Motor comes from parameter `Cilindrada`. Manual fields default to `OK` / `OK` / `OK` / `VENDA` / `2` / `NÃO` and are not claimed as OLX-extracted. Listing URL prefers `link#ssr_canonical`, stripped to a path ending in `.html`.
