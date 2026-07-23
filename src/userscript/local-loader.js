/**
 * Local development Tampermonkey loader.
 * Install once from the dev server; reload the page after each rebuild.
 * Fetches the bundle via GM.xmlHttpRequest so it runs in the userscript sandbox.
 */

export const LOCAL_LOADER_SOURCE = `// ==UserScript==
// @name         Vehicle Listing Clipper [LOCAL DEV]
// @namespace    local.vehicle-listing-clipper
// @version      0.0.0-dev
// @description  LOCAL DEV loader. Executes JS from the local Vite/dev server. Do not use alongside the production script.
// @author       andremafei
// @match        https://www.olx.pt/*
// @match        https://www.standvirtual.com/*
// @match        http://127.0.0.1:4173/*
// @require      https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      127.0.0.1
// @connect      ireland.apollo.olxcdn.com
// @connect      github.com
// @connect      objects.githubusercontent.com
// @connect      release-assets.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  // @require defines sandbox \`var ort\`, which is often NOT on globalThis.
  // Promote it so the Vite bundle can find onnxruntime-web.
  try {
    if (typeof ort !== 'undefined' && ort) {
      if (typeof globalThis !== 'undefined') globalThis.ort = ort;
      if (typeof window !== 'undefined') window.ort = ort;
    }
  } catch (e) {
    console.error('[Vehicle Listing Clipper LOCAL DEV] Failed to bind ort global', e);
  }

  if (typeof globalThis === 'undefined' || !globalThis.ort) {
    console.error(
      '[Vehicle Listing Clipper LOCAL DEV] ort is missing after @require. Reinstall the userscript so Tampermonkey fetches ort.min.js.'
    );
  }

  var BUNDLE_URL =
    'http://127.0.0.1:4173/vehicle-listing-clipper.dev.js?t=' + Date.now();

  function request(options) {
    if (typeof GM !== 'undefined' && GM && typeof GM.xmlHttpRequest === 'function') {
      GM.xmlHttpRequest(options);
      return;
    }
    if (typeof GM_xmlhttpRequest === 'function') {
      GM_xmlhttpRequest(options);
      return;
    }
    console.error(
      '[Vehicle Listing Clipper LOCAL DEV] GM.xmlHttpRequest is unavailable.'
    );
  }

  request({
    method: 'GET',
    url: BUNDLE_URL,
    onload: function (response) {
      if (response.status !== 200) {
        console.error(
          '[Vehicle Listing Clipper LOCAL DEV] HTTP ' +
            response.status +
            ' loading ' +
            BUNDLE_URL
        );
        return;
      }
      try {
        // eslint-disable-next-line no-eval
        eval(response.responseText);
      } catch (error) {
        console.error(
          '[Vehicle Listing Clipper LOCAL DEV] Failed to evaluate bundle',
          error
        );
      }
    },
    onerror: function () {
      console.error(
        '[Vehicle Listing Clipper LOCAL DEV] Failed to load ' +
          BUNDLE_URL +
          '. Is npm run dev running?'
      );
    },
  });
})();
`;
