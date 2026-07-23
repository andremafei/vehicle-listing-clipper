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
(function(){"use strict";const lt="Vehicle Listing Clipper",ct="vlc_prod_",St="vehicle-listing-clipper",ut="__VLC_PROD_INITIALIZED__",X="vlc-panel-root";function Lt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const Y={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},dt=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Mt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},At=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function ae(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function se(t={}){return{...Y,...t}}function le({extracted:t=null,plate:e="",defaults:n={}}={}){const o=se(n),i=ae(),r={},s=[],a=[],d=[],f=[...t?.warnings||[]];function l(u,h,m){const g=h==null?"":String(h);if(i[u]=g,!g){r[u]="missing";return}r[u]=m,m==="extracted"||m==="anpr"?s.push(u):m==="default"&&a.push(u)}const c=e?String(e).trim():"";return l("plate",c,c?"anpr":"missing"),l("make",t?.make||"",t?.make?"extracted":"missing"),l("model",t?.model||"",t?.model?"extracted":"missing"),l("year",t?.year||"",t?.year?"extracted":"missing"),l("mileageKm",t?.mileageKm||"",t?.mileageKm?"extracted":"missing"),l("transmission",t?.transmission||"",t?.transmission?"extracted":"missing"),l("fuel",t?.fuel||"",t?.fuel?"extracted":"missing"),l("engine",t?.engine||"",t?.engine?"extracted":"missing"),l("powerCv",t?.powerCv||"",t?.powerCv?"extracted":"missing"),l("customerValueEur",t?.priceEur||"",t?.priceEur?"extracted":"missing"),l("url",t?.url||"",t?.url?"extracted":"missing"),l("paintParts",o.paintParts,"default"),l("bodyParts",o.bodyParts,"default"),l("tires",o.tires,"default"),l("saleReason",o.saleReason,"default"),l("keyCount",o.keyCount,"default"),l("deductibleVat",o.deductibleVat,"default"),{source:{siteId:t?.siteId||"olx-pt",url:i.url,listingId:t?.listingId||"",title:t?.title||"",description:t?.description||""},fields:i,origins:r,metadata:{extractedFields:[...new Set(s)],defaultedFields:[...new Set(a)],editedFields:d,warnings:f}}}function ce(t,e,n){const o=n==null?"":String(n),i={...t.fields,[e]:o},r={...t.origins,[e]:o?"edited":"missing"},s=[...new Set([...t.metadata.editedFields||[],e])];return{...t,fields:i,origins:r,source:{...t.source,url:e==="url"?o:t.source.url},metadata:{...t.metadata,editedFields:s}}}function It(t){switch(t){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function ue(t){let e=null;const n=new Map;let o="listing";function i(){return e||(e=document.createElement("div"),e.className="vlc-form",e.hidden=!0,e)}function r(){e&&(e.replaceChildren(),n.clear())}function s(u,h,m="missing"){const g=document.createElement("label");g.className=`vlc-field ${It(m)}`,g.dataset.field=u;const y=document.createElement("span");y.className="vlc-field-label",y.textContent=Mt[u]||u;const C=document.createElement("span");C.className="vlc-field-origin",C.textContent=m;const v=document.createElement("input");v.type="text",v.className="vlc-field-input",v.value=h??"",v.dataset.field=u,v.addEventListener("input",()=>{o==="listing"&&(t.onFieldChange(u,v.value),g.className=`vlc-field ${It("edited")}`,C.textContent="edited")}),y.appendChild(C),g.append(y,v),n.set(u,v),e?.appendChild(g)}function a(){const u=document.createElement("div");u.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>t.onCopyFullText());const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Copy plate only",m.addEventListener("click",()=>t.onCopyPlateOnly());const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Copy JSON",g.addEventListener("click",()=>t.onCopyJson()),u.append(h,m,g),e?.appendChild(u)}function d(u){o="listing",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Review listing",e.appendChild(h);for(const m of dt)s(m,u.fields[m]||"",u.origins[m]||"missing");a()}function f(u){o="settings",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",e.appendChild(h);for(const C of At)s(C,u[C]||"","default");const m=document.createElement("div");m.className="vlc-form-actions";const g=document.createElement("button");g.type="button",g.className="vlc-btn vlc-btn-primary",g.textContent="Save defaults",g.addEventListener("click",()=>{const C={};for(const v of At)C[v]=n.get(v)?.value??"";t.onSaveDefaults?.(C)});const y=document.createElement("button");y.type="button",y.className="vlc-btn",y.textContent="Back",y.addEventListener("click",()=>t.onBack?.()),m.append(g,y),e.appendChild(m)}function l(){e&&(e.hidden=!0)}function c(u){if(o==="listing")for(const h of dt){const m=n.get(h);m&&document.activeElement!==m&&(m.value=u.fields[h]||"")}}return{ensureRoot:i,showListing:d,showSettings:f,syncListingValues:c,hide:l,getMode:()=>o,getElement:()=>i()}}const de=`
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
`;function fe(t){let e=null,n=null,o=null,i=null,r=null,s=null,a=null,d=null,f=null,l=null,c=null,u=!0,h="waiting",m=!1,g=null,y=0,C=0,v=null;const x=ue({onFieldChange:(b,E)=>t.onFieldChange(b,E),onCopyFullText:()=>t.onCopyFullText(),onCopyPlateOnly:()=>t.onCopyPlateOnly(),onCopyJson:()=>t.onCopyJson(),onBack:()=>t.onSettingsBack(),onSaveDefaults:b=>t.onSaveDefaults(b)});function L(){i&&(i.textContent=u?h:lt)}const M='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',A='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>';function _(){!n||!c||(n.classList.toggle("vlc-panel--minimized",u),c.innerHTML=u?M:A,c.setAttribute("aria-label",u?"Expand panel":"Minimize panel"),c.title=u?"Expand":"Minimize",L())}function rt(b){u=!!b,_()}function at(){rt(!u)}function wt(b){h=b,L()}function p(){f&&(f.disabled=!m),l&&(l.disabled=!m)}function w(b,E){if(!n)return;const S=n.getBoundingClientRect(),K=Math.max(0,window.innerWidth-S.width),j=Math.max(0,window.innerHeight-S.height),W=Math.min(Math.max(0,b),K),J=Math.min(Math.max(0,E),j);n.style.left=`${W}px`,n.style.top=`${J}px`,n.style.right="auto",n.style.bottom="auto"}function k(b){if(!n||!o||b.target?.closest("button")||b.button!==0)return;const S=n.getBoundingClientRect();g=b.pointerId,y=b.clientX-S.left,C=b.clientY-S.top,o.classList.add("vlc-header--dragging"),o.setPointerCapture(b.pointerId),b.preventDefault()}function I(b){g===b.pointerId&&w(b.clientX-y,b.clientY-C)}function $(b){g===b.pointerId&&(g=null,o?.classList.remove("vlc-header--dragging"),o?.hasPointerCapture(b.pointerId)&&o.releasePointerCapture(b.pointerId))}function xt(b=document.body){if(document.getElementById(X))return e=document.getElementById(X),e;e=document.createElement("div"),e.id=X,e.setAttribute("data-vlc-panel","1");const E=e.attachShadow({mode:"open"}),S=document.createElement("style");S.textContent=de,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",lt),o=document.createElement("div"),o.className="vlc-header",o.addEventListener("pointerdown",k),o.addEventListener("pointermove",I),o.addEventListener("pointerup",$),o.addEventListener("pointercancel",$);const K=document.createElement("div");K.className="vlc-header-main",i=document.createElement("h1"),i.className="vlc-title",i.textContent=lt,K.appendChild(i),l=T("Copy again",()=>t.onCopyAgain()),l.classList.add("vlc-btn-header-copy"),l.disabled=!0,c=document.createElement("button"),c.type="button",c.className="vlc-btn vlc-btn-icon",c.addEventListener("click",at);const j=document.createElement("div");j.className="vlc-header-actions",j.append(l,c),o.append(K,j);const W=document.createElement("div");W.className="vlc-body";const J=document.createElement("div");J.className="vlc-actions",a=T("Clip listing",()=>t.onClipListing()),d=T("Cancel",()=>t.onCancel()),d.disabled=!0,f=T("Copy again",()=>t.onCopyAgain()),f.disabled=!0;const Tn=T("Clear model cache",()=>t.onClearModelCache()),Pn=T("Diagnostics",()=>t.onToggleDiagnostics()),Rn=T("Settings",()=>t.onSettings());J.append(a,d,f,Tn,Pn,Rn),r=document.createElement("div"),r.className="vlc-status",r.setAttribute("aria-live","polite"),s=document.createElement("div"),s.className="vlc-diag",s.hidden=!0;const Dn=x.getElement();return W.append(J,r,s,Dn),n.append(o,W),E.append(S,n),_(),b.appendChild(e),e}function T(b,E){const S=document.createElement("button");return S.type="button",S.className="vlc-btn",S.textContent=b,S.addEventListener("click",E),S}function q(b){r&&(r.textContent=b)}function R(b){a&&(a.disabled=!!b),d&&(d.disabled=!b)}function N(b){m=!!b,p()}function O(b=2e3){v!=null&&(clearTimeout(v),v=null);for(const E of[l,f])E&&E.classList.add("vlc-btn--copied");v=setTimeout(()=>{v=null;for(const E of[l,f])E?.classList.remove("vlc-btn--copied")},b)}function D(b,E=""){s&&(s.hidden=!b,s.textContent=E)}function F(b){x.showListing(b)}function Et(b){x.showSettings(b)}function st(){x.hide()}function V(){v!=null&&(clearTimeout(v),v=null),o&&(o.removeEventListener("pointerdown",k),o.removeEventListener("pointermove",I),o.removeEventListener("pointerup",$),o.removeEventListener("pointercancel",$)),e?.remove(),e=null,n=null,o=null,i=null,r=null,s=null,a=null,d=null,f=null,l=null,c=null,u=!0,h="waiting",m=!1,g=null}return{mount:xt,setStatus:q,setBusy:R,setCopyEnabled:N,flashCopySuccess:O,setCaptureStatus:wt,setDiagnostics:D,showListingForm:F,showSettingsForm:Et,hideForm:st,setMinimized:rt,toggleMinimized:at,destroy:V}}const kt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",Tt='#mainContent img[data-testid="swiper-image-lazy"]',Pt="#mainContent div.swiper-wrapper img",Rt=[kt,Tt,Pt],Dt='#mainContent button[data-testid="ad-contact-phone"]',_t='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Nt='#mainContent [data-testid="ad-parameters-container"]',Ot='#mainContent [data-testid="ad-price-container"] h3',ft='link#ssr_canonical[rel="canonical"]',Bt='#mainContent [data-testid="offer_title"]',$t='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Ft='script[type="application/ld+json"]';function pe(t){return!!(t&&typeof t.click=="function")}function Vt(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function H(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function Z(t){if(t.hidden)return!0;const n=Vt(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Q(t){if(!t||typeof t.getBoundingClientRect!="function"||Z(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(H(t)>0)return!0;const n=Vt(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Ht(t=document){return[...t.querySelectorAll(Dt)].filter(e=>pe(e))}function Gt(t=document){const e=Ht(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=e.filter(a=>!Z(a)),i=[...n.length>0?n:e].sort((a,d)=>{const f=Q(a)?1:0,l=Q(d)?1:0;return f!==l?l-f:H(d)-H(a)}),r=(()=>{const a=i[0];return{visible:Q(a)?1:0,area:H(a)}})(),s=i.filter(a=>(Q(a)?1:0)===r.visible&&H(a)===r.area);return s[s.length-1]||i[i.length-1]||e[e.length-1]}function tt(t=document){const e=[...t.querySelectorAll(_t)];for(const n of e){if(e.length>1&&Z(n))continue;const i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}if(e.length>0){const n=e[e.length-1],i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}return null}function me(t){try{const e=Object.keys(t).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const o={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(o),!0}catch{return!1}}function ge(t){try{t.click()}catch{}me(t)}async function he(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:o=250,signal:i}=t,r=tt(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const s=Ht(e);if(s.length===0)return{ok:!1,reason:"no-button"};if(i?.aborted)return{ok:!1,reason:"cancelled"};const a=Gt(e),d=[];a&&d.push(a);for(const l of s)l!==a&&!Z(l)&&d.push(l);const f=Date.now()+n;for(const l of d){if(i?.aborted)return{ok:!1,reason:"cancelled"};ge(l);const c=Math.min(f,Date.now()+5e3);for(;Date.now()<c;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const u=tt(e);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,o))}}for(;Date.now()<f;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const l=tt(e);if(l)return{ok:!0,phone:l,clicked:!0,alreadyVisible:!1};await new Promise(c=>setTimeout(c,o))}return{ok:!1,reason:"timeout"}}function be(t){return t==null||t===""?"":String(t).replace(/[^\d]/g,"")||""}function ye(t){return t==null||t===""?"":typeof t=="number"&&Number.isFinite(t)?String(Math.round(t)):String(t).replace(/[^\d]/g,"")||""}function ve(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase();return e?e.includes("manual")?"MANUAL":e.includes("auto")||e.includes("cvt")||e.includes("dsg")||e.includes("eat")?"AUTOMÁTICA":String(t).trim().toUpperCase():""}function Ce(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return e?e.includes("gasolina")||e.includes("gasoline")||e==="petrol"?"GASOLINA":e.includes("diesel")||e.includes("gasoleo")||e.includes("gásóleo")?"DIESEL":e.includes("eletr")||e.includes("electr")?"ELÉTRICO":e.includes("hibr")||e.includes("hybrid")?"HÍBRIDO":e.includes("gpl")||e.includes("lpg")||e.includes("gnv")?"GPL":String(t).trim().toUpperCase():""}function we(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";const n=e.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const i=Number.parseInt(n,10);if(i===99||i===999)return"1.0";if(i>=100)return(i/1e3).toFixed(1)}const o=e.replace(",",".");return o==="1"?"1.0":o}function xe(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";if(/\bcv\b/i.test(e)){const o=e.replace(/[^\d]/g,"");return o?`${o} CV`:e.toUpperCase().replace(/\s+/g," ")}const n=e.replace(/[^\d]/g,"");return n?`${n} CV`:e}function Ee(t){if(t==null||t==="")return"";const e=String(t).replace(/[^\d]/g,"");return e.length>=4?e.slice(0,4):e}function Ut(t){return t==null||t===""?"":String(t).trim().toUpperCase()}function zt(t,e="https://www.olx.pt/"){if(t==null||t==="")return"";try{const n=new URL(String(t),e);let o=`${n.origin}${n.pathname}`;const r=o.toLowerCase().indexOf(".html");return r!==-1&&(o=o.slice(0,r+5)),o}catch{return""}}function Se(t){const e=new Map,n=t.querySelector(Nt);if(!n)return e;for(const o of n.querySelectorAll("p")){const i=(o.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const r=i.indexOf(":");if(r<=0)continue;const s=i.slice(0,r).trim().toLowerCase(),a=i.slice(r+1).trim();s&&a&&e.set(s,a)}return e}function Le(t){const e=t.querySelectorAll(Ft);for(const n of e){const o=n.textContent||"";if(o.trim())try{const i=JSON.parse(o),r=Array.isArray(i)?i:[i];for(const s of r)if(s&&s["@type"]==="Vehicle")return s}catch{}}return null}function Me(t){const n=(t.querySelector?.(ft)||(typeof document<"u"?document.querySelector(ft):null))?.getAttribute?.("href")||"";return n?zt(n):typeof location<"u"&&location?.href?zt(location.href):""}function Ae(t){const e=t.querySelectorAll($t);for(const n of e){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function Ie(t){return t?.brand?typeof t.brand=="string"?t.brand:typeof t.brand?.name=="string"?t.brand.name:"":""}function ke(t,e){return e?.sku!=null&&String(e.sku).trim()?String(e.sku).trim():String(t).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Te(t=document){const e=[],n=[];function o(M,A){A&&e.push(M)}const i=Se(t),r=Le(t),s=Me(t);o("url",s);const a=ke(s,r);o("listingId",a);const f=(t.querySelector(Bt)?.textContent||r?.name||"").replace(/\s+/g," ").trim();o("title",f);const l=String(r?.description||"").replace(/\s+/g," ").trim();o("description",l);let c=Ie(r);c||(c=Ae(t)),c=Ut(c),o("make",c);let u=i.get("modelo")||r?.model||"";u=Ut(u),o("model",u);let h=i.get("ano")||r?.productionDate||r?.modelDate||"";h=Ee(h),o("year",h);const m=be(i.get("quilómetros")||i.get("quilometros")||"");o("mileageKm",m);const g=ve(i.get("tipo de caixa")||"");o("transmission",g);const y=Ce(i.get("combustível")||i.get("combustivel")||"");o("fuel",y);const C=we(i.get("cilindrada")||"");o("engine",C);const v=xe(i.get("potência")||i.get("potencia")||"");o("powerCv",v);let x=r?.offers?.price;(x==null||x==="")&&(x=t.querySelector(Ot)?.textContent||"");const L=ye(x);return o("priceEur",L),(!c||!u)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"olx-pt",url:s,listingId:a,title:f,description:l,make:c,model:u,year:h,mileageKm:m,transmission:g,fuel:y,engine:C,powerCv:v,priceEur:L,extractedFields:[...new Set(e)],warnings:n}}function Pe(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],i=n[1];let r=null;return i&&/^\d+w$/i.test(i)&&(r=Number.parseInt(i,10)),{url:o,width:r}}).filter(e=>!!e.url)}function Re(t){const e=Pe(t);if(e.length===0)return null;const n=e.filter(i=>typeof i.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let i=1;i<n.length;i+=1)n[i].width>o.width&&(o=n[i]);return o.url}function De(t){if(!t)return null;const e=Re(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function _e(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function qt(t=document){for(const e of Rt){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function pt(t=document){const{images:e,selectorUsed:n}=qt(t),o=[],i=new Set;for(const r of e){const s=De(r);if(!s)continue;const a=_e(s);i.has(a)||(i.add(a),o.push(a))}return{urls:o,count:o.length,selectorUsed:n}}async function Ne(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let i=pt(e);if(i.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const s=Date.now()+n;for(;i.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,o)),i=pt(e);return i}const Kt={siteId:"olx-pt",discoverListingImages:pt,discoverListingImagesWithWait:Ne,queryGalleryImages:qt,extractListing:Te,findPhoneRevealButton:Gt,readRevealedPhone:tt,revealContactPhone:he,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:kt,FALLBACK_TESTID_SELECTOR:Tt,FALLBACK_SWIPER_IMG_SELECTOR:Pt,GALLERY_SELECTORS:Rt,PHONE_REVEAL_BUTTON_SELECTOR:Dt,CONTACT_PHONE_SELECTOR:_t,AD_PARAMETERS_SELECTOR:Nt,AD_PRICE_SELECTOR:Ot,CANONICAL_LINK_SELECTOR:ft,OFFER_TITLE_SELECTOR:Bt,BREADCRUMB_ITEM_SELECTOR:$t,JSON_LD_SELECTOR:Ft}},jt=new Map;function Oe(t){jt.set(t.siteId,t)}function Be(t){return jt.get(t)}function $e(){return Be("olx-pt")||Kt}Oe(Kt);async function Fe(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const i of n)try{const r=new Blob([t],{type:i});return await createImageBitmap(r)}catch(r){o=r}try{const i=new Blob([t]);return await createImageBitmap(i)}catch(i){throw o||i}}function Ve(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const o=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:o,width:e.width,height:e.height}}const mt=new Map;function gt(){return typeof GM<"u"&&GM!=null}async function He(t,e=null){return typeof GM_getValue=="function"?GM_getValue(t,e):gt()&&typeof GM.getValue=="function"?GM.getValue(t,e):mt.has(t)?mt.get(t):e}async function Ge(t,e){if(typeof GM_setValue=="function"){GM_setValue(t,e);return}if(gt()&&typeof GM.setValue=="function"){await GM.setValue(t,e);return}mt.set(t,e)}async function Ue(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(gt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function Wt(t){const{method:e,url:n,responseType:o="arraybuffer",headers:i,signal:r}=t;return new Promise((s,a)=>{if(r?.aborted){a(new DOMException("Aborted","AbortError"));return}let d=null;const f=()=>{try{d?.abort?.()}catch{}a(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",f,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(c);return}a(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:i,onload(c){r?.removeEventListener("abort",f);const u=c.status;if(u<200||u>=300){a(new Error(`HTTP ${u} for ${n}`));return}s(c.response)},onerror(){r?.removeEventListener("abort",f),a(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",f),a(new Error(`Timeout for ${n}`))}})})}async function ze(t,e={}){const{signal:n,request:o=Wt}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await o({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:i}}function qe(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),o=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),i=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),s=Math.max(1,i-n),a=Math.max(1,r-o),d=document.createElement("canvas");d.width=t.width,d.height=t.height;const f=d.getContext("2d");return f.putImageData(t,0,0),f.getImageData(n,o,s,a)}function Ke(t,e,n){const o=document.createElement("canvas");o.width=t.width,o.height=t.height,o.getContext("2d").putImageData(t,0,0);const i=document.createElement("canvas");i.width=n,i.height=e;const r=i.getContext("2d");r.drawImage(o,0,0,n,e);const{data:s}=r.getImageData(0,0,n,e),a=new Uint8Array(1*e*n*3);let d=0;for(let f=0;f<e*n;f+=1)a[d++]=s[f*4],a[d++]=s[f*4+1],a[d++]=s[f*4+2];return a}function je(t,e,n=[114,114,114]){const{width:o,height:i}=t,r=Math.min(e/i,e/o),s=Math.round(o*r),a=Math.round(i*r),d=(e-s)/2,f=(e-a)/2,l=Math.round(f-.1),c=Math.round(d-.1),u=document.createElement("canvas");u.width=o,u.height=i,u.getContext("2d").putImageData(t,0,0);const m=document.createElement("canvas");m.width=e,m.height=e;const g=m.getContext("2d");g.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,g.fillRect(0,0,e,e),g.drawImage(u,0,0,o,i,c,l,s,a);const y=g.getImageData(0,0,e,e).data,C=new Float32Array(3*e*e),v=e*e;for(let x=0;x<v;x+=1){const L=y[x*4],M=y[x*4+1],A=y[x*4+2];C[x]=L/255,C[v+x]=M/255,C[2*v+x]=A/255}return{tensor:C,ratio:r,pad:{dw:d,dh:f},size:e}}function We(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Je="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Xe="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Ye="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",Ze="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function Jt(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Je},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Xe,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Ye},ortWasmBaseUrl:Ze}}const et={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Xt=null;function Qe(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function ht(){const t=Qe();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Yt=new Proxy({},{get(t,e){return ht()[e]}});function tn(){const t=ht(),e=Jt();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function Zt(t,e={}){tn();const n=ht(),o=e.prefer||["webgpu","wasm"],i=[];for(const r of o)try{const s=await n.InferenceSession.create(t,{executionProviders:[r]});return Xt=r,{session:s,provider:r}}catch(s){i.push(`${r}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function bt(){return Xt}const yt=384,en="images",nn="output0";async function on(t,e,n={}){const o=n.confThresh??.4,{tensor:i,ratio:r,pad:s}=je(e,yt),a=new Yt.Tensor("float32",i,[1,3,yt,yt]),d=await t.run({[en]:a}),f=d[nn]||Object.values(d)[0];if(!f)return[];const l=f.data,c=f.dims||[],u=c.length>=2?c[c.length-1]:7,h=Math.floor(l.length/u),m=[];for(let g=0;g<h;g+=1){const y=g*u,C=l[y+1],v=l[y+2],x=l[y+3],L=l[y+4],M=l[y+5],A=l[y+6];if(A<o)continue;const _=We({x1:C,y1:v,x2:x,y2:L},r,s);m.push({..._,score:Number(A),classId:Number(M)})}return m.sort((g,y)=>y.score-g.score),m}function rn(t,e,n=et){const o=n.alphabet,i=n.maxPlateSlots,r=o.length,s=t,a=[],d=[];for(let l=0;l<i;l+=1){let c=0,u=-1/0;for(let h=0;h<r;h+=1){const m=Number(s[l*r+h]);m>u&&(u=m,c=h)}a.push(o[c]),d.push(u)}let f=a.join("");return n.padChar&&(f=f.replace(new RegExp(`${an(n.padChar)}+$`),"")),{text:f,charProbs:d.slice(0,Math.max(f.length,1))}}function an(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function sn(t,e){const{imgHeight:n,imgWidth:o}=et,i=Ke(e,n,o),r=new Yt.Tensor("uint8",i,[1,n,o,3]),s=await t.run({input:r}),a=s.plate||Object.values(s)[0],d=a.dims||[1,et.maxPlateSlots,et.alphabet.length],f=d[d.length-1],c=d[d.length-2]*f,u=a.data,h=u.length>=c?u.slice(0,c):u;return rn(h)}const G="[A-Z]",U="[0-9]",ln=[{id:"LLDDDD",re:new RegExp(`^${G}{2}${U}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${U}{4}${G}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${U}{2}${G}{2}${U}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${G}{2}${U}{2}${G}{2}$`)}],cn={0:"O",1:"I",5:"S",8:"B"},un={O:"0",I:"1",L:"1",S:"5",B:"8"};function nt(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function B(t){const e=nt(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function dn(t){const e=nt(t);if(e.length!==6)return null;for(const n of ln)if(n.re.test(e))return n.id;return null}function vt(t,e){const n=nt(t).slice(0,6).split("");if(n.length!==6)return[];const o=[];function i(r,s,a){if(s>e)return;if(r===6){const c=a.join(""),u=dn(c);u&&o.push({plate:c,corrections:s,patternId:u});return}if(i(r+1,s,a),s>=e)return;const d=a[r],f=cn[d];if(f){const c=a.slice();c[r]=f,i(r+1,s+1,c)}const l=un[d];if(l){const c=a.slice();c[r]=l,i(r+1,s+1,c)}}return i(0,0,n),o.sort((r,s)=>r.corrections-s.corrections||s.plate.localeCompare(r.plate)),o}function Qt(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let o=0;for(let i=0;i<n;i+=1)o+=t[i]??0;return o/n}function fn(t,e=[],n={}){const o=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,r=nt(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:B(r),patternId:null,corrections:0,meanConfidence:Qt(e,r.length),reason:"too-short"};const s=r.slice(0,6),a=Qt(e,6),d=vt(s,0);if(d.length>0&&a>=o){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:B(c.plate),patternId:c.patternId,corrections:0,meanConfidence:a}}const f=vt(s,1).filter(c=>c.corrections===1);if(f.length>0&&a>=i){const c=f[0];return{accepted:!0,plate:c.plate,plateFormatted:B(c.plate),patternId:c.patternId,corrections:1,meanConfidence:a}}return vt(s,2).some(c=>c.corrections>1)&&d.length===0&&f.length===0?{accepted:!1,plate:s,plateFormatted:B(s),patternId:null,corrections:2,meanConfidence:a,reason:"excessive-corrections"}:d.length>0||f.length>0?{accepted:!1,plate:s,plateFormatted:B(s),patternId:null,corrections:d.length?0:1,meanConfidence:a,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:B(s),patternId:null,corrections:0,meanConfidence:a,reason:"no-reliable-pattern"}}const P="models",pn=1;let ot=null;function Ct(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):ot||(ot=new Promise((t,e)=>{const n=indexedDB.open(St,pn);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(P)||o.createObjectStore(P,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),ot)}async function te(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function mn(t){const e=await Ct();return new Promise((n,o)=>{const r=e.transaction(P,"readonly").objectStore(P).get(t);r.onsuccess=()=>{const s=r.result;n(s?.bytes||null)},r.onerror=()=>o(r.error)})}async function gn(t,e,n){const o=await Ct();return new Promise((i,r)=>{const s=o.transaction(P,"readwrite");s.objectStore(P).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}async function hn(){const t=await Ct();return new Promise((e,n)=>{const o=t.transaction(P,"readwrite");o.objectStore(P).clear(),o.oncomplete=()=>e(),o.onerror=()=>n(o.error)})}async function ee(t,e={}){const{onStatus:n,signal:o}=e,i=await mn(t.id).catch(()=>null);if(i&&await te(i)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await Wt({method:"GET",url:t.url,responseType:"arraybuffer",signal:o}),s=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const a=await te(s);if(a!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${a}`);return await gn(t.id,s,a).catch(()=>{}),{bytes:s,cacheHit:!1}}let z=null;async function bn(t={}){if(z)return{sessions:z,diagnostics:{provider:bt(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=Jt(),n=await ee(e.detector,t),o=await ee(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const i=await Zt(n.bytes),r=await Zt(o.bytes);return z={detector:i.session,ocr:r.session},{sessions:z,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function yn(){z=null}async function vn(t,e,n={}){const{signal:o}=n;let i=0,r;try{const a=await Fe(e);r=Ve(a).imageData,a.close?.()}catch{return null}const s=await on(t.detector,r);for(const a of s){if(o?.aborted)throw new DOMException("Aborted","AbortError");i+=1;const d=qe(r,a),f=await sn(t.ocr,d),l=fn(f.text,f.charProbs);if(l.accepted)return{plate:l.plate,plateFormatted:l.plateFormatted,detectionsTried:i}}return{plate:"",plateFormatted:"",detectionsTried:i}}async function Cn(t,e={}){const n=Date.now(),{onStatus:o,signal:i,request:r}=e,s=t.length,a=await bn({onStatus:o,signal:i}),{detector:d,ocr:f}=a.sessions;let l=0,c=0;for(let u=0;u<s;u+=1){if(i?.aborted)return it("cancelled",a.diagnostics,c,l,n);const h=t[u];o?.(`Downloading image ${u+1} of ${s}`);let m;try{m=await ze(h,{signal:i,request:r})}catch(y){if(i?.aborted||y?.name==="AbortError")return it("cancelled",a.diagnostics,c,l,n);o?.(`Failed to download image ${u+1} of ${s}, skipping…`);continue}o?.(`Scanning image ${u+1} of ${s}`),c+=1;let g;try{g=await vn({detector:d,ocr:f},m.bytes,{signal:i})}catch(y){if(i?.aborted||y?.name==="AbortError")return it("cancelled",a.diagnostics,c,l,n);continue}finally{m=null}if(g&&(l+=g.detectionsTried,g.plate))return{ok:!0,plate:g.plate,plateFormatted:g.plateFormatted,diagnostics:{provider:bt()||a.diagnostics.provider,detectorCacheHit:a.diagnostics.detectorCacheHit,ocrCacheHit:a.diagnostics.ocrCacheHit,imagesScanned:c,detectionsTried:l,elapsedMs:Date.now()-n}}}return it("no-reliable-plate",a.diagnostics,c,l,n)}function it(t,e,n,o,i){return{ok:!1,reason:t,diagnostics:{provider:bt()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-i}}}async function ne(t){return await Ue(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function wn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function xn({plate:t,phone:e}={}){const n=t==null?"":String(t).trim();if(n)return n;const o=e==null?"":String(e).trim();return o||wn()}function oe(t,{phone:e=""}={}){const n=t||{},o=e==null?"":String(e).trim(),i=n.plate==null?"":String(n.plate).trim(),s=[`ID: ${xn({plate:i,phone:o})}`,`Telefone: ${o}`,""];for(const d of dt){if(d==="url")continue;const f=Mt[d];let l=n[d]==null?"":String(n[d]);d==="customerValueEur"&&l&&!/€/.test(l)&&(l=`${l} €`),s.push(`${f}: ${l}`)}const a=n.url==null?"":String(n.url);return s.push(""),s.push(a),s.join(`
`)}function En(t){const e={source:t.source,vehicle:{plate:t.fields.plate,make:t.fields.make,model:t.fields.model,year:t.fields.year,mileageKm:t.fields.mileageKm,transmission:t.fields.transmission,fuel:t.fields.fuel,engine:t.fields.engine,powerCv:t.fields.powerCv},valuation:{paintParts:t.fields.paintParts,bodyParts:t.fields.bodyParts,tires:t.fields.tires,customerValueEur:t.fields.customerValueEur,saleReason:t.fields.saleReason,keyCount:t.fields.keyCount,deductibleVat:t.fields.deductibleVat},url:t.fields.url,origins:t.origins,metadata:t.metadata};return JSON.stringify(e,null,2)}const ie="valuationDefaults";async function Sn(t,e=null){return He(`${ct}${t}`,e)}async function Ln(t,e){await Ge(`${ct}${t}`,e)}async function re(){const t=await Sn(ie,null);return!t||typeof t!="object"?{...Y}:{...Y,...t}}async function Mn(t){const e={...Y,...t};return await Ln(ie,e),e}const An=5e3;function In(){let t=Lt(),e=null,n=null,o=null;function i(p){p&&e?.setCaptureStatus(p)}function r(){o!=null&&(clearTimeout(o),o=null)}function s(){r(),i("waiting"),o=setTimeout(()=>{o=null,u()},An)}function a(p){t={...t,statusMessage:p},e?.setStatus(p)}function d(p){t={...t,busy:p,view:p?"reading":t.listingRecord?"form":"idle"},e?.setBusy(p),p&&i("reading")}function f(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const p=t.lastDiagnostics;if(!p){e?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}e?.setDiagnostics(!0,[`Provider: ${p.provider||"n/a"}`,`Detector cache: ${p.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${p.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${p.imagesScanned??0}`,`Detections tried: ${p.detectionsTried??0}`,`Elapsed: ${p.elapsedMs??0} ms`].join(`
`))}function l(p,w,k){const I=[];return w.plate?I.push(`Plate found: ${w.plate}`):I.push("No reliable plate found."),w.phone&&I.push(`Phone: ${w.phone}`),(p.fields.make||p.fields.model)&&I.push(`Listing: ${[p.fields.make,p.fields.model].filter(Boolean).join(" ")}`.trim()),I.push(k?"Full text copied to clipboard":"Clipboard copy failed — use Copy full text"),I.join(`
`)}async function c(p){return t={...t,lastClipboard:p},e?.setCopyEnabled(!!p),ne(p)}async function u(){if(r(),t.busy)return;n=new AbortController;const{signal:p}=n;d(!0);try{const w=$e(),k=await re();a("Revealing phone (if available)…");const I=w.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:p});a("Extracting listing fields…");const $=w.extractListing(document);a("Looking for listing images…");const xt=await w.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:T,count:q}=xt;let R={ok:!1,reason:"no-images"};q>0?(a(`Found ${q} listing images — scanning…`),a("Loading plate recognition models…"),R=await Cn(T,{signal:p,onStatus:a}),t={...t,lastDiagnostics:R.diagnostics},f()):a("No listing images — checking phone…");const N=await I,O=R.ok&&R.plate?R.plate:"",D=N.ok?N.phone:"";if(p.aborted||R.reason==="cancelled"){a("Cancelled.");return}const F=le({extracted:$,plate:O,defaults:k});t={...t,lastPlate:O,lastPhone:D,listingRecord:F,view:"form"},e?.showListingForm(F);const Et=oe(F.fields,{phone:D}),st=await c(Et);st.ok&&i("text copied");let V=l(F,{plate:O,phone:D},st.ok);O&&!D&&N.reason==="timeout"?V+=`
Phone reveal timed out.`:O&&!D&&N.reason==="no-button"&&(V+=`
No phone button on this listing.`),q===0&&!D&&N.reason==="no-button"&&(V+=`
No listing images found.`),a(V)}catch(w){if(p.aborted){a("Cancelled.");return}const k=w instanceof Error?w.message:"Unknown recognition error";a(`Failed: ${k}`)}finally{n=null,d(!1)}}function h(){n?.abort()}async function m(){if(!t.lastClipboard){a("Nothing to copy yet.");return}const p=await ne(t.lastClipboard);p.ok&&(i("text copied"),e?.flashCopySuccess()),a(p.ok?"Copied to clipboard again.":"Clipboard copy failed.")}async function g(){if(!t.listingRecord){a("No listing to copy yet. Run Clip listing.");return}const p=oe(t.listingRecord.fields,{phone:t.lastPhone}),w=await c(p);w.ok&&i("text copied"),a(w.ok?"Full text copied to clipboard.":"Clipboard copy failed.")}async function y(){const p=t.listingRecord?.fields?.plate||t.lastPlate||"";if(!p){a("No plate to copy.");return}const w=await c(p);a(w.ok?`Plate copied: ${p}`:"Clipboard copy failed.")}async function C(){if(!t.listingRecord){a("No listing to copy yet. Run Clip listing.");return}const p=En(t.listingRecord),w=await c(p);a(w.ok?"JSON copied to clipboard.":"Clipboard copy failed.")}function v(p,w){if(!t.listingRecord)return;const k=ce(t.listingRecord,p,w);t={...t,listingRecord:k,lastPlate:p==="plate"?w:t.lastPlate}}async function x(){try{await hn(),yn(),a("Model cache cleared.")}catch(p){const w=p instanceof Error?p.message:"Failed to clear cache";a(w)}}function L(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},f(),a(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function M(){if(t.busy)return;const p=await re();t={...t,view:"settings"},e?.showSettingsForm(p),a(`Settings. Environment: production. Storage: ${ct}* / ${St}.`)}function A(){t={...t,view:t.listingRecord?"form":"idle"},t.listingRecord?(e?.showListingForm(t.listingRecord),a("Back to listing review.")):(e?.hideForm(),a("Settings closed."))}async function _(p){await Mn(p),a("Defaults saved.")}function rt(p=document.body){return e||(e=fe({onClipListing:u,onCancel:h,onCopyAgain:m,onClearModelCache:x,onToggleDiagnostics:L,onSettings:M,onFieldChange:v,onCopyFullText:g,onCopyPlateOnly:y,onCopyJson:C,onSettingsBack:A,onSaveDefaults:_}),e.mount(p),e.setMinimized(!0),s(),e)}function at(){r(),n?.abort(),n=null,e?.destroy(),e=null,t=Lt()}function wt(){return t}return{mount:rt,destroy:at,onClipListing:u,onCancel:h,onCopyAgain:m,onCopyFullText:g,onCopyPlateOnly:y,onCopyJson:C,onFieldChange:v,onClearModelCache:x,onToggleDiagnostics:L,onSettings:M,onSettingsBack:A,onSaveDefaults:_,getState:wt,setStatus:a}}function kn(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[ut])return{started:!1,reason:"already-initialized"};if(document.getElementById(X))return window[ut]=!0,{started:!1,reason:"panel-exists"};window[ut]=!0;const t=In(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}kn()})();
