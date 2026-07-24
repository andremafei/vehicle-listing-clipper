# Security

## Guarantees

- No backend, cloud functions, or hosted OCR APIs.
- Listing images, plates, phone numbers, and extracted vehicle data are not uploaded.
- No analytics, telemetry, external logging, or API keys.
- Processed listing payloads (fields, plate, phone, clipboard text, and generated fallback `ID` when used) may be cached **locally** in Tampermonkey storage for up to **2 days**, keyed by listing URL, so revisits can skip reprocessing. Older entries are pruned when a listing page loads.
- Model files (ONNX weights in IndexedDB) and user settings may also be stored locally.
- Clipboard writes only happen when you click **Copy** (then **Copy again**), after a fresh clip or a cache restore. Auto-process does not write the clipboard.

## Local development risk

The **Vehicle Listing Clipper [LOCAL DEV]** userscript loads and executes JavaScript from `http://127.0.0.1:4173`. Only run `npm run dev` on a machine you trust, and disable the LOCAL DEV script when not developing.

## Production

The production userscript installed in Tampermonkey is a thin loader. On each page load it fetches and executes `dist/vehicle-listing-clipper.bundle.js` from `raw.githubusercontent.com` (`main`). It must not load application JavaScript from localhost. Making this repository private (or removing the published bundle) causes the fetch to fail and production stops running — that is intentional.

Model weights and ONNX Runtime WASM may be fetched from pinned upstream / CDN URLs as binary data. `npm run release:check` rejects localhost / LOCAL DEV markers in the production loader and bundle.

## Permissions

Grants are limited to clipboard helpers, value storage, and `GM.xmlHttpRequest` for the production app bundle (`raw.githubusercontent.com`), CDN image downloads, model downloads, and ORT WASM assets (`cdn.jsdelivr.net`). No broad website `@match` beyond `https://www.olx.pt/*`, `https://www.standvirtual.com/*`, and `https://crm.flexicar.pt/*` (plus loopback for LOCAL DEV).
