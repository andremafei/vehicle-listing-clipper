# Security

## Guarantees

- No backend, cloud functions, or hosted OCR APIs.
- Listing images, plates, phone numbers, and extracted vehicle data are not uploaded.
- No analytics, telemetry, external logging, or API keys.
- Processed listing payloads (fields, plate, phone, clipboard text, and generated fallback `ID` when used) may be cached **locally** in Tampermonkey storage for up to **2 days**, keyed by listing URL, so revisits can skip reprocessing. Older entries are pruned when a listing page loads.
- Model files (ONNX weights in IndexedDB) and user settings may also be stored locally.
- Clipboard writes on a cache hit only happen when you click **Copy** (then **Copy again**).

## Local development risk

The **Vehicle Listing Clipper [LOCAL DEV]** userscript loads and executes JavaScript from `http://127.0.0.1:4173`. Only run `npm run dev` on a machine you trust, and disable the LOCAL DEV script when not developing.

## Production

The production userscript is a single fully bundled application file. It must not load application JavaScript from localhost. Model weights and ONNX Runtime WASM may be fetched from pinned upstream / CDN URLs as binary data. `npm run release:check` rejects localhost / LOCAL DEV markers in the production output.

## Permissions

Grants are limited to clipboard helpers, value storage, and `GM.xmlHttpRequest` for CDN image downloads, model downloads, and ORT WASM assets (`cdn.jsdelivr.net`). No broad website `@match` beyond `https://www.olx.pt/*` and `https://www.standvirtual.com/*` (plus loopback for LOCAL DEV).
