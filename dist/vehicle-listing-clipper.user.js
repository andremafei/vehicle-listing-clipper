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
(function(){"use strict";const Be="Vehicle Listing Clipper",xe="vlc_prod_",mt="vehicle-listing-clipper",Fe="__VLC_PROD_INITIALIZED__",Ce="vlc-panel-root";function gt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const we={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Ve=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],ht={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},bt=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Mn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function On(e={}){return{...we,...e}}function Bn({extracted:e=null,plate:t="",defaults:n={}}={}){const r=On(n),o=Mn(),i={},a=[],s=[],l=[],u=[...e?.warnings||[]];function p(h,b,v){const c=b==null?"":String(b);if(o[h]=c,!c){i[h]="missing";return}i[h]=v,v==="extracted"||v==="anpr"?a.push(h):v==="default"&&s.push(h)}const d=t?String(t).trim():"";p("plate",d,d?"anpr":"missing");const f=e?.clientName?String(e.clientName).trim():"";return p("clientName",f,f?"extracted":"missing"),p("make",e?.make||"",e?.make?"extracted":"missing"),p("model",e?.model||"",e?.model?"extracted":"missing"),p("year",e?.year||"",e?.year?"extracted":"missing"),p("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),p("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),p("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),p("engine",e?.engine||"",e?.engine?"extracted":"missing"),p("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),p("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),p("url",e?.url||"",e?.url?"extracted":"missing"),p("paintParts",r.paintParts,"default"),p("bodyParts",r.bodyParts,"default"),p("tires",r.tires,"default"),p("saleReason",r.saleReason,"default"),p("keyCount",r.keyCount,"default"),p("deductibleVat",r.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:o.clientName||e?.clientName||""},fields:o,origins:i,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:l,warnings:u}}}function yt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function Fn(e,t,n){const r=n==null?"":String(n),o={...e.fields,[t]:r},i={...e.origins,[t]:r?"edited":"missing"},a=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:o,origins:i,source:{...e.source,url:t==="url"?r:e.source.url,clientName:t==="clientName"?r:e.source.clientName},metadata:{...e.metadata,editedFields:a}}}function vt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Vn(e){let t=null;const n=new Map;let r="listing";function o(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function a(f,h,b="missing",v){const c=document.createElement("label");c.className=`vlc-field ${vt(b)}`,c.dataset.field=f;const g=document.createElement("span");g.className="vlc-field-label",g.textContent=v||ht[f]||f;const y=document.createElement("span");y.className="vlc-field-origin",y.textContent=b;const E=document.createElement("input");E.type="text",E.className="vlc-field-input",E.value=h??"",E.dataset.field=f,E.addEventListener("input",()=>{r==="listing"&&(e.onFieldChange(f,E.value),c.className=`vlc-field ${vt("edited")}`,y.textContent="edited")}),g.appendChild(y),c.append(g,E),n.set(f,E),t?.appendChild(c)}function s(){const f=document.createElement("div");f.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>e.onCopyFullText());const b=document.createElement("button");b.type="button",b.className="vlc-btn",b.textContent="Copy plate only",b.addEventListener("click",()=>e.onCopyPlateOnly()),f.append(h,b),t?.appendChild(f)}function l(f,{phone:h=""}={}){r="listing",o(),i(),t.hidden=!1;const b=document.createElement("div");b.className="vlc-form-heading",b.textContent="Review listing",t.appendChild(b);const v=h==null?"":String(h).trim();a("phone",v,v?"extracted":"missing","Telefone");for(const c of Ve){let g=f.fields[c]||"",y=f.origins[c]||"missing";c==="clientName"&&!g&&f.source?.clientName&&(g=String(f.source.clientName),y="extracted"),a(c,g,y)}s()}function u(f){r="settings",o(),i(),t.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",t.appendChild(h);for(const g of bt)a(g,f[g]||"","default");const b=document.createElement("div");b.className="vlc-form-actions";const v=document.createElement("button");v.type="button",v.className="vlc-btn vlc-btn-primary",v.textContent="Save defaults",v.addEventListener("click",()=>{const g={};for(const y of bt)g[y]=n.get(y)?.value??"";e.onSaveDefaults?.(g)});const c=document.createElement("button");c.type="button",c.className="vlc-btn",c.textContent="Back",c.addEventListener("click",()=>e.onBack?.()),b.append(v,c),t.appendChild(b)}function p(){t&&(t.hidden=!0)}function d(f,{phone:h}={}){if(r==="listing"){if(h!==void 0){const b=n.get("phone");b&&document.activeElement!==b&&(b.value=h==null?"":String(h))}for(const b of Ve){const v=n.get(b);if(v&&document.activeElement!==v){let c=f.fields[b]||"";b==="clientName"&&!c&&f.source?.clientName&&(c=String(f.source.clientName)),v.value=c}}}}return{ensureRoot:o,showListing:l,showSettings:u,syncListingValues:d,hide:p,getMode:()=>r,getElement:()=>o()}}const zn=`
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

.vlc-panel--minimized.vlc-panel--ready {
  background: #14532d;
  border-color: #166534;
  box-shadow: 0 10px 30px rgba(20, 83, 45, 0.45);
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

.vlc-header-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.vlc-header-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.vlc-btn-header-copy,
.vlc-btn-header-clip {
  padding: 4px 8px;
  font-size: 11px;
  white-space: nowrap;
}

.vlc-btn-header-clip {
  display: none;
}

.vlc-panel--minimized .vlc-btn-header-clip {
  display: inline-block;
}

.vlc-id-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.vlc-clipboard-id {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.vlc-clipboard-id--random {
  color: #fbbf24;
}

.vlc-id-signals {
  display: none;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
}

.vlc-panel--minimized .vlc-id-signals:not([hidden]) {
  display: inline-flex;
}

.vlc-signal {
  box-sizing: border-box;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0;
  border: 1px solid #4b5563;
  background: #1f2937;
  color: #6b7280;
  opacity: 0.55;
}

.vlc-signal--on {
  opacity: 1;
}

.vlc-signal--plate.vlc-signal--on {
  border-color: #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-signal--phone.vlc-signal--on {
  border-color: #2563eb;
  background: #1e3a8a;
  color: #93c5fd;
}

.vlc-signal--random.vlc-signal--on {
  border-color: #d97706;
  background: #78350f;
  color: #fcd34d;
}

.vlc-panel--minimized.vlc-panel--ready .vlc-signal:not(.vlc-signal--on) {
  border-color: #166534;
  background: #14532d;
  color: #86efac;
  opacity: 0.4;
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
`;function Un(e){let t=null,n=null,r=null,o=null,i=null,a=null,s=null,l=null,u=null,p=null,d=null,f=null,h=null,b=null,v=null,c=null,g=null,y=!0,E="waiting",w=!1,k=null,S=0,I=0,A=null;const P=Vn({onFieldChange:(C,_)=>e.onFieldChange(C,_),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:C=>e.onSaveDefaults(C)});function L(){o&&(o.textContent=y?E:Be)}const M='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',G='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function B(){!n||!g||(n.classList.toggle("vlc-panel--minimized",y),g.innerHTML=y?M:G,g.setAttribute("aria-label",y?"Expand panel":"Minimize panel"),g.title=y?"Expand":"Minimize",L())}function F(C){y=!!C,B()}function $(){F(!y)}function Z(C){E=C,n?.classList.toggle("vlc-panel--ready",String(C).toLowerCase()==="ready to copy"),L()}function W(){u&&(u.disabled=!w),p&&(p.disabled=!w)}function ft(C,_){if(!n)return;const T=n.getBoundingClientRect(),re=Math.max(0,window.innerWidth-T.width),q=Math.max(0,window.innerHeight-T.height),ee=Math.min(Math.max(0,C),re),ie=Math.min(Math.max(0,_),q);n.style.left=`${ee}px`,n.style.top=`${ie}px`,n.style.right="auto",n.style.bottom="auto"}function m(C){if(!n||!r||C.target?.closest("button")||C.button!==0)return;const T=n.getBoundingClientRect();k=C.pointerId,S=C.clientX-T.left,I=C.clientY-T.top,r.classList.add("vlc-header--dragging"),r.setPointerCapture(C.pointerId),C.preventDefault()}function x(C){k===C.pointerId&&ft(C.clientX-S,C.clientY-I)}function R(C){k===C.pointerId&&(k=null,r?.classList.remove("vlc-header--dragging"),r?.hasPointerCapture(C.pointerId)&&r.releasePointerCapture(C.pointerId))}function N(C=document.body){if(document.getElementById(Ce))return t=document.getElementById(Ce),t;t=document.createElement("div"),t.id=Ce,t.setAttribute("data-vlc-panel","1");const _=t.attachShadow({mode:"open"}),T=document.createElement("style");T.textContent=zn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Be),r=document.createElement("div"),r.className="vlc-header",r.addEventListener("pointerdown",m),r.addEventListener("pointermove",x),r.addEventListener("pointerup",R),r.addEventListener("pointercancel",R);const re=document.createElement("div");re.className="vlc-header-main";const q=document.createElement("div");q.className="vlc-header-text",o=document.createElement("h1"),o.className="vlc-title",o.textContent=Be,q.appendChild(o);const ee=document.createElement("div");ee.className="vlc-id-row",f=document.createElement("p"),f.className="vlc-clipboard-id",f.hidden=!0,ee.appendChild(f),h=document.createElement("div"),h.className="vlc-id-signals",h.hidden=!0,h.setAttribute("aria-label","Sinais de captura"),b=U("P","Matrícula"),b.classList.add("vlc-signal--plate"),v=U("T","Telefone"),v.classList.add("vlc-signal--phone"),c=U("R","ID aleatório"),c.classList.add("vlc-signal--random"),h.append(b,v,c),ee.appendChild(h),q.appendChild(ee),re.appendChild(q),d=D("Clip again",()=>e.onClipListing()),d.classList.add("vlc-btn-header-clip"),p=D("Copy again",()=>e.onCopyAgain()),p.classList.add("vlc-btn-header-copy"),p.disabled=!0,g=document.createElement("button"),g.type="button",g.className="vlc-btn vlc-btn-icon",g.addEventListener("click",$);const ie=document.createElement("div");ie.className="vlc-header-actions",ie.append(d,p,g),r.append(re,ie);const ae=document.createElement("div");ae.className="vlc-body";const pt=document.createElement("div");pt.className="vlc-actions",s=D("Clip listing",()=>e.onClipListing()),l=D("Cancel",()=>e.onCancel()),l.disabled=!0,u=D("Copy again",()=>e.onCopyAgain()),u.disabled=!0;const Jr=D("Clear model cache",()=>e.onClearModelCache()),Zr=D("Diagnostics",()=>e.onToggleDiagnostics()),Qr=D("Settings",()=>e.onSettings());pt.append(s,l,u,Jr,Zr,Qr),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const ei=P.getElement();return ae.append(pt,i,a,ei),n.append(r,ae),_.append(T,n),B(),C.appendChild(t),t}function D(C,_){const T=document.createElement("button");return T.type="button",T.className="vlc-btn",T.textContent=C,T.addEventListener("click",_),T}function U(C,_){const T=document.createElement("span");return T.className="vlc-signal",T.textContent=C,T.title=_,T.setAttribute("aria-label",_),T.setAttribute("aria-pressed","false"),T}function O(C,_){C&&(C.classList.toggle("vlc-signal--on",!!_),C.setAttribute("aria-pressed",_?"true":"false"))}function Q(C){i&&(i.textContent=C)}function Dn(C){const _=!!C;s&&(s.disabled=_),d&&(d.disabled=_),l&&(l.disabled=!_)}function oe({id:C="",isRandom:_=!1,hasPlate:T=!1,hasPhone:re=!1}={}){if(!f)return;const q=String(C||"").trim(),ee=!!T,ie=!!re,ae=!!_;if(!q){f.hidden=!0,f.textContent="",f.classList.remove("vlc-clipboard-id--random"),h&&(h.hidden=!0),O(b,!1),O(v,!1),O(c,!1);return}f.hidden=!1,f.textContent=ae?`ID: ${q} · random`:`ID: ${q}`,f.classList.toggle("vlc-clipboard-id--random",ae),h&&(h.hidden=!1),O(b,ee),O(v,ie),O(c,ae)}function K(C){w=!!C,W()}function V(C){const _=C||"Copy again";u&&(u.textContent=_),p&&(p.textContent=_)}function Y(C=2e3){A!=null&&(clearTimeout(A),A=null);for(const _ of[p,u])_&&_.classList.add("vlc-btn--copied");A=setTimeout(()=>{A=null;for(const _ of[p,u])_?.classList.remove("vlc-btn--copied")},C)}function Oe(C,_=""){a&&(a.hidden=!C,a.textContent=_)}function ue(C,{phone:_=""}={}){P.showListing(C,{phone:_})}function Kr(C){P.showSettings(C)}function Yr(){P.hide()}function Xr(){A!=null&&(clearTimeout(A),A=null),r&&(r.removeEventListener("pointerdown",m),r.removeEventListener("pointermove",x),r.removeEventListener("pointerup",R),r.removeEventListener("pointercancel",R)),t?.remove(),t=null,n=null,r=null,o=null,i=null,a=null,s=null,l=null,u=null,p=null,d=null,f=null,h=null,b=null,v=null,c=null,g=null,y=!0,E="waiting",w=!1,k=null}return{mount:N,setStatus:Q,setBusy:Dn,setClipboardId:oe,setCopyEnabled:K,setCopyLabel:V,flashCopySuccess:Y,setCaptureStatus:Z,setDiagnostics:Oe,showListingForm:ue,showSettingsForm:Kr,hideForm:Yr,setMinimized:F,toggleMinimized:$,destroy:Xr}}function fe(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function Ee(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return fe(n)}function xt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function Ct(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function wt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function Et(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function St(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const r=t.replace(",",".");return r==="1"?"1.0":r}function Lt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const r=t.replace(/[^\d]/g,"");return r?`${r} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function kt(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function Se(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function Le(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function Hn(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return Le(t)}function j(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let r=`${n.origin}${n.pathname}`;const i=r.toLowerCase().indexOf(".html");return i!==-1&&(r=r.slice(0,i+5)),r}catch{return""}}const At="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",_t='#mainContent img[data-testid="swiper-image-lazy"]',It="#mainContent div.swiper-wrapper img",Rt=[At,_t,It],Pt='#mainContent button[data-testid="ad-contact-phone"]',Tt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Nt='#mainContent [data-testid="ad-parameters-container"]',$t='#mainContent [data-testid="ad-price-container"] h3',ze='link#ssr_canonical[rel="canonical"]',Dt='#mainContent [data-testid="offer_title"]',Gn='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',Mt='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Ot='script[type="application/ld+json"]';function qn(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const r=setTimeout(()=>{t?.removeEventListener("abort",o),n("ok")},e),o=()=>{clearTimeout(r),n("cancelled")};t?.addEventListener("abort",o,{once:!0})})}function jn(e=document){const t=Vt(e);if(t&&se(t))return t;for(const n of Ft(e))if(se(n))return n;return null}function Wn(e){return!!(e&&typeof e.click=="function")}function Bt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function pe(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Ue(e){if(e.hidden)return!0;const n=Bt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function se(e){if(!e||typeof e.getBoundingClientRect!="function"||Ue(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(pe(e)>0)return!0;const n=Bt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Ft(e=document){return[...e.querySelectorAll(Pt)].filter(t=>Wn(t))}function Vt(e=document){const t=Ft(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(s=>!Ue(s)),o=[...n.length>0?n:t].sort((s,l)=>{const u=se(s)?1:0,p=se(l)?1:0;return u!==p?p-u:pe(l)-pe(s)}),i=(()=>{const s=o[0];return{visible:se(s)?1:0,area:pe(s)}})(),a=o.filter(s=>(se(s)?1:0)===i.visible&&pe(s)===i.area);return a[a.length-1]||o[o.length-1]||t[t.length-1]}function He(e=document){const t=[...e.querySelectorAll(Tt)];for(const n of t){if(t.length>1&&Ue(n))continue;const r=n.getAttribute("href")||"",o=Ee(r);if(o)return o;const i=fe(n.textContent||"");if(i)return i}if(t.length>0){const n=t[t.length-1],r=n.getAttribute("href")||"",o=Ee(r);if(o)return o;const i=fe(n.textContent||"");if(i)return i}return null}function Kn(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function Yn(e){try{e.click()}catch{}Kn(e)}async function Xn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,buttonAppearDelayMs:o=2e3,buttonAppearAttempts:i=2,signal:a}=e,s=He(t);if(s)return{ok:!0,phone:s,clicked:!1,alreadyVisible:!0};if(a?.aborted)return{ok:!1,reason:"cancelled"};let l=null;const u=Math.max(1,i);for(let d=0;d<u;d+=1){if(await qn(o,a)==="cancelled"||a?.aborted)return{ok:!1,reason:"cancelled"};if(l=jn(t),l)break}if(!l)return{ok:!1,reason:"no-button"};const p=Date.now()+n;for(Yn(l);Date.now()<p;){if(a?.aborted)return{ok:!1,reason:"cancelled"};const d=He(t);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(f=>setTimeout(f,r))}return{ok:!1,reason:"timeout"}}function Jn(e){const t=new Map,n=e.querySelector(Nt);if(!n)return t;for(const r of n.querySelectorAll("p")){const o=(r.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const i=o.indexOf(":");if(i<=0)continue;const a=o.slice(0,i).trim().toLowerCase(),s=o.slice(i+1).trim();a&&s&&t.set(a,s)}return t}function Zn(e){const t=e.querySelectorAll(Ot);for(const n of t){const r=n.textContent||"";if(r.trim())try{const o=JSON.parse(r),i=Array.isArray(o)?o:[o];for(const a of i)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function Qn(e){const n=(e.querySelector?.(ze)||(typeof document<"u"?document.querySelector(ze):null))?.getAttribute?.("href")||"";return n?j(n):typeof location<"u"&&location?.href?j(location.href):""}function eo(e){const t=e.querySelectorAll(Mt);for(const n of t){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function to(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function no(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function oo(e=document){const t=[],n=[];function r(I,A){A&&t.push(I)}const o=Jn(e),i=Zn(e),a=Qn(e);r("url",a);const s=no(a,i);r("listingId",s);const u=(e.querySelector(Dt)?.textContent||i?.name||"").replace(/\s+/g," ").trim();r("title",u);const p=Le(i?.description||"");r("description",p);const f=(e.querySelector(Gn)?.textContent||"").replace(/\s+/g," ").trim();r("clientName",f);let h=to(i);h||(h=eo(e)),h=Se(h),r("make",h);let b=o.get("modelo")||i?.model||"";b=Se(b),r("model",b);let v=o.get("ano")||i?.productionDate||i?.modelDate||"";v=kt(v),r("year",v);const c=xt(o.get("quilómetros")||o.get("quilometros")||"");r("mileageKm",c);const g=wt(o.get("tipo de caixa")||"");r("transmission",g);const y=Et(o.get("combustível")||o.get("combustivel")||"");r("fuel",y);const E=St(o.get("cilindrada")||"");r("engine",E);const w=Lt(o.get("potência")||o.get("potencia")||"");r("powerCv",w);let k=i?.offers?.price;(k==null||k==="")&&(k=e.querySelector($t)?.textContent||"");const S=Ct(k);return r("priceEur",S),(!h||!b)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:u,description:p,clientName:f,make:h,model:b,year:v,mileageKm:c,transmission:g,fuel:y,engine:E,powerCv:w,priceEur:S,extractedFields:[...new Set(t)],warnings:n}}function ro(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),r=n[0],o=n[1];let i=null;return o&&/^\d+w$/i.test(o)&&(i=Number.parseInt(o,10)),{url:r,width:i}}).filter(t=>!!t.url)}function io(e){const t=ro(e);if(t.length===0)return null;const n=t.filter(o=>typeof o.width=="number");if(n.length===0)return t[t.length-1].url;let r=n[0];for(let o=1;o<n.length;o+=1)n[o].width>r.width&&(r=n[o]);return r.url}function zt(e){if(!e)return null;const t=io(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function ao(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Ut(e=document){for(const t of Rt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ge(e=document){const{images:t,selectorUsed:n}=Ut(e),r=[],o=new Set;for(const i of t){const a=zt(i);if(!a)continue;const s=ao(a);o.has(s)||(o.add(s),r.push(s))}return{urls:r,count:r.length,selectorUsed:n}}async function so(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ge(t);if(o.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Ge(t);return o}const Ht={siteId:"olx-pt",discoverListingImages:Ge,discoverListingImagesWithWait:so,queryGalleryImages:Ut,extractListing:oo,findPhoneRevealButton:Vt,readRevealedPhone:He,revealContactPhone:Xn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:At,FALLBACK_TESTID_SELECTOR:_t,FALLBACK_SWIPER_IMG_SELECTOR:It,GALLERY_SELECTORS:Rt,PHONE_REVEAL_BUTTON_SELECTOR:Pt,CONTACT_PHONE_SELECTOR:Tt,AD_PARAMETERS_SELECTOR:Nt,AD_PRICE_SELECTOR:$t,CANONICAL_LINK_SELECTOR:ze,OFFER_TITLE_SELECTOR:Dt,BREADCRUMB_ITEM_SELECTOR:Mt,JSON_LD_SELECTOR:Ot}},Gt="script#__NEXT_DATA__",qt='h1.offer-title, [data-testid="summary-info-area"] h1',jt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',Wt='[data-testid="content-description-section"]',qe='link[rel="canonical"]',ke='[data-testid="aside-seller-info"]',lo='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',Kt='[data-testid="seller-info-contact-box"]',Yt='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Xt='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Jt='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Zt=[Xt,Jt];function co(e){return`[data-testid="${e}"] p:last-of-type`}const uo=/ver\s+telefone/i;function fo(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const r=setTimeout(()=>{t?.removeEventListener("abort",o),n("ok")},e),o=()=>{clearTimeout(r),n("cancelled")};t?.addEventListener("abort",o,{once:!0})})}function po(e){return!!(e&&typeof e.click=="function")}function Qt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function je(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Ae(e){if(e.hidden)return!0;const n=Qt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function _e(e){if(!e||typeof e.getBoundingClientRect!="function"||Ae(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(je(e)>0)return!0;const n=Qt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function en(e){if(!po(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return uo.test(t)}function tn(e=document){const t=[],n=new Set;function r(o){const i=e.querySelector?.(o)||null;if(i)for(const a of i.querySelectorAll("button"))!en(a)||n.has(a)||(n.add(a),t.push(a))}r(ke),r(Kt);for(const o of e.querySelectorAll?.("button")||[])!en(o)||n.has(o)||(n.add(o),t.push(o));return t}function nn(e=document){const t=tn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(ke);if(n){const a=t.find(s=>n.contains(s)&&!Ae(s));if(a)return a}const r=t.filter(a=>!Ae(a));return[...r.length>0?r:t].sort((a,s)=>{const l=_e(a)?1:0,u=_e(s)?1:0;return l!==u?u-l:je(s)-je(a)})[0]||t[0]}function mo(e=document){const t=nn(e);if(t&&_e(t))return t;for(const n of tn(e))if(_e(n))return n;return null}function We(e=document){const t=[...e.querySelectorAll?.(Yt)||[]],n=e.querySelector?.(ke),r=n&&t.length>1?[...t.filter(o=>n.contains(o)),...t.filter(o=>!n.contains(o))]:t;for(const o of r){if(r.length>1&&Ae(o))continue;const i=o.getAttribute("href")||"",a=Ee(i);if(a)return a;const s=fe(o.textContent||"");if(s)return s}if(r.length>0){const o=r[0],i=o.getAttribute("href")||"",a=Ee(i);if(a)return a;const s=fe(o.textContent||"");if(s)return s}return null}function go(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function ho(e){try{e.click()}catch{}go(e)}async function bo(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,buttonAppearDelayMs:o=2e3,buttonAppearAttempts:i=2,signal:a}=e,s=We(t);if(s)return{ok:!0,phone:s,clicked:!1,alreadyVisible:!0};if(a?.aborted)return{ok:!1,reason:"cancelled"};let l=null;const u=Math.max(1,i);for(let d=0;d<u;d+=1){if(await fo(o,a)==="cancelled"||a?.aborted)return{ok:!1,reason:"cancelled"};if(l=mo(t),l)break}if(!l)return{ok:!1,reason:"no-button"};const p=Date.now()+n;for(ho(l);Date.now()<p;){if(a?.aborted)return{ok:!1,reason:"cancelled"};const d=We(t);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(f=>setTimeout(f,r))}return{ok:!1,reason:"timeout"}}const Ke="https://www.standvirtual.com/";function on(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function me(e){const{value:t,label:n}=on(e);return n||t}function Ie(e){const{value:t,label:n}=on(e);return t||n}function rn(e){const n=e.querySelector?.(Gt)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function yo(e){const n=(e.querySelector?.(qe)||(typeof document<"u"?document.querySelector(qe):null))?.getAttribute?.("href")||"";return n?j(n,Ke):typeof location<"u"&&location?.href?j(location.href,Ke):""}function vo(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function X(e,t){return(e.querySelector?.(co(t))?.textContent||"").replace(/\s+/g," ").trim()}function xo(e=document){const t=[],n=[];function r(A,P){P&&t.push(A)}const o=rn(e),i=o?.parametersDict||{};let a="";o?.url&&(a=j(o.url,Ke)),a||(a=yo(e)),r("url",a);const s=vo(a,o);r("listingId",s);const l=e.querySelector?.(qt),u=(o?.title||l?.textContent||"").replace(/\s+/g," ").trim();r("title",u);let p="";if(o?.description&&(p=Hn(o.description)),!p){const A=e.querySelector?.(Wt);p=Le(A?.textContent||"")}r("description",p);let d="";o?.seller?.name&&(d=String(o.seller.name).replace(/\s+/g," ").trim()),d||(d=(e.querySelector?.(lo)?.textContent||"").replace(/\s+/g," ").trim()),r("clientName",d);let f=me(i.make)||X(e,"make")||"";f=Se(f),r("make",f);let h=me(i.model)||X(e,"model")||"";h=Se(h),r("model",h);let b=Ie(i.first_registration_year)||X(e,"first_registration_year")||"";b=kt(b),r("year",b);const v=xt(Ie(i.mileage)||X(e,"mileage")||"");r("mileageKm",v);const c=wt(me(i.gearbox)||X(e,"gearbox")||"");r("transmission",c);const g=Et(me(i.fuel_type)||X(e,"fuel_type")||"");r("fuel",g);const y=Ie(i.engine_capacity)||X(e,"engine_capacity")||"",E=/cm\s*3|cm3|\bcc\b/i.test(y)?y.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):y,w=St(E);r("engine",w);const k=Lt(Ie(i.engine_power)||me(i.engine_power)||X(e,"engine_power")||"");r("powerCv",k);let S=o?.price?.value;(S==null||S==="")&&(S=e.querySelector?.(jt)?.textContent||"");const I=Ct(S);return r("priceEur",I),(!f||!h)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:u,description:p,clientName:d,make:f,model:h,year:b,mileageKm:v,transmission:c,fuel:g,engine:w,powerCv:k,priceEur:I,extractedFields:[...new Set(t)],warnings:n}}function an(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Co(e=document){const n=rn(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const r=[],o=new Set;for(const i of n){const a=i?.url||i?.src||"";if(!a)continue;const s=an(String(a));o.has(s)||(o.add(s),r.push(s))}return r.length===0?null:{urls:r,count:r.length,selectorUsed:"next-data:images.photos"}}function sn(e=document){for(const t of Zt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ye(e=document){const t=Co(e);if(t)return t;const{images:n,selectorUsed:r}=sn(e),o=[],i=new Set;for(const a of n){const s=zt(a);if(!s)continue;const l=an(s);i.has(l)||(i.add(l),o.push(l))}return{urls:o,count:o.length,selectorUsed:r}}async function wo(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ye(t);if(o.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Ye(t);return o}const ln={siteId:"standvirtual-pt",discoverListingImages:Ye,discoverListingImagesWithWait:wo,queryGalleryImages:sn,extractListing:xo,findPhoneRevealButton:nn,readRevealedPhone:We,revealContactPhone:bo,selectors:{PRIMARY_GALLERY_SELECTOR:Xt,FALLBACK_GALLERY_SELECTOR:Jt,GALLERY_SELECTORS:Zt,CONTACT_PHONE_SELECTOR:Yt,ASIDE_SELLER_SELECTOR:ke,CONTENT_CONTACT_SELECTOR:Kt,AD_PRICE_SELECTOR:jt,CANONICAL_LINK_SELECTOR:qe,OFFER_TITLE_SELECTOR:qt,DESCRIPTION_SELECTOR:Wt,NEXT_DATA_SELECTOR:Gt}},cn=new Map;function dn(e){cn.set(e.siteId,e)}function un(e){return cn.get(e)}function fn(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?un("standvirtual-pt")||ln:un("olx-pt")||Ht}dn(Ht),dn(ln);async function Eo(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let r=null;for(const o of n)try{const i=new Blob([e],{type:o});return await createImageBitmap(i)}catch(i){r=i}try{const o=new Blob([e]);return await createImageBitmap(o)}catch(o){throw r||o}}function So(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const r=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:r,width:t.width,height:t.height}}const Xe=new Map;function Je(){return typeof GM<"u"&&GM!=null}async function pn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):Je()&&typeof GM.getValue=="function"?GM.getValue(e,t):Xe.has(e)?Xe.get(e):t}async function mn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(Je()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}Xe.set(e,t)}async function Lo(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(Je()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function gn(e){const{method:t,url:n,responseType:r="arraybuffer",headers:o,signal:i}=e;return new Promise((a,s)=>{if(i?.aborted){s(new DOMException("Aborted","AbortError"));return}let l=null;const u=()=>{try{l?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",u,{once:!0}),(d=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){l=GM.xmlHttpRequest(d);return}if(typeof GM_xmlhttpRequest=="function"){l=GM_xmlhttpRequest(d);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:r,headers:o,onload(d){i?.removeEventListener("abort",u);const f=d.status;if(f<200||f>=300){s(new Error(`HTTP ${f} for ${n}`));return}a(d.response)},onerror(){i?.removeEventListener("abort",u),s(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",u),s(new Error(`Timeout for ${n}`))}})})}async function ko(e,t={}){const{signal:n,request:r=gn}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await r({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:o}}function Ao(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),r=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),o=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),a=Math.max(1,o-n),s=Math.max(1,i-r),l=document.createElement("canvas");l.width=e.width,l.height=e.height;const u=l.getContext("2d");return u.putImageData(e,0,0),u.getImageData(n,r,a,s)}function _o(e,t,n){const r=document.createElement("canvas");r.width=e.width,r.height=e.height,r.getContext("2d").putImageData(e,0,0);const o=document.createElement("canvas");o.width=n,o.height=t;const i=o.getContext("2d");i.drawImage(r,0,0,n,t);const{data:a}=i.getImageData(0,0,n,t),s=new Uint8Array(1*t*n*3);let l=0;for(let u=0;u<t*n;u+=1)s[l++]=a[u*4],s[l++]=a[u*4+1],s[l++]=a[u*4+2];return s}function Io(e,t,n=[114,114,114]){const{width:r,height:o}=e,i=Math.min(t/o,t/r),a=Math.round(r*i),s=Math.round(o*i),l=(t-a)/2,u=(t-s)/2,p=Math.round(u-.1),d=Math.round(l-.1),f=document.createElement("canvas");f.width=r,f.height=o,f.getContext("2d").putImageData(e,0,0);const b=document.createElement("canvas");b.width=t,b.height=t;const v=b.getContext("2d");v.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,v.fillRect(0,0,t,t),v.drawImage(f,0,0,r,o,d,p,a,s);const c=v.getImageData(0,0,t,t).data,g=new Float32Array(3*t*t),y=t*t;for(let E=0;E<y;E+=1){const w=c[E*4],k=c[E*4+1],S=c[E*4+2];g[E]=w/255,g[y+E]=k/255,g[2*y+E]=S/255}return{tensor:g,ratio:i,pad:{dw:l,dh:u},size:t}}function Ro(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const Po="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",To="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",No="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",$o="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function hn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Po},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:To,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:No},ortWasmBaseUrl:$o}}const Re={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let bn=null;function Do(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function Ze(){const e=Do();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const yn=new Proxy({},{get(e,t){return Ze()[t]}});function Mo(){const e=Ze(),t=hn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function vn(e,t={}){Mo();const n=Ze(),r=t.prefer||["webgpu","wasm"],o=[];for(const i of r)try{const a=await n.InferenceSession.create(e,{executionProviders:[i]});return bn=i,{session:a,provider:i}}catch(a){o.push(`${i}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Qe(){return bn}const et=384,Oo="images",Bo="output0";async function Fo(e,t,n={}){const r=n.confThresh??.4,{tensor:o,ratio:i,pad:a}=Io(t,et),s=new yn.Tensor("float32",o,[1,3,et,et]),l=await e.run({[Oo]:s}),u=l[Bo]||Object.values(l)[0];if(!u)return[];const p=u.data,d=u.dims||[],f=d.length>=2?d[d.length-1]:7,h=Math.floor(p.length/f),b=[];for(let v=0;v<h;v+=1){const c=v*f,g=p[c+1],y=p[c+2],E=p[c+3],w=p[c+4],k=p[c+5],S=p[c+6];if(S<r)continue;const I=Ro({x1:g,y1:y,x2:E,y2:w},i,a);b.push({...I,score:Number(S),classId:Number(k)})}return b.sort((v,c)=>c.score-v.score),b}function Vo(e,t,n=Re){const r=n.alphabet,o=n.maxPlateSlots,i=r.length,a=e,s=[],l=[];for(let p=0;p<o;p+=1){let d=0,f=-1/0;for(let h=0;h<i;h+=1){const b=Number(a[p*i+h]);b>f&&(f=b,d=h)}s.push(r[d]),l.push(f)}let u=s.join("");return n.padChar&&(u=u.replace(new RegExp(`${zo(n.padChar)}+$`),"")),{text:u,charProbs:l.slice(0,Math.max(u.length,1))}}function zo(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Uo(e,t){const{imgHeight:n,imgWidth:r}=Re,o=_o(t,n,r),i=new yn.Tensor("uint8",o,[1,n,r,3]),a=await e.run({input:i}),s=a.plate||Object.values(a)[0],l=s.dims||[1,Re.maxPlateSlots,Re.alphabet.length],u=l[l.length-1],d=l[l.length-2]*u,f=s.data,h=f.length>=d?f.slice(0,d):f;return Vo(h)}const ge="[A-Z]",he="[0-9]",Ho=[{id:"LLDDDD",re:new RegExp(`^${ge}{2}${he}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${he}{4}${ge}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${he}{2}${ge}{2}${he}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${ge}{2}${he}{2}${ge}{2}$`)}],Go={0:"O",1:"I",5:"S",8:"B"},qo={O:"0",I:"1",L:"1",S:"5",B:"8"};function Pe(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function le(e){const t=Pe(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function jo(e){const t=Pe(e);if(t.length!==6)return null;for(const n of Ho)if(n.re.test(t))return n.id;return null}function tt(e,t){const n=Pe(e).slice(0,6).split("");if(n.length!==6)return[];const r=[];function o(i,a,s){if(a>t)return;if(i===6){const d=s.join(""),f=jo(d);f&&r.push({plate:d,corrections:a,patternId:f});return}if(o(i+1,a,s),a>=t)return;const l=s[i],u=Go[l];if(u){const d=s.slice();d[i]=u,o(i+1,a+1,d)}const p=qo[l];if(p){const d=s.slice();d[i]=p,o(i+1,a+1,d)}}return o(0,0,n),r.sort((i,a)=>i.corrections-a.corrections||a.plate.localeCompare(i.plate)),r}function xn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let r=0;for(let o=0;o<n;o+=1)r+=e[o]??0;return r/n}function Wo(e,t=[],n={}){const r=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,i=Pe(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:le(i),patternId:null,corrections:0,meanConfidence:xn(t,i.length),reason:"too-short"};const a=i.slice(0,6),s=xn(t,6),l=tt(a,0);if(l.length>0&&s>=r){const d=l[0];return{accepted:!0,plate:d.plate,plateFormatted:le(d.plate),patternId:d.patternId,corrections:0,meanConfidence:s}}const u=tt(a,1).filter(d=>d.corrections===1);if(u.length>0&&s>=o){const d=u[0];return{accepted:!0,plate:d.plate,plateFormatted:le(d.plate),patternId:d.patternId,corrections:1,meanConfidence:s}}return tt(a,2).some(d=>d.corrections>1)&&l.length===0&&u.length===0?{accepted:!1,plate:a,plateFormatted:le(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:l.length>0||u.length>0?{accepted:!1,plate:a,plateFormatted:le(a),patternId:null,corrections:l.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:le(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const J="models",Ko=1;let Te=null;function nt(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Te||(Te=new Promise((e,t)=>{const n=indexedDB.open(mt,Ko);n.onupgradeneeded=()=>{const r=n.result;r.objectStoreNames.contains(J)||r.createObjectStore(J,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Te)}async function Cn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function Yo(e){const t=await nt();return new Promise((n,r)=>{const i=t.transaction(J,"readonly").objectStore(J).get(e);i.onsuccess=()=>{const a=i.result;n(a?.bytes||null)},i.onerror=()=>r(i.error)})}async function Xo(e,t,n){const r=await nt();return new Promise((o,i)=>{const a=r.transaction(J,"readwrite");a.objectStore(J).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>o(),a.onerror=()=>i(a.error)})}async function Jo(){const e=await nt();return new Promise((t,n)=>{const r=e.transaction(J,"readwrite");r.objectStore(J).clear(),r.oncomplete=()=>t(),r.onerror=()=>n(r.error)})}async function wn(e,t={}){const{onStatus:n,signal:r}=t,o=await Yo(e.id).catch(()=>null);if(o&&await Cn(o)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await gn({method:"GET",url:e.url,responseType:"arraybuffer",signal:r}),a=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const s=await Cn(a);if(s!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${s}`);return await Xo(e.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let be=null;async function Zo(e={}){if(be)return{sessions:be,diagnostics:{provider:Qe(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=hn(),n=await wn(t.detector,e),r=await wn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const o=await vn(n.bytes),i=await vn(r.bytes);return be={detector:o.session,ocr:i.session},{sessions:be,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:r.cacheHit}}}function Qo(){be=null}async function er(e,t,n={}){const{signal:r}=n;let o=0,i;try{const s=await Eo(t);i=So(s).imageData,s.close?.()}catch{return null}const a=await Fo(e.detector,i);for(const s of a){if(r?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const l=Ao(i,s),u=await Uo(e.ocr,l),p=Wo(u.text,u.charProbs);if(p.accepted)return{plate:p.plate,plateFormatted:p.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function tr(e,t={}){const n=Date.now(),{onStatus:r,signal:o,request:i}=t,a=e.length,s=await Zo({onStatus:r,signal:o}),{detector:l,ocr:u}=s.sessions;let p=0,d=0;for(let f=0;f<a;f+=1){if(o?.aborted)return Ne("cancelled",s.diagnostics,d,p,n);const h=e[f];r?.(`Downloading image ${f+1} of ${a}`);let b;try{b=await ko(h,{signal:o,request:i})}catch(c){if(o?.aborted||c?.name==="AbortError")return Ne("cancelled",s.diagnostics,d,p,n);r?.(`Failed to download image ${f+1} of ${a}, skipping…`);continue}r?.(`Scanning image ${f+1} of ${a}`),d+=1;let v;try{v=await er({detector:l,ocr:u},b.bytes,{signal:o})}catch(c){if(o?.aborted||c?.name==="AbortError")return Ne("cancelled",s.diagnostics,d,p,n);continue}finally{b=null}if(v&&(p+=v.detectionsTried,v.plate))return{ok:!0,plate:v.plate,plateFormatted:v.plateFormatted,diagnostics:{provider:Qe()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:d,detectionsTried:p,elapsedMs:Date.now()-n}}}return Ne("no-reliable-plate",s.diagnostics,d,p,n)}function Ne(e,t,n,r,o){return{ok:!1,reason:e,diagnostics:{provider:Qe()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:r,elapsedMs:Date.now()-o}}}async function En(e){return await Lo(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Sn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function Ln({plate:e,phone:t,fallbackId:n}={}){const r=e==null?"":String(e).trim();if(r)return{id:r,isRandom:!1};const o=t==null?"":String(t).trim();if(o)return{id:o,isRandom:!1};const i=n==null?"":String(n).trim();return i?{id:i,isRandom:!0}:{id:Sn(),isRandom:!0}}function kn(e={}){return Ln(e).id}function nr(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function or(e,{phone:t="",fallbackId:n=""}={}){const r=e||{},o=t==null?"":String(t).trim(),i=r.plate==null?"":String(r.plate).trim(),s=[`ID: ${kn({plate:i,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const u of Ve){if(u==="url")continue;const p=ht[u];let d=r[u]==null?"":String(r[u]);u==="customerValueEur"&&d&&!/€/.test(d)&&(d=`${d} €`),s.push(`${p}: ${d}`)}const l=r.url==null?"":String(r.url);return s.push(""),s.push(l),s.join(`
`)}const ot="<<<LEAD_CLIP_V1>>>",An="<<<END_LEAD_CLIP>>>";function rr(e,t={}){const n=e?.fields||{},r=e?.source||{},o=t.phone==null?"":String(t.phone).trim();return{v:1,id:kn({plate:n.plate,phone:o,fallbackId:t.fallbackId}),phone:o,plate:String(n.plate||""),clientName:String(n.clientName||r.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||r.url||""),siteId:String(r.siteId||""),title:String(r.title||""),description:Le(r.description||"")}}function ir(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${ot}
${n}
${An}
`}function ar(e){const t=String(e||""),n=t.indexOf(ot);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const r=n+ot.length,o=t.indexOf(An,r);if(o<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(r,o).trim(),a=t.slice(0,n).replace(/\s+$/,"");try{const s=JSON.parse(i);return!s||s.v!==1||typeof s!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:s,humanText:a}}catch(s){return{ok:!1,error:s instanceof Error?s.message:"JSON parse failed"}}}const sr="listingCache",lr=2880*60*1e3;function _n(){return`${xe}${sr}`}function rt(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function cr(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,r]of Object.entries(e))typeof n=="string"&&n&&rt(r)&&(t[n]={processedAt:r.processedAt,phone:r.phone,clipboard:r.clipboard,fallbackId:typeof r.fallbackId=="string"?r.fallbackId:"",listingRecord:r.listingRecord});return t}async function dr(){const e=await pn(_n(),{});return cr(e)}async function it(e){await mn(_n(),e)}async function at(e=Date.now()){const t=await dr(),n={};let r=!1;for(const[o,i]of Object.entries(t))e-i.processedAt<=lr?n[o]=i:r=!0;return(r||Object.keys(n).length!==Object.keys(t).length)&&await it(n),n}async function ur(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const o=(await at(t))[n];return o&&rt(o)?o:null}async function fr(e,t,n=Date.now()){const r=typeof e=="string"?e.trim():"";if(!r||!rt(t))return null;const o=await at(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return o[r]=i,await it(o),i}async function pr(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const r=await at(t);return n in r?(delete r[n],await it(r),!0):!1}const In="valuationDefaults";async function mr(e,t=null){return pn(`${xe}${e}`,t)}async function gr(e,t){await mn(`${xe}${e}`,t)}async function Rn(){const e=await mr(In,null);return!e||typeof e!="object"?{...we}:{...we,...e}}async function hr(e){const t={...we,...e};return await gr(In,t),t}function st(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function br(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):st(t)?Promise.resolve("visible"):new Promise(r=>{const o=()=>{a(),r("cancelled")},i=()=>{st(t)&&(a(),r("visible"))},a=()=>{t.removeEventListener("visibilitychange",i),n?.removeEventListener("abort",o)};t.addEventListener("visibilitychange",i),n&&n.addEventListener("abort",o,{once:!0})})}const yr=5e3;function vr(){let e=gt(),t=null,n=null,r=null,o="",i=0;function a(m){m&&t?.setCaptureStatus(m)}function s(m){e={...e,statusMessage:m},t?.setStatus(m);const x=String(m||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);x&&a(`analisando imagem ${x[1]} de ${x[2]}`)}function l(){try{const m=fn().extractListing(document);if(m?.url)return j(m.url)}catch{}return typeof location<"u"&&location?.href?j(location.href):""}function u(m={}){const x=m.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",R=m.phone??e.lastPhone??"",N=m.fallbackId??e.fallbackId??"",D=!!String(x).trim(),U=!!String(R).trim();if(!D&&!U&&!String(N).trim()){t?.setClipboardId({id:"",isRandom:!1,hasPlate:!1,hasPhone:!1});return}t?.setClipboardId({...Ln({plate:x,phone:R,fallbackId:N}),hasPlate:D,hasPhone:U})}function p(m,x){const R=x.listingRecord,N=x.phone||"",D=R?.fields?.plate||"",O=!String(D).trim()&&!String(N).trim()&&(x.fallbackId||nr(x.clipboard))||"";o=m,i=x.processedAt,e={...e,lastPlate:D,lastPhone:N,lastClipboard:x.clipboard||"",fallbackId:O,listingRecord:R,view:"form"},t?.showListingForm(R,{phone:N}),t?.setCopyEnabled(!!x.clipboard),t?.setCopyLabel("Copy"),u({plate:D,phone:N,fallbackId:O}),a("ready to copy"),s("Ready to copy")}function d(m,x=""){const R=m?.fields?.plate||"",N=x==null?"":String(x).trim();let D=e.fallbackId||"";!String(R).trim()&&!N&&(D||(D=Sn()),e={...e,fallbackId:D});const U=or(m.fields,{phone:N,fallbackId:e.fallbackId}),O=rr(m,{phone:N,fallbackId:e.fallbackId});return ir(U,O)}async function f(m){const x=o||j(m.listingRecord?.fields?.url||"")||l();if(!x||!m.listingRecord||!m.clipboard)return;const R=m.processedAt??i??Date.now();o=x,i=R,await fr(x,{processedAt:R,phone:m.phone??e.lastPhone??"",clipboard:m.clipboard,fallbackId:m.fallbackId??e.fallbackId??"",listingRecord:m.listingRecord})}async function h(){try{const m=l();if(m){const x=await ur(m);if(x){if(yt(x.listingRecord,{plate:x.listingRecord?.fields?.plate,phone:x.phone})){p(m,x);return}await pr(m)}}}catch{}v()}function b(){r!=null&&(clearTimeout(r),r=null)}function v(){b(),a("waiting"),r=setTimeout(()=>{r=null,k()},yr)}function c(m){e={...e,busy:m,view:m?"reading":e.listingRecord?"form":"idle"},t?.setBusy(m),m&&a("reading")}function g(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const m=e.lastDiagnostics;if(!m){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${m.provider||"n/a"}`,`Detector cache: ${m.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${m.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${m.imagesScanned??0}`,`Detections tried: ${m.detectionsTried??0}`,`Elapsed: ${m.elapsedMs??0} ms`].join(`
`))}function y(m,x,R){const N=[];return x.plate?N.push(`Plate found: ${x.plate}`):N.push("No reliable plate found."),x.phone&&N.push(`Phone: ${x.phone}`),(m.fields.make||m.fields.model)&&N.push(`Listing: ${[m.fields.make,m.fields.model].filter(Boolean).join(" ")}`.trim()),N.push(R),N.join(`
`)}function E(m){e={...e,lastClipboard:m},t?.setCopyEnabled(!!m)}async function w(m){return E(m),En(m)}async function k(){if(b(),e.busy)return;n=new AbortController;const{signal:m}=n;c(!0);try{const x=fn(),R=await Rn();s("Extracting listing fields…");const N=x.extractListing(document);s("Looking for listing images…");const D=await x.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:U,count:O}=D;let Q={ok:!1,reason:"no-images"};if(O>0?(s(`Found ${O} listing images — scanning…`),s("Loading plate recognition models…"),Q=await tr(U,{signal:m,onStatus:s}),e={...e,lastDiagnostics:Q.diagnostics},g()):s("No listing images — waiting for phone…"),m.aborted||Q.reason==="cancelled"){s("Cancelled.");return}if(st()||(a("waiting for tab"),s("Waiting for this tab to extract phone…")),await br({signal:m})==="cancelled"||m.aborted){s("Cancelled.");return}s("Waiting for phone button…");const oe=await x.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,buttonAppearDelayMs:2e3,buttonAppearAttempts:2,signal:m}),K=Q.ok&&Q.plate?Q.plate:"",V=oe.ok?oe.phone:"";if(m.aborted){s("Cancelled.");return}const Y=Bn({extracted:N,plate:K,defaults:R});if(e={...e,lastPlate:K,lastPhone:V,fallbackId:"",listingRecord:Y,view:"form"},t?.showListingForm(Y,{phone:V}),!yt(Y,{plate:K,phone:V})){E(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),a("No data found."),s("No data found.");return}const Oe=d(Y,V);E(Oe),t?.setCopyLabel("Copy"),u({plate:K,phone:V,fallbackId:e.fallbackId}),a("ready to copy"),o=j(Y.fields.url||"")||l(),i=Date.now(),await f({clipboard:Oe,phone:V,listingRecord:Y,processedAt:i,fallbackId:e.fallbackId});let ue=y(Y,{plate:K,phone:V},"Ready to copy");K&&!V&&oe.reason==="timeout"?ue+=`
Phone reveal timed out.`:K&&!V&&oe.reason==="no-button"&&(ue+=`
No phone button on this listing.`),O===0&&!V&&oe.reason==="no-button"&&(ue+=`
No listing images found.`),s(ue)}catch(x){if(m.aborted){s("Cancelled.");return}const R=x instanceof Error?x.message:"Unknown recognition error";s(`Failed: ${R}`)}finally{n=null,c(!1)}}function S(){n?.abort()}async function I(){let m=e.lastClipboard;if(e.listingRecord&&(m=d(e.listingRecord,e.lastPhone),e={...e,lastClipboard:m},t?.setCopyEnabled(!!m)),!m){s("Nothing to copy yet.");return}const x=await En(m);x.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await f({clipboard:m,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(x.ok?"Data copied":"Clipboard copy failed.")}async function A(){if(!e.listingRecord){s("No listing to copy yet. Run Clip listing.");return}const m=d(e.listingRecord,e.lastPhone),x=await w(m);x.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),await f({clipboard:m,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(x.ok?"Data copied":"Clipboard copy failed.")}async function P(){const m=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!m){s("No plate to copy.");return}const x=await w(m);s(x.ok?`Plate copied: ${m}`:"Clipboard copy failed.")}function L(m,x){if(m==="phone"){e={...e,lastPhone:x==null?"":String(x)},u();return}if(!e.listingRecord)return;const R=Fn(e.listingRecord,m,x);e={...e,listingRecord:R,lastPlate:m==="plate"?x:e.lastPlate},m==="plate"&&u()}async function M(){try{await Jo(),Qo(),s("Model cache cleared.")}catch(m){const x=m instanceof Error?m.message:"Failed to clear cache";s(x)}}function G(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},g(),s(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function B(){if(e.busy)return;const m=await Rn();e={...e,view:"settings"},t?.showSettingsForm(m),s(`Settings. Environment: production. Storage: ${xe}* / ${mt}.`)}function F(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),s("Back to listing review.")):(t?.hideForm(),s("Settings closed."))}async function $(m){await hr(m),s("Defaults saved.")}function Z(m=document.body){return t||(t=Un({onClipListing:k,onCancel:S,onCopyAgain:I,onClearModelCache:M,onToggleDiagnostics:G,onSettings:B,onFieldChange:L,onCopyFullText:A,onCopyPlateOnly:P,onSettingsBack:F,onSaveDefaults:$}),t.mount(m),t.setMinimized(!0),h(),t)}function W(){b(),n?.abort(),n=null,t?.destroy(),t=null,o="",i=0,e=gt()}function ft(){return e}return{mount:Z,destroy:W,onClipListing:k,onCancel:S,onCopyAgain:I,onCopyFullText:A,onCopyPlateOnly:P,onFieldChange:L,onClearModelCache:M,onToggleDiagnostics:G,onSettings:B,onSettingsBack:F,onSaveDefaults:$,getState:ft,setStatus:s}}function Pn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?xr(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function xr(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const te="/api";async function ne(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),r=await n.text();let o=null;try{o=r?JSON.parse(r):null}catch{o=r}return{ok:n.ok,status:n.status,data:o}}async function Cr(){return ne(`${te}/auth/me`)}async function wr(){return ne(`${te}/get_user_local`)}async function ye(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),ne(`${te}/lead-clients?${t.toString()}`)}async function Er(e){return ne(`${te}/purchase-leads/clients/${e}?page=1`)}async function Sr(e){return ne(`${te}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function Lr(e){return ne(`${te}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function $e(e,t=null){return ne(`${te}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function kr(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),r=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const o=await fetch(r,{credentials:"include"});if(!o.ok)return[];const i=await o.json();return Array.isArray(i)?i:i?.data||i?.results||[]}catch{return[]}}const H={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function ce(e){return String(e||"").replace(/\D/g,"")}function de(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function z(e,t){return[{label:e,value:t}]}function De(e,t=""){const n=Array.isArray(e)?e:[],r=t.trim().toLowerCase();if(r){const o=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(r));if(o)return{label:o.label??o.nombre??o.name,value:o.value??o.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function lt(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:null,secondSurname:null}:t.length===1?{name:t[0],firstSurname:null,secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function Ar(e){const t=ce(e.phone),{name:n,firstSurname:r,secondSurname:o}=lt(e.clientName);return{name:n,firstSurname:r,secondSurname:o,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function _r(e){const{clip:t,clientId:n,me:r,localId:o,filters:i={},vehicle:a={}}=e,s=ce(t.phone),l=de(t.plate),u=r?.id??0,p=Array.isArray(r?.rolesId)?r.rolesId:[6],{name:d,firstSurname:f,secondSurname:h}=lt(t.clientName),b=i.estado||H.estado,v=i.origen||H.origen,c=i.contacto||H.forma_contacto,g=i.marca||H.marca_comercial,y=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,E=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),w=Number(E.replace(",","."))||null,k=a.makeLabel||t.make||"",S=a.modelLabel||t.model||"",I=Number(t.year)||null,A=a.fuelLabel||Tn(t.fuel),P=a.transmissionLabel||Nn(t.transmission);return{data:{toggle:!1,nombre:d,telefono1:s||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:z(b.label,b.value),origen:z(v.label,v.value),forma_contacto:z(c.label,c.value),marca_comercial:z(g.label,g.value),email:null,telefono2:null,apellido1:f,apellido2:h,kilometros:y,importado:!1,matricula:l||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:w,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:A?z(A,a.fuelValue??A):null,ccambios:P?z(P,a.transmissionValue??P):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:u,id_agente_modify:u,rol:p,vehiculo:{marca_vehiculo:k?z(k,a.makeValue??k):[],modelo:S?z(S,a.modelValue??S):[],matriculacion:I?z(I,I):[],combustible:A?z(A,a.fuelValue??A):[],ccambios:P?z(P,a.transmissionValue??P):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:o||H.id_local_actual}}function Me(e,t=""){const n=Array.isArray(e)?e:[],r=String(t||"").trim().toLowerCase();if(!r)return null;const o=l=>String(l?.label??l?.nombre??l?.name??"").trim(),i=l=>l?.value??l?.id,a=n.find(l=>o(l).toLowerCase()===r);if(a)return{label:o(a),value:i(a)};const s=n.find(l=>{const u=o(l).toLowerCase();return u.includes(r)||r.includes(u)});return s?{label:o(s),value:i(s)}:null}async function Ir(e,t){const n={};if(!e?.make||typeof t!="function")return n;const r=await t("makes"),o=Me(r,e.make);if(!o)return n;if(n.makeLabel=o.label,n.makeValue=o.value,e.model){const i=await t("models",{makeId:String(o.value)}),a=Me(i,e.model);if(a){n.modelLabel=a.label,n.modelValue=a.value;const s=String(e.year||"").trim();if(s){const l=Tn(e.fuel);if(l){const u=await t("fuels",{makeId:String(o.value),modelId:String(a.value),year:s}),p=Me(u,l);if(p){n.fuelLabel=p.label,n.fuelValue=p.value;const d=Nn(e.transmission);if(d){const f=await t("transmissions",{makeId:String(o.value),modelId:String(a.value),year:s,fuelId:String(p.value)}),h=Me(f,d);h&&(n.transmissionLabel=h.label,n.transmissionValue=h.value)}}}}}}return n}function Tn(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function Nn(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const Rr="LeadDeskDB",Pr=["Audi","BMW","Citroën","Fiat","Ford","Honda","Hyundai","Kia","Mercedes-Benz","Nissan","Opel","Peugeot","Renault","Seat","Skoda","Toyota","Volkswagen","Volvo"],Tr=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],Nr=["Manual","Automática"];function ct(e,t,n){const r=String(t||"").trim();if(!r)return"";const o=e.find(s=>s===r);if(o)return o;const i=r.toLowerCase(),a=e.find(s=>s.toLowerCase()===i);if(a)return a;if(n){const s=n(r);if(s&&e.includes(s))return s}return r}function $r(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function Dr(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function Mr(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function Or(e){return String(e||"").replace(/\D/g,"")}function dt(){return new Promise((e,t)=>{const n=indexedDB.open(Rr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function Br(e){const t=await dt();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((l,u)=>String(u.updatedAt).localeCompare(String(l.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}async function Fr(e){const t=await dt();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((l,u)=>String(u.updatedAt).localeCompare(String(l.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}function $n(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function Vr(e){const t=await dt(),n=new Date().toISOString(),r=Or(e.phone),o=Mr(e.plate),i=$n("client"),a=$n("lead"),{name:s,firstSurname:l,secondSurname:u}=lt(e.clientName),p=l||"",d=u||"",f={id:i,firstName:s,firstSurname:p,secondSurname:d,phone:r,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:r,createdAt:n,updatedAt:n},h={id:a,clientId:i,plate:o,plateNormalized:o,phone:r,phoneNormalized:r,fullName:s,firstSurname:p,secondSurname:d,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:ct(Pr,e.make||""),model:e.model||"",year:e.year||"",fuel:ct(Tr,e.fuel||"",$r),transmission:ct(Nr,e.transmission||"",Dr),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((b,v)=>{const c=t.transaction(["clients","leads"],"readwrite");c.objectStore("clients").put(f),c.objectStore("leads").put(h),c.oncomplete=()=>b(void 0),c.onerror=()=>v(c.error)}),a}const zr=`
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
`;function Ur(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=zr;const o=document.createElement("div");o.className="lcf-panel";const i=document.createElement("div");i.className="lcf-header";const a=document.createElement("div");a.className="lcf-title",a.textContent="CRM · Leads";const s=document.createElement("span");s.className="lcf-badge",s.textContent="CRM";const l=document.createElement("button");l.type="button",l.className="lcf-mini",l.textContent="–",i.append(a,s,l);const u=document.createElement("div");u.className="lcf-body";const p=document.createElement("div");p.className="lcf-hint",p.textContent="Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia a área de transferência. Com dados válidos, a verificação do cadastro corre automaticamente.";const d=document.createElement("textarea");d.className="lcf-textarea",d.placeholder="Cole aqui o texto do Clipper…";const f=document.createElement("div");f.className="lcf-summary",f.hidden=!0;const h=document.createElement("div");h.className="lcf-section-label",h.textContent="Leads encontrados",h.hidden=!0;const b=document.createElement("ul");b.className="lcf-matches";const v=document.createElement("div");v.className="lcf-row";const c=document.createElement("button");c.type="button",c.className="lcf-btn",c.textContent="Ler área de transferência";const g=document.createElement("button");g.type="button",g.className="lcf-btn",g.textContent="Analisar texto";const y=document.createElement("button");y.type="button",y.className="lcf-btn lcf-btn-primary",y.textContent="Verificar cadastro",y.disabled=!0,v.append(c,g,y);const E=document.createElement("div");E.className="lcf-row";const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-danger",w.textContent="Criar lead",w.disabled=!0,w.hidden=!0,E.append(w);const k=document.createElement("div");k.className="lcf-status",k.dataset.tone="",k.textContent="Aguardando dados do anúncio.",u.append(p,d,f,h,b,v,E,k),o.append(i,u),n.append(r,o),document.documentElement.append(t);let S=!1;l.addEventListener("click",()=>{S=!S,u.hidden=S,l.textContent=S?"+":"–"});let I=!1,A=0,P=0;return i.addEventListener("pointerdown",L=>{if(L.target===l)return;I=!0;const M=o.getBoundingClientRect();A=L.clientX-M.left,P=L.clientY-M.top,i.setPointerCapture(L.pointerId)}),i.addEventListener("pointermove",L=>{I&&(o.style.left=`${L.clientX-A}px`,o.style.top=`${L.clientY-P}px`,o.style.right="auto",o.style.bottom="auto")}),i.addEventListener("pointerup",()=>{I=!1}),c.addEventListener("click",()=>e.onReadClipboard()),g.addEventListener("click",()=>e.onParseText(d.value)),d.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(d.value),0)}),y.addEventListener("click",()=>e.onVerify()),w.addEventListener("click",()=>e.onCreate()),{setBadge(L){s.textContent=L},setStatus(L,M=""){k.textContent=L,k.dataset.tone=M||""},setText(L){d.value=L},getText(){return d.value},setSummary(L){if(!L){f.hidden=!0,f.textContent="";return}f.hidden=!1,f.innerHTML=L},setVerifyEnabled(L){y.disabled=!L},setCreateVisible(L,M=!0){w.hidden=!L,w.disabled=!M},setMatches(L,M){b.replaceChildren(),h.hidden=L.length===0;for(const G of L){const B=document.createElement("li"),F=document.createElement("div");F.className="lcf-match";const $=document.createElement("div");$.className="lcf-match-title",$.textContent=G.title;const Z=document.createElement("div");Z.className="lcf-match-sub",Z.textContent=G.subtitle;const W=document.createElement("button");W.type="button",W.className="lcf-match-open",W.textContent="Abrir lead →",W.addEventListener("click",()=>M(G.id)),F.append($,Z,W),B.append(F),b.append(B)}},clearMatches(){b.replaceChildren(),h.hidden=!0},destroy(){t.remove()}}}function Hr(){let e=null,t=null,n=!1,r=null;function o(){const c=Pn();return t?.setBadge(c.label),c}function i(c){const g=ar(c);return t?.clearMatches(),t?.setCreateVisible(!1),g.ok?(e=g.payload,t?.setText(c),t?.setVerifyEnabled(!0),t?.setSummary([`<div><strong>ID</strong> ${ve(e.id)}</div>`,`<div><strong>Placa</strong> ${ve(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${ve(e.phone||"—")}</div>`,`<div><strong>Veículo</strong> ${ve([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${ve(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0):(e=null,t?.setSummary(null),t?.setVerifyEnabled(!1),t?.setStatus(`Falha ao analisar o texto: ${g.error}`,"error"),!1)}async function a(){try{const c=await navigator.clipboard.readText();t?.setText(c),i(c)&&await l()}catch(c){const g=c instanceof Error?c.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${g}). Cole o texto e use Analisar texto.`,"warn")}}async function s(c){i(c)&&await l()}async function l(){if(!e||n)return;if(o().backend==="leaddesk"){await u();return}await p()}async function u(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const c=de(e.plate),g=ce(e.phone);let y=[];if(c&&(y=await Br(c)),y.length===0&&g&&(y=await Fr(g)),!c&&!g){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(y.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const E=y.map(w=>({id:w.id,title:`Lead ${w.plate||w.id}`,subtitle:`${w.phone||"—"} · ${[w.make,w.model,w.year].filter(Boolean).join(" · ")||"—"} · ${w.leadStatus||""} · ${w.updatedAt||""}`.trim()}));t?.setMatches(E,w=>{location.assign(`/crm/leads/${w}`)}),t?.setStatus(E.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":`${E.length} leads encontrados. Use Abrir lead ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(c){const g=c instanceof Error?c.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${g}`,"error")}finally{n=!1}}async function p(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const c=de(e.plate),g=ce(e.phone);let y;if(c)y=await ye({plate:c}),y.ok&&Array.isArray(y.data)&&y.data.length===0&&g&&(y=await ye({phone:g}));else if(g)y=await ye({phone:g});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!y.ok){t?.setStatus(`Falha na verificação (HTTP ${y.status}). Está autenticado no CRM?`,"error");return}const E=Array.isArray(y.data)?y.data:[];if(E.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const w=[];for(const S of E){const I=S?.purchaseLead?.id;if(I)w.push({id:I,title:`Lead #${I}`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""} · ${S.purchaseLead?.statusName||""}`.trim()});else if(S?.id){const P=(await Er(S.id)).data?.results||[];for(const L of P)w.push({id:L.id,title:`Lead #${L.id}`,subtitle:`Placa ${L.plate||"—"} · ${L.status?.name||""} · ${L.lastAction||""}`.trim()});P.length===0&&w.push({id:`client:${S.id}`,title:`Cliente #${S.id} (sem lead de compra)`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""}`.trim()})}}const k=w.filter(S=>String(S.id).match(/^\d+$/));t?.setMatches(k.length?k:w,S=>{if(String(S).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}location.assign(`/main/lead-tasacion/${S}`)}),t?.setStatus(k.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":k.length>1?`${k.length} leads encontrados. Use Abrir lead ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",k.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(c){const g=c instanceof Error?c.message:"erro";t?.setStatus(`Erro na verificação: ${g}`,"error")}finally{n=!1}}async function d(){if(!e||n)return;if(o().backend==="leaddesk"){await f();return}await h()}async function f(){if(!ce(e.phone)&&!de(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}n=!0,t?.setStatus("Criando no LeadDesk…");try{const g=await Vr(e);t?.setStatus(`Lead ${g} criado. Abrindo a página…`,"ok"),location.assign(`/crm/leads/${g}`)}catch(g){const y=g instanceof Error?g.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${y}`,"error")}finally{n=!1}}async function h(){const c=ce(e.phone);if(!c&&!de(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar cliente/lead no CRM com os dados copiados?")){n=!0,t?.setStatus("Criando no CRM…");try{const g=await Cr();if(!g.ok||!g.data?.id){t?.setStatus(`Falha de autenticação (HTTP ${g.status}). Faça login no CRM.`,"error");return}const y=g.data,E=await wr(),w=Array.isArray(E.data)&&E.data[0]?.value||H.id_local_actual,[k,S,I,A]=await Promise.all([$e("estado_lead_compra"),$e("origen_lead_compra"),$e("contacto"),$e("marcas_comerciales",y.id)]),P={estado:De(k.data,"Avaliação")||H.estado,origen:De(S.data,"Captación")||H.origen,contacto:De(I.data,"Whatsapp")||H.forma_contacto,marca:De(A.data,"")||H.marca_comercial};let L=null;if(c){const $=await ye({phone:c});$.ok&&Array.isArray($.data)&&$.data[0]?.id&&(L=$.data[0].id)}if(!L){const $=await Sr(Ar(e));if($.status===409)L=(await ye({phone:c||void 0,plate:de(e.plate)||void 0})).data?.[0]?.id;else if($.ok&&$.data?.resourceId)L=$.data.resourceId;else{t?.setStatus(`Falha ao criar cliente (HTTP ${$.status}): ${JSON.stringify($.data)}`,"error");return}}if(!L){t?.setStatus("Não foi possível obter clientId.","error");return}const M=await Ir(e,kr),G=_r({clip:e,clientId:L,me:y,localId:w,filters:P,vehicle:M}),B=await Lr(G);if(!B.ok){t?.setStatus(`Falha create_lead_compra (HTTP ${B.status}): ${JSON.stringify(B.data)}`,"error");return}const F=B.data?.id_lead;if(!F){t?.setStatus(`Resposta inesperada: ${JSON.stringify(B.data)}`,"error");return}t?.setStatus(`Lead ${F} criado. Abrindo a página…`,"ok"),location.assign(`/main/lead-tasacion/${F}`)}catch(g){const y=g instanceof Error?g.message:"erro";t?.setStatus(`Erro ao criar: ${y}`,"error")}finally{n=!1}}}function b(){if(t)return t;t=Ur({onReadClipboard:a,onParseText:s,onVerify:l,onCreate:d}),o(),window.addEventListener("popstate",o),r=new MutationObserver(()=>o());const c=document.getElementById("app")||document.body;return c&&r.observe(c,{childList:!0,subtree:!0}),a(),t}function v(){window.removeEventListener("popstate",o),r?.disconnect(),r=null,t?.destroy(),t=null,e=null}return{mount:b,destroy:v,refreshContext:o}}function ve(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const ut="__LEAD_CRM_FILLER_INITIALIZED__",Gr="lead-crm-filler-root";function qr(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:Pn().backend!=="none"?jr():Wr()}function jr(){if(window[ut])return{started:!1,reason:"already-initialized"};if(document.getElementById(Gr))return window[ut]=!0,{started:!1,reason:"panel-exists"};window[ut]=!0;const e=Hr(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function Wr(){if(window[Fe])return{started:!1,reason:"already-initialized"};if(document.getElementById(Ce))return window[Fe]=!0,{started:!1,reason:"panel-exists"};window[Fe]=!0;const e=vr(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}qr()})();
