/**
 * Production Tampermonkey loader.
 * Install once from GitHub raw; each page load fetches and evals the app bundle
 * from raw.githubusercontent.com so a push to main updates production.
 * Making the repository private breaks the fetch and the script stops working.
 */

export const PRODUCTION_LOADER_SOURCE = `// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.3.0
// @description  Local plate recognition and listing extraction (OLX/Standvirtual) plus CRM lead verify/create on crm.flexicar.pt. Loads app JS from GitHub raw on each page.
// @author       andremafei
// @match        https://www.olx.pt/*
// @match        https://www.standvirtual.com/*
// @match        https://crm.flexicar.pt/*
// @require      https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      ireland.apollo.olxcdn.com
// @connect      github.com
// @connect      raw.githubusercontent.com
// @connect      objects.githubusercontent.com
// @connect      release-assets.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @updateURL    https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @downloadURL  https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @run-at       document-idle
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
    console.error('[Vehicle Listing Clipper] Failed to bind ort global', e);
  }

  if (typeof globalThis === 'undefined' || !globalThis.ort) {
    console.error(
      '[Vehicle Listing Clipper] ort is missing after @require. Reinstall the userscript so Tampermonkey fetches ort.min.js.'
    );
  }

  var BUNDLE_URL =
    'https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.bundle.js?t=' +
    Date.now();

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
      '[Vehicle Listing Clipper] GM.xmlHttpRequest is unavailable.'
    );
  }

  request({
    method: 'GET',
    url: BUNDLE_URL,
    onload: function (response) {
      if (response.status !== 200) {
        console.error(
          '[Vehicle Listing Clipper] HTTP ' +
            response.status +
            ' loading ' +
            BUNDLE_URL +
            '. If the repository is private or the file was removed, production cannot run.'
        );
        return;
      }
      try {
        // eslint-disable-next-line no-eval
        eval(response.responseText);
      } catch (error) {
        console.error(
          '[Vehicle Listing Clipper] Failed to evaluate bundle',
          error
        );
      }
    },
    onerror: function () {
      console.error(
        '[Vehicle Listing Clipper] Failed to load ' +
          BUNDLE_URL +
          '. Check network access, or whether the repository is private.'
      );
    },
  });
})();
`;
