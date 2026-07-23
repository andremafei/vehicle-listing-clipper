import { createServer } from 'node:http';
import { mkdir, writeFile, access } from 'node:fs/promises';
import { createReadStream, existsSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';
import { LOCAL_LOADER_SOURCE } from '../src/userscript/local-loader.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDev = resolve(root, 'dist-dev');
const fixturesDir = resolve(root, 'dev/fixtures');
const crmSimDir = resolve(root, 'dev/crm-sim');
const HOST = '127.0.0.1';
const PORT = 4173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.map': 'application/json; charset=utf-8',
};

const CRM_STATIC_EXT = new Set(['.js', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.map']);

async function writeLocalLoader() {
  await mkdir(distDev, { recursive: true });
  const outPath = join(distDev, 'vehicle-listing-clipper-local.user.js');
  await writeFile(outPath, LOCAL_LOADER_SOURCE, 'utf8');
  return outPath;
}

async function startViteWatch() {
  const watcher = await build({
    configFile: resolve(root, 'vite.config.js'),
    mode: 'development',
    build: {
      watch: {},
    },
  });
  return watcher;
}

/**
 * @param {string} pathname
 * @returns {{ path: string, spa?: boolean } | null}
 */
function resolvePublicPath(pathname) {
  if (pathname === '/' || pathname === '/index.html') {
    return { path: join(fixturesDir, 'olx-listing.html') };
  }
  if (pathname === '/fixtures/olx-listing.html') {
    return { path: join(fixturesDir, 'olx-listing.html') };
  }
  if (pathname === '/vehicle-listing-clipper-local.user.js') {
    return { path: join(distDev, 'vehicle-listing-clipper-local.user.js') };
  }
  if (pathname === '/vehicle-listing-clipper.dev.js') {
    return { path: join(distDev, 'vehicle-listing-clipper.dev.js') };
  }
  if (pathname.startsWith('/models/')) {
    return { path: join(root, pathname.slice(1)) };
  }
  if (pathname.startsWith('/fixtures/')) {
    return { path: join(fixturesDir, pathname.slice('/fixtures/'.length)) };
  }

  // LeadDesk CRM simulator SPA (local only)
  if (pathname === '/crm' || pathname === '/crm/' || pathname.startsWith('/crm/')) {
    const relative = pathname === '/crm' || pathname === '/crm/' ? '' : pathname.slice('/crm/'.length);
    if (relative) {
      const assetPath = resolve(crmSimDir, relative);
      if (!assetPath.startsWith(crmSimDir + '/') && assetPath !== crmSimDir) {
        return null;
      }
      const ext = extname(assetPath).toLowerCase();
      if (CRM_STATIC_EXT.has(ext)) {
        return { path: assetPath };
      }
    }
    return { path: join(crmSimDir, 'index.html'), spa: true };
  }

  // sourcemaps and other dist-dev assets
  return { path: join(distDev, pathname.slice(1)) };
}

async function fileExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
    const resolved = resolvePublicPath(url.pathname);
    const filePath = resolved?.path;

    if (!filePath || !(await fileExists(filePath))) {
      send(res, 404, `Not found: ${url.pathname}`, {
        'Content-Type': 'text/plain; charset=utf-8',
      });
      return;
    }

    const type = MIME[extname(filePath)] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    });
    createReadStream(filePath).pipe(res);
  } catch (error) {
    console.error(error);
    send(res, 500, 'Internal Server Error', {
      'Content-Type': 'text/plain; charset=utf-8',
    });
  }
});

await writeLocalLoader();
console.log('Wrote local Tampermonkey loader');

if (!existsSync(join(distDev, 'vehicle-listing-clipper.dev.js'))) {
  console.log('Building development bundle…');
  await build({
    configFile: resolve(root, 'vite.config.js'),
    mode: 'development',
  });
}

await startViteWatch();
console.log('Watching source for rebuilds…');

server.listen(PORT, HOST, () => {
  console.log(`
Vehicle Listing Clipper — local development

  Fixture:     http://${HOST}:${PORT}/
  LeadDesk CRM: http://${HOST}:${PORT}/crm/
  Local script: http://${HOST}:${PORT}/vehicle-listing-clipper-local.user.js
  Dev bundle:  http://${HOST}:${PORT}/vehicle-listing-clipper.dev.js

Install the LOCAL DEV userscript once in Tampermonkey, then reload after edits.
One script: OLX / Standvirtual (clipper) + crm.flexicar.pt / LeadDesk /crm (CRM panel).
Enable only one of LOCAL DEV or production at a time.
`);
});
