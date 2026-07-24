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
(function(){"use strict";const Me="Vehicle Listing Clipper",ye="vlc_prod_",at="vehicle-listing-clipper",Oe="__VLC_PROD_INITIALIZED__",ve="vlc-panel-root";function st(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const Ce={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Be=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],lt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},ct=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function An(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function _n(e={}){return{...Ce,...e}}function In({extracted:e=null,plate:t="",defaults:n={}}={}){const r=_n(n),o=An(),i={},s=[],a=[],d=[],c=[...e?.warnings||[]];function l(u,h,g){const y=h==null?"":String(h);if(o[u]=y,!y){i[u]="missing";return}i[u]=g,g==="extracted"||g==="anpr"?s.push(u):g==="default"&&a.push(u)}const p=t?String(t).trim():"";return l("plate",p,p?"anpr":"missing"),l("make",e?.make||"",e?.make?"extracted":"missing"),l("model",e?.model||"",e?.model?"extracted":"missing"),l("year",e?.year||"",e?.year?"extracted":"missing"),l("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),l("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),l("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),l("engine",e?.engine||"",e?.engine?"extracted":"missing"),l("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),l("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),l("url",e?.url||"",e?.url?"extracted":"missing"),l("paintParts",r.paintParts,"default"),l("bodyParts",r.bodyParts,"default"),l("tires",r.tires,"default"),l("saleReason",r.saleReason,"default"),l("keyCount",r.keyCount,"default"),l("deductibleVat",r.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:e?.clientName||""},fields:o,origins:i,metadata:{extractedFields:[...new Set(s)],defaultedFields:[...new Set(a)],editedFields:d,warnings:c}}}function dt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function Rn(e,t,n){const r=n==null?"":String(n),o={...e.fields,[t]:r},i={...e.origins,[t]:r?"edited":"missing"},s=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:o,origins:i,source:{...e.source,url:t==="url"?r:e.source.url},metadata:{...e.metadata,editedFields:s}}}function ut(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Tn(e){let t=null;const n=new Map;let r="listing";function o(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function s(u,h,g="missing",y){const m=document.createElement("label");m.className=`vlc-field ${ut(g)}`,m.dataset.field=u;const b=document.createElement("span");b.className="vlc-field-label",b.textContent=y||lt[u]||u;const v=document.createElement("span");v.className="vlc-field-origin",v.textContent=g;const E=document.createElement("input");E.type="text",E.className="vlc-field-input",E.value=h??"",E.dataset.field=u,E.addEventListener("input",()=>{r==="listing"&&(e.onFieldChange(u,E.value),m.className=`vlc-field ${ut("edited")}`,v.textContent="edited")}),b.appendChild(v),m.append(b,E),n.set(u,E),t?.appendChild(m)}function a(){const u=document.createElement("div");u.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>e.onCopyFullText());const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Copy plate only",g.addEventListener("click",()=>e.onCopyPlateOnly()),u.append(h,g),t?.appendChild(u)}function d(u,{phone:h=""}={}){r="listing",o(),i(),t.hidden=!1;const g=document.createElement("div");g.className="vlc-form-heading",g.textContent="Review listing",t.appendChild(g);const y=h==null?"":String(h).trim();s("phone",y,y?"extracted":"missing","Telefone");for(const m of Be)s(m,u.fields[m]||"",u.origins[m]||"missing");a()}function c(u){r="settings",o(),i(),t.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",t.appendChild(h);for(const b of ct)s(b,u[b]||"","default");const g=document.createElement("div");g.className="vlc-form-actions";const y=document.createElement("button");y.type="button",y.className="vlc-btn vlc-btn-primary",y.textContent="Save defaults",y.addEventListener("click",()=>{const b={};for(const v of ct)b[v]=n.get(v)?.value??"";e.onSaveDefaults?.(b)});const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Back",m.addEventListener("click",()=>e.onBack?.()),g.append(y,m),t.appendChild(g)}function l(){t&&(t.hidden=!0)}function p(u,{phone:h}={}){if(r==="listing"){if(h!==void 0){const g=n.get("phone");g&&document.activeElement!==g&&(g.value=h==null?"":String(h))}for(const g of Be){const y=n.get(g);y&&document.activeElement!==y&&(y.value=u.fields[g]||"")}}}return{ensureRoot:o,showListing:d,showSettings:c,syncListingValues:p,hide:l,getMode:()=>r,getElement:()=>o()}}const Pn=`
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

.vlc-clipboard-id {
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.3;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vlc-clipboard-id--random {
  color: #fbbf24;
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
`;function Dn(e){let t=null,n=null,r=null,o=null,i=null,s=null,a=null,d=null,c=null,l=null,p=null,u=null,h=null,g=!0,y="waiting",m=!1,b=null,v=0,E=0,w=null;const k=Tn({onFieldChange:(x,A)=>e.onFieldChange(x,A),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:x=>e.onSaveDefaults(x)});function S(){o&&(o.textContent=g?y:Me)}const _='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',I='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function T(){!n||!h||(n.classList.toggle("vlc-panel--minimized",g),h.innerHTML=g?_:I,h.setAttribute("aria-label",g?"Expand panel":"Minimize panel"),h.title=g?"Expand":"Minimize",S())}function L(x){g=!!x,T()}function N(){L(!g)}function M(x){y=x,S()}function V(){c&&(c.disabled=!m),l&&(l.disabled=!m)}function $(x,A){if(!n)return;const R=n.getBoundingClientRect(),ge=Math.max(0,window.innerWidth-R.width),re=Math.max(0,window.innerHeight-R.height),he=Math.min(Math.max(0,x),ge),be=Math.min(Math.max(0,A),re);n.style.left=`${he}px`,n.style.top=`${be}px`,n.style.right="auto",n.style.bottom="auto"}function H(x){if(!n||!r||x.target?.closest("button")||x.button!==0)return;const R=n.getBoundingClientRect();b=x.pointerId,v=x.clientX-R.left,E=x.clientY-R.top,r.classList.add("vlc-header--dragging"),r.setPointerCapture(x.pointerId),x.preventDefault()}function K(x){b===x.pointerId&&$(x.clientX-v,x.clientY-E)}function O(x){b===x.pointerId&&(b=null,r?.classList.remove("vlc-header--dragging"),r?.hasPointerCapture(x.pointerId)&&r.releasePointerCapture(x.pointerId))}function rt(x=document.body){if(document.getElementById(ve))return t=document.getElementById(ve),t;t=document.createElement("div"),t.id=ve,t.setAttribute("data-vlc-panel","1");const A=t.attachShadow({mode:"open"}),R=document.createElement("style");R.textContent=Pn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Me),r=document.createElement("div"),r.className="vlc-header",r.addEventListener("pointerdown",H),r.addEventListener("pointermove",K),r.addEventListener("pointerup",O),r.addEventListener("pointercancel",O);const ge=document.createElement("div");ge.className="vlc-header-main";const re=document.createElement("div");re.className="vlc-header-text",o=document.createElement("h1"),o.className="vlc-title",o.textContent=Me,re.appendChild(o),u=document.createElement("p"),u.className="vlc-clipboard-id",u.hidden=!0,re.appendChild(u),ge.appendChild(re),p=f("Clip again",()=>e.onClipListing()),p.classList.add("vlc-btn-header-clip"),l=f("Copy again",()=>e.onCopyAgain()),l.classList.add("vlc-btn-header-copy"),l.disabled=!0,h=document.createElement("button"),h.type="button",h.className="vlc-btn vlc-btn-icon",h.addEventListener("click",N);const he=document.createElement("div");he.className="vlc-header-actions",he.append(p,l,h),r.append(ge,he);const be=document.createElement("div");be.className="vlc-body";const it=document.createElement("div");it.className="vlc-actions",a=f("Clip listing",()=>e.onClipListing()),d=f("Cancel",()=>e.onCancel()),d.disabled=!0,c=f("Copy again",()=>e.onCopyAgain()),c.disabled=!0;const Ir=f("Clear model cache",()=>e.onClearModelCache()),Rr=f("Diagnostics",()=>e.onToggleDiagnostics()),Tr=f("Settings",()=>e.onSettings());it.append(a,d,c,Ir,Rr,Tr),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),s=document.createElement("div"),s.className="vlc-diag",s.hidden=!0;const Pr=k.getElement();return be.append(it,i,s,Pr),n.append(r,be),A.append(R,n),T(),x.appendChild(t),t}function f(x,A){const R=document.createElement("button");return R.type="button",R.className="vlc-btn",R.textContent=x,R.addEventListener("click",A),R}function C(x){i&&(i.textContent=x)}function P(x){const A=!!x;a&&(a.disabled=A),p&&(p.disabled=A),d&&(d.disabled=!A)}function D({id:x="",isRandom:A=!1}={}){if(!u)return;const R=String(x||"").trim();if(!R){u.hidden=!0,u.textContent="",u.classList.remove("vlc-clipboard-id--random");return}u.hidden=!1,u.textContent=A?`ID: ${R} · random`:`ID: ${R}`,u.classList.toggle("vlc-clipboard-id--random",!!A)}function z(x){m=!!x,V()}function oe(x){const A=x||"Copy again";c&&(c.textContent=A),l&&(l.textContent=A)}function Y(x=2e3){w!=null&&(clearTimeout(w),w=null);for(const A of[l,c])A&&A.classList.add("vlc-btn--copied");w=setTimeout(()=>{w=null;for(const A of[l,c])A?.classList.remove("vlc-btn--copied")},x)}function me(x,A=""){s&&(s.hidden=!x,s.textContent=A)}function X(x,{phone:A=""}={}){k.showListing(x,{phone:A})}function Q(x){k.showSettings(x)}function q(){k.hide()}function B(){w!=null&&(clearTimeout(w),w=null),r&&(r.removeEventListener("pointerdown",H),r.removeEventListener("pointermove",K),r.removeEventListener("pointerup",O),r.removeEventListener("pointercancel",O)),t?.remove(),t=null,n=null,r=null,o=null,i=null,s=null,a=null,d=null,c=null,l=null,p=null,u=null,h=null,g=!0,y="waiting",m=!1,b=null}return{mount:rt,setStatus:C,setBusy:P,setClipboardId:D,setCopyEnabled:z,setCopyLabel:oe,flashCopySuccess:Y,setCaptureStatus:M,setDiagnostics:me,showListingForm:X,showSettingsForm:Q,hideForm:q,setMinimized:L,toggleMinimized:N,destroy:B}}function ie(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function xe(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return ie(n)}function ft(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function pt(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function mt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function gt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function ht(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const r=t.replace(",",".");return r==="1"?"1.0":r}function bt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const r=t.replace(/[^\d]/g,"");return r?`${r} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function yt(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function we(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function Ee(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function $n(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return Ee(t)}function G(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let r=`${n.origin}${n.pathname}`;const i=r.toLowerCase().indexOf(".html");return i!==-1&&(r=r.slice(0,i+5)),r}catch{return""}}const vt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",Ct='#mainContent img[data-testid="swiper-image-lazy"]',xt="#mainContent div.swiper-wrapper img",wt=[vt,Ct,xt],Et='#mainContent button[data-testid="ad-contact-phone"]',St='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Lt='#mainContent [data-testid="ad-parameters-container"]',kt='#mainContent [data-testid="ad-price-container"] h3',Fe='link#ssr_canonical[rel="canonical"]',At='#mainContent [data-testid="offer_title"]',Nn='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',_t='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',It='script[type="application/ld+json"]';function Mn(e){return!!(e&&typeof e.click=="function")}function Rt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function ae(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Se(e){if(e.hidden)return!0;const n=Rt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Le(e){if(!e||typeof e.getBoundingClientRect!="function"||Se(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(ae(e)>0)return!0;const n=Rt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Tt(e=document){return[...e.querySelectorAll(Et)].filter(t=>Mn(t))}function Pt(e=document){const t=Tt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(a=>!Se(a)),o=[...n.length>0?n:t].sort((a,d)=>{const c=Le(a)?1:0,l=Le(d)?1:0;return c!==l?l-c:ae(d)-ae(a)}),i=(()=>{const a=o[0];return{visible:Le(a)?1:0,area:ae(a)}})(),s=o.filter(a=>(Le(a)?1:0)===i.visible&&ae(a)===i.area);return s[s.length-1]||o[o.length-1]||t[t.length-1]}function ke(e=document){const t=[...e.querySelectorAll(St)];for(const n of t){if(t.length>1&&Se(n))continue;const r=n.getAttribute("href")||"",o=xe(r);if(o)return o;const i=ie(n.textContent||"");if(i)return i}if(t.length>0){const n=t[t.length-1],r=n.getAttribute("href")||"",o=xe(r);if(o)return o;const i=ie(n.textContent||"");if(i)return i}return null}function On(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function Bn(e){try{e.click()}catch{}On(e)}async function Fn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=ke(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const s=Tt(t);if(s.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const a=Pt(t),d=[];a&&d.push(a);for(const l of s)l!==a&&!Se(l)&&d.push(l);const c=Date.now()+n;for(const l of d){if(o?.aborted)return{ok:!1,reason:"cancelled"};Bn(l);const p=Math.min(c,Date.now()+5e3);for(;Date.now()<p;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=ke(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,r))}}for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=ke(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(p=>setTimeout(p,r))}return{ok:!1,reason:"timeout"}}function Vn(e){const t=new Map,n=e.querySelector(Lt);if(!n)return t;for(const r of n.querySelectorAll("p")){const o=(r.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const i=o.indexOf(":");if(i<=0)continue;const s=o.slice(0,i).trim().toLowerCase(),a=o.slice(i+1).trim();s&&a&&t.set(s,a)}return t}function zn(e){const t=e.querySelectorAll(It);for(const n of t){const r=n.textContent||"";if(r.trim())try{const o=JSON.parse(r),i=Array.isArray(o)?o:[o];for(const s of i)if(s&&s["@type"]==="Vehicle")return s}catch{}}return null}function Un(e){const n=(e.querySelector?.(Fe)||(typeof document<"u"?document.querySelector(Fe):null))?.getAttribute?.("href")||"";return n?G(n):typeof location<"u"&&location?.href?G(location.href):""}function Hn(e){const t=e.querySelectorAll(_t);for(const n of t){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function Gn(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function qn(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function jn(e=document){const t=[],n=[];function r(_,I){I&&t.push(_)}const o=Vn(e),i=zn(e),s=Un(e);r("url",s);const a=qn(s,i);r("listingId",a);const c=(e.querySelector(At)?.textContent||i?.name||"").replace(/\s+/g," ").trim();r("title",c);const l=Ee(i?.description||"");r("description",l);const u=(e.querySelector(Nn)?.textContent||"").replace(/\s+/g," ").trim();r("clientName",u);let h=Gn(i);h||(h=Hn(e)),h=we(h),r("make",h);let g=o.get("modelo")||i?.model||"";g=we(g),r("model",g);let y=o.get("ano")||i?.productionDate||i?.modelDate||"";y=yt(y),r("year",y);const m=ft(o.get("quilómetros")||o.get("quilometros")||"");r("mileageKm",m);const b=mt(o.get("tipo de caixa")||"");r("transmission",b);const v=gt(o.get("combustível")||o.get("combustivel")||"");r("fuel",v);const E=ht(o.get("cilindrada")||"");r("engine",E);const w=bt(o.get("potência")||o.get("potencia")||"");r("powerCv",w);let k=i?.offers?.price;(k==null||k==="")&&(k=e.querySelector(kt)?.textContent||"");const S=pt(k);return r("priceEur",S),(!h||!g)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"olx-pt",url:s,listingId:a,title:c,description:l,clientName:u,make:h,model:g,year:y,mileageKm:m,transmission:b,fuel:v,engine:E,powerCv:w,priceEur:S,extractedFields:[...new Set(t)],warnings:n}}function Wn(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),r=n[0],o=n[1];let i=null;return o&&/^\d+w$/i.test(o)&&(i=Number.parseInt(o,10)),{url:r,width:i}}).filter(t=>!!t.url)}function Kn(e){const t=Wn(e);if(t.length===0)return null;const n=t.filter(o=>typeof o.width=="number");if(n.length===0)return t[t.length-1].url;let r=n[0];for(let o=1;o<n.length;o+=1)n[o].width>r.width&&(r=n[o]);return r.url}function Dt(e){if(!e)return null;const t=Kn(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function Yn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function $t(e=document){for(const t of wt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ve(e=document){const{images:t,selectorUsed:n}=$t(e),r=[],o=new Set;for(const i of t){const s=Dt(i);if(!s)continue;const a=Yn(s);o.has(a)||(o.add(a),r.push(a))}return{urls:r,count:r.length,selectorUsed:n}}async function Xn(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ve(t);if(o.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const s=Date.now()+n;for(;o.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,r)),o=Ve(t);return o}const Nt={siteId:"olx-pt",discoverListingImages:Ve,discoverListingImagesWithWait:Xn,queryGalleryImages:$t,extractListing:jn,findPhoneRevealButton:Pt,readRevealedPhone:ke,revealContactPhone:Fn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:vt,FALLBACK_TESTID_SELECTOR:Ct,FALLBACK_SWIPER_IMG_SELECTOR:xt,GALLERY_SELECTORS:wt,PHONE_REVEAL_BUTTON_SELECTOR:Et,CONTACT_PHONE_SELECTOR:St,AD_PARAMETERS_SELECTOR:Lt,AD_PRICE_SELECTOR:kt,CANONICAL_LINK_SELECTOR:Fe,OFFER_TITLE_SELECTOR:At,BREADCRUMB_ITEM_SELECTOR:_t,JSON_LD_SELECTOR:It}},Mt="script#__NEXT_DATA__",Ot='h1.offer-title, [data-testid="summary-info-area"] h1',Bt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',Ft='[data-testid="content-description-section"]',ze='link[rel="canonical"]',Ae='[data-testid="aside-seller-info"]',Jn='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',Vt='[data-testid="seller-info-contact-box"]',zt='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Ut='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Ht='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Gt=[Ut,Ht];function Zn(e){return`[data-testid="${e}"] p:last-of-type`}const Qn=/ver\s+telefone/i;function eo(e){return!!(e&&typeof e.click=="function")}function qt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Ue(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function se(e){if(e.hidden)return!0;const n=qt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function jt(e){if(!e||typeof e.getBoundingClientRect!="function"||se(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Ue(e)>0)return!0;const n=qt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Wt(e){if(!eo(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return Qn.test(t)}function Kt(e=document){const t=[],n=new Set;function r(o){const i=e.querySelector?.(o)||null;if(i)for(const s of i.querySelectorAll("button"))!Wt(s)||n.has(s)||(n.add(s),t.push(s))}r(Ae),r(Vt);for(const o of e.querySelectorAll?.("button")||[])!Wt(o)||n.has(o)||(n.add(o),t.push(o));return t}function Yt(e=document){const t=Kt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Ae);if(n){const s=t.find(a=>n.contains(a)&&!se(a));if(s)return s}const r=t.filter(s=>!se(s));return[...r.length>0?r:t].sort((s,a)=>{const d=jt(s)?1:0,c=jt(a)?1:0;return d!==c?c-d:Ue(a)-Ue(s)})[0]||t[0]}function _e(e=document){const t=[...e.querySelectorAll?.(zt)||[]],n=e.querySelector?.(Ae),r=n&&t.length>1?[...t.filter(o=>n.contains(o)),...t.filter(o=>!n.contains(o))]:t;for(const o of r){if(r.length>1&&se(o))continue;const i=o.getAttribute("href")||"",s=xe(i);if(s)return s;const a=ie(o.textContent||"");if(a)return a}if(r.length>0){const o=r[0],i=o.getAttribute("href")||"",s=xe(i);if(s)return s;const a=ie(o.textContent||"");if(a)return a}return null}function to(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function no(e){try{e.click()}catch{}to(e)}async function oo(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=_e(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const s=Kt(t);if(s.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const a=Yt(t),d=[];a&&d.push(a);for(const l of s)l!==a&&!se(l)&&d.push(l);const c=Date.now()+n;for(const l of d){if(o?.aborted)return{ok:!1,reason:"cancelled"};no(l);const p=Math.min(c,Date.now()+5e3);for(;Date.now()<p;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=_e(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,r))}}for(;Date.now()<c;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const l=_e(t);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(p=>setTimeout(p,r))}return{ok:!1,reason:"timeout"}}const He="https://www.standvirtual.com/";function Xt(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function le(e){const{value:t,label:n}=Xt(e);return n||t}function Ie(e){const{value:t,label:n}=Xt(e);return t||n}function Jt(e){const n=e.querySelector?.(Mt)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function ro(e){const n=(e.querySelector?.(ze)||(typeof document<"u"?document.querySelector(ze):null))?.getAttribute?.("href")||"";return n?G(n,He):typeof location<"u"&&location?.href?G(location.href,He):""}function io(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function j(e,t){return(e.querySelector?.(Zn(t))?.textContent||"").replace(/\s+/g," ").trim()}function ao(e=document){const t=[],n=[];function r(I,T){T&&t.push(I)}const o=Jt(e),i=o?.parametersDict||{};let s="";o?.url&&(s=G(o.url,He)),s||(s=ro(e)),r("url",s);const a=io(s,o);r("listingId",a);const d=e.querySelector?.(Ot),c=(o?.title||d?.textContent||"").replace(/\s+/g," ").trim();r("title",c);let l="";if(o?.description&&(l=$n(o.description)),!l){const I=e.querySelector?.(Ft);l=Ee(I?.textContent||"")}r("description",l);let p="";o?.seller?.name&&(p=String(o.seller.name).replace(/\s+/g," ").trim()),p||(p=(e.querySelector?.(Jn)?.textContent||"").replace(/\s+/g," ").trim()),r("clientName",p);let u=le(i.make)||j(e,"make")||"";u=we(u),r("make",u);let h=le(i.model)||j(e,"model")||"";h=we(h),r("model",h);let g=Ie(i.first_registration_year)||j(e,"first_registration_year")||"";g=yt(g),r("year",g);const y=ft(Ie(i.mileage)||j(e,"mileage")||"");r("mileageKm",y);const m=mt(le(i.gearbox)||j(e,"gearbox")||"");r("transmission",m);const b=gt(le(i.fuel_type)||j(e,"fuel_type")||"");r("fuel",b);const v=Ie(i.engine_capacity)||j(e,"engine_capacity")||"",E=/cm\s*3|cm3|\bcc\b/i.test(v)?v.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):v,w=ht(E);r("engine",w);const k=bt(Ie(i.engine_power)||le(i.engine_power)||j(e,"engine_power")||"");r("powerCv",k);let S=o?.price?.value;(S==null||S==="")&&(S=e.querySelector?.(Bt)?.textContent||"");const _=pt(S);return r("priceEur",_),(!u||!h)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"standvirtual-pt",url:s,listingId:a,title:c,description:l,clientName:p,make:u,model:h,year:g,mileageKm:y,transmission:m,fuel:b,engine:w,powerCv:k,priceEur:_,extractedFields:[...new Set(t)],warnings:n}}function Zt(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function so(e=document){const n=Jt(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const r=[],o=new Set;for(const i of n){const s=i?.url||i?.src||"";if(!s)continue;const a=Zt(String(s));o.has(a)||(o.add(a),r.push(a))}return r.length===0?null:{urls:r,count:r.length,selectorUsed:"next-data:images.photos"}}function Qt(e=document){for(const t of Gt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ge(e=document){const t=so(e);if(t)return t;const{images:n,selectorUsed:r}=Qt(e),o=[],i=new Set;for(const s of n){const a=Dt(s);if(!a)continue;const d=Zt(a);i.has(d)||(i.add(d),o.push(d))}return{urls:o,count:o.length,selectorUsed:r}}async function lo(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ge(t);if(o.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return o;const s=Date.now()+n;for(;o.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,r)),o=Ge(t);return o}const en={siteId:"standvirtual-pt",discoverListingImages:Ge,discoverListingImagesWithWait:lo,queryGalleryImages:Qt,extractListing:ao,findPhoneRevealButton:Yt,readRevealedPhone:_e,revealContactPhone:oo,selectors:{PRIMARY_GALLERY_SELECTOR:Ut,FALLBACK_GALLERY_SELECTOR:Ht,GALLERY_SELECTORS:Gt,CONTACT_PHONE_SELECTOR:zt,ASIDE_SELLER_SELECTOR:Ae,CONTENT_CONTACT_SELECTOR:Vt,AD_PRICE_SELECTOR:Bt,CANONICAL_LINK_SELECTOR:ze,OFFER_TITLE_SELECTOR:Ot,DESCRIPTION_SELECTOR:Ft,NEXT_DATA_SELECTOR:Mt}},tn=new Map;function nn(e){tn.set(e.siteId,e)}function on(e){return tn.get(e)}function rn(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?on("standvirtual-pt")||en:on("olx-pt")||Nt}nn(Nt),nn(en);async function co(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let r=null;for(const o of n)try{const i=new Blob([e],{type:o});return await createImageBitmap(i)}catch(i){r=i}try{const o=new Blob([e]);return await createImageBitmap(o)}catch(o){throw r||o}}function uo(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const r=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:r,width:t.width,height:t.height}}const qe=new Map;function je(){return typeof GM<"u"&&GM!=null}async function an(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):je()&&typeof GM.getValue=="function"?GM.getValue(e,t):qe.has(e)?qe.get(e):t}async function sn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(je()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}qe.set(e,t)}async function fo(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(je()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function ln(e){const{method:t,url:n,responseType:r="arraybuffer",headers:o,signal:i}=e;return new Promise((s,a)=>{if(i?.aborted){a(new DOMException("Aborted","AbortError"));return}let d=null;const c=()=>{try{d?.abort?.()}catch{}a(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",c,{once:!0}),(p=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(p);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(p);return}a(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:r,headers:o,onload(p){i?.removeEventListener("abort",c);const u=p.status;if(u<200||u>=300){a(new Error(`HTTP ${u} for ${n}`));return}s(p.response)},onerror(){i?.removeEventListener("abort",c),a(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",c),a(new Error(`Timeout for ${n}`))}})})}async function po(e,t={}){const{signal:n,request:r=ln}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await r({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:o}}function mo(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),r=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),o=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),s=Math.max(1,o-n),a=Math.max(1,i-r),d=document.createElement("canvas");d.width=e.width,d.height=e.height;const c=d.getContext("2d");return c.putImageData(e,0,0),c.getImageData(n,r,s,a)}function go(e,t,n){const r=document.createElement("canvas");r.width=e.width,r.height=e.height,r.getContext("2d").putImageData(e,0,0);const o=document.createElement("canvas");o.width=n,o.height=t;const i=o.getContext("2d");i.drawImage(r,0,0,n,t);const{data:s}=i.getImageData(0,0,n,t),a=new Uint8Array(1*t*n*3);let d=0;for(let c=0;c<t*n;c+=1)a[d++]=s[c*4],a[d++]=s[c*4+1],a[d++]=s[c*4+2];return a}function ho(e,t,n=[114,114,114]){const{width:r,height:o}=e,i=Math.min(t/o,t/r),s=Math.round(r*i),a=Math.round(o*i),d=(t-s)/2,c=(t-a)/2,l=Math.round(c-.1),p=Math.round(d-.1),u=document.createElement("canvas");u.width=r,u.height=o,u.getContext("2d").putImageData(e,0,0);const g=document.createElement("canvas");g.width=t,g.height=t;const y=g.getContext("2d");y.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,y.fillRect(0,0,t,t),y.drawImage(u,0,0,r,o,p,l,s,a);const m=y.getImageData(0,0,t,t).data,b=new Float32Array(3*t*t),v=t*t;for(let E=0;E<v;E+=1){const w=m[E*4],k=m[E*4+1],S=m[E*4+2];b[E]=w/255,b[v+E]=k/255,b[2*v+E]=S/255}return{tensor:b,ratio:i,pad:{dw:d,dh:c},size:t}}function bo(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const yo="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",vo="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Co="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",xo="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function cn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:yo},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:vo,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Co},ortWasmBaseUrl:xo}}const Re={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let dn=null;function wo(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function We(){const e=wo();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const un=new Proxy({},{get(e,t){return We()[t]}});function Eo(){const e=We(),t=cn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function fn(e,t={}){Eo();const n=We(),r=t.prefer||["webgpu","wasm"],o=[];for(const i of r)try{const s=await n.InferenceSession.create(e,{executionProviders:[i]});return dn=i,{session:s,provider:i}}catch(s){o.push(`${i}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Ke(){return dn}const Ye=384,So="images",Lo="output0";async function ko(e,t,n={}){const r=n.confThresh??.4,{tensor:o,ratio:i,pad:s}=ho(t,Ye),a=new un.Tensor("float32",o,[1,3,Ye,Ye]),d=await e.run({[So]:a}),c=d[Lo]||Object.values(d)[0];if(!c)return[];const l=c.data,p=c.dims||[],u=p.length>=2?p[p.length-1]:7,h=Math.floor(l.length/u),g=[];for(let y=0;y<h;y+=1){const m=y*u,b=l[m+1],v=l[m+2],E=l[m+3],w=l[m+4],k=l[m+5],S=l[m+6];if(S<r)continue;const _=bo({x1:b,y1:v,x2:E,y2:w},i,s);g.push({..._,score:Number(S),classId:Number(k)})}return g.sort((y,m)=>m.score-y.score),g}function Ao(e,t,n=Re){const r=n.alphabet,o=n.maxPlateSlots,i=r.length,s=e,a=[],d=[];for(let l=0;l<o;l+=1){let p=0,u=-1/0;for(let h=0;h<i;h+=1){const g=Number(s[l*i+h]);g>u&&(u=g,p=h)}a.push(r[p]),d.push(u)}let c=a.join("");return n.padChar&&(c=c.replace(new RegExp(`${_o(n.padChar)}+$`),"")),{text:c,charProbs:d.slice(0,Math.max(c.length,1))}}function _o(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Io(e,t){const{imgHeight:n,imgWidth:r}=Re,o=go(t,n,r),i=new un.Tensor("uint8",o,[1,n,r,3]),s=await e.run({input:i}),a=s.plate||Object.values(s)[0],d=a.dims||[1,Re.maxPlateSlots,Re.alphabet.length],c=d[d.length-1],p=d[d.length-2]*c,u=a.data,h=u.length>=p?u.slice(0,p):u;return Ao(h)}const ce="[A-Z]",de="[0-9]",Ro=[{id:"LLDDDD",re:new RegExp(`^${ce}{2}${de}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${de}{4}${ce}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${de}{2}${ce}{2}${de}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${ce}{2}${de}{2}${ce}{2}$`)}],To={0:"O",1:"I",5:"S",8:"B"},Po={O:"0",I:"1",L:"1",S:"5",B:"8"};function Te(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function ee(e){const t=Te(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Do(e){const t=Te(e);if(t.length!==6)return null;for(const n of Ro)if(n.re.test(t))return n.id;return null}function Xe(e,t){const n=Te(e).slice(0,6).split("");if(n.length!==6)return[];const r=[];function o(i,s,a){if(s>t)return;if(i===6){const p=a.join(""),u=Do(p);u&&r.push({plate:p,corrections:s,patternId:u});return}if(o(i+1,s,a),s>=t)return;const d=a[i],c=To[d];if(c){const p=a.slice();p[i]=c,o(i+1,s+1,p)}const l=Po[d];if(l){const p=a.slice();p[i]=l,o(i+1,s+1,p)}}return o(0,0,n),r.sort((i,s)=>i.corrections-s.corrections||s.plate.localeCompare(i.plate)),r}function pn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let r=0;for(let o=0;o<n;o+=1)r+=e[o]??0;return r/n}function $o(e,t=[],n={}){const r=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,i=Te(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:ee(i),patternId:null,corrections:0,meanConfidence:pn(t,i.length),reason:"too-short"};const s=i.slice(0,6),a=pn(t,6),d=Xe(s,0);if(d.length>0&&a>=r){const p=d[0];return{accepted:!0,plate:p.plate,plateFormatted:ee(p.plate),patternId:p.patternId,corrections:0,meanConfidence:a}}const c=Xe(s,1).filter(p=>p.corrections===1);if(c.length>0&&a>=o){const p=c[0];return{accepted:!0,plate:p.plate,plateFormatted:ee(p.plate),patternId:p.patternId,corrections:1,meanConfidence:a}}return Xe(s,2).some(p=>p.corrections>1)&&d.length===0&&c.length===0?{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:2,meanConfidence:a,reason:"excessive-corrections"}:d.length>0||c.length>0?{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:d.length?0:1,meanConfidence:a,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:0,meanConfidence:a,reason:"no-reliable-pattern"}}const W="models",No=1;let Pe=null;function Je(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Pe||(Pe=new Promise((e,t)=>{const n=indexedDB.open(at,No);n.onupgradeneeded=()=>{const r=n.result;r.objectStoreNames.contains(W)||r.createObjectStore(W,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Pe)}async function mn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function Mo(e){const t=await Je();return new Promise((n,r)=>{const i=t.transaction(W,"readonly").objectStore(W).get(e);i.onsuccess=()=>{const s=i.result;n(s?.bytes||null)},i.onerror=()=>r(i.error)})}async function Oo(e,t,n){const r=await Je();return new Promise((o,i)=>{const s=r.transaction(W,"readwrite");s.objectStore(W).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>o(),s.onerror=()=>i(s.error)})}async function Bo(){const e=await Je();return new Promise((t,n)=>{const r=e.transaction(W,"readwrite");r.objectStore(W).clear(),r.oncomplete=()=>t(),r.onerror=()=>n(r.error)})}async function gn(e,t={}){const{onStatus:n,signal:r}=t,o=await Mo(e.id).catch(()=>null);if(o&&await mn(o)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await ln({method:"GET",url:e.url,responseType:"arraybuffer",signal:r}),s=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const a=await mn(s);if(a!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${a}`);return await Oo(e.id,s,a).catch(()=>{}),{bytes:s,cacheHit:!1}}let ue=null;async function Fo(e={}){if(ue)return{sessions:ue,diagnostics:{provider:Ke(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=cn(),n=await gn(t.detector,e),r=await gn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const o=await fn(n.bytes),i=await fn(r.bytes);return ue={detector:o.session,ocr:i.session},{sessions:ue,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:r.cacheHit}}}function Vo(){ue=null}async function zo(e,t,n={}){const{signal:r}=n;let o=0,i;try{const a=await co(t);i=uo(a).imageData,a.close?.()}catch{return null}const s=await ko(e.detector,i);for(const a of s){if(r?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const d=mo(i,a),c=await Io(e.ocr,d),l=$o(c.text,c.charProbs);if(l.accepted)return{plate:l.plate,plateFormatted:l.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function Uo(e,t={}){const n=Date.now(),{onStatus:r,signal:o,request:i}=t,s=e.length,a=await Fo({onStatus:r,signal:o}),{detector:d,ocr:c}=a.sessions;let l=0,p=0;for(let u=0;u<s;u+=1){if(o?.aborted)return De("cancelled",a.diagnostics,p,l,n);const h=e[u];r?.(`Downloading image ${u+1} of ${s}`);let g;try{g=await po(h,{signal:o,request:i})}catch(m){if(o?.aborted||m?.name==="AbortError")return De("cancelled",a.diagnostics,p,l,n);r?.(`Failed to download image ${u+1} of ${s}, skipping…`);continue}r?.(`Scanning image ${u+1} of ${s}`),p+=1;let y;try{y=await zo({detector:d,ocr:c},g.bytes,{signal:o})}catch(m){if(o?.aborted||m?.name==="AbortError")return De("cancelled",a.diagnostics,p,l,n);continue}finally{g=null}if(y&&(l+=y.detectionsTried,y.plate))return{ok:!0,plate:y.plate,plateFormatted:y.plateFormatted,diagnostics:{provider:Ke()||a.diagnostics.provider,detectorCacheHit:a.diagnostics.detectorCacheHit,ocrCacheHit:a.diagnostics.ocrCacheHit,imagesScanned:p,detectionsTried:l,elapsedMs:Date.now()-n}}}return De("no-reliable-plate",a.diagnostics,p,l,n)}function De(e,t,n,r,o){return{ok:!1,reason:e,diagnostics:{provider:Ke()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:r,elapsedMs:Date.now()-o}}}async function hn(e){return await fo(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function bn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function yn({plate:e,phone:t,fallbackId:n}={}){const r=e==null?"":String(e).trim();if(r)return{id:r,isRandom:!1};const o=t==null?"":String(t).trim();if(o)return{id:o,isRandom:!1};const i=n==null?"":String(n).trim();return i?{id:i,isRandom:!0}:{id:bn(),isRandom:!0}}function vn(e={}){return yn(e).id}function Ho(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function Go(e,{phone:t="",fallbackId:n=""}={}){const r=e||{},o=t==null?"":String(t).trim(),i=r.plate==null?"":String(r.plate).trim(),a=[`ID: ${vn({plate:i,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const c of Be){if(c==="url")continue;const l=lt[c];let p=r[c]==null?"":String(r[c]);c==="customerValueEur"&&p&&!/€/.test(p)&&(p=`${p} €`),a.push(`${l}: ${p}`)}const d=r.url==null?"":String(r.url);return a.push(""),a.push(d),a.join(`
`)}const Ze="<<<LEAD_CLIP_V1>>>",Cn="<<<END_LEAD_CLIP>>>";function qo(e,t={}){const n=e?.fields||{},r=e?.source||{},o=t.phone==null?"":String(t.phone).trim();return{v:1,id:vn({plate:n.plate,phone:o,fallbackId:t.fallbackId}),phone:o,plate:String(n.plate||""),clientName:String(r.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||r.url||""),siteId:String(r.siteId||""),title:String(r.title||""),description:Ee(r.description||"")}}function jo(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${Ze}
${n}
${Cn}
`}function Wo(e){const t=String(e||""),n=t.indexOf(Ze);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const r=n+Ze.length,o=t.indexOf(Cn,r);if(o<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(r,o).trim(),s=t.slice(0,n).replace(/\s+$/,"");try{const a=JSON.parse(i);return!a||a.v!==1||typeof a!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:a,humanText:s}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"JSON parse failed"}}}const Ko="listingCache",Yo=2880*60*1e3;function xn(){return`${ye}${Ko}`}function Qe(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Xo(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,r]of Object.entries(e))typeof n=="string"&&n&&Qe(r)&&(t[n]={processedAt:r.processedAt,phone:r.phone,clipboard:r.clipboard,fallbackId:typeof r.fallbackId=="string"?r.fallbackId:"",listingRecord:r.listingRecord});return t}async function Jo(){const e=await an(xn(),{});return Xo(e)}async function et(e){await sn(xn(),e)}async function tt(e=Date.now()){const t=await Jo(),n={};let r=!1;for(const[o,i]of Object.entries(t))e-i.processedAt<=Yo?n[o]=i:r=!0;return(r||Object.keys(n).length!==Object.keys(t).length)&&await et(n),n}async function Zo(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const o=(await tt(t))[n];return o&&Qe(o)?o:null}async function Qo(e,t,n=Date.now()){const r=typeof e=="string"?e.trim():"";if(!r||!Qe(t))return null;const o=await tt(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return o[r]=i,await et(o),i}async function er(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const r=await tt(t);return n in r?(delete r[n],await et(r),!0):!1}const wn="valuationDefaults";async function tr(e,t=null){return an(`${ye}${e}`,t)}async function nr(e,t){await sn(`${ye}${e}`,t)}async function En(){const e=await tr(wn,null);return!e||typeof e!="object"?{...Ce}:{...Ce,...e}}async function or(e){const t={...Ce,...e};return await nr(wn,t),t}const rr=5e3;function ir(){let e=st(),t=null,n=null,r=null,o="",i=0;function s(f){f&&t?.setCaptureStatus(f)}function a(f){e={...e,statusMessage:f},t?.setStatus(f);const C=String(f||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);C&&s(`analisando imagem ${C[1]} de ${C[2]}`)}function d(){try{const f=rn().extractListing(document);if(f?.url)return G(f.url)}catch{}return typeof location<"u"&&location?.href?G(location.href):""}function c(f={}){const C=f.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",P=f.phone??e.lastPhone??"",D=f.fallbackId??e.fallbackId??"";if(!String(C).trim()&&!String(P).trim()&&!String(D).trim()){t?.setClipboardId({id:"",isRandom:!1});return}t?.setClipboardId(yn({plate:C,phone:P,fallbackId:D}))}function l(f,C){const P=C.listingRecord,D=C.phone||"",z=P?.fields?.plate||"",Y=!String(z).trim()&&!String(D).trim()&&(C.fallbackId||Ho(C.clipboard))||"";o=f,i=C.processedAt,e={...e,lastPlate:z,lastPhone:D,lastClipboard:C.clipboard||"",fallbackId:Y,listingRecord:P,view:"form"},t?.showListingForm(P,{phone:D}),t?.setCopyEnabled(!!C.clipboard),t?.setCopyLabel("Copy"),c({plate:z,phone:D,fallbackId:Y}),s("data ready to copy"),a("Data ready to copy")}function p(f,C=""){const P=f?.fields?.plate||"",D=C==null?"":String(C).trim();let z=e.fallbackId||"";!String(P).trim()&&!D&&(z||(z=bn()),e={...e,fallbackId:z});const oe=Go(f.fields,{phone:D,fallbackId:e.fallbackId}),Y=qo(f,{phone:D,fallbackId:e.fallbackId});return jo(oe,Y)}async function u(f){const C=o||G(f.listingRecord?.fields?.url||"")||d();if(!C||!f.listingRecord||!f.clipboard)return;const P=f.processedAt??i??Date.now();o=C,i=P,await Qo(C,{processedAt:P,phone:f.phone??e.lastPhone??"",clipboard:f.clipboard,fallbackId:f.fallbackId??e.fallbackId??"",listingRecord:f.listingRecord})}async function h(){try{const f=d();if(f){const C=await Zo(f);if(C){if(dt(C.listingRecord,{plate:C.listingRecord?.fields?.plate,phone:C.phone})){l(f,C);return}await er(f)}}}catch{}y()}function g(){r!=null&&(clearTimeout(r),r=null)}function y(){g(),s("waiting"),r=setTimeout(()=>{r=null,k()},rr)}function m(f){e={...e,busy:f,view:f?"reading":e.listingRecord?"form":"idle"},t?.setBusy(f),f&&s("reading")}function b(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const f=e.lastDiagnostics;if(!f){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${f.provider||"n/a"}`,`Detector cache: ${f.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${f.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${f.imagesScanned??0}`,`Detections tried: ${f.detectionsTried??0}`,`Elapsed: ${f.elapsedMs??0} ms`].join(`
`))}function v(f,C,P){const D=[];return C.plate?D.push(`Plate found: ${C.plate}`):D.push("No reliable plate found."),C.phone&&D.push(`Phone: ${C.phone}`),(f.fields.make||f.fields.model)&&D.push(`Listing: ${[f.fields.make,f.fields.model].filter(Boolean).join(" ")}`.trim()),D.push(P),D.join(`
`)}function E(f){e={...e,lastClipboard:f},t?.setCopyEnabled(!!f)}async function w(f){return E(f),hn(f)}async function k(){if(g(),e.busy)return;n=new AbortController;const{signal:f}=n;m(!0);try{const C=rn(),P=await En();a("Revealing phone (if available)…");const D=C.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:f});a("Extracting listing fields…");const z=C.extractListing(document);a("Looking for listing images…");const oe=await C.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:Y,count:me}=oe;let X={ok:!1,reason:"no-images"};me>0?(a(`Found ${me} listing images — scanning…`),a("Loading plate recognition models…"),X=await Uo(Y,{signal:f,onStatus:a}),e={...e,lastDiagnostics:X.diagnostics},b()):a("No listing images — checking phone…");const Q=await D,q=X.ok&&X.plate?X.plate:"",B=Q.ok?Q.phone:"";if(f.aborted||X.reason==="cancelled"){a("Cancelled.");return}const x=In({extracted:z,plate:q,defaults:P});if(e={...e,lastPlate:q,lastPhone:B,fallbackId:"",listingRecord:x,view:"form"},t?.showListingForm(x,{phone:B}),!dt(x,{plate:q,phone:B})){E(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),s("No data found."),a("No data found.");return}const A=p(x,B);E(A),t?.setCopyLabel("Copy"),c({plate:q,phone:B,fallbackId:e.fallbackId}),s("data ready to copy"),o=G(x.fields.url||"")||d(),i=Date.now(),await u({clipboard:A,phone:B,listingRecord:x,processedAt:i,fallbackId:e.fallbackId});let R=v(x,{plate:q,phone:B},"Data ready to copy");q&&!B&&Q.reason==="timeout"?R+=`
Phone reveal timed out.`:q&&!B&&Q.reason==="no-button"&&(R+=`
No phone button on this listing.`),me===0&&!B&&Q.reason==="no-button"&&(R+=`
No listing images found.`),a(R)}catch(C){if(f.aborted){a("Cancelled.");return}const P=C instanceof Error?C.message:"Unknown recognition error";a(`Failed: ${P}`)}finally{n=null,m(!1)}}function S(){n?.abort()}async function _(){let f=e.lastClipboard;if(e.listingRecord&&(f=p(e.listingRecord,e.lastPhone),e={...e,lastClipboard:f},t?.setCopyEnabled(!!f)),!f){a("Nothing to copy yet.");return}const C=await hn(f);C.ok&&(s("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await u({clipboard:f,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),a(C.ok?"Data copied":"Clipboard copy failed.")}async function I(){if(!e.listingRecord){a("No listing to copy yet. Run Clip listing.");return}const f=p(e.listingRecord,e.lastPhone),C=await w(f);C.ok&&(s("data copied"),t?.setCopyLabel("Copy again"),await u({clipboard:f,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),a(C.ok?"Data copied":"Clipboard copy failed.")}async function T(){const f=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!f){a("No plate to copy.");return}const C=await w(f);a(C.ok?`Plate copied: ${f}`:"Clipboard copy failed.")}function L(f,C){if(f==="phone"){e={...e,lastPhone:C==null?"":String(C)},c();return}if(!e.listingRecord)return;const P=Rn(e.listingRecord,f,C);e={...e,listingRecord:P,lastPlate:f==="plate"?C:e.lastPlate},f==="plate"&&c()}async function N(){try{await Bo(),Vo(),a("Model cache cleared.")}catch(f){const C=f instanceof Error?f.message:"Failed to clear cache";a(C)}}function M(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},b(),a(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function V(){if(e.busy)return;const f=await En();e={...e,view:"settings"},t?.showSettingsForm(f),a(`Settings. Environment: production. Storage: ${ye}* / ${at}.`)}function $(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),a("Back to listing review.")):(t?.hideForm(),a("Settings closed."))}async function H(f){await or(f),a("Defaults saved.")}function K(f=document.body){return t||(t=Dn({onClipListing:k,onCancel:S,onCopyAgain:_,onClearModelCache:N,onToggleDiagnostics:M,onSettings:V,onFieldChange:L,onCopyFullText:I,onCopyPlateOnly:T,onSettingsBack:$,onSaveDefaults:H}),t.mount(f),t.setMinimized(!0),h(),t)}function O(){g(),n?.abort(),n=null,t?.destroy(),t=null,o="",i=0,e=st()}function rt(){return e}return{mount:K,destroy:O,onClipListing:k,onCancel:S,onCopyAgain:_,onCopyFullText:I,onCopyPlateOnly:T,onFieldChange:L,onClearModelCache:N,onToggleDiagnostics:M,onSettings:V,onSettingsBack:$,onSaveDefaults:H,getState:rt,setStatus:a}}function Sn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?ar(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function ar(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const J="/api";async function Z(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),r=await n.text();let o=null;try{o=r?JSON.parse(r):null}catch{o=r}return{ok:n.ok,status:n.status,data:o}}async function sr(){return Z(`${J}/auth/me`)}async function lr(){return Z(`${J}/get_user_local`)}async function fe(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),Z(`${J}/lead-clients?${t.toString()}`)}async function cr(e){return Z(`${J}/purchase-leads/clients/${e}?page=1`)}async function dr(e){return Z(`${J}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function ur(e){return Z(`${J}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function $e(e,t=null){return Z(`${J}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}const fr="LeadDeskDB";function pr(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function mr(e){return String(e||"").replace(/\D/g,"")}function nt(){return new Promise((e,t)=>{const n=indexedDB.open(fr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function gr(e){const t=await nt();return new Promise((n,r)=>{const s=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);s.onsuccess=()=>{const a=s.result||[];a.sort((d,c)=>String(c.updatedAt).localeCompare(String(d.updatedAt))),n(a)},s.onerror=()=>r(s.error)})}async function hr(e){const t=await nt();return new Promise((n,r)=>{const s=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);s.onsuccess=()=>{const a=s.result||[];a.sort((d,c)=>String(c.updatedAt).localeCompare(String(d.updatedAt))),n(a)},s.onerror=()=>r(s.error)})}function Ln(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function br(e){const t=await nt(),n=new Date().toISOString(),r=mr(e.phone),o=pr(e.plate),i=Ln("client"),s=Ln("lead"),a=String(e.clientName||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean),d=a[0]||"Lead",c=a[1]||"Anúncio",l=a.length>2?a.slice(2).join(" "):"",p={id:i,firstName:d,firstSurname:c,secondSurname:l,phone:r,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:r,createdAt:n,updatedAt:n},u={id:s,clientId:i,plate:o,plateNormalized:o,phone:r,phoneNormalized:r,fullName:d,firstSurname:c,secondSurname:l,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:e.make||"",model:e.model||"",year:e.year||"",fuel:e.fuel||"",transmission:e.transmission||"",bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((h,g)=>{const y=t.transaction(["clients","leads"],"readwrite");y.objectStore("clients").put(p),y.objectStore("leads").put(u),y.oncomplete=()=>h(void 0),y.onerror=()=>g(y.error)}),s}const U={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function te(e){return String(e||"").replace(/\D/g,"")}function ne(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function F(e,t){return[{label:e,value:t}]}function Ne(e,t=""){const n=Array.isArray(e)?e:[],r=t.trim().toLowerCase();if(r){const o=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(r));if(o)return{label:o.label??o.nombre??o.name,value:o.value??o.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function kn(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:"Anúncio",secondSurname:null}:t.length===1?{name:t[0],firstSurname:"Anúncio",secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function yr(e){const t=te(e.phone),{name:n,firstSurname:r,secondSurname:o}=kn(e.clientName);return{name:n,firstSurname:r,secondSurname:o,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function vr(e){const{clip:t,clientId:n,me:r,localId:o,filters:i={},vehicle:s={}}=e,a=te(t.phone),d=ne(t.plate),c=r?.id??0,l=Array.isArray(r?.rolesId)?r.rolesId:[6],{name:p,firstSurname:u,secondSurname:h}=kn(t.clientName),g=i.estado||U.estado,y=i.origen||U.origen,m=i.contacto||U.forma_contacto,b=i.marca||U.marca_comercial,v=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,E=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),w=Number(E.replace(",","."))||null,k=t.make||s.makeLabel||"",S=t.model||s.modelLabel||"",_=Number(t.year)||null,I=Cr(t.fuel),T=xr(t.transmission);return{data:{toggle:!1,nombre:p,telefono1:a||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:F(g.label,g.value),origen:F(y.label,y.value),forma_contacto:F(m.label,m.value),marca_comercial:F(b.label,b.value),email:null,telefono2:null,apellido1:u,apellido2:h,kilometros:v,importado:!1,matricula:d||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:w,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:I?F(I,s.fuelValue??I):null,ccambios:T?F(T,s.transmissionValue??T):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:c,id_agente_modify:c,rol:l,vehiculo:{marca_vehiculo:k?F(k,s.makeValue??k):[],modelo:S?F(S,s.modelValue??S):[],matriculacion:_?F(_,_):[],combustible:I?F(I,s.fuelValue??I):[],ccambios:T?F(T,s.transmissionValue??T):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:o||U.id_local_actual}}function Cr(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function xr(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const wr=`
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
`;function Er(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=wr;const o=document.createElement("div");o.className="lcf-panel";const i=document.createElement("div");i.className="lcf-header";const s=document.createElement("div");s.className="lcf-title",s.textContent="CRM · Leads";const a=document.createElement("span");a.className="lcf-badge",a.textContent="CRM";const d=document.createElement("button");d.type="button",d.className="lcf-mini",d.textContent="–",i.append(s,a,d);const c=document.createElement("div");c.className="lcf-body";const l=document.createElement("div");l.className="lcf-hint",l.textContent="Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia a área de transferência. Com dados válidos, a verificação do cadastro corre automaticamente.";const p=document.createElement("textarea");p.className="lcf-textarea",p.placeholder="Cole aqui o texto do Clipper…";const u=document.createElement("div");u.className="lcf-summary",u.hidden=!0;const h=document.createElement("div");h.className="lcf-section-label",h.textContent="Leads encontrados",h.hidden=!0;const g=document.createElement("ul");g.className="lcf-matches";const y=document.createElement("div");y.className="lcf-row";const m=document.createElement("button");m.type="button",m.className="lcf-btn",m.textContent="Ler área de transferência";const b=document.createElement("button");b.type="button",b.className="lcf-btn",b.textContent="Analisar texto";const v=document.createElement("button");v.type="button",v.className="lcf-btn lcf-btn-primary",v.textContent="Verificar cadastro",v.disabled=!0,y.append(m,b,v);const E=document.createElement("div");E.className="lcf-row";const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-danger",w.textContent="Criar lead",w.disabled=!0,w.hidden=!0,E.append(w);const k=document.createElement("div");k.className="lcf-status",k.dataset.tone="",k.textContent="Aguardando dados do anúncio.",c.append(l,p,u,h,g,y,E,k),o.append(i,c),n.append(r,o),document.documentElement.append(t);let S=!1;d.addEventListener("click",()=>{S=!S,c.hidden=S,d.textContent=S?"+":"–"});let _=!1,I=0,T=0;return i.addEventListener("pointerdown",L=>{if(L.target===d)return;_=!0;const N=o.getBoundingClientRect();I=L.clientX-N.left,T=L.clientY-N.top,i.setPointerCapture(L.pointerId)}),i.addEventListener("pointermove",L=>{_&&(o.style.left=`${L.clientX-I}px`,o.style.top=`${L.clientY-T}px`,o.style.right="auto",o.style.bottom="auto")}),i.addEventListener("pointerup",()=>{_=!1}),m.addEventListener("click",()=>e.onReadClipboard()),b.addEventListener("click",()=>e.onParseText(p.value)),p.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(p.value),0)}),v.addEventListener("click",()=>e.onVerify()),w.addEventListener("click",()=>e.onCreate()),{setBadge(L){a.textContent=L},setStatus(L,N=""){k.textContent=L,k.dataset.tone=N||""},setText(L){p.value=L},getText(){return p.value},setSummary(L){if(!L){u.hidden=!0,u.textContent="";return}u.hidden=!1,u.innerHTML=L},setVerifyEnabled(L){v.disabled=!L},setCreateVisible(L,N=!0){w.hidden=!L,w.disabled=!N},setMatches(L,N){g.replaceChildren(),h.hidden=L.length===0;for(const M of L){const V=document.createElement("li"),$=document.createElement("div");$.className="lcf-match";const H=document.createElement("div");H.className="lcf-match-title",H.textContent=M.title;const K=document.createElement("div");K.className="lcf-match-sub",K.textContent=M.subtitle;const O=document.createElement("button");O.type="button",O.className="lcf-match-open",O.textContent="Abrir lead →",O.addEventListener("click",()=>N(M.id)),$.append(H,K,O),V.append($),g.append(V)}},clearMatches(){g.replaceChildren(),h.hidden=!0},destroy(){t.remove()}}}function Sr(){let e=null,t=null,n=!1,r=null;function o(){const m=Sn();return t?.setBadge(m.label),m}function i(m){const b=Wo(m);return t?.clearMatches(),t?.setCreateVisible(!1),b.ok?(e=b.payload,t?.setText(m),t?.setVerifyEnabled(!0),t?.setSummary([`<div><strong>ID</strong> ${pe(e.id)}</div>`,`<div><strong>Placa</strong> ${pe(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${pe(e.phone||"—")}</div>`,`<div><strong>Veículo</strong> ${pe([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${pe(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0):(e=null,t?.setSummary(null),t?.setVerifyEnabled(!1),t?.setStatus(`Falha ao analisar o texto: ${b.error}`,"error"),!1)}async function s(){try{const m=await navigator.clipboard.readText();t?.setText(m),i(m)&&await d()}catch(m){const b=m instanceof Error?m.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${b}). Cole o texto e use Analisar texto.`,"warn")}}async function a(m){i(m)&&await d()}async function d(){if(!e||n)return;if(o().backend==="leaddesk"){await c();return}await l()}async function c(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=ne(e.plate),b=te(e.phone);let v=[];if(m&&(v=await gr(m)),v.length===0&&b&&(v=await hr(b)),!m&&!b){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(v.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const E=v.map(w=>({id:w.id,title:`Lead ${w.plate||w.id}`,subtitle:`${w.phone||"—"} · ${[w.make,w.model,w.year].filter(Boolean).join(" · ")||"—"} · ${w.leadStatus||""} · ${w.updatedAt||""}`.trim()}));t?.setMatches(E,w=>{location.assign(`/crm/leads/${w}`)}),t?.setStatus(E.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":`${E.length} leads encontrados. Use Abrir lead ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(m){const b=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${b}`,"error")}finally{n=!1}}async function l(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=ne(e.plate),b=te(e.phone);let v;if(m)v=await fe({plate:m}),v.ok&&Array.isArray(v.data)&&v.data.length===0&&b&&(v=await fe({phone:b}));else if(b)v=await fe({phone:b});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!v.ok){t?.setStatus(`Falha na verificação (HTTP ${v.status}). Está autenticado no CRM?`,"error");return}const E=Array.isArray(v.data)?v.data:[];if(E.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const w=[];for(const S of E){const _=S?.purchaseLead?.id;if(_)w.push({id:_,title:`Lead #${_}`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""} · ${S.purchaseLead?.statusName||""}`.trim()});else if(S?.id){const T=(await cr(S.id)).data?.results||[];for(const L of T)w.push({id:L.id,title:`Lead #${L.id}`,subtitle:`Placa ${L.plate||"—"} · ${L.status?.name||""} · ${L.lastAction||""}`.trim()});T.length===0&&w.push({id:`client:${S.id}`,title:`Cliente #${S.id} (sem lead de compra)`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""}`.trim()})}}const k=w.filter(S=>String(S.id).match(/^\d+$/));t?.setMatches(k.length?k:w,S=>{if(String(S).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}location.assign(`/main/lead-tasacion/${S}`)}),t?.setStatus(k.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":k.length>1?`${k.length} leads encontrados. Use Abrir lead ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",k.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(m){const b=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação: ${b}`,"error")}finally{n=!1}}async function p(){if(!e||n)return;if(o().backend==="leaddesk"){await u();return}await h()}async function u(){if(!te(e.phone)&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}n=!0,t?.setStatus("Criando no LeadDesk…");try{const b=await br(e);t?.setStatus(`Lead ${b} criado. Abrindo a página…`,"ok"),location.assign(`/crm/leads/${b}`)}catch(b){const v=b instanceof Error?b.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${v}`,"error")}finally{n=!1}}async function h(){const m=te(e.phone);if(!m&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar cliente/lead no CRM com os dados copiados?")){n=!0,t?.setStatus("Criando no CRM…");try{const b=await sr();if(!b.ok||!b.data?.id){t?.setStatus(`Falha de autenticação (HTTP ${b.status}). Faça login no CRM.`,"error");return}const v=b.data,E=await lr(),w=Array.isArray(E.data)&&E.data[0]?.value||U.id_local_actual,[k,S,_,I]=await Promise.all([$e("estado_lead_compra"),$e("origen_lead_compra"),$e("contacto"),$e("marcas_comerciales",v.id)]),T={estado:Ne(k.data,"Avaliação")||U.estado,origen:Ne(S.data,"Captación")||U.origen,contacto:Ne(_.data,"Whatsapp")||U.forma_contacto,marca:Ne(I.data,"")||U.marca_comercial};let L=null;if(m){const $=await fe({phone:m});$.ok&&Array.isArray($.data)&&$.data[0]?.id&&(L=$.data[0].id)}if(!L){const $=await dr(yr(e));if($.status===409)L=(await fe({phone:m||void 0,plate:ne(e.plate)||void 0})).data?.[0]?.id;else if($.ok&&$.data?.resourceId)L=$.data.resourceId;else{t?.setStatus(`Falha ao criar cliente (HTTP ${$.status}): ${JSON.stringify($.data)}`,"error");return}}if(!L){t?.setStatus("Não foi possível obter clientId.","error");return}const N=vr({clip:e,clientId:L,me:v,localId:w,filters:T}),M=await ur(N);if(!M.ok){t?.setStatus(`Falha create_lead_compra (HTTP ${M.status}): ${JSON.stringify(M.data)}`,"error");return}const V=M.data?.id_lead;if(!V){t?.setStatus(`Resposta inesperada: ${JSON.stringify(M.data)}`,"error");return}t?.setStatus(`Lead ${V} criado. Abrindo a página…`,"ok"),location.assign(`/main/lead-tasacion/${V}`)}catch(b){const v=b instanceof Error?b.message:"erro";t?.setStatus(`Erro ao criar: ${v}`,"error")}finally{n=!1}}}function g(){if(t)return t;t=Er({onReadClipboard:s,onParseText:a,onVerify:d,onCreate:p}),o(),window.addEventListener("popstate",o),r=new MutationObserver(()=>o());const m=document.getElementById("app")||document.body;return m&&r.observe(m,{childList:!0,subtree:!0}),s(),t}function y(){window.removeEventListener("popstate",o),r?.disconnect(),r=null,t?.destroy(),t=null,e=null}return{mount:g,destroy:y,refreshContext:o}}function pe(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const ot="__LEAD_CRM_FILLER_INITIALIZED__",Lr="lead-crm-filler-root";function kr(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:Sn().backend!=="none"?Ar():_r()}function Ar(){if(window[ot])return{started:!1,reason:"already-initialized"};if(document.getElementById(Lr))return window[ot]=!0,{started:!1,reason:"panel-exists"};window[ot]=!0;const e=Sr(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function _r(){if(window[Oe])return{started:!1,reason:"already-initialized"};if(document.getElementById(ve))return window[Oe]=!0,{started:!1,reason:"panel-exists"};window[Oe]=!0;const e=ir(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}kr()})();
