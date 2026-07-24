(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();
(function(){"use strict";const Ze="Vehicle Listing Clipper",Te="vlc_prod_",At="vehicle-listing-clipper",Je="__VLC_PROD_INITIALIZED__",Re="vlc-panel-root";function _t(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,plateImageIndex:null,plateImageUrl:"",diagnosticsVisible:!1,lastDiagnostics:null}}const Ne={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},Xe=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Pt={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},Tt=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function na(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function aa(e={}){return{...Ne,...e}}function ia({extracted:e=null,plate:t="",defaults:n={},plateImage:a=null}={}){const i=aa(n),o=na(),r={},l=[],d=[],u=[],m=[...e?.warnings||[]];function c(x,f,h){const p=f==null?"":String(f);if(o[x]=p,!p){r[x]="missing";return}r[x]=h,h==="extracted"||h==="anpr"?l.push(x):h==="default"&&d.push(x)}const g=t?String(t).trim():"";c("plate",g,g?"anpr":"missing");const b=e?.clientName?String(e.clientName).trim():"";c("clientName",b,b?"extracted":"missing"),c("make",e?.make||"",e?.make?"extracted":"missing"),c("model",e?.model||"",e?.model?"extracted":"missing"),c("year",e?.year||"",e?.year?"extracted":"missing"),c("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),c("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),c("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),c("engine",e?.engine||"",e?.engine?"extracted":"missing"),c("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),c("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),c("url",e?.url||"",e?.url?"extracted":"missing"),c("paintParts",i.paintParts,"default"),c("bodyParts",i.bodyParts,"default"),c("tires",i.tires,"default"),c("saleReason",i.saleReason,"default"),c("keyCount",i.keyCount,"default"),c("deductibleVat",i.deductibleVat,"default");const E=a&&typeof a.index=="number"&&Number.isFinite(a.index)&&a.index>0?Math.floor(a.index):null,v=a&&typeof a.url=="string"?a.url.trim():"";return{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:o.clientName||e?.clientName||""},fields:o,origins:r,metadata:{extractedFields:[...new Set(l)],defaultedFields:[...new Set(d)],editedFields:u,warnings:m,plateImageIndex:E,plateImageUrl:v}}}function Rt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(i=>i&&i!=="url"):!1}function oa(e,t,n){const a=n==null?"":String(n),i={...e.fields,[t]:a},o={...e.origins,[t]:a?"edited":"missing"},r=[...new Set([...e.metadata.editedFields||[],t])];return{...e,fields:i,origins:o,source:{...e.source,url:t==="url"?a:e.source.url,clientName:t==="clientName"?a:e.source.clientName},metadata:{...e.metadata,editedFields:r}}}function Nt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function ra(e){let t=null;const n=new Map;let a="listing";function i(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function o(){t&&(t.replaceChildren(),n.clear())}function r(b,E,v="missing",x,f={}){const h=document.createElement("label");h.className=`vlc-field ${Nt(v)}`,h.dataset.field=b;const p=document.createElement("span");p.className="vlc-field-label";const L=document.createElement("span");L.className="vlc-field-label-text",L.textContent=x||Pt[b]||b;const S=document.createElement("span");S.className="vlc-field-origin",S.textContent=v;const I=document.createElement("span");if(I.className="vlc-field-label-meta",I.appendChild(S),b==="plate"&&f.plateImageIndex!=null&&f.plateImageIndex>0){const k=document.createElement("span");if(k.className="vlc-plate-image-badge",k.textContent=`img ${f.plateImageIndex}`,k.title=`Placa encontrada na imagem ${f.plateImageIndex}`,I.appendChild(k),f.plateImageUrl){const P=document.createElement("button");P.type="button",P.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",P.title=`Ver imagem ${f.plateImageIndex}`,P.setAttribute("aria-label",`Ver imagem ${f.plateImageIndex} da placa`),P.innerHTML=l,P.addEventListener("mousedown",A=>{A.preventDefault()}),P.addEventListener("click",A=>{A.preventDefault(),A.stopPropagation(),e.onPreviewPlateImage?.()}),I.appendChild(P)}}const w=document.createElement("input");w.type="text",w.className="vlc-field-input",w.value=E??"",w.dataset.field=b,w.addEventListener("input",()=>{a==="listing"&&(e.onFieldChange(b,w.value),h.className=`vlc-field ${Nt("edited")}`,S.textContent="edited")}),p.append(L,I),h.append(p,w),n.set(b,w),t?.appendChild(h)}const l='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>';function d(){const b=document.createElement("div");b.className="vlc-form-actions";const E=document.createElement("button");E.type="button",E.className="vlc-btn vlc-btn-primary",E.textContent="Copy full text",E.addEventListener("click",()=>e.onCopyFullText());const v=document.createElement("button");v.type="button",v.className="vlc-btn",v.textContent="Copy plate only",v.addEventListener("click",()=>e.onCopyPlateOnly()),b.append(E,v),t?.appendChild(b)}function u(b,{phone:E="",plateImageIndex:v=null,plateImageUrl:x=""}={}){a="listing",i(),o(),t.hidden=!1;const f=document.createElement("div");f.className="vlc-form-heading",f.textContent="Review listing",t.appendChild(f);const h=E==null?"":String(E).trim();r("phone",h,h?"extracted":"missing","Telefone");for(const p of Xe){let L=b.fields[p]||"",S=b.origins[p]||"missing";p==="clientName"&&!L&&b.source?.clientName&&(L=String(b.source.clientName),S="extracted");const I=p==="plate"?{plateImageIndex:v??b.metadata?.plateImageIndex??null,plateImageUrl:x||b.metadata?.plateImageUrl||""}:{};r(p,L,S,void 0,I)}d()}function m(b){a="settings",i(),o(),t.hidden=!1;const E=document.createElement("div");E.className="vlc-form-heading",E.textContent="Default values",t.appendChild(E);for(const h of Tt)r(h,b[h]||"","default");const v=document.createElement("div");v.className="vlc-form-actions";const x=document.createElement("button");x.type="button",x.className="vlc-btn vlc-btn-primary",x.textContent="Save defaults",x.addEventListener("click",()=>{const h={};for(const p of Tt)h[p]=n.get(p)?.value??"";e.onSaveDefaults?.(h)});const f=document.createElement("button");f.type="button",f.className="vlc-btn",f.textContent="Back",f.addEventListener("click",()=>e.onBack?.()),v.append(x,f),t.appendChild(v)}function c(){t&&(t.hidden=!0)}function g(b,{phone:E}={}){if(a==="listing"){if(E!==void 0){const v=n.get("phone");v&&document.activeElement!==v&&(v.value=E==null?"":String(E))}for(const v of Xe){const x=n.get(v);if(x&&document.activeElement!==x){let f=b.fields[v]||"";v==="clientName"&&!f&&b.source?.clientName&&(f=String(b.source.clientName)),x.value=f}}}}return{ensureRoot:i,showListing:u,showSettings:m,syncListingValues:g,hide:c,getMode:()=>a,getElement:()=>i()}}const la=`
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

.vlc-plate-image-meta {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: -1px;
}

.vlc-plate-image-index {
  box-sizing: border-box;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  line-height: 1;
  border: 1px solid #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-btn-plate-preview {
  width: 18px;
  height: 18px;
  min-width: 18px;
  padding: 0;
  border-radius: 4px;
  border-color: #4b5563;
  background: #1f2937;
  color: #d1d5db;
}

.vlc-btn-plate-preview:hover {
  background: #374151;
  color: #f9fafb;
}

.vlc-panel--minimized .vlc-btn-plate-preview {
  width: 16px;
  height: 16px;
  min-width: 16px;
}

.vlc-icon-sm {
  width: 12px;
  height: 12px;
}

.vlc-field-label-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.vlc-plate-image-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: lowercase;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #059669;
  background: #064e3b;
  color: #6ee7b7;
}

.vlc-field .vlc-btn-plate-preview {
  width: 22px;
  height: 22px;
}

.vlc-plate-preview-overlay {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.vlc-plate-preview-overlay[hidden] {
  display: none !important;
}

.vlc-plate-preview-backdrop {
  appearance: none;
  position: absolute;
  inset: 0;
  border: 0;
  margin: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.72);
  cursor: pointer;
}

.vlc-plate-preview-dialog {
  position: relative;
  z-index: 1;
  width: min(920px, calc(100vw - 48px));
  max-height: min(86vh, 900px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: 12px;
  background: #111827;
  border: 1px solid #374151;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.55);
  box-sizing: border-box;
}

.vlc-plate-preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.vlc-plate-preview-caption {
  font-size: 13px;
  font-weight: 700;
  color: #f9fafb;
}

.vlc-plate-preview-img {
  display: block;
  width: 100%;
  max-height: min(72vh, 780px);
  object-fit: contain;
  border-radius: 8px;
  background: #0b1220;
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
`,sa="Alt+C",ca="⌥C";function da(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function ua(e){let t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,m=null,c=null,g=null,b=null,E=null,v=null,x=null,f=null,h=null,p=null,L=null,S=null,I=null,w=!0,k="waiting",P=!1,A=null,N="",B=null,Z=0,j=0,D=null;const U=da()?ca:sa;function J(y){return`${y} (${U})`}const O=ra({onFieldChange:(y,_)=>e.onFieldChange(y,_),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:y=>e.onSaveDefaults(y),onPreviewPlateImage:()=>St()}),s='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',C='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>',T='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',$='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>';function R(){i&&(i.textContent=w?k:Ze)}function V(){!n||!I||(n.classList.toggle("vlc-panel--minimized",w),I.innerHTML=w?s:C,I.setAttribute("aria-label",w?"Expand panel":"Minimize panel"),I.title=w?"Expand":"Minimize",R())}function z(y){w=!!y,V()}function X(){z(!w)}function F(y){k=y,n?.classList.toggle("vlc-panel--ready",String(y).toLowerCase()==="ready to copy"),R()}function K(){u&&(u.disabled=!P),m&&(m.disabled=!P)}function H(y,_){if(!n)return;const M=n.getBoundingClientRect(),Q=Math.max(0,window.innerWidth-M.width),W=Math.max(0,window.innerHeight-M.height),ee=Math.min(Math.max(0,y),Q),se=Math.min(Math.max(0,_),W);n.style.left=`${ee}px`,n.style.top=`${se}px`,n.style.right="auto",n.style.bottom="auto"}function ue(y){if(!n||!a||y.target?.closest("button")||y.button!==0)return;const M=n.getBoundingClientRect();B=y.pointerId,Z=y.clientX-M.left,j=y.clientY-M.top,a.classList.add("vlc-header--dragging"),a.setPointerCapture(y.pointerId),y.preventDefault()}function ye(y){B===y.pointerId&&H(y.clientX-Z,y.clientY-j)}function G(y){B===y.pointerId&&(B=null,a?.classList.remove("vlc-header--dragging"),a?.hasPointerCapture(y.pointerId)&&a.releasePointerCapture(y.pointerId))}function We(y=document.body){if(document.getElementById(Re))return t=document.getElementById(Re),t;t=document.createElement("div"),t.id=Re,t.setAttribute("data-vlc-panel","1");const _=t.attachShadow({mode:"open"}),M=document.createElement("style");M.textContent=la,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",Ze),a=document.createElement("div"),a.className="vlc-header",a.addEventListener("pointerdown",ue),a.addEventListener("pointermove",ye),a.addEventListener("pointerup",G),a.addEventListener("pointercancel",G);const Q=document.createElement("div");Q.className="vlc-header-main";const W=document.createElement("div");W.className="vlc-header-text",i=document.createElement("h1"),i.className="vlc-title",i.textContent=Ze,W.appendChild(i),g=document.createElement("div"),g.className="vlc-id-signals",g.hidden=!0,g.setAttribute("aria-label","Sinais de captura"),b=Lt("P","Matrícula"),b.classList.add("vlc-signal--plate"),E=Lt("T","Telefone"),E.classList.add("vlc-signal--phone"),v=Lt("R","ID aleatório"),v.classList.add("vlc-signal--random"),x=document.createElement("span"),x.className="vlc-plate-image-meta",x.hidden=!0,f=document.createElement("span"),f.className="vlc-plate-image-index",h=document.createElement("button"),h.type="button",h.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",h.innerHTML=T,h.hidden=!0,h.addEventListener("click",ta=>{ta.preventDefault(),ta.stopPropagation(),St()}),x.append(f,h),g.append(b,x,E,v),W.appendChild(g),Q.appendChild(W),c=le("Clip again",()=>e.onClipListing()),c.classList.add("vlc-btn-header-clip"),m=le(J("Copy again"),()=>e.onCopyAgain()),m.classList.add("vlc-btn-header-copy"),m.title=`Shortcut: ${U}`,m.disabled=!0,I=document.createElement("button"),I.type="button",I.className="vlc-btn vlc-btn-icon",I.addEventListener("click",X);const ee=document.createElement("div");ee.className="vlc-header-actions",ee.append(c,m,I),a.append(Q,ee);const se=document.createElement("div");se.className="vlc-body";const Ye=document.createElement("div");Ye.className="vlc-actions",l=le("Clip listing",()=>e.onClipListing()),d=le("Cancel",()=>e.onCancel()),d.disabled=!0,u=le(J("Copy again"),()=>e.onCopyAgain()),u.title=`Shortcut: ${U}`,u.disabled=!0;const $o=le("Clear model cache",()=>e.onClearModelCache()),Do=le("Diagnostics",()=>e.onToggleDiagnostics()),Oo=le("Settings",()=>e.onSettings());Ye.append(l,d,u,$o,Do,Oo),o=document.createElement("div"),o.className="vlc-status",o.setAttribute("aria-live","polite"),r=document.createElement("div"),r.className="vlc-diag",r.hidden=!0;const Bo=O.getElement();se.append(Ye,o,r,Bo),n.append(a,se),p=document.createElement("div"),p.className="vlc-plate-preview-overlay",p.hidden=!0,p.setAttribute("role","dialog"),p.setAttribute("aria-modal","true"),p.setAttribute("aria-label","Imagem da placa");const Pe=document.createElement("button");Pe.type="button",Pe.className="vlc-plate-preview-backdrop",Pe.setAttribute("aria-label","Fechar preview"),Pe.addEventListener("click",ve);const It=document.createElement("div");It.className="vlc-plate-preview-dialog";const kt=document.createElement("div");kt.className="vlc-plate-preview-header",S=document.createElement("div"),S.className="vlc-plate-preview-caption";const me=document.createElement("button");return me.type="button",me.className="vlc-btn vlc-btn-icon",me.innerHTML=$,me.setAttribute("aria-label","Fechar"),me.title="Fechar",me.addEventListener("click",ve),kt.append(S,me),L=document.createElement("img"),L.className="vlc-plate-preview-img",L.alt="Imagem onde a placa foi reconhecida",It.append(kt,L),p.append(Pe,It),_.append(M,n,p),V(),oe(),y.appendChild(t),window.addEventListener("keydown",fe),window.addEventListener("keydown",pe),t}function fe(y){!y.altKey||y.ctrlKey||y.metaKey||y.shiftKey||y.code==="KeyC"&&P&&(y.preventDefault(),e.onCopyAgain())}function pe(y){y.key==="Escape"&&(!p||p.hidden||(y.preventDefault(),ve()))}function oe(){const y=A!=null&&Number.isFinite(A)&&A>0,_=!!String(N||"").trim();x&&(x.hidden=!y),f&&(f.textContent=y?String(A):"",f.title=y?`Placa encontrada na imagem ${A}`:""),h&&(h.hidden=!(y&&_),h.title=y?`Ver imagem ${A}`:"Ver imagem da placa",h.setAttribute("aria-label",y?`Ver imagem ${A} da placa`:"Ver imagem da placa")),b&&y?(b.title=`Matrícula (imagem ${A})`,b.setAttribute("aria-label",`Matrícula encontrada na imagem ${A}`)):b&&(b.title="Matrícula",b.setAttribute("aria-label","Matrícula"))}function re({index:y=null,url:_=""}={}){A=typeof y=="number"&&Number.isFinite(y)&&y>0?Math.floor(y):null,N=typeof _=="string"?_.trim():"",oe(),N||ve()}function St(){!p||!L||!N||(L.src=N,S&&(S.textContent=A!=null&&A>0?`Imagem ${A} — origem da placa`:"Imagem — origem da placa"),p.hidden=!1)}function ve(){p&&(p.hidden=!0,L&&L.removeAttribute("src"))}function le(y,_){const M=document.createElement("button");return M.type="button",M.className="vlc-btn",M.textContent=y,M.addEventListener("click",_),M}function Lt(y,_){const M=document.createElement("span");return M.className="vlc-signal",M.textContent=y,M.title=_,M.setAttribute("aria-label",_),M.setAttribute("aria-pressed","false"),M}function xe(y,_){y&&(y.classList.toggle("vlc-signal--on",!!_),y.setAttribute("aria-pressed",_?"true":"false"))}function So(y){o&&(o.textContent=y)}function Lo(y){const _=!!y;l&&(l.disabled=_),c&&(c.disabled=_),d&&(d.disabled=!_)}function Io({id:y="",isRandom:_=!1,hasPlate:M=!1,hasPhone:Q=!1}={}){if(!g)return;const W=!!M,ee=!!Q,se=!!_;if(!(W||ee||se||!!String(y||"").trim())){g.hidden=!0,xe(b,!1),xe(E,!1),xe(v,!1);return}g.hidden=!1,xe(b,W),xe(E,ee),xe(v,se)}function ko(y){P=!!y,K()}function Ao(y){const _=J(y||"Copy again");u&&(u.textContent=_,u.title=`Shortcut: ${U}`),m&&(m.textContent=_,m.title=`Shortcut: ${U}`)}function _o(y=2e3){D!=null&&(clearTimeout(D),D=null);for(const _ of[m,u])_&&_.classList.add("vlc-btn--copied");D=setTimeout(()=>{D=null;for(const _ of[m,u])_?.classList.remove("vlc-btn--copied")},y)}function Po(y,_=""){r&&(r.hidden=!y,r.textContent=_)}function To(y,{phone:_="",plateImageIndex:M,plateImageUrl:Q}={}){const W=M!==void 0?M:y?.metadata?.plateImageIndex??A,ee=Q!==void 0?Q:y?.metadata?.plateImageUrl||N;re({index:W,url:ee}),O.showListing(y,{phone:_,plateImageIndex:A,plateImageUrl:N})}function Ro(y){O.showSettings(y)}function No(){O.hide()}function Mo(){D!=null&&(clearTimeout(D),D=null),window.removeEventListener("keydown",fe),window.removeEventListener("keydown",pe),ve(),a&&(a.removeEventListener("pointerdown",ue),a.removeEventListener("pointermove",ye),a.removeEventListener("pointerup",G),a.removeEventListener("pointercancel",G)),t?.remove(),t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,m=null,c=null,g=null,b=null,E=null,v=null,x=null,f=null,h=null,p=null,L=null,S=null,I=null,w=!0,k="waiting",P=!1,A=null,N="",B=null}return{mount:We,setStatus:So,setBusy:Lo,setClipboardId:Io,setPlateImageSource:re,openPlateImagePreview:St,closePlateImagePreview:ve,setCopyEnabled:ko,setCopyLabel:Ao,flashCopySuccess:_o,setCaptureStatus:F,setDiagnostics:Po,showListingForm:To,showSettingsForm:Ro,hideForm:No,setMinimized:z,isMinimized:()=>w,toggleMinimized:X,destroy:Mo}}function Ce(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function Me(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return Ce(n)}function Mt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function $t(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function Dt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function Ot(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function Bt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const i=Number.parseInt(n,10);if(i===99||i===999)return"1.0";if(i>=100)return(i/1e3).toFixed(1)}const a=t.replace(",",".");return a==="1"?"1.0":a}function Ft(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const a=t.replace(/[^\d]/g,"");return a?`${a} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function Vt(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function $e(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function De(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function Oe(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return De(t)}function te(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let a=`${n.origin}${n.pathname}`;const o=a.toLowerCase().indexOf(".html");return o!==-1&&(a=a.slice(0,o+5)),a}catch{return""}}const Ut="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",zt='#mainContent img[data-testid="swiper-image-lazy"]',Ht="#mainContent div.swiper-wrapper img",Gt=[Ut,zt,Ht],qt='#mainContent button[data-testid="ad-contact-phone"]',jt='#mainContent a[data-testid="contact-phone"][href^="tel:"]',Kt='#mainContent [data-testid="ad-parameters-container"]',Wt='#mainContent [data-testid="ad-price-container"] h3',Qe='link#ssr_canonical[rel="canonical"]',Yt='#mainContent [data-testid="offer_title"]',fa='#mainContent [data-testid="ad_description"]',pa='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',Zt='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',Jt='script[type="application/ld+json"]';function ma(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function ga(e=document){const t=en(e);if(t&&ge(t))return t;for(const n of Qt(e))if(ge(n))return n;return null}function ha(e){return!!(e&&typeof e.click=="function")}function Xt(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function we(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function et(e){if(e.hidden)return!0;const n=Xt(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function ge(e){if(!e||typeof e.getBoundingClientRect!="function"||et(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(we(e)>0)return!0;const n=Xt(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Qt(e=document){return[...e.querySelectorAll(qt)].filter(t=>ha(t))}function en(e=document){const t=Qt(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(l=>!et(l)),i=[...n.length>0?n:t].sort((l,d)=>{const u=ge(l)?1:0,m=ge(d)?1:0;return u!==m?m-u:we(d)-we(l)}),o=(()=>{const l=i[0];return{visible:ge(l)?1:0,area:we(l)}})(),r=i.filter(l=>(ge(l)?1:0)===o.visible&&we(l)===o.area);return r[r.length-1]||i[i.length-1]||t[t.length-1]}function tt(e=document){const t=[...e.querySelectorAll(jt)];for(const n of t){if(t.length>1&&et(n))continue;const a=n.getAttribute("href")||"",i=Me(a);if(i)return i;const o=Ce(n.textContent||"");if(o)return o}if(t.length>0){const n=t[t.length-1],a=n.getAttribute("href")||"",i=Me(a);if(i)return i;const o=Ce(n.textContent||"");if(o)return o}return null}function ba(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function ya(e){try{e.click()}catch{}ba(e)}async function va(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=tt(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await ma(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=ga(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const m=Date.now()+n;for(ya(d);Date.now()<m;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=tt(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(g=>setTimeout(g,a))}return{ok:!1,reason:"timeout"}}function xa(e){const t=new Map,n=e.querySelector(Kt);if(!n)return t;for(const a of n.querySelectorAll("p")){const i=(a.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const o=i.indexOf(":");if(o<=0)continue;const r=i.slice(0,o).trim().toLowerCase(),l=i.slice(o+1).trim();r&&l&&t.set(r,l)}return t}function Ca(e){const t=e.querySelectorAll(Jt);for(const n of t){const a=n.textContent||"";if(a.trim())try{const i=JSON.parse(a),o=Array.isArray(i)?i:[i];for(const r of o)if(r&&r["@type"]==="Vehicle")return r}catch{}}return null}function wa(e){const n=(e.querySelector?.(Qe)||(typeof document<"u"?document.querySelector(Qe):null))?.getAttribute?.("href")||"";return n?te(n):typeof location<"u"&&location?.href?te(location.href):""}function Ea(e){const t=e.querySelectorAll(Zt);for(const n of t){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function Sa(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function La(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Ia(e){const t=e.querySelector?.(fa);if(!t)return"";const n=[...t.children||[]].find(i=>String(i.tagName||"").toUpperCase()!=="H3");if(n)return Oe(n.innerHTML||"");let a=Oe(t.innerHTML||"");return a=a.replace(/^Descrição\s*/i,""),De(a)}function ka(e=document){const t=[],n=[];function a(w,k){k&&t.push(w)}const i=xa(e),o=Ca(e),r=wa(e);a("url",r);const l=La(r,o);a("listingId",l);const u=(e.querySelector(Yt)?.textContent||o?.name||"").replace(/\s+/g," ").trim();a("title",u);let m=Ia(e);m||(m=Oe(o?.description||"")),a("description",m);const g=(e.querySelector(pa)?.textContent||"").replace(/\s+/g," ").trim();a("clientName",g);let b=Sa(o);b||(b=Ea(e)),b=$e(b),a("make",b);let E=i.get("modelo")||o?.model||"";E=$e(E),a("model",E);let v=i.get("ano")||o?.productionDate||o?.modelDate||"";v=Vt(v),a("year",v);const x=Mt(i.get("quilómetros")||i.get("quilometros")||"");a("mileageKm",x);const f=Dt(i.get("tipo de caixa")||"");a("transmission",f);const h=Ot(i.get("combustível")||i.get("combustivel")||"");a("fuel",h);const p=Bt(i.get("cilindrada")||"");a("engine",p);const L=Ft(i.get("potência")||i.get("potencia")||"");a("powerCv",L);let S=o?.offers?.price;(S==null||S==="")&&(S=e.querySelector(Wt)?.textContent||"");const I=$t(S);return a("priceEur",I),(!b||!E)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"olx-pt",url:r,listingId:l,title:u,description:m,clientName:g,make:b,model:E,year:v,mileageKm:x,transmission:f,fuel:h,engine:p,powerCv:L,priceEur:I,extractedFields:[...new Set(t)],warnings:n}}function Aa(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),a=n[0],i=n[1];let o=null;return i&&/^\d+w$/i.test(i)&&(o=Number.parseInt(i,10)),{url:a,width:o}}).filter(t=>!!t.url)}function _a(e){const t=Aa(e);if(t.length===0)return null;const n=t.filter(i=>typeof i.width=="number");if(n.length===0)return t[t.length-1].url;let a=n[0];for(let i=1;i<n.length;i+=1)n[i].width>a.width&&(a=n[i]);return a.url}function tn(e){if(!e)return null;const t=_a(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function Pa(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function nn(e=document){for(const t of Gt){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function nt(e=document){const{images:t,selectorUsed:n}=nn(e),a=[],i=new Set;for(const o of t){const r=tn(o);if(!r)continue;const l=Pa(r);i.has(l)||(i.add(l),a.push(l))}return{urls:a,count:a.length,selectorUsed:n}}async function Ta(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=nt(t);if(i.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=nt(t);return i}const an={siteId:"olx-pt",discoverListingImages:nt,discoverListingImagesWithWait:Ta,queryGalleryImages:nn,extractListing:ka,findPhoneRevealButton:en,readRevealedPhone:tt,revealContactPhone:va,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:Ut,FALLBACK_TESTID_SELECTOR:zt,FALLBACK_SWIPER_IMG_SELECTOR:Ht,GALLERY_SELECTORS:Gt,PHONE_REVEAL_BUTTON_SELECTOR:qt,CONTACT_PHONE_SELECTOR:jt,AD_PARAMETERS_SELECTOR:Kt,AD_PRICE_SELECTOR:Wt,CANONICAL_LINK_SELECTOR:Qe,OFFER_TITLE_SELECTOR:Yt,BREADCRUMB_ITEM_SELECTOR:Zt,JSON_LD_SELECTOR:Jt}},on="script#__NEXT_DATA__",rn='h1.offer-title, [data-testid="summary-info-area"] h1',ln='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',sn='[data-testid="content-description-section"]',at='link[rel="canonical"]',Be='[data-testid="aside-seller-info"]',Ra='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',cn='[data-testid="seller-info-contact-box"]',dn='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',un='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',fn='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',pn=[un,fn];function Na(e){return`[data-testid="${e}"] p:last-of-type`}const Ma=/ver\s+telefone/i;function $a(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function Da(e){return!!(e&&typeof e.click=="function")}function mn(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function it(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Fe(e){if(e.hidden)return!0;const n=mn(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function Ve(e){if(!e||typeof e.getBoundingClientRect!="function"||Fe(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(it(e)>0)return!0;const n=mn(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function gn(e){if(!Da(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return Ma.test(t)}function hn(e=document){const t=[],n=new Set;function a(i){const o=e.querySelector?.(i)||null;if(o)for(const r of o.querySelectorAll("button"))!gn(r)||n.has(r)||(n.add(r),t.push(r))}a(Be),a(cn);for(const i of e.querySelectorAll?.("button")||[])!gn(i)||n.has(i)||(n.add(i),t.push(i));return t}function bn(e=document){const t=hn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Be);if(n){const r=t.find(l=>n.contains(l)&&!Fe(l));if(r)return r}const a=t.filter(r=>!Fe(r));return[...a.length>0?a:t].sort((r,l)=>{const d=Ve(r)?1:0,u=Ve(l)?1:0;return d!==u?u-d:it(l)-it(r)})[0]||t[0]}function Oa(e=document){const t=bn(e);if(t&&Ve(t))return t;for(const n of hn(e))if(Ve(n))return n;return null}function ot(e=document){const t=[...e.querySelectorAll?.(dn)||[]],n=e.querySelector?.(Be),a=n&&t.length>1?[...t.filter(i=>n.contains(i)),...t.filter(i=>!n.contains(i))]:t;for(const i of a){if(a.length>1&&Fe(i))continue;const o=i.getAttribute("href")||"",r=Me(o);if(r)return r;const l=Ce(i.textContent||"");if(l)return l}if(a.length>0){const i=a[0],o=i.getAttribute("href")||"",r=Me(o);if(r)return r;const l=Ce(i.textContent||"");if(l)return l}return null}function Ba(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function Fa(e){try{e.click()}catch{}Ba(e)}async function Va(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=ot(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await $a(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=Oa(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const m=Date.now()+n;for(Fa(d);Date.now()<m;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=ot(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(g=>setTimeout(g,a))}return{ok:!1,reason:"timeout"}}const rt="https://www.standvirtual.com/";function yn(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function Ee(e){const{value:t,label:n}=yn(e);return n||t}function Ue(e){const{value:t,label:n}=yn(e);return t||n}function vn(e){const n=e.querySelector?.(on)?.textContent||"";if(!n.trim())return null;try{const i=JSON.parse(n)?.props?.pageProps?.advert;return i&&typeof i=="object"?i:null}catch{return null}}function Ua(e){const n=(e.querySelector?.(at)||(typeof document<"u"?document.querySelector(at):null))?.getAttribute?.("href")||"";return n?te(n,rt):typeof location<"u"&&location?.href?te(location.href,rt):""}function za(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function ne(e,t){return(e.querySelector?.(Na(t))?.textContent||"").replace(/\s+/g," ").trim()}function Ha(e=document){const t=[],n=[];function a(k,P){P&&t.push(k)}const i=vn(e),o=i?.parametersDict||{};let r="";i?.url&&(r=te(i.url,rt)),r||(r=Ua(e)),a("url",r);const l=za(r,i);a("listingId",l);const d=e.querySelector?.(rn),u=(i?.title||d?.textContent||"").replace(/\s+/g," ").trim();a("title",u);let m="";if(i?.description&&(m=Oe(i.description)),!m){const k=e.querySelector?.(sn);m=De(k?.textContent||"")}a("description",m);let c="";i?.seller?.name&&(c=String(i.seller.name).replace(/\s+/g," ").trim()),c||(c=(e.querySelector?.(Ra)?.textContent||"").replace(/\s+/g," ").trim()),a("clientName",c);let g=Ee(o.make)||ne(e,"make")||"";g=$e(g),a("make",g);let b=Ee(o.model)||ne(e,"model")||"";b=$e(b),a("model",b);let E=Ue(o.first_registration_year)||ne(e,"first_registration_year")||"";E=Vt(E),a("year",E);const v=Mt(Ue(o.mileage)||ne(e,"mileage")||"");a("mileageKm",v);const x=Dt(Ee(o.gearbox)||ne(e,"gearbox")||"");a("transmission",x);const f=Ot(Ee(o.fuel_type)||ne(e,"fuel_type")||"");a("fuel",f);const h=Ue(o.engine_capacity)||ne(e,"engine_capacity")||"",p=/cm\s*3|cm3|\bcc\b/i.test(h)?h.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):h,L=Bt(p);a("engine",L);const S=Ft(Ue(o.engine_power)||Ee(o.engine_power)||ne(e,"engine_power")||"");a("powerCv",S);let I=i?.price?.value;(I==null||I==="")&&(I=e.querySelector?.(ln)?.textContent||"");const w=$t(I);return a("priceEur",w),(!g||!b)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"standvirtual-pt",url:r,listingId:l,title:u,description:m,clientName:c,make:g,model:b,year:E,mileageKm:v,transmission:x,fuel:f,engine:L,powerCv:S,priceEur:w,extractedFields:[...new Set(t)],warnings:n}}function xn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function Ga(e=document){const n=vn(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const a=[],i=new Set;for(const o of n){const r=o?.url||o?.src||"";if(!r)continue;const l=xn(String(r));i.has(l)||(i.add(l),a.push(l))}return a.length===0?null:{urls:a,count:a.length,selectorUsed:"next-data:images.photos"}}function Cn(e=document){for(const t of pn){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function lt(e=document){const t=Ga(e);if(t)return t;const{images:n,selectorUsed:a}=Cn(e),i=[],o=new Set;for(const r of n){const l=tn(r);if(!l)continue;const d=xn(l);o.has(d)||(o.add(d),i.push(d))}return{urls:i,count:i.length,selectorUsed:a}}async function qa(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=lt(t);if(i.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=lt(t);return i}const wn={siteId:"standvirtual-pt",discoverListingImages:lt,discoverListingImagesWithWait:qa,queryGalleryImages:Cn,extractListing:Ha,findPhoneRevealButton:bn,readRevealedPhone:ot,revealContactPhone:Va,selectors:{PRIMARY_GALLERY_SELECTOR:un,FALLBACK_GALLERY_SELECTOR:fn,GALLERY_SELECTORS:pn,CONTACT_PHONE_SELECTOR:dn,ASIDE_SELLER_SELECTOR:Be,CONTENT_CONTACT_SELECTOR:cn,AD_PRICE_SELECTOR:ln,CANONICAL_LINK_SELECTOR:at,OFFER_TITLE_SELECTOR:rn,DESCRIPTION_SELECTOR:sn,NEXT_DATA_SELECTOR:on}},En=new Map;function Sn(e){En.set(e.siteId,e)}function Ln(e){return En.get(e)}function In(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?Ln("standvirtual-pt")||wn:Ln("olx-pt")||an}Sn(an),Sn(wn);async function ja(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let a=null;for(const i of n)try{const o=new Blob([e],{type:i});return await createImageBitmap(o)}catch(o){a=o}try{const i=new Blob([e]);return await createImageBitmap(i)}catch(i){throw a||i}}function Ka(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const a=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:a,width:t.width,height:t.height}}const st=new Map;function ct(){return typeof GM<"u"&&GM!=null}async function kn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):ct()&&typeof GM.getValue=="function"?GM.getValue(e,t):st.has(e)?st.get(e):t}async function An(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(ct()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}st.set(e,t)}async function Wa(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(ct()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function _n(e){const{method:t,url:n,responseType:a="arraybuffer",headers:i,signal:o}=e;return new Promise((r,l)=>{if(o?.aborted){l(new DOMException("Aborted","AbortError"));return}let d=null;const u=()=>{try{d?.abort?.()}catch{}l(new DOMException("Aborted","AbortError"))};o?.addEventListener("abort",u,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(c);return}l(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:a,headers:i,onload(c){o?.removeEventListener("abort",u);const g=c.status;if(g<200||g>=300){l(new Error(`HTTP ${g} for ${n}`));return}r(c.response)},onerror(){o?.removeEventListener("abort",u),l(new Error(`Network error for ${n}`))},ontimeout(){o?.removeEventListener("abort",u),l(new Error(`Timeout for ${n}`))}})})}async function Ya(e,t={}){const{signal:n,request:a=_n}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await a({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:i}}function Za(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),a=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),i=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),o=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),r=Math.max(1,i-n),l=Math.max(1,o-a),d=document.createElement("canvas");d.width=e.width,d.height=e.height;const u=d.getContext("2d");return u.putImageData(e,0,0),u.getImageData(n,a,r,l)}function Ja(e,t,n){const a=document.createElement("canvas");a.width=e.width,a.height=e.height,a.getContext("2d").putImageData(e,0,0);const i=document.createElement("canvas");i.width=n,i.height=t;const o=i.getContext("2d");o.drawImage(a,0,0,n,t);const{data:r}=o.getImageData(0,0,n,t),l=new Uint8Array(1*t*n*3);let d=0;for(let u=0;u<t*n;u+=1)l[d++]=r[u*4],l[d++]=r[u*4+1],l[d++]=r[u*4+2];return l}function Xa(e,t,n=[114,114,114]){const{width:a,height:i}=e,o=Math.min(t/i,t/a),r=Math.round(a*o),l=Math.round(i*o),d=(t-r)/2,u=(t-l)/2,m=Math.round(u-.1),c=Math.round(d-.1),g=document.createElement("canvas");g.width=a,g.height=i,g.getContext("2d").putImageData(e,0,0);const E=document.createElement("canvas");E.width=t,E.height=t;const v=E.getContext("2d");v.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,v.fillRect(0,0,t,t),v.drawImage(g,0,0,a,i,c,m,r,l);const x=v.getImageData(0,0,t,t).data,f=new Float32Array(3*t*t),h=t*t;for(let p=0;p<h;p+=1){const L=x[p*4],S=x[p*4+1],I=x[p*4+2];f[p]=L/255,f[h+p]=S/255,f[2*h+p]=I/255}return{tensor:f,ratio:o,pad:{dw:d,dh:u},size:t}}function Qa(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const ei="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",ti="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",ni="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",ai="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function Pn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:ei},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:ti,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:ni},ortWasmBaseUrl:ai}}const ze={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Tn=null;function ii(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function dt(){const e=ii();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Rn=new Proxy({},{get(e,t){return dt()[t]}});function oi(){const e=dt(),t=Pn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function Nn(e,t={}){oi();const n=dt(),a=t.prefer||["webgpu","wasm"],i=[];for(const o of a)try{const r=await n.InferenceSession.create(e,{executionProviders:[o]});return Tn=o,{session:r,provider:o}}catch(r){i.push(`${o}: ${r instanceof Error?r.message:String(r)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function ut(){return Tn}const ft=384,ri="images",li="output0";async function si(e,t,n={}){const a=n.confThresh??.4,{tensor:i,ratio:o,pad:r}=Xa(t,ft),l=new Rn.Tensor("float32",i,[1,3,ft,ft]),d=await e.run({[ri]:l}),u=d[li]||Object.values(d)[0];if(!u)return[];const m=u.data,c=u.dims||[],g=c.length>=2?c[c.length-1]:7,b=Math.floor(m.length/g),E=[];for(let v=0;v<b;v+=1){const x=v*g,f=m[x+1],h=m[x+2],p=m[x+3],L=m[x+4],S=m[x+5],I=m[x+6];if(I<a)continue;const w=Qa({x1:f,y1:h,x2:p,y2:L},o,r);E.push({...w,score:Number(I),classId:Number(S)})}return E.sort((v,x)=>x.score-v.score),E}function ci(e,t,n=ze){const a=n.alphabet,i=n.maxPlateSlots,o=a.length,r=e,l=[],d=[];for(let m=0;m<i;m+=1){let c=0,g=-1/0;for(let b=0;b<o;b+=1){const E=Number(r[m*o+b]);E>g&&(g=E,c=b)}l.push(a[c]),d.push(g)}let u=l.join("");return n.padChar&&(u=u.replace(new RegExp(`${di(n.padChar)}+$`),"")),{text:u,charProbs:d.slice(0,Math.max(u.length,1))}}function di(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function ui(e,t){const{imgHeight:n,imgWidth:a}=ze,i=Ja(t,n,a),o=new Rn.Tensor("uint8",i,[1,n,a,3]),r=await e.run({input:o}),l=r.plate||Object.values(r)[0],d=l.dims||[1,ze.maxPlateSlots,ze.alphabet.length],u=d[d.length-1],c=d[d.length-2]*u,g=l.data,b=g.length>=c?g.slice(0,c):g;return ci(b)}const Se="[A-Z]",Le="[0-9]",fi=[{id:"LLDDDD",re:new RegExp(`^${Se}{2}${Le}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${Le}{4}${Se}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${Le}{2}${Se}{2}${Le}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${Se}{2}${Le}{2}${Se}{2}$`)}],pi={0:"O",1:"I",5:"S",8:"B"},mi={O:"0",I:"1",L:"1",S:"5",B:"8"};function He(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function he(e){const t=He(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function gi(e){const t=He(e);if(t.length!==6)return null;for(const n of fi)if(n.re.test(t))return n.id;return null}function pt(e,t){const n=He(e).slice(0,6).split("");if(n.length!==6)return[];const a=[];function i(o,r,l){if(r>t)return;if(o===6){const c=l.join(""),g=gi(c);g&&a.push({plate:c,corrections:r,patternId:g});return}if(i(o+1,r,l),r>=t)return;const d=l[o],u=pi[d];if(u){const c=l.slice();c[o]=u,i(o+1,r+1,c)}const m=mi[d];if(m){const c=l.slice();c[o]=m,i(o+1,r+1,c)}}return i(0,0,n),a.sort((o,r)=>o.corrections-r.corrections||r.plate.localeCompare(o.plate)),a}function Mn(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let a=0;for(let i=0;i<n;i+=1)a+=e[i]??0;return a/n}function hi(e,t=[],n={}){const a=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,o=He(e);if(o.length<6)return{accepted:!1,plate:o,plateFormatted:he(o),patternId:null,corrections:0,meanConfidence:Mn(t,o.length),reason:"too-short"};const r=o.slice(0,6),l=Mn(t,6),d=pt(r,0);if(d.length>0&&l>=a){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:he(c.plate),patternId:c.patternId,corrections:0,meanConfidence:l}}const u=pt(r,1).filter(c=>c.corrections===1);if(u.length>0&&l>=i){const c=u[0];return{accepted:!0,plate:c.plate,plateFormatted:he(c.plate),patternId:c.patternId,corrections:1,meanConfidence:l}}return pt(r,2).some(c=>c.corrections>1)&&d.length===0&&u.length===0?{accepted:!1,plate:r,plateFormatted:he(r),patternId:null,corrections:2,meanConfidence:l,reason:"excessive-corrections"}:d.length>0||u.length>0?{accepted:!1,plate:r,plateFormatted:he(r),patternId:null,corrections:d.length?0:1,meanConfidence:l,reason:"low-confidence"}:{accepted:!1,plate:r,plateFormatted:he(r),patternId:null,corrections:0,meanConfidence:l,reason:"no-reliable-pattern"}}const ae="models",bi=1;let Ge=null;function mt(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Ge||(Ge=new Promise((e,t)=>{const n=indexedDB.open(At,bi);n.onupgradeneeded=()=>{const a=n.result;a.objectStoreNames.contains(ae)||a.createObjectStore(ae,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Ge)}async function $n(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function yi(e){const t=await mt();return new Promise((n,a)=>{const o=t.transaction(ae,"readonly").objectStore(ae).get(e);o.onsuccess=()=>{const r=o.result;n(r?.bytes||null)},o.onerror=()=>a(o.error)})}async function vi(e,t,n){const a=await mt();return new Promise((i,o)=>{const r=a.transaction(ae,"readwrite");r.objectStore(ae).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),r.oncomplete=()=>i(),r.onerror=()=>o(r.error)})}async function xi(){const e=await mt();return new Promise((t,n)=>{const a=e.transaction(ae,"readwrite");a.objectStore(ae).clear(),a.oncomplete=()=>t(),a.onerror=()=>n(a.error)})}async function Dn(e,t={}){const{onStatus:n,signal:a}=t,i=await yi(e.id).catch(()=>null);if(i&&await $n(i)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const o=await _n({method:"GET",url:e.url,responseType:"arraybuffer",signal:a}),r=o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"?o:null;if(!r)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const l=await $n(r);if(l!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${l}`);return await vi(e.id,r,l).catch(()=>{}),{bytes:r,cacheHit:!1}}let Ie=null;async function Ci(e={}){if(Ie)return{sessions:Ie,diagnostics:{provider:ut(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=Pn(),n=await Dn(t.detector,e),a=await Dn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const i=await Nn(n.bytes),o=await Nn(a.bytes);return Ie={detector:i.session,ocr:o.session},{sessions:Ie,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:a.cacheHit}}}function wi(){Ie=null}async function Ei(e,t,n={}){const{signal:a}=n;let i=0,o;try{const l=await ja(t);o=Ka(l).imageData,l.close?.()}catch{return null}const r=await si(e.detector,o);for(const l of r){if(a?.aborted)throw new DOMException("Aborted","AbortError");i+=1;const d=Za(o,l),u=await ui(e.ocr,d),m=hi(u.text,u.charProbs);if(m.accepted)return{plate:m.plate,plateFormatted:m.plateFormatted,detectionsTried:i}}return{plate:"",plateFormatted:"",detectionsTried:i}}async function Si(e,t={}){const n=Date.now(),{onStatus:a,signal:i,request:o}=t,r=e.length,l=await Ci({onStatus:a,signal:i}),{detector:d,ocr:u}=l.sessions;let m=0,c=0;for(let g=0;g<r;g+=1){if(i?.aborted)return qe("cancelled",l.diagnostics,c,m,n);const b=e[g];a?.(`Downloading image ${g+1} of ${r}`);let E;try{E=await Ya(b,{signal:i,request:o})}catch(x){if(i?.aborted||x?.name==="AbortError")return qe("cancelled",l.diagnostics,c,m,n);a?.(`Failed to download image ${g+1} of ${r}, skipping…`);continue}a?.(`Scanning image ${g+1} of ${r}`),c+=1;let v;try{v=await Ei({detector:d,ocr:u},E.bytes,{signal:i})}catch(x){if(i?.aborted||x?.name==="AbortError")return qe("cancelled",l.diagnostics,c,m,n);continue}finally{E=null}if(v&&(m+=v.detectionsTried,v.plate))return{ok:!0,plate:v.plate,plateFormatted:v.plateFormatted,imageIndex:g+1,imageUrl:b,diagnostics:{provider:ut()||l.diagnostics.provider,detectorCacheHit:l.diagnostics.detectorCacheHit,ocrCacheHit:l.diagnostics.ocrCacheHit,imagesScanned:c,detectionsTried:m,elapsedMs:Date.now()-n}}}return qe("no-reliable-plate",l.diagnostics,c,m,n)}function qe(e,t,n,a,i){return{ok:!1,reason:e,diagnostics:{provider:ut()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:a,elapsedMs:Date.now()-i}}}async function On(e){return await Wa(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Bn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function Fn({plate:e,phone:t,fallbackId:n}={}){const a=e==null?"":String(e).trim();if(a)return{id:a,isRandom:!1};const i=t==null?"":String(t).trim();if(i)return{id:i,isRandom:!1};const o=n==null?"":String(n).trim();return o?{id:o,isRandom:!0}:{id:Bn(),isRandom:!0}}function Vn(e={}){return Fn(e).id}function Li(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function Ii(e,{phone:t="",fallbackId:n=""}={}){const a=e||{},i=t==null?"":String(t).trim(),o=a.plate==null?"":String(a.plate).trim(),l=[`ID: ${Vn({plate:o,phone:i,fallbackId:n})}`,`Telefone: ${i}`,""];for(const u of Xe){if(u==="url")continue;const m=Pt[u];let c=a[u]==null?"":String(a[u]);u==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),l.push(`${m}: ${c}`)}const d=a.url==null?"":String(a.url);return l.push(""),l.push(d),l.join(`
`)}const gt="<<<LEAD_CLIP_V1>>>",Un="<<<END_LEAD_CLIP>>>";function ki(e,t={}){const n=e?.fields||{},a=e?.source||{},i=t.phone==null?"":String(t.phone).trim();return{v:1,id:Vn({plate:n.plate,phone:i,fallbackId:t.fallbackId}),phone:i,plate:String(n.plate||""),clientName:String(n.clientName||a.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||a.url||""),siteId:String(a.siteId||""),title:String(a.title||""),description:De(a.description||"")}}function Ai(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${gt}
${n}
${Un}
`}function _i(e){const t=String(e||""),n=t.indexOf(gt);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const a=n+gt.length,i=t.indexOf(Un,a);if(i<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const o=t.slice(a,i).trim(),r=t.slice(0,n).replace(/\s+$/,"");try{const l=JSON.parse(o);return!l||l.v!==1||typeof l!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:l,humanText:r}}catch(l){return{ok:!1,error:l instanceof Error?l.message:"JSON parse failed"}}}const Pi="listingCache",Ti=2880*60*1e3;function zn(){return`${Te}${Pi}`}function ht(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Ri(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,a]of Object.entries(e))typeof n=="string"&&n&&ht(a)&&(t[n]={processedAt:a.processedAt,phone:a.phone,clipboard:a.clipboard,fallbackId:typeof a.fallbackId=="string"?a.fallbackId:"",listingRecord:a.listingRecord});return t}async function Ni(){const e=await kn(zn(),{});return Ri(e)}async function bt(e){await An(zn(),e)}async function yt(e=Date.now()){const t=await Ni(),n={};let a=!1;for(const[i,o]of Object.entries(t))e-o.processedAt<=Ti?n[i]=o:a=!0;return(a||Object.keys(n).length!==Object.keys(t).length)&&await bt(n),n}async function Mi(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const i=(await yt(t))[n];return i&&ht(i)?i:null}async function $i(e,t,n=Date.now()){const a=typeof e=="string"?e.trim():"";if(!a||!ht(t))return null;const i=await yt(n),o={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return i[a]=o,await bt(i),o}async function Di(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const a=await yt(t);return n in a?(delete a[n],await bt(a),!0):!1}const Hn="valuationDefaults";async function Oi(e,t=null){return kn(`${Te}${e}`,t)}async function Bi(e,t){await An(`${Te}${e}`,t)}async function Gn(){const e=await Oi(Hn,null);return!e||typeof e!="object"?{...Ne}:{...Ne,...e}}async function Fi(e){const t={...Ne,...e};return await Bi(Hn,t),t}function vt(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function Vi(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):vt(t)?Promise.resolve("visible"):new Promise(a=>{const i=()=>{r(),a("cancelled")},o=()=>{vt(t)&&(r(),a("visible"))},r=()=>{t.removeEventListener("visibilitychange",o),n?.removeEventListener("abort",i)};t.addEventListener("visibilitychange",o),n&&n.addEventListener("abort",i,{once:!0})})}const Ui=5e3;function zi(){let e=_t(),t=null,n=null,a=null,i="",o=0;function r(s){s&&t?.setCaptureStatus(s)}function l(s){e={...e,statusMessage:s},t?.setStatus(s);const C=String(s||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);C&&r(`analisando imagem ${C[1]} de ${C[2]}`)}function d(){try{const s=In().extractListing(document);if(s?.url)return te(s.url)}catch{}return typeof location<"u"&&location?.href?te(location.href):""}function u(s={}){const C=s.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",T=s.phone??e.lastPhone??"",$=s.fallbackId??e.fallbackId??"",R=!!String(C).trim(),V=!!String(T).trim();if(!R&&!V&&!String($).trim()){t?.setClipboardId({id:"",isRandom:!1,hasPlate:!1,hasPhone:!1});return}t?.setClipboardId({...Fn({plate:C,phone:T,fallbackId:$}),hasPlate:R,hasPhone:V})}function m(s,C){const T=C.listingRecord,$=C.phone||"",R=T?.fields?.plate||"",z=!String(R).trim()&&!String($).trim()&&(C.fallbackId||Li(C.clipboard))||"",X=typeof T?.metadata?.plateImageIndex=="number"&&T.metadata.plateImageIndex>0?T.metadata.plateImageIndex:null,F=typeof T?.metadata?.plateImageUrl=="string"?T.metadata.plateImageUrl:"";i=s,o=C.processedAt,e={...e,lastPlate:R,lastPhone:$,lastClipboard:C.clipboard||"",fallbackId:z,listingRecord:T,plateImageIndex:X,plateImageUrl:F,view:"form"},t?.showListingForm(T,{phone:$,plateImageIndex:X,plateImageUrl:F}),t?.setCopyEnabled(!!C.clipboard),t?.setCopyLabel("Copy"),u({plate:R,phone:$,fallbackId:z}),r("ready to copy"),l("Ready to copy")}function c(s,C=""){const T=s?.fields?.plate||"",$=C==null?"":String(C).trim();let R=e.fallbackId||"";!String(T).trim()&&!$&&(R||(R=Bn()),e={...e,fallbackId:R});const V=Ii(s.fields,{phone:$,fallbackId:e.fallbackId}),z=ki(s,{phone:$,fallbackId:e.fallbackId});return Ai(V,z)}async function g(s){const C=i||te(s.listingRecord?.fields?.url||"")||d();if(!C||!s.listingRecord||!s.clipboard)return;const T=s.processedAt??o??Date.now();i=C,o=T,await $i(C,{processedAt:T,phone:s.phone??e.lastPhone??"",clipboard:s.clipboard,fallbackId:s.fallbackId??e.fallbackId??"",listingRecord:s.listingRecord})}async function b(){try{const s=d();if(s){const C=await Mi(s);if(C){if(Rt(C.listingRecord,{plate:C.listingRecord?.fields?.plate,phone:C.phone})){m(s,C);return}await Di(s)}}}catch{}v()}function E(){a!=null&&(clearTimeout(a),a=null)}function v(){E(),r("waiting"),a=setTimeout(()=>{a=null,S()},Ui)}function x(s){e={...e,busy:s,view:s?"reading":e.listingRecord?"form":"idle"},t?.setBusy(s),s&&r("reading")}function f(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const s=e.lastDiagnostics;if(!s){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${s.provider||"n/a"}`,`Detector cache: ${s.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${s.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${s.imagesScanned??0}`,`Detections tried: ${s.detectionsTried??0}`,e.plateImageIndex?`Plate image: ${e.plateImageIndex}`:null,`Elapsed: ${s.elapsedMs??0} ms`].filter(Boolean).join(`
`))}function h(s,C,T){const $=[];if(C.plate){const R=C.plateImageIndex!=null&&C.plateImageIndex>0?` (imagem ${C.plateImageIndex})`:"";$.push(`Plate found: ${C.plate}${R}`)}else $.push("No reliable plate found.");return C.phone&&$.push(`Phone: ${C.phone}`),(s.fields.make||s.fields.model)&&$.push(`Listing: ${[s.fields.make,s.fields.model].filter(Boolean).join(" ")}`.trim()),$.push(T),$.join(`
`)}function p(s){e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)}async function L(s){return p(s),On(s)}async function S(){if(E(),e.busy)return;n=new AbortController;const{signal:s}=n;x(!0);try{const C=In(),T=await Gn();l("Extracting listing fields…");const $=C.extractListing(document);let R={ok:!1,reason:"no-images"},V=0;const z=!!e.listingRecord&&!!t?.isMinimized?.();if(z){const pe=String(e.listingRecord?.fields?.plate||e.lastPlate||"").trim(),oe=e.plateImageIndex??e.listingRecord?.metadata?.plateImageIndex??null,re=e.plateImageUrl||e.listingRecord?.metadata?.plateImageUrl||"";R=pe?{ok:!0,plate:pe,reason:"reused",imageIndex:typeof oe=="number"&&oe>0?oe:void 0,imageUrl:re||void 0}:{ok:!1,reason:"reused-no-plate"},l("Refreshing listing text and phone…")}else{l("Looking for listing images…");const pe=await C.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:oe,count:re}=pe;V=re,re>0?(l(`Found ${re} listing images — scanning…`),l("Loading plate recognition models…"),R=await Si(oe,{signal:s,onStatus:l}),e={...e,lastDiagnostics:R.diagnostics},f()):l("No listing images — waiting for phone…")}if(s.aborted||R.reason==="cancelled"){l("Cancelled.");return}if(vt()||(r("lendo tel"),l("Waiting for this tab to extract phone…")),await Vi({signal:s})==="cancelled"||s.aborted){l("Cancelled.");return}r("lendo tel"),l("Waiting for phone button…");const F=await C.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,buttonAppearDelayMs:2e3,buttonAppearAttempts:2,signal:s}),K=R.ok&&R.plate?R.plate:"",H=F.ok?F.phone:"",ue=K&&typeof R.imageIndex=="number"&&R.imageIndex>0?R.imageIndex:null,ye=K&&typeof R.imageUrl=="string"?R.imageUrl:"";if(s.aborted){l("Cancelled.");return}const G=ia({extracted:$,plate:K,defaults:T,plateImage:{index:ue,url:ye}});if(e={...e,lastPlate:K,lastPhone:H,fallbackId:"",listingRecord:G,plateImageIndex:ue,plateImageUrl:ye,view:"form"},t?.showListingForm(G,{phone:H,plateImageIndex:ue,plateImageUrl:ye}),!Rt(G,{plate:K,phone:H})){p(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),r("No data found."),l("No data found.");return}const We=c(G,H);p(We),t?.setCopyLabel("Copy"),u({plate:K,phone:H,fallbackId:e.fallbackId}),r("ready to copy"),i=te(G.fields.url||"")||d(),o=Date.now(),await g({clipboard:We,phone:H,listingRecord:G,processedAt:o,fallbackId:e.fallbackId});let fe=h(G,{plate:K,phone:H,plateImageIndex:ue},"Ready to copy");K&&!H&&F.reason==="timeout"?fe+=`
Phone reveal timed out.`:K&&!H&&F.reason==="no-button"&&(fe+=`
No phone button on this listing.`),!z&&V===0&&!H&&F.reason==="no-button"&&(fe+=`
No listing images found.`),l(fe)}catch(C){if(s.aborted){l("Cancelled.");return}const T=C instanceof Error?C.message:"Unknown recognition error";l(`Failed: ${T}`)}finally{n=null,x(!1)}}function I(){n?.abort()}async function w(){let s=e.lastClipboard;if(e.listingRecord&&(s=c(e.listingRecord,e.lastPhone),e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)),!s){l("Nothing to copy yet.");return}const C=await On(s);C.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await g({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(C.ok?"Data copied":"Clipboard copy failed.")}async function k(){if(!e.listingRecord){l("No listing to copy yet. Run Clip listing.");return}const s=c(e.listingRecord,e.lastPhone),C=await L(s);C.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),await g({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(C.ok?"Data copied":"Clipboard copy failed.")}async function P(){const s=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!s){l("No plate to copy.");return}const C=await L(s);l(C.ok?`Plate copied: ${s}`:"Clipboard copy failed.")}function A(s,C){if(s==="phone"){e={...e,lastPhone:C==null?"":String(C)},u();return}if(!e.listingRecord)return;const T=oa(e.listingRecord,s,C);e={...e,listingRecord:T,lastPlate:s==="plate"?C:e.lastPlate},s==="plate"&&u()}async function N(){try{await xi(),wi(),l("Model cache cleared.")}catch(s){const C=s instanceof Error?s.message:"Failed to clear cache";l(C)}}function B(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},f(),l(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function Z(){if(e.busy)return;const s=await Gn();e={...e,view:"settings"},t?.showSettingsForm(s),l(`Settings. Environment: production. Storage: ${Te}* / ${At}.`)}function j(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone,plateImageIndex:e.plateImageIndex,plateImageUrl:e.plateImageUrl}),l("Back to listing review.")):(t?.hideForm(),l("Settings closed."))}async function D(s){await Fi(s),l("Defaults saved.")}function U(s=document.body){return t||(t=ua({onClipListing:S,onCancel:I,onCopyAgain:w,onClearModelCache:N,onToggleDiagnostics:B,onSettings:Z,onFieldChange:A,onCopyFullText:k,onCopyPlateOnly:P,onSettingsBack:j,onSaveDefaults:D}),t.mount(s),t.setMinimized(!0),b(),t)}function J(){E(),n?.abort(),n=null,t?.destroy(),t=null,i="",o=0,e=_t()}function O(){return e}return{mount:U,destroy:J,onClipListing:S,onCancel:I,onCopyAgain:w,onCopyFullText:k,onCopyPlateOnly:P,onFieldChange:A,onClearModelCache:N,onToggleDiagnostics:B,onSettings:Z,onSettingsBack:j,onSaveDefaults:D,getState:O,setStatus:l}}function qn(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?Hi(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function Hi(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const ce="/api";async function de(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),a=await n.text();let i=null;try{i=a?JSON.parse(a):null}catch{i=a}return{ok:n.ok,status:n.status,data:i}}async function Gi(){return de(`${ce}/auth/me`)}async function qi(){return de(`${ce}/get_user_local`)}async function ke(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),de(`${ce}/lead-clients?${t.toString()}`)}async function ji(e){return de(`${ce}/purchase-leads/clients/${e}?page=1`)}async function Ki(e){return de(`${ce}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function Wi(e){return de(`${ce}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function je(e,t=null){return de(`${ce}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function Yi(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),a=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const i=await fetch(a,{credentials:"include"});if(!i.ok)return[];const o=await i.json();return Array.isArray(o)?o:o?.data||o?.results||[]}catch{return[]}}const Y={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function jn(e){return String(e||"").replace(/\D/g,"")}function be(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function ie(e){const t=jn(e?.phone);if(t)return t;const n=String(e?.id||"").trim(),a=jn(n);return a&&a===n?a:""}function q(e,t){return[{label:e,value:t}]}function Ke(e,t=""){const n=Array.isArray(e)?e:[],a=t.trim().toLowerCase();if(a){const i=n.find(o=>String(o.label??o.nombre??o.name??"").toLowerCase().includes(a));if(i)return{label:i.label??i.nombre??i.name,value:i.value??i.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function xt(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:null,secondSurname:null}:t.length===1?{name:t[0],firstSurname:null,secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function Zi(e){const t=ie(e),{name:n,firstSurname:a,secondSurname:i}=xt(e.clientName);return{name:n,firstSurname:a,secondSurname:i,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function Ji(e){const{clip:t,clientId:n,me:a,localId:i,filters:o={},vehicle:r={}}=e,l=ie(t),d=be(t.plate),u=a?.id??0,m=Array.isArray(a?.rolesId)?a.rolesId:[6],{name:c,firstSurname:g,secondSurname:b}=xt(t.clientName),E=o.estado||Y.estado,v=o.origen||Y.origen,x=o.contacto||Y.forma_contacto,f=o.marca||Y.marca_comercial,h=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,p=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),L=Number(p.replace(",","."))||null,S=r.makeLabel||t.make||"",I=r.modelLabel||t.model||"",w=Number(t.year)||null,k=r.fuelLabel||Wn(t.fuel),P=r.transmissionLabel||Yn(t.transmission);return{data:{toggle:!1,nombre:c,telefono1:l||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:q(E.label,E.value),origen:q(v.label,v.value),forma_contacto:q(x.label,x.value),marca_comercial:q(f.label,f.value),email:null,telefono2:null,apellido1:g,apellido2:b,kilometros:h,importado:!1,matricula:d||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:L,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:k?q(k,r.fuelValue??k):null,ccambios:P?q(P,r.transmissionValue??P):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:u,id_agente_modify:u,rol:m,vehiculo:{marca_vehiculo:S?q(S,r.makeValue??S):[],modelo:I?q(I,r.modelValue??I):[],matriculacion:w?q(w,w):[],combustible:k?q(k,r.fuelValue??k):[],ccambios:P?q(P,r.transmissionValue??P):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:i||Y.id_local_actual}}function Ae(e,t=""){const n=Array.isArray(e)?e:[],a=String(t||"").trim().toLowerCase();if(!a)return null;const i=d=>String(d?.label??d?.nombre??d?.name??"").trim(),o=d=>d?.value??d?.id,r=n.find(d=>i(d).toLowerCase()===a);if(r)return{label:i(r),value:o(r)};const l=n.find(d=>{const u=i(d).toLowerCase();return u.includes(a)||a.includes(u)});return l?{label:i(l),value:o(l)}:null}function Kn(e){return String(e||"").trim().toLowerCase()==="vw"?"Volkswagen":""}async function Xi(e,t){const n={};if(!e?.make||typeof t!="function")return n;const a=await t("makes"),i=Ae(a,e.make)||Ae(a,Kn(e.make));if(!i)return n;if(n.makeLabel=i.label,n.makeValue=i.value,e.model){const o=await t("models",{makeId:String(i.value)}),r=Ae(o,e.model);if(r){n.modelLabel=r.label,n.modelValue=r.value;const l=String(e.year||"").trim();if(l){const d=Wn(e.fuel);if(d){const u=await t("fuels",{makeId:String(i.value),modelId:String(r.value),year:l}),m=Ae(u,d);if(m){n.fuelLabel=m.label,n.fuelValue=m.value;const c=Yn(e.transmission);if(c){const g=await t("transmissions",{makeId:String(i.value),modelId:String(r.value),year:l,fuelId:String(m.value)}),b=Ae(g,c);b&&(n.transmissionLabel=b.label,n.transmissionValue=b.value)}}}}}}return n}function Wn(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function Yn(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const Qi="LeadDeskDB",eo=["Audi","BMW","BYD","Citroën","Cupra","Dacia","Fiat","Ford","Honda","Hyundai","Jaguar","Jeep","Kia","Mercedes-Benz","MG","Mini","Mitsubishi","Nissan","Opel","Peugeot","Porsche","Renault","Seat","Skoda","Tesla","Toyota","Volkswagen","Volvo"],to=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],no=["Manual","Automática"];function Ct(e,t,n){const a=String(t||"").trim();if(!a)return"";const i=e.find(l=>l===a);if(i)return i;const o=a.toLowerCase(),r=e.find(l=>l.toLowerCase()===o);if(r)return r;if(n){const l=n(a);if(l&&e.includes(l))return l}return a}function ao(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function io(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function oo(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function wt(){return new Promise((e,t)=>{const n=indexedDB.open(Qi);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function ro(e){const t=await wt();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}async function lo(e){const t=await wt();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}function Zn(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function so(e){const t=await wt(),n=new Date().toISOString(),a=ie(e),i=oo(e.plate),o=Zn("client"),r=Zn("lead"),{name:l,firstSurname:d,secondSurname:u}=xt(e.clientName),m=d||"",c=u||"",g={id:o,firstName:l,firstSurname:m,secondSurname:c,phone:a,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:a,createdAt:n,updatedAt:n},b={id:r,clientId:o,plate:i,plateNormalized:i,phone:a,phoneNormalized:a,fullName:l,firstSurname:m,secondSurname:c,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:Ct(eo,e.make||"",Kn),model:e.model||"",year:e.year||"",fuel:Ct(to,e.fuel||"",ao),transmission:Ct(no,e.transmission||"",io),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((E,v)=>{const x=t.transaction(["clients","leads"],"readwrite");x.objectStore("clients").put(g),x.objectStore("leads").put(b),x.oncomplete=()=>E(void 0),x.onerror=()=>v(x.error)}),r}function Jn(e,t={}){const n=t.open||((...l)=>window.open(...l)),a=t.assign||(l=>location.assign(l)),i=t.origin||location.origin,o=new URL(e,i).href,r=n(o,"_blank");if(r){try{r.opener=null}catch{}return"new-tab"}return a(e),"same-tab"}function Xn(e={}){const t=e.open||((...o)=>window.open(...o)),n=e.assign||(o=>location.assign(o)),a=e.origin||location.origin,i=t("about:blank","_blank");if(i)try{i.opener=null}catch{}return{go(o){const r=new URL(o,a).href;return i&&!i.closed?(i.location.href=r,"new-tab"):(n(o),"same-tab")},cancel(){try{i?.close()}catch{}}}}function Qn(e,t,n,a=()=>location.reload()){if(e==="new-tab"){n?.setStatus?.(`Lead ${t} criado. Aberto em nova aba. A atualizar a lista…`,"ok"),a();return}n?.setStatus?.(`Lead ${t} criado. Pop-up bloqueado — abrindo nesta aba…`,"warn")}const co=`
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
`,uo="Alt+V",fo="Alt+B",po="Alt+A",mo="⌥V",go="⌥B",ho="⌥A";function bo(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function yo(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=co;const i=bo(),o=i?mo:uo,r=i?go:fo,l=i?ho:po,d=document.createElement("div");d.className="lcf-panel";const u=document.createElement("div");u.className="lcf-header";const m=document.createElement("div");m.className="lcf-title",m.textContent="CRM · Leads";const c=document.createElement("span");c.className="lcf-badge",c.textContent="CRM";const g=document.createElement("button");g.type="button",g.className="lcf-mini",g.setAttribute("aria-label","Minimizar painel"),g.title="Minimizar",g.textContent="–",u.append(m,c,g);const b=document.createElement("div");b.className="lcf-body";const E=document.createElement("div");E.className="lcf-hint",E.textContent=`Cole o texto do Clipper (com LEAD_CLIP_V1) ou use Ler área de transferência (${o}). Com dados válidos, a verificação do cadastro corre automaticamente. Abrir 1.º lead: ${l}. Criar lead: ${r}.`;const v=document.createElement("textarea");v.className="lcf-textarea",v.placeholder="Cole aqui o texto do Clipper…";const x=document.createElement("div");x.className="lcf-summary",x.hidden=!0;const f=document.createElement("div");f.className="lcf-section-label",f.textContent="Leads encontrados",f.hidden=!0;const h=document.createElement("ul");h.className="lcf-matches";const p=document.createElement("div");p.className="lcf-actions";const L=document.createElement("button");L.type="button",L.className="lcf-btn lcf-btn-primary",L.title=`Atalho: ${o}`;const S=document.createElement("span");S.textContent="Ler área de transferência";const I=document.createElement("span");I.className="lcf-kbd",I.textContent=o,L.append(S,I);const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-success",w.title=`Atalho: ${r}`,w.disabled=!0,w.hidden=!0;const k=document.createElement("span");k.textContent="Criar lead";const P=document.createElement("span");P.className="lcf-kbd",P.textContent=r,w.append(k,P),p.append(L,w);const A=document.createElement("div");A.className="lcf-status",A.dataset.tone="",A.textContent="Aguardando dados do anúncio.",b.append(E,v,x,f,h,p,A),d.append(u,b),n.append(a,d),document.documentElement.append(t);let N=!1,B=null;function Z(){d.classList.toggle("lcf-panel--minimized",N),b.hidden=N,g.textContent=N?"+":"–",g.setAttribute("aria-label",N?"Expandir painel":"Minimizar painel"),g.title=N?"Expandir":"Minimizar"}function j(s){N=!!s,Z()}g.addEventListener("click",()=>{j(!N)}),Z();let D=!1,U=0,J=0;u.addEventListener("pointerdown",s=>{if(s.target===g)return;D=!0;const C=d.getBoundingClientRect();U=s.clientX-C.left,J=s.clientY-C.top,u.setPointerCapture(s.pointerId)}),u.addEventListener("pointermove",s=>{D&&(d.style.left=`${s.clientX-U}px`,d.style.top=`${s.clientY-J}px`,d.style.right="auto",d.style.bottom="auto")}),u.addEventListener("pointerup",()=>{D=!1}),L.addEventListener("click",()=>e.onReadClipboard()),v.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(v.value),0)}),w.addEventListener("click",()=>e.onCreate());function O(s){if(!(!s.altKey||s.ctrlKey||s.metaKey||s.shiftKey)){if(s.code==="KeyV"){s.preventDefault(),N&&j(!1),L.disabled||e.onReadClipboard();return}if(s.code==="KeyB"){if(w.hidden||w.disabled)return;s.preventDefault(),e.onCreate();return}if(s.code==="KeyA"){if(!B)return;s.preventDefault(),B()}}}return window.addEventListener("keydown",O),{setBadge(s){c.textContent=s},setStatus(s,C=""){A.textContent=s,A.dataset.tone=C||""},setText(s){v.value=s},getText(){return v.value},setSummary(s){if(!s){x.hidden=!0,x.textContent="";return}x.hidden=!1,x.innerHTML=s},setCreateVisible(s,C=!0){w.hidden=!s,w.disabled=!C},setMinimized:j,isMinimized(){return N},setMatches(s,C){h.replaceChildren(),f.hidden=s.length===0,B=s.length>0?()=>C(s[0].id):null,s.forEach((T,$)=>{const R=document.createElement("li"),V=document.createElement("div");V.className="lcf-match";const z=document.createElement("div");z.className="lcf-match-title",z.textContent=T.title;const X=document.createElement("div");X.className="lcf-match-sub",X.textContent=T.subtitle;const F=document.createElement("button");F.type="button",F.className="lcf-match-open",F.textContent=$===0?`Abrir lead → (${l})`:"Abrir lead →",$===0&&(F.title=`Atalho: ${l}`),F.addEventListener("click",()=>C(T.id)),V.append(z,X,F),R.append(V),h.append(R)})},clearMatches(){h.replaceChildren(),f.hidden=!0,B=null},destroy(){window.removeEventListener("keydown",O),t.remove()}}}function ea(e,t){return e==="new-tab"?[`Lead ${t} aberto em nova aba.`,"ok"]:[`Lead ${t}: pop-up bloqueado — abrindo nesta aba…`,"warn"]}function vo(){let e=null,t=null,n=!1,a=null,i=null;function o(){const f=qn();return t?.setBadge(f.label),f.kind==="leadDetail"&&i!=="leadDetail"&&t?.setMinimized(!0),i=f.kind,f}function r(f){const h=_i(f);if(t?.clearMatches(),t?.setCreateVisible(!1),!h.ok)return e=null,t?.setSummary(null),t?.setStatus(`Falha ao analisar o texto: ${h.error}`,"error"),!1;e=h.payload,t?.setText(f);const p=ie(e);return t?.setSummary([`<div><strong>ID</strong> ${_e(e.id)}</div>`,`<div><strong>Placa</strong> ${_e(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${_e(p||"—")}</div>`,`<div><strong>Veículo</strong> ${_e([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${_e(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0}async function l(){try{const f=await navigator.clipboard.readText();t?.setText(f),r(f)&&await u()}catch(f){const h=f instanceof Error?f.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${h}). Cole o texto do Clipper no campo acima.`,"warn")}}async function d(f){r(f)&&await u()}async function u(){if(!e||n)return;if(o().backend==="leaddesk"){await m();return}await c()}async function m(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const f=be(e.plate),h=ie(e);let p=[];if(f&&(p=await ro(f)),p.length===0&&h&&(p=await lo(h)),!f&&!h){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(p.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const L=p.map(S=>({id:S.id,title:`Lead ${S.plate||S.id}`,subtitle:`${S.phone||"—"} · ${[S.make,S.model,S.year].filter(Boolean).join(" · ")||"—"} · ${S.leadStatus||""} · ${S.updatedAt||""}`.trim()}));t?.setMatches(L,S=>{const I=Jn(`/crm/leads/${S}`),[w,k]=ea(I,S);t?.setStatus(w,k)}),t?.setStatus(L.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":`${L.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(f){const h=f instanceof Error?f.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${h}`,"error")}finally{n=!1}}async function c(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const f=be(e.plate),h=ie(e);let p;if(f)p=await ke({plate:f}),p.ok&&Array.isArray(p.data)&&p.data.length===0&&h&&(p=await ke({phone:h}));else if(h)p=await ke({phone:h});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!p.ok){t?.setStatus(`Falha na verificação (HTTP ${p.status}). Está autenticado no CRM?`,"error");return}const L=Array.isArray(p.data)?p.data:[];if(L.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const S=[];for(const w of L){const k=w?.purchaseLead?.id;if(k)S.push({id:k,title:`Lead #${k}`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""} · ${w.purchaseLead?.statusName||""}`.trim()});else if(w?.id){const A=(await ji(w.id)).data?.results||[];for(const N of A)S.push({id:N.id,title:`Lead #${N.id}`,subtitle:`Placa ${N.plate||"—"} · ${N.status?.name||""} · ${N.lastAction||""}`.trim()});A.length===0&&S.push({id:`client:${w.id}`,title:`Cliente #${w.id} (sem lead de compra)`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""}`.trim()})}}const I=S.filter(w=>String(w.id).match(/^\d+$/));t?.setMatches(I.length?I:S,w=>{if(String(w).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const k=Jn(`/main/lead-tasacion/${w}`),[P,A]=ea(k,w);t?.setStatus(P,A)}),t?.setStatus(I.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":I.length>1?`${I.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",I.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(f){const h=f instanceof Error?f.message:"erro";t?.setStatus(`Erro na verificação: ${h}`,"error")}finally{n=!1}}async function g(){if(!e||n)return;if(o().backend==="leaddesk"){await b();return}await E()}async function b(){if(!ie(e)&&!be(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}const h=Xn();n=!0,t?.setStatus("Criando no LeadDesk…");try{const p=await so(e),L=h.go(`/crm/leads/${p}`);Qn(L,p,t)}catch(p){h.cancel();const L=p instanceof Error?p.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${L}`,"error")}finally{n=!1}}async function E(){const f=ie(e);if(!f&&!be(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(!confirm("Criar cliente/lead no CRM com os dados copiados?"))return;const h=Xn();n=!0,t?.setStatus("Criando no CRM…");try{const p=await Gi();if(!p.ok||!p.data?.id){h.cancel(),t?.setStatus(`Falha de autenticação (HTTP ${p.status}). Faça login no CRM.`,"error");return}const L=p.data,S=await qi(),I=Array.isArray(S.data)&&S.data[0]?.value||Y.id_local_actual,[w,k,P,A]=await Promise.all([je("estado_lead_compra"),je("origen_lead_compra"),je("contacto"),je("marcas_comerciales",L.id)]),N={estado:Ke(w.data,"Avaliação")||Y.estado,origen:Ke(k.data,"Captación")||Y.origen,contacto:Ke(P.data,"Whatsapp")||Y.forma_contacto,marca:Ke(A.data,"")||Y.marca_comercial};let B=null;if(f){const O=await ke({phone:f});O.ok&&Array.isArray(O.data)&&O.data[0]?.id&&(B=O.data[0].id)}if(!B){const O=await Ki(Zi(e));if(O.status===409)B=(await ke({phone:f||void 0,plate:be(e.plate)||void 0})).data?.[0]?.id;else if(O.ok&&O.data?.resourceId)B=O.data.resourceId;else{h.cancel(),t?.setStatus(`Falha ao criar cliente (HTTP ${O.status}): ${JSON.stringify(O.data)}`,"error");return}}if(!B){h.cancel(),t?.setStatus("Não foi possível obter clientId.","error");return}const Z=await Xi(e,Yi),j=Ji({clip:e,clientId:B,me:L,localId:I,filters:N,vehicle:Z}),D=await Wi(j);if(!D.ok){h.cancel(),t?.setStatus(`Falha create_lead_compra (HTTP ${D.status}): ${JSON.stringify(D.data)}`,"error");return}const U=D.data?.id_lead;if(!U){h.cancel(),t?.setStatus(`Resposta inesperada: ${JSON.stringify(D.data)}`,"error");return}const J=h.go(`/main/lead-tasacion/${U}`);Qn(J,U,t)}catch(p){h.cancel();const L=p instanceof Error?p.message:"erro";t?.setStatus(`Erro ao criar: ${L}`,"error")}finally{n=!1}}function v(){if(t)return t;t=yo({onReadClipboard:l,onParseText:d,onCreate:g}),o(),window.addEventListener("popstate",o),a=new MutationObserver(()=>o());const f=document.getElementById("app")||document.body;return f&&a.observe(f,{childList:!0,subtree:!0}),l(),t}function x(){window.removeEventListener("popstate",o),a?.disconnect(),a=null,t?.destroy(),t=null,e=null,i=null}return{mount:v,destroy:x,refreshContext:o}}function _e(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const Et="__LEAD_CRM_FILLER_INITIALIZED__",xo="lead-crm-filler-root";function Co(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:qn().backend!=="none"?wo():Eo()}function wo(){if(window[Et])return{started:!1,reason:"already-initialized"};if(document.getElementById(xo))return window[Et]=!0,{started:!1,reason:"panel-exists"};window[Et]=!0;const e=vo(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function Eo(){if(window[Je])return{started:!1,reason:"already-initialized"};if(document.getElementById(Re))return window[Je]=!0,{started:!1,reason:"panel-exists"};window[Je]=!0;const e=zi(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}Co()})();
