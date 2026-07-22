// ==UserScript==
// @name         Vehicle Listing Clipper
// @namespace    https://github.com/andremafei/vehicle-listing-clipper
// @version      0.2.0
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
// @connect      cdn.jsdelivr.net
// @updateURL    https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @downloadURL  https://raw.githubusercontent.com/andremafei/vehicle-listing-clipper/main/dist/vehicle-listing-clipper.user.js
// @run-at       document-idle
// ==/UserScript==

(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();
(function(){"use strict";const lt="Vehicle Listing Clipper",j="vlc_prod_",ut="vehicle-listing-clipper",W="__VLC_PROD_INITIALIZED__",O="vlc-panel-root";function zt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",listingRecord:null,diagnosticsVisible:!1,lastDiagnostics:null}}const F={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},J=["plate","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],dt={plate:"Matrícula",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},ft=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Kt(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function jt(t={}){return{...F,...t}}function Wt({extracted:t=null,plate:e="",defaults:n={}}={}){const o=jt(n),i=Kt(),r={},s=[],a=[],p=[],d=[...t?.warnings||[]];function c(u,h,g){const m=h==null?"":String(h);if(i[u]=m,!m){r[u]="missing";return}r[u]=g,g==="extracted"||g==="anpr"?s.push(u):g==="default"&&a.push(u)}const l=e?String(e).trim():"";return c("plate",l,l?"anpr":"missing"),c("make",t?.make||"",t?.make?"extracted":"missing"),c("model",t?.model||"",t?.model?"extracted":"missing"),c("year",t?.year||"",t?.year?"extracted":"missing"),c("mileageKm",t?.mileageKm||"",t?.mileageKm?"extracted":"missing"),c("transmission",t?.transmission||"",t?.transmission?"extracted":"missing"),c("fuel",t?.fuel||"",t?.fuel?"extracted":"missing"),c("engine",t?.engine||"",t?.engine?"extracted":"missing"),c("powerCv",t?.powerCv||"",t?.powerCv?"extracted":"missing"),c("customerValueEur",t?.priceEur||"",t?.priceEur?"extracted":"missing"),c("url",t?.url||"",t?.url?"extracted":"missing"),c("paintParts",o.paintParts,"default"),c("bodyParts",o.bodyParts,"default"),c("tires",o.tires,"default"),c("saleReason",o.saleReason,"default"),c("keyCount",o.keyCount,"default"),c("deductibleVat",o.deductibleVat,"default"),{source:{siteId:t?.siteId||"olx-pt",url:i.url,listingId:t?.listingId||"",title:t?.title||"",description:t?.description||""},fields:i,origins:r,metadata:{extractedFields:[...new Set(s)],defaultedFields:[...new Set(a)],editedFields:p,warnings:d}}}function Jt(t,e,n){const o=n==null?"":String(n),i={...t.fields,[e]:o},r={...t.origins,[e]:o?"edited":"missing"},s=[...new Set([...t.metadata.editedFields||[],e])];return{...t,fields:i,origins:r,source:{...t.source,url:e==="url"?o:t.source.url},metadata:{...t.metadata,editedFields:s}}}function pt(t){switch(t){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Xt(t){let e=null;const n=new Map;let o="listing";function i(){return e||(e=document.createElement("div"),e.className="vlc-form",e.hidden=!0,e)}function r(){e&&(e.replaceChildren(),n.clear())}function s(u,h,g="missing"){const m=document.createElement("label");m.className=`vlc-field ${pt(g)}`,m.dataset.field=u;const y=document.createElement("span");y.className="vlc-field-label",y.textContent=dt[u]||u;const w=document.createElement("span");w.className="vlc-field-origin",w.textContent=g;const b=document.createElement("input");b.type="text",b.className="vlc-field-input",b.value=h??"",b.dataset.field=u,b.addEventListener("input",()=>{o==="listing"&&(t.onFieldChange(u,b.value),m.className=`vlc-field ${pt("edited")}`,w.textContent="edited")}),y.appendChild(w),m.append(y,b),n.set(u,b),e?.appendChild(m)}function a(){const u=document.createElement("div");u.className="vlc-form-actions";const h=document.createElement("button");h.type="button",h.className="vlc-btn vlc-btn-primary",h.textContent="Copy full text",h.addEventListener("click",()=>t.onCopyFullText());const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Copy plate only",g.addEventListener("click",()=>t.onCopyPlateOnly());const m=document.createElement("button");m.type="button",m.className="vlc-btn",m.textContent="Copy JSON",m.addEventListener("click",()=>t.onCopyJson()),u.append(h,g,m),e?.appendChild(u)}function p(u){o="listing",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Review listing",e.appendChild(h);for(const g of J)s(g,u.fields[g]||"",u.origins[g]||"missing");a()}function d(u){o="settings",i(),r(),e.hidden=!1;const h=document.createElement("div");h.className="vlc-form-heading",h.textContent="Default values",e.appendChild(h);for(const w of ft)s(w,u[w]||"","default");const g=document.createElement("div");g.className="vlc-form-actions";const m=document.createElement("button");m.type="button",m.className="vlc-btn vlc-btn-primary",m.textContent="Save defaults",m.addEventListener("click",()=>{const w={};for(const b of ft)w[b]=n.get(b)?.value??"";t.onSaveDefaults?.(w)});const y=document.createElement("button");y.type="button",y.className="vlc-btn",y.textContent="Back",y.addEventListener("click",()=>t.onBack?.()),g.append(m,y),e.appendChild(g)}function c(){e&&(e.hidden=!0)}function l(u){if(o==="listing")for(const h of J){const g=n.get(h);g&&document.activeElement!==g&&(g.value=u.fields[h]||"")}}return{ensureRoot:i,showListing:p,showSettings:d,syncListingValues:l,hide:c,getMode:()=>o,getElement:()=>i()}}const Yt=`
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

.vlc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
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
`;function Zt(t){let e=null,n=null,o=null,i=null,r=null,s=null;const a=Xt({onFieldChange:(b,C)=>t.onFieldChange(b,C),onCopyFullText:()=>t.onCopyFullText(),onCopyPlateOnly:()=>t.onCopyPlateOnly(),onCopyJson:()=>t.onCopyJson(),onBack:()=>t.onSettingsBack(),onSaveDefaults:b=>t.onSaveDefaults(b)});function p(b=document.body){if(document.getElementById(O))return e=document.getElementById(O),e;e=document.createElement("div"),e.id=O,e.setAttribute("data-vlc-panel","1");const C=e.attachShadow({mode:"open"}),x=document.createElement("style");x.textContent=Yt;const E=document.createElement("div");E.className="vlc-panel",E.setAttribute("role","region"),E.setAttribute("aria-label",lt);const f=document.createElement("div");f.className="vlc-header";const v=document.createElement("h1");v.className="vlc-title",v.textContent=lt,f.appendChild(v);const S=document.createElement("div");S.className="vlc-actions",i=d("Clip listing",()=>t.onClipListing()),r=d("Cancel",()=>t.onCancel()),r.disabled=!0,s=d("Copy again",()=>t.onCopyAgain()),s.disabled=!0;const A=d("Clear model cache",()=>t.onClearModelCache()),rt=d("Diagnostics",()=>t.onToggleDiagnostics()),st=d("Settings",()=>t.onSettings());S.append(i,r,s,A,rt,st),n=document.createElement("div"),n.className="vlc-status",n.setAttribute("aria-live","polite"),o=document.createElement("div"),o.className="vlc-diag",o.hidden=!0;const at=a.getElement();return E.append(f,S,n,o,at),C.append(x,E),b.appendChild(e),e}function d(b,C){const x=document.createElement("button");return x.type="button",x.className="vlc-btn",x.textContent=b,x.addEventListener("click",C),x}function c(b){n&&(n.textContent=b)}function l(b){i&&(i.disabled=!!b),r&&(r.disabled=!b)}function u(b){s&&(s.disabled=!b)}function h(b,C=""){o&&(o.hidden=!b,o.textContent=C)}function g(b){a.showListing(b)}function m(b){a.showSettings(b)}function y(){a.hide()}function w(){e?.remove(),e=null,n=null,o=null,i=null,r=null,s=null}return{mount:p,setStatus:c,setBusy:l,setCopyEnabled:u,setDiagnostics:h,showListingForm:g,showSettingsForm:m,hideForm:y,destroy:w}}const gt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",mt='#mainContent img[data-testid="swiper-image-lazy"]',ht="#mainContent div.swiper-wrapper img",bt=[gt,mt,ht],yt='#mainContent button[data-testid="ad-contact-phone"]',vt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Ct='#mainContent [data-testid="ad-parameters-container"]',wt='#mainContent [data-testid="ad-price-container"] h3',X='link#ssr_canonical[rel="canonical"]',xt='#mainContent [data-testid="offer_title"]',Et='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',St='script[type="application/ld+json"]';function Qt(t){return!!(t&&typeof t.click=="function")}function At(t){try{if(typeof getComputedStyle!="function")return null;const e=getComputedStyle(t);return{display:e.display||"",visibility:e.visibility||"",opacity:e.opacity||""}}catch{return null}}function M(t){try{const e=t.getBoundingClientRect();return Math.max(0,e.width)*Math.max(0,e.height)}catch{return 0}}function $(t){if(t.hidden)return!0;const n=At(t);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function B(t){if(!t||typeof t.getBoundingClientRect!="function"||$(t))return!1;if(typeof t.checkVisibility=="function")try{if(t.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(M(t)>0)return!0;const n=At(t);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Lt(t=document){return[...t.querySelectorAll(yt)].filter(e=>Qt(e))}function kt(t=document){const e=Lt(t);if(e.length===0)return null;if(e.length===1)return e[0];const n=e.filter(a=>!$(a)),i=[...n.length>0?n:e].sort((a,p)=>{const d=B(a)?1:0,c=B(p)?1:0;return d!==c?c-d:M(p)-M(a)}),r=(()=>{const a=i[0];return{visible:B(a)?1:0,area:M(a)}})(),s=i.filter(a=>(B(a)?1:0)===r.visible&&M(a)===r.area);return s[s.length-1]||i[i.length-1]||e[e.length-1]}function V(t=document){const e=[...t.querySelectorAll(vt)];for(const n of e){if(e.length>1&&$(n))continue;const i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}if(e.length>0){const n=e[e.length-1],i=(n.getAttribute("href")||"").match(/^tel:(\+?\d+)/i);if(i?.[1])return i[1];const r=(n.textContent||"").replace(/\D/g,"");if(r)return r}return null}function te(t){try{const e=Object.keys(t).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!e)return!1;const n=t[e];if(typeof n?.onClick!="function")return!1;const o={type:"click",target:t,currentTarget:t,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(o),!0}catch{return!1}}function ee(t){try{t.click()}catch{}te(t)}async function ne(t={}){const{root:e=document,timeoutMs:n=15e3,intervalMs:o=250,signal:i}=t,r=V(e);if(r)return{ok:!0,phone:r,clicked:!1,alreadyVisible:!0};const s=Lt(e);if(s.length===0)return{ok:!1,reason:"no-button"};if(i?.aborted)return{ok:!1,reason:"cancelled"};const a=kt(e),p=[];a&&p.push(a);for(const c of s)c!==a&&!$(c)&&p.push(c);const d=Date.now()+n;for(const c of p){if(i?.aborted)return{ok:!1,reason:"cancelled"};ee(c);const l=Math.min(d,Date.now()+5e3);for(;Date.now()<l;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const u=V(e);if(u)return{ok:!0,phone:u,clicked:!0,alreadyVisible:!1};await new Promise(h=>setTimeout(h,o))}}for(;Date.now()<d;){if(i?.aborted)return{ok:!1,reason:"cancelled"};const c=V(e);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(l=>setTimeout(l,o))}return{ok:!1,reason:"timeout"}}function oe(t){return t==null||t===""?"":String(t).replace(/[^\d]/g,"")||""}function ie(t){return t==null||t===""?"":typeof t=="number"&&Number.isFinite(t)?String(Math.round(t)):String(t).replace(/[^\d]/g,"")||""}function re(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase();return e?e.includes("manual")?"MANUAL":e.includes("auto")||e.includes("cvt")||e.includes("dsg")||e.includes("eat")?"AUTOMÁTICA":String(t).trim().toUpperCase():""}function se(t){if(t==null||t==="")return"";const e=String(t).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return e?e.includes("gasolina")||e.includes("gasoline")||e==="petrol"?"GASOLINA":e.includes("diesel")||e.includes("gasoleo")||e.includes("gásóleo")?"DIESEL":e.includes("eletr")||e.includes("electr")?"ELÉTRICO":e.includes("hibr")||e.includes("hybrid")?"HÍBRIDO":e.includes("gpl")||e.includes("lpg")||e.includes("gnv")?"GPL":String(t).trim().toUpperCase():""}function ae(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";const n=e.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const o=Number.parseInt(n,10);if(o>=100)return String(Number((o/1e3).toFixed(1)))}return e.replace(",",".")}function ce(t){if(t==null||t==="")return"";const e=String(t).trim();if(!e)return"";if(/\bcv\b/i.test(e)){const o=e.replace(/[^\d]/g,"");return o?`${o} CV`:e.toUpperCase().replace(/\s+/g," ")}const n=e.replace(/[^\d]/g,"");return n?`${n} CV`:e}function le(t){if(t==null||t==="")return"";const e=String(t).replace(/[^\d]/g,"");return e.length>=4?e.slice(0,4):e}function Rt(t){return t==null||t===""?"":String(t).trim().toUpperCase()}function Mt(t,e="https://www.olx.pt/"){if(t==null||t==="")return"";try{const n=new URL(String(t),e);let o=`${n.origin}${n.pathname}`;const r=o.toLowerCase().indexOf(".html");return r!==-1&&(o=o.slice(0,r+5)),o}catch{return""}}function ue(t){const e=new Map,n=t.querySelector(Ct);if(!n)return e;for(const o of n.querySelectorAll("p")){const i=(o.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const r=i.indexOf(":");if(r<=0)continue;const s=i.slice(0,r).trim().toLowerCase(),a=i.slice(r+1).trim();s&&a&&e.set(s,a)}return e}function de(t){const e=t.querySelectorAll(St);for(const n of e){const o=n.textContent||"";if(o.trim())try{const i=JSON.parse(o),r=Array.isArray(i)?i:[i];for(const s of r)if(s&&s["@type"]==="Vehicle")return s}catch{}}return null}function fe(t){const n=(t.querySelector?.(X)||(typeof document<"u"?document.querySelector(X):null))?.getAttribute?.("href")||"";return n?Mt(n):typeof location<"u"&&location?.href?Mt(location.href):""}function pe(t){const e=t.querySelectorAll(Et);for(const n of e){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function ge(t){return t?.brand?typeof t.brand=="string"?t.brand:typeof t.brand?.name=="string"?t.brand.name:"":""}function me(t,e){return e?.sku!=null&&String(e.sku).trim()?String(e.sku).trim():String(t).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function he(t=document){const e=[],n=[];function o(E,f){f&&e.push(E)}const i=ue(t),r=de(t),s=fe(t);o("url",s);const a=me(s,r);o("listingId",a);const d=(t.querySelector(xt)?.textContent||r?.name||"").replace(/\s+/g," ").trim();o("title",d);const c=String(r?.description||"").replace(/\s+/g," ").trim();o("description",c);let l=ge(r);l||(l=pe(t)),l=Rt(l),o("make",l);let u=i.get("modelo")||r?.model||"";u=Rt(u),o("model",u);let h=i.get("ano")||r?.productionDate||r?.modelDate||"";h=le(h),o("year",h);const g=oe(i.get("quilómetros")||i.get("quilometros")||"");o("mileageKm",g);const m=re(i.get("tipo de caixa")||"");o("transmission",m);const y=se(i.get("combustível")||i.get("combustivel")||"");o("fuel",y);const w=ae(i.get("cilindrada")||"");o("engine",w);const b=ce(i.get("potência")||i.get("potencia")||"");o("powerCv",b);let C=r?.offers?.price;(C==null||C==="")&&(C=t.querySelector(wt)?.textContent||"");const x=ie(C);return o("priceEur",x),(!l||!u)&&n.push("missing-make-or-model"),s||n.push("missing-url"),{siteId:"olx-pt",url:s,listingId:a,title:d,description:c,make:l,model:u,year:h,mileageKm:g,transmission:m,fuel:y,engine:w,powerCv:b,priceEur:x,extractedFields:[...new Set(e)],warnings:n}}function be(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],i=n[1];let r=null;return i&&/^\d+w$/i.test(i)&&(r=Number.parseInt(i,10)),{url:o,width:r}}).filter(e=>!!e.url)}function ye(t){const e=be(t);if(e.length===0)return null;const n=e.filter(i=>typeof i.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let i=1;i<n.length;i+=1)n[i].width>o.width&&(o=n[i]);return o.url}function ve(t){if(!t)return null;const e=ye(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function Ce(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function It(t=document){for(const e of bt){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function Y(t=document){const{images:e,selectorUsed:n}=It(t),o=[],i=new Set;for(const r of e){const s=ve(r);if(!s)continue;const a=Ce(s);i.has(a)||(i.add(a),o.push(a))}return{urls:o,count:o.length,selectorUsed:n}}async function we(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let i=Y(e);if(i.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const s=Date.now()+n;for(;i.count===0&&Date.now()<s;)await new Promise(a=>setTimeout(a,o)),i=Y(e);return i}const Pt={siteId:"olx-pt",discoverListingImages:Y,discoverListingImagesWithWait:we,queryGalleryImages:It,extractListing:he,findPhoneRevealButton:kt,readRevealedPhone:V,revealContactPhone:ne,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:gt,FALLBACK_TESTID_SELECTOR:mt,FALLBACK_SWIPER_IMG_SELECTOR:ht,GALLERY_SELECTORS:bt,PHONE_REVEAL_BUTTON_SELECTOR:yt,CONTACT_PHONE_SELECTOR:vt,AD_PARAMETERS_SELECTOR:Ct,AD_PRICE_SELECTOR:wt,CANONICAL_LINK_SELECTOR:X,OFFER_TITLE_SELECTOR:xt,BREADCRUMB_ITEM_SELECTOR:Et,JSON_LD_SELECTOR:St}},Tt=new Map;function xe(t){Tt.set(t.siteId,t)}function Ee(t){return Tt.get(t)}function Se(){return Ee("olx-pt")||Pt}xe(Pt);async function Ae(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const i of n)try{const r=new Blob([t],{type:i});return await createImageBitmap(r)}catch(r){o=r}try{const i=new Blob([t]);return await createImageBitmap(i)}catch(i){throw o||i}}function Le(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const o=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:o,width:e.width,height:e.height}}const Z=new Map;function Q(){return typeof GM<"u"&&GM!=null}async function ke(t,e=null){return typeof GM_getValue=="function"?GM_getValue(t,e):Q()&&typeof GM.getValue=="function"?GM.getValue(t,e):Z.has(t)?Z.get(t):e}async function Re(t,e){if(typeof GM_setValue=="function"){GM_setValue(t,e);return}if(Q()&&typeof GM.setValue=="function"){await GM.setValue(t,e);return}Z.set(t,e)}async function Me(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(Q()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function Dt(t){const{method:e,url:n,responseType:o="arraybuffer",headers:i,signal:r}=t;return new Promise((s,a)=>{if(r?.aborted){a(new DOMException("Aborted","AbortError"));return}let p=null;const d=()=>{try{p?.abort?.()}catch{}a(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",d,{once:!0}),(l=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){p=GM.xmlHttpRequest(l);return}if(typeof GM_xmlhttpRequest=="function"){p=GM_xmlhttpRequest(l);return}a(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:i,onload(l){r?.removeEventListener("abort",d);const u=l.status;if(u<200||u>=300){a(new Error(`HTTP ${u} for ${n}`));return}s(l.response)},onerror(){r?.removeEventListener("abort",d),a(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",d),a(new Error(`Timeout for ${n}`))}})})}async function Ie(t,e={}){const{signal:n,request:o=Dt}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await o({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:i}}function Pe(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),o=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),i=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),s=Math.max(1,i-n),a=Math.max(1,r-o),p=document.createElement("canvas");p.width=t.width,p.height=t.height;const d=p.getContext("2d");return d.putImageData(t,0,0),d.getImageData(n,o,s,a)}function Te(t,e,n){const o=document.createElement("canvas");o.width=t.width,o.height=t.height,o.getContext("2d").putImageData(t,0,0);const i=document.createElement("canvas");i.width=n,i.height=e;const r=i.getContext("2d");r.drawImage(o,0,0,n,e);const{data:s}=r.getImageData(0,0,n,e),a=new Uint8Array(1*e*n*3);let p=0;for(let d=0;d<e*n;d+=1)a[p++]=s[d*4],a[p++]=s[d*4+1],a[p++]=s[d*4+2];return a}function De(t,e,n=[114,114,114]){const{width:o,height:i}=t,r=Math.min(e/i,e/o),s=Math.round(o*r),a=Math.round(i*r),p=(e-s)/2,d=(e-a)/2,c=Math.round(d-.1),l=Math.round(p-.1),u=document.createElement("canvas");u.width=o,u.height=i,u.getContext("2d").putImageData(t,0,0);const g=document.createElement("canvas");g.width=e,g.height=e;const m=g.getContext("2d");m.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,m.fillRect(0,0,e,e),m.drawImage(u,0,0,o,i,l,c,s,a);const y=m.getImageData(0,0,e,e).data,w=new Float32Array(3*e*e),b=e*e;for(let C=0;C<b;C+=1){const x=y[C*4],E=y[C*4+1],f=y[C*4+2];w[C]=x/255,w[b+C]=E/255,w[2*b+C]=f/255}return{tensor:w,ratio:r,pad:{dw:p,dh:d},size:e}}function _e(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Ne="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Oe="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Fe="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",$e="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function _t(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Ne},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Oe,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Fe},ortWasmBaseUrl:$e}}const G={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Nt=null;function Be(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function tt(){const t=Be();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Ot=new Proxy({},{get(t,e){return tt()[e]}});function Ve(){const t=tt(),e=_t();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function Ft(t,e={}){Ve();const n=tt(),o=e.prefer||["webgpu","wasm"],i=[];for(const r of o)try{const s=await n.InferenceSession.create(t,{executionProviders:[r]});return Nt=r,{session:s,provider:r}}catch(s){i.push(`${r}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function et(){return Nt}const nt=384,Ge="images",He="output0";async function Ue(t,e,n={}){const o=n.confThresh??.4,{tensor:i,ratio:r,pad:s}=De(e,nt),a=new Ot.Tensor("float32",i,[1,3,nt,nt]),p=await t.run({[Ge]:a}),d=p[He]||Object.values(p)[0];if(!d)return[];const c=d.data,l=d.dims||[],u=l.length>=2?l[l.length-1]:7,h=Math.floor(c.length/u),g=[];for(let m=0;m<h;m+=1){const y=m*u,w=c[y+1],b=c[y+2],C=c[y+3],x=c[y+4],E=c[y+5],f=c[y+6];if(f<o)continue;const v=_e({x1:w,y1:b,x2:C,y2:x},r,s);g.push({...v,score:Number(f),classId:Number(E)})}return g.sort((m,y)=>y.score-m.score),g}function qe(t,e,n=G){const o=n.alphabet,i=n.maxPlateSlots,r=o.length,s=t,a=[],p=[];for(let c=0;c<i;c+=1){let l=0,u=-1/0;for(let h=0;h<r;h+=1){const g=Number(s[c*r+h]);g>u&&(u=g,l=h)}a.push(o[l]),p.push(u)}let d=a.join("");return n.padChar&&(d=d.replace(new RegExp(`${ze(n.padChar)}+$`),"")),{text:d,charProbs:p.slice(0,Math.max(d.length,1))}}function ze(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Ke(t,e){const{imgHeight:n,imgWidth:o}=G,i=Te(e,n,o),r=new Ot.Tensor("uint8",i,[1,n,o,3]),s=await t.run({input:r}),a=s.plate||Object.values(s)[0],p=a.dims||[1,G.maxPlateSlots,G.alphabet.length],d=p[p.length-1],l=p[p.length-2]*d,u=a.data,h=u.length>=l?u.slice(0,l):u;return qe(h)}const I="[A-Z]",P="[0-9]",je=[{id:"LLDDDD",re:new RegExp(`^${I}{2}${P}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${P}{4}${I}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${P}{2}${I}{2}${P}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${I}{2}${P}{2}${I}{2}$`)}],We={0:"O",1:"I",5:"S",8:"B"},Je={O:"0",I:"1",L:"1",S:"5",B:"8"};function H(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function k(t){const e=H(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function Xe(t){const e=H(t);if(e.length!==6)return null;for(const n of je)if(n.re.test(e))return n.id;return null}function ot(t,e){const n=H(t).slice(0,6).split("");if(n.length!==6)return[];const o=[];function i(r,s,a){if(s>e)return;if(r===6){const l=a.join(""),u=Xe(l);u&&o.push({plate:l,corrections:s,patternId:u});return}if(i(r+1,s,a),s>=e)return;const p=a[r],d=We[p];if(d){const l=a.slice();l[r]=d,i(r+1,s+1,l)}const c=Je[p];if(c){const l=a.slice();l[r]=c,i(r+1,s+1,l)}}return i(0,0,n),o.sort((r,s)=>r.corrections-s.corrections||s.plate.localeCompare(r.plate)),o}function $t(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let o=0;for(let i=0;i<n;i+=1)o+=t[i]??0;return o/n}function Ye(t,e=[],n={}){const o=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,r=H(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:k(r),patternId:null,corrections:0,meanConfidence:$t(e,r.length),reason:"too-short"};const s=r.slice(0,6),a=$t(e,6),p=ot(s,0);if(p.length>0&&a>=o){const l=p[0];return{accepted:!0,plate:l.plate,plateFormatted:k(l.plate),patternId:l.patternId,corrections:0,meanConfidence:a}}const d=ot(s,1).filter(l=>l.corrections===1);if(d.length>0&&a>=i){const l=d[0];return{accepted:!0,plate:l.plate,plateFormatted:k(l.plate),patternId:l.patternId,corrections:1,meanConfidence:a}}return ot(s,2).some(l=>l.corrections>1)&&p.length===0&&d.length===0?{accepted:!1,plate:s,plateFormatted:k(s),patternId:null,corrections:2,meanConfidence:a,reason:"excessive-corrections"}:p.length>0||d.length>0?{accepted:!1,plate:s,plateFormatted:k(s),patternId:null,corrections:p.length?0:1,meanConfidence:a,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:k(s),patternId:null,corrections:0,meanConfidence:a,reason:"no-reliable-pattern"}}const L="models",Ze=1;let U=null;function it(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):U||(U=new Promise((t,e)=>{const n=indexedDB.open(ut,Ze);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(L)||o.createObjectStore(L,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),U)}async function Bt(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function Qe(t){const e=await it();return new Promise((n,o)=>{const r=e.transaction(L,"readonly").objectStore(L).get(t);r.onsuccess=()=>{const s=r.result;n(s?.bytes||null)},r.onerror=()=>o(r.error)})}async function tn(t,e,n){const o=await it();return new Promise((i,r)=>{const s=o.transaction(L,"readwrite");s.objectStore(L).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>i(),s.onerror=()=>r(s.error)})}async function en(){const t=await it();return new Promise((e,n)=>{const o=t.transaction(L,"readwrite");o.objectStore(L).clear(),o.oncomplete=()=>e(),o.onerror=()=>n(o.error)})}async function Vt(t,e={}){const{onStatus:n,signal:o}=e,i=await Qe(t.id).catch(()=>null);if(i&&await Bt(i)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await Dt({method:"GET",url:t.url,responseType:"arraybuffer",signal:o}),s=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const a=await Bt(s);if(a!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${a}`);return await tn(t.id,s,a).catch(()=>{}),{bytes:s,cacheHit:!1}}let T=null;async function nn(t={}){if(T)return{sessions:T,diagnostics:{provider:et(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=_t(),n=await Vt(e.detector,t),o=await Vt(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const i=await Ft(n.bytes),r=await Ft(o.bytes);return T={detector:i.session,ocr:r.session},{sessions:T,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function on(){T=null}async function rn(t,e,n={}){const{signal:o}=n;let i=0,r;try{const a=await Ae(e);r=Le(a).imageData,a.close?.()}catch{return null}const s=await Ue(t.detector,r);for(const a of s){if(o?.aborted)throw new DOMException("Aborted","AbortError");i+=1;const p=Pe(r,a),d=await Ke(t.ocr,p),c=Ye(d.text,d.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,detectionsTried:i}}return{plate:"",plateFormatted:"",detectionsTried:i}}async function sn(t,e={}){const n=Date.now(),{onStatus:o,signal:i,request:r}=e,s=t.length,a=await nn({onStatus:o,signal:i}),{detector:p,ocr:d}=a.sessions;let c=0,l=0;for(let u=0;u<s;u+=1){if(i?.aborted)return q("cancelled",a.diagnostics,l,c,n);const h=t[u];o?.(`Downloading image ${u+1} of ${s}`);let g;try{g=await Ie(h,{signal:i,request:r})}catch(y){if(i?.aborted||y?.name==="AbortError")return q("cancelled",a.diagnostics,l,c,n);o?.(`Failed to download image ${u+1} of ${s}, skipping…`);continue}o?.(`Scanning image ${u+1} of ${s}`),l+=1;let m;try{m=await rn({detector:p,ocr:d},g.bytes,{signal:i})}catch(y){if(i?.aborted||y?.name==="AbortError")return q("cancelled",a.diagnostics,l,c,n);continue}finally{g=null}if(m&&(c+=m.detectionsTried,m.plate))return{ok:!0,plate:m.plate,plateFormatted:m.plateFormatted,diagnostics:{provider:et()||a.diagnostics.provider,detectorCacheHit:a.diagnostics.detectorCacheHit,ocrCacheHit:a.diagnostics.ocrCacheHit,imagesScanned:l,detectionsTried:c,elapsedMs:Date.now()-n}}}return q("no-reliable-plate",a.diagnostics,l,c,n)}function q(t,e,n,o,i){return{ok:!1,reason:t,diagnostics:{provider:et()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-i}}}async function Gt(t){return await Me(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Ht(t){const e=t||{},n=[];for(const i of J){if(i==="url")continue;const r=dt[i];let s=e[i]==null?"":String(e[i]);i==="customerValueEur"&&s&&!/€/.test(s)&&(s=`${s} €`),n.push(`${r}: ${s}`)}const o=e.url==null?"":String(e.url);return n.push(""),n.push(o),n.join(`
`)}function an(t){const e={source:t.source,vehicle:{plate:t.fields.plate,make:t.fields.make,model:t.fields.model,year:t.fields.year,mileageKm:t.fields.mileageKm,transmission:t.fields.transmission,fuel:t.fields.fuel,engine:t.fields.engine,powerCv:t.fields.powerCv},valuation:{paintParts:t.fields.paintParts,bodyParts:t.fields.bodyParts,tires:t.fields.tires,customerValueEur:t.fields.customerValueEur,saleReason:t.fields.saleReason,keyCount:t.fields.keyCount,deductibleVat:t.fields.deductibleVat},url:t.fields.url,origins:t.origins,metadata:t.metadata};return JSON.stringify(e,null,2)}const Ut="valuationDefaults";async function cn(t,e=null){return ke(`${j}${t}`,e)}async function ln(t,e){await Re(`${j}${t}`,e)}async function qt(){const t=await cn(Ut,null);return!t||typeof t!="object"?{...F}:{...F,...t}}async function un(t){const e={...F,...t};return await ln(Ut,e),e}function dn(){let t=zt(),e=null,n=null;function o(f){t={...t,statusMessage:f},e?.setStatus(f)}function i(f){t={...t,busy:f,view:f?"reading":t.listingRecord?"form":"idle"},e?.setBusy(f)}function r(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const f=t.lastDiagnostics;if(!f){e?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}e?.setDiagnostics(!0,[`Provider: ${f.provider||"n/a"}`,`Detector cache: ${f.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${f.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${f.imagesScanned??0}`,`Detections tried: ${f.detectionsTried??0}`,`Elapsed: ${f.elapsedMs??0} ms`].join(`
`))}function s(f,v,S){const A=[];return v.plate?A.push(`Plate found: ${v.plate}`):A.push("No reliable plate found."),v.phone&&A.push(`Phone: ${v.phone}`),(f.fields.make||f.fields.model)&&A.push(`Listing: ${[f.fields.make,f.fields.model].filter(Boolean).join(" ")}`.trim()),A.push(S?"Full text copied to clipboard":"Clipboard copy failed — use Copy full text"),A.join(`
`)}async function a(f){return t={...t,lastClipboard:f},e?.setCopyEnabled(!!f),Gt(f)}async function p(){if(t.busy)return;n=new AbortController;const{signal:f}=n;i(!0);try{const v=Se(),S=await qt();o("Revealing phone (if available)…");const A=v.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,signal:f});o("Extracting listing fields…");const rt=v.extractListing(document);o("Looking for listing images…");const st=await v.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:at,count:ct}=st;let R={ok:!1,reason:"no-images"};ct>0?(o(`Found ${ct} listing images — scanning…`),o("Loading plate recognition models…"),R=await sn(at,{signal:f,onStatus:o}),t={...t,lastDiagnostics:R.diagnostics},r()):o("No listing images — checking phone…");const D=await A,_=R.ok&&R.plate?R.plate:"",N=D.ok?D.phone:"";if(f.aborted||R.reason==="cancelled"){o("Cancelled.");return}const z=Wt({extracted:rt,plate:_,defaults:S});t={...t,lastPlate:_,lastPhone:N,listingRecord:z,view:"form"},e?.showListingForm(z);const pn=Ht(z.fields),gn=await a(pn);let K=s(z,{plate:_,phone:N},gn.ok);_&&!N&&D.reason==="timeout"?K+=`
Phone reveal timed out.`:_&&!N&&D.reason==="no-button"&&(K+=`
No phone button on this listing.`),ct===0&&!N&&D.reason==="no-button"&&(K+=`
No listing images found.`),o(K)}catch(v){if(f.aborted){o("Cancelled.");return}const S=v instanceof Error?v.message:"Unknown recognition error";o(`Failed: ${S}`)}finally{n=null,i(!1)}}function d(){n?.abort()}async function c(){if(!t.lastClipboard){o("Nothing to copy yet.");return}const f=await Gt(t.lastClipboard);o(f.ok?"Copied to clipboard again.":"Clipboard copy failed.")}async function l(){if(!t.listingRecord){o("No listing to copy yet. Run Clip listing.");return}const f=Ht(t.listingRecord.fields),v=await a(f);o(v.ok?"Full text copied to clipboard.":"Clipboard copy failed.")}async function u(){const f=t.listingRecord?.fields?.plate||t.lastPlate||"";if(!f){o("No plate to copy.");return}const v=await a(f);o(v.ok?`Plate copied: ${f}`:"Clipboard copy failed.")}async function h(){if(!t.listingRecord){o("No listing to copy yet. Run Clip listing.");return}const f=an(t.listingRecord),v=await a(f);o(v.ok?"JSON copied to clipboard.":"Clipboard copy failed.")}function g(f,v){if(!t.listingRecord)return;const S=Jt(t.listingRecord,f,v);t={...t,listingRecord:S,lastPlate:f==="plate"?v:t.lastPlate}}async function m(){try{await en(),on(),o("Model cache cleared.")}catch(f){const v=f instanceof Error?f.message:"Failed to clear cache";o(v)}}function y(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},r(),o(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function w(){if(t.busy)return;const f=await qt();t={...t,view:"settings"},e?.showSettingsForm(f),o(`Settings. Environment: production. Storage: ${j}* / ${ut}.`)}function b(){t={...t,view:t.listingRecord?"form":"idle"},t.listingRecord?(e?.showListingForm(t.listingRecord),o("Back to listing review.")):(e?.hideForm(),o("Settings closed."))}async function C(f){await un(f),o("Defaults saved.")}function x(f=document.body){return e||(e=Zt({onClipListing:p,onCancel:d,onCopyAgain:c,onClearModelCache:m,onToggleDiagnostics:y,onSettings:w,onFieldChange:g,onCopyFullText:l,onCopyPlateOnly:u,onCopyJson:h,onSettingsBack:b,onSaveDefaults:C}),e.mount(f),e)}function E(){return t}return{mount:x,onClipListing:p,onCancel:d,onCopyAgain:c,onCopyFullText:l,onCopyPlateOnly:u,onCopyJson:h,onFieldChange:g,onClearModelCache:m,onToggleDiagnostics:y,onSettings:w,onSettingsBack:b,onSaveDefaults:C,getState:E,setStatus:o}}function fn(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[W])return{started:!1,reason:"already-initialized"};if(document.getElementById(O))return window[W]=!0,{started:!1,reason:"panel-exists"};window[W]=!0;const t=dn(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}fn()})();
