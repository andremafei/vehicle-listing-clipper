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

(function(){"use strict";const w="Vehicle Listing Clipper",_="vlc_prod_",R="vehicle-listing-clipper",b="__VLC_PROD_INITIALIZED__",g="vlc-panel-root";function C(){return{statusMessage:"",view:"idle",busy:!1}}const M=`
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

.vlc-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
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
`;function B(t){let e=null,n=null,o=null;function r(s=document.body){if(document.getElementById(g))return e=document.getElementById(g),e;e=document.createElement("div"),e.id=g,e.setAttribute("data-vlc-panel","1");const c=e.attachShadow({mode:"open"}),f=document.createElement("style");f.textContent=M;const l=document.createElement("div");l.className="vlc-panel",l.setAttribute("role","region"),l.setAttribute("aria-label",w);const d=document.createElement("div");d.className="vlc-header";const p=document.createElement("h1");p.className="vlc-title",p.textContent=w,d.appendChild(p);const v=document.createElement("div");v.className="vlc-actions",o=document.createElement("button"),o.type="button",o.className="vlc-btn",o.textContent="Read plate",o.addEventListener("click",()=>t.onReadPlate());const m=document.createElement("button");return m.type="button",m.className="vlc-btn",m.textContent="Settings",m.addEventListener("click",()=>t.onSettings()),v.append(o,m),n=document.createElement("div"),n.className="vlc-status",n.setAttribute("aria-live","polite"),l.append(d,v,n),c.append(f,l),s.appendChild(e),e}function a(s){n&&(n.textContent=s)}function u(s){o&&(o.disabled=!!s)}function i(){e?.remove(),e=null,n=null,o=null}return{mount:r,setStatus:a,setBusy:u,destroy:i}}const y="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",E='#mainContent img[data-testid="swiper-image-lazy"]',x="#mainContent div.swiper-wrapper img",A=[y,E,x];function T(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],r=n[1];let a=null;return r&&/^\d+w$/i.test(r)&&(a=Number.parseInt(r,10)),{url:o,width:a}}).filter(e=>!!e.url)}function P(t){const e=T(t);if(e.length===0)return null;const n=e.filter(r=>typeof r.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let r=1;r<n.length;r+=1)n[r].width>o.width&&(o=n[r]);return o.url}function G(t){if(!t)return null;const e=P(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function N(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function L(t=document){for(const e of A){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function h(t=document){const{images:e,selectorUsed:n}=L(t),o=[],r=new Set;for(const a of e){const u=G(a);if(!u)continue;const i=N(u);r.has(i)||(r.add(i),o.push(i))}return{urls:o,count:o.length,selectorUsed:n}}async function D(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let r=h(e);if(r.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return r;const u=Date.now()+n;for(;r.count===0&&Date.now()<u;)await new Promise(i=>setTimeout(i,o)),r=h(e);return r}const S={siteId:"olx-pt",discoverListingImages:h,discoverListingImagesWithWait:D,queryGalleryImages:L,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:y,FALLBACK_TESTID_SELECTOR:E,FALLBACK_SWIPER_IMG_SELECTOR:x,GALLERY_SELECTORS:A}},I=new Map;function O(t){I.set(t.siteId,t)}function $(t){return I.get(t)}function k(){return $("olx-pt")||S}O(S);function q(t){const{method:e,url:n,responseType:o="arraybuffer",headers:r,signal:a}=t;return new Promise((u,i)=>{if(a?.aborted){i(new DOMException("Aborted","AbortError"));return}let s=null;const c=()=>{try{s?.abort?.()}catch{}i(new DOMException("Aborted","AbortError"))};a?.addEventListener("abort",c,{once:!0}),(l=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){s=GM.xmlHttpRequest(l);return}if(typeof GM_xmlhttpRequest=="function"){s=GM_xmlhttpRequest(l);return}i(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:r,onload(l){a?.removeEventListener("abort",c);const d=l.status;if(d<200||d>=300){i(new Error(`HTTP ${d} for ${n}`));return}u(l.response)},onerror(){a?.removeEventListener("abort",c),i(new Error(`Network error for ${n}`))},ontimeout(){a?.removeEventListener("abort",c),i(new Error(`Timeout for ${n}`))}})})}async function z(t,e={}){const{onProgress:n,signal:o,request:r=q}=e,a=[],u=t.length;for(let i=0;i<u;i+=1){if(o?.aborted)throw new DOMException("Aborted","AbortError");const s=t[i];n?.({index:i+1,total:u,url:s});const c=await r({method:"GET",url:s,responseType:"arraybuffer",signal:o});if(!(c instanceof ArrayBuffer||Object.prototype.toString.call(c)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${s}`);a.push({url:s,bytes:c})}return a}function U(){let t=C(),e=null;function n(s){t={...t,statusMessage:s},e?.setStatus(s)}function o(s){t={...t,busy:s,view:s?"reading":"idle"},e?.setBusy(s)}async function r(){if(!t.busy){o(!0);try{n("Looking for listing images…");const c=await k().discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:f,count:l}=c;if(l===0){n("No listing images found.");return}n(`Found ${l} listing images`),await z(f,{onProgress({index:d,total:p}){n(`Downloading image ${d} of ${p}`)}}),n(`Downloaded ${l} images. Plate recognition is not implemented yet.`)}catch(s){const c=s instanceof Error?s.message:"Unknown download error";n(`Failed to download images: ${c}`)}finally{o(!1)}}}function a(){if(t.busy)return;t={...t,view:"settings"},n(`Settings (stub). Environment: production. Storage: ${_}* / ${R}. Full settings arrive in later stages.`)}function u(s=document.body){return e||(e=B({onReadPlate:r,onSettings:a}),e.mount(s),e)}function i(){return t}return{mount:u,onReadPlate:r,onSettings:a,getState:i,setStatus:n}}function F(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[b])return{started:!1,reason:"already-initialized"};if(document.getElementById(g))return window[b]=!0,{started:!1,reason:"panel-exists"};window[b]=!0;const t=U(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}F()})();
