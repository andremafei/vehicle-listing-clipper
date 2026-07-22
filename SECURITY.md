# Security

## Guarantees

- No backend, cloud functions, or hosted OCR APIs.
- Listing images, plates, and extracted vehicle data are not uploaded.
- No analytics, telemetry, external logging, or API keys.
- Complete listing records and recognized plates are not persisted.
- Only model files (future) and user settings may be stored locally.

## Local development risk

The **Vehicle Listing Clipper [LOCAL DEV]** userscript loads and executes JavaScript from `http://127.0.0.1:4173`. Only run `npm run dev` on a machine you trust, and disable the LOCAL DEV script when not developing.

## Production

The production userscript is a single fully bundled file. It must not load application JavaScript from the network (models in Stage 3+ are data weights, not executable app code). `npm run release:check` rejects localhost / LOCAL DEV markers in the production output.

## Permissions

Grants are limited to clipboard helpers, value storage, and `GM.xmlHttpRequest` for CDN image downloads (Stage 2) and model downloads (Stage 3). No broad website `@match` beyond `https://www.olx.pt/*` (plus loopback for LOCAL DEV).
