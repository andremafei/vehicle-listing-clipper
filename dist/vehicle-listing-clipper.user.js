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
(function(){"use strict";const vt="Vehicle Listing Clipper",et="vlc_prod_",Vt="vehicle-listing-clipper",Ct="__VLC_PROD_INITIALIZED__",nt="vlc-panel-root";function Ht(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const ot={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Et=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Ut={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},Gt=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function tn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function en(t={}){return{...ot,...t}}function nn({extracted:t=null,plate:e="",defaults:n={}}={}){const i=en(n),o=tn(),r={},a=[],s=[],g=[],p=[...t?.warnings||[]];function c(d,h,f){const m=h==null?"":String(h);if(o[d]=m,!m){r[d]="missing";return}r[d]=f,f==="extracted"||f==="anpr"?a.push(d):f==="default"&&s.push(d)}const l=e?String(e).trim():"";return c("plate",l,l?"anpr":"missing"),c("make",t?.make||"",t?.make?"extracted":"missing"),c("model",t?.model||"",t?.model?"extracted":"missing"),c("year",t?.year||"",t?.year?"extracted":"missing"),c("mileageKm",t?.mileageKm||"",t?.mileageKm?"extracted":"missing"),c("transmission",t?.transmission||"",t?.transmission?"extracted":"missing"),c("fuel",t?.fuel||"",t?.fuel?"extracted":"missing"),c("engine",t?.engine||"",t?.engine?"extracted":"missing"),c("powerCv",t?.powerCv||"",t?.powerCv?"extracted":"missing"),c("customerValueEur",t?.priceEur||"",t?.priceEur?"extracted":"missing"),c("url",t?.url||"",t?.url?"extracted":"missing"),c("paintParts",i.paintParts,"default"),c("bodyParts",i.bodyParts,"default"),c("tires",i.tires,"default"),c("saleReason",i.saleReason,"default"),c("keyCount",i.keyCount,"default"),c("deductibleVat",i.deductibleVat,"default"),{source:{siteId:t?.siteId||"olx-pt",url:o.url,listingId:t?.listingId||"",title:t?.title||"",description:t?.description||""},fields:o,origins:r,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:g,warnings:p}}}function qt(t,e={}){return String(e.plate||"").trim()||String(e.phone||"").trim()?!0:t?String(t.fields?.plate||"").trim()?!0:(t.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function on(t,e,n){const i=n==null?"":String(n),o={...t.fields,[e]:i},r={...t.origins,[e]:i?"edited":"missing"},a=[...new Set([...t.metadata.editedFields||[],e])];return{...t,fields:o,origins:r,source:{...t.source,url:e==="url"?i:t.source.url},metadata:{...t.metadata,editedFields:a}}}function zt(t){switch(t){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function rn(t){let e=null;const n=new Map;let i="listing";function o(){return e||(e=document.createElement("div"),e.className="vlc-form",e.hidden=!0,e)}function r(){e&&(e.replaceChildren(),n.clear())}function a(d,h,f="missing",m){const v=document.createElement("label");v.className=`vlc-field ${zt(f)}`,v.dataset.field=d;const w=document.createElement("span");w.className="vlc-field-label",w.textContent=m||Ut[d]||d;const E=document.createElement("span");E.className="vlc-field-origin",E.textContent=f;const C=document.createElement("input");C.type="text",C.className="vlc-field-input",C.value=h??"",C.dataset.field=d,C.addEventListener("input",()=>{i==="listing"&&(t.onFieldChange(d,C.value),v.className=`vlc-field ${zt("edited")}`,E.textContent="edited")}),w.appendChild(E),v.append(w,C),n.set(d,C),e?.appendChild(v)}function s(){const d=document.createElement("div");d.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>t.onCopyFullText());const f=document.createElement("button");f.type="button",f.className="vlc-btn",f.textContent="Copy plate only",f.addEventListener("click",()=>t.onCopyPlateOnly());const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Copy JSON",m.addEventListener("click",()=>t.onCopyJson()),d.append(h,f,m),e?.appendChild(d)}function g(d,{phone:h=""}={}){i="listing",o(),r(),e.hidden=!1;const f=document.createElement("div");f.className="vlc-form-heading",f.textContent="Review listing",e.appendChild(f);const m=h==null?"":String(h).trim();a("phone",m,m?"extracted":"missing","Telefone");for(const v of Et)a(v,d.fields[v]||"",d.origins[v]||"missing");s()}function p(d){i="settings",o(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",e.appendChild(h);for(const w of Gt)a(w,d[w]||"","default");const f=document.createElement("div");f.className="vlc-form-actions";const m=document.createElement("button");m.type="button",m.className="vlc-btn vlc-btn-primary",m.textContent="Save defaults",m.addEventListener("click",()=>{const w={};for(const E of Gt)w[E]=n.get(E)?.value??"";t.onSaveDefaults?.(w)});const v=document.createElement("button");v.type="button",v.className="vlc-btn",v.textContent="Back",v.addEventListener("click",()=>t.onBack?.()),f.append(m,v),e.appendChild(f)}function c(){e&&(e.hidden=!0)}function l(d,{phone:h}={}){if(i==="listing"){if(h!==void 0){const f=n.get("phone");f&&document.activeElement!==f&&(f.value=h==null?"":String(h))}for(const f of Et){const m=n.get(f);m&&document.activeElement!==m&&(m.value=d.fields[f]||"")}}}return{ensureRoot:o,showListing:g,showSettings:p,syncListingValues:l,hide:c,getMode:()=>i,getElement:()=>o()}}const an=`
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
`;function sn(t){let e=null,n=null,i=null,o=null,r=null,a=null,s=null,g=null,p=null,c=null,l=null,d=!0,h="waiting",f=!1,m=null,v=0,w=0,E=null;const C=rn({onFieldChange:(y,x)=>t.onFieldChange(y,x),onCopyFullText:()=>t.onCopyFullText(),onCopyPlateOnly:()=>t.onCopyPlateOnly(),onCopyJson:()=>t.onCopyJson(),onBack:()=>t.onSettingsBack(),onSaveDefaults:y=>t.onSaveDefaults(y)});function k(){o&&(o.textContent=d?h:vt)}const I='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',R='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function T(){!n||!l||(n.classList.toggle("vlc-panel--minimized",d),l.innerHTML=d?I:R,l.setAttribute("aria-label",d?"Expand panel":"Minimize panel"),l.title=d?"Expand":"Minimize",k())}function V(y){d=!!y,T()}function Y(){V(!d)}function mt(y){h=y,k()}function ht(){p&&(p.disabled=!f),c&&(c.disabled=!f)}function bt(y,x){if(!n)return;const S=n.getBoundingClientRect(),_=Math.max(0,window.innerWidth-S.width),F=Math.max(0,window.innerHeight-S.height),D=Math.min(Math.max(0,y),_),tt=Math.min(Math.max(0,x),F);n.style.left=`${D}px`,n.style.top=`${tt}px`,n.style.right="auto",n.style.bottom="auto"}function J(y){if(!n||!i||y.target?.closest("button")||y.button!==0)return;const S=n.getBoundingClientRect();m=y.pointerId,v=y.clientX-S.left,w=y.clientY-S.top,i.classList.add("vlc-header--dragging"),i.setPointerCapture(y.pointerId),y.preventDefault()}function X(y){m===y.pointerId&&bt(y.clientX-v,y.clientY-w)}function H(y){m===y.pointerId&&(m=null,i?.classList.remove("vlc-header--dragging"),i?.hasPointerCapture(y.pointerId)&&i.releasePointerCapture(y.pointerId))}function Bt(y=document.body){if(document.getElementById(nt))return e=document.getElementById(nt),e;e=document.createElement("div"),e.id=nt,e.setAttribute("data-vlc-panel","1");const x=e.attachShadow({mode:"open"}),S=document.createElement("style");S.textContent=an,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",vt),i=document.createElement("div"),i.className="vlc-header",i.addEventListener("pointerdown",J),i.addEventListener("pointermove",X),i.addEventListener("pointerup",H),i.addEventListener("pointercancel",H);const _=document.createElement("div");_.className="vlc-header-main",o=document.createElement("h1"),o.className="vlc-title",o.textContent=vt,_.appendChild(o),c=O("Copy again",()=>t.onCopyAgain()),c.classList.add("vlc-btn-header-copy"),c.disabled=!0,l=document.createElement("button"),l.type="button",l.className="vlc-btn vlc-btn-icon",l.addEventListener("click",Y);const F=document.createElement("div");F.className="vlc-header-actions",F.append(c,l),i.append(_,F);const D=document.createElement("div");D.className="vlc-body";const tt=document.createElement("div");tt.className="vlc-actions",s=O("Clip listing",()=>t.onClipListing()),g=O("Cancel",()=>t.onCancel()),g.disabled=!0,p=O("Copy again",()=>t.onCopyAgain()),p.disabled=!0;const Po=O("Clear model cache",()=>t.onClearModelCache()),Do=O("Diagnostics",()=>t.onToggleDiagnostics()),Mo=O("Settings",()=>t.onSettings());tt.append(s,g,p,Po,Do,Mo),r=document.createElement("div"),r.className="vlc-status",r.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const Oo=C.getElement();return D.append(tt,r,a,Oo),n.append(i,D),x.append(S,n),T(),y.appendChild(e),e}function O(y,x){const S=document.createElement("button");return S.type="button",S.className="vlc-btn",S.textContent=y,S.addEventListener("click",x),S}function Ft(y){r&&(r.textContent=y)}function u(y){s&&(s.disabled=!!y),g&&(g.disabled=!y)}function b(y){f=!!y,ht()}function L(y){const x=y||"Copy again";p&&(p.textContent=x),c&&(c.textContent=x)}function A(y=2e3){E!=null&&(clearTimeout(E),E=null);for(const x of[c,p])x&&x.classList.add("vlc-btn--copied");E=setTimeout(()=>{E=null;for(const x of[c,p])x?.classList.remove("vlc-btn--copied")},y)}function P(y,x=""){a&&(a.hidden=!y,a.textContent=x)}function yt(y,{phone:x=""}={}){C.showListing(y,{phone:x})}function Z(y){C.showSettings(y)}function Q(){C.hide()}function B(){E!=null&&(clearTimeout(E),E=null),i&&(i.removeEventListener("pointerdown",J),i.removeEventListener("pointermove",X),i.removeEventListener("pointerup",H),i.removeEventListener("pointercancel",H)),e?.remove(),e=null,n=null,i=null,o=null,r=null,a=null,s=null,g=null,p=null,c=null,l=null,d=!0,h="waiting",f=!1,m=null}return{mount:Bt,setStatus:Ft,setBusy:u,setCopyEnabled:b,setCopyLabel:L,flashCopySuccess:A,setCaptureStatus:mt,setDiagnostics:P,showListingForm:yt,showSettingsForm:Z,hideForm:Q,setMinimized:V,toggleMinimized:Y,destroy:B}}function jt(t){return t==null||t===""?"":String(t).replace(/[^\d]/g,"")||""}function Kt(t){return t==null||t===""?"":typeof t=="number"&&Number.isFinite(t)?String(Math.round(t)):String(t).replace(/[^\d]/g,"")||""}function Wt(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase();return e?e.includes("manual")?"MANUAL":e.includes("auto")||e.includes("cvt")||e.includes("dsg")||e.includes("eat")?"AUTOMÁTICA":String(t).trim().toUpperCase():""}function Yt(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return e?e.includes("gasolina")||e.includes("gasoline")||e==="petrol"?"GASOLINA":e.includes("diesel")||e.includes("gasoleo")||e.includes("gásóleo")?"DIESEL":e.includes("eletr")||e.includes("electr")?"ELÉTRICO":e.includes("hibr")||e.includes("hybrid")?"HÍBRIDO":e.includes("gpl")||e.includes("lpg")||e.includes("gnv")?"GPL":String(t).trim().toUpperCase():""}function Jt(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";const n=e.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const i=e.replace(",",".");return i==="1"?"1.0":i}function Xt(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";if(/\bcv\b/i.test(e)){const i=e.replace(/[^\d]/g,"");return i?`${i} CV`:e.toUpperCase().replace(/\s+/g," ")}const n=e.replace(/[^\d]/g,"");return n?`${n} CV`:e}function Zt(t){if(t==null||t==="")return"";const e=String(t).replace(/[^\d]/g,"");return e.length>=4?e.slice(0,4):e}function it(t){return t==null||t===""?"":String(t).trim().toUpperCase()}function M(t,e="https://www.olx.pt/"){if(t==null||t==="")return"";try{const n=new URL(String(t),e);let i=`${n.origin}${n.pathname}`;const r=i.toLowerCase().indexOf(".html");return r!==-1&&(i=i.slice(0,r+5)),i}catch{return""}}const Qt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",te='#mainContent img[data-testid="swiper-image-lazy"]',ee="#mainContent div.swiper-wrapper img",ne=[Qt,te,ee],oe='#mainContent button[data-testid="ad-contact-phone"]',ie='#mainContent a[data-testid="contact-phone"][href^="tel:"]',re='#mainContent [data-testid="ad-parameters-container"]',ae='#mainContent [data-testid="ad-price-container"] h3',wt='link#ssr_canonical[rel="canonical"]',se='#mainContent [data-testid="offer_title"]',ce='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',le='script[type="application/ld+json"]';function cn(t){return!!(t&&typeof t.click=="function")}function ue(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function G(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function rt(t){if(t.hidden)return!0;const n=ue(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function at(t){if(!t||typeof t.getBoundingClientRect!="function"||rt(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(G(t)>0)return!0;const n=ue(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function de(t=document){return[...t.querySelectorAll(oe)].filter(e=>cn(e))}function fe(t=document){const e=de(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=e.filter(s=>!rt(s)),o=[...n.length>0?n:e].sort((s,g)=>{const p=at(s)?1:0,c=at(g)?1:0;return p!==c?c-p:G(g)-G(s)}),r=(()=>{const s=o[0];return{visible:at(s)?1:0,area:G(s)}})(),a=o.filter(s=>(at(s)?1:0)===r.visible&&G(s)===r.area);return a[a.length-1]||o[o.length-1]||e[e.length-1]}function st(t=document){const e=[...t.querySelectorAll(ie)];for(const n of e){if(e.length>1&&rt(n))continue;const o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}if(e.length>0){const n=e[e.length-1],o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}return null}function ln(t){try{const e=Object.keys(t).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const i={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(i),!0}catch{return!1}}function un(t){try{t.click()}catch{}ln(t)}async function dn(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:i=250,signal:o}=t,r=st(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const a=de(e);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=fe(e),g=[];s&&g.push(s);for(const c of a)c!==s&&!rt(c)&&g.push(c);const p=Date.now()+n;for(const c of g){if(o?.aborted)return{ok:!1,reason:"cancelled"};un(c);const l=Math.min(p,Date.now()+5e3);for(;Date.now()<l;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const d=st(e);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,i))}}for(;Date.now()<p;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=st(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(l=>setTimeout(l,i))}return{ok:!1,reason:"timeout"}}function fn(t){const e=new Map,n=t.querySelector(re);if(!n)return e;for(const i of n.querySelectorAll("p")){const o=(i.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const r=o.indexOf(":");if(r<=0)continue;const a=o.slice(0,r).trim().toLowerCase(),s=o.slice(r+1).trim();a&&s&&e.set(a,s)}return e}function pn(t){const e=t.querySelectorAll(le);for(const n of e){const i=n.textContent||"";if(i.trim())try{const o=JSON.parse(i),r=Array.isArray(o)?o:[o];for(const a of r)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function gn(t){const n=(t.querySelector?.(wt)||(typeof document<"u"?document.querySelector(wt):null))?.getAttribute?.("href")||"";return n?M(n):typeof location<"u"&&location?.href?M(location.href):""}function mn(t){const e=t.querySelectorAll(ce);for(const n of e){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function hn(t){return t?.brand?typeof t.brand=="string"?t.brand:typeof t.brand?.name=="string"?t.brand.name:"":""}function bn(t,e){return e?.sku!=null&&String(e.sku).trim()?String(e.sku).trim():String(t).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function yn(t=document){const e=[],n=[];function i(I,R){R&&e.push(I)}const o=fn(t),r=pn(t),a=gn(t);i("url",a);const s=bn(a,r);i("listingId",s);const p=(t.querySelector(se)?.textContent||r?.name||"").replace(/\s+/g," ").trim();i("title",p);const c=String(r?.description||"").replace(/\s+/g," ").trim();i("description",c);let l=hn(r);l||(l=mn(t)),l=it(l),i("make",l);let d=o.get("modelo")||r?.model||"";d=it(d),i("model",d);let h=o.get("ano")||r?.productionDate||r?.modelDate||"";h=Zt(h),i("year",h);const f=jt(o.get("quilómetros")||o.get("quilometros")||"");i("mileageKm",f);const m=Wt(o.get("tipo de caixa")||"");i("transmission",m);const v=Yt(o.get("combustível")||o.get("combustivel")||"");i("fuel",v);const w=Jt(o.get("cilindrada")||"");i("engine",w);const E=Xt(o.get("potência")||o.get("potencia")||"");i("powerCv",E);let C=r?.offers?.price;(C==null||C==="")&&(C=t.querySelector(ae)?.textContent||"");const k=Kt(C);return i("priceEur",k),(!l||!d)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:p,description:c,make:l,model:d,year:h,mileageKm:f,transmission:m,fuel:v,engine:w,powerCv:E,priceEur:k,extractedFields:[...new Set(e)],warnings:n}}function vn(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),i=n[0],o=n[1];let r=null;return o&&/^\d+w$/i.test(o)&&(r=Number.parseInt(o,10)),{url:i,width:r}}).filter(e=>!!e.url)}function Cn(t){const e=vn(t);if(e.length===0)return null;const n=e.filter(o=>typeof o.width=="number");if(n.length===0)return e[e.length-1].url;let i=n[0];for(let o=1;o<n.length;o+=1)n[o].width>i.width&&(i=n[o]);return i.url}function pe(t){if(!t)return null;const e=Cn(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function En(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function ge(t=document){for(const e of ne){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function xt(t=document){const{images:e,selectorUsed:n}=ge(t),i=[],o=new Set;for(const r of e){const a=pe(r);if(!a)continue;const s=En(a);o.has(s)||(o.add(s),i.push(s))}return{urls:i,count:i.length,selectorUsed:n}}async function wn(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:i=100}=t;let o=xt(e);if(o.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,i)),o=xt(e);return o}const me={siteId:"olx-pt",discoverListingImages:xt,discoverListingImagesWithWait:wn,queryGalleryImages:ge,extractListing:yn,findPhoneRevealButton:fe,readRevealedPhone:st,revealContactPhone:dn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:Qt,FALLBACK_TESTID_SELECTOR:te,FALLBACK_SWIPER_IMG_SELECTOR:ee,GALLERY_SELECTORS:ne,PHONE_REVEAL_BUTTON_SELECTOR:oe,CONTACT_PHONE_SELECTOR:ie,AD_PARAMETERS_SELECTOR:re,AD_PRICE_SELECTOR:ae,CANONICAL_LINK_SELECTOR:wt,OFFER_TITLE_SELECTOR:se,BREADCRUMB_ITEM_SELECTOR:ce,JSON_LD_SELECTOR:le}},he="script#__NEXT_DATA__",be='h1.offer-title, [data-testid="summary-info-area"] h1',ye='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',ve='[data-testid="content-description-section"]',St='link[rel="canonical"]',ct='[data-testid="aside-seller-info"]',Ce='[data-testid="seller-info-contact-box"]',Ee='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',we='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',xe='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Se=[we,xe];function xn(t){return`[data-testid="${t}"] p:last-of-type`}const Sn=/ver\s+telefone/i;function Ln(t){return!!(t&&typeof t.click=="function")}function Le(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function Lt(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function q(t){if(t.hidden)return!0;const n=Le(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Ae(t){if(!t||typeof t.getBoundingClientRect!="function"||q(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Lt(t)>0)return!0;const n=Le(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function ke(t){if(!Ln(t)||t.closest('a[href^="tel:"]'))return!1;const e=(t.textContent||"").replace(/\s+/g," ").trim();return Sn.test(e)}function Ie(t=document){const e=[],n=new Set;function i(o){const r=t.querySelector?.(o)||null;if(r)for(const a of r.querySelectorAll("button"))!ke(a)||n.has(a)||(n.add(a),e.push(a))}i(ct),i(Ce);for(const o of t.querySelectorAll?.("button")||[])!ke(o)||n.has(o)||(n.add(o),e.push(o));return e}function Re(t=document){const e=Ie(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=t.querySelector?.(ct);if(n){const a=e.find(s=>n.contains(s)&&!q(s));if(a)return a}const i=e.filter(a=>!q(a));return[...i.length>0?i:e].sort((a,s)=>{const g=Ae(a)?1:0,p=Ae(s)?1:0;return g!==p?p-g:Lt(s)-Lt(a)})[0]||e[0]}function lt(t=document){const e=[...t.querySelectorAll?.(Ee)||[]],n=t.querySelector?.(ct),i=n&&e.length>1?[...e.filter(o=>n.contains(o)),...e.filter(o=>!n.contains(o))]:e;for(const o of i){if(i.length>1&&q(o))continue;const a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}if(i.length>0){const o=i[0],a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}return null}function An(t){try{const e=Object.keys(t).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const i={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(i),!0}catch{return!1}}function kn(t){try{t.click()}catch{}An(t)}async function In(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:i=250,signal:o}=t,r=lt(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const a=Ie(e);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=Re(e),g=[];s&&g.push(s);for(const c of a)c!==s&&!q(c)&&g.push(c);const p=Date.now()+n;for(const c of g){if(o?.aborted)return{ok:!1,reason:"cancelled"};kn(c);const l=Math.min(p,Date.now()+5e3);for(;Date.now()<l;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const d=lt(e);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,i))}}for(;Date.now()<p;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=lt(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(l=>setTimeout(l,i))}return{ok:!1,reason:"timeout"}}const At="https://www.standvirtual.com/";function _e(t){if(!t||typeof t!="object")return{value:"",label:""};const n=(Array.isArray(t.values)?t.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function z(t){const{value:e,label:n}=_e(t);return n||e}function ut(t){const{value:e,label:n}=_e(t);return e||n}function Te(t){const n=t.querySelector?.(he)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function Rn(t){const n=(t.querySelector?.(St)||(typeof document<"u"?document.querySelector(St):null))?.getAttribute?.("href")||"";return n?M(n,At):typeof location<"u"&&location?.href?M(location.href,At):""}function _n(t,e){const n=String(t).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:e?.id!=null&&String(e.id).trim()?String(e.id).trim():""}function N(t,e){return(t.querySelector?.(xn(e))?.textContent||"").replace(/\s+/g," ").trim()}function Tn(t){return String(t||"").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim()}function Pn(t=document){const e=[],n=[];function i(T,V){V&&e.push(T)}const o=Te(t),r=o?.parametersDict||{};let a="";o?.url&&(a=M(o.url,At)),a||(a=Rn(t)),i("url",a);const s=_n(a,o);i("listingId",s);const g=t.querySelector?.(be),p=(o?.title||g?.textContent||"").replace(/\s+/g," ").trim();i("title",p);let c="";o?.description&&(c=Tn(o.description)),c||(c=(t.querySelector?.(ve)?.textContent||"").replace(/\s+/g," ").trim()),i("description",c);let l=z(r.make)||N(t,"make")||"";l=it(l),i("make",l);let d=z(r.model)||N(t,"model")||"";d=it(d),i("model",d);let h=ut(r.first_registration_year)||N(t,"first_registration_year")||"";h=Zt(h),i("year",h);const f=jt(ut(r.mileage)||N(t,"mileage")||"");i("mileageKm",f);const m=Wt(z(r.gearbox)||N(t,"gearbox")||"");i("transmission",m);const v=Yt(z(r.fuel_type)||N(t,"fuel_type")||"");i("fuel",v);const w=ut(r.engine_capacity)||N(t,"engine_capacity")||"",E=/cm\s*3|cm3|\bcc\b/i.test(w)?w.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):w,C=Jt(E);i("engine",C);const k=Xt(ut(r.engine_power)||z(r.engine_power)||N(t,"engine_power")||"");i("powerCv",k);let I=o?.price?.value;(I==null||I==="")&&(I=t.querySelector?.(ye)?.textContent||"");const R=Kt(I);return i("priceEur",R),(!l||!d)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:p,description:c,make:l,model:d,year:h,mileageKm:f,transmission:m,fuel:v,engine:C,powerCv:k,priceEur:R,extractedFields:[...new Set(e)],warnings:n}}function Pe(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function Dn(t=document){const n=Te(t)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const i=[],o=new Set;for(const r of n){const a=r?.url||r?.src||"";if(!a)continue;const s=Pe(String(a));o.has(s)||(o.add(s),i.push(s))}return i.length===0?null:{urls:i,count:i.length,selectorUsed:"next-data:images.photos"}}function De(t=document){for(const e of Se){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function kt(t=document){const e=Dn(t);if(e)return e;const{images:n,selectorUsed:i}=De(t),o=[],r=new Set;for(const a of n){const s=pe(a);if(!s)continue;const g=Pe(s);r.has(g)||(r.add(g),o.push(g))}return{urls:o,count:o.length,selectorUsed:i}}async function Mn(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:i=100}=t;let o=kt(e);if(o.count>0||!!!(e.querySelector('[data-testid="main-gallery"]')||e.querySelector('[data-testid^="gallery-image-"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,i)),o=kt(e);return o}const Me={siteId:"standvirtual-pt",discoverListingImages:kt,discoverListingImagesWithWait:Mn,queryGalleryImages:De,extractListing:Pn,findPhoneRevealButton:Re,readRevealedPhone:lt,revealContactPhone:In,selectors:{PRIMARY_GALLERY_SELECTOR:we,FALLBACK_GALLERY_SELECTOR:xe,GALLERY_SELECTORS:Se,CONTACT_PHONE_SELECTOR:Ee,ASIDE_SELLER_SELECTOR:ct,CONTENT_CONTACT_SELECTOR:Ce,AD_PRICE_SELECTOR:ye,CANONICAL_LINK_SELECTOR:St,OFFER_TITLE_SELECTOR:be,DESCRIPTION_SELECTOR:ve,NEXT_DATA_SELECTOR:he}},Oe=new Map;function Ne(t){Oe.set(t.siteId,t)}function $e(t){return Oe.get(t)}function Be(t){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?$e("standvirtual-pt")||Me:$e("olx-pt")||me}Ne(me),Ne(Me);async function On(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let i=null;for(const o of n)try{const r=new Blob([t],{type:o});return await createImageBitmap(r)}catch(r){i=r}try{const o=new Blob([t]);return await createImageBitmap(o)}catch(o){throw i||o}}function Nn(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const i=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:i,width:e.width,height:e.height}}const It=new Map;function Rt(){return typeof GM<"u"&&GM!=null}async function Fe(t,e=null){return typeof GM_getValue=="function"?GM_getValue(t,e):Rt()&&typeof GM.getValue=="function"?GM.getValue(t,e):It.has(t)?It.get(t):e}async function Ve(t,e){if(typeof GM_setValue=="function"){GM_setValue(t,e);return}if(Rt()&&typeof GM.setValue=="function"){await GM.setValue(t,e);return}It.set(t,e)}async function $n(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(Rt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function He(t){const{method:e,url:n,responseType:i="arraybuffer",headers:o,signal:r}=t;return new Promise((a,s)=>{if(r?.aborted){s(new DOMException("Aborted","AbortError"));return}let g=null;const p=()=>{try{g?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",p,{once:!0}),(l=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){g=GM.xmlHttpRequest(l);return}if(typeof GM_xmlhttpRequest=="function"){g=GM_xmlhttpRequest(l);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:i,headers:o,onload(l){r?.removeEventListener("abort",p);const d=l.status;if(d<200||d>=300){s(new Error(`HTTP ${d} for ${n}`));return}a(l.response)},onerror(){r?.removeEventListener("abort",p),s(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",p),s(new Error(`Timeout for ${n}`))}})})}async function Bn(t,e={}){const{signal:n,request:i=He}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await i({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:o}}function Fn(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),i=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),o=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),a=Math.max(1,o-n),s=Math.max(1,r-i),g=document.createElement("canvas");g.width=t.width,g.height=t.height;const p=g.getContext("2d");return p.putImageData(t,0,0),p.getImageData(n,i,a,s)}function Vn(t,e,n){const i=document.createElement("canvas");i.width=t.width,i.height=t.height,i.getContext("2d").putImageData(t,0,0);const o=document.createElement("canvas");o.width=n,o.height=e;const r=o.getContext("2d");r.drawImage(i,0,0,n,e);const{data:a}=r.getImageData(0,0,n,e),s=new Uint8Array(1*e*n*3);let g=0;for(let p=0;p<e*n;p+=1)s[g++]=a[p*4],s[g++]=a[p*4+1],s[g++]=a[p*4+2];return s}function Hn(t,e,n=[114,114,114]){const{width:i,height:o}=t,r=Math.min(e/o,e/i),a=Math.round(i*r),s=Math.round(o*r),g=(e-a)/2,p=(e-s)/2,c=Math.round(p-.1),l=Math.round(g-.1),d=document.createElement("canvas");d.width=i,d.height=o,d.getContext("2d").putImageData(t,0,0);const f=document.createElement("canvas");f.width=e,f.height=e;const m=f.getContext("2d");m.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,m.fillRect(0,0,e,e),m.drawImage(d,0,0,i,o,l,c,a,s);const v=m.getImageData(0,0,e,e).data,w=new Float32Array(3*e*e),E=e*e;for(let C=0;C<E;C+=1){const k=v[C*4],I=v[C*4+1],R=v[C*4+2];w[C]=k/255,w[E+C]=I/255,w[2*E+C]=R/255}return{tensor:w,ratio:r,pad:{dw:g,dh:p},size:e}}function Un(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Gn="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",qn="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",zn="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",jn="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function Ue(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Gn},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:qn,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:zn},ortWasmBaseUrl:jn}}const dt={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Ge=null;function Kn(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function _t(){const t=Kn();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const qe=new Proxy({},{get(t,e){return _t()[e]}});function Wn(){const t=_t(),e=Ue();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function ze(t,e={}){Wn();const n=_t(),i=e.prefer||["webgpu","wasm"],o=[];for(const r of i)try{const a=await n.InferenceSession.create(t,{executionProviders:[r]});return Ge=r,{session:a,provider:r}}catch(a){o.push(`${r}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Tt(){return Ge}const Pt=384,Yn="images",Jn="output0";async function Xn(t,e,n={}){const i=n.confThresh??.4,{tensor:o,ratio:r,pad:a}=Hn(e,Pt),s=new qe.Tensor("float32",o,[1,3,Pt,Pt]),g=await t.run({[Yn]:s}),p=g[Jn]||Object.values(g)[0];if(!p)return[];const c=p.data,l=p.dims||[],d=l.length>=2?l[l.length-1]:7,h=Math.floor(c.length/d),f=[];for(let m=0;m<h;m+=1){const v=m*d,w=c[v+1],E=c[v+2],C=c[v+3],k=c[v+4],I=c[v+5],R=c[v+6];if(R<i)continue;const T=Un({x1:w,y1:E,x2:C,y2:k},r,a);f.push({...T,score:Number(R),classId:Number(I)})}return f.sort((m,v)=>v.score-m.score),f}function Zn(t,e,n=dt){const i=n.alphabet,o=n.maxPlateSlots,r=i.length,a=t,s=[],g=[];for(let c=0;c<o;c+=1){let l=0,d=-1/0;for(let h=0;h<r;h+=1){const f=Number(a[c*r+h]);f>d&&(d=f,l=h)}s.push(i[l]),g.push(d)}let p=s.join("");return n.padChar&&(p=p.replace(new RegExp(`${Qn(n.padChar)}+$`),"")),{text:p,charProbs:g.slice(0,Math.max(p.length,1))}}function Qn(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function to(t,e){const{imgHeight:n,imgWidth:i}=dt,o=Vn(e,n,i),r=new qe.Tensor("uint8",o,[1,n,i,3]),a=await t.run({input:r}),s=a.plate||Object.values(a)[0],g=s.dims||[1,dt.maxPlateSlots,dt.alphabet.length],p=g[g.length-1],l=g[g.length-2]*p,d=s.data,h=d.length>=l?d.slice(0,l):d;return Zn(h)}const j="[A-Z]",K="[0-9]",eo=[{id:"LLDDDD",re:new RegExp(`^${j}{2}${K}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${K}{4}${j}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${K}{2}${j}{2}${K}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${j}{2}${K}{2}${j}{2}$`)}],no={0:"O",1:"I",5:"S",8:"B"},oo={O:"0",I:"1",L:"1",S:"5",B:"8"};function ft(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function U(t){const e=ft(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function io(t){const e=ft(t);if(e.length!==6)return null;for(const n of eo)if(n.re.test(e))return n.id;return null}function Dt(t,e){const n=ft(t).slice(0,6).split("");if(n.length!==6)return[];const i=[];function o(r,a,s){if(a>e)return;if(r===6){const l=s.join(""),d=io(l);d&&i.push({plate:l,corrections:a,patternId:d});return}if(o(r+1,a,s),a>=e)return;const g=s[r],p=no[g];if(p){const l=s.slice();l[r]=p,o(r+1,a+1,l)}const c=oo[g];if(c){const l=s.slice();l[r]=c,o(r+1,a+1,l)}}return o(0,0,n),i.sort((r,a)=>r.corrections-a.corrections||a.plate.localeCompare(r.plate)),i}function je(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let i=0;for(let o=0;o<n;o+=1)i+=t[o]??0;return i/n}function ro(t,e=[],n={}){const i=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,r=ft(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:U(r),patternId:null,corrections:0,meanConfidence:je(e,r.length),reason:"too-short"};const a=r.slice(0,6),s=je(e,6),g=Dt(a,0);if(g.length>0&&s>=i){const l=g[0];return{accepted:!0,plate:l.plate,plateFormatted:U(l.plate),patternId:l.patternId,corrections:0,meanConfidence:s}}const p=Dt(a,1).filter(l=>l.corrections===1);if(p.length>0&&s>=o){const l=p[0];return{accepted:!0,plate:l.plate,plateFormatted:U(l.plate),patternId:l.patternId,corrections:1,meanConfidence:s}}return Dt(a,2).some(l=>l.corrections>1)&&g.length===0&&p.length===0?{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:g.length>0||p.length>0?{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:g.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:U(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const $="models",ao=1;let pt=null;function Mt(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):pt||(pt=new Promise((t,e)=>{const n=indexedDB.open(Vt,ao);n.onupgradeneeded=()=>{const i=n.result;i.objectStoreNames.contains($)||i.createObjectStore($,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),pt)}async function Ke(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function so(t){const e=await Mt();return new Promise((n,i)=>{const r=e.transaction($,"readonly").objectStore($).get(t);r.onsuccess=()=>{const a=r.result;n(a?.bytes||null)},r.onerror=()=>i(r.error)})}async function co(t,e,n){const i=await Mt();return new Promise((o,r)=>{const a=i.transaction($,"readwrite");a.objectStore($).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>o(),a.onerror=()=>r(a.error)})}async function lo(){const t=await Mt();return new Promise((e,n)=>{const i=t.transaction($,"readwrite");i.objectStore($).clear(),i.oncomplete=()=>e(),i.onerror=()=>n(i.error)})}async function We(t,e={}){const{onStatus:n,signal:i}=e,o=await so(t.id).catch(()=>null);if(o&&await Ke(o)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await He({method:"GET",url:t.url,responseType:"arraybuffer",signal:i}),a=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const s=await Ke(a);if(s!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${s}`);return await co(t.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let W=null;async function uo(t={}){if(W)return{sessions:W,diagnostics:{provider:Tt(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=Ue(),n=await We(e.detector,t),i=await We(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const o=await ze(n.bytes),r=await ze(i.bytes);return W={detector:o.session,ocr:r.session},{sessions:W,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:i.cacheHit}}}function fo(){W=null}async function po(t,e,n={}){const{signal:i}=n;let o=0,r;try{const s=await On(e);r=Nn(s).imageData,s.close?.()}catch{return null}const a=await Xn(t.detector,r);for(const s of a){if(i?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const g=Fn(r,s),p=await to(t.ocr,g),c=ro(p.text,p.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function go(t,e={}){const n=Date.now(),{onStatus:i,signal:o,request:r}=e,a=t.length,s=await uo({onStatus:i,signal:o}),{detector:g,ocr:p}=s.sessions;let c=0,l=0;for(let d=0;d<a;d+=1){if(o?.aborted)return gt("cancelled",s.diagnostics,l,c,n);const h=t[d];i?.(`Downloading image ${d+1} of ${a}`);let f;try{f=await Bn(h,{signal:o,request:r})}catch(v){if(o?.aborted||v?.name==="AbortError")return gt("cancelled",s.diagnostics,l,c,n);i?.(`Failed to download image ${d+1} of ${a}, skipping…`);continue}i?.(`Scanning image ${d+1} of ${a}`),l+=1;let m;try{m=await po({detector:g,ocr:p},f.bytes,{signal:o})}catch(v){if(o?.aborted||v?.name==="AbortError")return gt("cancelled",s.diagnostics,l,c,n);continue}finally{f=null}if(m&&(c+=m.detectionsTried,m.plate))return{ok:!0,plate:m.plate,plateFormatted:m.plateFormatted,diagnostics:{provider:Tt()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:l,detectionsTried:c,elapsedMs:Date.now()-n}}}return gt("no-reliable-plate",s.diagnostics,l,c,n)}function gt(t,e,n,i,o){return{ok:!1,reason:t,diagnostics:{provider:Tt()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:i,elapsedMs:Date.now()-o}}}async function Ye(t){return await $n(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Je(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function mo({plate:t,phone:e,fallbackId:n}={}){const i=t==null?"":String(t).trim();if(i)return i;const o=e==null?"":String(e).trim();if(o)return o;const r=n==null?"":String(n).trim();return r||Je()}function ho(t){const e=/^ID:\s*(.+)\s*$/m.exec(String(t||""));return e?e[1].trim():""}function bo(t,{phone:e="",fallbackId:n=""}={}){const i=t||{},o=e==null?"":String(e).trim(),r=i.plate==null?"":String(i.plate).trim(),s=[`ID: ${mo({plate:r,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const p of Et){if(p==="url")continue;const c=Ut[p];let l=i[p]==null?"":String(i[p]);p==="customerValueEur"&&l&&!/€/.test(l)&&(l=`${l} €`),s.push(`${c}: ${l}`)}const g=i.url==null?"":String(i.url);return s.push(""),s.push(g),s.join(`
`)}function yo(t){const e={source:t.source,vehicle:{plate:t.fields.plate,make:t.fields.make,model:t.fields.model,year:t.fields.year,mileageKm:t.fields.mileageKm,transmission:t.fields.transmission,fuel:t.fields.fuel,engine:t.fields.engine,powerCv:t.fields.powerCv},valuation:{paintParts:t.fields.paintParts,bodyParts:t.fields.bodyParts,tires:t.fields.tires,customerValueEur:t.fields.customerValueEur,saleReason:t.fields.saleReason,keyCount:t.fields.keyCount,deductibleVat:t.fields.deductibleVat},url:t.fields.url,origins:t.origins,metadata:t.metadata};return JSON.stringify(e,null,2)}const vo="listingCache",Co=2880*60*1e3;function Xe(){return`${et}${vo}`}function Ot(t){if(!t||typeof t!="object")return!1;const e=t;return typeof e.processedAt=="number"&&Number.isFinite(e.processedAt)&&typeof e.phone=="string"&&typeof e.clipboard=="string"&&e.listingRecord!=null&&typeof e.listingRecord=="object"}function Eo(t){if(!t||typeof t!="object"||Array.isArray(t))return{};const e={};for(const[n,i]of Object.entries(t))typeof n=="string"&&n&&Ot(i)&&(e[n]={processedAt:i.processedAt,phone:i.phone,clipboard:i.clipboard,fallbackId:typeof i.fallbackId=="string"?i.fallbackId:"",listingRecord:i.listingRecord});return e}async function wo(){const t=await Fe(Xe(),{});return Eo(t)}async function Nt(t){await Ve(Xe(),t)}async function $t(t=Date.now()){const e=await wo(),n={};let i=!1;for(const[o,r]of Object.entries(e))t-r.processedAt<=Co?n[o]=r:i=!0;return(i||Object.keys(n).length!==Object.keys(e).length)&&await Nt(n),n}async function xo(t,e=Date.now()){const n=typeof t=="string"?t.trim():"";if(!n)return null;const o=(await $t(e))[n];return o&&Ot(o)?o:null}async function So(t,e,n=Date.now()){const i=typeof t=="string"?t.trim():"";if(!i||!Ot(e))return null;const o=await $t(n),r={processedAt:e.processedAt,phone:e.phone,clipboard:e.clipboard,fallbackId:typeof e.fallbackId=="string"?e.fallbackId:"",listingRecord:e.listingRecord};return o[i]=r,await Nt(o),r}async function Lo(t,e=Date.now()){const n=typeof t=="string"?t.trim():"";if(!n)return!1;const i=await $t(e);return n in i?(delete i[n],await Nt(i),!0):!1}const Ze="valuationDefaults";async function Ao(t,e=null){return Fe(`${et}${t}`,e)}async function ko(t,e){await Ve(`${et}${t}`,e)}async function Qe(){const t=await Ao(Ze,null);return!t||typeof t!="object"?{...ot}:{...ot,...t}}async function Io(t){const e={...ot,...t};return await ko(Ze,e),e}const Ro=5e3;function _o(){let t=Ht(),e=null,n=null,i=null,o="",r=0;function a(u){u&&e?.setCaptureStatus(u)}function s(){try{const u=Be().extractListing(document);if(u?.url)return M(u.url)}catch{}return typeof location<"u"&&location?.href?M(location.href):""}function g(u,b){const L=b.listingRecord,A=b.phone||"",P=L?.fields?.plate||"",Z=!String(P).trim()&&!String(A).trim()&&(b.fallbackId||ho(b.clipboard))||"";o=u,r=b.processedAt,t={...t,lastPlate:P,lastPhone:A,lastClipboard:b.clipboard||"",fallbackId:Z,listingRecord:L,view:"form"},e?.showListingForm(L,{phone:A}),e?.setCopyEnabled(!!b.clipboard),e?.setCopyLabel("Copy"),a("data ready to copy"),f("Data ready to copy")}function p(u,b=""){const L=u?.fields?.plate||"",A=b==null?"":String(b).trim();let P=t.fallbackId||"";return!String(L).trim()&&!A&&(P||(P=Je()),t={...t,fallbackId:P}),bo(u.fields,{phone:A,fallbackId:t.fallbackId})}async function c(u){const b=o||M(u.listingRecord?.fields?.url||"")||s();if(!b||!u.listingRecord||!u.clipboard)return;const L=u.processedAt??r??Date.now();o=b,r=L,await So(b,{processedAt:L,phone:u.phone??t.lastPhone??"",clipboard:u.clipboard,fallbackId:u.fallbackId??t.fallbackId??"",listingRecord:u.listingRecord})}async function l(){try{const u=s();if(u){const b=await xo(u);if(b){if(qt(b.listingRecord,{plate:b.listingRecord?.fields?.plate,phone:b.phone})){g(u,b);return}await Lo(u)}}}catch{}h()}function d(){i!=null&&(clearTimeout(i),i=null)}function h(){d(),a("waiting"),i=setTimeout(()=>{i=null,k()},Ro)}function f(u){t={...t,statusMessage:u},e?.setStatus(u)}function m(u){t={...t,busy:u,view:u?"reading":t.listingRecord?"form":"idle"},e?.setBusy(u),u&&a("reading")}function v(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const u=t.lastDiagnostics;if(!u){e?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}e?.setDiagnostics(!0,[`Provider: ${u.provider||"n/a"}`,`Detector cache: ${u.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${u.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${u.imagesScanned??0}`,`Detections tried: ${u.detectionsTried??0}`,`Elapsed: ${u.elapsedMs??0} ms`].join(`
`))}function w(u,b,L){const A=[];return b.plate?A.push(`Plate found: ${b.plate}`):A.push("No reliable plate found."),b.phone&&A.push(`Phone: ${b.phone}`),(u.fields.make||u.fields.model)&&A.push(`Listing: ${[u.fields.make,u.fields.model].filter(Boolean).join(" ")}`.trim()),A.push(L),A.join(`
`)}function E(u){t={...t,lastClipboard:u},e?.setCopyEnabled(!!u)}async function C(u){return E(u),Ye(u)}async function k(){if(d(),t.busy)return;n=new AbortController;const{signal:u}=n;m(!0);try{const b=Be(),L=await Qe();f("Revealing phone (if available)…");const A=b.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:u});f("Extracting listing fields…");const P=b.extractListing(document);f("Looking for listing images…");const yt=await b.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:Z,count:Q}=yt;let B={ok:!1,reason:"no-images"};Q>0?(f(`Found ${Q} listing images — scanning…`),f("Loading plate recognition models…"),B=await go(Z,{signal:u,onStatus:f}),t={...t,lastDiagnostics:B.diagnostics},v()):f("No listing images — checking phone…");const y=await A,x=B.ok&&B.plate?B.plate:"",S=y.ok?y.phone:"";if(u.aborted||B.reason==="cancelled"){f("Cancelled.");return}const _=nn({extracted:P,plate:x,defaults:L});if(t={...t,lastPlate:x,lastPhone:S,fallbackId:"",listingRecord:_,view:"form"},e?.showListingForm(_,{phone:S}),!qt(_,{plate:x,phone:S})){E(""),e?.setCopyLabel("Copy"),a("No data found."),f("No data found.");return}const F=p(_,S);E(F),e?.setCopyLabel("Copy"),a("data ready to copy"),o=M(_.fields.url||"")||s(),r=Date.now(),await c({clipboard:F,phone:S,listingRecord:_,processedAt:r,fallbackId:t.fallbackId});let D=w(_,{plate:x,phone:S},"Data ready to copy");x&&!S&&y.reason==="timeout"?D+=`
Phone reveal timed out.`:x&&!S&&y.reason==="no-button"&&(D+=`
No phone button on this listing.`),Q===0&&!S&&y.reason==="no-button"&&(D+=`
No listing images found.`),f(D)}catch(b){if(u.aborted){f("Cancelled.");return}const L=b instanceof Error?b.message:"Unknown recognition error";f(`Failed: ${L}`)}finally{n=null,m(!1)}}function I(){n?.abort()}async function R(){let u=t.lastClipboard;if(t.listingRecord&&(u=p(t.listingRecord,t.lastPhone),t={...t,lastClipboard:u},e?.setCopyEnabled(!!u)),!u){f("Nothing to copy yet.");return}const b=await Ye(u);b.ok&&(a("data copied"),e?.setCopyLabel("Copy again"),e?.flashCopySuccess(),await c({clipboard:u,phone:t.lastPhone,listingRecord:t.listingRecord,processedAt:r||Date.now(),fallbackId:t.fallbackId})),f(b.ok?"Data copied":"Clipboard copy failed.")}async function T(){if(!t.listingRecord){f("No listing to copy yet. Run Clip listing.");return}const u=p(t.listingRecord,t.lastPhone),b=await C(u);b.ok&&(a("data copied"),e?.setCopyLabel("Copy again"),await c({clipboard:u,phone:t.lastPhone,listingRecord:t.listingRecord,processedAt:r||Date.now(),fallbackId:t.fallbackId})),f(b.ok?"Data copied":"Clipboard copy failed.")}async function V(){const u=t.listingRecord?.fields?.plate||t.lastPlate||"";if(!u){f("No plate to copy.");return}const b=await C(u);f(b.ok?`Plate copied: ${u}`:"Clipboard copy failed.")}async function Y(){if(!t.listingRecord){f("No listing to copy yet. Run Clip listing.");return}const u=yo(t.listingRecord),b=await C(u);f(b.ok?"JSON copied to clipboard.":"Clipboard copy failed.")}function mt(u,b){if(u==="phone"){t={...t,lastPhone:b==null?"":String(b)};return}if(!t.listingRecord)return;const L=on(t.listingRecord,u,b);t={...t,listingRecord:L,lastPlate:u==="plate"?b:t.lastPlate}}async function ht(){try{await lo(),fo(),f("Model cache cleared.")}catch(u){const b=u instanceof Error?u.message:"Failed to clear cache";f(b)}}function bt(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},v(),f(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function J(){if(t.busy)return;const u=await Qe();t={...t,view:"settings"},e?.showSettingsForm(u),f(`Settings. Environment: production. Storage: ${et}* / ${Vt}.`)}function X(){t={...t,view:t.listingRecord?"form":"idle"},t.listingRecord?(e?.showListingForm(t.listingRecord,{phone:t.lastPhone}),f("Back to listing review.")):(e?.hideForm(),f("Settings closed."))}async function H(u){await Io(u),f("Defaults saved.")}function Bt(u=document.body){return e||(e=sn({onClipListing:k,onCancel:I,onCopyAgain:R,onClearModelCache:ht,onToggleDiagnostics:bt,onSettings:J,onFieldChange:mt,onCopyFullText:T,onCopyPlateOnly:V,onCopyJson:Y,onSettingsBack:X,onSaveDefaults:H}),e.mount(u),e.setMinimized(!0),l(),e)}function O(){d(),n?.abort(),n=null,e?.destroy(),e=null,o="",r=0,t=Ht()}function Ft(){return t}return{mount:Bt,destroy:O,onClipListing:k,onCancel:I,onCopyAgain:R,onCopyFullText:T,onCopyPlateOnly:V,onCopyJson:Y,onFieldChange:mt,onClearModelCache:ht,onToggleDiagnostics:bt,onSettings:J,onSettingsBack:X,onSaveDefaults:H,getState:Ft,setStatus:f}}function To(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[Ct])return{started:!1,reason:"already-initialized"};if(document.getElementById(nt))return window[Ct]=!0,{started:!1,reason:"panel-exists"};window[Ct]=!0;const t=_o(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}To()})();
