// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.2.2
// @description  Local plate recognition and listing extraction (OLX/Standvirtual) plus CRM lead verify/create on crm.flexicar.pt. No uploads from listing pages.
// @author       andremafei
// @match        https://www.olx.pt/*
// @match        https://www.standvirtual.com/*
// @match        https://crm.flexicar.pt/*
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

(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();
(function(){"use strict";const De="Vehicle Listing Clipper",he="vlc_prod_",nt="vehicle-listing-clipper",Me="__VLC_PROD_INITIALIZED__",be="vlc-panel-root";function ot(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const ye={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Ne=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],rt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},it=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Cn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function wn(e={}){return{...ye,...e}}function En({extracted:e=null,plate:t="",defaults:n={}}={}){const r=wn(n),o=Cn(),i={},a=[],s=[],d=[],u=[...e?.warnings||[]];function l(f,h,b){const y=h==null?"":String(h);if(o[f]=y,!y){i[f]="missing";return}i[f]=b,b==="extracted"||b==="anpr"?a.push(f):b==="default"&&s.push(f)}const c=t?String(t).trim():"";return l("plate",c,c?"anpr":"missing"),l("make",e?.make||"",e?.make?"extracted":"missing"),l("model",e?.model||"",e?.model?"extracted":"missing"),l("year",e?.year||"",e?.year?"extracted":"missing"),l("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),l("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),l("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),l("engine",e?.engine||"",e?.engine?"extracted":"missing"),l("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),l("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),l("url",e?.url||"",e?.url?"extracted":"missing"),l("paintParts",r.paintParts,"default"),l("bodyParts",r.bodyParts,"default"),l("tires",r.tires,"default"),l("saleReason",r.saleReason,"default"),l("keyCount",r.keyCount,"default"),l("deductibleVat",r.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||""},fields:o,origins:i,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:d,warnings:u}}}function at(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function Sn(e,t,n){const r=n==null?"":String(n),o={...e.fields,[t]:r},i={...e.origins,[t]:r?"edited":"missing"},a=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:o,origins:i,source:{...e.source,url:t==="url"?r:e.source.url},metadata:{...e.metadata,editedFields:a}}}function st(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Ln(e){let t=null;const n=new Map;let r="listing";function o(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function a(f,h,b="missing",y){const p=document.createElement("label");p.className=`vlc-field ${st(b)}`,p.dataset.field=f;const g=document.createElement("span");g.className="vlc-field-label",g.textContent=y||rt[f]||f;const v=document.createElement("span");v.className="vlc-field-origin",v.textContent=b;const w=document.createElement("input");w.type="text",w.className="vlc-field-input",w.value=h??"",w.dataset.field=f,w.addEventListener("input",()=>{r==="listing"&&(e.onFieldChange(f,w.value),p.className=`vlc-field ${st("edited")}`,v.textContent="edited")}),g.appendChild(v),p.append(g,w),n.set(f,w),t?.appendChild(p)}function s(){const f=document.createElement("div");f.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>e.onCopyFullText());const b=document.createElement("button");b.type="button",b.className="vlc-btn",b.textContent="Copy plate only",b.addEventListener("click",()=>e.onCopyPlateOnly()),f.append(h,b),t?.appendChild(f)}function d(f,{phone:h=""}={}){r="listing",o(),i(),t.hidden=!1;const b=document.createElement("div");b.className="vlc-form-heading",b.textContent="Review listing",t.appendChild(b);const y=h==null?"":String(h).trim();a("phone",y,y?"extracted":"missing","Telefone");for(const p of Ne)a(p,f.fields[p]||"",f.origins[p]||"missing");s()}function u(f){r="settings",o(),i(),t.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",t.appendChild(h);for(const g of it)a(g,f[g]||"","default");const b=document.createElement("div");b.className="vlc-form-actions";const y=document.createElement("button");y.type="button",y.className="vlc-btn vlc-btn-primary",y.textContent="Save defaults",y.addEventListener("click",()=>{const g={};for(const v of it)g[v]=n.get(v)?.value??"";e.onSaveDefaults?.(g)});const p=document.createElement("button");p.type="button",p.className="vlc-btn",p.textContent="Back",p.addEventListener("click",()=>e.onBack?.()),b.append(y,p),t.appendChild(b)}function l(){t&&(t.hidden=!0)}function c(f,{phone:h}={}){if(r==="listing"){if(h!==void 0){const b=n.get("phone");b&&document.activeElement!==b&&(b.value=h==null?"":String(h))}for(const b of Ne){const y=n.get(b);y&&document.activeElement!==y&&(y.value=f.fields[b]||"")}}}return{ensureRoot:o,showListing:d,showSettings:u,syncListingValues:c,hide:l,getMode:()=>r,getElement:()=>o()}}const kn=`
:host, .vlc-root {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.vlc-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 320px;
  max-height: min(90vh, 720px);
  overflow: auto;
  box-sizing: border-box;
  padding: 12px;
  border-radius: 10px;
  background: #111827;
  color: #f9fafb;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  border: 1px solid #374151;
}

.vlc-panel--minimized {
  width: auto;
  max-width: min(360px, calc(100vw - 32px));
  max-height: none;
  overflow: hidden;
  padding: 8px 10px;
}

.vlc-panel--minimized .vlc-body {
  display: none;
}

.vlc-panel--minimized .vlc-header {
  margin-bottom: 0;
  align-items: center;
}

.vlc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.vlc-header--dragging {
  cursor: grabbing;
}

.vlc-header-main {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  flex: 1;
}

.vlc-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vlc-btn-header-copy {
  padding: 4px 8px;
  font-size: 11px;
  white-space: nowrap;
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

.vlc-btn-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  line-height: 1;
  text-align: center;
  border-radius: 6px;
}

.vlc-icon {
  width: 20px;
  height: 20px;
  display: block;
  pointer-events: none;
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

.vlc-btn-primary {
  background: #1d4ed8;
  border-color: #2563eb;
}

.vlc-btn-primary:hover {
  background: #2563eb;
}

.vlc-btn:hover {
  background: #374151;
}

.vlc-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.vlc-btn--copied {
  background: #047857;
  border-color: #059669;
  color: #ecfdf5;
}

.vlc-btn--copied:hover {
  background: #059669;
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

.vlc-diag {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #374151;
  font-size: 11px;
  line-height: 1.4;
  color: #9ca3af;
  white-space: pre-wrap;
}

.vlc-form {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #374151;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vlc-form-heading {
  font-size: 12px;
  font-weight: 700;
  color: #e5e7eb;
}

.vlc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #374151;
  background: #0b1220;
}

.vlc-field-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #d1d5db;
}

.vlc-field-origin {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  padding: 1px 5px;
  border-radius: 3px;
  background: #374151;
  color: #e5e7eb;
}

.vlc-field-input {
  appearance: none;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background: #111827;
  color: #f9fafb;
  padding: 6px 8px;
  font-size: 12px;
}

.vlc-field-input:focus-visible {
  outline: 2px solid #93c5fd;
  outline-offset: 1px;
}

.vlc-origin-extracted {
  border-color: #2563eb;
}
.vlc-origin-extracted .vlc-field-origin {
  background: #1e3a8a;
}

.vlc-origin-anpr {
  border-color: #059669;
}
.vlc-origin-anpr .vlc-field-origin {
  background: #065f46;
}

.vlc-origin-default {
  border-color: #a16207;
}
.vlc-origin-default .vlc-field-origin {
  background: #78350f;
}

.vlc-origin-edited {
  border-color: #7c3aed;
}
.vlc-origin-edited .vlc-field-origin {
  background: #5b21b6;
}

.vlc-origin-missing {
  border-color: #6b7280;
  opacity: 0.92;
}
.vlc-origin-missing .vlc-field-origin {
  background: #4b5563;
}

.vlc-form-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}
`;function An(e){let t=null,n=null,r=null,o=null,i=null,a=null,s=null,d=null,u=null,l=null,c=null,f=!0,h="waiting",b=!1,y=null,p=0,g=0,v=null;const w=Ln({onFieldChange:(C,A)=>e.onFieldChange(C,A),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:C=>e.onSaveDefaults(C)});function E(){o&&(o.textContent=f?h:De)}const k='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',S='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function _(){!n||!c||(n.classList.toggle("vlc-panel--minimized",f),c.innerHTML=f?k:S,c.setAttribute("aria-label",f?"Expand panel":"Minimize panel"),c.title=f?"Expand":"Minimize",E())}function R(C){f=!!C,_()}function O(){R(!f)}function L(C){h=C,E()}function D(){u&&(u.disabled=!b),l&&(l.disabled=!b)}function N(C,A){if(!n)return;const I=n.getBoundingClientRect(),K=Math.max(0,window.innerWidth-I.width),H=Math.max(0,window.innerHeight-I.height),me=Math.min(Math.max(0,C),K),ge=Math.min(Math.max(0,A),H);n.style.left=`${me}px`,n.style.top=`${ge}px`,n.style.right="auto",n.style.bottom="auto"}function B(C){if(!n||!r||C.target?.closest("button")||C.button!==0)return;const I=n.getBoundingClientRect();y=C.pointerId,p=C.clientX-I.left,g=C.clientY-I.top,r.classList.add("vlc-header--dragging"),r.setPointerCapture(C.pointerId),C.preventDefault()}function T(C){y===C.pointerId&&N(C.clientX-p,C.clientY-g)}function V(C){y===C.pointerId&&(y=null,r?.classList.remove("vlc-header--dragging"),r?.hasPointerCapture(C.pointerId)&&r.releasePointerCapture(C.pointerId))}function J(C=document.body){if(document.getElementById(be))return t=document.getElementById(be),t;t=document.createElement("div"),t.id=be,t.setAttribute("data-vlc-panel","1");const A=t.attachShadow({mode:"open"}),I=document.createElement("style");I.textContent=kn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",De),r=document.createElement("div"),r.className="vlc-header",r.addEventListener("pointerdown",B),r.addEventListener("pointermove",T),r.addEventListener("pointerup",V),r.addEventListener("pointercancel",V);const K=document.createElement("div");K.className="vlc-header-main",o=document.createElement("h1"),o.className="vlc-title",o.textContent=De,K.appendChild(o),l=M("Copy again",()=>e.onCopyAgain()),l.classList.add("vlc-btn-header-copy"),l.disabled=!0,c=document.createElement("button"),c.type="button",c.className="vlc-btn vlc-btn-icon",c.addEventListener("click",O);const H=document.createElement("div");H.className="vlc-header-actions",H.append(l,c),r.append(K,H);const me=document.createElement("div");me.className="vlc-body";const ge=document.createElement("div");ge.className="vlc-actions",s=M("Clip listing",()=>e.onClipListing()),d=M("Cancel",()=>e.onCancel()),d.disabled=!0,u=M("Copy again",()=>e.onCopyAgain()),u.disabled=!0;const Cr=M("Clear model cache",()=>e.onClearModelCache()),wr=M("Diagnostics",()=>e.onToggleDiagnostics()),Er=M("Settings",()=>e.onSettings());ge.append(s,d,u,Cr,wr,Er),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const Sr=w.getElement();return me.append(ge,i,a,Sr),n.append(r,me),A.append(I,n),_(),C.appendChild(t),t}function M(C,A){const I=document.createElement("button");return I.type="button",I.className="vlc-btn",I.textContent=C,I.addEventListener("click",A),I}function m(C){i&&(i.textContent=C)}function x(C){s&&(s.disabled=!!C),d&&(d.disabled=!C)}function P(C){b=!!C,D()}function $(C){const A=C||"Copy again";u&&(u.textContent=A),l&&(l.textContent=A)}function U(C=2e3){v!=null&&(clearTimeout(v),v=null);for(const A of[l,u])A&&A.classList.add("vlc-btn--copied");v=setTimeout(()=>{v=null;for(const A of[l,u])A?.classList.remove("vlc-btn--copied")},C)}function oe(C,A=""){a&&(a.hidden=!C,a.textContent=A)}function Z(C,{phone:A=""}={}){w.showListing(C,{phone:A})}function pe(C){w.showSettings(C)}function W(){w.hide()}function Q(){v!=null&&(clearTimeout(v),v=null),r&&(r.removeEventListener("pointerdown",B),r.removeEventListener("pointermove",T),r.removeEventListener("pointerup",V),r.removeEventListener("pointercancel",V)),t?.remove(),t=null,n=null,r=null,o=null,i=null,a=null,s=null,d=null,u=null,l=null,c=null,f=!0,h="waiting",b=!1,y=null}return{mount:J,setStatus:m,setBusy:x,setCopyEnabled:P,setCopyLabel:$,flashCopySuccess:U,setCaptureStatus:L,setDiagnostics:oe,showListingForm:Z,showSettingsForm:pe,hideForm:W,setMinimized:R,toggleMinimized:O,destroy:Q}}function re(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function ve(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return re(n)}function lt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function ct(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function dt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function ut(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function ft(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const r=t.replace(",",".");return r==="1"?"1.0":r}function pt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const r=t.replace(/[^\d]/g,"");return r?`${r} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function mt(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function xe(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function Ce(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function _n(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return Ce(t)}function G(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let r=`${n.origin}${n.pathname}`;const i=r.toLowerCase().indexOf(".html");return i!==-1&&(r=r.slice(0,i+5)),r}catch{return""}}const gt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",ht='#mainContent img[data-testid="swiper-image-lazy"]',bt="#mainContent div.swiper-wrapper img",yt=[gt,ht,bt],vt='#mainContent button[data-testid="ad-contact-phone"]',xt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Ct='#mainContent [data-testid="ad-parameters-container"]',wt='#mainContent [data-testid="ad-price-container"] h3',Oe='link#ssr_canonical[rel="canonical"]',Et='#mainContent [data-testid="offer_title"]',St='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Lt='script[type="application/ld+json"]';function In(e){return!!(e&&typeof e.click=="function")}function kt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function ie(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function we(e){if(e.hidden)return!0;const n=kt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Ee(e){if(!e||typeof e.getBoundingClientRect!="function"||we(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(ie(e)>0)return!0;const n=kt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function At(e=document){return[...e.querySelectorAll(vt)].filter(t=>In(t))}function _t(e=document){const t=At(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(s=>!we(s)),o=[...n.length>0?n:t].sort((s,d)=>{const u=Ee(s)?1:0,l=Ee(d)?1:0;return u!==l?l-u:ie(d)-ie(s)}),i=(()=>{const s=o[0];return{visible:Ee(s)?1:0,area:ie(s)}})(),a=o.filter(s=>(Ee(s)?1:0)===i.visible&&ie(s)===i.area);return a[a.length-1]||o[o.length-1]||t[t.length-1]}function Se(e=document){const t=[...e.querySelectorAll(xt)];for(const n of t){if(t.length>1&&we(n))continue;const r=n.getAttribute("href")||"",o=ve(r);if(o)return o;const i=re(n.textContent||"");if(i)return i}if(t.length>0){const n=t[t.length-1],r=n.getAttribute("href")||"",o=ve(r);if(o)return o;const i=re(n.textContent||"");if(i)return i}return null}function Tn(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function Rn(e){try{e.click()}catch{}Tn(e)}async function Pn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=Se(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const a=At(t);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=_t(t),d=[];s&&d.push(s);for(const l of a)l!==s&&!we(l)&&d.push(l);const u=Date.now()+n;for(const l of d){if(o?.aborted)return{ok:!1,reason:"cancelled"};Rn(l);const c=Math.min(u,Date.now()+5e3);for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const f=Se(t);if(f)return{ok:!0,phone:f,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,r))}}for(;Date.now()<u;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=Se(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(c=>setTimeout(c,r))}return{ok:!1,reason:"timeout"}}function $n(e){const t=new Map,n=e.querySelector(Ct);if(!n)return t;for(const r of n.querySelectorAll("p")){const o=(r.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const i=o.indexOf(":");if(i<=0)continue;const a=o.slice(0,i).trim().toLowerCase(),s=o.slice(i+1).trim();a&&s&&t.set(a,s)}return t}function Dn(e){const t=e.querySelectorAll(Lt);for(const n of t){const r=n.textContent||"";if(r.trim())try{const o=JSON.parse(r),i=Array.isArray(o)?o:[o];for(const a of i)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function Mn(e){const n=(e.querySelector?.(Oe)||(typeof document<"u"?document.querySelector(Oe):null))?.getAttribute?.("href")||"";return n?G(n):typeof location<"u"&&location?.href?G(location.href):""}function Nn(e){const t=e.querySelectorAll(St);for(const n of t){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function On(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function Bn(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Fn(e=document){const t=[],n=[];function r(k,S){S&&t.push(k)}const o=$n(e),i=Dn(e),a=Mn(e);r("url",a);const s=Bn(a,i);r("listingId",s);const u=(e.querySelector(Et)?.textContent||i?.name||"").replace(/\s+/g," ").trim();r("title",u);const l=Ce(i?.description||"");r("description",l);let c=On(i);c||(c=Nn(e)),c=xe(c),r("make",c);let f=o.get("modelo")||i?.model||"";f=xe(f),r("model",f);let h=o.get("ano")||i?.productionDate||i?.modelDate||"";h=mt(h),r("year",h);const b=lt(o.get("quilómetros")||o.get("quilometros")||"");r("mileageKm",b);const y=dt(o.get("tipo de caixa")||"");r("transmission",y);const p=ut(o.get("combustível")||o.get("combustivel")||"");r("fuel",p);const g=ft(o.get("cilindrada")||"");r("engine",g);const v=pt(o.get("potência")||o.get("potencia")||"");r("powerCv",v);let w=i?.offers?.price;(w==null||w==="")&&(w=e.querySelector(wt)?.textContent||"");const E=ct(w);return r("priceEur",E),(!c||!f)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:u,description:l,make:c,model:f,year:h,mileageKm:b,transmission:y,fuel:p,engine:g,powerCv:v,priceEur:E,extractedFields:[...new Set(t)],warnings:n}}function Vn(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),r=n[0],o=n[1];let i=null;return o&&/^\d+w$/i.test(o)&&(i=Number.parseInt(o,10)),{url:r,width:i}}).filter(t=>!!t.url)}function zn(e){const t=Vn(e);if(t.length===0)return null;const n=t.filter(o=>typeof o.width=="number");if(n.length===0)return t[t.length-1].url;let r=n[0];for(let o=1;o<n.length;o+=1)n[o].width>r.width&&(r=n[o]);return r.url}function It(e){if(!e)return null;const t=zn(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function Un(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Tt(e=document){for(const t of yt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Be(e=document){const{images:t,selectorUsed:n}=Tt(e),r=[],o=new Set;for(const i of t){const a=It(i);if(!a)continue;const s=Un(a);o.has(s)||(o.add(s),r.push(s))}return{urls:r,count:r.length,selectorUsed:n}}async function Hn(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Be(t);if(o.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Be(t);return o}const Rt={siteId:"olx-pt",discoverListingImages:Be,discoverListingImagesWithWait:Hn,queryGalleryImages:Tt,extractListing:Fn,findPhoneRevealButton:_t,readRevealedPhone:Se,revealContactPhone:Pn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:gt,FALLBACK_TESTID_SELECTOR:ht,FALLBACK_SWIPER_IMG_SELECTOR:bt,GALLERY_SELECTORS:yt,PHONE_REVEAL_BUTTON_SELECTOR:vt,CONTACT_PHONE_SELECTOR:xt,AD_PARAMETERS_SELECTOR:Ct,AD_PRICE_SELECTOR:wt,CANONICAL_LINK_SELECTOR:Oe,OFFER_TITLE_SELECTOR:Et,BREADCRUMB_ITEM_SELECTOR:St,JSON_LD_SELECTOR:Lt}},Pt="script#__NEXT_DATA__",$t='h1.offer-title, [data-testid="summary-info-area"] h1',Dt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',Mt='[data-testid="content-description-section"]',Fe='link[rel="canonical"]',Le='[data-testid="aside-seller-info"]',Nt='[data-testid="seller-info-contact-box"]',Ot='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Bt='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Ft='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Vt=[Bt,Ft];function Gn(e){return`[data-testid="${e}"] p:last-of-type`}const qn=/ver\s+telefone/i;function jn(e){return!!(e&&typeof e.click=="function")}function zt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Ve(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function ae(e){if(e.hidden)return!0;const n=zt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Ut(e){if(!e||typeof e.getBoundingClientRect!="function"||ae(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Ve(e)>0)return!0;const n=zt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Ht(e){if(!jn(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return qn.test(t)}function Gt(e=document){const t=[],n=new Set;function r(o){const i=e.querySelector?.(o)||null;if(i)for(const a of i.querySelectorAll("button"))!Ht(a)||n.has(a)||(n.add(a),t.push(a))}r(Le),r(Nt);for(const o of e.querySelectorAll?.("button")||[])!Ht(o)||n.has(o)||(n.add(o),t.push(o));return t}function qt(e=document){const t=Gt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Le);if(n){const a=t.find(s=>n.contains(s)&&!ae(s));if(a)return a}const r=t.filter(a=>!ae(a));return[...r.length>0?r:t].sort((a,s)=>{const d=Ut(a)?1:0,u=Ut(s)?1:0;return d!==u?u-d:Ve(s)-Ve(a)})[0]||t[0]}function ke(e=document){const t=[...e.querySelectorAll?.(Ot)||[]],n=e.querySelector?.(Le),r=n&&t.length>1?[...t.filter(o=>n.contains(o)),...t.filter(o=>!n.contains(o))]:t;for(const o of r){if(r.length>1&&ae(o))continue;const i=o.getAttribute("href")||"",a=ve(i);if(a)return a;const s=re(o.textContent||"");if(s)return s}if(r.length>0){const o=r[0],i=o.getAttribute("href")||"",a=ve(i);if(a)return a;const s=re(o.textContent||"");if(s)return s}return null}function Wn(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function Kn(e){try{e.click()}catch{}Wn(e)}async function Yn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=ke(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const a=Gt(t);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=qt(t),d=[];s&&d.push(s);for(const l of a)l!==s&&!ae(l)&&d.push(l);const u=Date.now()+n;for(const l of d){if(o?.aborted)return{ok:!1,reason:"cancelled"};Kn(l);const c=Math.min(u,Date.now()+5e3);for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const f=ke(t);if(f)return{ok:!0,phone:f,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,r))}}for(;Date.now()<u;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=ke(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(c=>setTimeout(c,r))}return{ok:!1,reason:"timeout"}}const ze="https://www.standvirtual.com/";function jt(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function se(e){const{value:t,label:n}=jt(e);return n||t}function Ae(e){const{value:t,label:n}=jt(e);return t||n}function Wt(e){const n=e.querySelector?.(Pt)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function Xn(e){const n=(e.querySelector?.(Fe)||(typeof document<"u"?document.querySelector(Fe):null))?.getAttribute?.("href")||"";return n?G(n,ze):typeof location<"u"&&location?.href?G(location.href,ze):""}function Jn(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function q(e,t){return(e.querySelector?.(Gn(t))?.textContent||"").replace(/\s+/g," ").trim()}function Zn(e=document){const t=[],n=[];function r(_,R){R&&t.push(_)}const o=Wt(e),i=o?.parametersDict||{};let a="";o?.url&&(a=G(o.url,ze)),a||(a=Xn(e)),r("url",a);const s=Jn(a,o);r("listingId",s);const d=e.querySelector?.($t),u=(o?.title||d?.textContent||"").replace(/\s+/g," ").trim();r("title",u);let l="";if(o?.description&&(l=_n(o.description)),!l){const _=e.querySelector?.(Mt);l=Ce(_?.textContent||"")}r("description",l);let c=se(i.make)||q(e,"make")||"";c=xe(c),r("make",c);let f=se(i.model)||q(e,"model")||"";f=xe(f),r("model",f);let h=Ae(i.first_registration_year)||q(e,"first_registration_year")||"";h=mt(h),r("year",h);const b=lt(Ae(i.mileage)||q(e,"mileage")||"");r("mileageKm",b);const y=dt(se(i.gearbox)||q(e,"gearbox")||"");r("transmission",y);const p=ut(se(i.fuel_type)||q(e,"fuel_type")||"");r("fuel",p);const g=Ae(i.engine_capacity)||q(e,"engine_capacity")||"",v=/cm\s*3|cm3|\bcc\b/i.test(g)?g.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):g,w=ft(v);r("engine",w);const E=pt(Ae(i.engine_power)||se(i.engine_power)||q(e,"engine_power")||"");r("powerCv",E);let k=o?.price?.value;(k==null||k==="")&&(k=e.querySelector?.(Dt)?.textContent||"");const S=ct(k);return r("priceEur",S),(!c||!f)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:u,description:l,make:c,model:f,year:h,mileageKm:b,transmission:y,fuel:p,engine:w,powerCv:E,priceEur:S,extractedFields:[...new Set(t)],warnings:n}}function Kt(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Qn(e=document){const n=Wt(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const r=[],o=new Set;for(const i of n){const a=i?.url||i?.src||"";if(!a)continue;const s=Kt(String(a));o.has(s)||(o.add(s),r.push(s))}return r.length===0?null:{urls:r,count:r.length,selectorUsed:"next-data:images.photos"}}function Yt(e=document){for(const t of Vt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ue(e=document){const t=Qn(e);if(t)return t;const{images:n,selectorUsed:r}=Yt(e),o=[],i=new Set;for(const a of n){const s=It(a);if(!s)continue;const d=Kt(s);i.has(d)||(i.add(d),o.push(d))}return{urls:o,count:o.length,selectorUsed:r}}async function eo(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ue(t);if(o.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Ue(t);return o}const Xt={siteId:"standvirtual-pt",discoverListingImages:Ue,discoverListingImagesWithWait:eo,queryGalleryImages:Yt,extractListing:Zn,findPhoneRevealButton:qt,readRevealedPhone:ke,revealContactPhone:Yn,selectors:{PRIMARY_GALLERY_SELECTOR:Bt,FALLBACK_GALLERY_SELECTOR:Ft,GALLERY_SELECTORS:Vt,CONTACT_PHONE_SELECTOR:Ot,ASIDE_SELLER_SELECTOR:Le,CONTENT_CONTACT_SELECTOR:Nt,AD_PRICE_SELECTOR:Dt,CANONICAL_LINK_SELECTOR:Fe,OFFER_TITLE_SELECTOR:$t,DESCRIPTION_SELECTOR:Mt,NEXT_DATA_SELECTOR:Pt}},Jt=new Map;function Zt(e){Jt.set(e.siteId,e)}function Qt(e){return Jt.get(e)}function en(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?Qt("standvirtual-pt")||Xt:Qt("olx-pt")||Rt}Zt(Rt),Zt(Xt);async function to(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let r=null;for(const o of n)try{const i=new Blob([e],{type:o});return await createImageBitmap(i)}catch(i){r=i}try{const o=new Blob([e]);return await createImageBitmap(o)}catch(o){throw r||o}}function no(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const r=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:r,width:t.width,height:t.height}}const He=new Map;function Ge(){return typeof GM<"u"&&GM!=null}async function tn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):Ge()&&typeof GM.getValue=="function"?GM.getValue(e,t):He.has(e)?He.get(e):t}async function nn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(Ge()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}He.set(e,t)}async function oo(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(Ge()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function on(e){const{method:t,url:n,responseType:r="arraybuffer",headers:o,signal:i}=e;return new Promise((a,s)=>{if(i?.aborted){s(new DOMException("Aborted","AbortError"));return}let d=null;const u=()=>{try{d?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",u,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(c);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:r,headers:o,onload(c){i?.removeEventListener("abort",u);const f=c.status;if(f<200||f>=300){s(new Error(`HTTP ${f} for ${n}`));return}a(c.response)},onerror(){i?.removeEventListener("abort",u),s(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",u),s(new Error(`Timeout for ${n}`))}})})}async function ro(e,t={}){const{signal:n,request:r=on}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await r({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:o}}function io(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),r=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),o=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),a=Math.max(1,o-n),s=Math.max(1,i-r),d=document.createElement("canvas");d.width=e.width,d.height=e.height;const u=d.getContext("2d");return u.putImageData(e,0,0),u.getImageData(n,r,a,s)}function ao(e,t,n){const r=document.createElement("canvas");r.width=e.width,r.height=e.height,r.getContext("2d").putImageData(e,0,0);const o=document.createElement("canvas");o.width=n,o.height=t;const i=o.getContext("2d");i.drawImage(r,0,0,n,t);const{data:a}=i.getImageData(0,0,n,t),s=new Uint8Array(1*t*n*3);let d=0;for(let u=0;u<t*n;u+=1)s[d++]=a[u*4],s[d++]=a[u*4+1],s[d++]=a[u*4+2];return s}function so(e,t,n=[114,114,114]){const{width:r,height:o}=e,i=Math.min(t/o,t/r),a=Math.round(r*i),s=Math.round(o*i),d=(t-a)/2,u=(t-s)/2,l=Math.round(u-.1),c=Math.round(d-.1),f=document.createElement("canvas");f.width=r,f.height=o,f.getContext("2d").putImageData(e,0,0);const b=document.createElement("canvas");b.width=t,b.height=t;const y=b.getContext("2d");y.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,y.fillRect(0,0,t,t),y.drawImage(f,0,0,r,o,c,l,a,s);const p=y.getImageData(0,0,t,t).data,g=new Float32Array(3*t*t),v=t*t;for(let w=0;w<v;w+=1){const E=p[w*4],k=p[w*4+1],S=p[w*4+2];g[w]=E/255,g[v+w]=k/255,g[2*v+w]=S/255}return{tensor:g,ratio:i,pad:{dw:d,dh:u},size:t}}function lo(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const co="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",uo="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",fo="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",po="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function rn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:co},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:uo,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:fo},ortWasmBaseUrl:po}}const _e={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let an=null;function mo(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function qe(){const e=mo();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const sn=new Proxy({},{get(e,t){return qe()[t]}});function go(){const e=qe(),t=rn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function ln(e,t={}){go();const n=qe(),r=t.prefer||["webgpu","wasm"],o=[];for(const i of r)try{const a=await n.InferenceSession.create(e,{executionProviders:[i]});return an=i,{session:a,provider:i}}catch(a){o.push(`${i}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function je(){return an}const We=384,ho="images",bo="output0";async function yo(e,t,n={}){const r=n.confThresh??.4,{tensor:o,ratio:i,pad:a}=so(t,We),s=new sn.Tensor("float32",o,[1,3,We,We]),d=await e.run({[ho]:s}),u=d[bo]||Object.values(d)[0];if(!u)return[];const l=u.data,c=u.dims||[],f=c.length>=2?c[c.length-1]:7,h=Math.floor(l.length/f),b=[];for(let y=0;y<h;y+=1){const p=y*f,g=l[p+1],v=l[p+2],w=l[p+3],E=l[p+4],k=l[p+5],S=l[p+6];if(S<r)continue;const _=lo({x1:g,y1:v,x2:w,y2:E},i,a);b.push({..._,score:Number(S),classId:Number(k)})}return b.sort((y,p)=>p.score-y.score),b}function vo(e,t,n=_e){const r=n.alphabet,o=n.maxPlateSlots,i=r.length,a=e,s=[],d=[];for(let l=0;l<o;l+=1){let c=0,f=-1/0;for(let h=0;h<i;h+=1){const b=Number(a[l*i+h]);b>f&&(f=b,c=h)}s.push(r[c]),d.push(f)}let u=s.join("");return n.padChar&&(u=u.replace(new RegExp(`${xo(n.padChar)}+$`),"")),{text:u,charProbs:d.slice(0,Math.max(u.length,1))}}function xo(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Co(e,t){const{imgHeight:n,imgWidth:r}=_e,o=ao(t,n,r),i=new sn.Tensor("uint8",o,[1,n,r,3]),a=await e.run({input:i}),s=a.plate||Object.values(a)[0],d=s.dims||[1,_e.maxPlateSlots,_e.alphabet.length],u=d[d.length-1],c=d[d.length-2]*u,f=s.data,h=f.length>=c?f.slice(0,c):f;return vo(h)}const le="[A-Z]",ce="[0-9]",wo=[{id:"LLDDDD",re:new RegExp(`^${le}{2}${ce}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${ce}{4}${le}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${ce}{2}${le}{2}${ce}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${le}{2}${ce}{2}${le}{2}$`)}],Eo={0:"O",1:"I",5:"S",8:"B"},So={O:"0",I:"1",L:"1",S:"5",B:"8"};function Ie(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function ee(e){const t=Ie(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Lo(e){const t=Ie(e);if(t.length!==6)return null;for(const n of wo)if(n.re.test(t))return n.id;return null}function Ke(e,t){const n=Ie(e).slice(0,6).split("");if(n.length!==6)return[];const r=[];function o(i,a,s){if(a>t)return;if(i===6){const c=s.join(""),f=Lo(c);f&&r.push({plate:c,corrections:a,patternId:f});return}if(o(i+1,a,s),a>=t)return;const d=s[i],u=Eo[d];if(u){const c=s.slice();c[i]=u,o(i+1,a+1,c)}const l=So[d];if(l){const c=s.slice();c[i]=l,o(i+1,a+1,c)}}return o(0,0,n),r.sort((i,a)=>i.corrections-a.corrections||a.plate.localeCompare(i.plate)),r}function cn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let r=0;for(let o=0;o<n;o+=1)r+=e[o]??0;return r/n}function ko(e,t=[],n={}){const r=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,i=Ie(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:ee(i),patternId:null,corrections:0,meanConfidence:cn(t,i.length),reason:"too-short"};const a=i.slice(0,6),s=cn(t,6),d=Ke(a,0);if(d.length>0&&s>=r){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:ee(c.plate),patternId:c.patternId,corrections:0,meanConfidence:s}}const u=Ke(a,1).filter(c=>c.corrections===1);if(u.length>0&&s>=o){const c=u[0];return{accepted:!0,plate:c.plate,plateFormatted:ee(c.plate),patternId:c.patternId,corrections:1,meanConfidence:s}}return Ke(a,2).some(c=>c.corrections>1)&&d.length===0&&u.length===0?{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:d.length>0||u.length>0?{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:d.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const j="models",Ao=1;let Te=null;function Ye(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Te||(Te=new Promise((e,t)=>{const n=indexedDB.open(nt,Ao);n.onupgradeneeded=()=>{const r=n.result;r.objectStoreNames.contains(j)||r.createObjectStore(j,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Te)}async function dn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function _o(e){const t=await Ye();return new Promise((n,r)=>{const i=t.transaction(j,"readonly").objectStore(j).get(e);i.onsuccess=()=>{const a=i.result;n(a?.bytes||null)},i.onerror=()=>r(i.error)})}async function Io(e,t,n){const r=await Ye();return new Promise((o,i)=>{const a=r.transaction(j,"readwrite");a.objectStore(j).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>o(),a.onerror=()=>i(a.error)})}async function To(){const e=await Ye();return new Promise((t,n)=>{const r=e.transaction(j,"readwrite");r.objectStore(j).clear(),r.oncomplete=()=>t(),r.onerror=()=>n(r.error)})}async function un(e,t={}){const{onStatus:n,signal:r}=t,o=await _o(e.id).catch(()=>null);if(o&&await dn(o)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await on({method:"GET",url:e.url,responseType:"arraybuffer",signal:r}),a=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const s=await dn(a);if(s!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${s}`);return await Io(e.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let de=null;async function Ro(e={}){if(de)return{sessions:de,diagnostics:{provider:je(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=rn(),n=await un(t.detector,e),r=await un(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const o=await ln(n.bytes),i=await ln(r.bytes);return de={detector:o.session,ocr:i.session},{sessions:de,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:r.cacheHit}}}function Po(){de=null}async function $o(e,t,n={}){const{signal:r}=n;let o=0,i;try{const s=await to(t);i=no(s).imageData,s.close?.()}catch{return null}const a=await yo(e.detector,i);for(const s of a){if(r?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const d=io(i,s),u=await Co(e.ocr,d),l=ko(u.text,u.charProbs);if(l.accepted)return{plate:l.plate,plateFormatted:l.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function Do(e,t={}){const n=Date.now(),{onStatus:r,signal:o,request:i}=t,a=e.length,s=await Ro({onStatus:r,signal:o}),{detector:d,ocr:u}=s.sessions;let l=0,c=0;for(let f=0;f<a;f+=1){if(o?.aborted)return Re("cancelled",s.diagnostics,c,l,n);const h=e[f];r?.(`Downloading image ${f+1} of ${a}`);let b;try{b=await ro(h,{signal:o,request:i})}catch(p){if(o?.aborted||p?.name==="AbortError")return Re("cancelled",s.diagnostics,c,l,n);r?.(`Failed to download image ${f+1} of ${a}, skipping…`);continue}r?.(`Scanning image ${f+1} of ${a}`),c+=1;let y;try{y=await $o({detector:d,ocr:u},b.bytes,{signal:o})}catch(p){if(o?.aborted||p?.name==="AbortError")return Re("cancelled",s.diagnostics,c,l,n);continue}finally{b=null}if(y&&(l+=y.detectionsTried,y.plate))return{ok:!0,plate:y.plate,plateFormatted:y.plateFormatted,diagnostics:{provider:je()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:c,detectionsTried:l,elapsedMs:Date.now()-n}}}return Re("no-reliable-plate",s.diagnostics,c,l,n)}function Re(e,t,n,r,o){return{ok:!1,reason:e,diagnostics:{provider:je()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:r,elapsedMs:Date.now()-o}}}async function fn(e){return await oo(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function pn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function mn({plate:e,phone:t,fallbackId:n}={}){const r=e==null?"":String(e).trim();if(r)return r;const o=t==null?"":String(t).trim();if(o)return o;const i=n==null?"":String(n).trim();return i||pn()}function Mo(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function No(e,{phone:t="",fallbackId:n=""}={}){const r=e||{},o=t==null?"":String(t).trim(),i=r.plate==null?"":String(r.plate).trim(),s=[`ID: ${mn({plate:i,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const u of Ne){if(u==="url")continue;const l=rt[u];let c=r[u]==null?"":String(r[u]);u==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),s.push(`${l}: ${c}`)}const d=r.url==null?"":String(r.url);return s.push(""),s.push(d),s.join(`
`)}const Xe="<<<LEAD_CLIP_V1>>>",gn="<<<END_LEAD_CLIP>>>";function Oo(e,t={}){const n=e?.fields||{},r=e?.source||{},o=t.phone==null?"":String(t.phone).trim();return{v:1,id:mn({plate:n.plate,phone:o,fallbackId:t.fallbackId}),phone:o,plate:String(n.plate||""),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||r.url||""),siteId:String(r.siteId||""),title:String(r.title||""),description:Ce(r.description||"")}}function Bo(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${Xe}
${n}
${gn}
`}function Fo(e){const t=String(e||""),n=t.indexOf(Xe);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const r=n+Xe.length,o=t.indexOf(gn,r);if(o<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(r,o).trim(),a=t.slice(0,n).replace(/\s+$/,"");try{const s=JSON.parse(i);return!s||s.v!==1||typeof s!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:s,humanText:a}}catch(s){return{ok:!1,error:s instanceof Error?s.message:"JSON parse failed"}}}const Vo="listingCache",zo=2880*60*1e3;function hn(){return`${he}${Vo}`}function Je(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Uo(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,r]of Object.entries(e))typeof n=="string"&&n&&Je(r)&&(t[n]={processedAt:r.processedAt,phone:r.phone,clipboard:r.clipboard,fallbackId:typeof r.fallbackId=="string"?r.fallbackId:"",listingRecord:r.listingRecord});return t}async function Ho(){const e=await tn(hn(),{});return Uo(e)}async function Ze(e){await nn(hn(),e)}async function Qe(e=Date.now()){const t=await Ho(),n={};let r=!1;for(const[o,i]of Object.entries(t))e-i.processedAt<=zo?n[o]=i:r=!0;return(r||Object.keys(n).length!==Object.keys(t).length)&&await Ze(n),n}async function Go(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const o=(await Qe(t))[n];return o&&Je(o)?o:null}async function qo(e,t,n=Date.now()){const r=typeof e=="string"?e.trim():"";if(!r||!Je(t))return null;const o=await Qe(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return o[r]=i,await Ze(o),i}async function jo(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const r=await Qe(t);return n in r?(delete r[n],await Ze(r),!0):!1}const bn="valuationDefaults";async function Wo(e,t=null){return tn(`${he}${e}`,t)}async function Ko(e,t){await nn(`${he}${e}`,t)}async function yn(){const e=await Wo(bn,null);return!e||typeof e!="object"?{...ye}:{...ye,...e}}async function Yo(e){const t={...ye,...e};return await Ko(bn,t),t}const Xo=5e3;function Jo(){let e=ot(),t=null,n=null,r=null,o="",i=0;function a(m){m&&t?.setCaptureStatus(m)}function s(m){e={...e,statusMessage:m},t?.setStatus(m);const x=String(m||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);x&&a(`analisando imagem ${x[1]} de ${x[2]}`)}function d(){try{const m=en().extractListing(document);if(m?.url)return G(m.url)}catch{}return typeof location<"u"&&location?.href?G(location.href):""}function u(m,x){const P=x.listingRecord,$=x.phone||"",U=P?.fields?.plate||"",Z=!String(U).trim()&&!String($).trim()&&(x.fallbackId||Mo(x.clipboard))||"";o=m,i=x.processedAt,e={...e,lastPlate:U,lastPhone:$,lastClipboard:x.clipboard||"",fallbackId:Z,listingRecord:P,view:"form"},t?.showListingForm(P,{phone:$}),t?.setCopyEnabled(!!x.clipboard),t?.setCopyLabel("Copy"),a("data ready to copy"),s("Data ready to copy")}function l(m,x=""){const P=m?.fields?.plate||"",$=x==null?"":String(x).trim();let U=e.fallbackId||"";!String(P).trim()&&!$&&(U||(U=pn()),e={...e,fallbackId:U});const oe=No(m.fields,{phone:$,fallbackId:e.fallbackId}),Z=Oo(m,{phone:$,fallbackId:e.fallbackId});return Bo(oe,Z)}async function c(m){const x=o||G(m.listingRecord?.fields?.url||"")||d();if(!x||!m.listingRecord||!m.clipboard)return;const P=m.processedAt??i??Date.now();o=x,i=P,await qo(x,{processedAt:P,phone:m.phone??e.lastPhone??"",clipboard:m.clipboard,fallbackId:m.fallbackId??e.fallbackId??"",listingRecord:m.listingRecord})}async function f(){try{const m=d();if(m){const x=await Go(m);if(x){if(at(x.listingRecord,{plate:x.listingRecord?.fields?.plate,phone:x.phone})){u(m,x);return}await jo(m)}}}catch{}b()}function h(){r!=null&&(clearTimeout(r),r=null)}function b(){h(),a("waiting"),r=setTimeout(()=>{r=null,E()},Xo)}function y(m){e={...e,busy:m,view:m?"reading":e.listingRecord?"form":"idle"},t?.setBusy(m),m&&a("reading")}function p(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const m=e.lastDiagnostics;if(!m){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${m.provider||"n/a"}`,`Detector cache: ${m.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${m.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${m.imagesScanned??0}`,`Detections tried: ${m.detectionsTried??0}`,`Elapsed: ${m.elapsedMs??0} ms`].join(`
`))}function g(m,x,P){const $=[];return x.plate?$.push(`Plate found: ${x.plate}`):$.push("No reliable plate found."),x.phone&&$.push(`Phone: ${x.phone}`),(m.fields.make||m.fields.model)&&$.push(`Listing: ${[m.fields.make,m.fields.model].filter(Boolean).join(" ")}`.trim()),$.push(P),$.join(`
`)}function v(m){e={...e,lastClipboard:m},t?.setCopyEnabled(!!m)}async function w(m){return v(m),fn(m)}async function E(){if(h(),e.busy)return;n=new AbortController;const{signal:m}=n;y(!0);try{const x=en(),P=await yn();s("Revealing phone (if available)…");const $=x.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:m});s("Extracting listing fields…");const U=x.extractListing(document);s("Looking for listing images…");const oe=await x.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:Z,count:pe}=oe;let W={ok:!1,reason:"no-images"};pe>0?(s(`Found ${pe} listing images — scanning…`),s("Loading plate recognition models…"),W=await Do(Z,{signal:m,onStatus:s}),e={...e,lastDiagnostics:W.diagnostics},p()):s("No listing images — checking phone…");const Q=await $,C=W.ok&&W.plate?W.plate:"",A=Q.ok?Q.phone:"";if(m.aborted||W.reason==="cancelled"){s("Cancelled.");return}const I=En({extracted:U,plate:C,defaults:P});if(e={...e,lastPlate:C,lastPhone:A,fallbackId:"",listingRecord:I,view:"form"},t?.showListingForm(I,{phone:A}),!at(I,{plate:C,phone:A})){v(""),t?.setCopyLabel("Copy"),a("No data found."),s("No data found.");return}const K=l(I,A);v(K),t?.setCopyLabel("Copy"),a("data ready to copy"),o=G(I.fields.url||"")||d(),i=Date.now(),await c({clipboard:K,phone:A,listingRecord:I,processedAt:i,fallbackId:e.fallbackId});let H=g(I,{plate:C,phone:A},"Data ready to copy");C&&!A&&Q.reason==="timeout"?H+=`
Phone reveal timed out.`:C&&!A&&Q.reason==="no-button"&&(H+=`
No phone button on this listing.`),pe===0&&!A&&Q.reason==="no-button"&&(H+=`
No listing images found.`),s(H)}catch(x){if(m.aborted){s("Cancelled.");return}const P=x instanceof Error?x.message:"Unknown recognition error";s(`Failed: ${P}`)}finally{n=null,y(!1)}}function k(){n?.abort()}async function S(){let m=e.lastClipboard;if(e.listingRecord&&(m=l(e.listingRecord,e.lastPhone),e={...e,lastClipboard:m},t?.setCopyEnabled(!!m)),!m){s("Nothing to copy yet.");return}const x=await fn(m);x.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await c({clipboard:m,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(x.ok?"Data copied":"Clipboard copy failed.")}async function _(){if(!e.listingRecord){s("No listing to copy yet. Run Clip listing.");return}const m=l(e.listingRecord,e.lastPhone),x=await w(m);x.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),await c({clipboard:m,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(x.ok?"Data copied":"Clipboard copy failed.")}async function R(){const m=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!m){s("No plate to copy.");return}const x=await w(m);s(x.ok?`Plate copied: ${m}`:"Clipboard copy failed.")}function O(m,x){if(m==="phone"){e={...e,lastPhone:x==null?"":String(x)};return}if(!e.listingRecord)return;const P=Sn(e.listingRecord,m,x);e={...e,listingRecord:P,lastPlate:m==="plate"?x:e.lastPlate}}async function L(){try{await To(),Po(),s("Model cache cleared.")}catch(m){const x=m instanceof Error?m.message:"Failed to clear cache";s(x)}}function D(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},p(),s(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function N(){if(e.busy)return;const m=await yn();e={...e,view:"settings"},t?.showSettingsForm(m),s(`Settings. Environment: production. Storage: ${he}* / ${nt}.`)}function B(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),s("Back to listing review.")):(t?.hideForm(),s("Settings closed."))}async function T(m){await Yo(m),s("Defaults saved.")}function V(m=document.body){return t||(t=An({onClipListing:E,onCancel:k,onCopyAgain:S,onClearModelCache:L,onToggleDiagnostics:D,onSettings:N,onFieldChange:O,onCopyFullText:_,onCopyPlateOnly:R,onSettingsBack:B,onSaveDefaults:T}),t.mount(m),t.setMinimized(!0),f(),t)}function J(){h(),n?.abort(),n=null,t?.destroy(),t=null,o="",i=0,e=ot()}function M(){return e}return{mount:V,destroy:J,onClipListing:E,onCancel:k,onCopyAgain:S,onCopyFullText:_,onCopyPlateOnly:R,onFieldChange:O,onClearModelCache:L,onToggleDiagnostics:D,onSettings:N,onSettingsBack:B,onSaveDefaults:T,getState:M,setStatus:s}}function vn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?Zo(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function Zo(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const Y="/api";async function X(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),r=await n.text();let o=null;try{o=r?JSON.parse(r):null}catch{o=r}return{ok:n.ok,status:n.status,data:o}}async function Qo(){return X(`${Y}/auth/me`)}async function er(){return X(`${Y}/get_user_local`)}async function ue(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),X(`${Y}/lead-clients?${t.toString()}`)}async function tr(e){return X(`${Y}/purchase-leads/clients/${e}?page=1`)}async function nr(e){return X(`${Y}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function or(e){return X(`${Y}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Pe(e,t=null){return X(`${Y}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}const rr="LeadDeskDB";function ir(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function ar(e){return String(e||"").replace(/\D/g,"")}function et(){return new Promise((e,t)=>{const n=indexedDB.open(rr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function sr(e){const t=await et();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}async function lr(e){const t=await et();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}function xn(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function cr(e){const t=await et(),n=new Date().toISOString(),r=ar(e.phone),o=ir(e.plate),i=xn("client"),a=xn("lead"),d=String(e.title||"").trim().split(/\s+/).filter(Boolean),u=d[0]||"Lead",l=d[1]||"Anúncio",c={id:i,firstName:u,firstSurname:l,secondSurname:"",phone:r,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:r,createdAt:n,updatedAt:n},f={id:a,clientId:i,plate:o,plateNormalized:o,phone:r,phoneNormalized:r,fullName:u,firstSurname:l,secondSurname:"",otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:e.make||"",model:e.model||"",year:e.year||"",fuel:e.fuel||"",transmission:e.transmission||"",bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((h,b)=>{const y=t.transaction(["clients","leads"],"readwrite");y.objectStore("clients").put(c),y.objectStore("leads").put(f),y.oncomplete=()=>h(void 0),y.onerror=()=>b(y.error)}),a}const z={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function te(e){return String(e||"").replace(/\D/g,"")}function ne(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function F(e,t){return[{label:e,value:t}]}function $e(e,t=""){const n=Array.isArray(e)?e:[],r=t.trim().toLowerCase();if(r){const o=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(r));if(o)return{label:o.label??o.nombre??o.name,value:o.value??o.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function dr(e){const t=te(e.phone),r=String(e.title||"").trim().split(/\s+/).filter(Boolean);return{name:r[0]||"Lead",firstSurname:r[1]||"Anúncio",secondSurname:null,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function ur(e){const{clip:t,clientId:n,me:r,localId:o,filters:i={},vehicle:a={}}=e,s=te(t.phone),d=ne(t.plate),u=r?.id??0,l=Array.isArray(r?.rolesId)?r.rolesId:[6],f=String(t.title||"").trim().split(/\s+/).filter(Boolean),h=i.estado||z.estado,b=i.origen||z.origen,y=i.contacto||z.forma_contacto,p=i.marca||z.marca_comercial,g=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,v=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),w=Number(v.replace(",","."))||null,E=t.make||a.makeLabel||"",k=t.model||a.modelLabel||"",S=Number(t.year)||null,_=fr(t.fuel),R=pr(t.transmission);return{data:{toggle:!1,nombre:f[0]||"Lead",telefono1:s||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:F(h.label,h.value),origen:F(b.label,b.value),forma_contacto:F(y.label,y.value),marca_comercial:F(p.label,p.value),email:null,telefono2:null,apellido1:f[1]||"Anúncio",apellido2:null,kilometros:g,importado:!1,matricula:d||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:w,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:_?F(_,a.fuelValue??_):null,ccambios:R?F(R,a.transmissionValue??R):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:u,id_agente_modify:u,rol:l,vehiculo:{marca_vehiculo:E?F(E,a.makeValue??E):[],modelo:k?F(k,a.modelValue??k):[],matriculacion:S?F(S,S):[],combustible:_?F(_,a.fuelValue??_):[],ccambios:R?F(R,a.transmissionValue??R):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:o||z.id_local_actual}}function fr(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function pr(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const mr=`
:host, .lcf-root {
  all: initial;
  font-family: system-ui, -apple-system, Segoe UI, sans-serif;
  font-size: 13px;
  color: #222;
}
.lcf-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 360px;
  max-height: min(80vh, 640px);
  overflow: auto;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 8px 28px rgba(0,0,0,.28);
  display: flex;
  flex-direction: column;
}
.lcf-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background: #2f2f2f;
  color: #fff;
  cursor: move;
  user-select: none;
  flex-shrink: 0;
}
.lcf-title { font-weight: 700; font-size: 13px; }
.lcf-badge {
  font-size: 11px;
  background: #f07a1a;
  color: #fff;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}
.lcf-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}
.lcf-hint {
  color: #666;
  font-size: 12px;
  line-height: 1.35;
}
.lcf-textarea {
  width: 100%;
  min-height: 72px;
  max-height: 140px;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 6px;
  resize: vertical;
  font: inherit;
}
.lcf-row { display: flex; flex-wrap: wrap; gap: 6px; }
.lcf-btn {
  border: 1px solid #bbb;
  background: #f5f5f5;
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  font: inherit;
  font-weight: 600;
}
.lcf-btn:disabled { opacity: .5; cursor: not-allowed; }
.lcf-btn-primary { background: #f07a1a; border-color: #f07a1a; color: #fff; }
.lcf-btn-danger { background: #c62828; border-color: #c62828; color: #fff; }
.lcf-summary {
  background: #f7f7f7;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.45;
}
.lcf-summary strong { display: inline-block; min-width: 72px; }
.lcf-section-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #666;
  margin: 2px 0 0;
}
.lcf-matches {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lcf-match {
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 6px;
  padding: 10px;
}
.lcf-match-title { font-weight: 700; font-size: 13px; }
.lcf-match-sub { color: #555; font-size: 12px; line-height: 1.35; }
.lcf-match-open {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: none;
  background: transparent;
  color: #c45a00;
  font: inherit;
  font-weight: 700;
  font-size: 13px;
  padding: 0;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
}
.lcf-match-open:hover { color: #f07a1a; }
.lcf-status {
  margin-top: 2px;
  padding: 8px 10px;
  border-radius: 4px;
  background: #f3f3f3;
  border: 1px solid #e4e4e4;
  color: #444;
  font-size: 12px;
  line-height: 1.4;
  white-space: pre-wrap;
}
.lcf-status[data-tone="ok"] {
  background: #eef8ee;
  border-color: #c8e6c9;
  color: #1b5e20;
}
.lcf-status[data-tone="warn"] {
  background: #fff8e6;
  border-color: #ffe0a3;
  color: #7a4d00;
}
.lcf-status[data-tone="error"] {
  background: #fdecea;
  border-color: #f5c6c2;
  color: #8a1f1b;
}
.lcf-mini { border: none; background: transparent; color: #fff; cursor: pointer; font-size: 16px; }
`;function gr(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=mr;const o=document.createElement("div");o.className="lcf-panel";const i=document.createElement("div");i.className="lcf-header";const a=document.createElement("div");a.className="lcf-title",a.textContent="CRM · Leads";const s=document.createElement("span");s.className="lcf-badge",s.textContent="CRM";const d=document.createElement("button");d.type="button",d.className="lcf-mini",d.textContent="–",i.append(a,s,d);const u=document.createElement("div");u.className="lcf-body";const l=document.createElement("div");l.className="lcf-hint",l.textContent="Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia a área de transferência. Com dados válidos, a verificação do cadastro corre automaticamente.";const c=document.createElement("textarea");c.className="lcf-textarea",c.placeholder="Cole aqui o texto do Clipper…";const f=document.createElement("div");f.className="lcf-summary",f.hidden=!0;const h=document.createElement("div");h.className="lcf-section-label",h.textContent="Leads encontrados",h.hidden=!0;const b=document.createElement("ul");b.className="lcf-matches";const y=document.createElement("div");y.className="lcf-row";const p=document.createElement("button");p.type="button",p.className="lcf-btn",p.textContent="Ler área de transferência";const g=document.createElement("button");g.type="button",g.className="lcf-btn",g.textContent="Analisar texto";const v=document.createElement("button");v.type="button",v.className="lcf-btn lcf-btn-primary",v.textContent="Verificar cadastro",v.disabled=!0,y.append(p,g,v);const w=document.createElement("div");w.className="lcf-row";const E=document.createElement("button");E.type="button",E.className="lcf-btn lcf-btn-danger",E.textContent="Criar lead",E.disabled=!0,E.hidden=!0,w.append(E);const k=document.createElement("div");k.className="lcf-status",k.dataset.tone="",k.textContent="Aguardando dados do anúncio.",u.append(l,c,f,h,b,y,w,k),o.append(i,u),n.append(r,o),document.documentElement.append(t);let S=!1;d.addEventListener("click",()=>{S=!S,u.hidden=S,d.textContent=S?"+":"–"});let _=!1,R=0,O=0;return i.addEventListener("pointerdown",L=>{if(L.target===d)return;_=!0;const D=o.getBoundingClientRect();R=L.clientX-D.left,O=L.clientY-D.top,i.setPointerCapture(L.pointerId)}),i.addEventListener("pointermove",L=>{_&&(o.style.left=`${L.clientX-R}px`,o.style.top=`${L.clientY-O}px`,o.style.right="auto",o.style.bottom="auto")}),i.addEventListener("pointerup",()=>{_=!1}),p.addEventListener("click",()=>e.onReadClipboard()),g.addEventListener("click",()=>e.onParseText(c.value)),c.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(c.value),0)}),v.addEventListener("click",()=>e.onVerify()),E.addEventListener("click",()=>e.onCreate()),{setBadge(L){s.textContent=L},setStatus(L,D=""){k.textContent=L,k.dataset.tone=D||""},setText(L){c.value=L},getText(){return c.value},setSummary(L){if(!L){f.hidden=!0,f.textContent="";return}f.hidden=!1,f.innerHTML=L},setVerifyEnabled(L){v.disabled=!L},setCreateVisible(L,D=!0){E.hidden=!L,E.disabled=!D},setMatches(L,D){b.replaceChildren(),h.hidden=L.length===0;for(const N of L){const B=document.createElement("li"),T=document.createElement("div");T.className="lcf-match";const V=document.createElement("div");V.className="lcf-match-title",V.textContent=N.title;const J=document.createElement("div");J.className="lcf-match-sub",J.textContent=N.subtitle;const M=document.createElement("button");M.type="button",M.className="lcf-match-open",M.textContent="Abrir lead →",M.addEventListener("click",()=>D(N.id)),T.append(V,J,M),B.append(T),b.append(B)}},clearMatches(){b.replaceChildren(),h.hidden=!0},destroy(){t.remove()}}}function hr(){let e=null,t=null,n=!1,r=null;function o(){const p=vn();return t?.setBadge(p.label),p}function i(p){const g=Fo(p);return t?.clearMatches(),t?.setCreateVisible(!1),g.ok?(e=g.payload,t?.setText(p),t?.setVerifyEnabled(!0),t?.setSummary([`<div><strong>ID</strong> ${fe(e.id)}</div>`,`<div><strong>Placa</strong> ${fe(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${fe(e.phone||"—")}</div>`,`<div><strong>Veículo</strong> ${fe([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${fe(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0):(e=null,t?.setSummary(null),t?.setVerifyEnabled(!1),t?.setStatus(`Falha ao analisar o texto: ${g.error}`,"error"),!1)}async function a(){try{const p=await navigator.clipboard.readText();t?.setText(p),i(p)&&await d()}catch(p){const g=p instanceof Error?p.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${g}). Cole o texto e use Analisar texto.`,"warn")}}async function s(p){i(p)&&await d()}async function d(){if(!e||n)return;if(o().backend==="leaddesk"){await u();return}await l()}async function u(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const p=ne(e.plate),g=te(e.phone);let v=[];if(p&&(v=await sr(p)),v.length===0&&g&&(v=await lr(g)),!p&&!g){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(v.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const w=v.map(E=>({id:E.id,title:`Lead ${E.plate||E.id}`,subtitle:`${E.phone||"—"} · ${[E.make,E.model,E.year].filter(Boolean).join(" · ")||"—"} · ${E.leadStatus||""} · ${E.updatedAt||""}`.trim()}));t?.setMatches(w,E=>{location.assign(`/crm/leads/${E}`)}),t?.setStatus(w.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":`${w.length} leads encontrados. Use Abrir lead ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(p){const g=p instanceof Error?p.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${g}`,"error")}finally{n=!1}}async function l(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const p=ne(e.plate),g=te(e.phone);let v;if(p)v=await ue({plate:p}),v.ok&&Array.isArray(v.data)&&v.data.length===0&&g&&(v=await ue({phone:g}));else if(g)v=await ue({phone:g});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!v.ok){t?.setStatus(`Falha na verificação (HTTP ${v.status}). Está autenticado no CRM?`,"error");return}const w=Array.isArray(v.data)?v.data:[];if(w.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const E=[];for(const S of w){const _=S?.purchaseLead?.id;if(_)E.push({id:_,title:`Lead #${_}`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""} · ${S.purchaseLead?.statusName||""}`.trim()});else if(S?.id){const O=(await tr(S.id)).data?.results||[];for(const L of O)E.push({id:L.id,title:`Lead #${L.id}`,subtitle:`Placa ${L.plate||"—"} · ${L.status?.name||""} · ${L.lastAction||""}`.trim()});O.length===0&&E.push({id:`client:${S.id}`,title:`Cliente #${S.id} (sem lead de compra)`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""}`.trim()})}}const k=E.filter(S=>String(S.id).match(/^\d+$/));t?.setMatches(k.length?k:E,S=>{if(String(S).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}location.assign(`/main/lead-tasacion/${S}`)}),t?.setStatus(k.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":k.length>1?`${k.length} leads encontrados. Use Abrir lead ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",k.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(p){const g=p instanceof Error?p.message:"erro";t?.setStatus(`Erro na verificação: ${g}`,"error")}finally{n=!1}}async function c(){if(!e||n)return;if(o().backend==="leaddesk"){await f();return}await h()}async function f(){if(!te(e.phone)&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}n=!0,t?.setStatus("Criando no LeadDesk…");try{const g=await cr(e);t?.setStatus(`Lead ${g} criado. Abrindo a página…`,"ok"),location.assign(`/crm/leads/${g}`)}catch(g){const v=g instanceof Error?g.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${v}`,"error")}finally{n=!1}}async function h(){const p=te(e.phone);if(!p&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar cliente/lead no CRM com os dados copiados?")){n=!0,t?.setStatus("Criando no CRM…");try{const g=await Qo();if(!g.ok||!g.data?.id){t?.setStatus(`Falha de autenticação (HTTP ${g.status}). Faça login no CRM.`,"error");return}const v=g.data,w=await er(),E=Array.isArray(w.data)&&w.data[0]?.value||z.id_local_actual,[k,S,_,R]=await Promise.all([Pe("estado_lead_compra"),Pe("origen_lead_compra"),Pe("contacto"),Pe("marcas_comerciales",v.id)]),O={estado:$e(k.data,"Avaliação")||z.estado,origen:$e(S.data,"Captación")||z.origen,contacto:$e(_.data,"Whatsapp")||z.forma_contacto,marca:$e(R.data,"")||z.marca_comercial};let L=null;if(p){const T=await ue({phone:p});T.ok&&Array.isArray(T.data)&&T.data[0]?.id&&(L=T.data[0].id)}if(!L){const T=await nr(dr(e));if(T.status===409)L=(await ue({phone:p||void 0,plate:ne(e.plate)||void 0})).data?.[0]?.id;else if(T.ok&&T.data?.resourceId)L=T.data.resourceId;else{t?.setStatus(`Falha ao criar cliente (HTTP ${T.status}): ${JSON.stringify(T.data)}`,"error");return}}if(!L){t?.setStatus("Não foi possível obter clientId.","error");return}const D=ur({clip:e,clientId:L,me:v,localId:E,filters:O}),N=await or(D);if(!N.ok){t?.setStatus(`Falha create_lead_compra (HTTP ${N.status}): ${JSON.stringify(N.data)}`,"error");return}const B=N.data?.id_lead;if(!B){t?.setStatus(`Resposta inesperada: ${JSON.stringify(N.data)}`,"error");return}t?.setStatus(`Lead ${B} criado. Abrindo a página…`,"ok"),location.assign(`/main/lead-tasacion/${B}`)}catch(g){const v=g instanceof Error?g.message:"erro";t?.setStatus(`Erro ao criar: ${v}`,"error")}finally{n=!1}}}function b(){if(t)return t;t=gr({onReadClipboard:a,onParseText:s,onVerify:d,onCreate:c}),o(),window.addEventListener("popstate",o),r=new MutationObserver(()=>o());const p=document.getElementById("app")||document.body;return p&&r.observe(p,{childList:!0,subtree:!0}),a(),t}function y(){window.removeEventListener("popstate",o),r?.disconnect(),r=null,t?.destroy(),t=null,e=null}return{mount:b,destroy:y,refreshContext:o}}function fe(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const tt="__LEAD_CRM_FILLER_INITIALIZED__",br="lead-crm-filler-root";function yr(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:vn().backend!=="none"?vr():xr()}function vr(){if(window[tt])return{started:!1,reason:"already-initialized"};if(document.getElementById(br))return window[tt]=!0,{started:!1,reason:"panel-exists"};window[tt]=!0;const e=hr(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function xr(){if(window[Me])return{started:!1,reason:"already-initialized"};if(document.getElementById(be))return window[Me]=!0,{started:!1,reason:"panel-exists"};window[Me]=!0;const e=Jo(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}yr()})();
