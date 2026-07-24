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
(function(){"use strict";const Ue="Vehicle Listing Clipper",we="vlc_prod_",bt="vehicle-listing-clipper",He="__VLC_PROD_INITIALIZED__",Ee="vlc-panel-root";function yt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const Se={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Ge=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],vt={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},Ct=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Hn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function Gn(e={}){return{...Se,...e}}function qn({extracted:e=null,plate:t="",defaults:n={}}={}){const o=Gn(n),r=Hn(),i={},a=[],s=[],c=[],d=[...e?.warnings||[]];function f(b,h,v){const g=h==null?"":String(h);if(r[b]=g,!g){i[b]="missing";return}i[b]=v,v==="extracted"||v==="anpr"?a.push(b):v==="default"&&s.push(b)}const p=t?String(t).trim():"";f("plate",p,p?"anpr":"missing");const u=e?.clientName?String(e.clientName).trim():"";return f("clientName",u,u?"extracted":"missing"),f("make",e?.make||"",e?.make?"extracted":"missing"),f("model",e?.model||"",e?.model?"extracted":"missing"),f("year",e?.year||"",e?.year?"extracted":"missing"),f("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),f("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),f("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),f("engine",e?.engine||"",e?.engine?"extracted":"missing"),f("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),f("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),f("url",e?.url||"",e?.url?"extracted":"missing"),f("paintParts",o.paintParts,"default"),f("bodyParts",o.bodyParts,"default"),f("tires",o.tires,"default"),f("saleReason",o.saleReason,"default"),f("keyCount",o.keyCount,"default"),f("deductibleVat",o.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:r.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:r.clientName||e?.clientName||""},fields:r,origins:i,metadata:{extractedFields:[...new Set(a)],defaultedFields:[...new Set(s)],editedFields:c,warnings:d}}}function xt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(r=>r&&r!=="url"):!1}function Kn(e,t,n){const o=n==null?"":String(n),r={...e.fields,[t]:o},i={...e.origins,[t]:o?"edited":"missing"},a=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:r,origins:i,source:{...e.source,url:t==="url"?o:e.source.url,clientName:t==="clientName"?o:e.source.clientName},metadata:{...e.metadata,editedFields:a}}}function wt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function jn(e){let t=null;const n=new Map;let o="listing";function r(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function a(u,b,h="missing",v){const g=document.createElement("label");g.className=`vlc-field ${wt(h)}`,g.dataset.field=u;const m=document.createElement("span");m.className="vlc-field-label",m.textContent=v||vt[u]||u;const x=document.createElement("span");x.className="vlc-field-origin",x.textContent=h;const y=document.createElement("input");y.type="text",y.className="vlc-field-input",y.value=b??"",y.dataset.field=u,y.addEventListener("input",()=>{o==="listing"&&(e.onFieldChange(u,y.value),g.className=`vlc-field ${wt("edited")}`,x.textContent="edited")}),m.appendChild(x),g.append(m,y),n.set(u,y),t?.appendChild(g)}function s(){const u=document.createElement("div");u.className="vlc-form-actions";const b=document.createElement("button");b.type="button",b.className="vlc-btn vlc-btn-primary",b.textContent="Copy full text",b.addEventListener("click",()=>e.onCopyFullText());const h=document.createElement("button");h.type="button",h.className="vlc-btn",h.textContent="Copy plate only",h.addEventListener("click",()=>e.onCopyPlateOnly()),u.append(b,h),t?.appendChild(u)}function c(u,{phone:b=""}={}){o="listing",r(),i(),t.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Review listing",t.appendChild(h);const v=b==null?"":String(b).trim();a("phone",v,v?"extracted":"missing","Telefone");for(const g of Ge){let m=u.fields[g]||"",x=u.origins[g]||"missing";g==="clientName"&&!m&&u.source?.clientName&&(m=String(u.source.clientName),x="extracted"),a(g,m,x)}s()}function d(u){o="settings",r(),i(),t.hidden=!1;const b=document.createElement("div");b.className="vlc-form-heading",b.textContent="Default values",t.appendChild(b);for(const m of Ct)a(m,u[m]||"","default");const h=document.createElement("div");h.className="vlc-form-actions";const v=document.createElement("button");v.type="button",v.className="vlc-btn vlc-btn-primary",v.textContent="Save defaults",v.addEventListener("click",()=>{const m={};for(const x of Ct)m[x]=n.get(x)?.value??"";e.onSaveDefaults?.(m)});const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Back",g.addEventListener("click",()=>e.onBack?.()),h.append(v,g),t.appendChild(h)}function f(){t&&(t.hidden=!0)}function p(u,{phone:b}={}){if(o==="listing"){if(b!==void 0){const h=n.get("phone");h&&document.activeElement!==h&&(h.value=b==null?"":String(b))}for(const h of Ge){const v=n.get(h);if(v&&document.activeElement!==v){let g=u.fields[h]||"";h==="clientName"&&!g&&u.source?.clientName&&(g=String(u.source.clientName)),v.value=g}}}}return{ensureRoot:r,showListing:c,showSettings:d,syncListingValues:p,hide:f,getMode:()=>o,getElement:()=>r()}}const Wn=`
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

.vlc-id-signals {
  display: none;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
  margin-top: 2px;
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
`,Yn="Alt+C",Jn="⌥C";function Xn(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function Zn(e){let t=null,n=null,o=null,r=null,i=null,a=null,s=null,c=null,d=null,f=null,p=null,u=null,b=null,h=null,v=null,g=null,m=!0,x="waiting",y=!1,L=null,S=0,A=0,E=null;const k=Xn()?Jn:Yn;function R(w){return`${w} (${k})`}const M=jn({onFieldChange:(w,_)=>e.onFieldChange(w,_),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:w=>e.onSaveDefaults(w)});function P(){r&&(r.textContent=m?x:Ue)}const F='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',W='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function G(){!n||!g||(n.classList.toggle("vlc-panel--minimized",m),g.innerHTML=m?F:W,g.setAttribute("aria-label",m?"Expand panel":"Minimize panel"),g.title=m?"Expand":"Minimize",P())}function V(w){m=!!w,G()}function q(){V(!m)}function te(w){x=w,n?.classList.toggle("vlc-panel--ready",String(w).toLowerCase()==="ready to copy"),P()}function B(){d&&(d.disabled=!y),f&&(f.disabled=!y)}function l(w,_){if(!n)return;const $=n.getBoundingClientRect(),se=Math.max(0,window.innerWidth-$.width),X=Math.max(0,window.innerHeight-$.height),oe=Math.min(Math.max(0,w),se),re=Math.min(Math.max(0,_),X);n.style.left=`${oe}px`,n.style.top=`${re}px`,n.style.right="auto",n.style.bottom="auto"}function C(w){if(!n||!o||w.target?.closest("button")||w.button!==0)return;const $=n.getBoundingClientRect();L=w.pointerId,S=w.clientX-$.left,A=w.clientY-$.top,o.classList.add("vlc-header--dragging"),o.setPointerCapture(w.pointerId),w.preventDefault()}function T(w){L===w.pointerId&&l(w.clientX-S,w.clientY-A)}function I(w){L===w.pointerId&&(L=null,o?.classList.remove("vlc-header--dragging"),o?.hasPointerCapture(w.pointerId)&&o.releasePointerCapture(w.pointerId))}function N(w=document.body){if(document.getElementById(Ee))return t=document.getElementById(Ee),t;t=document.createElement("div"),t.id=Ee,t.setAttribute("data-vlc-panel","1");const _=t.attachShadow({mode:"open"}),$=document.createElement("style");$.textContent=Wn,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Ue),o=document.createElement("div"),o.className="vlc-header",o.addEventListener("pointerdown",C),o.addEventListener("pointermove",T),o.addEventListener("pointerup",I),o.addEventListener("pointercancel",I);const se=document.createElement("div");se.className="vlc-header-main";const X=document.createElement("div");X.className="vlc-header-text",r=document.createElement("h1"),r.className="vlc-title",r.textContent=Ue,X.appendChild(r),u=document.createElement("div"),u.className="vlc-id-signals",u.hidden=!0,u.setAttribute("aria-label","Sinais de captura"),b=ne("P","Matrícula"),b.classList.add("vlc-signal--plate"),h=ne("T","Telefone"),h.classList.add("vlc-signal--phone"),v=ne("R","ID aleatório"),v.classList.add("vlc-signal--random"),u.append(b,h,v),X.appendChild(u),se.appendChild(X),p=D("Clip again",()=>e.onClipListing()),p.classList.add("vlc-btn-header-clip"),f=D(R("Copy again"),()=>e.onCopyAgain()),f.classList.add("vlc-btn-header-copy"),f.title=`Shortcut: ${k}`,f.disabled=!0,g=document.createElement("button"),g.type="button",g.className="vlc-btn vlc-btn-icon",g.addEventListener("click",q);const oe=document.createElement("div");oe.className="vlc-header-actions",oe.append(p,f,g),o.append(se,oe);const re=document.createElement("div");re.className="vlc-body";const ze=document.createElement("div");ze.className="vlc-actions",s=D("Clip listing",()=>e.onClipListing()),c=D("Cancel",()=>e.onCancel()),c.disabled=!0,d=D(R("Copy again"),()=>e.onCopyAgain()),d.title=`Shortcut: ${k}`,d.disabled=!0;const mi=D("Clear model cache",()=>e.onClearModelCache()),gi=D("Diagnostics",()=>e.onToggleDiagnostics()),hi=D("Settings",()=>e.onSettings());ze.append(s,c,d,mi,gi,hi),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),a=document.createElement("div"),a.className="vlc-diag",a.hidden=!0;const bi=M.getElement();return re.append(ze,i,a,bi),n.append(o,re),_.append($,n),G(),w.appendChild(t),window.addEventListener("keydown",z),t}function z(w){!w.altKey||w.ctrlKey||w.metaKey||w.shiftKey||w.code==="KeyC"&&y&&(w.preventDefault(),e.onCopyAgain())}function D(w,_){const $=document.createElement("button");return $.type="button",$.className="vlc-btn",$.textContent=w,$.addEventListener("click",_),$}function ne(w,_){const $=document.createElement("span");return $.className="vlc-signal",$.textContent=w,$.title=_,$.setAttribute("aria-label",_),$.setAttribute("aria-pressed","false"),$}function O(w,_){w&&(w.classList.toggle("vlc-signal--on",!!_),w.setAttribute("aria-pressed",_?"true":"false"))}function Y(w){i&&(i.textContent=w)}function U(w){const _=!!w;s&&(s.disabled=_),p&&(p.disabled=_),c&&(c.disabled=!_)}function J({id:w="",isRandom:_=!1,hasPlate:$=!1,hasPhone:se=!1}={}){if(!u)return;const X=!!$,oe=!!se,re=!!_;if(!(X||oe||re||!!String(w||"").trim())){u.hidden=!0,O(b,!1),O(h,!1),O(v,!1);return}u.hidden=!1,O(b,X),O(h,oe),O(v,re)}function Ve(w){y=!!w,B()}function ue(w){const _=R(w||"Copy again");d&&(d.textContent=_,d.title=`Shortcut: ${k}`),f&&(f.textContent=_,f.title=`Shortcut: ${k}`)}function fe(w=2e3){E!=null&&(clearTimeout(E),E=null);for(const _ of[f,d])_&&_.classList.add("vlc-btn--copied");E=setTimeout(()=>{E=null;for(const _ of[f,d])_?.classList.remove("vlc-btn--copied")},w)}function ht(w,_=""){a&&(a.hidden=!w,a.textContent=_)}function xe(w,{phone:_=""}={}){M.showListing(w,{phone:_})}function ui(w){M.showSettings(w)}function fi(){M.hide()}function pi(){E!=null&&(clearTimeout(E),E=null),window.removeEventListener("keydown",z),o&&(o.removeEventListener("pointerdown",C),o.removeEventListener("pointermove",T),o.removeEventListener("pointerup",I),o.removeEventListener("pointercancel",I)),t?.remove(),t=null,n=null,o=null,r=null,i=null,a=null,s=null,c=null,d=null,f=null,p=null,u=null,b=null,h=null,v=null,g=null,m=!0,x="waiting",y=!1,L=null}return{mount:N,setStatus:Y,setBusy:U,setClipboardId:J,setCopyEnabled:Ve,setCopyLabel:ue,flashCopySuccess:fe,setCaptureStatus:te,setDiagnostics:ht,showListingForm:xe,showSettingsForm:ui,hideForm:fi,setMinimized:V,toggleMinimized:q,destroy:pi}}function pe(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function Le(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return pe(n)}function Et(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function St(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function Lt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function At(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function kt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const r=Number.parseInt(n,10);if(r===99||r===999)return"1.0";if(r>=100)return(r/1e3).toFixed(1)}const o=t.replace(",",".");return o==="1"?"1.0":o}function _t(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const o=t.replace(/[^\d]/g,"");return o?`${o} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function It(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function Ae(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function ke(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function _e(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return ke(t)}function j(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let o=`${n.origin}${n.pathname}`;const i=o.toLowerCase().indexOf(".html");return i!==-1&&(o=o.slice(0,i+5)),o}catch{return""}}const Tt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",Rt='#mainContent img[data-testid="swiper-image-lazy"]',Pt="#mainContent div.swiper-wrapper img",Nt=[Tt,Rt,Pt],$t='#mainContent button[data-testid="ad-contact-phone"]',Mt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Dt='#mainContent [data-testid="ad-parameters-container"]',Ot='#mainContent [data-testid="ad-price-container"] h3',qe='link#ssr_canonical[rel="canonical"]',Bt='#mainContent [data-testid="offer_title"]',Qn='#mainContent [data-testid="ad_description"]',eo='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',Ft='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Vt='script[type="application/ld+json"]';function to(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const o=setTimeout(()=>{t?.removeEventListener("abort",r),n("ok")},e),r=()=>{clearTimeout(o),n("cancelled")};t?.addEventListener("abort",r,{once:!0})})}function no(e=document){const t=Ht(e);if(t&&le(t))return t;for(const n of Ut(e))if(le(n))return n;return null}function oo(e){return!!(e&&typeof e.click=="function")}function zt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function me(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Ke(e){if(e.hidden)return!0;const n=zt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function le(e){if(!e||typeof e.getBoundingClientRect!="function"||Ke(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(me(e)>0)return!0;const n=zt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Ut(e=document){return[...e.querySelectorAll($t)].filter(t=>oo(t))}function Ht(e=document){const t=Ut(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(s=>!Ke(s)),r=[...n.length>0?n:t].sort((s,c)=>{const d=le(s)?1:0,f=le(c)?1:0;return d!==f?f-d:me(c)-me(s)}),i=(()=>{const s=r[0];return{visible:le(s)?1:0,area:me(s)}})(),a=r.filter(s=>(le(s)?1:0)===i.visible&&me(s)===i.area);return a[a.length-1]||r[r.length-1]||t[t.length-1]}function je(e=document){const t=[...e.querySelectorAll(Mt)];for(const n of t){if(t.length>1&&Ke(n))continue;const o=n.getAttribute("href")||"",r=Le(o);if(r)return r;const i=pe(n.textContent||"");if(i)return i}if(t.length>0){const n=t[t.length-1],o=n.getAttribute("href")||"",r=Le(o);if(r)return r;const i=pe(n.textContent||"");if(i)return i}return null}function ro(e){try{const t=Object.keys(e).find(r=>r.startsWith("__reactProps$")||r.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const o={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(o),!0}catch{return!1}}function io(e){try{e.click()}catch{}ro(e)}async function ao(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:o=250,buttonAppearDelayMs:r=2e3,buttonAppearAttempts:i=2,signal:a}=e,s=je(t);if(s)return{ok:!0,phone:s,clicked:!1,alreadyVisible:!0};if(a?.aborted)return{ok:!1,reason:"cancelled"};let c=null;const d=Math.max(1,i);for(let p=0;p<d;p+=1){if(await to(r,a)==="cancelled"||a?.aborted)return{ok:!1,reason:"cancelled"};if(c=no(t),c)break}if(!c)return{ok:!1,reason:"no-button"};const f=Date.now()+n;for(io(c);Date.now()<f;){if(a?.aborted)return{ok:!1,reason:"cancelled"};const p=je(t);if(p)return{ok:!0,phone:p,clicked:!0,alreadyVisible:!1};await new Promise(u=>setTimeout(u,o))}return{ok:!1,reason:"timeout"}}function so(e){const t=new Map,n=e.querySelector(Dt);if(!n)return t;for(const o of n.querySelectorAll("p")){const r=(o.textContent||"").replace(/\s+/g," ").trim();if(!r)continue;const i=r.indexOf(":");if(i<=0)continue;const a=r.slice(0,i).trim().toLowerCase(),s=r.slice(i+1).trim();a&&s&&t.set(a,s)}return t}function lo(e){const t=e.querySelectorAll(Vt);for(const n of t){const o=n.textContent||"";if(o.trim())try{const r=JSON.parse(o),i=Array.isArray(r)?r:[r];for(const a of i)if(a&&a["@type"]==="Vehicle")return a}catch{}}return null}function co(e){const n=(e.querySelector?.(qe)||(typeof document<"u"?document.querySelector(qe):null))?.getAttribute?.("href")||"";return n?j(n):typeof location<"u"&&location?.href?j(location.href):""}function uo(e){const t=e.querySelectorAll(Ft);for(const n of t){const r=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(r?.[1])try{return decodeURIComponent(r[1]).replace(/-/g," ")}catch{return r[1].replace(/-/g," ")}}return""}function fo(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function po(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function mo(e){const t=e.querySelector?.(Qn);if(!t)return"";const n=[...t.children||[]].find(r=>String(r.tagName||"").toUpperCase()!=="H3");if(n)return _e(n.innerHTML||"");let o=_e(t.innerHTML||"");return o=o.replace(/^Descrição\s*/i,""),ke(o)}function go(e=document){const t=[],n=[];function o(E,k){k&&t.push(E)}const r=so(e),i=lo(e),a=co(e);o("url",a);const s=po(a,i);o("listingId",s);const d=(e.querySelector(Bt)?.textContent||i?.name||"").replace(/\s+/g," ").trim();o("title",d);let f=mo(e);f||(f=_e(i?.description||"")),o("description",f);const u=(e.querySelector(eo)?.textContent||"").replace(/\s+/g," ").trim();o("clientName",u);let b=fo(i);b||(b=uo(e)),b=Ae(b),o("make",b);let h=r.get("modelo")||i?.model||"";h=Ae(h),o("model",h);let v=r.get("ano")||i?.productionDate||i?.modelDate||"";v=It(v),o("year",v);const g=Et(r.get("quilómetros")||r.get("quilometros")||"");o("mileageKm",g);const m=Lt(r.get("tipo de caixa")||"");o("transmission",m);const x=At(r.get("combustível")||r.get("combustivel")||"");o("fuel",x);const y=kt(r.get("cilindrada")||"");o("engine",y);const L=_t(r.get("potência")||r.get("potencia")||"");o("powerCv",L);let S=i?.offers?.price;(S==null||S==="")&&(S=e.querySelector(Ot)?.textContent||"");const A=St(S);return o("priceEur",A),(!b||!h)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"olx-pt",url:a,listingId:s,title:d,description:f,clientName:u,make:b,model:h,year:v,mileageKm:g,transmission:m,fuel:x,engine:y,powerCv:L,priceEur:A,extractedFields:[...new Set(t)],warnings:n}}function ho(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),o=n[0],r=n[1];let i=null;return r&&/^\d+w$/i.test(r)&&(i=Number.parseInt(r,10)),{url:o,width:i}}).filter(t=>!!t.url)}function bo(e){const t=ho(e);if(t.length===0)return null;const n=t.filter(r=>typeof r.width=="number");if(n.length===0)return t[t.length-1].url;let o=n[0];for(let r=1;r<n.length;r+=1)n[r].width>o.width&&(o=n[r]);return o.url}function Gt(e){if(!e)return null;const t=bo(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function yo(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function qt(e=document){for(const t of Nt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function We(e=document){const{images:t,selectorUsed:n}=qt(e),o=[],r=new Set;for(const i of t){const a=Gt(i);if(!a)continue;const s=yo(a);r.has(s)||(r.add(s),o.push(s))}return{urls:o,count:o.length,selectorUsed:n}}async function vo(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:o=100}=e;let r=We(t);if(r.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return r;const a=Date.now()+n;for(;r.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,o)),r=We(t);return r}const Kt={siteId:"olx-pt",discoverListingImages:We,discoverListingImagesWithWait:vo,queryGalleryImages:qt,extractListing:go,findPhoneRevealButton:Ht,readRevealedPhone:je,revealContactPhone:ao,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:Tt,FALLBACK_TESTID_SELECTOR:Rt,FALLBACK_SWIPER_IMG_SELECTOR:Pt,GALLERY_SELECTORS:Nt,PHONE_REVEAL_BUTTON_SELECTOR:$t,CONTACT_PHONE_SELECTOR:Mt,AD_PARAMETERS_SELECTOR:Dt,AD_PRICE_SELECTOR:Ot,CANONICAL_LINK_SELECTOR:qe,OFFER_TITLE_SELECTOR:Bt,BREADCRUMB_ITEM_SELECTOR:Ft,JSON_LD_SELECTOR:Vt}},jt="script#__NEXT_DATA__",Wt='h1.offer-title, [data-testid="summary-info-area"] h1',Yt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',Jt='[data-testid="content-description-section"]',Ye='link[rel="canonical"]',Ie='[data-testid="aside-seller-info"]',Co='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',Xt='[data-testid="seller-info-contact-box"]',Zt='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Qt='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',en='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',tn=[Qt,en];function xo(e){return`[data-testid="${e}"] p:last-of-type`}const wo=/ver\s+telefone/i;function Eo(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const o=setTimeout(()=>{t?.removeEventListener("abort",r),n("ok")},e),r=()=>{clearTimeout(o),n("cancelled")};t?.addEventListener("abort",r,{once:!0})})}function So(e){return!!(e&&typeof e.click=="function")}function nn(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Je(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Te(e){if(e.hidden)return!0;const n=nn(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Re(e){if(!e||typeof e.getBoundingClientRect!="function"||Te(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Je(e)>0)return!0;const n=nn(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function on(e){if(!So(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return wo.test(t)}function rn(e=document){const t=[],n=new Set;function o(r){const i=e.querySelector?.(r)||null;if(i)for(const a of i.querySelectorAll("button"))!on(a)||n.has(a)||(n.add(a),t.push(a))}o(Ie),o(Xt);for(const r of e.querySelectorAll?.("button")||[])!on(r)||n.has(r)||(n.add(r),t.push(r));return t}function an(e=document){const t=rn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Ie);if(n){const a=t.find(s=>n.contains(s)&&!Te(s));if(a)return a}const o=t.filter(a=>!Te(a));return[...o.length>0?o:t].sort((a,s)=>{const c=Re(a)?1:0,d=Re(s)?1:0;return c!==d?d-c:Je(s)-Je(a)})[0]||t[0]}function Lo(e=document){const t=an(e);if(t&&Re(t))return t;for(const n of rn(e))if(Re(n))return n;return null}function Xe(e=document){const t=[...e.querySelectorAll?.(Zt)||[]],n=e.querySelector?.(Ie),o=n&&t.length>1?[...t.filter(r=>n.contains(r)),...t.filter(r=>!n.contains(r))]:t;for(const r of o){if(o.length>1&&Te(r))continue;const i=r.getAttribute("href")||"",a=Le(i);if(a)return a;const s=pe(r.textContent||"");if(s)return s}if(o.length>0){const r=o[0],i=r.getAttribute("href")||"",a=Le(i);if(a)return a;const s=pe(r.textContent||"");if(s)return s}return null}function Ao(e){try{const t=Object.keys(e).find(r=>r.startsWith("__reactProps$")||r.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const o={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(o),!0}catch{return!1}}function ko(e){try{e.click()}catch{}Ao(e)}async function _o(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:o=250,buttonAppearDelayMs:r=2e3,buttonAppearAttempts:i=2,signal:a}=e,s=Xe(t);if(s)return{ok:!0,phone:s,clicked:!1,alreadyVisible:!0};if(a?.aborted)return{ok:!1,reason:"cancelled"};let c=null;const d=Math.max(1,i);for(let p=0;p<d;p+=1){if(await Eo(r,a)==="cancelled"||a?.aborted)return{ok:!1,reason:"cancelled"};if(c=Lo(t),c)break}if(!c)return{ok:!1,reason:"no-button"};const f=Date.now()+n;for(ko(c);Date.now()<f;){if(a?.aborted)return{ok:!1,reason:"cancelled"};const p=Xe(t);if(p)return{ok:!0,phone:p,clicked:!0,alreadyVisible:!1};await new Promise(u=>setTimeout(u,o))}return{ok:!1,reason:"timeout"}}const Ze="https://www.standvirtual.com/";function sn(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function ge(e){const{value:t,label:n}=sn(e);return n||t}function Pe(e){const{value:t,label:n}=sn(e);return t||n}function ln(e){const n=e.querySelector?.(jt)?.textContent||"";if(!n.trim())return null;try{const r=JSON.parse(n)?.props?.pageProps?.advert;return r&&typeof r=="object"?r:null}catch{return null}}function Io(e){const n=(e.querySelector?.(Ye)||(typeof document<"u"?document.querySelector(Ye):null))?.getAttribute?.("href")||"";return n?j(n,Ze):typeof location<"u"&&location?.href?j(location.href,Ze):""}function To(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function Z(e,t){return(e.querySelector?.(xo(t))?.textContent||"").replace(/\s+/g," ").trim()}function Ro(e=document){const t=[],n=[];function o(k,R){R&&t.push(k)}const r=ln(e),i=r?.parametersDict||{};let a="";r?.url&&(a=j(r.url,Ze)),a||(a=Io(e)),o("url",a);const s=To(a,r);o("listingId",s);const c=e.querySelector?.(Wt),d=(r?.title||c?.textContent||"").replace(/\s+/g," ").trim();o("title",d);let f="";if(r?.description&&(f=_e(r.description)),!f){const k=e.querySelector?.(Jt);f=ke(k?.textContent||"")}o("description",f);let p="";r?.seller?.name&&(p=String(r.seller.name).replace(/\s+/g," ").trim()),p||(p=(e.querySelector?.(Co)?.textContent||"").replace(/\s+/g," ").trim()),o("clientName",p);let u=ge(i.make)||Z(e,"make")||"";u=Ae(u),o("make",u);let b=ge(i.model)||Z(e,"model")||"";b=Ae(b),o("model",b);let h=Pe(i.first_registration_year)||Z(e,"first_registration_year")||"";h=It(h),o("year",h);const v=Et(Pe(i.mileage)||Z(e,"mileage")||"");o("mileageKm",v);const g=Lt(ge(i.gearbox)||Z(e,"gearbox")||"");o("transmission",g);const m=At(ge(i.fuel_type)||Z(e,"fuel_type")||"");o("fuel",m);const x=Pe(i.engine_capacity)||Z(e,"engine_capacity")||"",y=/cm\s*3|cm3|\bcc\b/i.test(x)?x.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):x,L=kt(y);o("engine",L);const S=_t(Pe(i.engine_power)||ge(i.engine_power)||Z(e,"engine_power")||"");o("powerCv",S);let A=r?.price?.value;(A==null||A==="")&&(A=e.querySelector?.(Yt)?.textContent||"");const E=St(A);return o("priceEur",E),(!u||!b)&&n.push("missing-make-or-model"),a||n.push("missing-url"),{siteId:"standvirtual-pt",url:a,listingId:s,title:d,description:f,clientName:p,make:u,model:b,year:h,mileageKm:v,transmission:g,fuel:m,engine:L,powerCv:S,priceEur:E,extractedFields:[...new Set(t)],warnings:n}}function cn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Po(e=document){const n=ln(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const o=[],r=new Set;for(const i of n){const a=i?.url||i?.src||"";if(!a)continue;const s=cn(String(a));r.has(s)||(r.add(s),o.push(s))}return o.length===0?null:{urls:o,count:o.length,selectorUsed:"next-data:images.photos"}}function dn(e=document){for(const t of tn){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Qe(e=document){const t=Po(e);if(t)return t;const{images:n,selectorUsed:o}=dn(e),r=[],i=new Set;for(const a of n){const s=Gt(a);if(!s)continue;const c=cn(s);i.has(c)||(i.add(c),r.push(c))}return{urls:r,count:r.length,selectorUsed:o}}async function No(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:o=100}=e;let r=Qe(t);if(r.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return r;const a=Date.now()+n;for(;r.count===0&&Date.now()<a;)await new Promise(s=>setTimeout(s,o)),r=Qe(t);return r}const un={siteId:"standvirtual-pt",discoverListingImages:Qe,discoverListingImagesWithWait:No,queryGalleryImages:dn,extractListing:Ro,findPhoneRevealButton:an,readRevealedPhone:Xe,revealContactPhone:_o,selectors:{PRIMARY_GALLERY_SELECTOR:Qt,FALLBACK_GALLERY_SELECTOR:en,GALLERY_SELECTORS:tn,CONTACT_PHONE_SELECTOR:Zt,ASIDE_SELLER_SELECTOR:Ie,CONTENT_CONTACT_SELECTOR:Xt,AD_PRICE_SELECTOR:Yt,CANONICAL_LINK_SELECTOR:Ye,OFFER_TITLE_SELECTOR:Wt,DESCRIPTION_SELECTOR:Jt,NEXT_DATA_SELECTOR:jt}},fn=new Map;function pn(e){fn.set(e.siteId,e)}function mn(e){return fn.get(e)}function gn(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?mn("standvirtual-pt")||un:mn("olx-pt")||Kt}pn(Kt),pn(un);async function $o(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const r of n)try{const i=new Blob([e],{type:r});return await createImageBitmap(i)}catch(i){o=i}try{const r=new Blob([e]);return await createImageBitmap(r)}catch(r){throw o||r}}function Mo(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const o=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:o,width:t.width,height:t.height}}const et=new Map;function tt(){return typeof GM<"u"&&GM!=null}async function hn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):tt()&&typeof GM.getValue=="function"?GM.getValue(e,t):et.has(e)?et.get(e):t}async function bn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(tt()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}et.set(e,t)}async function Do(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(tt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function yn(e){const{method:t,url:n,responseType:o="arraybuffer",headers:r,signal:i}=e;return new Promise((a,s)=>{if(i?.aborted){s(new DOMException("Aborted","AbortError"));return}let c=null;const d=()=>{try{c?.abort?.()}catch{}s(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",d,{once:!0}),(p=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){c=GM.xmlHttpRequest(p);return}if(typeof GM_xmlhttpRequest=="function"){c=GM_xmlhttpRequest(p);return}s(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:o,headers:r,onload(p){i?.removeEventListener("abort",d);const u=p.status;if(u<200||u>=300){s(new Error(`HTTP ${u} for ${n}`));return}a(p.response)},onerror(){i?.removeEventListener("abort",d),s(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",d),s(new Error(`Timeout for ${n}`))}})})}async function Oo(e,t={}){const{signal:n,request:o=yn}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const r=await o({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:r}}function Bo(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),o=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),r=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),a=Math.max(1,r-n),s=Math.max(1,i-o),c=document.createElement("canvas");c.width=e.width,c.height=e.height;const d=c.getContext("2d");return d.putImageData(e,0,0),d.getImageData(n,o,a,s)}function Fo(e,t,n){const o=document.createElement("canvas");o.width=e.width,o.height=e.height,o.getContext("2d").putImageData(e,0,0);const r=document.createElement("canvas");r.width=n,r.height=t;const i=r.getContext("2d");i.drawImage(o,0,0,n,t);const{data:a}=i.getImageData(0,0,n,t),s=new Uint8Array(1*t*n*3);let c=0;for(let d=0;d<t*n;d+=1)s[c++]=a[d*4],s[c++]=a[d*4+1],s[c++]=a[d*4+2];return s}function Vo(e,t,n=[114,114,114]){const{width:o,height:r}=e,i=Math.min(t/r,t/o),a=Math.round(o*i),s=Math.round(r*i),c=(t-a)/2,d=(t-s)/2,f=Math.round(d-.1),p=Math.round(c-.1),u=document.createElement("canvas");u.width=o,u.height=r,u.getContext("2d").putImageData(e,0,0);const h=document.createElement("canvas");h.width=t,h.height=t;const v=h.getContext("2d");v.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,v.fillRect(0,0,t,t),v.drawImage(u,0,0,o,r,p,f,a,s);const g=v.getImageData(0,0,t,t).data,m=new Float32Array(3*t*t),x=t*t;for(let y=0;y<x;y+=1){const L=g[y*4],S=g[y*4+1],A=g[y*4+2];m[y]=L/255,m[x+y]=S/255,m[2*x+y]=A/255}return{tensor:m,ratio:i,pad:{dw:c,dh:d},size:t}}function zo(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const Uo="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Ho="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Go="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",qo="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function vn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Uo},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Ho,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Go},ortWasmBaseUrl:qo}}const Ne={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Cn=null;function Ko(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function nt(){const e=Ko();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const xn=new Proxy({},{get(e,t){return nt()[t]}});function jo(){const e=nt(),t=vn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function wn(e,t={}){jo();const n=nt(),o=t.prefer||["webgpu","wasm"],r=[];for(const i of o)try{const a=await n.InferenceSession.create(e,{executionProviders:[i]});return Cn=i,{session:a,provider:i}}catch(a){r.push(`${i}: ${a instanceof Error?a.message:String(a)}`)}throw new Error(`Failed to create ORT session. Tried: ${r.join(" | ")}`)}function ot(){return Cn}const rt=384,Wo="images",Yo="output0";async function Jo(e,t,n={}){const o=n.confThresh??.4,{tensor:r,ratio:i,pad:a}=Vo(t,rt),s=new xn.Tensor("float32",r,[1,3,rt,rt]),c=await e.run({[Wo]:s}),d=c[Yo]||Object.values(c)[0];if(!d)return[];const f=d.data,p=d.dims||[],u=p.length>=2?p[p.length-1]:7,b=Math.floor(f.length/u),h=[];for(let v=0;v<b;v+=1){const g=v*u,m=f[g+1],x=f[g+2],y=f[g+3],L=f[g+4],S=f[g+5],A=f[g+6];if(A<o)continue;const E=zo({x1:m,y1:x,x2:y,y2:L},i,a);h.push({...E,score:Number(A),classId:Number(S)})}return h.sort((v,g)=>g.score-v.score),h}function Xo(e,t,n=Ne){const o=n.alphabet,r=n.maxPlateSlots,i=o.length,a=e,s=[],c=[];for(let f=0;f<r;f+=1){let p=0,u=-1/0;for(let b=0;b<i;b+=1){const h=Number(a[f*i+b]);h>u&&(u=h,p=b)}s.push(o[p]),c.push(u)}let d=s.join("");return n.padChar&&(d=d.replace(new RegExp(`${Zo(n.padChar)}+$`),"")),{text:d,charProbs:c.slice(0,Math.max(d.length,1))}}function Zo(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Qo(e,t){const{imgHeight:n,imgWidth:o}=Ne,r=Fo(t,n,o),i=new xn.Tensor("uint8",r,[1,n,o,3]),a=await e.run({input:i}),s=a.plate||Object.values(a)[0],c=s.dims||[1,Ne.maxPlateSlots,Ne.alphabet.length],d=c[c.length-1],p=c[c.length-2]*d,u=s.data,b=u.length>=p?u.slice(0,p):u;return Xo(b)}const he="[A-Z]",be="[0-9]",er=[{id:"LLDDDD",re:new RegExp(`^${he}{2}${be}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${be}{4}${he}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${be}{2}${he}{2}${be}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${he}{2}${be}{2}${he}{2}$`)}],tr={0:"O",1:"I",5:"S",8:"B"},nr={O:"0",I:"1",L:"1",S:"5",B:"8"};function $e(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function ce(e){const t=$e(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function or(e){const t=$e(e);if(t.length!==6)return null;for(const n of er)if(n.re.test(t))return n.id;return null}function it(e,t){const n=$e(e).slice(0,6).split("");if(n.length!==6)return[];const o=[];function r(i,a,s){if(a>t)return;if(i===6){const p=s.join(""),u=or(p);u&&o.push({plate:p,corrections:a,patternId:u});return}if(r(i+1,a,s),a>=t)return;const c=s[i],d=tr[c];if(d){const p=s.slice();p[i]=d,r(i+1,a+1,p)}const f=nr[c];if(f){const p=s.slice();p[i]=f,r(i+1,a+1,p)}}return r(0,0,n),o.sort((i,a)=>i.corrections-a.corrections||a.plate.localeCompare(i.plate)),o}function En(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let o=0;for(let r=0;r<n;r+=1)o+=e[r]??0;return o/n}function rr(e,t=[],n={}){const o=n.minConfidenceNoCorrection??.55,r=n.minConfidenceOneCorrection??.72,i=$e(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:ce(i),patternId:null,corrections:0,meanConfidence:En(t,i.length),reason:"too-short"};const a=i.slice(0,6),s=En(t,6),c=it(a,0);if(c.length>0&&s>=o){const p=c[0];return{accepted:!0,plate:p.plate,plateFormatted:ce(p.plate),patternId:p.patternId,corrections:0,meanConfidence:s}}const d=it(a,1).filter(p=>p.corrections===1);if(d.length>0&&s>=r){const p=d[0];return{accepted:!0,plate:p.plate,plateFormatted:ce(p.plate),patternId:p.patternId,corrections:1,meanConfidence:s}}return it(a,2).some(p=>p.corrections>1)&&c.length===0&&d.length===0?{accepted:!1,plate:a,plateFormatted:ce(a),patternId:null,corrections:2,meanConfidence:s,reason:"excessive-corrections"}:c.length>0||d.length>0?{accepted:!1,plate:a,plateFormatted:ce(a),patternId:null,corrections:c.length?0:1,meanConfidence:s,reason:"low-confidence"}:{accepted:!1,plate:a,plateFormatted:ce(a),patternId:null,corrections:0,meanConfidence:s,reason:"no-reliable-pattern"}}const Q="models",ir=1;let Me=null;function at(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Me||(Me=new Promise((e,t)=>{const n=indexedDB.open(bt,ir);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(Q)||o.createObjectStore(Q,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Me)}async function Sn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function ar(e){const t=await at();return new Promise((n,o)=>{const i=t.transaction(Q,"readonly").objectStore(Q).get(e);i.onsuccess=()=>{const a=i.result;n(a?.bytes||null)},i.onerror=()=>o(i.error)})}async function sr(e,t,n){const o=await at();return new Promise((r,i)=>{const a=o.transaction(Q,"readwrite");a.objectStore(Q).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),a.oncomplete=()=>r(),a.onerror=()=>i(a.error)})}async function lr(){const e=await at();return new Promise((t,n)=>{const o=e.transaction(Q,"readwrite");o.objectStore(Q).clear(),o.oncomplete=()=>t(),o.onerror=()=>n(o.error)})}async function Ln(e,t={}){const{onStatus:n,signal:o}=t,r=await ar(e.id).catch(()=>null);if(r&&await Sn(r)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:r,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await yn({method:"GET",url:e.url,responseType:"arraybuffer",signal:o}),a=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!a)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const s=await Sn(a);if(s!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${s}`);return await sr(e.id,a,s).catch(()=>{}),{bytes:a,cacheHit:!1}}let ye=null;async function cr(e={}){if(ye)return{sessions:ye,diagnostics:{provider:ot(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=vn(),n=await Ln(t.detector,e),o=await Ln(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const r=await wn(n.bytes),i=await wn(o.bytes);return ye={detector:r.session,ocr:i.session},{sessions:ye,diagnostics:{provider:r.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function dr(){ye=null}async function ur(e,t,n={}){const{signal:o}=n;let r=0,i;try{const s=await $o(t);i=Mo(s).imageData,s.close?.()}catch{return null}const a=await Jo(e.detector,i);for(const s of a){if(o?.aborted)throw new DOMException("Aborted","AbortError");r+=1;const c=Bo(i,s),d=await Qo(e.ocr,c),f=rr(d.text,d.charProbs);if(f.accepted)return{plate:f.plate,plateFormatted:f.plateFormatted,detectionsTried:r}}return{plate:"",plateFormatted:"",detectionsTried:r}}async function fr(e,t={}){const n=Date.now(),{onStatus:o,signal:r,request:i}=t,a=e.length,s=await cr({onStatus:o,signal:r}),{detector:c,ocr:d}=s.sessions;let f=0,p=0;for(let u=0;u<a;u+=1){if(r?.aborted)return De("cancelled",s.diagnostics,p,f,n);const b=e[u];o?.(`Downloading image ${u+1} of ${a}`);let h;try{h=await Oo(b,{signal:r,request:i})}catch(g){if(r?.aborted||g?.name==="AbortError")return De("cancelled",s.diagnostics,p,f,n);o?.(`Failed to download image ${u+1} of ${a}, skipping…`);continue}o?.(`Scanning image ${u+1} of ${a}`),p+=1;let v;try{v=await ur({detector:c,ocr:d},h.bytes,{signal:r})}catch(g){if(r?.aborted||g?.name==="AbortError")return De("cancelled",s.diagnostics,p,f,n);continue}finally{h=null}if(v&&(f+=v.detectionsTried,v.plate))return{ok:!0,plate:v.plate,plateFormatted:v.plateFormatted,diagnostics:{provider:ot()||s.diagnostics.provider,detectorCacheHit:s.diagnostics.detectorCacheHit,ocrCacheHit:s.diagnostics.ocrCacheHit,imagesScanned:p,detectionsTried:f,elapsedMs:Date.now()-n}}}return De("no-reliable-plate",s.diagnostics,p,f,n)}function De(e,t,n,o,r){return{ok:!1,reason:e,diagnostics:{provider:ot()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-r}}}async function An(e){return await Do(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function kn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function _n({plate:e,phone:t,fallbackId:n}={}){const o=e==null?"":String(e).trim();if(o)return{id:o,isRandom:!1};const r=t==null?"":String(t).trim();if(r)return{id:r,isRandom:!1};const i=n==null?"":String(n).trim();return i?{id:i,isRandom:!0}:{id:kn(),isRandom:!0}}function In(e={}){return _n(e).id}function pr(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function mr(e,{phone:t="",fallbackId:n=""}={}){const o=e||{},r=t==null?"":String(t).trim(),i=o.plate==null?"":String(o.plate).trim(),s=[`ID: ${In({plate:i,phone:r,fallbackId:n})}`,`Telefone: ${r}`,""];for(const d of Ge){if(d==="url")continue;const f=vt[d];let p=o[d]==null?"":String(o[d]);d==="customerValueEur"&&p&&!/€/.test(p)&&(p=`${p} €`),s.push(`${f}: ${p}`)}const c=o.url==null?"":String(o.url);return s.push(""),s.push(c),s.join(`
`)}const st="<<<LEAD_CLIP_V1>>>",Tn="<<<END_LEAD_CLIP>>>";function gr(e,t={}){const n=e?.fields||{},o=e?.source||{},r=t.phone==null?"":String(t.phone).trim();return{v:1,id:In({plate:n.plate,phone:r,fallbackId:t.fallbackId}),phone:r,plate:String(n.plate||""),clientName:String(n.clientName||o.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||o.url||""),siteId:String(o.siteId||""),title:String(o.title||""),description:ke(o.description||"")}}function hr(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${st}
${n}
${Tn}
`}function br(e){const t=String(e||""),n=t.indexOf(st);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const o=n+st.length,r=t.indexOf(Tn,o);if(r<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(o,r).trim(),a=t.slice(0,n).replace(/\s+$/,"");try{const s=JSON.parse(i);return!s||s.v!==1||typeof s!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:s,humanText:a}}catch(s){return{ok:!1,error:s instanceof Error?s.message:"JSON parse failed"}}}const yr="listingCache",vr=2880*60*1e3;function Rn(){return`${we}${yr}`}function lt(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Cr(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,o]of Object.entries(e))typeof n=="string"&&n&&lt(o)&&(t[n]={processedAt:o.processedAt,phone:o.phone,clipboard:o.clipboard,fallbackId:typeof o.fallbackId=="string"?o.fallbackId:"",listingRecord:o.listingRecord});return t}async function xr(){const e=await hn(Rn(),{});return Cr(e)}async function ct(e){await bn(Rn(),e)}async function dt(e=Date.now()){const t=await xr(),n={};let o=!1;for(const[r,i]of Object.entries(t))e-i.processedAt<=vr?n[r]=i:o=!0;return(o||Object.keys(n).length!==Object.keys(t).length)&&await ct(n),n}async function wr(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const r=(await dt(t))[n];return r&&lt(r)?r:null}async function Er(e,t,n=Date.now()){const o=typeof e=="string"?e.trim():"";if(!o||!lt(t))return null;const r=await dt(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return r[o]=i,await ct(r),i}async function Sr(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const o=await dt(t);return n in o?(delete o[n],await ct(o),!0):!1}const Pn="valuationDefaults";async function Lr(e,t=null){return hn(`${we}${e}`,t)}async function Ar(e,t){await bn(`${we}${e}`,t)}async function Nn(){const e=await Lr(Pn,null);return!e||typeof e!="object"?{...Se}:{...Se,...e}}async function kr(e){const t={...Se,...e};return await Ar(Pn,t),t}function ut(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function _r(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):ut(t)?Promise.resolve("visible"):new Promise(o=>{const r=()=>{a(),o("cancelled")},i=()=>{ut(t)&&(a(),o("visible"))},a=()=>{t.removeEventListener("visibilitychange",i),n?.removeEventListener("abort",r)};t.addEventListener("visibilitychange",i),n&&n.addEventListener("abort",r,{once:!0})})}const Ir=5e3;function Tr(){let e=yt(),t=null,n=null,o=null,r="",i=0;function a(l){l&&t?.setCaptureStatus(l)}function s(l){e={...e,statusMessage:l},t?.setStatus(l);const C=String(l||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);C&&a(`analisando imagem ${C[1]} de ${C[2]}`)}function c(){try{const l=gn().extractListing(document);if(l?.url)return j(l.url)}catch{}return typeof location<"u"&&location?.href?j(location.href):""}function d(l={}){const C=l.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",T=l.phone??e.lastPhone??"",I=l.fallbackId??e.fallbackId??"",N=!!String(C).trim(),z=!!String(T).trim();if(!N&&!z&&!String(I).trim()){t?.setClipboardId({id:"",isRandom:!1,hasPlate:!1,hasPhone:!1});return}t?.setClipboardId({..._n({plate:C,phone:T,fallbackId:I}),hasPlate:N,hasPhone:z})}function f(l,C){const T=C.listingRecord,I=C.phone||"",N=T?.fields?.plate||"",D=!String(N).trim()&&!String(I).trim()&&(C.fallbackId||pr(C.clipboard))||"";r=l,i=C.processedAt,e={...e,lastPlate:N,lastPhone:I,lastClipboard:C.clipboard||"",fallbackId:D,listingRecord:T,view:"form"},t?.showListingForm(T,{phone:I}),t?.setCopyEnabled(!!C.clipboard),t?.setCopyLabel("Copy"),d({plate:N,phone:I,fallbackId:D}),a("ready to copy"),s("Ready to copy")}function p(l,C=""){const T=l?.fields?.plate||"",I=C==null?"":String(C).trim();let N=e.fallbackId||"";!String(T).trim()&&!I&&(N||(N=kn()),e={...e,fallbackId:N});const z=mr(l.fields,{phone:I,fallbackId:e.fallbackId}),D=gr(l,{phone:I,fallbackId:e.fallbackId});return hr(z,D)}async function u(l){const C=r||j(l.listingRecord?.fields?.url||"")||c();if(!C||!l.listingRecord||!l.clipboard)return;const T=l.processedAt??i??Date.now();r=C,i=T,await Er(C,{processedAt:T,phone:l.phone??e.lastPhone??"",clipboard:l.clipboard,fallbackId:l.fallbackId??e.fallbackId??"",listingRecord:l.listingRecord})}async function b(){try{const l=c();if(l){const C=await wr(l);if(C){if(xt(C.listingRecord,{plate:C.listingRecord?.fields?.plate,phone:C.phone})){f(l,C);return}await Sr(l)}}}catch{}v()}function h(){o!=null&&(clearTimeout(o),o=null)}function v(){h(),a("waiting"),o=setTimeout(()=>{o=null,S()},Ir)}function g(l){e={...e,busy:l,view:l?"reading":e.listingRecord?"form":"idle"},t?.setBusy(l),l&&a("reading")}function m(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const l=e.lastDiagnostics;if(!l){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${l.provider||"n/a"}`,`Detector cache: ${l.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${l.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${l.imagesScanned??0}`,`Detections tried: ${l.detectionsTried??0}`,`Elapsed: ${l.elapsedMs??0} ms`].join(`
`))}function x(l,C,T){const I=[];return C.plate?I.push(`Plate found: ${C.plate}`):I.push("No reliable plate found."),C.phone&&I.push(`Phone: ${C.phone}`),(l.fields.make||l.fields.model)&&I.push(`Listing: ${[l.fields.make,l.fields.model].filter(Boolean).join(" ")}`.trim()),I.push(T),I.join(`
`)}function y(l){e={...e,lastClipboard:l},t?.setCopyEnabled(!!l)}async function L(l){return y(l),An(l)}async function S(){if(h(),e.busy)return;n=new AbortController;const{signal:l}=n;g(!0);try{const C=gn(),T=await Nn();s("Extracting listing fields…");const I=C.extractListing(document);let N={ok:!1,reason:"no-images"},z=0;const D=!!e.listingRecord;if(D){const fe=String(e.listingRecord?.fields?.plate||e.lastPlate||"").trim();N=fe?{ok:!0,plate:fe,reason:"reused"}:{ok:!1,reason:"reused-no-plate"},s("Refreshing listing text and phone…")}else{s("Looking for listing images…");const fe=await C.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:ht,count:xe}=fe;z=xe,xe>0?(s(`Found ${xe} listing images — scanning…`),s("Loading plate recognition models…"),N=await fr(ht,{signal:l,onStatus:s}),e={...e,lastDiagnostics:N.diagnostics},m()):s("No listing images — waiting for phone…")}if(l.aborted||N.reason==="cancelled"){s("Cancelled.");return}if(ut()||(a("lendo tel"),s("Waiting for this tab to extract phone…")),await _r({signal:l})==="cancelled"||l.aborted){s("Cancelled.");return}a("lendo tel"),s("Waiting for phone button…");const O=await C.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,buttonAppearDelayMs:2e3,buttonAppearAttempts:2,signal:l}),Y=N.ok&&N.plate?N.plate:"",U=O.ok?O.phone:"";if(l.aborted){s("Cancelled.");return}const J=qn({extracted:I,plate:Y,defaults:T});if(e={...e,lastPlate:Y,lastPhone:U,fallbackId:"",listingRecord:J,view:"form"},t?.showListingForm(J,{phone:U}),!xt(J,{plate:Y,phone:U})){y(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),a("No data found."),s("No data found.");return}const Ve=p(J,U);y(Ve),t?.setCopyLabel("Copy"),d({plate:Y,phone:U,fallbackId:e.fallbackId}),a("ready to copy"),r=j(J.fields.url||"")||c(),i=Date.now(),await u({clipboard:Ve,phone:U,listingRecord:J,processedAt:i,fallbackId:e.fallbackId});let ue=x(J,{plate:Y,phone:U},"Ready to copy");Y&&!U&&O.reason==="timeout"?ue+=`
Phone reveal timed out.`:Y&&!U&&O.reason==="no-button"&&(ue+=`
No phone button on this listing.`),!D&&z===0&&!U&&O.reason==="no-button"&&(ue+=`
No listing images found.`),s(ue)}catch(C){if(l.aborted){s("Cancelled.");return}const T=C instanceof Error?C.message:"Unknown recognition error";s(`Failed: ${T}`)}finally{n=null,g(!1)}}function A(){n?.abort()}async function E(){let l=e.lastClipboard;if(e.listingRecord&&(l=p(e.listingRecord,e.lastPhone),e={...e,lastClipboard:l},t?.setCopyEnabled(!!l)),!l){s("Nothing to copy yet.");return}const C=await An(l);C.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await u({clipboard:l,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(C.ok?"Data copied":"Clipboard copy failed.")}async function k(){if(!e.listingRecord){s("No listing to copy yet. Run Clip listing.");return}const l=p(e.listingRecord,e.lastPhone),C=await L(l);C.ok&&(a("data copied"),t?.setCopyLabel("Copy again"),await u({clipboard:l,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),s(C.ok?"Data copied":"Clipboard copy failed.")}async function R(){const l=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!l){s("No plate to copy.");return}const C=await L(l);s(C.ok?`Plate copied: ${l}`:"Clipboard copy failed.")}function M(l,C){if(l==="phone"){e={...e,lastPhone:C==null?"":String(C)},d();return}if(!e.listingRecord)return;const T=Kn(e.listingRecord,l,C);e={...e,listingRecord:T,lastPlate:l==="plate"?C:e.lastPlate},l==="plate"&&d()}async function P(){try{await lr(),dr(),s("Model cache cleared.")}catch(l){const C=l instanceof Error?l.message:"Failed to clear cache";s(C)}}function F(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},m(),s(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function W(){if(e.busy)return;const l=await Nn();e={...e,view:"settings"},t?.showSettingsForm(l),s(`Settings. Environment: production. Storage: ${we}* / ${bt}.`)}function G(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),s("Back to listing review.")):(t?.hideForm(),s("Settings closed."))}async function V(l){await kr(l),s("Defaults saved.")}function q(l=document.body){return t||(t=Zn({onClipListing:S,onCancel:A,onCopyAgain:E,onClearModelCache:P,onToggleDiagnostics:F,onSettings:W,onFieldChange:M,onCopyFullText:k,onCopyPlateOnly:R,onSettingsBack:G,onSaveDefaults:V}),t.mount(l),t.setMinimized(!0),b(),t)}function te(){h(),n?.abort(),n=null,t?.destroy(),t=null,r="",i=0,e=yt()}function B(){return e}return{mount:q,destroy:te,onClipListing:S,onCancel:A,onCopyAgain:E,onCopyFullText:k,onCopyPlateOnly:R,onFieldChange:M,onClearModelCache:P,onToggleDiagnostics:F,onSettings:W,onSettingsBack:G,onSaveDefaults:V,getState:B,setStatus:s}}function $n(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?Rr(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function Rr(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const ie="/api";async function ae(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),o=await n.text();let r=null;try{r=o?JSON.parse(o):null}catch{r=o}return{ok:n.ok,status:n.status,data:r}}async function Pr(){return ae(`${ie}/auth/me`)}async function Nr(){return ae(`${ie}/get_user_local`)}async function ve(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),ae(`${ie}/lead-clients?${t.toString()}`)}async function $r(e){return ae(`${ie}/purchase-leads/clients/${e}?page=1`)}async function Mr(e){return ae(`${ie}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function Dr(e){return ae(`${ie}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Oe(e,t=null){return ae(`${ie}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function Or(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),o=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const r=await fetch(o,{credentials:"include"});if(!r.ok)return[];const i=await r.json();return Array.isArray(i)?i:i?.data||i?.results||[]}catch{return[]}}const K={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function Mn(e){return String(e||"").replace(/\D/g,"")}function de(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function ee(e){const t=Mn(e?.phone);if(t)return t;const n=String(e?.id||"").trim(),o=Mn(n);return o&&o===n?o:""}function H(e,t){return[{label:e,value:t}]}function Be(e,t=""){const n=Array.isArray(e)?e:[],o=t.trim().toLowerCase();if(o){const r=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(o));if(r)return{label:r.label??r.nombre??r.name,value:r.value??r.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function ft(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:null,secondSurname:null}:t.length===1?{name:t[0],firstSurname:null,secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function Br(e){const t=ee(e),{name:n,firstSurname:o,secondSurname:r}=ft(e.clientName);return{name:n,firstSurname:o,secondSurname:r,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function Fr(e){const{clip:t,clientId:n,me:o,localId:r,filters:i={},vehicle:a={}}=e,s=ee(t),c=de(t.plate),d=o?.id??0,f=Array.isArray(o?.rolesId)?o.rolesId:[6],{name:p,firstSurname:u,secondSurname:b}=ft(t.clientName),h=i.estado||K.estado,v=i.origen||K.origen,g=i.contacto||K.forma_contacto,m=i.marca||K.marca_comercial,x=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,y=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),L=Number(y.replace(",","."))||null,S=a.makeLabel||t.make||"",A=a.modelLabel||t.model||"",E=Number(t.year)||null,k=a.fuelLabel||Dn(t.fuel),R=a.transmissionLabel||On(t.transmission);return{data:{toggle:!1,nombre:p,telefono1:s||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:H(h.label,h.value),origen:H(v.label,v.value),forma_contacto:H(g.label,g.value),marca_comercial:H(m.label,m.value),email:null,telefono2:null,apellido1:u,apellido2:b,kilometros:x,importado:!1,matricula:c||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:L,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:k?H(k,a.fuelValue??k):null,ccambios:R?H(R,a.transmissionValue??R):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:d,id_agente_modify:d,rol:f,vehiculo:{marca_vehiculo:S?H(S,a.makeValue??S):[],modelo:A?H(A,a.modelValue??A):[],matriculacion:E?H(E,E):[],combustible:k?H(k,a.fuelValue??k):[],ccambios:R?H(R,a.transmissionValue??R):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:r||K.id_local_actual}}function Fe(e,t=""){const n=Array.isArray(e)?e:[],o=String(t||"").trim().toLowerCase();if(!o)return null;const r=c=>String(c?.label??c?.nombre??c?.name??"").trim(),i=c=>c?.value??c?.id,a=n.find(c=>r(c).toLowerCase()===o);if(a)return{label:r(a),value:i(a)};const s=n.find(c=>{const d=r(c).toLowerCase();return d.includes(o)||o.includes(d)});return s?{label:r(s),value:i(s)}:null}async function Vr(e,t){const n={};if(!e?.make||typeof t!="function")return n;const o=await t("makes"),r=Fe(o,e.make);if(!r)return n;if(n.makeLabel=r.label,n.makeValue=r.value,e.model){const i=await t("models",{makeId:String(r.value)}),a=Fe(i,e.model);if(a){n.modelLabel=a.label,n.modelValue=a.value;const s=String(e.year||"").trim();if(s){const c=Dn(e.fuel);if(c){const d=await t("fuels",{makeId:String(r.value),modelId:String(a.value),year:s}),f=Fe(d,c);if(f){n.fuelLabel=f.label,n.fuelValue=f.value;const p=On(e.transmission);if(p){const u=await t("transmissions",{makeId:String(r.value),modelId:String(a.value),year:s,fuelId:String(f.value)}),b=Fe(u,p);b&&(n.transmissionLabel=b.label,n.transmissionValue=b.value)}}}}}}return n}function Dn(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function On(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const zr="LeadDeskDB",Ur=["Audi","BMW","BYD","Citroën","Cupra","Dacia","Fiat","Ford","Honda","Hyundai","Jeep","Kia","Mercedes-Benz","MG","Mini","Mitsubishi","Nissan","Opel","Peugeot","Porsche","Renault","Seat","Skoda","Tesla","Toyota","Volkswagen","Volvo"],Hr=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],Gr=["Manual","Automática"];function pt(e,t,n){const o=String(t||"").trim();if(!o)return"";const r=e.find(s=>s===o);if(r)return r;const i=o.toLowerCase(),a=e.find(s=>s.toLowerCase()===i);if(a)return a;if(n){const s=n(o);if(s&&e.includes(s))return s}return o}function qr(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function Kr(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function jr(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function mt(){return new Promise((e,t)=>{const n=indexedDB.open(zr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function Wr(e){const t=await mt();return new Promise((n,o)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((c,d)=>String(d.updatedAt).localeCompare(String(c.updatedAt))),n(s)},a.onerror=()=>o(a.error)})}async function Yr(e){const t=await mt();return new Promise((n,o)=>{const a=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);a.onsuccess=()=>{const s=a.result||[];s.sort((c,d)=>String(d.updatedAt).localeCompare(String(c.updatedAt))),n(s)},a.onerror=()=>o(a.error)})}function Bn(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function Jr(e){const t=await mt(),n=new Date().toISOString(),o=ee(e),r=jr(e.plate),i=Bn("client"),a=Bn("lead"),{name:s,firstSurname:c,secondSurname:d}=ft(e.clientName),f=c||"",p=d||"",u={id:i,firstName:s,firstSurname:f,secondSurname:p,phone:o,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:o,createdAt:n,updatedAt:n},b={id:a,clientId:i,plate:r,plateNormalized:r,phone:o,phoneNormalized:o,fullName:s,firstSurname:f,secondSurname:p,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:pt(Ur,e.make||""),model:e.model||"",year:e.year||"",fuel:pt(Hr,e.fuel||"",qr),transmission:pt(Gr,e.transmission||"",Kr),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((h,v)=>{const g=t.transaction(["clients","leads"],"readwrite");g.objectStore("clients").put(u),g.objectStore("leads").put(b),g.oncomplete=()=>h(void 0),g.onerror=()=>v(g.error)}),a}function Fn(e,t={}){const n=t.open||((...s)=>window.open(...s)),o=t.assign||(s=>location.assign(s)),r=t.origin||location.origin,i=new URL(e,r).href,a=n(i,"_blank");if(a){try{a.opener=null}catch{}return"new-tab"}return o(e),"same-tab"}function Vn(e={}){const t=e.open||((...i)=>window.open(...i)),n=e.assign||(i=>location.assign(i)),o=e.origin||location.origin,r=t("about:blank","_blank");if(r)try{r.opener=null}catch{}return{go(i){const a=new URL(i,o).href;return r&&!r.closed?(r.location.href=a,"new-tab"):(n(i),"same-tab")},cancel(){try{r?.close()}catch{}}}}function zn(e,t,n,o=()=>location.reload()){if(e==="new-tab"){n?.setStatus?.(`Lead ${t} criado. Aberto em nova aba. A atualizar a lista…`,"ok"),o();return}n?.setStatus?.(`Lead ${t} criado. Pop-up bloqueado — abrindo nesta aba…`,"warn")}const Xr=`
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
  box-sizing: border-box;
}
.lcf-panel--minimized {
  width: auto;
  max-width: min(360px, calc(100vw - 32px));
  max-height: none;
  overflow: hidden;
}
.lcf-panel--minimized .lcf-body {
  display: none;
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
.lcf-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lcf-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #bbb;
  background: #f5f5f5;
  border-radius: 6px;
  padding: 12px 14px;
  min-height: 48px;
  cursor: pointer;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  text-align: left;
}
.lcf-btn:disabled { opacity: .5; cursor: not-allowed; }
.lcf-btn-primary { background: #f07a1a; border-color: #f07a1a; color: #fff; }
.lcf-btn-primary:hover:not(:disabled) { background: #d96c12; border-color: #d96c12; }
.lcf-btn-success { background: #2e7d32; border-color: #2e7d32; color: #fff; }
.lcf-btn-success:hover:not(:disabled) { background: #256628; border-color: #256628; }
.lcf-kbd {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  opacity: .9;
  letter-spacing: .02em;
}
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
`,Zr="Alt+V",Qr="Alt+B",ei="Alt+A",ti="⌥V",ni="⌥B",oi="⌥A";function ri(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function ii(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=Xr;const r=ri(),i=r?ti:Zr,a=r?ni:Qr,s=r?oi:ei,c=document.createElement("div");c.className="lcf-panel";const d=document.createElement("div");d.className="lcf-header";const f=document.createElement("div");f.className="lcf-title",f.textContent="CRM · Leads";const p=document.createElement("span");p.className="lcf-badge",p.textContent="CRM";const u=document.createElement("button");u.type="button",u.className="lcf-mini",u.setAttribute("aria-label","Minimizar painel"),u.title="Minimizar",u.textContent="–",d.append(f,p,u);const b=document.createElement("div");b.className="lcf-body";const h=document.createElement("div");h.className="lcf-hint",h.textContent=`Cole o texto do Clipper (com LEAD_CLIP_V1) ou use Ler área de transferência (${i}). Com dados válidos, a verificação do cadastro corre automaticamente. Abrir 1.º lead: ${s}. Criar lead: ${a}.`;const v=document.createElement("textarea");v.className="lcf-textarea",v.placeholder="Cole aqui o texto do Clipper…";const g=document.createElement("div");g.className="lcf-summary",g.hidden=!0;const m=document.createElement("div");m.className="lcf-section-label",m.textContent="Leads encontrados",m.hidden=!0;const x=document.createElement("ul");x.className="lcf-matches";const y=document.createElement("div");y.className="lcf-actions";const L=document.createElement("button");L.type="button",L.className="lcf-btn lcf-btn-primary",L.title=`Atalho: ${i}`;const S=document.createElement("span");S.textContent="Ler área de transferência";const A=document.createElement("span");A.className="lcf-kbd",A.textContent=i,L.append(S,A);const E=document.createElement("button");E.type="button",E.className="lcf-btn lcf-btn-success",E.title=`Atalho: ${a}`,E.disabled=!0,E.hidden=!0;const k=document.createElement("span");k.textContent="Criar lead";const R=document.createElement("span");R.className="lcf-kbd",R.textContent=a,E.append(k,R),y.append(L,E);const M=document.createElement("div");M.className="lcf-status",M.dataset.tone="",M.textContent="Aguardando dados do anúncio.",b.append(h,v,g,m,x,y,M),c.append(d,b),n.append(o,c),document.documentElement.append(t);let P=!1,F=null;function W(){c.classList.toggle("lcf-panel--minimized",P),b.hidden=P,u.textContent=P?"+":"–",u.setAttribute("aria-label",P?"Expandir painel":"Minimizar painel"),u.title=P?"Expandir":"Minimizar"}function G(l){P=!!l,W()}u.addEventListener("click",()=>{G(!P)}),W();let V=!1,q=0,te=0;d.addEventListener("pointerdown",l=>{if(l.target===u)return;V=!0;const C=c.getBoundingClientRect();q=l.clientX-C.left,te=l.clientY-C.top,d.setPointerCapture(l.pointerId)}),d.addEventListener("pointermove",l=>{V&&(c.style.left=`${l.clientX-q}px`,c.style.top=`${l.clientY-te}px`,c.style.right="auto",c.style.bottom="auto")}),d.addEventListener("pointerup",()=>{V=!1}),L.addEventListener("click",()=>e.onReadClipboard()),v.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(v.value),0)}),E.addEventListener("click",()=>e.onCreate());function B(l){if(!(!l.altKey||l.ctrlKey||l.metaKey||l.shiftKey)){if(l.code==="KeyV"){l.preventDefault(),P&&G(!1),L.disabled||e.onReadClipboard();return}if(l.code==="KeyB"){if(E.hidden||E.disabled)return;l.preventDefault(),e.onCreate();return}if(l.code==="KeyA"){if(!F)return;l.preventDefault(),F()}}}return window.addEventListener("keydown",B),{setBadge(l){p.textContent=l},setStatus(l,C=""){M.textContent=l,M.dataset.tone=C||""},setText(l){v.value=l},getText(){return v.value},setSummary(l){if(!l){g.hidden=!0,g.textContent="";return}g.hidden=!1,g.innerHTML=l},setCreateVisible(l,C=!0){E.hidden=!l,E.disabled=!C},setMinimized:G,isMinimized(){return P},setMatches(l,C){x.replaceChildren(),m.hidden=l.length===0,F=l.length>0?()=>C(l[0].id):null,l.forEach((T,I)=>{const N=document.createElement("li"),z=document.createElement("div");z.className="lcf-match";const D=document.createElement("div");D.className="lcf-match-title",D.textContent=T.title;const ne=document.createElement("div");ne.className="lcf-match-sub",ne.textContent=T.subtitle;const O=document.createElement("button");O.type="button",O.className="lcf-match-open",O.textContent=I===0?`Abrir lead → (${s})`:"Abrir lead →",I===0&&(O.title=`Atalho: ${s}`),O.addEventListener("click",()=>C(T.id)),z.append(D,ne,O),N.append(z),x.append(N)})},clearMatches(){x.replaceChildren(),m.hidden=!0,F=null},destroy(){window.removeEventListener("keydown",B),t.remove()}}}function Un(e,t){return e==="new-tab"?[`Lead ${t} aberto em nova aba.`,"ok"]:[`Lead ${t}: pop-up bloqueado — abrindo nesta aba…`,"warn"]}function ai(){let e=null,t=null,n=!1,o=null,r=null;function i(){const m=$n();return t?.setBadge(m.label),m.kind==="leadDetail"&&r!=="leadDetail"&&t?.setMinimized(!0),r=m.kind,m}function a(m){const x=br(m);if(t?.clearMatches(),t?.setCreateVisible(!1),!x.ok)return e=null,t?.setSummary(null),t?.setStatus(`Falha ao analisar o texto: ${x.error}`,"error"),!1;e=x.payload,t?.setText(m);const y=ee(e);return t?.setSummary([`<div><strong>ID</strong> ${Ce(e.id)}</div>`,`<div><strong>Placa</strong> ${Ce(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${Ce(y||"—")}</div>`,`<div><strong>Veículo</strong> ${Ce([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${Ce(e.url||"—")}</div>`].join("")),i(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0}async function s(){try{const m=await navigator.clipboard.readText();t?.setText(m),a(m)&&await d()}catch(m){const x=m instanceof Error?m.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${x}). Cole o texto do Clipper no campo acima.`,"warn")}}async function c(m){a(m)&&await d()}async function d(){if(!e||n)return;if(i().backend==="leaddesk"){await f();return}await p()}async function f(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=de(e.plate),x=ee(e);let y=[];if(m&&(y=await Wr(m)),y.length===0&&x&&(y=await Yr(x)),!m&&!x){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(y.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const L=y.map(S=>({id:S.id,title:`Lead ${S.plate||S.id}`,subtitle:`${S.phone||"—"} · ${[S.make,S.model,S.year].filter(Boolean).join(" · ")||"—"} · ${S.leadStatus||""} · ${S.updatedAt||""}`.trim()}));t?.setMatches(L,S=>{const A=Fn(`/crm/leads/${S}`),[E,k]=Un(A,S);t?.setStatus(E,k)}),t?.setStatus(L.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":`${L.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(m){const x=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${x}`,"error")}finally{n=!1}}async function p(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=de(e.plate),x=ee(e);let y;if(m)y=await ve({plate:m}),y.ok&&Array.isArray(y.data)&&y.data.length===0&&x&&(y=await ve({phone:x}));else if(x)y=await ve({phone:x});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!y.ok){t?.setStatus(`Falha na verificação (HTTP ${y.status}). Está autenticado no CRM?`,"error");return}const L=Array.isArray(y.data)?y.data:[];if(L.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const S=[];for(const E of L){const k=E?.purchaseLead?.id;if(k)S.push({id:k,title:`Lead #${k}`,subtitle:`${E.name||""} ${E.firstSurname||""} · ${E.contact?.primaryPhone||""} · ${E.purchaseLead?.statusName||""}`.trim()});else if(E?.id){const M=(await $r(E.id)).data?.results||[];for(const P of M)S.push({id:P.id,title:`Lead #${P.id}`,subtitle:`Placa ${P.plate||"—"} · ${P.status?.name||""} · ${P.lastAction||""}`.trim()});M.length===0&&S.push({id:`client:${E.id}`,title:`Cliente #${E.id} (sem lead de compra)`,subtitle:`${E.name||""} ${E.firstSurname||""} · ${E.contact?.primaryPhone||""}`.trim()})}}const A=S.filter(E=>String(E.id).match(/^\d+$/));t?.setMatches(A.length?A:S,E=>{if(String(E).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const k=Fn(`/main/lead-tasacion/${E}`),[R,M]=Un(k,E);t?.setStatus(R,M)}),t?.setStatus(A.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":A.length>1?`${A.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",A.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(m){const x=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação: ${x}`,"error")}finally{n=!1}}async function u(){if(!e||n)return;if(i().backend==="leaddesk"){await b();return}await h()}async function b(){if(!ee(e)&&!de(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}const x=Vn();n=!0,t?.setStatus("Criando no LeadDesk…");try{const y=await Jr(e),L=x.go(`/crm/leads/${y}`);zn(L,y,t)}catch(y){x.cancel();const L=y instanceof Error?y.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${L}`,"error")}finally{n=!1}}async function h(){const m=ee(e);if(!m&&!de(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(!confirm("Criar cliente/lead no CRM com os dados copiados?"))return;const x=Vn();n=!0,t?.setStatus("Criando no CRM…");try{const y=await Pr();if(!y.ok||!y.data?.id){x.cancel(),t?.setStatus(`Falha de autenticação (HTTP ${y.status}). Faça login no CRM.`,"error");return}const L=y.data,S=await Nr(),A=Array.isArray(S.data)&&S.data[0]?.value||K.id_local_actual,[E,k,R,M]=await Promise.all([Oe("estado_lead_compra"),Oe("origen_lead_compra"),Oe("contacto"),Oe("marcas_comerciales",L.id)]),P={estado:Be(E.data,"Avaliação")||K.estado,origen:Be(k.data,"Captación")||K.origen,contacto:Be(R.data,"Whatsapp")||K.forma_contacto,marca:Be(M.data,"")||K.marca_comercial};let F=null;if(m){const B=await ve({phone:m});B.ok&&Array.isArray(B.data)&&B.data[0]?.id&&(F=B.data[0].id)}if(!F){const B=await Mr(Br(e));if(B.status===409)F=(await ve({phone:m||void 0,plate:de(e.plate)||void 0})).data?.[0]?.id;else if(B.ok&&B.data?.resourceId)F=B.data.resourceId;else{x.cancel(),t?.setStatus(`Falha ao criar cliente (HTTP ${B.status}): ${JSON.stringify(B.data)}`,"error");return}}if(!F){x.cancel(),t?.setStatus("Não foi possível obter clientId.","error");return}const W=await Vr(e,Or),G=Fr({clip:e,clientId:F,me:L,localId:A,filters:P,vehicle:W}),V=await Dr(G);if(!V.ok){x.cancel(),t?.setStatus(`Falha create_lead_compra (HTTP ${V.status}): ${JSON.stringify(V.data)}`,"error");return}const q=V.data?.id_lead;if(!q){x.cancel(),t?.setStatus(`Resposta inesperada: ${JSON.stringify(V.data)}`,"error");return}const te=x.go(`/main/lead-tasacion/${q}`);zn(te,q,t)}catch(y){x.cancel();const L=y instanceof Error?y.message:"erro";t?.setStatus(`Erro ao criar: ${L}`,"error")}finally{n=!1}}function v(){if(t)return t;t=ii({onReadClipboard:s,onParseText:c,onCreate:u}),i(),window.addEventListener("popstate",i),o=new MutationObserver(()=>i());const m=document.getElementById("app")||document.body;return m&&o.observe(m,{childList:!0,subtree:!0}),s(),t}function g(){window.removeEventListener("popstate",i),o?.disconnect(),o=null,t?.destroy(),t=null,e=null,r=null}return{mount:v,destroy:g,refreshContext:i}}function Ce(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const gt="__LEAD_CRM_FILLER_INITIALIZED__",si="lead-crm-filler-root";function li(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:$n().backend!=="none"?ci():di()}function ci(){if(window[gt])return{started:!1,reason:"already-initialized"};if(document.getElementById(si))return window[gt]=!0,{started:!1,reason:"panel-exists"};window[gt]=!0;const e=ai(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function di(){if(window[He])return{started:!1,reason:"already-initialized"};if(document.getElementById(Ee))return window[He]=!0,{started:!1,reason:"panel-exists"};window[He]=!0;const e=Tr(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}li()})();
