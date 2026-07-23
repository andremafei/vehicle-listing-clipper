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
(function(){"use strict";const Re="Vehicle Listing Clipper",ge="vlc_prod_",et="vehicle-listing-clipper",De="__VLC_PROD_INITIALIZED__",he="vlc-panel-root";function tt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const be={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},$e=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],nt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},ot=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function vn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function xn(e={}){return{...be,...e}}function Cn({extracted:e=null,plate:t="",defaults:n={}}={}){const r=xn(n),o=vn(),i={},a=[],s=[],f=[],d=[...e?.warnings||[]];function l(u,b,p){const y=b==null?"":String(b);if(o[u]=y,!y){i[u]="missing";return}i[u]=p,p==="extracted"||p==="anpr"?a.push(u):p==="default"&&s.push(u)}const c=t?String(t).trim():"";return l("plate",c,c?"anpr":"missing"),l("make",e?.make||"",e?.make?"extracted":"missing"),l("model",e?.model||"",e?.model?"extracted":"missing"),l("year",e?.year||"",e?.year?"extracted":"missing"),l("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),l("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),l("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),l("engine",e?.engine||"",e?.engine?"extracted":"missing"),l("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),l("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),l("url",e?.url||"",e?.url?"extracted":"missing"),l("paintParts",r.paintParts,"default"),l("bodyParts",r.bodyParts,"default"),l("tires",r.tires,"default"),l("saleReason",r.saleReason,"default"),l("keyCount",r.keyCount,"default"),l("deductibleVat",r.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||""},fields:o,origins:i,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:f,warnings:d}}}function rt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function wn(e,t,n){const r=n==null?"":String(n),o={...e.fields,[t]:r},i={...e.origins,[t]:r?"edited":"missing"},a=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:o,origins:i,source:{...e.source,url:t==="url"?r:e.source.url},metadata:{...e.metadata,editedFields:a}}}function it(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function En(e){let t=null;const n=new Map;let r="listing";function o(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function a(u,b,p="missing",y){const m=document.createElement("label");m.className=`vlc-field ${it(p)}`,m.dataset.field=u;const h=document.createElement("span");h.className="vlc-field-label",h.textContent=y||nt[u]||u;const v=document.createElement("span");v.className="vlc-field-origin",v.textContent=p;const C=document.createElement("input");C.type="text",C.className="vlc-field-input",C.value=b??"",C.dataset.field=u,C.addEventListener("input",()=>{r==="listing"&&(e.onFieldChange(u,C.value),m.className=`vlc-field ${it("edited")}`,v.textContent="edited")}),h.appendChild(v),m.append(h,C),n.set(u,C),t?.appendChild(m)}function s(){const u=document.createElement("div");u.className="vlc-form-actions";const b=document.createElement("button");b.type="button",b.className="vlc-btn vlc-btn-primary",b.textContent="Copy full text",b.addEventListener("click",()=>e.onCopyFullText());const p=document.createElement("button");p.type="button",p.className="vlc-btn",p.textContent="Copy plate only",p.addEventListener("click",()=>e.onCopyPlateOnly()),u.append(b,p),t?.appendChild(u)}function f(u,{phone:b=""}={}){r="listing",o(),i(),t.hidden=!1;const p=document.createElement("div");p.className="vlc-form-heading",p.textContent="Review listing",t.appendChild(p);const y=b==null?"":String(b).trim();a("phone",y,y?"extracted":"missing","Telefone");for(const m of $e)a(m,u.fields[m]||"",u.origins[m]||"missing");s()}function d(u){r="settings",o(),i(),t.hidden=!1;const b=document.createElement("div");b.className="vlc-form-heading",b.textContent="Default values",t.appendChild(b);for(const h of ot)a(h,u[h]||"","default");const p=document.createElement("div");p.className="vlc-form-actions";const y=document.createElement("button");y.type="button",y.className="vlc-btn vlc-btn-primary",y.textContent="Save defaults",y.addEventListener("click",()=>{const h={};for(const v of ot)h[v]=n.get(v)?.value??"";e.onSaveDefaults?.(h)});const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Back",m.addEventListener("click",()=>e.onBack?.()),p.append(y,m),t.appendChild(p)}function l(){t&&(t.hidden=!0)}function c(u,{phone:b}={}){if(r==="listing"){if(b!==void 0){const p=n.get("phone");p&&document.activeElement!==p&&(p.value=b==null?"":String(b))}for(const p of $e){const y=n.get(p);y&&document.activeElement!==y&&(y.value=u.fields[p]||"")}}}return{ensureRoot:o,showListing:f,showSettings:d,syncListingValues:c,hide:l,getMode:()=>r,getElement:()=>o()}}const Sn=`
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
`;function Ln(e){let t=null,n=null,r=null,o=null,i=null,a=null,s=null,f=null,d=null,l=null,c=null,u=!0,b="waiting",p=!1,y=null,m=0,h=0,v=null;const C=En({onFieldChange:(x,A)=>e.onFieldChange(x,A),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:x=>e.onSaveDefaults(x)});function w(){o&&(o.textContent=u?b:Re)}const k='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',S='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function _(){!n||!c||(n.classList.toggle("vlc-panel--minimized",u),c.innerHTML=u?k:S,c.setAttribute("aria-label",u?"Expand panel":"Minimize panel"),c.title=u?"Expand":"Minimize",w())}function T(x){u=!!x,_()}function O(){T(!u)}function L(x){b=x,w()}function $(){d&&(d.disabled=!p),l&&(l.disabled=!p)}function N(x,A){if(!n)return;const I=n.getBoundingClientRect(),W=Math.max(0,window.innerWidth-I.width),H=Math.max(0,window.innerHeight-I.height),pe=Math.min(Math.max(0,x),W),me=Math.min(Math.max(0,A),H);n.style.left=`${pe}px`,n.style.top=`${me}px`,n.style.right="auto",n.style.bottom="auto"}function B(x){if(!n||!r||x.target?.closest("button")||x.button!==0)return;const I=n.getBoundingClientRect();y=x.pointerId,m=x.clientX-I.left,h=x.clientY-I.top,r.classList.add("vlc-header--dragging"),r.setPointerCapture(x.pointerId),x.preventDefault()}function P(x){y===x.pointerId&&N(x.clientX-m,x.clientY-h)}function V(x){y===x.pointerId&&(y=null,r?.classList.remove("vlc-header--dragging"),r?.hasPointerCapture(x.pointerId)&&r.releasePointerCapture(x.pointerId))}function J(x=document.body){if(document.getElementById(he))return t=document.getElementById(he),t;t=document.createElement("div"),t.id=he,t.setAttribute("data-vlc-panel","1");const A=t.attachShadow({mode:"open"}),I=document.createElement("style");I.textContent=Sn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Re),r=document.createElement("div"),r.className="vlc-header",r.addEventListener("pointerdown",B),r.addEventListener("pointermove",P),r.addEventListener("pointerup",V),r.addEventListener("pointercancel",V);const W=document.createElement("div");W.className="vlc-header-main",o=document.createElement("h1"),o.className="vlc-title",o.textContent=Re,W.appendChild(o),l=M("Copy again",()=>e.onCopyAgain()),l.classList.add("vlc-btn-header-copy"),l.disabled=!0,c=document.createElement("button"),c.type="button",c.className="vlc-btn vlc-btn-icon",c.addEventListener("click",O);const H=document.createElement("div");H.className="vlc-header-actions",H.append(l,c),r.append(W,H);const pe=document.createElement("div");pe.className="vlc-body";const me=document.createElement("div");me.className="vlc-actions",s=M("Clip listing",()=>e.onClipListing()),f=M("Cancel",()=>e.onCancel()),f.disabled=!0,d=M("Copy again",()=>e.onCopyAgain()),d.disabled=!0;const vr=M("Clear model cache",()=>e.onClearModelCache()),xr=M("Diagnostics",()=>e.onToggleDiagnostics()),Cr=M("Settings",()=>e.onSettings());me.append(s,f,d,vr,xr,Cr),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const wr=C.getElement();return pe.append(me,i,a,wr),n.append(r,pe),A.append(I,n),_(),x.appendChild(t),t}function M(x,A){const I=document.createElement("button");return I.type="button",I.className="vlc-btn",I.textContent=x,I.addEventListener("click",A),I}function g(x){i&&(i.textContent=x)}function E(x){s&&(s.disabled=!!x),f&&(f.disabled=!x)}function R(x){p=!!x,$()}function D(x){const A=x||"Copy again";d&&(d.textContent=A),l&&(l.textContent=A)}function U(x=2e3){v!=null&&(clearTimeout(v),v=null);for(const A of[l,d])A&&A.classList.add("vlc-btn--copied");v=setTimeout(()=>{v=null;for(const A of[l,d])A?.classList.remove("vlc-btn--copied")},x)}function oe(x,A=""){a&&(a.hidden=!x,a.textContent=A)}function Z(x,{phone:A=""}={}){C.showListing(x,{phone:A})}function fe(x){C.showSettings(x)}function K(){C.hide()}function Q(){v!=null&&(clearTimeout(v),v=null),r&&(r.removeEventListener("pointerdown",B),r.removeEventListener("pointermove",P),r.removeEventListener("pointerup",V),r.removeEventListener("pointercancel",V)),t?.remove(),t=null,n=null,r=null,o=null,i=null,a=null,s=null,f=null,d=null,l=null,c=null,u=!0,b="waiting",p=!1,y=null}return{mount:J,setStatus:g,setBusy:E,setCopyEnabled:R,setCopyLabel:D,flashCopySuccess:U,setCaptureStatus:L,setDiagnostics:oe,showListingForm:Z,showSettingsForm:fe,hideForm:K,setMinimized:T,toggleMinimized:O,destroy:Q}}function at(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function st(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function lt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function ct(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function dt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const r=t.replace(",",".");return r==="1"?"1.0":r}function ut(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const r=t.replace(/[^\d]/g,"");return r?`${r} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function ft(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function ye(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function ve(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function kn(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return ve(t)}function G(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let r=`${n.origin}${n.pathname}`;const i=r.toLowerCase().indexOf(".html");return i!==-1&&(r=r.slice(0,i+5)),r}catch{return""}}const pt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",mt='#mainContent img[data-testid="swiper-image-lazy"]',gt="#mainContent div.swiper-wrapper img",ht=[pt,mt,gt],bt='#mainContent button[data-testid="ad-contact-phone"]',yt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',vt='#mainContent [data-testid="ad-parameters-container"]',xt='#mainContent [data-testid="ad-price-container"] h3',Me='link#ssr_canonical[rel="canonical"]',Ct='#mainContent [data-testid="offer_title"]',wt='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Et='script[type="application/ld+json"]';function An(e){return!!(e&&typeof e.click=="function")}function St(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function re(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function xe(e){if(e.hidden)return!0;const n=St(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Ce(e){if(!e||typeof e.getBoundingClientRect!="function"||xe(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(re(e)>0)return!0;const n=St(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Lt(e=document){return[...e.querySelectorAll(bt)].filter(t=>An(t))}function kt(e=document){const t=Lt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(s=>!xe(s)),o=[...n.length>0?n:t].sort((s,f)=>{const d=Ce(s)?1:0,l=Ce(f)?1:0;return d!==l?l-d:re(f)-re(s)}),i=(()=>{const s=o[0];return{visible:Ce(s)?1:0,area:re(s)}})(),a=o.filter(s=>(Ce(s)?1:0)===i.visible&&re(s)===i.area);return a[a.length-1]||o[o.length-1]||t[t.length-1]}function we(e=document){const t=[...e.querySelectorAll(yt)];for(const n of t){if(t.length>1&&xe(n))continue;const o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const i=(n.textContent||"").replace(/\D/g,"");if(i)return i}if(t.length>0){const n=t[t.length-1],o=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(o?.[1])return o[1];const i=(n.textContent||"").replace(/\D/g,"");if(i)return i}return null}function _n(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function In(e){try{e.click()}catch{}_n(e)}async function Pn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=we(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const a=Lt(t);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=kt(t),f=[];s&&f.push(s);for(const l of a)l!==s&&!xe(l)&&f.push(l);const d=Date.now()+n;for(const l of f){if(o?.aborted)return{ok:!1,reason:"cancelled"};In(l);const c=Math.min(d,Date.now()+5e3);for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=we(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(b=>setTimeout(b,r))}}for(;Date.now()<d;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=we(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(c=>setTimeout(c,r))}return{ok:!1,reason:"timeout"}}function Tn(e){const t=new Map,n=e.querySelector(vt);if(!n)return t;for(const r of n.querySelectorAll("p")){const o=(r.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const i=o.indexOf(":");if(i<=0)continue;const a=o.slice(0,i).trim().toLowerCase(),s=o.slice(i+1).trim();a&&s&&t.set(a,s)}return t}function Rn(e){const t=e.querySelectorAll(Et);for(const n of t){const r=n.textContent||"";if(r.trim())try{const o=JSON.parse(r),i=Array.isArray(o)?o:[o];for(const a of i)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function Dn(e){const n=(e.querySelector?.(Me)||(typeof document<"u"?document.querySelector(Me):null))?.getAttribute?.("href")||"";return n?G(n):typeof location<"u"&&location?.href?G(location.href):""}function $n(e){const t=e.querySelectorAll(wt);for(const n of t){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function Mn(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function Nn(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function On(e=document){const t=[],n=[];function r(k,S){S&&t.push(k)}const o=Tn(e),i=Rn(e),a=Dn(e);r("url",a);const s=Nn(a,i);r("listingId",s);const d=(e.querySelector(Ct)?.textContent||i?.name||"").replace(/\s+/g," ").trim();r("title",d);const l=ve(i?.description||"");r("description",l);let c=Mn(i);c||(c=$n(e)),c=ye(c),r("make",c);let u=o.get("modelo")||i?.model||"";u=ye(u),r("model",u);let b=o.get("ano")||i?.productionDate||i?.modelDate||"";b=ft(b),r("year",b);const p=at(o.get("quilómetros")||o.get("quilometros")||"");r("mileageKm",p);const y=lt(o.get("tipo de caixa")||"");r("transmission",y);const m=ct(o.get("combustível")||o.get("combustivel")||"");r("fuel",m);const h=dt(o.get("cilindrada")||"");r("engine",h);const v=ut(o.get("potência")||o.get("potencia")||"");r("powerCv",v);let C=i?.offers?.price;(C==null||C==="")&&(C=e.querySelector(xt)?.textContent||"");const w=st(C);return r("priceEur",w),(!c||!u)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:d,description:l,make:c,model:u,year:b,mileageKm:p,transmission:y,fuel:m,engine:h,powerCv:v,priceEur:w,extractedFields:[...new Set(t)],warnings:n}}function Bn(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),r=n[0],o=n[1];let i=null;return o&&/^\d+w$/i.test(o)&&(i=Number.parseInt(o,10)),{url:r,width:i}}).filter(t=>!!t.url)}function Fn(e){const t=Bn(e);if(t.length===0)return null;const n=t.filter(o=>typeof o.width=="number");if(n.length===0)return t[t.length-1].url;let r=n[0];for(let o=1;o<n.length;o+=1)n[o].width>r.width&&(r=n[o]);return r.url}function At(e){if(!e)return null;const t=Fn(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function Vn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function _t(e=document){for(const t of ht){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ne(e=document){const{images:t,selectorUsed:n}=_t(e),r=[],o=new Set;for(const i of t){const a=At(i);if(!a)continue;const s=Vn(a);o.has(s)||(o.add(s),r.push(s))}return{urls:r,count:r.length,selectorUsed:n}}async function zn(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ne(t);if(o.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Ne(t);return o}const It={siteId:"olx-pt",discoverListingImages:Ne,discoverListingImagesWithWait:zn,queryGalleryImages:_t,extractListing:On,findPhoneRevealButton:kt,readRevealedPhone:we,revealContactPhone:Pn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:pt,FALLBACK_TESTID_SELECTOR:mt,FALLBACK_SWIPER_IMG_SELECTOR:gt,GALLERY_SELECTORS:ht,PHONE_REVEAL_BUTTON_SELECTOR:bt,CONTACT_PHONE_SELECTOR:yt,AD_PARAMETERS_SELECTOR:vt,AD_PRICE_SELECTOR:xt,CANONICAL_LINK_SELECTOR:Me,OFFER_TITLE_SELECTOR:Ct,BREADCRUMB_ITEM_SELECTOR:wt,JSON_LD_SELECTOR:Et}},Pt="script#__NEXT_DATA__",Tt='h1.offer-title, [data-testid="summary-info-area"] h1',Rt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',Dt='[data-testid="content-description-section"]',Oe='link[rel="canonical"]',Ee='[data-testid="aside-seller-info"]',$t='[data-testid="seller-info-contact-box"]',Mt='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Nt='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Ot='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Bt=[Nt,Ot];function Un(e){return`[data-testid="${e}"] p:last-of-type`}const Hn=/ver\s+telefone/i;function Gn(e){return!!(e&&typeof e.click=="function")}function Ft(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Be(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function ie(e){if(e.hidden)return!0;const n=Ft(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Vt(e){if(!e||typeof e.getBoundingClientRect!="function"||ie(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Be(e)>0)return!0;const n=Ft(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function zt(e){if(!Gn(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return Hn.test(t)}function Ut(e=document){const t=[],n=new Set;function r(o){const i=e.querySelector?.(o)||null;if(i)for(const a of i.querySelectorAll("button"))!zt(a)||n.has(a)||(n.add(a),t.push(a))}r(Ee),r($t);for(const o of e.querySelectorAll?.("button")||[])!zt(o)||n.has(o)||(n.add(o),t.push(o));return t}function Ht(e=document){const t=Ut(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Ee);if(n){const a=t.find(s=>n.contains(s)&&!ie(s));if(a)return a}const r=t.filter(a=>!ie(a));return[...r.length>0?r:t].sort((a,s)=>{const f=Vt(a)?1:0,d=Vt(s)?1:0;return f!==d?d-f:Be(s)-Be(a)})[0]||t[0]}function Se(e=document){const t=[...e.querySelectorAll?.(Mt)||[]],n=e.querySelector?.(Ee),r=n&&t.length>1?[...t.filter(o=>n.contains(o)),...t.filter(o=>!n.contains(o))]:t;for(const o of r){if(r.length>1&&ie(o))continue;const a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}if(r.length>0){const o=r[0],a=(o.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(a?.[1])return a[1].replace(/\D/g,"")||a[1];const s=(o.textContent||"").replace(/\D/g,"");if(s)return s}return null}function qn(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function jn(e){try{e.click()}catch{}qn(e)}async function Kn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=Se(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const a=Ut(t);if(a.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const s=Ht(t),f=[];s&&f.push(s);for(const l of a)l!==s&&!ie(l)&&f.push(l);const d=Date.now()+n;for(const l of f){if(o?.aborted)return{ok:!1,reason:"cancelled"};jn(l);const c=Math.min(d,Date.now()+5e3);for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=Se(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(b=>setTimeout(b,r))}}for(;Date.now()<d;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=Se(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(c=>setTimeout(c,r))}return{ok:!1,reason:"timeout"}}const Fe="https://www.standvirtual.com/";function Gt(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function ae(e){const{value:t,label:n}=Gt(e);return n||t}function Le(e){const{value:t,label:n}=Gt(e);return t||n}function qt(e){const n=e.querySelector?.(Pt)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function Wn(e){const n=(e.querySelector?.(Oe)||(typeof document<"u"?document.querySelector(Oe):null))?.getAttribute?.("href")||"";return n?G(n,Fe):typeof location<"u"&&location?.href?G(location.href,Fe):""}function Yn(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function q(e,t){return(e.querySelector?.(Un(t))?.textContent||"").replace(/\s+/g," ").trim()}function Xn(e=document){const t=[],n=[];function r(_,T){T&&t.push(_)}const o=qt(e),i=o?.parametersDict||{};let a="";o?.url&&(a=G(o.url,Fe)),a||(a=Wn(e)),r("url",a);const s=Yn(a,o);r("listingId",s);const f=e.querySelector?.(Tt),d=(o?.title||f?.textContent||"").replace(/\s+/g," ").trim();r("title",d);let l="";if(o?.description&&(l=kn(o.description)),!l){const _=e.querySelector?.(Dt);l=ve(_?.textContent||"")}r("description",l);let c=ae(i.make)||q(e,"make")||"";c=ye(c),r("make",c);let u=ae(i.model)||q(e,"model")||"";u=ye(u),r("model",u);let b=Le(i.first_registration_year)||q(e,"first_registration_year")||"";b=ft(b),r("year",b);const p=at(Le(i.mileage)||q(e,"mileage")||"");r("mileageKm",p);const y=lt(ae(i.gearbox)||q(e,"gearbox")||"");r("transmission",y);const m=ct(ae(i.fuel_type)||q(e,"fuel_type")||"");r("fuel",m);const h=Le(i.engine_capacity)||q(e,"engine_capacity")||"",v=/cm\s*3|cm3|\bcc\b/i.test(h)?h.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):h,C=dt(v);r("engine",C);const w=ut(Le(i.engine_power)||ae(i.engine_power)||q(e,"engine_power")||"");r("powerCv",w);let k=o?.price?.value;(k==null||k==="")&&(k=e.querySelector?.(Rt)?.textContent||"");const S=st(k);return r("priceEur",S),(!c||!u)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:d,description:l,make:c,model:u,year:b,mileageKm:p,transmission:y,fuel:m,engine:C,powerCv:w,priceEur:S,extractedFields:[...new Set(t)],warnings:n}}function jt(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Jn(e=document){const n=qt(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const r=[],o=new Set;for(const i of n){const a=i?.url||i?.src||"";if(!a)continue;const s=jt(String(a));o.has(s)||(o.add(s),r.push(s))}return r.length===0?null:{urls:r,count:r.length,selectorUsed:"next-data:images.photos"}}function Kt(e=document){for(const t of Bt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ve(e=document){const t=Jn(e);if(t)return t;const{images:n,selectorUsed:r}=Kt(e),o=[],i=new Set;for(const a of n){const s=At(a);if(!s)continue;const f=jt(s);i.has(f)||(i.add(f),o.push(f))}return{urls:o,count:o.length,selectorUsed:r}}async function Zn(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ve(t);if(o.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return o;const a=Date.now()+n;for(;o.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,r)),o=Ve(t);return o}const Wt={siteId:"standvirtual-pt",discoverListingImages:Ve,discoverListingImagesWithWait:Zn,queryGalleryImages:Kt,extractListing:Xn,findPhoneRevealButton:Ht,readRevealedPhone:Se,revealContactPhone:Kn,selectors:{PRIMARY_GALLERY_SELECTOR:Nt,FALLBACK_GALLERY_SELECTOR:Ot,GALLERY_SELECTORS:Bt,CONTACT_PHONE_SELECTOR:Mt,ASIDE_SELLER_SELECTOR:Ee,CONTENT_CONTACT_SELECTOR:$t,AD_PRICE_SELECTOR:Rt,CANONICAL_LINK_SELECTOR:Oe,OFFER_TITLE_SELECTOR:Tt,DESCRIPTION_SELECTOR:Dt,NEXT_DATA_SELECTOR:Pt}},Yt=new Map;function Xt(e){Yt.set(e.siteId,e)}function Jt(e){return Yt.get(e)}function Zt(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?Jt("standvirtual-pt")||Wt:Jt("olx-pt")||It}Xt(It),Xt(Wt);async function Qn(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let r=null;for(const o of n)try{const i=new Blob([e],{type:o});return await createImageBitmap(i)}catch(i){r=i}try{const o=new Blob([e]);return await createImageBitmap(o)}catch(o){throw r||o}}function eo(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const r=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:r,width:t.width,height:t.height}}const ze=new Map;function Ue(){return typeof GM<"u"&&GM!=null}async function Qt(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):Ue()&&typeof GM.getValue=="function"?GM.getValue(e,t):ze.has(e)?ze.get(e):t}async function en(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(Ue()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}ze.set(e,t)}async function to(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(Ue()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function tn(e){const{method:t,url:n,responseType:r="arraybuffer",headers:o,signal:i}=e;return new Promise((a,s)=>{if(i?.aborted){s(new DOMException("Aborted","AbortError"));return}let f=null;const d=()=>{try{f?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",d,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){f=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){f=GM_xmlhttpRequest(c);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:r,headers:o,onload(c){i?.removeEventListener("abort",d);const u=c.status;if(u<200||u>=300){s(new Error(`HTTP ${u} for ${n}`));return}a(c.response)},onerror(){i?.removeEventListener("abort",d),s(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",d),s(new Error(`Timeout for ${n}`))}})})}async function no(e,t={}){const{signal:n,request:r=tn}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await r({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:o}}function oo(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),r=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),o=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),a=Math.max(1,o-n),s=Math.max(1,i-r),f=document.createElement("canvas");f.width=e.width,f.height=e.height;const d=f.getContext("2d");return d.putImageData(e,0,0),d.getImageData(n,r,a,s)}function ro(e,t,n){const r=document.createElement("canvas");r.width=e.width,r.height=e.height,r.getContext("2d").putImageData(e,0,0);const o=document.createElement("canvas");o.width=n,o.height=t;const i=o.getContext("2d");i.drawImage(r,0,0,n,t);const{data:a}=i.getImageData(0,0,n,t),s=new Uint8Array(1*t*n*3);let f=0;for(let d=0;d<t*n;d+=1)s[f++]=a[d*4],s[f++]=a[d*4+1],s[f++]=a[d*4+2];return s}function io(e,t,n=[114,114,114]){const{width:r,height:o}=e,i=Math.min(t/o,t/r),a=Math.round(r*i),s=Math.round(o*i),f=(t-a)/2,d=(t-s)/2,l=Math.round(d-.1),c=Math.round(f-.1),u=document.createElement("canvas");u.width=r,u.height=o,u.getContext("2d").putImageData(e,0,0);const p=document.createElement("canvas");p.width=t,p.height=t;const y=p.getContext("2d");y.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,y.fillRect(0,0,t,t),y.drawImage(u,0,0,r,o,c,l,a,s);const m=y.getImageData(0,0,t,t).data,h=new Float32Array(3*t*t),v=t*t;for(let C=0;C<v;C+=1){const w=m[C*4],k=m[C*4+1],S=m[C*4+2];h[C]=w/255,h[v+C]=k/255,h[2*v+C]=S/255}return{tensor:h,ratio:i,pad:{dw:f,dh:d},size:t}}function ao(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const so="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",lo="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",co="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",uo="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function nn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:so},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:lo,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:co},ortWasmBaseUrl:uo}}const ke={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let on=null;function fo(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function He(){const e=fo();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const rn=new Proxy({},{get(e,t){return He()[t]}});function po(){const e=He(),t=nn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function an(e,t={}){po();const n=He(),r=t.prefer||["webgpu","wasm"],o=[];for(const i of r)try{const a=await n.InferenceSession.create(e,{executionProviders:[i]});return on=i,{session:a,provider:i}}catch(a){o.push(`${i}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Ge(){return on}const qe=384,mo="images",go="output0";async function ho(e,t,n={}){const r=n.confThresh??.4,{tensor:o,ratio:i,pad:a}=io(t,qe),s=new rn.Tensor("float32",o,[1,3,qe,qe]),f=await e.run({[mo]:s}),d=f[go]||Object.values(f)[0];if(!d)return[];const l=d.data,c=d.dims||[],u=c.length>=2?c[c.length-1]:7,b=Math.floor(l.length/u),p=[];for(let y=0;y<b;y+=1){const m=y*u,h=l[m+1],v=l[m+2],C=l[m+3],w=l[m+4],k=l[m+5],S=l[m+6];if(S<r)continue;const _=ao({x1:h,y1:v,x2:C,y2:w},i,a);p.push({..._,score:Number(S),classId:Number(k)})}return p.sort((y,m)=>m.score-y.score),p}function bo(e,t,n=ke){const r=n.alphabet,o=n.maxPlateSlots,i=r.length,a=e,s=[],f=[];for(let l=0;l<o;l+=1){let c=0,u=-1/0;for(let b=0;b<i;b+=1){const p=Number(a[l*i+b]);p>u&&(u=p,c=b)}s.push(r[c]),f.push(u)}let d=s.join("");return n.padChar&&(d=d.replace(new RegExp(`${yo(n.padChar)}+$`),"")),{text:d,charProbs:f.slice(0,Math.max(d.length,1))}}function yo(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function vo(e,t){const{imgHeight:n,imgWidth:r}=ke,o=ro(t,n,r),i=new rn.Tensor("uint8",o,[1,n,r,3]),a=await e.run({input:i}),s=a.plate||Object.values(a)[0],f=s.dims||[1,ke.maxPlateSlots,ke.alphabet.length],d=f[f.length-1],c=f[f.length-2]*d,u=s.data,b=u.length>=c?u.slice(0,c):u;return bo(b)}const se="[A-Z]",le="[0-9]",xo=[{id:"LLDDDD",re:new RegExp(`^${se}{2}${le}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${le}{4}${se}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${le}{2}${se}{2}${le}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${se}{2}${le}{2}${se}{2}$`)}],Co={0:"O",1:"I",5:"S",8:"B"},wo={O:"0",I:"1",L:"1",S:"5",B:"8"};function Ae(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function ee(e){const t=Ae(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Eo(e){const t=Ae(e);if(t.length!==6)return null;for(const n of xo)if(n.re.test(t))return n.id;return null}function je(e,t){const n=Ae(e).slice(0,6).split("");if(n.length!==6)return[];const r=[];function o(i,a,s){if(a>t)return;if(i===6){const c=s.join(""),u=Eo(c);u&&r.push({plate:c,corrections:a,patternId:u});return}if(o(i+1,a,s),a>=t)return;const f=s[i],d=Co[f];if(d){const c=s.slice();c[i]=d,o(i+1,a+1,c)}const l=wo[f];if(l){const c=s.slice();c[i]=l,o(i+1,a+1,c)}}return o(0,0,n),r.sort((i,a)=>i.corrections-a.corrections||a.plate.localeCompare(i.plate)),r}function sn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let r=0;for(let o=0;o<n;o+=1)r+=e[o]??0;return r/n}function So(e,t=[],n={}){const r=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,i=Ae(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:ee(i),patternId:null,corrections:0,meanConfidence:sn(t,i.length),reason:"too-short"};const a=i.slice(0,6),s=sn(t,6),f=je(a,0);if(f.length>0&&s>=r){const c=f[0];return{accepted:!0,plate:c.plate,plateFormatted:ee(c.plate),patternId:c.patternId,corrections:0,meanConfidence:s}}const d=je(a,1).filter(c=>c.corrections===1);if(d.length>0&&s>=o){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:ee(c.plate),patternId:c.patternId,corrections:1,meanConfidence:s}}return je(a,2).some(c=>c.corrections>1)&&f.length===0&&d.length===0?{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:f.length>0||d.length>0?{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:f.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:ee(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const j="models",Lo=1;let _e=null;function Ke(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):_e||(_e=new Promise((e,t)=>{const n=indexedDB.open(et,Lo);n.onupgradeneeded=()=>{const r=n.result;r.objectStoreNames.contains(j)||r.createObjectStore(j,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),_e)}async function ln(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function ko(e){const t=await Ke();return new Promise((n,r)=>{const i=t.transaction(j,"readonly").objectStore(j).get(e);i.onsuccess=()=>{const a=i.result;n(a?.bytes||null)},i.onerror=()=>r(i.error)})}async function Ao(e,t,n){const r=await Ke();return new Promise((o,i)=>{const a=r.transaction(j,"readwrite");a.objectStore(j).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>o(),a.onerror=()=>i(a.error)})}async function _o(){const e=await Ke();return new Promise((t,n)=>{const r=e.transaction(j,"readwrite");r.objectStore(j).clear(),r.oncomplete=()=>t(),r.onerror=()=>n(r.error)})}async function cn(e,t={}){const{onStatus:n,signal:r}=t,o=await ko(e.id).catch(()=>null);if(o&&await ln(o)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await tn({method:"GET",url:e.url,responseType:"arraybuffer",signal:r}),a=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const s=await ln(a);if(s!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${s}`);return await Ao(e.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let ce=null;async function Io(e={}){if(ce)return{sessions:ce,diagnostics:{provider:Ge(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=nn(),n=await cn(t.detector,e),r=await cn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const o=await an(n.bytes),i=await an(r.bytes);return ce={detector:o.session,ocr:i.session},{sessions:ce,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:r.cacheHit}}}function Po(){ce=null}async function To(e,t,n={}){const{signal:r}=n;let o=0,i;try{const s=await Qn(t);i=eo(s).imageData,s.close?.()}catch{return null}const a=await ho(e.detector,i);for(const s of a){if(r?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const f=oo(i,s),d=await vo(e.ocr,f),l=So(d.text,d.charProbs);if(l.accepted)return{plate:l.plate,plateFormatted:l.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function Ro(e,t={}){const n=Date.now(),{onStatus:r,signal:o,request:i}=t,a=e.length,s=await Io({onStatus:r,signal:o}),{detector:f,ocr:d}=s.sessions;let l=0,c=0;for(let u=0;u<a;u+=1){if(o?.aborted)return Ie("cancelled",s.diagnostics,c,l,n);const b=e[u];r?.(`Downloading image ${u+1} of ${a}`);let p;try{p=await no(b,{signal:o,request:i})}catch(m){if(o?.aborted||m?.name==="AbortError")return Ie("cancelled",s.diagnostics,c,l,n);r?.(`Failed to download image ${u+1} of ${a}, skipping…`);continue}r?.(`Scanning image ${u+1} of ${a}`),c+=1;let y;try{y=await To({detector:f,ocr:d},p.bytes,{signal:o})}catch(m){if(o?.aborted||m?.name==="AbortError")return Ie("cancelled",s.diagnostics,c,l,n);continue}finally{p=null}if(y&&(l+=y.detectionsTried,y.plate))return{ok:!0,plate:y.plate,plateFormatted:y.plateFormatted,diagnostics:{provider:Ge()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:c,detectionsTried:l,elapsedMs:Date.now()-n}}}return Ie("no-reliable-plate",s.diagnostics,c,l,n)}function Ie(e,t,n,r,o){return{ok:!1,reason:e,diagnostics:{provider:Ge()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:r,elapsedMs:Date.now()-o}}}async function dn(e){return await to(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function un(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function fn({plate:e,phone:t,fallbackId:n}={}){const r=e==null?"":String(e).trim();if(r)return r;const o=t==null?"":String(t).trim();if(o)return o;const i=n==null?"":String(n).trim();return i||un()}function Do(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function $o(e,{phone:t="",fallbackId:n=""}={}){const r=e||{},o=t==null?"":String(t).trim(),i=r.plate==null?"":String(r.plate).trim(),s=[`ID: ${fn({plate:i,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const d of $e){if(d==="url")continue;const l=nt[d];let c=r[d]==null?"":String(r[d]);d==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),s.push(`${l}: ${c}`)}const f=r.url==null?"":String(r.url);return s.push(""),s.push(f),s.join(`
`)}const We="<<<LEAD_CLIP_V1>>>",pn="<<<END_LEAD_CLIP>>>";function Mo(e,t={}){const n=e?.fields||{},r=e?.source||{},o=t.phone==null?"":String(t.phone).trim();return{v:1,id:fn({plate:n.plate,phone:o,fallbackId:t.fallbackId}),phone:o,plate:String(n.plate||""),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||r.url||""),siteId:String(r.siteId||""),title:String(r.title||""),description:ve(r.description||"")}}function No(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${We}
${n}
${pn}
`}function Oo(e){const t=String(e||""),n=t.indexOf(We);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const r=n+We.length,o=t.indexOf(pn,r);if(o<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(r,o).trim(),a=t.slice(0,n).replace(/\s+$/,"");try{const s=JSON.parse(i);return!s||s.v!==1||typeof s!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:s,humanText:a}}catch(s){return{ok:!1,error:s instanceof Error?s.message:"JSON parse failed"}}}const Bo="listingCache",Fo=2880*60*1e3;function mn(){return`${ge}${Bo}`}function Ye(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Vo(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,r]of Object.entries(e))typeof n=="string"&&n&&Ye(r)&&(t[n]={processedAt:r.processedAt,phone:r.phone,clipboard:r.clipboard,fallbackId:typeof r.fallbackId=="string"?r.fallbackId:"",listingRecord:r.listingRecord});return t}async function zo(){const e=await Qt(mn(),{});return Vo(e)}async function Xe(e){await en(mn(),e)}async function Je(e=Date.now()){const t=await zo(),n={};let r=!1;for(const[o,i]of Object.entries(t))e-i.processedAt<=Fo?n[o]=i:r=!0;return(r||Object.keys(n).length!==Object.keys(t).length)&&await Xe(n),n}async function Uo(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const o=(await Je(t))[n];return o&&Ye(o)?o:null}async function Ho(e,t,n=Date.now()){const r=typeof e=="string"?e.trim():"";if(!r||!Ye(t))return null;const o=await Je(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return o[r]=i,await Xe(o),i}async function Go(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const r=await Je(t);return n in r?(delete r[n],await Xe(r),!0):!1}const gn="valuationDefaults";async function qo(e,t=null){return Qt(`${ge}${e}`,t)}async function jo(e,t){await en(`${ge}${e}`,t)}async function hn(){const e=await qo(gn,null);return!e||typeof e!="object"?{...be}:{...be,...e}}async function Ko(e){const t={...be,...e};return await jo(gn,t),t}const Wo=5e3;function Yo(){let e=tt(),t=null,n=null,r=null,o="",i=0;function a(g){g&&t?.setCaptureStatus(g)}function s(){try{const g=Zt().extractListing(document);if(g?.url)return G(g.url)}catch{}return typeof location<"u"&&location?.href?G(location.href):""}function f(g,E){const R=E.listingRecord,D=E.phone||"",U=R?.fields?.plate||"",Z=!String(U).trim()&&!String(D).trim()&&(E.fallbackId||Do(E.clipboard))||"";o=g,i=E.processedAt,e={...e,lastPlate:U,lastPhone:D,lastClipboard:E.clipboard||"",fallbackId:Z,listingRecord:R,view:"form"},t?.showListingForm(R,{phone:D}),t?.setCopyEnabled(!!E.clipboard),t?.setCopyLabel("Copy"),a("data ready to copy"),p("Data ready to copy")}function d(g,E=""){const R=g?.fields?.plate||"",D=E==null?"":String(E).trim();let U=e.fallbackId||"";!String(R).trim()&&!D&&(U||(U=un()),e={...e,fallbackId:U});const oe=$o(g.fields,{phone:D,fallbackId:e.fallbackId}),Z=Mo(g,{phone:D,fallbackId:e.fallbackId});return No(oe,Z)}async function l(g){const E=o||G(g.listingRecord?.fields?.url||"")||s();if(!E||!g.listingRecord||!g.clipboard)return;const R=g.processedAt??i??Date.now();o=E,i=R,await Ho(E,{processedAt:R,phone:g.phone??e.lastPhone??"",clipboard:g.clipboard,fallbackId:g.fallbackId??e.fallbackId??"",listingRecord:g.listingRecord})}async function c(){try{const g=s();if(g){const E=await Uo(g);if(E){if(rt(E.listingRecord,{plate:E.listingRecord?.fields?.plate,phone:E.phone})){f(g,E);return}await Go(g)}}}catch{}b()}function u(){r!=null&&(clearTimeout(r),r=null)}function b(){u(),a("waiting"),r=setTimeout(()=>{r=null,w()},Wo)}function p(g){e={...e,statusMessage:g},t?.setStatus(g)}function y(g){e={...e,busy:g,view:g?"reading":e.listingRecord?"form":"idle"},t?.setBusy(g),g&&a("reading")}function m(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const g=e.lastDiagnostics;if(!g){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${g.provider||"n/a"}`,`Detector cache: ${g.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${g.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${g.imagesScanned??0}`,`Detections tried: ${g.detectionsTried??0}`,`Elapsed: ${g.elapsedMs??0} ms`].join(`
`))}function h(g,E,R){const D=[];return E.plate?D.push(`Plate found: ${E.plate}`):D.push("No reliable plate found."),E.phone&&D.push(`Phone: ${E.phone}`),(g.fields.make||g.fields.model)&&D.push(`Listing: ${[g.fields.make,g.fields.model].filter(Boolean).join(" ")}`.trim()),D.push(R),D.join(`
`)}function v(g){e={...e,lastClipboard:g},t?.setCopyEnabled(!!g)}async function C(g){return v(g),dn(g)}async function w(){if(u(),e.busy)return;n=new AbortController;const{signal:g}=n;y(!0);try{const E=Zt(),R=await hn();p("Revealing phone (if available)…");const D=E.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:g});p("Extracting listing fields…");const U=E.extractListing(document);p("Looking for listing images…");const oe=await E.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:Z,count:fe}=oe;let K={ok:!1,reason:"no-images"};fe>0?(p(`Found ${fe} listing images — scanning…`),p("Loading plate recognition models…"),K=await Ro(Z,{signal:g,onStatus:p}),e={...e,lastDiagnostics:K.diagnostics},m()):p("No listing images — checking phone…");const Q=await D,x=K.ok&&K.plate?K.plate:"",A=Q.ok?Q.phone:"";if(g.aborted||K.reason==="cancelled"){p("Cancelled.");return}const I=Cn({extracted:U,plate:x,defaults:R});if(e={...e,lastPlate:x,lastPhone:A,fallbackId:"",listingRecord:I,view:"form"},t?.showListingForm(I,{phone:A}),!rt(I,{plate:x,phone:A})){v(""),t?.setCopyLabel("Copy"),a("No data found."),p("No data found.");return}const W=d(I,A);v(W),t?.setCopyLabel("Copy"),a("data ready to copy"),o=G(I.fields.url||"")||s(),i=Date.now(),await l({clipboard:W,phone:A,listingRecord:I,processedAt:i,fallbackId:e.fallbackId});let H=h(I,{plate:x,phone:A},"Data ready to copy");x&&!A&&Q.reason==="timeout"?H+=`
Phone reveal timed out.`:x&&!A&&Q.reason==="no-button"&&(H+=`
No phone button on this listing.`),fe===0&&!A&&Q.reason==="no-button"&&(H+=`
No listing images found.`),p(H)}catch(E){if(g.aborted){p("Cancelled.");return}const R=E instanceof Error?E.message:"Unknown recognition error";p(`Failed: ${R}`)}finally{n=null,y(!1)}}function k(){n?.abort()}async function S(){let g=e.lastClipboard;if(e.listingRecord&&(g=d(e.listingRecord,e.lastPhone),e={...e,lastClipboard:g},t?.setCopyEnabled(!!g)),!g){p("Nothing to copy yet.");return}const E=await dn(g);E.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await l({clipboard:g,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),p(E.ok?"Data copied":"Clipboard copy failed.")}async function _(){if(!e.listingRecord){p("No listing to copy yet. Run Clip listing.");return}const g=d(e.listingRecord,e.lastPhone),E=await C(g);E.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),await l({clipboard:g,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),p(E.ok?"Data copied":"Clipboard copy failed.")}async function T(){const g=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!g){p("No plate to copy.");return}const E=await C(g);p(E.ok?`Plate copied: ${g}`:"Clipboard copy failed.")}function O(g,E){if(g==="phone"){e={...e,lastPhone:E==null?"":String(E)};return}if(!e.listingRecord)return;const R=wn(e.listingRecord,g,E);e={...e,listingRecord:R,lastPlate:g==="plate"?E:e.lastPlate}}async function L(){try{await _o(),Po(),p("Model cache cleared.")}catch(g){const E=g instanceof Error?g.message:"Failed to clear cache";p(E)}}function $(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},m(),p(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function N(){if(e.busy)return;const g=await hn();e={...e,view:"settings"},t?.showSettingsForm(g),p(`Settings. Environment: production. Storage: ${ge}* / ${et}.`)}function B(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),p("Back to listing review.")):(t?.hideForm(),p("Settings closed."))}async function P(g){await Ko(g),p("Defaults saved.")}function V(g=document.body){return t||(t=Ln({onClipListing:w,onCancel:k,onCopyAgain:S,onClearModelCache:L,onToggleDiagnostics:$,onSettings:N,onFieldChange:O,onCopyFullText:_,onCopyPlateOnly:T,onSettingsBack:B,onSaveDefaults:P}),t.mount(g),t.setMinimized(!0),c(),t)}function J(){u(),n?.abort(),n=null,t?.destroy(),t=null,o="",i=0,e=tt()}function M(){return e}return{mount:V,destroy:J,onClipListing:w,onCancel:k,onCopyAgain:S,onCopyFullText:_,onCopyPlateOnly:T,onFieldChange:O,onClearModelCache:L,onToggleDiagnostics:$,onSettings:N,onSettingsBack:B,onSaveDefaults:P,getState:M,setStatus:p}}function bn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?Xo(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function Xo(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const Y="/api";async function X(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),r=await n.text();let o=null;try{o=r?JSON.parse(r):null}catch{o=r}return{ok:n.ok,status:n.status,data:o}}async function Jo(){return X(`${Y}/auth/me`)}async function Zo(){return X(`${Y}/get_user_local`)}async function de(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),X(`${Y}/lead-clients?${t.toString()}`)}async function Qo(e){return X(`${Y}/purchase-leads/clients/${e}?page=1`)}async function er(e){return X(`${Y}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function tr(e){return X(`${Y}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Pe(e,t=null){return X(`${Y}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}const nr="LeadDeskDB";function or(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function rr(e){return String(e||"").replace(/\D/g,"")}function Ze(){return new Promise((e,t)=>{const n=indexedDB.open(nr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function ir(e){const t=await Ze();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((f,d)=>String(d.updatedAt).localeCompare(String(f.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}async function ar(e){const t=await Ze();return new Promise((n,r)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((f,d)=>String(d.updatedAt).localeCompare(String(f.updatedAt))),n(s)},a.onerror=()=>r(a.error)})}function yn(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function sr(e){const t=await Ze(),n=new Date().toISOString(),r=rr(e.phone),o=or(e.plate),i=yn("client"),a=yn("lead"),f=String(e.title||"").trim().split(/\s+/).filter(Boolean),d=f[0]||"Lead",l=f[1]||"Anúncio",c={id:i,firstName:d,firstSurname:l,secondSurname:"",phone:r,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:r,createdAt:n,updatedAt:n},u={id:a,clientId:i,plate:o,plateNormalized:o,phone:r,phoneNormalized:r,fullName:d,firstSurname:l,secondSurname:"",otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:e.make||"",model:e.model||"",year:e.year||"",fuel:e.fuel||"",transmission:e.transmission||"",bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((b,p)=>{const y=t.transaction(["clients","leads"],"readwrite");y.objectStore("clients").put(c),y.objectStore("leads").put(u),y.oncomplete=()=>b(void 0),y.onerror=()=>p(y.error)}),a}const z={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function te(e){return String(e||"").replace(/\D/g,"")}function ne(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function F(e,t){return[{label:e,value:t}]}function Te(e,t=""){const n=Array.isArray(e)?e:[],r=t.trim().toLowerCase();if(r){const o=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(r));if(o)return{label:o.label??o.nombre??o.name,value:o.value??o.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function lr(e){const t=te(e.phone),r=String(e.title||"").trim().split(/\s+/).filter(Boolean);return{name:r[0]||"Lead",firstSurname:r[1]||"Anúncio",secondSurname:null,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function cr(e){const{clip:t,clientId:n,me:r,localId:o,filters:i={},vehicle:a={}}=e,s=te(t.phone),f=ne(t.plate),d=r?.id??0,l=Array.isArray(r?.rolesId)?r.rolesId:[6],u=String(t.title||"").trim().split(/\s+/).filter(Boolean),b=i.estado||z.estado,p=i.origen||z.origen,y=i.contacto||z.forma_contacto,m=i.marca||z.marca_comercial,h=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,v=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),C=Number(v.replace(",","."))||null,w=t.make||a.makeLabel||"",k=t.model||a.modelLabel||"",S=Number(t.year)||null,_=dr(t.fuel),T=ur(t.transmission);return{data:{toggle:!1,nombre:u[0]||"Lead",telefono1:s||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:F(b.label,b.value),origen:F(p.label,p.value),forma_contacto:F(y.label,y.value),marca_comercial:F(m.label,m.value),email:null,telefono2:null,apellido1:u[1]||"Anúncio",apellido2:null,kilometros:h,importado:!1,matricula:f||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:C,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:_?F(_,a.fuelValue??_):null,ccambios:T?F(T,a.transmissionValue??T):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:d,id_agente_modify:d,rol:l,vehiculo:{marca_vehiculo:w?F(w,a.makeValue??w):[],modelo:k?F(k,a.modelValue??k):[],matriculacion:S?F(S,S):[],combustible:_?F(_,a.fuelValue??_):[],ccambios:T?F(T,a.transmissionValue??T):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:o||z.id_local_actual}}function dr(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function ur(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const fr=`
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
`;function pr(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=fr;const o=document.createElement("div");o.className="lcf-panel";const i=document.createElement("div");i.className="lcf-header";const a=document.createElement("div");a.className="lcf-title",a.textContent="CRM · Leads";const s=document.createElement("span");s.className="lcf-badge",s.textContent="CRM";const f=document.createElement("button");f.type="button",f.className="lcf-mini",f.textContent="–",i.append(a,s,f);const d=document.createElement("div");d.className="lcf-body";const l=document.createElement("div");l.className="lcf-hint",l.textContent="Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia o clipboard.";const c=document.createElement("textarea");c.className="lcf-textarea",c.placeholder="Cole aqui o texto do Clipper…";const u=document.createElement("div");u.className="lcf-summary",u.hidden=!0;const b=document.createElement("div");b.className="lcf-section-label",b.textContent="Leads encontrados",b.hidden=!0;const p=document.createElement("ul");p.className="lcf-matches";const y=document.createElement("div");y.className="lcf-row";const m=document.createElement("button");m.type="button",m.className="lcf-btn",m.textContent="Ler clipboard";const h=document.createElement("button");h.type="button",h.className="lcf-btn",h.textContent="Parse texto";const v=document.createElement("button");v.type="button",v.className="lcf-btn lcf-btn-primary",v.textContent="Verificar cadastro",v.disabled=!0,y.append(m,h,v);const C=document.createElement("div");C.className="lcf-row";const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-danger",w.textContent="Criar lead",w.disabled=!0,w.hidden=!0,C.append(w);const k=document.createElement("div");k.className="lcf-status",k.dataset.tone="",k.textContent="Aguardando dados do anúncio.",d.append(l,c,u,b,p,y,C,k),o.append(i,d),n.append(r,o),document.documentElement.append(t);let S=!1;f.addEventListener("click",()=>{S=!S,d.hidden=S,f.textContent=S?"+":"–"});let _=!1,T=0,O=0;return i.addEventListener("pointerdown",L=>{if(L.target===f)return;_=!0;const $=o.getBoundingClientRect();T=L.clientX-$.left,O=L.clientY-$.top,i.setPointerCapture(L.pointerId)}),i.addEventListener("pointermove",L=>{_&&(o.style.left=`${L.clientX-T}px`,o.style.top=`${L.clientY-O}px`,o.style.right="auto",o.style.bottom="auto")}),i.addEventListener("pointerup",()=>{_=!1}),m.addEventListener("click",()=>e.onReadClipboard()),h.addEventListener("click",()=>e.onParseText(c.value)),c.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(c.value),0)}),v.addEventListener("click",()=>e.onVerify()),w.addEventListener("click",()=>e.onCreate()),{setBadge(L){s.textContent=L},setStatus(L,$=""){k.textContent=L,k.dataset.tone=$||""},setText(L){c.value=L},getText(){return c.value},setSummary(L){if(!L){u.hidden=!0,u.textContent="";return}u.hidden=!1,u.innerHTML=L},setVerifyEnabled(L){v.disabled=!L},setCreateVisible(L,$=!0){w.hidden=!L,w.disabled=!$},setMatches(L,$){p.replaceChildren(),b.hidden=L.length===0;for(const N of L){const B=document.createElement("li"),P=document.createElement("div");P.className="lcf-match";const V=document.createElement("div");V.className="lcf-match-title",V.textContent=N.title;const J=document.createElement("div");J.className="lcf-match-sub",J.textContent=N.subtitle;const M=document.createElement("button");M.type="button",M.className="lcf-match-open",M.textContent="Abrir lead →",M.addEventListener("click",()=>$(N.id)),P.append(V,J,M),B.append(P),p.append(B)}},clearMatches(){p.replaceChildren(),b.hidden=!0},destroy(){t.remove()}}}function mr(){let e=null,t=null,n=!1,r=null;function o(){const m=bn();return t?.setBadge(m.label),m}function i(m){const h=Oo(m);if(t?.clearMatches(),t?.setCreateVisible(!1),!h.ok){e=null,t?.setSummary(null),t?.setVerifyEnabled(!1),t?.setStatus(`Parse falhou: ${h.error}`,"error");return}e=h.payload,t?.setText(m),t?.setVerifyEnabled(!0),t?.setSummary([`<div><strong>ID</strong> ${ue(e.id)}</div>`,`<div><strong>Placa</strong> ${ue(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${ue(e.phone||"—")}</div>`,`<div><strong>Viatura</strong> ${ue([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${ue(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 detetado. Clique em Verificar cadastro.","ok")}async function a(){try{const m=await navigator.clipboard.readText();t?.setText(m),i(m)}catch(m){const h=m instanceof Error?m.message:"Clipboard indisponível";t?.setStatus(`Não foi possível ler o clipboard (${h}). Cole o texto e use Parse.`,"warn")}}function s(m){i(m)}async function f(){if(!e||n)return;if(o().backend==="leaddesk"){await d();return}await l()}async function d(){n=!0,t?.setStatus("A verificar no LeadDesk (IndexedDB)…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=ne(e.plate),h=te(e.phone);let v=[];if(m&&(v=await ir(m)),v.length===0&&h&&(v=await ar(h)),!m&&!h){t?.setStatus("Payload sem placa nem telefone.","warn");return}if(v.length===0){t?.setStatus("Sem cadastro no LeadDesk. Pode criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const C=v.map(w=>({id:w.id,title:`Lead ${w.plate||w.id}`,subtitle:`${w.phone||"—"} · ${[w.make,w.model,w.year].filter(Boolean).join(" · ")||"—"} · ${w.leadStatus||""} · ${w.updatedAt||""}`.trim()}));t?.setMatches(C,w=>{location.assign(`/crm/leads/${w}`)}),t?.setStatus(C.length===1?"1 lead encontrado. Use Abrir lead, ou crie outro.":`${C.length} leads encontrados. Use Abrir lead, ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(m){const h=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${h}`,"error")}finally{n=!1}}async function l(){n=!0,t?.setStatus("A verificar via API…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=ne(e.plate),h=te(e.phone);let v;if(m)v=await de({plate:m}),v.ok&&Array.isArray(v.data)&&v.data.length===0&&h&&(v=await de({phone:h}));else if(h)v=await de({phone:h});else{t?.setStatus("Payload sem placa nem telefone.","warn");return}if(!v.ok){t?.setStatus(`Falha na verificação (HTTP ${v.status}). Está autenticado no CRM?`,"error");return}const C=Array.isArray(v.data)?v.data:[];if(C.length===0){t?.setStatus("Sem cadastro para esta placa/telefone. Pode criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const w=[];for(const S of C){const _=S?.purchaseLead?.id;if(_)w.push({id:_,title:`Lead #${_}`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""} · ${S.purchaseLead?.statusName||""}`.trim()});else if(S?.id){const O=(await Qo(S.id)).data?.results||[];for(const L of O)w.push({id:L.id,title:`Lead #${L.id}`,subtitle:`Placa ${L.plate||"—"} · ${L.status?.name||""} · ${L.lastAction||""}`.trim()});O.length===0&&w.push({id:`client:${S.id}`,title:`Cliente #${S.id} (sem purchase lead)`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""}`.trim()})}}const k=w.filter(S=>String(S.id).match(/^\d+$/));t?.setMatches(k.length?k:w,S=>{if(String(S).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. Pode criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}location.assign(`/main/lead-tasacion/${S}`)}),t?.setStatus(k.length===1?"1 lead encontrado. Use Abrir lead, ou crie outro.":k.length>1?`${k.length} leads encontrados. Use Abrir lead, ou crie outro.`:"Cliente encontrado sem lead utilizável. Pode criar lead.",k.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(m){const h=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação: ${h}`,"error")}finally{n=!1}}async function c(){if(!e||n)return;if(o().backend==="leaddesk"){await u();return}await b()}async function u(){if(!te(e.phone)&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar lead no LeadDesk local com os dados do clipboard?")){n=!0,t?.setStatus("A criar no LeadDesk…");try{const h=await sr(e);t?.setStatus(`Lead ${h} criado. A abrir página…`,"ok"),location.assign(`/crm/leads/${h}`)}catch(h){const v=h instanceof Error?h.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${v}`,"error")}finally{n=!1}}}async function b(){const m=te(e.phone);if(!m&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar cliente/lead no CRM com os dados do clipboard?")){n=!0,t?.setStatus("A criar via API…");try{const h=await Jo();if(!h.ok||!h.data?.id){t?.setStatus(`auth/me falhou (HTTP ${h.status}). Inicie sessão no CRM.`,"error");return}const v=h.data,C=await Zo(),w=Array.isArray(C.data)&&C.data[0]?.value||z.id_local_actual,[k,S,_,T]=await Promise.all([Pe("estado_lead_compra"),Pe("origen_lead_compra"),Pe("contacto"),Pe("marcas_comerciales",v.id)]),O={estado:Te(k.data,"Avaliação")||z.estado,origen:Te(S.data,"Captación")||z.origen,contacto:Te(_.data,"Whatsapp")||z.forma_contacto,marca:Te(T.data,"")||z.marca_comercial};let L=null;if(m){const P=await de({phone:m});P.ok&&Array.isArray(P.data)&&P.data[0]?.id&&(L=P.data[0].id)}if(!L){const P=await er(lr(e));if(P.status===409)L=(await de({phone:m||void 0,plate:ne(e.plate)||void 0})).data?.[0]?.id;else if(P.ok&&P.data?.resourceId)L=P.data.resourceId;else{t?.setStatus(`Falha ao criar cliente (HTTP ${P.status}): ${JSON.stringify(P.data)}`,"error");return}}if(!L){t?.setStatus("Não foi possível obter clientId.","error");return}const $=cr({clip:e,clientId:L,me:v,localId:w,filters:O}),N=await tr($);if(!N.ok){t?.setStatus(`Falha create_lead_compra (HTTP ${N.status}): ${JSON.stringify(N.data)}`,"error");return}const B=N.data?.id_lead;if(!B){t?.setStatus(`Resposta inesperada: ${JSON.stringify(N.data)}`,"error");return}t?.setStatus(`Lead ${B} criado. A abrir página…`,"ok"),location.assign(`/main/lead-tasacion/${B}`)}catch(h){const v=h instanceof Error?h.message:"erro";t?.setStatus(`Erro ao criar: ${v}`,"error")}finally{n=!1}}}function p(){if(t)return t;t=pr({onReadClipboard:a,onParseText:s,onVerify:f,onCreate:c}),o(),window.addEventListener("popstate",o),r=new MutationObserver(()=>o());const m=document.getElementById("app")||document.body;return m&&r.observe(m,{childList:!0,subtree:!0}),a(),t}function y(){window.removeEventListener("popstate",o),r?.disconnect(),r=null,t?.destroy(),t=null,e=null}return{mount:p,destroy:y,refreshContext:o}}function ue(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const Qe="__LEAD_CRM_FILLER_INITIALIZED__",gr="lead-crm-filler-root";function hr(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:bn().backend!=="none"?br():yr()}function br(){if(window[Qe])return{started:!1,reason:"already-initialized"};if(document.getElementById(gr))return window[Qe]=!0,{started:!1,reason:"panel-exists"};window[Qe]=!0;const e=mr(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function yr(){if(window[De])return{started:!1,reason:"already-initialized"};if(document.getElementById(he))return window[De]=!0,{started:!1,reason:"panel-exists"};window[De]=!0;const e=Yo(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}hr()})();
