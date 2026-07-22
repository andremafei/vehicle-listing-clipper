# Vehicle Listing Clipper

Tampermonkey userscript for OLX Portugal vehicle listings. Click a button, scan listing images **locally in Chrome**, recognize a Portuguese license plate, and (in later stages) copy a formatted vehicle summary.

**This tool does not upload listing images, extracted vehicle information, or recognized license plates. Extraction and inference run locally in Chrome.**

Enable **only one** of the two scripts at a time (LOCAL DEV or production).

## Stages

```text
Stage 1: Complete
Stage 2: Planned
Stage 3: Planned
Stage 4: Planned
Stage 5: Planned
Stage 6: Planned
```

## Local development

```bash
npm install
npm run dev
```

### Install in Tampermonkey (LOCAL DEV)

1. Keep `npm run dev` running.
2. In Chrome, open Tampermonkey.
3. Visit:

```text
http://127.0.0.1:4173/vehicle-listing-clipper-local.user.js
```

4. Click **Install** on the Tampermonkey confirmation page.
5. Open the fixture (or any OLX listing):

```text
http://127.0.0.1:4173/
```

You should see a floating **Vehicle Listing Clipper** panel with a **LOCAL DEV** badge. “Read plate” is a stub until Stage 3.

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

The production script is fully bundled. It does not load application JavaScript from localhost.

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
- Model files (Stage 3+) and settings may be cached locally; listing records and plates are not persisted.
- The LOCAL DEV script executes JavaScript served from your own loopback server (`127.0.0.1:4173`).
