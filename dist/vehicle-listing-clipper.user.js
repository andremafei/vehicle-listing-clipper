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
(function(){"use strict";const Me="Vehicle Listing Clipper",be="vlc_prod_",lt="vehicle-listing-clipper",Oe="__VLC_PROD_INITIALIZED__",ye="vlc-panel-root";function ct(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const ve={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Fe=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],dt={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},ut=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Nn(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function Pn(e={}){return{...ve,...e}}function Dn({extracted:e=null,plate:t="",defaults:n={}}={}){const r=Pn(n),o=Nn(),i={},s=[],a=[],l=[],d=[...e?.warnings||[]];function c(g,h,y){const p=h==null?"":String(h);if(o[g]=p,!p){i[g]="missing";return}i[g]=y,y==="extracted"||y==="anpr"?s.push(g):y==="default"&&a.push(g)}const m=t?String(t).trim():"";c("plate",m,m?"anpr":"missing");const u=e?.clientName?String(e.clientName).trim():"";return c("clientName",u,u?"extracted":"missing"),c("make",e?.make||"",e?.make?"extracted":"missing"),c("model",e?.model||"",e?.model?"extracted":"missing"),c("year",e?.year||"",e?.year?"extracted":"missing"),c("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),c("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),c("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),c("engine",e?.engine||"",e?.engine?"extracted":"missing"),c("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),c("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),c("url",e?.url||"",e?.url?"extracted":"missing"),c("paintParts",r.paintParts,"default"),c("bodyParts",r.bodyParts,"default"),c("tires",r.tires,"default"),c("saleReason",r.saleReason,"default"),c("keyCount",r.keyCount,"default"),c("deductibleVat",r.deductibleVat,"default"),{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:o.clientName||e?.clientName||""},fields:o,origins:i,metadata:{extractedFields:[...new Set(s)],defaultedFields:[...new Set(a)],editedFields:l,warnings:d}}}function ft(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(o=>o&&o!=="url"):!1}function $n(e,t,n){const r=n==null?"":String(n),o={...e.fields,[t]:r},i={...e.origins,[t]:r?"edited":"missing"},s=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:o,origins:i,source:{...e.source,url:t==="url"?r:e.source.url,clientName:t==="clientName"?r:e.source.clientName},metadata:{...e.metadata,editedFields:s}}}function pt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Mn(e){let t=null;const n=new Map;let r="listing";function o(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function i(){t&&(t.replaceChildren(),n.clear())}function s(u,g,h="missing",y){const p=document.createElement("label");p.className=`vlc-field ${pt(h)}`,p.dataset.field=u;const b=document.createElement("span");b.className="vlc-field-label",b.textContent=y||dt[u]||u;const v=document.createElement("span");v.className="vlc-field-origin",v.textContent=h;const E=document.createElement("input");E.type="text",E.className="vlc-field-input",E.value=g??"",E.dataset.field=u,E.addEventListener("input",()=>{r==="listing"&&(e.onFieldChange(u,E.value),p.className=`vlc-field ${pt("edited")}`,v.textContent="edited")}),b.appendChild(v),p.append(b,E),n.set(u,E),t?.appendChild(p)}function a(){const u=document.createElement("div");u.className="vlc-form-actions";const g=document.createElement("button");g.type="button",g.className="vlc-btn vlc-btn-primary",g.textContent="Copy full text",g.addEventListener("click",()=>e.onCopyFullText());const h=document.createElement("button");h.type="button",h.className="vlc-btn",h.textContent="Copy plate only",h.addEventListener("click",()=>e.onCopyPlateOnly()),u.append(g,h),t?.appendChild(u)}function l(u,{phone:g=""}={}){r="listing",o(),i(),t.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Review listing",t.appendChild(h);const y=g==null?"":String(g).trim();s("phone",y,y?"extracted":"missing","Telefone");for(const p of Fe){let b=u.fields[p]||"",v=u.origins[p]||"missing";p==="clientName"&&!b&&u.source?.clientName&&(b=String(u.source.clientName),v="extracted"),s(p,b,v)}a()}function d(u){r="settings",o(),i(),t.hidden=!1;const g=document.createElement("div");g.className="vlc-form-heading",g.textContent="Default values",t.appendChild(g);for(const b of ut)s(b,u[b]||"","default");const h=document.createElement("div");h.className="vlc-form-actions";const y=document.createElement("button");y.type="button",y.className="vlc-btn vlc-btn-primary",y.textContent="Save defaults",y.addEventListener("click",()=>{const b={};for(const v of ut)b[v]=n.get(v)?.value??"";e.onSaveDefaults?.(b)});const p=document.createElement("button");p.type="button",p.className="vlc-btn",p.textContent="Back",p.addEventListener("click",()=>e.onBack?.()),h.append(y,p),t.appendChild(h)}function c(){t&&(t.hidden=!0)}function m(u,{phone:g}={}){if(r==="listing"){if(g!==void 0){const h=n.get("phone");h&&document.activeElement!==h&&(h.value=g==null?"":String(g))}for(const h of Fe){const y=n.get(h);if(y&&document.activeElement!==y){let p=u.fields[h]||"";h==="clientName"&&!p&&u.source?.clientName&&(p=String(u.source.clientName)),y.value=p}}}}return{ensureRoot:o,showListing:l,showSettings:d,syncListingValues:m,hide:c,getMode:()=>r,getElement:()=>o()}}const On=`
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
`;function Fn(e){let t=null,n=null,r=null,o=null,i=null,s=null,a=null,l=null,d=null,c=null,m=null,u=null,g=null,h=!0,y="waiting",p=!1,b=null,v=0,E=0,w=null;const k=Mn({onFieldChange:(x,A)=>e.onFieldChange(x,A),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:x=>e.onSaveDefaults(x)});function S(){o&&(o.textContent=h?y:Me)}const _='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',I='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function T(){!n||!g||(n.classList.toggle("vlc-panel--minimized",h),g.innerHTML=h?_:I,g.setAttribute("aria-label",h?"Expand panel":"Minimize panel"),g.title=h?"Expand":"Minimize",S())}function L(x){h=!!x,T()}function $(){L(!h)}function H(x){y=x,S()}function M(){d&&(d.disabled=!p),c&&(c.disabled=!p)}function O(x,A){if(!n)return;const R=n.getBoundingClientRect(),me=Math.max(0,window.innerWidth-R.width),re=Math.max(0,window.innerHeight-R.height),ge=Math.min(Math.max(0,x),me),he=Math.min(Math.max(0,A),re);n.style.left=`${ge}px`,n.style.top=`${he}px`,n.style.right="auto",n.style.bottom="auto"}function D(x){if(!n||!r||x.target?.closest("button")||x.button!==0)return;const R=n.getBoundingClientRect();b=x.pointerId,v=x.clientX-R.left,E=x.clientY-R.top,r.classList.add("vlc-header--dragging"),r.setPointerCapture(x.pointerId),x.preventDefault()}function j(x){b===x.pointerId&&O(x.clientX-v,x.clientY-E)}function F(x){b===x.pointerId&&(b=null,r?.classList.remove("vlc-header--dragging"),r?.hasPointerCapture(x.pointerId)&&r.releasePointerCapture(x.pointerId))}function at(x=document.body){if(document.getElementById(ye))return t=document.getElementById(ye),t;t=document.createElement("div"),t.id=ye,t.setAttribute("data-vlc-panel","1");const A=t.attachShadow({mode:"open"}),R=document.createElement("style");R.textContent=On,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Me),r=document.createElement("div"),r.className="vlc-header",r.addEventListener("pointerdown",D),r.addEventListener("pointermove",j),r.addEventListener("pointerup",F),r.addEventListener("pointercancel",F);const me=document.createElement("div");me.className="vlc-header-main";const re=document.createElement("div");re.className="vlc-header-text",o=document.createElement("h1"),o.className="vlc-title",o.textContent=Me,re.appendChild(o),u=document.createElement("p"),u.className="vlc-clipboard-id",u.hidden=!0,re.appendChild(u),me.appendChild(re),m=f("Clip again",()=>e.onClipListing()),m.classList.add("vlc-btn-header-clip"),c=f("Copy again",()=>e.onCopyAgain()),c.classList.add("vlc-btn-header-copy"),c.disabled=!0,g=document.createElement("button"),g.type="button",g.className="vlc-btn vlc-btn-icon",g.addEventListener("click",$);const ge=document.createElement("div");ge.className="vlc-header-actions",ge.append(m,c,g),r.append(me,ge);const he=document.createElement("div");he.className="vlc-body";const st=document.createElement("div");st.className="vlc-actions",a=f("Clip listing",()=>e.onClipListing()),l=f("Cancel",()=>e.onCancel()),l.disabled=!0,d=f("Copy again",()=>e.onCopyAgain()),d.disabled=!0;const Vr=f("Clear model cache",()=>e.onClearModelCache()),zr=f("Diagnostics",()=>e.onToggleDiagnostics()),Ur=f("Settings",()=>e.onSettings());st.append(a,l,d,Vr,zr,Ur),i=document.createElement("div"),i.className="vlc-status",i.setAttribute("aria-live","polite"),s=document.createElement("div"),s.className="vlc-diag",s.hidden=!0;const Hr=k.getElement();return he.append(st,i,s,Hr),n.append(r,he),A.append(R,n),T(),x.appendChild(t),t}function f(x,A){const R=document.createElement("button");return R.type="button",R.className="vlc-btn",R.textContent=x,R.addEventListener("click",A),R}function C(x){i&&(i.textContent=x)}function N(x){const A=!!x;a&&(a.disabled=A),m&&(m.disabled=A),l&&(l.disabled=!A)}function P({id:x="",isRandom:A=!1}={}){if(!u)return;const R=String(x||"").trim();if(!R){u.hidden=!0,u.textContent="",u.classList.remove("vlc-clipboard-id--random");return}u.hidden=!1,u.textContent=A?`ID: ${R} · random`:`ID: ${R}`,u.classList.toggle("vlc-clipboard-id--random",!!A)}function z(x){p=!!x,M()}function oe(x){const A=x||"Copy again";d&&(d.textContent=A),c&&(c.textContent=A)}function G(x=2e3){w!=null&&(clearTimeout(w),w=null);for(const A of[c,d])A&&A.classList.add("vlc-btn--copied");w=setTimeout(()=>{w=null;for(const A of[c,d])A?.classList.remove("vlc-btn--copied")},x)}function X(x,A=""){s&&(s.hidden=!x,s.textContent=A)}function Tn(x,{phone:A=""}={}){k.showListing(x,{phone:A})}function Q(x){k.showSettings(x)}function W(){k.hide()}function B(){w!=null&&(clearTimeout(w),w=null),r&&(r.removeEventListener("pointerdown",D),r.removeEventListener("pointermove",j),r.removeEventListener("pointerup",F),r.removeEventListener("pointercancel",F)),t?.remove(),t=null,n=null,r=null,o=null,i=null,s=null,a=null,l=null,d=null,c=null,m=null,u=null,g=null,h=!0,y="waiting",p=!1,b=null}return{mount:at,setStatus:C,setBusy:N,setClipboardId:P,setCopyEnabled:z,setCopyLabel:oe,flashCopySuccess:G,setCaptureStatus:H,setDiagnostics:X,showListingForm:Tn,showSettingsForm:Q,hideForm:W,setMinimized:L,toggleMinimized:$,destroy:B}}function ie(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function Ce(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return ie(n)}function mt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function gt(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function ht(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function bt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function yt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o===99||o===999)return"1.0";if(o>=100)return(o/1e3).toFixed(1)}const r=t.replace(",",".");return r==="1"?"1.0":r}function vt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const r=t.replace(/[^\d]/g,"");return r?`${r} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function Ct(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function xe(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function we(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function Bn(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return we(t)}function q(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let r=`${n.origin}${n.pathname}`;const i=r.toLowerCase().indexOf(".html");return i!==-1&&(r=r.slice(0,i+5)),r}catch{return""}}const xt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",wt='#mainContent img[data-testid="swiper-image-lazy"]',Et="#mainContent div.swiper-wrapper img",St=[xt,wt,Et],Lt='#mainContent button[data-testid="ad-contact-phone"]',kt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',At='#mainContent [data-testid="ad-parameters-container"]',_t='#mainContent [data-testid="ad-price-container"] h3',Be='link#ssr_canonical[rel="canonical"]',It='#mainContent [data-testid="offer_title"]',Vn='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',Rt='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Tt='script[type="application/ld+json"]';function zn(e){return!!(e&&typeof e.click=="function")}function Nt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function ae(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Ee(e){if(e.hidden)return!0;const n=Nt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Se(e){if(!e||typeof e.getBoundingClientRect!="function"||Ee(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(ae(e)>0)return!0;const n=Nt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Pt(e=document){return[...e.querySelectorAll(Lt)].filter(t=>zn(t))}function Dt(e=document){const t=Pt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(a=>!Ee(a)),o=[...n.length>0?n:t].sort((a,l)=>{const d=Se(a)?1:0,c=Se(l)?1:0;return d!==c?c-d:ae(l)-ae(a)}),i=(()=>{const a=o[0];return{visible:Se(a)?1:0,area:ae(a)}})(),s=o.filter(a=>(Se(a)?1:0)===i.visible&&ae(a)===i.area);return s[s.length-1]||o[o.length-1]||t[t.length-1]}function Le(e=document){const t=[...e.querySelectorAll(kt)];for(const n of t){if(t.length>1&&Ee(n))continue;const r=n.getAttribute("href")||"",o=Ce(r);if(o)return o;const i=ie(n.textContent||"");if(i)return i}if(t.length>0){const n=t[t.length-1],r=n.getAttribute("href")||"",o=Ce(r);if(o)return o;const i=ie(n.textContent||"");if(i)return i}return null}function Un(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function Hn(e){try{e.click()}catch{}Un(e)}async function Gn(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=Le(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const s=Pt(t);if(s.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const a=Dt(t),l=[];a&&l.push(a);for(const c of s)c!==a&&!Ee(c)&&l.push(c);const d=Date.now()+n;for(const c of l){if(o?.aborted)return{ok:!1,reason:"cancelled"};Hn(c);const m=Math.min(d,Date.now()+5e3);for(;Date.now()<m;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=Le(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(g=>setTimeout(g,r))}}for(;Date.now()<d;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=Le(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(m=>setTimeout(m,r))}return{ok:!1,reason:"timeout"}}function qn(e){const t=new Map,n=e.querySelector(At);if(!n)return t;for(const r of n.querySelectorAll("p")){const o=(r.textContent||"").replace(/\s+/g," ").trim();if(!o)continue;const i=o.indexOf(":");if(i<=0)continue;const s=o.slice(0,i).trim().toLowerCase(),a=o.slice(i+1).trim();s&&a&&t.set(s,a)}return t}function jn(e){const t=e.querySelectorAll(Tt);for(const n of t){const r=n.textContent||"";if(r.trim())try{const o=JSON.parse(r),i=Array.isArray(o)?o:[o];for(const s of i)if(s&&s["@type"]==="Vehicle")return s}catch{}}return null}function Wn(e){const n=(e.querySelector?.(Be)||(typeof document<"u"?document.querySelector(Be):null))?.getAttribute?.("href")||"";return n?q(n):typeof location<"u"&&location?.href?q(location.href):""}function Kn(e){const t=e.querySelectorAll(Rt);for(const n of t){const o=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(o?.[1])try{return decodeURIComponent(o[1]).replace(/-/g," ")}catch{return o[1].replace(/-/g," ")}}return""}function Yn(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function Xn(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Jn(e=document){const t=[],n=[];function r(_,I){I&&t.push(_)}const o=qn(e),i=jn(e),s=Wn(e);r("url",s);const a=Xn(s,i);r("listingId",a);const d=(e.querySelector(It)?.textContent||i?.name||"").replace(/\s+/g," ").trim();r("title",d);const c=we(i?.description||"");r("description",c);const u=(e.querySelector(Vn)?.textContent||"").replace(/\s+/g," ").trim();r("clientName",u);let g=Yn(i);g||(g=Kn(e)),g=xe(g),r("make",g);let h=o.get("modelo")||i?.model||"";h=xe(h),r("model",h);let y=o.get("ano")||i?.productionDate||i?.modelDate||"";y=Ct(y),r("year",y);const p=mt(o.get("quilómetros")||o.get("quilometros")||"");r("mileageKm",p);const b=ht(o.get("tipo de caixa")||"");r("transmission",b);const v=bt(o.get("combustível")||o.get("combustivel")||"");r("fuel",v);const E=yt(o.get("cilindrada")||"");r("engine",E);const w=vt(o.get("potência")||o.get("potencia")||"");r("powerCv",w);let k=i?.offers?.price;(k==null||k==="")&&(k=e.querySelector(_t)?.textContent||"");const S=gt(k);return r("priceEur",S),(!g||!h)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"olx-pt",url:s,listingId:a,title:d,description:c,clientName:u,make:g,model:h,year:y,mileageKm:p,transmission:b,fuel:v,engine:E,powerCv:w,priceEur:S,extractedFields:[...new Set(t)],warnings:n}}function Zn(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),r=n[0],o=n[1];let i=null;return o&&/^\d+w$/i.test(o)&&(i=Number.parseInt(o,10)),{url:r,width:i}}).filter(t=>!!t.url)}function Qn(e){const t=Zn(e);if(t.length===0)return null;const n=t.filter(o=>typeof o.width=="number");if(n.length===0)return t[t.length-1].url;let r=n[0];for(let o=1;o<n.length;o+=1)n[o].width>r.width&&(r=n[o]);return r.url}function $t(e){if(!e)return null;const t=Qn(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function eo(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Mt(e=document){for(const t of St){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ve(e=document){const{images:t,selectorUsed:n}=Mt(e),r=[],o=new Set;for(const i of t){const s=$t(i);if(!s)continue;const a=eo(s);o.has(a)||(o.add(a),r.push(a))}return{urls:r,count:r.length,selectorUsed:n}}async function to(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ve(t);if(o.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return o;const s=Date.now()+n;for(;o.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,r)),o=Ve(t);return o}const Ot={siteId:"olx-pt",discoverListingImages:Ve,discoverListingImagesWithWait:to,queryGalleryImages:Mt,extractListing:Jn,findPhoneRevealButton:Dt,readRevealedPhone:Le,revealContactPhone:Gn,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:xt,FALLBACK_TESTID_SELECTOR:wt,FALLBACK_SWIPER_IMG_SELECTOR:Et,GALLERY_SELECTORS:St,PHONE_REVEAL_BUTTON_SELECTOR:Lt,CONTACT_PHONE_SELECTOR:kt,AD_PARAMETERS_SELECTOR:At,AD_PRICE_SELECTOR:_t,CANONICAL_LINK_SELECTOR:Be,OFFER_TITLE_SELECTOR:It,BREADCRUMB_ITEM_SELECTOR:Rt,JSON_LD_SELECTOR:Tt}},Ft="script#__NEXT_DATA__",Bt='h1.offer-title, [data-testid="summary-info-area"] h1',Vt='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',zt='[data-testid="content-description-section"]',ze='link[rel="canonical"]',ke='[data-testid="aside-seller-info"]',no='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',Ut='[data-testid="seller-info-contact-box"]',Ht='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Gt='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',qt='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',jt=[Gt,qt];function oo(e){return`[data-testid="${e}"] p:last-of-type`}const ro=/ver\s+telefone/i;function io(e){return!!(e&&typeof e.click=="function")}function Wt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Ue(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function se(e){if(e.hidden)return!0;const n=Wt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Kt(e){if(!e||typeof e.getBoundingClientRect!="function"||se(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Ue(e)>0)return!0;const n=Wt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Yt(e){if(!io(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return ro.test(t)}function Xt(e=document){const t=[],n=new Set;function r(o){const i=e.querySelector?.(o)||null;if(i)for(const s of i.querySelectorAll("button"))!Yt(s)||n.has(s)||(n.add(s),t.push(s))}r(ke),r(Ut);for(const o of e.querySelectorAll?.("button")||[])!Yt(o)||n.has(o)||(n.add(o),t.push(o));return t}function Jt(e=document){const t=Xt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(ke);if(n){const s=t.find(a=>n.contains(a)&&!se(a));if(s)return s}const r=t.filter(s=>!se(s));return[...r.length>0?r:t].sort((s,a)=>{const l=Kt(s)?1:0,d=Kt(a)?1:0;return l!==d?d-l:Ue(a)-Ue(s)})[0]||t[0]}function Ae(e=document){const t=[...e.querySelectorAll?.(Ht)||[]],n=e.querySelector?.(ke),r=n&&t.length>1?[...t.filter(o=>n.contains(o)),...t.filter(o=>!n.contains(o))]:t;for(const o of r){if(r.length>1&&se(o))continue;const i=o.getAttribute("href")||"",s=Ce(i);if(s)return s;const a=ie(o.textContent||"");if(a)return a}if(r.length>0){const o=r[0],i=o.getAttribute("href")||"",s=Ce(i);if(s)return s;const a=ie(o.textContent||"");if(a)return a}return null}function ao(e){try{const t=Object.keys(e).find(o=>o.startsWith("__reactProps$")||o.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const r={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(r),!0}catch{return!1}}function so(e){try{e.click()}catch{}ao(e)}async function lo(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:r=250,signal:o}=e,i=Ae(t);if(i)return{ok:!0,phone:i,clicked:!1,alreadyVisible:!0};const s=Xt(t);if(s.length===0)return{ok:!1,reason:"no-button"};if(o?.aborted)return{ok:!1,reason:"cancelled"};const a=Jt(t),l=[];a&&l.push(a);for(const c of s)c!==a&&!se(c)&&l.push(c);const d=Date.now()+n;for(const c of l){if(o?.aborted)return{ok:!1,reason:"cancelled"};so(c);const m=Math.min(d,Date.now()+5e3);for(;Date.now()<m;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const u=Ae(t);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(g=>setTimeout(g,r))}}for(;Date.now()<d;){if(o?.aborted)return{ok:!1,reason:"cancelled"};const c=Ae(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(m=>setTimeout(m,r))}return{ok:!1,reason:"timeout"}}const He="https://www.standvirtual.com/";function Zt(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function le(e){const{value:t,label:n}=Zt(e);return n||t}function _e(e){const{value:t,label:n}=Zt(e);return t||n}function Qt(e){const n=e.querySelector?.(Ft)?.textContent||"";if(!n.trim())return null;try{const o=JSON.parse(n)?.props?.pageProps?.advert;return o&&typeof o=="object"?o:null}catch{return null}}function co(e){const n=(e.querySelector?.(ze)||(typeof document<"u"?document.querySelector(ze):null))?.getAttribute?.("href")||"";return n?q(n,He):typeof location<"u"&&location?.href?q(location.href,He):""}function uo(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function K(e,t){return(e.querySelector?.(oo(t))?.textContent||"").replace(/\s+/g," ").trim()}function fo(e=document){const t=[],n=[];function r(I,T){T&&t.push(I)}const o=Qt(e),i=o?.parametersDict||{};let s="";o?.url&&(s=q(o.url,He)),s||(s=co(e)),r("url",s);const a=uo(s,o);r("listingId",a);const l=e.querySelector?.(Bt),d=(o?.title||l?.textContent||"").replace(/\s+/g," ").trim();r("title",d);let c="";if(o?.description&&(c=Bn(o.description)),!c){const I=e.querySelector?.(zt);c=we(I?.textContent||"")}r("description",c);let m="";o?.seller?.name&&(m=String(o.seller.name).replace(/\s+/g," ").trim()),m||(m=(e.querySelector?.(no)?.textContent||"").replace(/\s+/g," ").trim()),r("clientName",m);let u=le(i.make)||K(e,"make")||"";u=xe(u),r("make",u);let g=le(i.model)||K(e,"model")||"";g=xe(g),r("model",g);let h=_e(i.first_registration_year)||K(e,"first_registration_year")||"";h=Ct(h),r("year",h);const y=mt(_e(i.mileage)||K(e,"mileage")||"");r("mileageKm",y);const p=ht(le(i.gearbox)||K(e,"gearbox")||"");r("transmission",p);const b=bt(le(i.fuel_type)||K(e,"fuel_type")||"");r("fuel",b);const v=_e(i.engine_capacity)||K(e,"engine_capacity")||"",E=/cm\s*3|cm3|\bcc\b/i.test(v)?v.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):v,w=yt(E);r("engine",w);const k=vt(_e(i.engine_power)||le(i.engine_power)||K(e,"engine_power")||"");r("powerCv",k);let S=o?.price?.value;(S==null||S==="")&&(S=e.querySelector?.(Vt)?.textContent||"");const _=gt(S);return r("priceEur",_),(!u||!g)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"standvirtual-pt",url:s,listingId:a,title:d,description:c,clientName:m,make:u,model:g,year:h,mileageKm:y,transmission:p,fuel:b,engine:w,powerCv:k,priceEur:_,extractedFields:[...new Set(t)],warnings:n}}function en(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function po(e=document){const n=Qt(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const r=[],o=new Set;for(const i of n){const s=i?.url||i?.src||"";if(!s)continue;const a=en(String(s));o.has(a)||(o.add(a),r.push(a))}return r.length===0?null:{urls:r,count:r.length,selectorUsed:"next-data:images.photos"}}function tn(e=document){for(const t of jt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function Ge(e=document){const t=po(e);if(t)return t;const{images:n,selectorUsed:r}=tn(e),o=[],i=new Set;for(const s of n){const a=$t(s);if(!a)continue;const l=en(a);i.has(l)||(i.add(l),o.push(l))}return{urls:o,count:o.length,selectorUsed:r}}async function mo(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:r=100}=e;let o=Ge(t);if(o.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return o;const s=Date.now()+n;for(;o.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,r)),o=Ge(t);return o}const nn={siteId:"standvirtual-pt",discoverListingImages:Ge,discoverListingImagesWithWait:mo,queryGalleryImages:tn,extractListing:fo,findPhoneRevealButton:Jt,readRevealedPhone:Ae,revealContactPhone:lo,selectors:{PRIMARY_GALLERY_SELECTOR:Gt,FALLBACK_GALLERY_SELECTOR:qt,GALLERY_SELECTORS:jt,CONTACT_PHONE_SELECTOR:Ht,ASIDE_SELLER_SELECTOR:ke,CONTENT_CONTACT_SELECTOR:Ut,AD_PRICE_SELECTOR:Vt,CANONICAL_LINK_SELECTOR:ze,OFFER_TITLE_SELECTOR:Bt,DESCRIPTION_SELECTOR:zt,NEXT_DATA_SELECTOR:Ft}},on=new Map;function rn(e){on.set(e.siteId,e)}function an(e){return on.get(e)}function sn(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?an("standvirtual-pt")||nn:an("olx-pt")||Ot}rn(Ot),rn(nn);async function go(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let r=null;for(const o of n)try{const i=new Blob([e],{type:o});return await createImageBitmap(i)}catch(i){r=i}try{const o=new Blob([e]);return await createImageBitmap(o)}catch(o){throw r||o}}function ho(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const r=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:r,width:t.width,height:t.height}}const qe=new Map;function je(){return typeof GM<"u"&&GM!=null}async function ln(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):je()&&typeof GM.getValue=="function"?GM.getValue(e,t):qe.has(e)?qe.get(e):t}async function cn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(je()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}qe.set(e,t)}async function bo(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(je()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function dn(e){const{method:t,url:n,responseType:r="arraybuffer",headers:o,signal:i}=e;return new Promise((s,a)=>{if(i?.aborted){a(new DOMException("Aborted","AbortError"));return}let l=null;const d=()=>{try{l?.abort?.()}catch{}a(new DOMException("Aborted","AbortError"))};i?.addEventListener("abort",d,{once:!0}),(m=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){l=GM.xmlHttpRequest(m);return}if(typeof GM_xmlhttpRequest=="function"){l=GM_xmlhttpRequest(m);return}a(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:r,headers:o,onload(m){i?.removeEventListener("abort",d);const u=m.status;if(u<200||u>=300){a(new Error(`HTTP ${u} for ${n}`));return}s(m.response)},onerror(){i?.removeEventListener("abort",d),a(new Error(`Network error for ${n}`))},ontimeout(){i?.removeEventListener("abort",d),a(new Error(`Timeout for ${n}`))}})})}async function yo(e,t={}){const{signal:n,request:r=dn}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const o=await r({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:o}}function vo(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),r=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),o=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),i=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),s=Math.max(1,o-n),a=Math.max(1,i-r),l=document.createElement("canvas");l.width=e.width,l.height=e.height;const d=l.getContext("2d");return d.putImageData(e,0,0),d.getImageData(n,r,s,a)}function Co(e,t,n){const r=document.createElement("canvas");r.width=e.width,r.height=e.height,r.getContext("2d").putImageData(e,0,0);const o=document.createElement("canvas");o.width=n,o.height=t;const i=o.getContext("2d");i.drawImage(r,0,0,n,t);const{data:s}=i.getImageData(0,0,n,t),a=new Uint8Array(1*t*n*3);let l=0;for(let d=0;d<t*n;d+=1)a[l++]=s[d*4],a[l++]=s[d*4+1],a[l++]=s[d*4+2];return a}function xo(e,t,n=[114,114,114]){const{width:r,height:o}=e,i=Math.min(t/o,t/r),s=Math.round(r*i),a=Math.round(o*i),l=(t-s)/2,d=(t-a)/2,c=Math.round(d-.1),m=Math.round(l-.1),u=document.createElement("canvas");u.width=r,u.height=o,u.getContext("2d").putImageData(e,0,0);const h=document.createElement("canvas");h.width=t,h.height=t;const y=h.getContext("2d");y.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,y.fillRect(0,0,t,t),y.drawImage(u,0,0,r,o,m,c,s,a);const p=y.getImageData(0,0,t,t).data,b=new Float32Array(3*t*t),v=t*t;for(let E=0;E<v;E+=1){const w=p[E*4],k=p[E*4+1],S=p[E*4+2];b[E]=w/255,b[v+E]=k/255,b[2*v+E]=S/255}return{tensor:b,ratio:i,pad:{dw:l,dh:d},size:t}}function wo(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const Eo="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",So="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Lo="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",ko="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function un(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Eo},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:So,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Lo},ortWasmBaseUrl:ko}}const Ie={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let fn=null;function Ao(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function We(){const e=Ao();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const pn=new Proxy({},{get(e,t){return We()[t]}});function _o(){const e=We(),t=un();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function mn(e,t={}){_o();const n=We(),r=t.prefer||["webgpu","wasm"],o=[];for(const i of r)try{const s=await n.InferenceSession.create(e,{executionProviders:[i]});return fn=i,{session:s,provider:i}}catch(s){o.push(`${i}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${o.join(" | ")}`)}function Ke(){return fn}const Ye=384,Io="images",Ro="output0";async function To(e,t,n={}){const r=n.confThresh??.4,{tensor:o,ratio:i,pad:s}=xo(t,Ye),a=new pn.Tensor("float32",o,[1,3,Ye,Ye]),l=await e.run({[Io]:a}),d=l[Ro]||Object.values(l)[0];if(!d)return[];const c=d.data,m=d.dims||[],u=m.length>=2?m[m.length-1]:7,g=Math.floor(c.length/u),h=[];for(let y=0;y<g;y+=1){const p=y*u,b=c[p+1],v=c[p+2],E=c[p+3],w=c[p+4],k=c[p+5],S=c[p+6];if(S<r)continue;const _=wo({x1:b,y1:v,x2:E,y2:w},i,s);h.push({..._,score:Number(S),classId:Number(k)})}return h.sort((y,p)=>p.score-y.score),h}function No(e,t,n=Ie){const r=n.alphabet,o=n.maxPlateSlots,i=r.length,s=e,a=[],l=[];for(let c=0;c<o;c+=1){let m=0,u=-1/0;for(let g=0;g<i;g+=1){const h=Number(s[c*i+g]);h>u&&(u=h,m=g)}a.push(r[m]),l.push(u)}let d=a.join("");return n.padChar&&(d=d.replace(new RegExp(`${Po(n.padChar)}+$`),"")),{text:d,charProbs:l.slice(0,Math.max(d.length,1))}}function Po(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Do(e,t){const{imgHeight:n,imgWidth:r}=Ie,o=Co(t,n,r),i=new pn.Tensor("uint8",o,[1,n,r,3]),s=await e.run({input:i}),a=s.plate||Object.values(s)[0],l=a.dims||[1,Ie.maxPlateSlots,Ie.alphabet.length],d=l[l.length-1],m=l[l.length-2]*d,u=a.data,g=u.length>=m?u.slice(0,m):u;return No(g)}const ce="[A-Z]",de="[0-9]",$o=[{id:"LLDDDD",re:new RegExp(`^${ce}{2}${de}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${de}{4}${ce}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${de}{2}${ce}{2}${de}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${ce}{2}${de}{2}${ce}{2}$`)}],Mo={0:"O",1:"I",5:"S",8:"B"},Oo={O:"0",I:"1",L:"1",S:"5",B:"8"};function Re(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function ee(e){const t=Re(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Fo(e){const t=Re(e);if(t.length!==6)return null;for(const n of $o)if(n.re.test(t))return n.id;return null}function Xe(e,t){const n=Re(e).slice(0,6).split("");if(n.length!==6)return[];const r=[];function o(i,s,a){if(s>t)return;if(i===6){const m=a.join(""),u=Fo(m);u&&r.push({plate:m,corrections:s,patternId:u});return}if(o(i+1,s,a),s>=t)return;const l=a[i],d=Mo[l];if(d){const m=a.slice();m[i]=d,o(i+1,s+1,m)}const c=Oo[l];if(c){const m=a.slice();m[i]=c,o(i+1,s+1,m)}}return o(0,0,n),r.sort((i,s)=>i.corrections-s.corrections||s.plate.localeCompare(i.plate)),r}function gn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let r=0;for(let o=0;o<n;o+=1)r+=e[o]??0;return r/n}function Bo(e,t=[],n={}){const r=n.minConfidenceNoCorrection??.55,o=n.minConfidenceOneCorrection??.72,i=Re(e);if(i.length<6)return{accepted:!1,plate:i,plateFormatted:ee(i),patternId:null,corrections:0,meanConfidence:gn(t,i.length),reason:"too-short"};const s=i.slice(0,6),a=gn(t,6),l=Xe(s,0);if(l.length>0&&a>=r){const m=l[0];return{accepted:!0,plate:m.plate,plateFormatted:ee(m.plate),patternId:m.patternId,corrections:0,meanConfidence:a}}const d=Xe(s,1).filter(m=>m.corrections===1);if(d.length>0&&a>=o){const m=d[0];return{accepted:!0,plate:m.plate,plateFormatted:ee(m.plate),patternId:m.patternId,corrections:1,meanConfidence:a}}return Xe(s,2).some(m=>m.corrections>1)&&l.length===0&&d.length===0?{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:2,meanConfidence:a,reason:"excessive-corrections"}:l.length>0||d.length>0?{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:l.length?0:1,meanConfidence:a,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:ee(s),patternId:null,corrections:0,meanConfidence:a,reason:"no-reliable-pattern"}}const Y="models",Vo=1;let Te=null;function Je(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Te||(Te=new Promise((e,t)=>{const n=indexedDB.open(lt,Vo);n.onupgradeneeded=()=>{const r=n.result;r.objectStoreNames.contains(Y)||r.createObjectStore(Y,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Te)}async function hn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function zo(e){const t=await Je();return new Promise((n,r)=>{const i=t.transaction(Y,"readonly").objectStore(Y).get(e);i.onsuccess=()=>{const s=i.result;n(s?.bytes||null)},i.onerror=()=>r(i.error)})}async function Uo(e,t,n){const r=await Je();return new Promise((o,i)=>{const s=r.transaction(Y,"readwrite");s.objectStore(Y).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>o(),s.onerror=()=>i(s.error)})}async function Ho(){const e=await Je();return new Promise((t,n)=>{const r=e.transaction(Y,"readwrite");r.objectStore(Y).clear(),r.oncomplete=()=>t(),r.onerror=()=>n(r.error)})}async function bn(e,t={}){const{onStatus:n,signal:r}=t,o=await zo(e.id).catch(()=>null);if(o&&await hn(o)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:o,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const i=await dn({method:"GET",url:e.url,responseType:"arraybuffer",signal:r}),s=i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"?i:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const a=await hn(s);if(a!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${a}`);return await Uo(e.id,s,a).catch(()=>{}),{bytes:s,cacheHit:!1}}let ue=null;async function Go(e={}){if(ue)return{sessions:ue,diagnostics:{provider:Ke(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=un(),n=await bn(t.detector,e),r=await bn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const o=await mn(n.bytes),i=await mn(r.bytes);return ue={detector:o.session,ocr:i.session},{sessions:ue,diagnostics:{provider:o.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:r.cacheHit}}}function qo(){ue=null}async function jo(e,t,n={}){const{signal:r}=n;let o=0,i;try{const a=await go(t);i=ho(a).imageData,a.close?.()}catch{return null}const s=await To(e.detector,i);for(const a of s){if(r?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const l=vo(i,a),d=await Do(e.ocr,l),c=Bo(d.text,d.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,detectionsTried:o}}return{plate:"",plateFormatted:"",detectionsTried:o}}async function Wo(e,t={}){const n=Date.now(),{onStatus:r,signal:o,request:i}=t,s=e.length,a=await Go({onStatus:r,signal:o}),{detector:l,ocr:d}=a.sessions;let c=0,m=0;for(let u=0;u<s;u+=1){if(o?.aborted)return Ne("cancelled",a.diagnostics,m,c,n);const g=e[u];r?.(`Downloading image ${u+1} of ${s}`);let h;try{h=await yo(g,{signal:o,request:i})}catch(p){if(o?.aborted||p?.name==="AbortError")return Ne("cancelled",a.diagnostics,m,c,n);r?.(`Failed to download image ${u+1} of ${s}, skipping…`);continue}r?.(`Scanning image ${u+1} of ${s}`),m+=1;let y;try{y=await jo({detector:l,ocr:d},h.bytes,{signal:o})}catch(p){if(o?.aborted||p?.name==="AbortError")return Ne("cancelled",a.diagnostics,m,c,n);continue}finally{h=null}if(y&&(c+=y.detectionsTried,y.plate))return{ok:!0,plate:y.plate,plateFormatted:y.plateFormatted,diagnostics:{provider:Ke()||a.diagnostics.provider,detectorCacheHit:a.diagnostics.detectorCacheHit,ocrCacheHit:a.diagnostics.ocrCacheHit,imagesScanned:m,detectionsTried:c,elapsedMs:Date.now()-n}}}return Ne("no-reliable-plate",a.diagnostics,m,c,n)}function Ne(e,t,n,r,o){return{ok:!1,reason:e,diagnostics:{provider:Ke()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:r,elapsedMs:Date.now()-o}}}async function yn(e){return await bo(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function vn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function Cn({plate:e,phone:t,fallbackId:n}={}){const r=e==null?"":String(e).trim();if(r)return{id:r,isRandom:!1};const o=t==null?"":String(t).trim();if(o)return{id:o,isRandom:!1};const i=n==null?"":String(n).trim();return i?{id:i,isRandom:!0}:{id:vn(),isRandom:!0}}function xn(e={}){return Cn(e).id}function Ko(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function Yo(e,{phone:t="",fallbackId:n=""}={}){const r=e||{},o=t==null?"":String(t).trim(),i=r.plate==null?"":String(r.plate).trim(),a=[`ID: ${xn({plate:i,phone:o,fallbackId:n})}`,`Telefone: ${o}`,""];for(const d of Fe){if(d==="url")continue;const c=dt[d];let m=r[d]==null?"":String(r[d]);d==="customerValueEur"&&m&&!/€/.test(m)&&(m=`${m} €`),a.push(`${c}: ${m}`)}const l=r.url==null?"":String(r.url);return a.push(""),a.push(l),a.join(`
`)}const Ze="<<<LEAD_CLIP_V1>>>",wn="<<<END_LEAD_CLIP>>>";function Xo(e,t={}){const n=e?.fields||{},r=e?.source||{},o=t.phone==null?"":String(t.phone).trim();return{v:1,id:xn({plate:n.plate,phone:o,fallbackId:t.fallbackId}),phone:o,plate:String(n.plate||""),clientName:String(n.clientName||r.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||r.url||""),siteId:String(r.siteId||""),title:String(r.title||""),description:we(r.description||"")}}function Jo(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${Ze}
${n}
${wn}
`}function Zo(e){const t=String(e||""),n=t.indexOf(Ze);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const r=n+Ze.length,o=t.indexOf(wn,r);if(o<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const i=t.slice(r,o).trim(),s=t.slice(0,n).replace(/\s+$/,"");try{const a=JSON.parse(i);return!a||a.v!==1||typeof a!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:a,humanText:s}}catch(a){return{ok:!1,error:a instanceof Error?a.message:"JSON parse failed"}}}const Qo="listingCache",er=2880*60*1e3;function En(){return`${be}${Qo}`}function Qe(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function tr(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,r]of Object.entries(e))typeof n=="string"&&n&&Qe(r)&&(t[n]={processedAt:r.processedAt,phone:r.phone,clipboard:r.clipboard,fallbackId:typeof r.fallbackId=="string"?r.fallbackId:"",listingRecord:r.listingRecord});return t}async function nr(){const e=await ln(En(),{});return tr(e)}async function et(e){await cn(En(),e)}async function tt(e=Date.now()){const t=await nr(),n={};let r=!1;for(const[o,i]of Object.entries(t))e-i.processedAt<=er?n[o]=i:r=!0;return(r||Object.keys(n).length!==Object.keys(t).length)&&await et(n),n}async function or(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const o=(await tt(t))[n];return o&&Qe(o)?o:null}async function rr(e,t,n=Date.now()){const r=typeof e=="string"?e.trim():"";if(!r||!Qe(t))return null;const o=await tt(n),i={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return o[r]=i,await et(o),i}async function ir(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const r=await tt(t);return n in r?(delete r[n],await et(r),!0):!1}const Sn="valuationDefaults";async function ar(e,t=null){return ln(`${be}${e}`,t)}async function sr(e,t){await cn(`${be}${e}`,t)}async function Ln(){const e=await ar(Sn,null);return!e||typeof e!="object"?{...ve}:{...ve,...e}}async function lr(e){const t={...ve,...e};return await sr(Sn,t),t}function nt(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function cr(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):nt(t)?Promise.resolve("visible"):new Promise(r=>{const o=()=>{s(),r("cancelled")},i=()=>{nt(t)&&(s(),r("visible"))},s=()=>{t.removeEventListener("visibilitychange",i),n?.removeEventListener("abort",o)};t.addEventListener("visibilitychange",i),n&&n.addEventListener("abort",o,{once:!0})})}const dr=5e3;function ur(){let e=ct(),t=null,n=null,r=null,o="",i=0;function s(f){f&&t?.setCaptureStatus(f)}function a(f){e={...e,statusMessage:f},t?.setStatus(f);const C=String(f||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);C&&s(`analisando imagem ${C[1]} de ${C[2]}`)}function l(){try{const f=sn().extractListing(document);if(f?.url)return q(f.url)}catch{}return typeof location<"u"&&location?.href?q(location.href):""}function d(f={}){const C=f.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",N=f.phone??e.lastPhone??"",P=f.fallbackId??e.fallbackId??"";if(!String(C).trim()&&!String(N).trim()&&!String(P).trim()){t?.setClipboardId({id:"",isRandom:!1});return}t?.setClipboardId(Cn({plate:C,phone:N,fallbackId:P}))}function c(f,C){const N=C.listingRecord,P=C.phone||"",z=N?.fields?.plate||"",G=!String(z).trim()&&!String(P).trim()&&(C.fallbackId||Ko(C.clipboard))||"";o=f,i=C.processedAt,e={...e,lastPlate:z,lastPhone:P,lastClipboard:C.clipboard||"",fallbackId:G,listingRecord:N,view:"form"},t?.showListingForm(N,{phone:P}),t?.setCopyEnabled(!!C.clipboard),t?.setCopyLabel("Copy"),d({plate:z,phone:P,fallbackId:G}),s("data ready to copy"),a("Data ready to copy")}function m(f,C=""){const N=f?.fields?.plate||"",P=C==null?"":String(C).trim();let z=e.fallbackId||"";!String(N).trim()&&!P&&(z||(z=vn()),e={...e,fallbackId:z});const oe=Yo(f.fields,{phone:P,fallbackId:e.fallbackId}),G=Xo(f,{phone:P,fallbackId:e.fallbackId});return Jo(oe,G)}async function u(f){const C=o||q(f.listingRecord?.fields?.url||"")||l();if(!C||!f.listingRecord||!f.clipboard)return;const N=f.processedAt??i??Date.now();o=C,i=N,await rr(C,{processedAt:N,phone:f.phone??e.lastPhone??"",clipboard:f.clipboard,fallbackId:f.fallbackId??e.fallbackId??"",listingRecord:f.listingRecord})}async function g(){try{const f=l();if(f){const C=await or(f);if(C){if(ft(C.listingRecord,{plate:C.listingRecord?.fields?.plate,phone:C.phone})){c(f,C);return}await ir(f)}}}catch{}y()}function h(){r!=null&&(clearTimeout(r),r=null)}function y(){h(),s("waiting"),r=setTimeout(()=>{r=null,k()},dr)}function p(f){e={...e,busy:f,view:f?"reading":e.listingRecord?"form":"idle"},t?.setBusy(f),f&&s("reading")}function b(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const f=e.lastDiagnostics;if(!f){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${f.provider||"n/a"}`,`Detector cache: ${f.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${f.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${f.imagesScanned??0}`,`Detections tried: ${f.detectionsTried??0}`,`Elapsed: ${f.elapsedMs??0} ms`].join(`
`))}function v(f,C,N){const P=[];return C.plate?P.push(`Plate found: ${C.plate}`):P.push("No reliable plate found."),C.phone&&P.push(`Phone: ${C.phone}`),(f.fields.make||f.fields.model)&&P.push(`Listing: ${[f.fields.make,f.fields.model].filter(Boolean).join(" ")}`.trim()),P.push(N),P.join(`
`)}function E(f){e={...e,lastClipboard:f},t?.setCopyEnabled(!!f)}async function w(f){return E(f),yn(f)}async function k(){if(h(),e.busy)return;n=new AbortController;const{signal:f}=n;p(!0);try{const C=sn(),N=await Ln();a("Extracting listing fields…");const P=C.extractListing(document);a("Looking for listing images…");const z=await C.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:oe,count:G}=z;let X={ok:!1,reason:"no-images"};if(G>0?(a(`Found ${G} listing images — scanning…`),a("Loading plate recognition models…"),X=await Wo(oe,{signal:f,onStatus:a}),e={...e,lastDiagnostics:X.diagnostics},b()):a("No listing images — waiting for phone…"),f.aborted||X.reason==="cancelled"){a("Cancelled.");return}if(nt()||(s("waiting for tab"),a("Waiting for this tab to extract phone…")),await cr({signal:f})==="cancelled"||f.aborted){a("Cancelled.");return}a("Revealing phone (if available)…");const Q=await C.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:f}),W=X.ok&&X.plate?X.plate:"",B=Q.ok?Q.phone:"";if(f.aborted){a("Cancelled.");return}const x=Dn({extracted:P,plate:W,defaults:N});if(e={...e,lastPlate:W,lastPhone:B,fallbackId:"",listingRecord:x,view:"form"},t?.showListingForm(x,{phone:B}),!ft(x,{plate:W,phone:B})){E(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),s("No data found."),a("No data found.");return}const A=m(x,B);E(A),t?.setCopyLabel("Copy"),d({plate:W,phone:B,fallbackId:e.fallbackId}),s("data ready to copy"),o=q(x.fields.url||"")||l(),i=Date.now(),await u({clipboard:A,phone:B,listingRecord:x,processedAt:i,fallbackId:e.fallbackId});let R=v(x,{plate:W,phone:B},"Data ready to copy");W&&!B&&Q.reason==="timeout"?R+=`
Phone reveal timed out.`:W&&!B&&Q.reason==="no-button"&&(R+=`
No phone button on this listing.`),G===0&&!B&&Q.reason==="no-button"&&(R+=`
No listing images found.`),a(R)}catch(C){if(f.aborted){a("Cancelled.");return}const N=C instanceof Error?C.message:"Unknown recognition error";a(`Failed: ${N}`)}finally{n=null,p(!1)}}function S(){n?.abort()}async function _(){let f=e.lastClipboard;if(e.listingRecord&&(f=m(e.listingRecord,e.lastPhone),e={...e,lastClipboard:f},t?.setCopyEnabled(!!f)),!f){a("Nothing to copy yet.");return}const C=await yn(f);C.ok&&(s("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await u({clipboard:f,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),a(C.ok?"Data copied":"Clipboard copy failed.")}async function I(){if(!e.listingRecord){a("No listing to copy yet. Run Clip listing.");return}const f=m(e.listingRecord,e.lastPhone),C=await w(f);C.ok&&(s("data copied"),t?.setCopyLabel("Copy again"),await u({clipboard:f,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:i||Date.now(),fallbackId:e.fallbackId})),a(C.ok?"Data copied":"Clipboard copy failed.")}async function T(){const f=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!f){a("No plate to copy.");return}const C=await w(f);a(C.ok?`Plate copied: ${f}`:"Clipboard copy failed.")}function L(f,C){if(f==="phone"){e={...e,lastPhone:C==null?"":String(C)},d();return}if(!e.listingRecord)return;const N=$n(e.listingRecord,f,C);e={...e,listingRecord:N,lastPlate:f==="plate"?C:e.lastPlate},f==="plate"&&d()}async function $(){try{await Ho(),qo(),a("Model cache cleared.")}catch(f){const C=f instanceof Error?f.message:"Failed to clear cache";a(C)}}function H(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},b(),a(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function M(){if(e.busy)return;const f=await Ln();e={...e,view:"settings"},t?.showSettingsForm(f),a(`Settings. Environment: production. Storage: ${be}* / ${lt}.`)}function O(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone}),a("Back to listing review.")):(t?.hideForm(),a("Settings closed."))}async function D(f){await lr(f),a("Defaults saved.")}function j(f=document.body){return t||(t=Fn({onClipListing:k,onCancel:S,onCopyAgain:_,onClearModelCache:$,onToggleDiagnostics:H,onSettings:M,onFieldChange:L,onCopyFullText:I,onCopyPlateOnly:T,onSettingsBack:O,onSaveDefaults:D}),t.mount(f),t.setMinimized(!0),g(),t)}function F(){h(),n?.abort(),n=null,t?.destroy(),t=null,o="",i=0,e=ct()}function at(){return e}return{mount:j,destroy:F,onClipListing:k,onCancel:S,onCopyAgain:_,onCopyFullText:I,onCopyPlateOnly:T,onFieldChange:L,onClearModelCache:$,onToggleDiagnostics:H,onSettings:M,onSettingsBack:O,onSaveDefaults:D,getState:at,setStatus:a}}function kn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?fr(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function fr(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const J="/api";async function Z(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),r=await n.text();let o=null;try{o=r?JSON.parse(r):null}catch{o=r}return{ok:n.ok,status:n.status,data:o}}async function pr(){return Z(`${J}/auth/me`)}async function mr(){return Z(`${J}/get_user_local`)}async function fe(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),Z(`${J}/lead-clients?${t.toString()}`)}async function gr(e){return Z(`${J}/purchase-leads/clients/${e}?page=1`)}async function hr(e){return Z(`${J}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function br(e){return Z(`${J}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Pe(e,t=null){return Z(`${J}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function yr(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),r=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const o=await fetch(r,{credentials:"include"});if(!o.ok)return[];const i=await o.json();return Array.isArray(i)?i:i?.data||i?.results||[]}catch{return[]}}const vr="LeadDeskDB",Cr=["Audi","BMW","Citroën","Fiat","Ford","Honda","Hyundai","Kia","Mercedes-Benz","Nissan","Opel","Peugeot","Renault","Seat","Skoda","Toyota","Volkswagen","Volvo"],xr=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],wr=["Manual","Automática"];function ot(e,t,n){const r=String(t||"").trim();if(!r)return"";const o=e.find(a=>a===r);if(o)return o;const i=r.toLowerCase(),s=e.find(a=>a.toLowerCase()===i);if(s)return s;if(n){const a=n(r);if(a&&e.includes(a))return a}return r}function Er(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function Sr(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function Lr(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function kr(e){return String(e||"").replace(/\D/g,"")}function rt(){return new Promise((e,t)=>{const n=indexedDB.open(vr);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function Ar(e){const t=await rt();return new Promise((n,r)=>{const s=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);s.onsuccess=()=>{const a=s.result||[];a.sort((l,d)=>String(d.updatedAt).localeCompare(String(l.updatedAt))),n(a)},s.onerror=()=>r(s.error)})}async function _r(e){const t=await rt();return new Promise((n,r)=>{const s=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);s.onsuccess=()=>{const a=s.result||[];a.sort((l,d)=>String(d.updatedAt).localeCompare(String(l.updatedAt))),n(a)},s.onerror=()=>r(s.error)})}function An(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function Ir(e){const t=await rt(),n=new Date().toISOString(),r=kr(e.phone),o=Lr(e.plate),i=An("client"),s=An("lead"),a=String(e.clientName||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean),l=a[0]||"Lead",d=a[1]||"Anúncio",c=a.length>2?a.slice(2).join(" "):"",m={id:i,firstName:l,firstSurname:d,secondSurname:c,phone:r,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:r,createdAt:n,updatedAt:n},u={id:s,clientId:i,plate:o,plateNormalized:o,phone:r,phoneNormalized:r,fullName:l,firstSurname:d,secondSurname:c,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:ot(Cr,e.make||""),model:e.model||"",year:e.year||"",fuel:ot(xr,e.fuel||"",Er),transmission:ot(wr,e.transmission||"",Sr),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((g,h)=>{const y=t.transaction(["clients","leads"],"readwrite");y.objectStore("clients").put(m),y.objectStore("leads").put(u),y.oncomplete=()=>g(void 0),y.onerror=()=>h(y.error)}),s}const U={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function te(e){return String(e||"").replace(/\D/g,"")}function ne(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function V(e,t){return[{label:e,value:t}]}function De(e,t=""){const n=Array.isArray(e)?e:[],r=t.trim().toLowerCase();if(r){const o=n.find(i=>String(i.label??i.nombre??i.name??"").toLowerCase().includes(r));if(o)return{label:o.label??o.nombre??o.name,value:o.value??o.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function _n(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:"Anúncio",secondSurname:null}:t.length===1?{name:t[0],firstSurname:"Anúncio",secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function Rr(e){const t=te(e.phone),{name:n,firstSurname:r,secondSurname:o}=_n(e.clientName);return{name:n,firstSurname:r,secondSurname:o,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function Tr(e){const{clip:t,clientId:n,me:r,localId:o,filters:i={},vehicle:s={}}=e,a=te(t.phone),l=ne(t.plate),d=r?.id??0,c=Array.isArray(r?.rolesId)?r.rolesId:[6],{name:m,firstSurname:u,secondSurname:g}=_n(t.clientName),h=i.estado||U.estado,y=i.origen||U.origen,p=i.contacto||U.forma_contacto,b=i.marca||U.marca_comercial,v=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,E=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),w=Number(E.replace(",","."))||null,k=s.makeLabel||t.make||"",S=s.modelLabel||t.model||"",_=Number(t.year)||null,I=s.fuelLabel||In(t.fuel),T=s.transmissionLabel||Rn(t.transmission);return{data:{toggle:!1,nombre:m,telefono1:a||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:V(h.label,h.value),origen:V(y.label,y.value),forma_contacto:V(p.label,p.value),marca_comercial:V(b.label,b.value),email:null,telefono2:null,apellido1:u,apellido2:g,kilometros:v,importado:!1,matricula:l||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:w,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:I?V(I,s.fuelValue??I):null,ccambios:T?V(T,s.transmissionValue??T):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:d,id_agente_modify:d,rol:c,vehiculo:{marca_vehiculo:k?V(k,s.makeValue??k):[],modelo:S?V(S,s.modelValue??S):[],matriculacion:_?V(_,_):[],combustible:I?V(I,s.fuelValue??I):[],ccambios:T?V(T,s.transmissionValue??T):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:o||U.id_local_actual}}function $e(e,t=""){const n=Array.isArray(e)?e:[],r=String(t||"").trim().toLowerCase();if(!r)return null;const o=l=>String(l?.label??l?.nombre??l?.name??"").trim(),i=l=>l?.value??l?.id,s=n.find(l=>o(l).toLowerCase()===r);if(s)return{label:o(s),value:i(s)};const a=n.find(l=>{const d=o(l).toLowerCase();return d.includes(r)||r.includes(d)});return a?{label:o(a),value:i(a)}:null}async function Nr(e,t){const n={};if(!e?.make||typeof t!="function")return n;const r=await t("makes"),o=$e(r,e.make);if(!o)return n;if(n.makeLabel=o.label,n.makeValue=o.value,e.model){const i=await t("models",{makeId:String(o.value)}),s=$e(i,e.model);if(s){n.modelLabel=s.label,n.modelValue=s.value;const a=String(e.year||"").trim();if(a){const l=In(e.fuel);if(l){const d=await t("fuels",{makeId:String(o.value),modelId:String(s.value),year:a}),c=$e(d,l);if(c){n.fuelLabel=c.label,n.fuelValue=c.value;const m=Rn(e.transmission);if(m){const u=await t("transmissions",{makeId:String(o.value),modelId:String(s.value),year:a,fuelId:String(c.value)}),g=$e(u,m);g&&(n.transmissionLabel=g.label,n.transmissionValue=g.value)}}}}}}return n}function In(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function Rn(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const Pr=`
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
`;function Dr(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),r=document.createElement("style");r.textContent=Pr;const o=document.createElement("div");o.className="lcf-panel";const i=document.createElement("div");i.className="lcf-header";const s=document.createElement("div");s.className="lcf-title",s.textContent="CRM · Leads";const a=document.createElement("span");a.className="lcf-badge",a.textContent="CRM";const l=document.createElement("button");l.type="button",l.className="lcf-mini",l.textContent="–",i.append(s,a,l);const d=document.createElement("div");d.className="lcf-body";const c=document.createElement("div");c.className="lcf-hint",c.textContent="Cole o texto do Clipper (com LEAD_CLIP_V1) ou leia a área de transferência. Com dados válidos, a verificação do cadastro corre automaticamente.";const m=document.createElement("textarea");m.className="lcf-textarea",m.placeholder="Cole aqui o texto do Clipper…";const u=document.createElement("div");u.className="lcf-summary",u.hidden=!0;const g=document.createElement("div");g.className="lcf-section-label",g.textContent="Leads encontrados",g.hidden=!0;const h=document.createElement("ul");h.className="lcf-matches";const y=document.createElement("div");y.className="lcf-row";const p=document.createElement("button");p.type="button",p.className="lcf-btn",p.textContent="Ler área de transferência";const b=document.createElement("button");b.type="button",b.className="lcf-btn",b.textContent="Analisar texto";const v=document.createElement("button");v.type="button",v.className="lcf-btn lcf-btn-primary",v.textContent="Verificar cadastro",v.disabled=!0,y.append(p,b,v);const E=document.createElement("div");E.className="lcf-row";const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-danger",w.textContent="Criar lead",w.disabled=!0,w.hidden=!0,E.append(w);const k=document.createElement("div");k.className="lcf-status",k.dataset.tone="",k.textContent="Aguardando dados do anúncio.",d.append(c,m,u,g,h,y,E,k),o.append(i,d),n.append(r,o),document.documentElement.append(t);let S=!1;l.addEventListener("click",()=>{S=!S,d.hidden=S,l.textContent=S?"+":"–"});let _=!1,I=0,T=0;return i.addEventListener("pointerdown",L=>{if(L.target===l)return;_=!0;const $=o.getBoundingClientRect();I=L.clientX-$.left,T=L.clientY-$.top,i.setPointerCapture(L.pointerId)}),i.addEventListener("pointermove",L=>{_&&(o.style.left=`${L.clientX-I}px`,o.style.top=`${L.clientY-T}px`,o.style.right="auto",o.style.bottom="auto")}),i.addEventListener("pointerup",()=>{_=!1}),p.addEventListener("click",()=>e.onReadClipboard()),b.addEventListener("click",()=>e.onParseText(m.value)),m.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(m.value),0)}),v.addEventListener("click",()=>e.onVerify()),w.addEventListener("click",()=>e.onCreate()),{setBadge(L){a.textContent=L},setStatus(L,$=""){k.textContent=L,k.dataset.tone=$||""},setText(L){m.value=L},getText(){return m.value},setSummary(L){if(!L){u.hidden=!0,u.textContent="";return}u.hidden=!1,u.innerHTML=L},setVerifyEnabled(L){v.disabled=!L},setCreateVisible(L,$=!0){w.hidden=!L,w.disabled=!$},setMatches(L,$){h.replaceChildren(),g.hidden=L.length===0;for(const H of L){const M=document.createElement("li"),O=document.createElement("div");O.className="lcf-match";const D=document.createElement("div");D.className="lcf-match-title",D.textContent=H.title;const j=document.createElement("div");j.className="lcf-match-sub",j.textContent=H.subtitle;const F=document.createElement("button");F.type="button",F.className="lcf-match-open",F.textContent="Abrir lead →",F.addEventListener("click",()=>$(H.id)),O.append(D,j,F),M.append(O),h.append(M)}},clearMatches(){h.replaceChildren(),g.hidden=!0},destroy(){t.remove()}}}function $r(){let e=null,t=null,n=!1,r=null;function o(){const p=kn();return t?.setBadge(p.label),p}function i(p){const b=Zo(p);return t?.clearMatches(),t?.setCreateVisible(!1),b.ok?(e=b.payload,t?.setText(p),t?.setVerifyEnabled(!0),t?.setSummary([`<div><strong>ID</strong> ${pe(e.id)}</div>`,`<div><strong>Placa</strong> ${pe(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${pe(e.phone||"—")}</div>`,`<div><strong>Veículo</strong> ${pe([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${pe(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0):(e=null,t?.setSummary(null),t?.setVerifyEnabled(!1),t?.setStatus(`Falha ao analisar o texto: ${b.error}`,"error"),!1)}async function s(){try{const p=await navigator.clipboard.readText();t?.setText(p),i(p)&&await l()}catch(p){const b=p instanceof Error?p.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${b}). Cole o texto e use Analisar texto.`,"warn")}}async function a(p){i(p)&&await l()}async function l(){if(!e||n)return;if(o().backend==="leaddesk"){await d();return}await c()}async function d(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const p=ne(e.plate),b=te(e.phone);let v=[];if(p&&(v=await Ar(p)),v.length===0&&b&&(v=await _r(b)),!p&&!b){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(v.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const E=v.map(w=>({id:w.id,title:`Lead ${w.plate||w.id}`,subtitle:`${w.phone||"—"} · ${[w.make,w.model,w.year].filter(Boolean).join(" · ")||"—"} · ${w.leadStatus||""} · ${w.updatedAt||""}`.trim()}));t?.setMatches(E,w=>{location.assign(`/crm/leads/${w}`)}),t?.setStatus(E.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":`${E.length} leads encontrados. Use Abrir lead ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(p){const b=p instanceof Error?p.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${b}`,"error")}finally{n=!1}}async function c(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const p=ne(e.plate),b=te(e.phone);let v;if(p)v=await fe({plate:p}),v.ok&&Array.isArray(v.data)&&v.data.length===0&&b&&(v=await fe({phone:b}));else if(b)v=await fe({phone:b});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!v.ok){t?.setStatus(`Falha na verificação (HTTP ${v.status}). Está autenticado no CRM?`,"error");return}const E=Array.isArray(v.data)?v.data:[];if(E.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const w=[];for(const S of E){const _=S?.purchaseLead?.id;if(_)w.push({id:_,title:`Lead #${_}`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""} · ${S.purchaseLead?.statusName||""}`.trim()});else if(S?.id){const T=(await gr(S.id)).data?.results||[];for(const L of T)w.push({id:L.id,title:`Lead #${L.id}`,subtitle:`Placa ${L.plate||"—"} · ${L.status?.name||""} · ${L.lastAction||""}`.trim()});T.length===0&&w.push({id:`client:${S.id}`,title:`Cliente #${S.id} (sem lead de compra)`,subtitle:`${S.name||""} ${S.firstSurname||""} · ${S.contact?.primaryPhone||""}`.trim()})}}const k=w.filter(S=>String(S.id).match(/^\d+$/));t?.setMatches(k.length?k:w,S=>{if(String(S).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}location.assign(`/main/lead-tasacion/${S}`)}),t?.setStatus(k.length===1?"1 lead encontrado. Use Abrir lead ou crie outro.":k.length>1?`${k.length} leads encontrados. Use Abrir lead ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",k.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(p){const b=p instanceof Error?p.message:"erro";t?.setStatus(`Erro na verificação: ${b}`,"error")}finally{n=!1}}async function m(){if(!e||n)return;if(o().backend==="leaddesk"){await u();return}await g()}async function u(){if(!te(e.phone)&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}n=!0,t?.setStatus("Criando no LeadDesk…");try{const b=await Ir(e);t?.setStatus(`Lead ${b} criado. Abrindo a página…`,"ok"),location.assign(`/crm/leads/${b}`)}catch(b){const v=b instanceof Error?b.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${v}`,"error")}finally{n=!1}}async function g(){const p=te(e.phone);if(!p&&!ne(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(confirm("Criar cliente/lead no CRM com os dados copiados?")){n=!0,t?.setStatus("Criando no CRM…");try{const b=await pr();if(!b.ok||!b.data?.id){t?.setStatus(`Falha de autenticação (HTTP ${b.status}). Faça login no CRM.`,"error");return}const v=b.data,E=await mr(),w=Array.isArray(E.data)&&E.data[0]?.value||U.id_local_actual,[k,S,_,I]=await Promise.all([Pe("estado_lead_compra"),Pe("origen_lead_compra"),Pe("contacto"),Pe("marcas_comerciales",v.id)]),T={estado:De(k.data,"Avaliação")||U.estado,origen:De(S.data,"Captación")||U.origen,contacto:De(_.data,"Whatsapp")||U.forma_contacto,marca:De(I.data,"")||U.marca_comercial};let L=null;if(p){const D=await fe({phone:p});D.ok&&Array.isArray(D.data)&&D.data[0]?.id&&(L=D.data[0].id)}if(!L){const D=await hr(Rr(e));if(D.status===409)L=(await fe({phone:p||void 0,plate:ne(e.plate)||void 0})).data?.[0]?.id;else if(D.ok&&D.data?.resourceId)L=D.data.resourceId;else{t?.setStatus(`Falha ao criar cliente (HTTP ${D.status}): ${JSON.stringify(D.data)}`,"error");return}}if(!L){t?.setStatus("Não foi possível obter clientId.","error");return}const $=await Nr(e,yr),H=Tr({clip:e,clientId:L,me:v,localId:w,filters:T,vehicle:$}),M=await br(H);if(!M.ok){t?.setStatus(`Falha create_lead_compra (HTTP ${M.status}): ${JSON.stringify(M.data)}`,"error");return}const O=M.data?.id_lead;if(!O){t?.setStatus(`Resposta inesperada: ${JSON.stringify(M.data)}`,"error");return}t?.setStatus(`Lead ${O} criado. Abrindo a página…`,"ok"),location.assign(`/main/lead-tasacion/${O}`)}catch(b){const v=b instanceof Error?b.message:"erro";t?.setStatus(`Erro ao criar: ${v}`,"error")}finally{n=!1}}}function h(){if(t)return t;t=Dr({onReadClipboard:s,onParseText:a,onVerify:l,onCreate:m}),o(),window.addEventListener("popstate",o),r=new MutationObserver(()=>o());const p=document.getElementById("app")||document.body;return p&&r.observe(p,{childList:!0,subtree:!0}),s(),t}function y(){window.removeEventListener("popstate",o),r?.disconnect(),r=null,t?.destroy(),t=null,e=null}return{mount:h,destroy:y,refreshContext:o}}function pe(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const it="__LEAD_CRM_FILLER_INITIALIZED__",Mr="lead-crm-filler-root";function Or(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:kn().backend!=="none"?Fr():Br()}function Fr(){if(window[it])return{started:!1,reason:"already-initialized"};if(document.getElementById(Mr))return window[it]=!0,{started:!1,reason:"panel-exists"};window[it]=!0;const e=$r(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function Br(){if(window[Oe])return{started:!1,reason:"already-initialized"};if(document.getElementById(ye))return window[Oe]=!0,{started:!1,reason:"panel-exists"};window[Oe]=!0;const e=ur(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}Or()})();
