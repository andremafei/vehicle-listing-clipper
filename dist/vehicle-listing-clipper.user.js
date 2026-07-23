// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.2.2
// @description  Local plate recognition and vehicle listing extraction for OLX Portugal. No uploads.
// @author       andremafei
// @match        https://www.olx.pt/*
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
(function(){"use strict";const ut="Vehicle Listing Clipper",Y="vlc_prod_",dt="vehicle-listing-clipper",Z="__VLC_PROD_INITIALIZED__",G="vlc-panel-root";function Kt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const U={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Q=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],ft={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},pt=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function jt(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function Wt(t={}){return{...U,...t}}function Jt({extracted:t=null,plate:e="",defaults:n={}}={}){const o=Wt(n),i=jt(),r={},s=[],a=[],l=[],f=[...t?.warnings||[]];function c(d,h,g){const m=h==null?"":String(h);if(i[d]=m,!m){r[d]="missing";return}r[d]=g,g==="extracted"||g==="anpr"?s.push(d):g==="default"&&a.push(d)}const u=e?String(e).trim():"";return c("plate",u,u?"anpr":"missing"),c("make",t?.make||"",t?.make?"extracted":"missing"),c("model",t?.model||"",t?.model?"extracted":"missing"),c("year",t?.year||"",t?.year?"extracted":"missing"),c("mileageKm",t?.mileageKm||"",t?.mileageKm?"extracted":"missing"),c("transmission",t?.transmission||"",t?.transmission?"extracted":"missing"),c("fuel",t?.fuel||"",t?.fuel?"extracted":"missing"),c("engine",t?.engine||"",t?.engine?"extracted":"missing"),c("powerCv",t?.powerCv||"",t?.powerCv?"extracted":"missing"),c("customerValueEur",t?.priceEur||"",t?.priceEur?"extracted":"missing"),c("url",t?.url||"",t?.url?"extracted":"missing"),c("paintParts",o.paintParts,"default"),c("bodyParts",o.bodyParts,"default"),c("tires",o.tires,"default"),c("saleReason",o.saleReason,"default"),c("keyCount",o.keyCount,"default"),c("deductibleVat",o.deductibleVat,"default"),{source:{siteId:t?.siteId||"olx-pt",url:i.url,listingId:t?.listingId||"",title:t?.title||"",description:t?.description||""},fields:i,origins:r,metadata:{extractedFields:[...new Set(s)],defaultedFields:[...new Set(a)],editedFields:l,warnings:f}}}function Xt(t,e,n){const o=n==null?"":String(n),i={...t.fields,[e]:o},r={...t.origins,[e]:o?"edited":"missing"},s=[...new Set([...t.metadata.editedFields||[],e])];return{...t,fields:i,origins:r,source:{...t.source,url:e==="url"?o:t.source.url},metadata:{...t.metadata,editedFields:s}}}function mt(t){switch(t){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Yt(t){let e=null;const n=new Map;let o="listing";function i(){return e||(e=document.createElement("div"),e.className="vlc-form",e.hidden=!0,e)}function r(){e&&(e.replaceChildren(),n.clear())}function s(d,h,g="missing"){const m=document.createElement("label");m.className=`vlc-field ${mt(g)}`,m.dataset.field=d;const b=document.createElement("span");b.className="vlc-field-label",b.textContent=ft[d]||d;const w=document.createElement("span");w.className="vlc-field-origin",w.textContent=g;const C=document.createElement("input");C.type="text",C.className="vlc-field-input",C.value=h??"",C.dataset.field=d,C.addEventListener("input",()=>{o==="listing"&&(t.onFieldChange(d,C.value),m.className=`vlc-field ${mt("edited")}`,w.textContent="edited")}),b.appendChild(w),m.append(b,C),n.set(d,C),e?.appendChild(m)}function a(){const d=document.createElement("div");d.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>t.onCopyFullText());const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Copy plate only",g.addEventListener("click",()=>t.onCopyPlateOnly());const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Copy JSON",m.addEventListener("click",()=>t.onCopyJson()),d.append(h,g,m),e?.appendChild(d)}function l(d){o="listing",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Review listing",e.appendChild(h);for(const g of Q)s(g,d.fields[g]||"",d.origins[g]||"missing");a()}function f(d){o="settings",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",e.appendChild(h);for(const w of pt)s(w,d[w]||"","default");const g=document.createElement("div");g.className="vlc-form-actions";const m=document.createElement("button");m.type="button",m.className="vlc-btn vlc-btn-primary",m.textContent="Save defaults",m.addEventListener("click",()=>{const w={};for(const C of pt)w[C]=n.get(C)?.value??"";t.onSaveDefaults?.(w)});const b=document.createElement("button");b.type="button",b.className="vlc-btn",b.textContent="Back",b.addEventListener("click",()=>t.onBack?.()),g.append(m,b),e.appendChild(g)}function c(){e&&(e.hidden=!0)}function u(d){if(o==="listing")for(const h of Q){const g=n.get(h);g&&document.activeElement!==g&&(g.value=d.fields[h]||"")}}return{ensureRoot:i,showListing:l,showSettings:f,syncListingValues:u,hide:c,getMode:()=>o,getElement:()=>i()}}const Zt=`
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
  max-width: min(320px, calc(100vw - 32px));
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
}

.vlc-header-main {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  min-width: 0;
  flex: 1;
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
`;function Qt(t){let e=null,n=null,o=null,i=null,r=null,s=null,a=null,l=null,f=!1;const c=Yt({onFieldChange:(y,E)=>t.onFieldChange(y,E),onCopyFullText:()=>t.onCopyFullText(),onCopyPlateOnly:()=>t.onCopyPlateOnly(),onCopyJson:()=>t.onCopyJson(),onBack:()=>t.onSettingsBack(),onSaveDefaults:y=>t.onSaveDefaults(y)});function u(){!n||!l||(n.classList.toggle("vlc-panel--minimized",f),l.textContent=f?"□":"−",l.setAttribute("aria-label",f?"Expand panel":"Minimize panel"),l.title=f?"Expand":"Minimize")}function d(y){f=!!y,u()}function h(){d(!f)}function g(y=document.body){if(document.getElementById(G))return e=document.getElementById(G),e;e=document.createElement("div"),e.id=G,e.setAttribute("data-vlc-panel","1");const E=e.attachShadow({mode:"open"}),M=document.createElement("style");M.textContent=Zt,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",ut);const B=document.createElement("div");B.className="vlc-header";const V=document.createElement("div");V.className="vlc-header-main";const P=document.createElement("h1");P.className="vlc-title",P.textContent=ut,V.appendChild(P),l=document.createElement("button"),l.type="button",l.className="vlc-btn vlc-btn-icon",l.addEventListener("click",h),B.append(V,l);const L=document.createElement("div");L.className="vlc-body";const k=document.createElement("div");k.className="vlc-actions",r=m("Clip listing",()=>t.onClipListing()),s=m("Cancel",()=>t.onCancel()),s.disabled=!0,a=m("Copy again",()=>t.onCopyAgain()),a.disabled=!0;const T=m("Clear model cache",()=>t.onClearModelCache()),I=m("Diagnostics",()=>t.onToggleDiagnostics()),_=m("Settings",()=>t.onSettings());k.append(r,s,a,T,I,_),o=document.createElement("div"),o.className="vlc-status",o.setAttribute("aria-live","polite"),i=document.createElement("div"),i.className="vlc-diag",i.hidden=!0;const lt=c.getElement();return L.append(k,o,i,lt),n.append(B,L),E.append(M,n),u(),y.appendChild(e),e}function m(y,E){const M=document.createElement("button");return M.type="button",M.className="vlc-btn",M.textContent=y,M.addEventListener("click",E),M}function b(y){o&&(o.textContent=y)}function w(y){r&&(r.disabled=!!y),s&&(s.disabled=!y)}function C(y){a&&(a.disabled=!y)}function x(y,E=""){i&&(i.hidden=!y,i.textContent=E)}function S(y){c.showListing(y)}function A(y){c.showSettings(y)}function p(){c.hide()}function v(){e?.remove(),e=null,n=null,o=null,i=null,r=null,s=null,a=null,l=null,f=!1}return{mount:g,setStatus:b,setBusy:w,setCopyEnabled:C,setDiagnostics:x,showListingForm:S,showSettingsForm:A,hideForm:p,setMinimized:d,toggleMinimized:h,destroy:v}}const gt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",ht='#mainContent img[data-testid="swiper-image-lazy"]',bt="#mainContent div.swiper-wrapper img",yt=[gt,ht,bt],vt='#mainContent button[data-testid="ad-contact-phone"]',wt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Ct='#mainContent [data-testid="ad-parameters-container"]',xt='#mainContent [data-testid="ad-price-container"] h3',tt='link#ssr_canonical[rel="canonical"]',Et='#mainContent [data-testid="offer_title"]',St='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',At='script[type="application/ld+json"]';function te(t){return!!(t&&typeof t.click=="function")}function Mt(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function N(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function H(t){if(t.hidden)return!0;const n=Mt(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function z(t){if(!t||typeof t.getBoundingClientRect!="function"||H(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(N(t)>0)return!0;const n=Mt(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Lt(t=document){return[...t.querySelectorAll(vt)].filter(e=>te(e))}function kt(t=document){const e=Lt(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=e.filter(a=>!H(a)),i=[...n.length>0?n:e].sort((a,l)=>{const f=z(a)?1:0,c=z(l)?1:0;return f!==c?c-f:N(l)-N(a)}),r=(()=>{const a=i[0];return{visible:z(a)?1:0,area:N(a)}})(),s=i.filter(a=>(z(a)?1:0)===r.visible&&N(a)===r.area);return s[s.length-1]||i[i.length-1]||e[e.length-1]}function q(t=document){const e=[...t.querySelectorAll(wt)];for(const n of e){if(e.length>1&&H(n))continue;const i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}if(e.length>0){const n=e[e.length-1],i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}return null}function ee(t){try{const e=Object.keys(t).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const o={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(o),!0}catch{return!1}}function ne(t){try{t.click()}catch{}ee(t)}async function oe(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:o=250,signal:i}=t,r=q(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const s=Lt(e);if(s.length===0)return{ok:!1,reason:"no-button"};if(i?.aborted)return{ok:!1,reason:"cancelled"};const a=kt(e),l=[];a&&l.push(a);for(const c of s)c!==a&&!H(c)&&l.push(c);const f=Date.now()+n;for(const c of l){if(i?.aborted)return{ok:!1,reason:"cancelled"};ne(c);const u=Math.min(f,Date.now()+5e3);for(;Date.now()<u;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const d=q(e);if(d)return{ok:!0,phone:d,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,o))}}for(;Date.now()<f;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const c=q(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(u=>setTimeout(u,o))}return{ok:!1,reason:"timeout"}}function ie(t){return t==null||t===""?"":String(t).replace(/[^\d]/g,"")||""}function re(t){return t==null||t===""?"":typeof t=="number"&&Number.isFinite(t)?String(Math.round(t)):String(t).replace(/[^\d]/g,"")||""}function se(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase();return e?e.includes("manual")?"MANUAL":e.includes("auto")||e.includes("cvt")||e.includes("dsg")||e.includes("eat")?"AUTOMÁTICA":String(t).trim().toUpperCase():""}function ae(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return e?e.includes("gasolina")||e.includes("gasoline")||e==="petrol"?"GASOLINA":e.includes("diesel")||e.includes("gasoleo")||e.includes("gásóleo")?"DIESEL":e.includes("eletr")||e.includes("electr")?"ELÉTRICO":e.includes("hibr")||e.includes("hybrid")?"HÍBRIDO":e.includes("gpl")||e.includes("lpg")||e.includes("gnv")?"GPL":String(t).trim().toUpperCase():""}function ce(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";const n=e.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o>=100)return String(Number((o/1e3).toFixed(1)))}return e.replace(",",".")}function le(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";if(/\bcv\b/i.test(e)){const o=e.replace(/[^\d]/g,"");return o?`${o} CV`:e.toUpperCase().replace(/\s+/g," ")}const n=e.replace(/[^\d]/g,"");return n?`${n} CV`:e}function ue(t){if(t==null||t==="")return"";const e=String(t).replace(/[^\d]/g,"");return e.length>=4?e.slice(0,4):e}function Rt(t){return t==null||t===""?"":String(t).trim().toUpperCase()}function It(t,e="https://www.olx.pt/"){if(t==null||t==="")return"";try{const n=new URL(String(t),e);let o=`${n.origin}${n.pathname}`;const r=o.toLowerCase().indexOf(".html");return r!==-1&&(o=o.slice(0,r+5)),o}catch{return""}}function de(t){const e=new Map,n=t.querySelector(Ct);if(!n)return e;for(const o of n.querySelectorAll("p")){const i=(o.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const r=i.indexOf(":");if(r<=0)continue;const s=i.slice(0,r).trim().toLowerCase(),a=i.slice(r+1).trim();s&&a&&e.set(s,a)}return e}function fe(t){const e=t.querySelectorAll(At);for(const n of e){const o=n.textContent||"";if(o.trim())try{const i=JSON.parse(o),r=Array.isArray(i)?i:[i];for(const s of r)if(s&&s["@type"]==="Vehicle")return s}catch{}}return null}function pe(t){const n=(t.querySelector?.(tt)||(typeof document<"u"?document.querySelector(tt):null))?.getAttribute?.("href")||"";return n?It(n):typeof location<"u"&&location?.href?It(location.href):""}function me(t){const e=t.querySelectorAll(St);for(const n of e){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function ge(t){return t?.brand?typeof t.brand=="string"?t.brand:typeof t.brand?.name=="string"?t.brand.name:"":""}function he(t,e){return e?.sku!=null&&String(e.sku).trim()?String(e.sku).trim():String(t).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function be(t=document){const e=[],n=[];function o(A,p){p&&e.push(A)}const i=de(t),r=fe(t),s=pe(t);o("url",s);const a=he(s,r);o("listingId",a);const f=(t.querySelector(Et)?.textContent||r?.name||"").replace(/\s+/g," ").trim();o("title",f);const c=String(r?.description||"").replace(/\s+/g," ").trim();o("description",c);let u=ge(r);u||(u=me(t)),u=Rt(u),o("make",u);let d=i.get("modelo")||r?.model||"";d=Rt(d),o("model",d);let h=i.get("ano")||r?.productionDate||r?.modelDate||"";h=ue(h),o("year",h);const g=ie(i.get("quilómetros")||i.get("quilometros")||"");o("mileageKm",g);const m=se(i.get("tipo de caixa")||"");o("transmission",m);const b=ae(i.get("combustível")||i.get("combustivel")||"");o("fuel",b);const w=ce(i.get("cilindrada")||"");o("engine",w);const C=le(i.get("potência")||i.get("potencia")||"");o("powerCv",C);let x=r?.offers?.price;(x==null||x==="")&&(x=t.querySelector(xt)?.textContent||"");const S=re(x);return o("priceEur",S),(!u||!d)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"olx-pt",url:s,listingId:a,title:f,description:c,make:u,model:d,year:h,mileageKm:g,transmission:m,fuel:b,engine:w,powerCv:C,priceEur:S,extractedFields:[...new Set(e)],warnings:n}}function ye(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],i=n[1];let r=null;return i&&/^\d+w$/i.test(i)&&(r=Number.parseInt(i,10)),{url:o,width:r}}).filter(e=>!!e.url)}function ve(t){const e=ye(t);if(e.length===0)return null;const n=e.filter(i=>typeof i.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let i=1;i<n.length;i+=1)n[i].width>o.width&&(o=n[i]);return o.url}function we(t){if(!t)return null;const e=ve(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function Ce(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function Pt(t=document){for(const e of yt){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function et(t=document){const{images:e,selectorUsed:n}=Pt(t),o=[],i=new Set;for(const r of e){const s=we(r);if(!s)continue;const a=Ce(s);i.has(a)||(i.add(a),o.push(a))}return{urls:o,count:o.length,selectorUsed:n}}async function xe(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let i=et(e);if(i.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const s=Date.now()+n;for(;i.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,o)),i=et(e);return i}const Tt={siteId:"olx-pt",discoverListingImages:et,discoverListingImagesWithWait:xe,queryGalleryImages:Pt,extractListing:be,findPhoneRevealButton:kt,readRevealedPhone:q,revealContactPhone:oe,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:gt,FALLBACK_TESTID_SELECTOR:ht,FALLBACK_SWIPER_IMG_SELECTOR:bt,GALLERY_SELECTORS:yt,PHONE_REVEAL_BUTTON_SELECTOR:vt,CONTACT_PHONE_SELECTOR:wt,AD_PARAMETERS_SELECTOR:Ct,AD_PRICE_SELECTOR:xt,CANONICAL_LINK_SELECTOR:tt,OFFER_TITLE_SELECTOR:Et,BREADCRUMB_ITEM_SELECTOR:St,JSON_LD_SELECTOR:At}},Dt=new Map;function Ee(t){Dt.set(t.siteId,t)}function Se(t){return Dt.get(t)}function Ae(){return Se("olx-pt")||Tt}Ee(Tt);async function Me(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const i of n)try{const r=new Blob([t],{type:i});return await createImageBitmap(r)}catch(r){o=r}try{const i=new Blob([t]);return await createImageBitmap(i)}catch(i){throw o||i}}function Le(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const o=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:o,width:e.width,height:e.height}}const nt=new Map;function ot(){return typeof GM<"u"&&GM!=null}async function ke(t,e=null){return typeof GM_getValue=="function"?GM_getValue(t,e):ot()&&typeof GM.getValue=="function"?GM.getValue(t,e):nt.has(t)?nt.get(t):e}async function Re(t,e){if(typeof GM_setValue=="function"){GM_setValue(t,e);return}if(ot()&&typeof GM.setValue=="function"){await GM.setValue(t,e);return}nt.set(t,e)}async function Ie(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(ot()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function _t(t){const{method:e,url:n,responseType:o="arraybuffer",headers:i,signal:r}=t;return new Promise((s,a)=>{if(r?.aborted){a(new DOMException("Aborted","AbortError"));return}let l=null;const f=()=>{try{l?.abort?.()}catch{}a(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",f,{once:!0}),(u=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){l=GM.xmlHttpRequest(u);return}if(typeof GM_xmlhttpRequest=="function"){l=GM_xmlhttpRequest(u);return}a(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:i,onload(u){r?.removeEventListener("abort",f);const d=u.status;if(d<200||d>=300){a(new Error(`HTTP ${d} for ${n}`));return}s(u.response)},onerror(){r?.removeEventListener("abort",f),a(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",f),a(new Error(`Timeout for ${n}`))}})})}async function Pe(t,e={}){const{signal:n,request:o=_t}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await o({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:i}}function Te(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),o=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),i=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),s=Math.max(1,i-n),a=Math.max(1,r-o),l=document.createElement("canvas");l.width=t.width,l.height=t.height;const f=l.getContext("2d");return f.putImageData(t,0,0),f.getImageData(n,o,s,a)}function De(t,e,n){const o=document.createElement("canvas");o.width=t.width,o.height=t.height,o.getContext("2d").putImageData(t,0,0);const i=document.createElement("canvas");i.width=n,i.height=e;const r=i.getContext("2d");r.drawImage(o,0,0,n,e);const{data:s}=r.getImageData(0,0,n,e),a=new Uint8Array(1*e*n*3);let l=0;for(let f=0;f<e*n;f+=1)a[l++]=s[f*4],a[l++]=s[f*4+1],a[l++]=s[f*4+2];return a}function _e(t,e,n=[114,114,114]){const{width:o,height:i}=t,r=Math.min(e/i,e/o),s=Math.round(o*r),a=Math.round(i*r),l=(e-s)/2,f=(e-a)/2,c=Math.round(f-.1),u=Math.round(l-.1),d=document.createElement("canvas");d.width=o,d.height=i,d.getContext("2d").putImageData(t,0,0);const g=document.createElement("canvas");g.width=e,g.height=e;const m=g.getContext("2d");m.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,m.fillRect(0,0,e,e),m.drawImage(d,0,0,o,i,u,c,s,a);const b=m.getImageData(0,0,e,e).data,w=new Float32Array(3*e*e),C=e*e;for(let x=0;x<C;x+=1){const S=b[x*4],A=b[x*4+1],p=b[x*4+2];w[x]=S/255,w[C+x]=A/255,w[2*C+x]=p/255}return{tensor:w,ratio:r,pad:{dw:l,dh:f},size:e}}function Ne(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Oe="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Fe="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",$e="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",Be="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function Nt(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Oe},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Fe,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:$e},ortWasmBaseUrl:Be}}const K={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Ot=null;function Ve(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function it(){const t=Ve();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Ft=new Proxy({},{get(t,e){return it()[e]}});function Ge(){const t=it(),e=Nt();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function $t(t,e={}){Ge();const n=it(),o=e.prefer||["webgpu","wasm"],i=[];for(const r of o)try{const s=await n.InferenceSession.create(t,{executionProviders:[r]});return Ot=r,{session:s,provider:r}}catch(s){i.push(`${r}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function rt(){return Ot}const st=384,Ue="images",He="output0";async function ze(t,e,n={}){const o=n.confThresh??.4,{tensor:i,ratio:r,pad:s}=_e(e,st),a=new Ft.Tensor("float32",i,[1,3,st,st]),l=await t.run({[Ue]:a}),f=l[He]||Object.values(l)[0];if(!f)return[];const c=f.data,u=f.dims||[],d=u.length>=2?u[u.length-1]:7,h=Math.floor(c.length/d),g=[];for(let m=0;m<h;m+=1){const b=m*d,w=c[b+1],C=c[b+2],x=c[b+3],S=c[b+4],A=c[b+5],p=c[b+6];if(p<o)continue;const v=Ne({x1:w,y1:C,x2:x,y2:S},r,s);g.push({...v,score:Number(p),classId:Number(A)})}return g.sort((m,b)=>b.score-m.score),g}function qe(t,e,n=K){const o=n.alphabet,i=n.maxPlateSlots,r=o.length,s=t,a=[],l=[];for(let c=0;c<i;c+=1){let u=0,d=-1/0;for(let h=0;h<r;h+=1){const g=Number(s[c*r+h]);g>d&&(d=g,u=h)}a.push(o[u]),l.push(d)}let f=a.join("");return n.padChar&&(f=f.replace(new RegExp(`${Ke(n.padChar)}+$`),"")),{text:f,charProbs:l.slice(0,Math.max(f.length,1))}}function Ke(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function je(t,e){const{imgHeight:n,imgWidth:o}=K,i=De(e,n,o),r=new Ft.Tensor("uint8",i,[1,n,o,3]),s=await t.run({input:r}),a=s.plate||Object.values(s)[0],l=a.dims||[1,K.maxPlateSlots,K.alphabet.length],f=l[l.length-1],u=l[l.length-2]*f,d=a.data,h=d.length>=u?d.slice(0,u):d;return qe(h)}const O="[A-Z]",F="[0-9]",We=[{id:"LLDDDD",re:new RegExp(`^${O}{2}${F}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${F}{4}${O}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${F}{2}${O}{2}${F}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${O}{2}${F}{2}${O}{2}$`)}],Je={0:"O",1:"I",5:"S",8:"B"},Xe={O:"0",I:"1",L:"1",S:"5",B:"8"};function j(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function D(t){const e=j(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function Ye(t){const e=j(t);if(e.length!==6)return null;for(const n of We)if(n.re.test(e))return n.id;return null}function at(t,e){const n=j(t).slice(0,6).split("");if(n.length!==6)return[];const o=[];function i(r,s,a){if(s>e)return;if(r===6){const u=a.join(""),d=Ye(u);d&&o.push({plate:u,corrections:s,patternId:d});return}if(i(r+1,s,a),s>=e)return;const l=a[r],f=Je[l];if(f){const u=a.slice();u[r]=f,i(r+1,s+1,u)}const c=Xe[l];if(c){const u=a.slice();u[r]=c,i(r+1,s+1,u)}}return i(0,0,n),o.sort((r,s)=>r.corrections-s.corrections||s.plate.localeCompare(r.plate)),o}function Bt(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let o=0;for(let i=0;i<n;i+=1)o+=t[i]??0;return o/n}function Ze(t,e=[],n={}){const o=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,r=j(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:D(r),patternId:null,corrections:0,meanConfidence:Bt(e,r.length),reason:"too-short"};const s=r.slice(0,6),a=Bt(e,6),l=at(s,0);if(l.length>0&&a>=o){const u=l[0];return{accepted:!0,plate:u.plate,plateFormatted:D(u.plate),patternId:u.patternId,corrections:0,meanConfidence:a}}const f=at(s,1).filter(u=>u.corrections===1);if(f.length>0&&a>=i){const u=f[0];return{accepted:!0,plate:u.plate,plateFormatted:D(u.plate),patternId:u.patternId,corrections:1,meanConfidence:a}}return at(s,2).some(u=>u.corrections>1)&&l.length===0&&f.length===0?{accepted:!1,plate:s,plateFormatted:D(s),patternId:null,corrections:2,meanConfidence:a,reason:"excessive-corrections"}:l.length>0||f.length>0?{accepted:!1,plate:s,plateFormatted:D(s),patternId:null,corrections:l.length?0:1,meanConfidence:a,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:D(s),patternId:null,corrections:0,meanConfidence:a,reason:"no-reliable-pattern"}}const R="models",Qe=1;let W=null;function ct(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):W||(W=new Promise((t,e)=>{const n=indexedDB.open(dt,Qe);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(R)||o.createObjectStore(R,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),W)}async function Vt(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function tn(t){const e=await ct();return new Promise((n,o)=>{const r=e.transaction(R,"readonly").objectStore(R).get(t);r.onsuccess=()=>{const s=r.result;n(s?.bytes||null)},r.onerror=()=>o(r.error)})}async function en(t,e,n){const o=await ct();return new Promise((i,r)=>{const s=o.transaction(R,"readwrite");s.objectStore(R).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}async function nn(){const t=await ct();return new Promise((e,n)=>{const o=t.transaction(R,"readwrite");o.objectStore(R).clear(),o.oncomplete=()=>e(),o.onerror=()=>n(o.error)})}async function Gt(t,e={}){const{onStatus:n,signal:o}=e,i=await tn(t.id).catch(()=>null);if(i&&await Vt(i)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await _t({method:"GET",url:t.url,responseType:"arraybuffer",signal:o}),s=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const a=await Vt(s);if(a!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${a}`);return await en(t.id,s,a).catch(()=>{}),{bytes:s,cacheHit:!1}}let $=null;async function on(t={}){if($)return{sessions:$,diagnostics:{provider:rt(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=Nt(),n=await Gt(e.detector,t),o=await Gt(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const i=await $t(n.bytes),r=await $t(o.bytes);return $={detector:i.session,ocr:r.session},{sessions:$,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function rn(){$=null}async function sn(t,e,n={}){const{signal:o}=n;let i=0,r;try{const a=await Me(e);r=Le(a).imageData,a.close?.()}catch{return null}const s=await ze(t.detector,r);for(const a of s){if(o?.aborted)throw new DOMException("Aborted","AbortError");i+=1;const l=Te(r,a),f=await je(t.ocr,l),c=Ze(f.text,f.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,detectionsTried:i}}return{plate:"",plateFormatted:"",detectionsTried:i}}async function an(t,e={}){const n=Date.now(),{onStatus:o,signal:i,request:r}=e,s=t.length,a=await on({onStatus:o,signal:i}),{detector:l,ocr:f}=a.sessions;let c=0,u=0;for(let d=0;d<s;d+=1){if(i?.aborted)return J("cancelled",a.diagnostics,u,c,n);const h=t[d];o?.(`Downloading image ${d+1} of ${s}`);let g;try{g=await Pe(h,{signal:i,request:r})}catch(b){if(i?.aborted||b?.name==="AbortError")return J("cancelled",a.diagnostics,u,c,n);o?.(`Failed to download image ${d+1} of ${s}, skipping…`);continue}o?.(`Scanning image ${d+1} of ${s}`),u+=1;let m;try{m=await sn({detector:l,ocr:f},g.bytes,{signal:i})}catch(b){if(i?.aborted||b?.name==="AbortError")return J("cancelled",a.diagnostics,u,c,n);continue}finally{g=null}if(m&&(c+=m.detectionsTried,m.plate))return{ok:!0,plate:m.plate,plateFormatted:m.plateFormatted,diagnostics:{provider:rt()||a.diagnostics.provider,detectorCacheHit:a.diagnostics.detectorCacheHit,ocrCacheHit:a.diagnostics.ocrCacheHit,imagesScanned:u,detectionsTried:c,elapsedMs:Date.now()-n}}}return J("no-reliable-plate",a.diagnostics,u,c,n)}function J(t,e,n,o,i){return{ok:!1,reason:t,diagnostics:{provider:rt()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-i}}}async function Ut(t){return await Ie(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function cn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function ln({plate:t,phone:e}={}){const n=t==null?"":String(t).trim();if(n)return n;const o=e==null?"":String(e).trim();return o||cn()}function Ht(t,{phone:e=""}={}){const n=t||{},o=e==null?"":String(e).trim(),i=n.plate==null?"":String(n.plate).trim(),s=[`ID: ${ln({plate:i,phone:o})}`,`Telefone: ${o}`,""];for(const l of Q){if(l==="url")continue;const f=ft[l];let c=n[l]==null?"":String(n[l]);l==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),s.push(`${f}: ${c}`)}const a=n.url==null?"":String(n.url);return s.push(""),s.push(a),s.join(`
`)}function un(t){const e={source:t.source,vehicle:{plate:t.fields.plate,make:t.fields.make,model:t.fields.model,year:t.fields.year,mileageKm:t.fields.mileageKm,transmission:t.fields.transmission,fuel:t.fields.fuel,engine:t.fields.engine,powerCv:t.fields.powerCv},valuation:{paintParts:t.fields.paintParts,bodyParts:t.fields.bodyParts,tires:t.fields.tires,customerValueEur:t.fields.customerValueEur,saleReason:t.fields.saleReason,keyCount:t.fields.keyCount,deductibleVat:t.fields.deductibleVat},url:t.fields.url,origins:t.origins,metadata:t.metadata};return JSON.stringify(e,null,2)}const zt="valuationDefaults";async function dn(t,e=null){return ke(`${Y}${t}`,e)}async function fn(t,e){await Re(`${Y}${t}`,e)}async function qt(){const t=await dn(zt,null);return!t||typeof t!="object"?{...U}:{...U,...t}}async function pn(t){const e={...U,...t};return await fn(zt,e),e}function mn(){let t=Kt(),e=null,n=null;function o(p){t={...t,statusMessage:p},e?.setStatus(p)}function i(p){t={...t,busy:p,view:p?"reading":t.listingRecord?"form":"idle"},e?.setBusy(p)}function r(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const p=t.lastDiagnostics;if(!p){e?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}e?.setDiagnostics(!0,[`Provider: ${p.provider||"n/a"}`,`Detector cache: ${p.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${p.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${p.imagesScanned??0}`,`Detections tried: ${p.detectionsTried??0}`,`Elapsed: ${p.elapsedMs??0} ms`].join(`
`))}function s(p,v,y){const E=[];return v.plate?E.push(`Plate found: ${v.plate}`):E.push("No reliable plate found."),v.phone&&E.push(`Phone: ${v.phone}`),(p.fields.make||p.fields.model)&&E.push(`Listing: ${[p.fields.make,p.fields.model].filter(Boolean).join(" ")}`.trim()),E.push(y?"Full text copied to clipboard":"Clipboard copy failed — use Copy full text"),E.join(`
`)}async function a(p){return t={...t,lastClipboard:p},e?.setCopyEnabled(!!p),Ut(p)}async function l(){if(t.busy)return;n=new AbortController;const{signal:p}=n;i(!0);try{const v=Ae(),y=await qt();o("Revealing phone (if available)…");const E=v.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:p});o("Extracting listing fields…");const M=v.extractListing(document);o("Looking for listing images…");const B=await v.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:V,count:P}=B;let L={ok:!1,reason:"no-images"};P>0?(o(`Found ${P} listing images — scanning…`),o("Loading plate recognition models…"),L=await an(V,{signal:p,onStatus:o}),t={...t,lastDiagnostics:L.diagnostics},r()):o("No listing images — checking phone…");const k=await E,T=L.ok&&L.plate?L.plate:"",I=k.ok?k.phone:"";if(p.aborted||L.reason==="cancelled"){o("Cancelled.");return}const _=Jt({extracted:M,plate:T,defaults:y});t={...t,lastPlate:T,lastPhone:I,listingRecord:_,view:"form"},e?.showListingForm(_);const lt=Ht(_.fields,{phone:I}),hn=await a(lt);let X=s(_,{plate:T,phone:I},hn.ok);T&&!I&&k.reason==="timeout"?X+=`
Phone reveal timed out.`:T&&!I&&k.reason==="no-button"&&(X+=`
No phone button on this listing.`),P===0&&!I&&k.reason==="no-button"&&(X+=`
No listing images found.`),o(X)}catch(v){if(p.aborted){o("Cancelled.");return}const y=v instanceof Error?v.message:"Unknown recognition error";o(`Failed: ${y}`)}finally{n=null,i(!1)}}function f(){n?.abort()}async function c(){if(!t.lastClipboard){o("Nothing to copy yet.");return}const p=await Ut(t.lastClipboard);o(p.ok?"Copied to clipboard again.":"Clipboard copy failed.")}async function u(){if(!t.listingRecord){o("No listing to copy yet. Run Clip listing.");return}const p=Ht(t.listingRecord.fields,{phone:t.lastPhone}),v=await a(p);o(v.ok?"Full text copied to clipboard.":"Clipboard copy failed.")}async function d(){const p=t.listingRecord?.fields?.plate||t.lastPlate||"";if(!p){o("No plate to copy.");return}const v=await a(p);o(v.ok?`Plate copied: ${p}`:"Clipboard copy failed.")}async function h(){if(!t.listingRecord){o("No listing to copy yet. Run Clip listing.");return}const p=un(t.listingRecord),v=await a(p);o(v.ok?"JSON copied to clipboard.":"Clipboard copy failed.")}function g(p,v){if(!t.listingRecord)return;const y=Xt(t.listingRecord,p,v);t={...t,listingRecord:y,lastPlate:p==="plate"?v:t.lastPlate}}async function m(){try{await nn(),rn(),o("Model cache cleared.")}catch(p){const v=p instanceof Error?p.message:"Failed to clear cache";o(v)}}function b(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},r(),o(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function w(){if(t.busy)return;const p=await qt();t={...t,view:"settings"},e?.showSettingsForm(p),o(`Settings. Environment: production. Storage: ${Y}* / ${dt}.`)}function C(){t={...t,view:t.listingRecord?"form":"idle"},t.listingRecord?(e?.showListingForm(t.listingRecord),o("Back to listing review.")):(e?.hideForm(),o("Settings closed."))}async function x(p){await pn(p),o("Defaults saved.")}function S(p=document.body){return e||(e=Qt({onClipListing:l,onCancel:f,onCopyAgain:c,onClearModelCache:m,onToggleDiagnostics:b,onSettings:w,onFieldChange:g,onCopyFullText:u,onCopyPlateOnly:d,onCopyJson:h,onSettingsBack:C,onSaveDefaults:x}),e.mount(p),e)}function A(){return t}return{mount:S,onClipListing:l,onCancel:f,onCopyAgain:c,onCopyFullText:u,onCopyPlateOnly:d,onCopyJson:h,onFieldChange:g,onClearModelCache:m,onToggleDiagnostics:b,onSettings:w,onSettingsBack:C,onSaveDefaults:x,getState:A,setStatus:o}}function gn(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[Z])return{started:!1,reason:"already-initialized"};if(document.getElementById(G))return window[Z]=!0,{started:!1,reason:"panel-exists"};window[Z]=!0;const t=mn(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}gn()})();
