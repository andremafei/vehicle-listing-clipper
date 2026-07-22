/**
 * Production userscript header (prepended to the bundled IIFE).
 * Must appear at the top of dist/vehicle-listing-clipper.user.js
 */

export const PRODUCTION_METADATA = `// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.2.1
// @description  Local plate recognition and vehicle listing extraction for OLX Portugal. No uploads.
// @author       andremafei
// @match        https://www.olx.pt/*
// @require      https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.min.js
// @grant        GM.xmlHttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      ireland.apollo.olxcdn.com
// @connect      github.com
// @connect      objects.githubusercontent.com
// @connect      release-assets.githubusercontent.com
// @connect      cdn.jsdelivr.net
// @updateURL    https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @downloadURL  https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @run-at       document-idle
// ==/UserScript==
`;
