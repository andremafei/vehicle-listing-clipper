// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.1.0
// @description  Local plate recognition and vehicle listing extraction for OLX Portugal. No uploads.
// @author       andremafei
// @match        https://www.olx.pt/*
// @grant        GM.xmlHttpRequest
// @grant        GM_setClipboard
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      ireland.apollo.olxcdn.com
// @connect      github.com
// @connect      objects.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @downloadURL  https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @run-at       document-idle
// ==/UserScript==

(function(){"use strict";const g="Vehicle Listing Clipper",v="vlc_prod_",h="vehicle-listing-clipper",u="__VLC_PROD_INITIALIZED__",r="vlc-panel-root";function E(){return{statusMessage:"",view:"idle"}}const y=`
:host, .vlc-root {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.vlc-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 280px;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 10px;
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  border: 1px solid #374151;
}

.vlc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.vlc-title {
  font-size: 13px;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
  color: #f9fafb;
}

.vlc-badge {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #b45309;
  color: #fffbeb;
}

.vlc-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vlc-btn {
  appearance: none;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #f9fafb;
  border-radius: 6px;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
}

.vlc-btn:hover {
  background: #374151;
}

.vlc-btn:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 2px;
}

.vlc-status {
  margin-top: 10px;
  min-height: 1.2em;
  font-size: 12px;
  line-height: 1.4;
  color: #d1d5db;
  white-space: pre-wrap;
}
`;function w(n){let t=null,e=null;function c(i=document.body){if(document.getElementById(r))return t=document.getElementById(r),t;t=document.createElement("div"),t.id=r,t.setAttribute("data-vlc-panel","1");const o=t.attachShadow({mode:"open"}),x=document.createElement("style");x.textContent=y;const a=document.createElement("div");a.className="vlc-panel",a.setAttribute("role","region"),a.setAttribute("aria-label",g);const f=document.createElement("div");f.className="vlc-header";const m=document.createElement("h1");m.className="vlc-title",m.textContent=g,f.appendChild(m);const b=document.createElement("div");b.className="vlc-actions";const s=document.createElement("button");s.type="button",s.className="vlc-btn",s.textContent="Read plate",s.addEventListener("click",()=>n.onReadPlate());const l=document.createElement("button");return l.type="button",l.className="vlc-btn",l.textContent="Settings",l.addEventListener("click",()=>n.onSettings()),b.append(s,l),e=document.createElement("div"),e.className="vlc-status",e.setAttribute("aria-live","polite"),a.append(f,b,e),o.append(x,a),i.appendChild(t),t}function d(i){e&&(e.textContent=i)}function p(){t?.remove(),t=null,e=null}return{mount:c,setStatus:d,destroy:p}}function _(){let n=E(),t=null;function e(o){n={...n,statusMessage:o},t?.setStatus(o)}function c(){e("Plate recognition is not implemented yet.")}function d(){n={...n,view:"settings"},e(`Settings (stub). Environment: production. Storage: ${v}* / ${h}. Full settings arrive in later stages.`)}function p(o=document.body){return t||(t=w({onReadPlate:c,onSettings:d}),t.mount(o),t)}function i(){return n}return{mount:p,onReadPlate:c,onSettings:d,getState:i,setStatus:e}}function L(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[u])return{started:!1,reason:"already-initialized"};if(document.getElementById(r))return window[u]=!0,{started:!1,reason:"panel-exists"};window[u]=!0;const n=_(),t=()=>{n.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}L()})();
