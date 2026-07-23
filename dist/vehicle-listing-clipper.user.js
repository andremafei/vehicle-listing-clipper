// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.2.2
// @description  Local plate recognition and vehicle listing extraction for OLX Portugal and Standvirtual. No uploads.
// @author       andremafei
// @match        https://www.olx.pt/*
// @match        https://www.standvirtual.com/*
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
(function(){"use strict";const vt="Vehicle Listing Clipper",et="vlc_prod_",Bt="vehicle-listing-clipper",Ct="__VLC_PROD_INITIALIZED__",nt="vlc-panel-root";function Ft(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const ot={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Et=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Vt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},Ht=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Qe(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function tn(t={}){return{...ot,...t}}function en({extracted:t=null,plate:e="",defaults:n={}}={}){const i=tn(n),o=Qe(),r={},a=[],s=[],g=[],f=[...t?.warnings||[]];function c(d,m,h){const p=m==null?"":String(m);if(o[d]=p,!p){r[d]="missing";return}r[d]=h,h==="extracted"||h==="anpr"?a.push(d):h==="default"&&s.push(d)}const l=e?String(e).trim():"";return c("plate",l,l?"anpr":"missing"),c("make",t?.make||"",t?.make?"extracted":"missing"),c("model",t?.model||"",t?.model?"extracted":"missing"),c("year",t?.year||"",t?.year?"extracted":"missing"),c("mileageKm",t?.mileageKm||"",t?.mileageKm?"extracted":"missing"),c("transmission",t?.transmission||"",t?.transmission?"extracted":"missing"),c("fuel",t?.fuel||"",t?.fuel?"extracted":"missing"),c("engine",t?.engine||"",t?.engine?"extracted":"missing"),c("powerCv",t?.powerCv||"",t?.powerCv?"extracted":"missing"),c("customerValueEur",t?.priceEur||"",t?.priceEur?"extracted":"missing"),c("url",t?.url||"",t?.url?"extracted":"missing"),c("paintParts",i.paintParts,"default"),c("bodyParts",i.bodyParts,"default"),c("tires",i.tires,"default"),c("saleReason",i.saleReason,"default"),c("keyCount",i.keyCount,"default"),c("deductibleVat",i.deductibleVat,"default"),{source:{siteId:t?.siteId||"olx-pt",url:o.url,listingId:t?.listingId||"",title:t?.title||"",description:t?.description||""},fields:o,origins:r,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:g,warnings:f}}}function nn(t,e,n){const i=n==null?"":String(n),o={...t.fields,[e]:i},r={...t.origins,[e]:i?"edited":"missing"},a=[...new Set([...t.metadata.editedFields||[],e])];return{...t,fields:o,origins:r,source:{...t.source,url:e==="url"?i:t.source.url},metadata:{...t.metadata,editedFields:a}}}function Gt(t){switch(t){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function on(t){let e=null;const n=new Map;let i="listing";function o(){return e||(e=document.createElement("div"),e.className="vlc-form",e.hidden=!0,e)}function r(){e&&(e.replaceChildren(),n.clear())}function a(d,m,h="missing"){const p=document.createElement("label");p.className=`vlc-field ${Gt(h)}`,p.dataset.field=d;const v=document.createElement("span");v.className="vlc-field-label",v.textContent=Vt[d]||d;const E=document.createElement("span");E.className="vlc-field-origin",E.textContent=h;const C=document.createElement("input");C.type="text",C.className="vlc-field-input",C.value=m??"",C.dataset.field=d,C.addEventListener("input",()=>{i==="listing"&&(t.onFieldChange(d,C.value),p.className=`vlc-field ${Gt("edited")}`,E.textContent="edited")}),v.appendChild(E),p.append(v,C),n.set(d,C),e?.appendChild(p)}function s(){const d=document.createElement("div");d.className="vlc-form-actions";const m=document.createElement("button");m.type="button",m.className="vlc-btn vlc-btn-primary",m.textContent="Copy full text",m.addEventListener("click",()=>t.onCopyFullText());const h=document.createElement("button");h.type="button",h.className="vlc-btn",h.textContent="Copy plate only",h.addEventListener("click",()=>t.onCopyPlateOnly());const p=document.createElement("button");p.type="button",p.className="vlc-btn",p.textContent="Copy JSON",p.addEventListener("click",()=>t.onCopyJson()),d.append(m,h,p),e?.appendChild(d)}function g(d){i="listing",o(),r(),e.hidden=!1;const m=document.createElement("div");m.className="vlc-form-heading",m.textContent="Review listing",e.appendChild(m);for(const h of Et)a(h,d.fields[h]||"",d.origins[h]||"missing");s()}function f(d){i="settings",o(),r(),e.hidden=!1;const m=document.createElement("div");m.className="vlc-form-heading",m.textContent="Default values",e.appendChild(m);for(const E of Ht)a(E,d[E]||"","default");const h=document.createElement("div");h.className="vlc-form-actions";const p=document.createElement("button");p.type="button",p.className="vlc-btn vlc-btn-primary",p.textContent="Save defaults",p.addEventListener("click",()=>{const E={};for(const C of Ht)E[C]=n.get(C)?.value??"";t.onSaveDefaults?.(E)});const v=document.createElement("button");v.type="button",v.className="vlc-btn",v.textContent="Back",v.addEventListener("click",()=>t.onBack?.()),h.append(p,v),e.appendChild(h)}function c(){e&&(e.hidden=!0)}function l(d){if(i==="listing")for(const m of Et){const h=n.get(m);h&&document.activeElement!==h&&(h.value=d.fields[m]||"")}}return{ensureRoot:o,showListing:g,showSettings:f,syncListingValues:l,hide:c,getMode:()=>i,getElement:()=>o()}}const rn=`
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
`;function an(t){let e=null,n=null,i=null,o=null,r=null,a=null,s=null,g=null,f=null,c=null,l=null,d=!0,m="waiting",h=!1,p=null,v=0,E=0,C=null;const w=on({onFieldChange:(b,x)=>t.onFieldChange(b,x),onCopyFullText:()=>t.onCopyFullText(),onCopyPlateOnly:()=>t.onCopyPlateOnly(),onCopyJson:()=>t.onCopyJson(),onBack:()=>t.onSettingsBack(),onSaveDefaults:b=>t.onSaveDefaults(b)});function A(){o&&(o.textContent=d?m:vt)}const k='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',R='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function T(){!n||!l||(n.classList.toggle("vlc-panel--minimized",d),l.innerHTML=d?k:R,l.setAttribute("aria-label",d?"Expand panel":"Minimize panel"),l.title=d?"Expand":"Minimize",A())}function H(b){d=!!b,T()}function J(){H(!d)}function mt(b){m=b,A()}function ht(){f&&(f.disabled=!h),c&&(c.disabled=!h)}function bt(b,x){if(!n)return;const S=n.getBoundingClientRect(),_=Math.max(0,window.innerWidth-S.width),F=Math.max(0,window.innerHeight-S.height),V=Math.min(Math.max(0,b),_),M=Math.min(Math.max(0,x),F);n.style.left=`${V}px`,n.style.top=`${M}px`,n.style.right="auto",n.style.bottom="auto"}function X(b){if(!n||!i||b.target?.closest("button")||b.button!==0)return;const S=n.getBoundingClientRect();p=b.pointerId,v=b.clientX-S.left,E=b.clientY-S.top,i.classList.add("vlc-header--dragging"),i.setPointerCapture(b.pointerId),b.preventDefault()}function Z(b){p===b.pointerId&&bt(b.clientX-v,b.clientY-E)}function G(b){p===b.pointerId&&(p=null,i?.classList.remove("vlc-header--dragging"),i?.hasPointerCapture(b.pointerId)&&i.releasePointerCapture(b.pointerId))}function Nt(b=document.body){if(document.getElementById(nt))return e=document.getElementById(nt),e;e=document.createElement("div"),e.id=nt,e.setAttribute("data-vlc-panel","1");const x=e.attachShadow({mode:"open"}),S=document.createElement("style");S.textContent=rn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",vt),i=document.createElement("div"),i.className="vlc-header",i.addEventListener("pointerdown",X),i.addEventListener("pointermove",Z),i.addEventListener("pointerup",G),i.addEventListener("pointercancel",G);const _=document.createElement("div");_.className="vlc-header-main",o=document.createElement("h1"),o.className="vlc-title",o.textContent=vt,_.appendChild(o),c=O("Copy again",()=>t.onCopyAgain()),c.classList.add("vlc-btn-header-copy"),c.disabled=!0,l=document.createElement("button"),l.type="button",l.className="vlc-btn vlc-btn-icon",l.addEventListener("click",J);const F=document.createElement("div");F.className="vlc-header-actions",F.append(c,l),i.append(_,F);const V=document.createElement("div");V.className="vlc-body";const M=document.createElement("div");M.className="vlc-actions",s=O("Clip listing",()=>t.onClipListing()),g=O("Cancel",()=>t.onCancel()),g.disabled=!0,f=O("Copy again",()=>t.onCopyAgain()),f.disabled=!0;const _o=O("Clear model cache",()=>t.onClearModelCache()),To=O("Diagnostics",()=>t.onToggleDiagnostics()),Po=O("Settings",()=>t.onSettings());M.append(s,g,f,_o,To,Po),r=document.createElement("div"),r.className="vlc-status",r.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const Mo=w.getElement();return V.append(M,r,a,Mo),n.append(i,V),x.append(S,n),T(),b.appendChild(e),e}function O(b,x){const S=document.createElement("button");return S.type="button",S.className="vlc-btn",S.textContent=b,S.addEventListener("click",x),S}function $t(b){r&&(r.textContent=b)}function u(b){s&&(s.disabled=!!b),g&&(g.disabled=!b)}function y(b){h=!!b,ht()}function L(b){const x=b||"Copy again";f&&(f.textContent=x),c&&(c.textContent=x)}function I(b=2e3){C!=null&&(clearTimeout(C),C=null);for(const x of[c,f])x&&x.classList.add("vlc-btn--copied");C=setTimeout(()=>{C=null;for(const x of[c,f])x?.classList.remove("vlc-btn--copied")},b)}function P(b,x=""){a&&(a.hidden=!b,a.textContent=x)}function yt(b){w.showListing(b)}function Q(b){w.showSettings(b)}function tt(){w.hide()}function B(){C!=null&&(clearTimeout(C),C=null),i&&(i.removeEventListener("pointerdown",X),i.removeEventListener("pointermove",Z),i.removeEventListener("pointerup",G),i.removeEventListener("pointercancel",G)),e?.remove(),e=null,n=null,i=null,o=null,r=null,a=null,s=null,g=null,f=null,c=null,l=null,d=!0,m="waiting",h=!1,p=null}return{mount:Nt,setStatus:$t,setBusy:u,setCopyEnabled:y,setCopyLabel:L,flashCopySuccess:I,setCaptureStatus:mt,setDiagnostics:P,showListingForm:yt,showSettingsForm:Q,hideForm:tt,setMinimized:H,toggleMinimized:J,destroy:B}}function Ut(t){return t==null||t===""?"":String(t).replace(/[^\d]/g,"")||""}function qt(t){return t==null||t===""?"":typeof t=="number"&&Number.isFinite(t)?String(Math.round(t)):String(t).replace(/[^\d]/g,"")||""}function zt(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase();return e?e.includes("manual")?"MANUAL":e.includes("auto")||e.includes("cvt")||e.includes("dsg")||e.includes("eat")?"AUTOMÁTICA":String(t).trim().toUpperCase():""}function jt(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return e?e.includes("gasolina")||e.includes("gasoline")||e==="petrol"?"GASOLINA":e.includes("diesel")||e.includes("gasoleo")||e.includes("gásóleo")?"DIESEL":e.includes("eletr")||e.includes("electr")?"ELÉTRICO":e.includes("hibr")||e.includes("hybrid")?"HÍBRIDO":e.includes("gpl")||e.includes("lpg")||e.includes("gnv")?"GPL":String(t).trim().toUpperCase():""}function Kt(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";const n=e.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const i=e.replace(",",".");return i==="1"?"1.0":i}function Wt(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";if(/\bcv\b/i.test(e)){const i=e.replace(/[^\d]/g,"");return i?`${i} CV`:e.toUpperCase().replace(/\s+/g," ")}const n=e.replace(/[^\d]/g,"");return n?`${n} CV`:e}function Yt(t){if(t==null||t==="")return"";const e=String(t).replace(/[^\d]/g,"");return e.length>=4?e.slice(0,4):e}function it(t){return t==null||t===""?"":String(t).trim().toUpperCase()}function D(t,e="https://www.olx.pt/"){if(t==null||t==="")return"";try{const n=new URL(String(t),e);let i=`${n.origin}${n.pathname}`;const r=i.toLowerCase().indexOf(".html");return r!==-1&&(i=i.slice(0,r+5)),i}catch{return""}}const Jt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",Xt='#mainContent img[data-testid="swiper-image-lazy"]',Zt="#mainContent div.swiper-wrapper img",Qt=[Jt,Xt,Zt],te='#mainContent button[data-testid="ad-contact-phone"]',ee='#mainContent a[data-testid="contact-phone"][href^="tel:"]',ne='#mainContent [data-testid="ad-parameters-container"]',oe='#mainContent [data-testid="ad-price-container"] h3',wt='link#ssr_canonical[rel="canonical"]',ie='#mainContent [data-testid="offer_title"]',re='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',ae='script[type="application/ld+json"]';function sn(t){return!!(t&&typeof t.click=="function")}function se(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function q(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function rt(t){if(t.hidden)return!0;const n=se(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function at(t){if(!t||typeof t.getBoundingClientRect!="function"||rt(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(q(t)>0)return!0;const n=se(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function ce(t=document){return[...t.querySelectorAll(te)].filter(e=>sn(e))}function le(t=document){const e=ce(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=e.filter(s=>!rt(s)),o=[...n.length>0?n:e].sort((s,g)=>{const f=at(s)?1:0,c=at(g)?1:0;return f!==c?c-f:q(g)-q(s)}),r=(()=>{const s=o[0];return{visible:at(s)?1:0,area:q(s)}})(),a=o.filter(s=>(at(s)?1:0)===r.visible&&q(s)===r.area);return a[a.length-1]||o[o.length-1]||e[e.length-1]}function st(t=document){const e=[...t.querySelectorAll(ee)];for(const n of e){if(e.length>1&&rt(n))continue;const o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}if(e.length>0){const n=e[e.length-1],o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}return null}function cn(t){try{const e=Object.keys(t).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const i={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(i),!0}catch{return!1}}function ln(t){try{t.click()}catch{}cn(t)}async function un(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:i=250,signal:o}=t,r=st(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const a=ce(e);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=le(e),g=[];s&&g.push(s);for(const c of a)c!==s&&!rt(c)&&g.push(c);const f=Date.now()+n;for(const c of g){if(o?.aborted)return{ok:!1,reason:"cancelled"};ln(c);const l=Math.min(f,Date.now()+5e3);for(;Date.now()<l;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const d=st(e);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(m=>setTimeout(m,i))}}for(;Date.now()<f;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=st(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(l=>setTimeout(l,i))}return{ok:!1,reason:"timeout"}}function dn(t){const e=new Map,n=t.querySelector(ne);if(!n)return e;for(const i of n.querySelectorAll("p")){const o=(i.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const r=o.indexOf(":");if(r<=0)continue;const a=o.slice(0,r).trim().toLowerCase(),s=o.slice(r+1).trim();a&&s&&e.set(a,s)}return e}function fn(t){const e=t.querySelectorAll(ae);for(const n of e){const i=n.textContent||"";if(i.trim())try{const o=JSON.parse(i),r=Array.isArray(o)?o:[o];for(const a of r)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function pn(t){const n=(t.querySelector?.(wt)||(typeof document<"u"?document.querySelector(wt):null))?.getAttribute?.("href")||"";return n?D(n):typeof location<"u"&&location?.href?D(location.href):""}function gn(t){const e=t.querySelectorAll(re);for(const n of e){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function mn(t){return t?.brand?typeof t.brand=="string"?t.brand:typeof t.brand?.name=="string"?t.brand.name:"":""}function hn(t,e){return e?.sku!=null&&String(e.sku).trim()?String(e.sku).trim():String(t).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function bn(t=document){const e=[],n=[];function i(k,R){R&&e.push(k)}const o=dn(t),r=fn(t),a=pn(t);i("url",a);const s=hn(a,r);i("listingId",s);const f=(t.querySelector(ie)?.textContent||r?.name||"").replace(/\s+/g," ").trim();i("title",f);const c=String(r?.description||"").replace(/\s+/g," ").trim();i("description",c);let l=mn(r);l||(l=gn(t)),l=it(l),i("make",l);let d=o.get("modelo")||r?.model||"";d=it(d),i("model",d);let m=o.get("ano")||r?.productionDate||r?.modelDate||"";m=Yt(m),i("year",m);const h=Ut(o.get("quilómetros")||o.get("quilometros")||"");i("mileageKm",h);const p=zt(o.get("tipo de caixa")||"");i("transmission",p);const v=jt(o.get("combustível")||o.get("combustivel")||"");i("fuel",v);const E=Kt(o.get("cilindrada")||"");i("engine",E);const C=Wt(o.get("potência")||o.get("potencia")||"");i("powerCv",C);let w=r?.offers?.price;(w==null||w==="")&&(w=t.querySelector(oe)?.textContent||"");const A=qt(w);return i("priceEur",A),(!l||!d)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:f,description:c,make:l,model:d,year:m,mileageKm:h,transmission:p,fuel:v,engine:E,powerCv:C,priceEur:A,extractedFields:[...new Set(e)],warnings:n}}function yn(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),i=n[0],o=n[1];let r=null;return o&&/^\d+w$/i.test(o)&&(r=Number.parseInt(o,10)),{url:i,width:r}}).filter(e=>!!e.url)}function vn(t){const e=yn(t);if(e.length===0)return null;const n=e.filter(o=>typeof o.width=="number");if(n.length===0)return e[e.length-1].url;let i=n[0];for(let o=1;o<n.length;o+=1)n[o].width>i.width&&(i=n[o]);return i.url}function ue(t){if(!t)return null;const e=vn(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function Cn(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function de(t=document){for(const e of Qt){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function xt(t=document){const{images:e,selectorUsed:n}=de(t),i=[],o=new Set;for(const r of e){const a=ue(r);if(!a)continue;const s=Cn(a);o.has(s)||(o.add(s),i.push(s))}return{urls:i,count:i.length,selectorUsed:n}}async function En(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:i=100}=t;let o=xt(e);if(o.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,i)),o=xt(e);return o}const fe={siteId:"olx-pt",discoverListingImages:xt,discoverListingImagesWithWait:En,queryGalleryImages:de,extractListing:bn,findPhoneRevealButton:le,readRevealedPhone:st,revealContactPhone:un,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:Jt,FALLBACK_TESTID_SELECTOR:Xt,FALLBACK_SWIPER_IMG_SELECTOR:Zt,GALLERY_SELECTORS:Qt,PHONE_REVEAL_BUTTON_SELECTOR:te,CONTACT_PHONE_SELECTOR:ee,AD_PARAMETERS_SELECTOR:ne,AD_PRICE_SELECTOR:oe,CANONICAL_LINK_SELECTOR:wt,OFFER_TITLE_SELECTOR:ie,BREADCRUMB_ITEM_SELECTOR:re,JSON_LD_SELECTOR:ae}},pe="script#__NEXT_DATA__",ge='h1.offer-title, [data-testid="summary-info-area"] h1',me='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',he='[data-testid="content-description-section"]',St='link[rel="canonical"]',ct='[data-testid="aside-seller-info"]',be='[data-testid="seller-info-contact-box"]',ye='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',ve='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Ce='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Ee=[ve,Ce];function wn(t){return`[data-testid="${t}"] p:last-of-type`}const xn=/ver\s+telefone/i;function Sn(t){return!!(t&&typeof t.click=="function")}function we(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function Lt(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function z(t){if(t.hidden)return!0;const n=we(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function xe(t){if(!t||typeof t.getBoundingClientRect!="function"||z(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Lt(t)>0)return!0;const n=we(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Se(t){if(!Sn(t)||t.closest('a[href^="tel:"]'))return!1;const e=(t.textContent||"").replace(/\s+/g," ").trim();return xn.test(e)}function Le(t=document){const e=[],n=new Set;function i(o){const r=t.querySelector?.(o)||null;if(r)for(const a of r.querySelectorAll("button"))!Se(a)||n.has(a)||(n.add(a),e.push(a))}i(ct),i(be);for(const o of t.querySelectorAll?.("button")||[])!Se(o)||n.has(o)||(n.add(o),e.push(o));return e}function Ae(t=document){const e=Le(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=t.querySelector?.(ct);if(n){const a=e.find(s=>n.contains(s)&&!z(s));if(a)return a}const i=e.filter(a=>!z(a));return[...i.length>0?i:e].sort((a,s)=>{const g=xe(a)?1:0,f=xe(s)?1:0;return g!==f?f-g:Lt(s)-Lt(a)})[0]||e[0]}function lt(t=document){const e=[...t.querySelectorAll?.(ye)||[]],n=t.querySelector?.(ct),i=n&&e.length>1?[...e.filter(o=>n.contains(o)),...e.filter(o=>!n.contains(o))]:e;for(const o of i){if(i.length>1&&z(o))continue;const a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}if(i.length>0){const o=i[0],a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}return null}function Ln(t){try{const e=Object.keys(t).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const i={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(i),!0}catch{return!1}}function An(t){try{t.click()}catch{}Ln(t)}async function kn(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:i=250,signal:o}=t,r=lt(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const a=Le(e);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=Ae(e),g=[];s&&g.push(s);for(const c of a)c!==s&&!z(c)&&g.push(c);const f=Date.now()+n;for(const c of g){if(o?.aborted)return{ok:!1,reason:"cancelled"};An(c);const l=Math.min(f,Date.now()+5e3);for(;Date.now()<l;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const d=lt(e);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(m=>setTimeout(m,i))}}for(;Date.now()<f;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=lt(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(l=>setTimeout(l,i))}return{ok:!1,reason:"timeout"}}const At="https://www.standvirtual.com/";function ke(t){if(!t||typeof t!="object")return{value:"",label:""};const n=(Array.isArray(t.values)?t.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function j(t){const{value:e,label:n}=ke(t);return n||e}function ut(t){const{value:e,label:n}=ke(t);return e||n}function Ie(t){const n=t.querySelector?.(pe)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function In(t){const n=(t.querySelector?.(St)||(typeof document<"u"?document.querySelector(St):null))?.getAttribute?.("href")||"";return n?D(n,At):typeof location<"u"&&location?.href?D(location.href,At):""}function Rn(t,e){const n=String(t).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:e?.id!=null&&String(e.id).trim()?String(e.id).trim():""}function N(t,e){return(t.querySelector?.(wn(e))?.textContent||"").replace(/\s+/g," ").trim()}function _n(t){return String(t||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}function Tn(t=document){const e=[],n=[];function i(T,H){H&&e.push(T)}const o=Ie(t),r=o?.parametersDict||{};let a="";o?.url&&(a=D(o.url,At)),a||(a=In(t)),i("url",a);const s=Rn(a,o);i("listingId",s);const g=t.querySelector?.(ge),f=(o?.title||g?.textContent||"").replace(/\s+/g," ").trim();i("title",f);let c="";o?.description&&(c=_n(o.description)),c||(c=(t.querySelector?.(he)?.textContent||"").replace(/\s+/g," ").trim()),i("description",c);let l=j(r.make)||N(t,"make")||"";l=it(l),i("make",l);let d=j(r.model)||N(t,"model")||"";d=it(d),i("model",d);let m=ut(r.first_registration_year)||N(t,"first_registration_year")||"";m=Yt(m),i("year",m);const h=Ut(ut(r.mileage)||N(t,"mileage")||"");i("mileageKm",h);const p=zt(j(r.gearbox)||N(t,"gearbox")||"");i("transmission",p);const v=jt(j(r.fuel_type)||N(t,"fuel_type")||"");i("fuel",v);const E=ut(r.engine_capacity)||N(t,"engine_capacity")||"",C=/cm\s*3|cm3|\bcc\b/i.test(E)?E.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):E,w=Kt(C);i("engine",w);const A=Wt(ut(r.engine_power)||j(r.engine_power)||N(t,"engine_power")||"");i("powerCv",A);let k=o?.price?.value;(k==null||k==="")&&(k=t.querySelector?.(me)?.textContent||"");const R=qt(k);return i("priceEur",R),(!l||!d)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:f,description:c,make:l,model:d,year:m,mileageKm:h,transmission:p,fuel:v,engine:w,powerCv:A,priceEur:R,extractedFields:[...new Set(e)],warnings:n}}function Re(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function Pn(t=document){const n=Ie(t)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const i=[],o=new Set;for(const r of n){const a=r?.url||r?.src||"";if(!a)continue;const s=Re(String(a));o.has(s)||(o.add(s),i.push(s))}return i.length===0?null:{urls:i,count:i.length,selectorUsed:"next-data:images.photos"}}function _e(t=document){for(const e of Ee){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function kt(t=document){const e=Pn(t);if(e)return e;const{images:n,selectorUsed:i}=_e(t),o=[],r=new Set;for(const a of n){const s=ue(a);if(!s)continue;const g=Re(s);r.has(g)||(r.add(g),o.push(g))}return{urls:o,count:o.length,selectorUsed:i}}async function Mn(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:i=100}=t;let o=kt(e);if(o.count>0||!!!(e.querySelector('[data-testid="main-gallery"]')||e.querySelector('[data-testid^="gallery-image-"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,i)),o=kt(e);return o}const Te={siteId:"standvirtual-pt",discoverListingImages:kt,discoverListingImagesWithWait:Mn,queryGalleryImages:_e,extractListing:Tn,findPhoneRevealButton:Ae,readRevealedPhone:lt,revealContactPhone:kn,selectors:{PRIMARY_GALLERY_SELECTOR:ve,FALLBACK_GALLERY_SELECTOR:Ce,GALLERY_SELECTORS:Ee,CONTACT_PHONE_SELECTOR:ye,ASIDE_SELLER_SELECTOR:ct,CONTENT_CONTACT_SELECTOR:be,AD_PRICE_SELECTOR:me,CANONICAL_LINK_SELECTOR:St,OFFER_TITLE_SELECTOR:ge,DESCRIPTION_SELECTOR:he,NEXT_DATA_SELECTOR:pe}},Pe=new Map;function Me(t){Pe.set(t.siteId,t)}function De(t){return Pe.get(t)}function Oe(t){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?De("standvirtual-pt")||Te:De("olx-pt")||fe}Me(fe),Me(Te);async function Dn(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let i=null;for(const o of n)try{const r=new Blob([t],{type:o});return await createImageBitmap(r)}catch(r){i=r}try{const o=new Blob([t]);return await createImageBitmap(o)}catch(o){throw i||o}}function On(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const i=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:i,width:e.width,height:e.height}}const It=new Map;function Rt(){return typeof GM<"u"&&GM!=null}async function Ne(t,e=null){return typeof GM_getValue=="function"?GM_getValue(t,e):Rt()&&typeof GM.getValue=="function"?GM.getValue(t,e):It.has(t)?It.get(t):e}async function $e(t,e){if(typeof GM_setValue=="function"){GM_setValue(t,e);return}if(Rt()&&typeof GM.setValue=="function"){await GM.setValue(t,e);return}It.set(t,e)}async function Nn(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(Rt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function Be(t){const{method:e,url:n,responseType:i="arraybuffer",headers:o,signal:r}=t;return new Promise((a,s)=>{if(r?.aborted){s(new DOMException("Aborted","AbortError"));return}let g=null;const f=()=>{try{g?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",f,{once:!0}),(l=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){g=GM.xmlHttpRequest(l);return}if(typeof GM_xmlhttpRequest=="function"){g=GM_xmlhttpRequest(l);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:i,headers:o,onload(l){r?.removeEventListener("abort",f);const d=l.status;if(d<200||d>=300){s(new Error(`HTTP ${d} for ${n}`));return}a(l.response)},onerror(){r?.removeEventListener("abort",f),s(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",f),s(new Error(`Timeout for ${n}`))}})})}async function $n(t,e={}){const{signal:n,request:i=Be}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await i({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:o}}function Bn(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),i=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),o=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),a=Math.max(1,o-n),s=Math.max(1,r-i),g=document.createElement("canvas");g.width=t.width,g.height=t.height;const f=g.getContext("2d");return f.putImageData(t,0,0),f.getImageData(n,i,a,s)}function Fn(t,e,n){const i=document.createElement("canvas");i.width=t.width,i.height=t.height,i.getContext("2d").putImageData(t,0,0);const o=document.createElement("canvas");o.width=n,o.height=e;const r=o.getContext("2d");r.drawImage(i,0,0,n,e);const{data:a}=r.getImageData(0,0,n,e),s=new Uint8Array(1*e*n*3);let g=0;for(let f=0;f<e*n;f+=1)s[g++]=a[f*4],s[g++]=a[f*4+1],s[g++]=a[f*4+2];return s}function Vn(t,e,n=[114,114,114]){const{width:i,height:o}=t,r=Math.min(e/o,e/i),a=Math.round(i*r),s=Math.round(o*r),g=(e-a)/2,f=(e-s)/2,c=Math.round(f-.1),l=Math.round(g-.1),d=document.createElement("canvas");d.width=i,d.height=o,d.getContext("2d").putImageData(t,0,0);const h=document.createElement("canvas");h.width=e,h.height=e;const p=h.getContext("2d");p.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,p.fillRect(0,0,e,e),p.drawImage(d,0,0,i,o,l,c,a,s);const v=p.getImageData(0,0,e,e).data,E=new Float32Array(3*e*e),C=e*e;for(let w=0;w<C;w+=1){const A=v[w*4],k=v[w*4+1],R=v[w*4+2];E[w]=A/255,E[C+w]=k/255,E[2*C+w]=R/255}return{tensor:E,ratio:r,pad:{dw:g,dh:f},size:e}}function Hn(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Gn="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Un="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",qn="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",zn="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function Fe(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Gn},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Un,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:qn},ortWasmBaseUrl:zn}}const dt={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Ve=null;function jn(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function _t(){const t=jn();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const He=new Proxy({},{get(t,e){return _t()[e]}});function Kn(){const t=_t(),e=Fe();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function Ge(t,e={}){Kn();const n=_t(),i=e.prefer||["webgpu","wasm"],o=[];for(const r of i)try{const a=await n.InferenceSession.create(t,{executionProviders:[r]});return Ve=r,{session:a,provider:r}}catch(a){o.push(`${r}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Tt(){return Ve}const Pt=384,Wn="images",Yn="output0";async function Jn(t,e,n={}){const i=n.confThresh??.4,{tensor:o,ratio:r,pad:a}=Vn(e,Pt),s=new He.Tensor("float32",o,[1,3,Pt,Pt]),g=await t.run({[Wn]:s}),f=g[Yn]||Object.values(g)[0];if(!f)return[];const c=f.data,l=f.dims||[],d=l.length>=2?l[l.length-1]:7,m=Math.floor(c.length/d),h=[];for(let p=0;p<m;p+=1){const v=p*d,E=c[v+1],C=c[v+2],w=c[v+3],A=c[v+4],k=c[v+5],R=c[v+6];if(R<i)continue;const T=Hn({x1:E,y1:C,x2:w,y2:A},r,a);h.push({...T,score:Number(R),classId:Number(k)})}return h.sort((p,v)=>v.score-p.score),h}function Xn(t,e,n=dt){const i=n.alphabet,o=n.maxPlateSlots,r=i.length,a=t,s=[],g=[];for(let c=0;c<o;c+=1){let l=0,d=-1/0;for(let m=0;m<r;m+=1){const h=Number(a[c*r+m]);h>d&&(d=h,l=m)}s.push(i[l]),g.push(d)}let f=s.join("");return n.padChar&&(f=f.replace(new RegExp(`${Zn(n.padChar)}+$`),"")),{text:f,charProbs:g.slice(0,Math.max(f.length,1))}}function Zn(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Qn(t,e){const{imgHeight:n,imgWidth:i}=dt,o=Fn(e,n,i),r=new He.Tensor("uint8",o,[1,n,i,3]),a=await t.run({input:r}),s=a.plate||Object.values(a)[0],g=s.dims||[1,dt.maxPlateSlots,dt.alphabet.length],f=g[g.length-1],l=g[g.length-2]*f,d=s.data,m=d.length>=l?d.slice(0,l):d;return Xn(m)}const K="[A-Z]",W="[0-9]",to=[{id:"LLDDDD",re:new RegExp(`^${K}{2}${W}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${W}{4}${K}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${W}{2}${K}{2}${W}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${K}{2}${W}{2}${K}{2}$`)}],eo={0:"O",1:"I",5:"S",8:"B"},no={O:"0",I:"1",L:"1",S:"5",B:"8"};function ft(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function U(t){const e=ft(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function oo(t){const e=ft(t);if(e.length!==6)return null;for(const n of to)if(n.re.test(e))return n.id;return null}function Mt(t,e){const n=ft(t).slice(0,6).split("");if(n.length!==6)return[];const i=[];function o(r,a,s){if(a>e)return;if(r===6){const l=s.join(""),d=oo(l);d&&i.push({plate:l,corrections:a,patternId:d});return}if(o(r+1,a,s),a>=e)return;const g=s[r],f=eo[g];if(f){const l=s.slice();l[r]=f,o(r+1,a+1,l)}const c=no[g];if(c){const l=s.slice();l[r]=c,o(r+1,a+1,l)}}return o(0,0,n),i.sort((r,a)=>r.corrections-a.corrections||a.plate.localeCompare(r.plate)),i}function Ue(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let i=0;for(let o=0;o<n;o+=1)i+=t[o]??0;return i/n}function io(t,e=[],n={}){const i=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,r=ft(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:U(r),patternId:null,corrections:0,meanConfidence:Ue(e,r.length),reason:"too-short"};const a=r.slice(0,6),s=Ue(e,6),g=Mt(a,0);if(g.length>0&&s>=i){const l=g[0];return{accepted:!0,plate:l.plate,plateFormatted:U(l.plate),patternId:l.patternId,corrections:0,meanConfidence:s}}const f=Mt(a,1).filter(l=>l.corrections===1);if(f.length>0&&s>=o){const l=f[0];return{accepted:!0,plate:l.plate,plateFormatted:U(l.plate),patternId:l.patternId,corrections:1,meanConfidence:s}}return Mt(a,2).some(l=>l.corrections>1)&&g.length===0&&f.length===0?{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:g.length>0||f.length>0?{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:g.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const $="models",ro=1;let pt=null;function Dt(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):pt||(pt=new Promise((t,e)=>{const n=indexedDB.open(Bt,ro);n.onupgradeneeded=()=>{const i=n.result;i.objectStoreNames.contains($)||i.createObjectStore($,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),pt)}async function qe(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function ao(t){const e=await Dt();return new Promise((n,i)=>{const r=e.transaction($,"readonly").objectStore($).get(t);r.onsuccess=()=>{const a=r.result;n(a?.bytes||null)},r.onerror=()=>i(r.error)})}async function so(t,e,n){const i=await Dt();return new Promise((o,r)=>{const a=i.transaction($,"readwrite");a.objectStore($).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>o(),a.onerror=()=>r(a.error)})}async function co(){const t=await Dt();return new Promise((e,n)=>{const i=t.transaction($,"readwrite");i.objectStore($).clear(),i.oncomplete=()=>e(),i.onerror=()=>n(i.error)})}async function ze(t,e={}){const{onStatus:n,signal:i}=e,o=await ao(t.id).catch(()=>null);if(o&&await qe(o)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await Be({method:"GET",url:t.url,responseType:"arraybuffer",signal:i}),a=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const s=await qe(a);if(s!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${s}`);return await so(t.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let Y=null;async function lo(t={}){if(Y)return{sessions:Y,diagnostics:{provider:Tt(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=Fe(),n=await ze(e.detector,t),i=await ze(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const o=await Ge(n.bytes),r=await Ge(i.bytes);return Y={detector:o.session,ocr:r.session},{sessions:Y,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:i.cacheHit}}}function uo(){Y=null}async function fo(t,e,n={}){const{signal:i}=n;let o=0,r;try{const s=await Dn(e);r=On(s).imageData,s.close?.()}catch{return null}const a=await Jn(t.detector,r);for(const s of a){if(i?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const g=Bn(r,s),f=await Qn(t.ocr,g),c=io(f.text,f.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function po(t,e={}){const n=Date.now(),{onStatus:i,signal:o,request:r}=e,a=t.length,s=await lo({onStatus:i,signal:o}),{detector:g,ocr:f}=s.sessions;let c=0,l=0;for(let d=0;d<a;d+=1){if(o?.aborted)return gt("cancelled",s.diagnostics,l,c,n);const m=t[d];i?.(`Downloading image ${d+1} of ${a}`);let h;try{h=await $n(m,{signal:o,request:r})}catch(v){if(o?.aborted||v?.name==="AbortError")return gt("cancelled",s.diagnostics,l,c,n);i?.(`Failed to download image ${d+1} of ${a}, skipping…`);continue}i?.(`Scanning image ${d+1} of ${a}`),l+=1;let p;try{p=await fo({detector:g,ocr:f},h.bytes,{signal:o})}catch(v){if(o?.aborted||v?.name==="AbortError")return gt("cancelled",s.diagnostics,l,c,n);continue}finally{h=null}if(p&&(c+=p.detectionsTried,p.plate))return{ok:!0,plate:p.plate,plateFormatted:p.plateFormatted,diagnostics:{provider:Tt()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:l,detectionsTried:c,elapsedMs:Date.now()-n}}}return gt("no-reliable-plate",s.diagnostics,l,c,n)}function gt(t,e,n,i,o){return{ok:!1,reason:t,diagnostics:{provider:Tt()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:i,elapsedMs:Date.now()-o}}}async function je(t){return await Nn(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Ke(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function go({plate:t,phone:e,fallbackId:n}={}){const i=t==null?"":String(t).trim();if(i)return i;const o=e==null?"":String(e).trim();if(o)return o;const r=n==null?"":String(n).trim();return r||Ke()}function mo(t){const e=/^ID:\s*(.+)\s*$/m.exec(String(t||""));return e?e[1].trim():""}function ho(t,{phone:e="",fallbackId:n=""}={}){const i=t||{},o=e==null?"":String(e).trim(),r=i.plate==null?"":String(i.plate).trim(),s=[`ID: ${go({plate:r,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const f of Et){if(f==="url")continue;const c=Vt[f];let l=i[f]==null?"":String(i[f]);f==="customerValueEur"&&l&&!/€/.test(l)&&(l=`${l} €`),s.push(`${c}: ${l}`)}const g=i.url==null?"":String(i.url);return s.push(""),s.push(g),s.join(`
`)}function bo(t){const e={source:t.source,vehicle:{plate:t.fields.plate,make:t.fields.make,model:t.fields.model,year:t.fields.year,mileageKm:t.fields.mileageKm,transmission:t.fields.transmission,fuel:t.fields.fuel,engine:t.fields.engine,powerCv:t.fields.powerCv},valuation:{paintParts:t.fields.paintParts,bodyParts:t.fields.bodyParts,tires:t.fields.tires,customerValueEur:t.fields.customerValueEur,saleReason:t.fields.saleReason,keyCount:t.fields.keyCount,deductibleVat:t.fields.deductibleVat},url:t.fields.url,origins:t.origins,metadata:t.metadata};return JSON.stringify(e,null,2)}const yo="listingCache",vo=2880*60*1e3;function We(){return`${et}${yo}`}function Ot(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.processedAt=="number"&&Number.isFinite(e.processedAt)&&typeof e.phone=="string"&&typeof e.clipboard=="string"&&e.listingRecord!=null&&typeof e.listingRecord=="object"}function Co(t){if(!t||typeof t!="object"||Array.isArray(t))return{};const e={};for(const[n,i]of Object.entries(t))typeof n=="string"&&n&&Ot(i)&&(e[n]={processedAt:i.processedAt,phone:i.phone,clipboard:i.clipboard,fallbackId:typeof i.fallbackId=="string"?i.fallbackId:"",listingRecord:i.listingRecord});return e}async function Eo(){const t=await Ne(We(),{});return Co(t)}async function Ye(t){await $e(We(),t)}async function Je(t=Date.now()){const e=await Eo(),n={};let i=!1;for(const[o,r]of Object.entries(e))t-r.processedAt<=vo?n[o]=r:i=!0;return(i||Object.keys(n).length!==Object.keys(e).length)&&await Ye(n),n}async function wo(t,e=Date.now()){const n=typeof t=="string"?t.trim():"";if(!n)return null;const o=(await Je(e))[n];return o&&Ot(o)?o:null}async function xo(t,e,n=Date.now()){const i=typeof t=="string"?t.trim():"";if(!i||!Ot(e))return null;const o=await Je(n),r={processedAt:e.processedAt,phone:e.phone,clipboard:e.clipboard,fallbackId:typeof e.fallbackId=="string"?e.fallbackId:"",listingRecord:e.listingRecord};return o[i]=r,await Ye(o),r}const Xe="valuationDefaults";async function So(t,e=null){return Ne(`${et}${t}`,e)}async function Lo(t,e){await $e(`${et}${t}`,e)}async function Ze(){const t=await So(Xe,null);return!t||typeof t!="object"?{...ot}:{...ot,...t}}async function Ao(t){const e={...ot,...t};return await Lo(Xe,e),e}const ko=5e3;function Io(){let t=Ft(),e=null,n=null,i=null,o="",r=0,a=!1;function s(u){u&&e?.setCaptureStatus(u)}function g(){try{const u=Oe().extractListing(document);if(u?.url)return D(u.url)}catch{}return typeof location<"u"&&location?.href?D(location.href):""}function f(u,y){const L=y.listingRecord,I=y.phone||"",P=L?.fields?.plate||"",Q=!String(P).trim()&&!String(I).trim()&&(y.fallbackId||mo(y.clipboard))||"";o=u,r=y.processedAt,a=!0,t={...t,lastPlate:P,lastPhone:I,lastClipboard:y.clipboard||"",fallbackId:Q,listingRecord:L,view:"form"},e?.showListingForm(L),e?.setCopyEnabled(!!y.clipboard),e?.setCopyLabel("Copy"),s("cached (not copied yet)"),p("cached (not copied yet)")}function c(u,y=""){const L=u?.fields?.plate||"",I=y==null?"":String(y).trim();let P=t.fallbackId||"";return!String(L).trim()&&!I&&(P||(P=Ke()),t={...t,fallbackId:P}),ho(u.fields,{phone:I,fallbackId:t.fallbackId})}async function l(u){const y=o||D(u.listingRecord?.fields?.url||"")||g();if(!y||!u.listingRecord||!u.clipboard)return;const L=u.processedAt??r??Date.now();o=y,r=L,await xo(y,{processedAt:L,phone:u.phone??t.lastPhone??"",clipboard:u.clipboard,fallbackId:u.fallbackId??t.fallbackId??"",listingRecord:u.listingRecord})}async function d(){try{const u=g();if(u){const y=await wo(u);if(y){f(u,y);return}}}catch{}h()}function m(){i!=null&&(clearTimeout(i),i=null)}function h(){m(),s("waiting"),i=setTimeout(()=>{i=null,A()},ko)}function p(u){t={...t,statusMessage:u},e?.setStatus(u)}function v(u){t={...t,busy:u,view:u?"reading":t.listingRecord?"form":"idle"},e?.setBusy(u),u&&s("reading")}function E(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const u=t.lastDiagnostics;if(!u){e?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}e?.setDiagnostics(!0,[`Provider: ${u.provider||"n/a"}`,`Detector cache: ${u.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${u.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${u.imagesScanned??0}`,`Detections tried: ${u.detectionsTried??0}`,`Elapsed: ${u.elapsedMs??0} ms`].join(`
`))}function C(u,y,L){const I=[];return y.plate?I.push(`Plate found: ${y.plate}`):I.push("No reliable plate found."),y.phone&&I.push(`Phone: ${y.phone}`),(u.fields.make||u.fields.model)&&I.push(`Listing: ${[u.fields.make,u.fields.model].filter(Boolean).join(" ")}`.trim()),I.push(L?"Full text copied to clipboard":"Clipboard copy failed — use Copy full text"),I.join(`
`)}async function w(u){return t={...t,lastClipboard:u},e?.setCopyEnabled(!!u),je(u)}async function A(){if(m(),t.busy)return;n=new AbortController;const{signal:u}=n;v(!0);try{const y=Oe(),L=await Ze();p("Revealing phone (if available)…");const I=y.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:u});p("Extracting listing fields…");const P=y.extractListing(document);p("Looking for listing images…");const yt=await y.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:Q,count:tt}=yt;let B={ok:!1,reason:"no-images"};tt>0?(p(`Found ${tt} listing images — scanning…`),p("Loading plate recognition models…"),B=await po(Q,{signal:u,onStatus:p}),t={...t,lastDiagnostics:B.diagnostics},E()):p("No listing images — checking phone…");const b=await I,x=B.ok&&B.plate?B.plate:"",S=b.ok?b.phone:"";if(u.aborted||B.reason==="cancelled"){p("Cancelled.");return}const _=en({extracted:P,plate:x,defaults:L});t={...t,lastPlate:x,lastPhone:S,fallbackId:"",listingRecord:_,view:"form"},e?.showListingForm(_);const F=c(_,S),V=await w(F);a=!1,e?.setCopyLabel("Copy again"),V.ok&&s("text copied"),o=D(_.fields.url||"")||g(),r=Date.now(),await l({clipboard:F,phone:S,listingRecord:_,processedAt:r,fallbackId:t.fallbackId});let M=C(_,{plate:x,phone:S},V.ok);x&&!S&&b.reason==="timeout"?M+=`
Phone reveal timed out.`:x&&!S&&b.reason==="no-button"&&(M+=`
No phone button on this listing.`),tt===0&&!S&&b.reason==="no-button"&&(M+=`
No listing images found.`),p(M)}catch(y){if(u.aborted){p("Cancelled.");return}const L=y instanceof Error?y.message:"Unknown recognition error";p(`Failed: ${L}`)}finally{n=null,v(!1)}}function k(){n?.abort()}async function R(){let u=t.lastClipboard;if(t.listingRecord&&(u=c(t.listingRecord,t.lastPhone),t={...t,lastClipboard:u},e?.setCopyEnabled(!!u)),!u){p("Nothing to copy yet.");return}const y=a,L=await je(u);L.ok&&(a=!1,s("text copied"),e?.setCopyLabel("Copy again"),e?.flashCopySuccess(),await l({clipboard:u,phone:t.lastPhone,listingRecord:t.listingRecord,processedAt:r||Date.now(),fallbackId:t.fallbackId})),p(L.ok?y?"Full text copied to clipboard.":"Copied to clipboard again.":"Clipboard copy failed.")}async function T(){if(!t.listingRecord){p("No listing to copy yet. Run Clip listing.");return}const u=c(t.listingRecord,t.lastPhone),y=await w(u);y.ok&&(a=!1,s("text copied"),e?.setCopyLabel("Copy again"),await l({clipboard:u,phone:t.lastPhone,listingRecord:t.listingRecord,processedAt:r||Date.now(),fallbackId:t.fallbackId})),p(y.ok?"Full text copied to clipboard.":"Clipboard copy failed.")}async function H(){const u=t.listingRecord?.fields?.plate||t.lastPlate||"";if(!u){p("No plate to copy.");return}const y=await w(u);p(y.ok?`Plate copied: ${u}`:"Clipboard copy failed.")}async function J(){if(!t.listingRecord){p("No listing to copy yet. Run Clip listing.");return}const u=bo(t.listingRecord),y=await w(u);p(y.ok?"JSON copied to clipboard.":"Clipboard copy failed.")}function mt(u,y){if(!t.listingRecord)return;const L=nn(t.listingRecord,u,y);t={...t,listingRecord:L,lastPlate:u==="plate"?y:t.lastPlate}}async function ht(){try{await co(),uo(),p("Model cache cleared.")}catch(u){const y=u instanceof Error?u.message:"Failed to clear cache";p(y)}}function bt(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},E(),p(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function X(){if(t.busy)return;const u=await Ze();t={...t,view:"settings"},e?.showSettingsForm(u),p(`Settings. Environment: production. Storage: ${et}* / ${Bt}.`)}function Z(){t={...t,view:t.listingRecord?"form":"idle"},t.listingRecord?(e?.showListingForm(t.listingRecord),p("Back to listing review.")):(e?.hideForm(),p("Settings closed."))}async function G(u){await Ao(u),p("Defaults saved.")}function Nt(u=document.body){return e||(e=an({onClipListing:A,onCancel:k,onCopyAgain:R,onClearModelCache:ht,onToggleDiagnostics:bt,onSettings:X,onFieldChange:mt,onCopyFullText:T,onCopyPlateOnly:H,onCopyJson:J,onSettingsBack:Z,onSaveDefaults:G}),e.mount(u),e.setMinimized(!0),d(),e)}function O(){m(),n?.abort(),n=null,e?.destroy(),e=null,o="",r=0,a=!1,t=Ft()}function $t(){return t}return{mount:Nt,destroy:O,onClipListing:A,onCancel:k,onCopyAgain:R,onCopyFullText:T,onCopyPlateOnly:H,onCopyJson:J,onFieldChange:mt,onClearModelCache:ht,onToggleDiagnostics:bt,onSettings:X,onSettingsBack:Z,onSaveDefaults:G,getState:$t,setStatus:p}}function Ro(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[Ct])return{started:!1,reason:"already-initialized"};if(document.getElementById(nt))return window[Ct]=!0,{started:!1,reason:"panel-exists"};window[Ct]=!0;const t=Io(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}Ro()})();
