(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();
(function(){"use strict";const nt="Vehicle Listing Clipper",De="vlc_prod_",Ft="vehicle-listing-clipper",at="__VLC_PROD_INITIALIZED__",Oe="vlc-panel-root";function Bt(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,plateImageIndex:null,plateImageUrl:"",plateConfidence:null,diagnosticsVisible:!1,lastDiagnostics:null}}const Fe={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},it=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Vt={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},Ut=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function ha(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function va(e={}){return{...Fe,...e}}function zt({extracted:e=null,plate:t="",defaults:n={},plateImage:a=null}={}){const i=va(n),o=ha(),r={},l=[],d=[],u=[],b=[...e?.warnings||[]];function c(m,g,f){const S=g==null?"":String(g);if(o[m]=S,!S){r[m]="missing";return}r[m]=f,f==="extracted"||f==="anpr"?l.push(m):f==="default"&&d.push(m)}const v=t?String(t).trim():"";c("plate",v,v?"anpr":"missing");const E=e?.clientName?String(e.clientName).trim():"";c("clientName",E,E?"extracted":"missing"),c("make",e?.make||"",e?.make?"extracted":"missing"),c("model",e?.model||"",e?.model?"extracted":"missing"),c("year",e?.year||"",e?.year?"extracted":"missing"),c("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),c("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),c("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),c("engine",e?.engine||"",e?.engine?"extracted":"missing"),c("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),c("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),c("url",e?.url||"",e?.url?"extracted":"missing"),c("paintParts",i.paintParts,"default"),c("bodyParts",i.bodyParts,"default"),c("tires",i.tires,"default"),c("saleReason",i.saleReason,"default"),c("keyCount",i.keyCount,"default"),c("deductibleVat",i.deductibleVat,"default");const y=a&&typeof a.index=="number"&&Number.isFinite(a.index)&&a.index>0?Math.floor(a.index):null,C=a&&typeof a.url=="string"?a.url.trim():"",h=v&&a&&typeof a.confidence=="number"&&Number.isFinite(a.confidence)?a.confidence:null;return{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:o.clientName||e?.clientName||""},fields:o,origins:r,metadata:{extractedFields:[...new Set(l)],defaultedFields:[...new Set(d)],editedFields:u,warnings:b,plateImageIndex:y,plateImageUrl:C,plateConfidence:h}}}function Ht(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(i=>i&&i!=="url"):!1}function ya(e,t,n){const a=n==null?"":String(n),i={...e.fields,[t]:a},o={...e.origins,[t]:a?"edited":"missing"},r=[...new Set([...e.metadata.editedFields||[],t])],l={...e.metadata,editedFields:r};return t==="plate"&&(l.plateConfidence=null),{...e,fields:i,origins:o,source:{...e.source,url:t==="url"?a:e.source.url,clientName:t==="clientName"?a:e.source.clientName},metadata:l}}const Ie="[A-Z]",Ae="[0-9]",xa=[{id:"LLDDDD",re:new RegExp(`^${Ie}{2}${Ae}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${Ae}{4}${Ie}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${Ae}{2}${Ie}{2}${Ae}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${Ie}{2}${Ae}{2}${Ie}{2}$`)}],Ca={0:"O",1:"I",5:"S",8:"B"},wa={O:"0",I:"1",L:"1",S:"5",B:"8"};function Be(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function be(e){const t=Be(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Ea(e){const t=Be(e);if(t.length!==6)return null;for(const n of xa)if(n.re.test(t))return n.id;return null}function ot(e,t){const n=Be(e).slice(0,6).split("");if(n.length!==6)return[];const a=[];function i(o,r,l){if(r>t)return;if(o===6){const c=l.join(""),v=Ea(c);v&&a.push({plate:c,corrections:r,patternId:v});return}if(i(o+1,r,l),r>=t)return;const d=l[o],u=Ca[d];if(u){const c=l.slice();c[o]=u,i(o+1,r+1,c)}const b=wa[d];if(b){const c=l.slice();c[o]=b,i(o+1,r+1,c)}}return i(0,0,n),a.sort((o,r)=>o.corrections-r.corrections||r.plate.localeCompare(o.plate)),a}function Gt(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let a=0;for(let i=0;i<n;i+=1)a+=e[i]??0;return a/n}function Sa(e){if(typeof e!="number"||!Number.isFinite(e))return null;const t=e>1?e/100:e;return Math.round(Math.min(1,Math.max(0,t))*100)}const La=.9;function rt(e){return typeof e=="number"&&Number.isFinite(e)&&e>=La}function Ia(e,t){if(!e)return t;const n=typeof e.meanConfidence=="number"&&Number.isFinite(e.meanConfidence)?e.meanConfidence:-1;return(typeof t.meanConfidence=="number"&&Number.isFinite(t.meanConfidence)?t.meanConfidence:-1)>n?t:e}function Aa(e,t=[],n={}){const a=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,o=Be(e);if(o.length<6)return{accepted:!1,plate:o,plateFormatted:be(o),patternId:null,corrections:0,meanConfidence:Gt(t,o.length),reason:"too-short"};const r=o.slice(0,6),l=Gt(t,6),d=ot(r,0);if(d.length>0&&l>=a){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:be(c.plate),patternId:c.patternId,corrections:0,meanConfidence:l}}const u=ot(r,1).filter(c=>c.corrections===1);if(u.length>0&&l>=i){const c=u[0];return{accepted:!0,plate:c.plate,plateFormatted:be(c.plate),patternId:c.patternId,corrections:1,meanConfidence:l}}return ot(r,2).some(c=>c.corrections>1)&&d.length===0&&u.length===0?{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:2,meanConfidence:l,reason:"excessive-corrections"}:d.length>0||u.length>0?{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:d.length?0:1,meanConfidence:l,reason:"low-confidence"}:{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:0,meanConfidence:l,reason:"no-reliable-pattern"}}function qt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function ka(e){let t=null;const n=new Map;let a="listing";function i(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function o(){t&&(t.replaceChildren(),n.clear())}const r='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>';function l(y,C,h="missing",m,g={}){const f=document.createElement("label");f.className=`vlc-field ${qt(h)}`,f.dataset.field=y;const S=document.createElement("span");S.className="vlc-field-label";const L=document.createElement("span");L.className="vlc-field-label-text",L.textContent=m||Vt[y]||y;const I=document.createElement("span");I.className="vlc-field-origin",h==="anpr"?I.hidden=!0:I.textContent=h;const w=document.createElement("span");w.className="vlc-field-label-meta",w.appendChild(I);let A=null;if(y==="plate"){const _=Sa(g.plateConfidence);_!=null&&h==="anpr"&&(A=document.createElement("span"),A.className="vlc-plate-confidence-badge",rt(g.plateConfidence)||A.classList.add("vlc-plate-confidence-badge--low"),A.textContent=`${_}%`,A.title=`Confiança do reconhecimento: ${_}%`,w.appendChild(A))}if(y==="plate"&&g.plateImageIndex!=null&&g.plateImageIndex>0){const _=document.createElement("span");if(_.className="vlc-plate-image-badge",_.textContent=`img ${g.plateImageIndex}`,_.title=`Placa encontrada na imagem ${g.plateImageIndex}`,w.appendChild(_),g.plateImageUrl){const N=document.createElement("button");N.type="button",N.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",N.title=`Ver imagem ${g.plateImageIndex}`,N.setAttribute("aria-label",`Ver imagem ${g.plateImageIndex} da placa`),N.innerHTML=r,N.addEventListener("mousedown",D=>{D.preventDefault()}),N.addEventListener("click",D=>{D.preventDefault(),D.stopPropagation(),e.onPreviewPlateImage?.()}),w.appendChild(N)}}const k=document.createElement("input");k.type="text",k.className="vlc-field-input",k.value=C??"",k.dataset.field=y,k.addEventListener("input",()=>{a==="listing"&&(e.onFieldChange(y,k.value),f.className=`vlc-field ${qt("edited")}`,I.hidden=!1,I.textContent="edited",A&&(A.remove(),A=null))}),S.append(L,w),f.append(S,k),n.set(y,k),t?.appendChild(f)}function d(){const y=document.createElement("div");y.className="vlc-form-actions";const C=document.createElement("button");C.type="button",C.className="vlc-btn vlc-btn-primary",C.textContent="Copy full text",C.addEventListener("click",()=>e.onCopyFullText());const h=document.createElement("button");h.type="button",h.className="vlc-btn",h.textContent="Copy plate only",h.addEventListener("click",()=>e.onCopyPlateOnly()),y.append(C,h),t?.appendChild(y)}function u(y,{phone:C="",plateImageIndex:h=null,plateImageUrl:m="",plateConfidence:g=null}={}){a="listing",i(),o(),t.hidden=!1;const f=document.createElement("div");f.className="vlc-form-heading",f.textContent="Review listing",t.appendChild(f);const S=C==null?"":String(C).trim();l("phone",S,S?"extracted":"missing","Telefone");for(const L of it){let I=y.fields[L]||"",w=y.origins[L]||"missing";L==="clientName"&&!I&&y.source?.clientName&&(I=String(y.source.clientName),w="extracted");const A=L==="plate"?{plateImageIndex:h??y.metadata?.plateImageIndex??null,plateImageUrl:m||y.metadata?.plateImageUrl||"",plateConfidence:g??y.metadata?.plateConfidence??null}:{};l(L,I,w,void 0,A)}d()}function b(y){a="settings",i(),o(),t.hidden=!1;const C=document.createElement("div");C.className="vlc-form-heading",C.textContent="Default values",t.appendChild(C);for(const f of Ut)l(f,y[f]||"","default");const h=document.createElement("div");h.className="vlc-form-actions";const m=document.createElement("button");m.type="button",m.className="vlc-btn vlc-btn-primary",m.textContent="Save defaults",m.addEventListener("click",()=>{const f={};for(const S of Ut)f[S]=n.get(S)?.value??"";e.onSaveDefaults?.(f)});const g=document.createElement("button");g.type="button",g.className="vlc-btn",g.textContent="Back",g.addEventListener("click",()=>e.onBack?.()),h.append(m,g),t.appendChild(h)}function c(){t&&(t.hidden=!0)}function v(){const y=n.get("plate");y&&(y.focus(),y.select())}function E(y,{phone:C}={}){if(a==="listing"){if(C!==void 0){const h=n.get("phone");h&&document.activeElement!==h&&(h.value=C==null?"":String(C))}for(const h of it){const m=n.get(h);if(m&&document.activeElement!==m){let g=y.fields[h]||"";h==="clientName"&&!g&&y.source?.clientName&&(g=String(y.source.clientName)),m.value=g}}}}return{ensureRoot:i,showListing:u,showSettings:b,syncListingValues:E,focusPlateField:v,hide:c,getMode:()=>a,getElement:()=>i()}}const Pa=`
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

.vlc-plate-preview-overlay--confirm .vlc-plate-preview-img {
  max-height: min(48vh, 520px);
}

.vlc-plate-confirm {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #b45309;
  background: #451a03;
}

.vlc-plate-confirm[hidden] {
  display: none !important;
}

.vlc-plate-confirm-alert {
  align-self: flex-start;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
  background: #b45309;
  color: #fffbeb;
}

.vlc-plate-confirm-msg {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #fde68a;
}

.vlc-plate-confirm-value {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #f9fafb;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.vlc-plate-confirm-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.vlc-plate-confidence-badge {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 1px 5px;
  border-radius: 3px;
  border: 1px solid #2563eb;
  background: #1e3a8a;
  color: #93c5fd;
}

.vlc-plate-confidence-badge--low {
  border-color: #b45309;
  background: #451a03;
  color: #fcd34d;
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

.vlc-icon.vlc-icon-sm {
  width: 12px;
  height: 12px;
}

.vlc-btn-plate-preview .vlc-icon {
  width: 12px;
  height: 12px;
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

.vlc-field-origin[hidden] {
  display: none !important;
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
`,_a="Alt+C",Ta="⌥C";function Na(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function Ra(e){let t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,b=null,c=null,v=null,E=null,y=null,C=null,h=null,m=null,g=null,f=null,S=null,L=null,I=null,w=null,A=null,k=null,_=null,N=null,D=!1,V=null,U=!0,G="waiting",j=!1,F=null,O="",s=null,x=0,R=0,M=null;const T=Na()?Ta:_a;function q(p){return`${p} (${T})`}const z=ka({onFieldChange:(p,P)=>e.onFieldChange(p,P),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:p=>e.onSaveDefaults(p),onPreviewPlateImage:()=>Nt()}),re='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',H='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>',B='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',W='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>';function J(){i&&(i.textContent=U?G:nt)}function te(){!n||!V||(n.classList.toggle("vlc-panel--minimized",U),V.innerHTML=U?re:H,V.setAttribute("aria-label",U?"Expand panel":"Minimize panel"),V.title=U?"Expand":"Minimize",J())}function Y(p){U=!!p,te()}function Qe(){Y(!U)}function $e(p){G=p,n?.classList.toggle("vlc-panel--ready",String(p).toLowerCase()==="ready to copy"),J()}function le(){u&&(u.disabled=!j),b&&(b.disabled=!j)}function et(p,P){if(!n)return;const $=n.getBoundingClientRect(),X=Math.max(0,window.innerWidth-$.width),K=Math.max(0,window.innerHeight-$.height),ae=Math.min(Math.max(0,p),X),ie=Math.min(Math.max(0,P),K);n.style.left=`${ae}px`,n.style.top=`${ie}px`,n.style.right="auto",n.style.bottom="auto"}function me(p){if(!n||!a||p.target?.closest("button")||p.button!==0)return;const $=n.getBoundingClientRect();s=p.pointerId,x=p.clientX-$.left,R=p.clientY-$.top,a.classList.add("vlc-header--dragging"),a.setPointerCapture(p.pointerId),p.preventDefault()}function se(p){s===p.pointerId&&et(p.clientX-x,p.clientY-R)}function ne(p){s===p.pointerId&&(s=null,a?.classList.remove("vlc-header--dragging"),a?.hasPointerCapture(p.pointerId)&&a.releasePointerCapture(p.pointerId))}function ge(p=document.body){if(document.getElementById(Oe))return t=document.getElementById(Oe),t;t=document.createElement("div"),t.id=Oe,t.setAttribute("data-vlc-panel","1");const P=t.attachShadow({mode:"open"}),$=document.createElement("style");$.textContent=Pa,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",nt),a=document.createElement("div"),a.className="vlc-header",a.addEventListener("pointerdown",me),a.addEventListener("pointermove",se),a.addEventListener("pointerup",ne),a.addEventListener("pointercancel",ne);const X=document.createElement("div");X.className="vlc-header-main";const K=document.createElement("div");K.className="vlc-header-text",i=document.createElement("h1"),i.className="vlc-title",i.textContent=nt,K.appendChild(i),v=document.createElement("div"),v.className="vlc-id-signals",v.hidden=!0,v.setAttribute("aria-label","Sinais de captura"),E=Rt("P","Matrícula"),E.classList.add("vlc-signal--plate"),y=Rt("T","Telefone"),y.classList.add("vlc-signal--phone"),C=Rt("R","ID aleatório"),C.classList.add("vlc-signal--random"),h=document.createElement("span"),h.className="vlc-plate-image-meta",h.hidden=!0,m=document.createElement("span"),m.className="vlc-plate-image-index",g=document.createElement("button"),g.type="button",g.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",g.innerHTML=B,g.hidden=!0,g.addEventListener("click",ba=>{ba.preventDefault(),ba.stopPropagation(),Nt()}),h.append(m,g),v.append(E,h,y,C),K.appendChild(v),X.appendChild(K),c=Q("Clip again",()=>e.onClipListing()),c.classList.add("vlc-btn-header-clip"),b=Q(q("Copy again"),()=>e.onCopyAgain()),b.classList.add("vlc-btn-header-copy"),b.title=`Shortcut: ${T}`,b.disabled=!0,V=document.createElement("button"),V.type="button",V.className="vlc-btn vlc-btn-icon",V.addEventListener("click",Qe);const ae=document.createElement("div");ae.className="vlc-header-actions",ae.append(c,b,V),a.append(X,ae);const ie=document.createElement("div");ie.className="vlc-body";const Le=document.createElement("div");Le.className="vlc-actions",l=Q("Clip listing",()=>e.onClipListing()),d=Q("Cancel",()=>e.onCancel()),d.disabled=!0,u=Q(q("Copy again"),()=>e.onCopyAgain()),u.title=`Shortcut: ${T}`,u.disabled=!0;const dr=Q("Clear model cache",()=>e.onClearModelCache()),ur=Q("Diagnostics",()=>e.onToggleDiagnostics()),fr=Q("Settings",()=>e.onSettings());Le.append(l,d,u,dr,ur,fr),o=document.createElement("div"),o.className="vlc-status",o.setAttribute("aria-live","polite"),r=document.createElement("div"),r.className="vlc-diag",r.hidden=!0;const pr=z.getElement();ie.append(Le,o,r,pr),n.append(a,ie),f=document.createElement("div"),f.className="vlc-plate-preview-overlay",f.hidden=!0,f.setAttribute("role","dialog"),f.setAttribute("aria-modal","true"),f.setAttribute("aria-label","Imagem da placa"),_=document.createElement("button"),_.type="button",_.className="vlc-plate-preview-backdrop",_.setAttribute("aria-label","Fechar preview"),_.addEventListener("click",()=>{D||Ee()});const Mt=document.createElement("div");Mt.className="vlc-plate-preview-dialog";const $t=document.createElement("div");$t.className="vlc-plate-preview-header",L=document.createElement("div"),L.className="vlc-plate-preview-caption",k=document.createElement("button"),k.type="button",k.className="vlc-btn vlc-btn-icon",k.innerHTML=W,k.setAttribute("aria-label","Fechar"),k.title="Fechar",k.addEventListener("click",()=>{if(D){we("discard");return}Ee()}),$t.append(L,k),S=document.createElement("img"),S.className="vlc-plate-preview-img",S.alt="Imagem onde a placa foi reconhecida",I=document.createElement("div"),I.className="vlc-plate-confirm",I.hidden=!0;const Dt=document.createElement("div");Dt.className="vlc-plate-confirm-alert",Dt.textContent="Confiança baixa",w=document.createElement("p"),w.className="vlc-plate-confirm-msg",A=document.createElement("p"),A.className="vlc-plate-confirm-value";const Ot=document.createElement("div");Ot.className="vlc-plate-confirm-actions";const ga=Q("Usar este valor",()=>{we("use")});ga.classList.add("vlc-btn-primary");const mr=Q("Editar valor",()=>{we("edit")}),gr=Q("Não usar placa",()=>{we("discard")});return Ot.append(ga,mr,gr),I.append(Dt,w,A,Ot),Mt.append($t,S,I),f.append(_,Mt),P.append($,n,f),te(),ma(),p.appendChild(t),window.addEventListener("keydown",Ce),window.addEventListener("keydown",pa),t}function Ce(p){!p.altKey||p.ctrlKey||p.metaKey||p.shiftKey||p.code==="KeyC"&&j&&(p.preventDefault(),e.onCopyAgain())}function pa(p){if(p.key==="Escape"&&!(!f||f.hidden)){if(p.preventDefault(),D){we("discard");return}Ee()}}function ma(){const p=F!=null&&Number.isFinite(F)&&F>0,P=!!String(O||"").trim();h&&(h.hidden=!p),m&&(m.textContent=p?String(F):"",m.title=p?`Placa encontrada na imagem ${F}`:""),g&&(g.hidden=!(p&&P),g.title=p?`Ver imagem ${F}`:"Ver imagem da placa",g.setAttribute("aria-label",p?`Ver imagem ${F} da placa`:"Ver imagem da placa")),E&&p?(E.title=`Matrícula (imagem ${F})`,E.setAttribute("aria-label",`Matrícula encontrada na imagem ${F}`)):E&&(E.title="Matrícula",E.setAttribute("aria-label","Matrícula"))}function Tt({index:p=null,url:P=""}={}){F=typeof p=="number"&&Number.isFinite(p)&&p>0?Math.floor(p):null,O=typeof P=="string"?P.trim():"",ma(),O||Ee()}function tt(){D=!1,I&&(I.hidden=!0),_&&(_.disabled=!1,_.style.cursor="pointer"),k&&(k.hidden=!1,k.title="Fechar",k.setAttribute("aria-label","Fechar")),f&&(f.setAttribute("aria-label","Imagem da placa"),f.classList.remove("vlc-plate-preview-overlay--confirm"))}function we(p){const P=N;N=null,tt(),f&&(f.hidden=!0),S&&S.removeAttribute("src"),P?.(p)}function Nt(){!f||!S||!O||(tt(),S.src=O,L&&(L.textContent=F!=null&&F>0?`Imagem ${F} — origem da placa`:"Imagem — origem da placa"),f.hidden=!1)}function Zo(p){const P=typeof p.imageUrl=="string"?p.imageUrl.trim():"",$=typeof p.imageIndex=="number"&&Number.isFinite(p.imageIndex)&&p.imageIndex>0?Math.floor(p.imageIndex):null;if(P&&Tt({index:$,url:P}),!f||!S||!O)return Promise.resolve("use");N&&we("discard"),Y(!1),tt(),D=!0,S.src=O;const X=typeof p.confidence=="number"&&Number.isFinite(p.confidence)?Math.round(Math.min(1,Math.max(0,p.confidence>1?p.confidence/100:p.confidence))*100):null;return L&&(L.textContent=$!=null?`Imagem ${$} — confiança baixa`:"Imagem — confiança baixa"),w&&(w.textContent=X!=null?`Nenhuma imagem atingiu 90% de confiança. A melhor leitura ficou em ${X}%. Quer usar este valor?`:"Nenhuma imagem atingiu 90% de confiança. Quer usar o valor encontrado?"),A&&(A.textContent=`Valor encontrado: ${p.plate||"—"}`),I&&(I.hidden=!1),_&&(_.disabled=!0,_.style.cursor="default"),k&&(k.title="Não usar placa",k.setAttribute("aria-label","Não usar placa")),f&&(f.setAttribute("aria-label","Confirmar matrícula com confiança baixa"),f.classList.add("vlc-plate-preview-overlay--confirm"),f.hidden=!1),new Promise(K=>{N=K})}function Ee(){D&&N||f&&(f.hidden=!0,S&&S.removeAttribute("src"),tt())}function Q(p,P){const $=document.createElement("button");return $.type="button",$.className="vlc-btn",$.textContent=p,$.addEventListener("click",P),$}function Rt(p,P){const $=document.createElement("span");return $.className="vlc-signal",$.textContent=p,$.title=P,$.setAttribute("aria-label",P),$.setAttribute("aria-pressed","false"),$}function Se(p,P){p&&(p.classList.toggle("vlc-signal--on",!!P),p.setAttribute("aria-pressed",P?"true":"false"))}function Jo(p){o&&(o.textContent=p)}function Qo(p){const P=!!p;l&&(l.disabled=P),c&&(c.disabled=P),d&&(d.disabled=!P)}function er({id:p="",isRandom:P=!1,hasPlate:$=!1,hasPhone:X=!1}={}){if(!v)return;const K=!!$,ae=!!X,ie=!!P;if(!(K||ae||ie||!!String(p||"").trim())){v.hidden=!0,Se(E,!1),Se(y,!1),Se(C,!1);return}v.hidden=!1,Se(E,K),Se(y,ae),Se(C,ie)}function tr(p){j=!!p,le()}function nr(p){const P=q(p||"Copy again");u&&(u.textContent=P,u.title=`Shortcut: ${T}`),b&&(b.textContent=P,b.title=`Shortcut: ${T}`)}function ar(p=2e3){M!=null&&(clearTimeout(M),M=null);for(const P of[b,u])P&&P.classList.add("vlc-btn--copied");M=setTimeout(()=>{M=null;for(const P of[b,u])P?.classList.remove("vlc-btn--copied")},p)}function ir(p,P=""){r&&(r.hidden=!p,r.textContent=P)}function or(p,{phone:P="",plateImageIndex:$,plateImageUrl:X,plateConfidence:K}={}){const ae=$!==void 0?$:p?.metadata?.plateImageIndex??F,ie=X!==void 0?X:p?.metadata?.plateImageUrl||O;Tt({index:ae,url:ie});const Le=K!==void 0?K:p?.metadata?.plateConfidence??null;z.showListing(p,{phone:P,plateImageIndex:F,plateImageUrl:O,plateConfidence:Le})}function rr(){z.focusPlateField()}function lr(p){z.showSettings(p)}function sr(){z.hide()}function cr(){M!=null&&(clearTimeout(M),M=null),window.removeEventListener("keydown",Ce),window.removeEventListener("keydown",pa),Ee(),a&&(a.removeEventListener("pointerdown",me),a.removeEventListener("pointermove",se),a.removeEventListener("pointerup",ne),a.removeEventListener("pointercancel",ne)),t?.remove(),t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,b=null,c=null,v=null,E=null,y=null,C=null,h=null,m=null,g=null,f=null,S=null,L=null,I=null,w=null,A=null,k=null,_=null,N=null,D=!1,V=null,U=!0,G="waiting",j=!1,F=null,O="",s=null}return{mount:ge,setStatus:Jo,setBusy:Qo,setClipboardId:er,setPlateImageSource:Tt,openPlateImagePreview:Nt,closePlateImagePreview:Ee,promptLowConfidencePlate:Zo,setCopyEnabled:tr,setCopyLabel:nr,flashCopySuccess:ar,setCaptureStatus:$e,setDiagnostics:ir,showListingForm:or,showSettingsForm:lr,hideForm:sr,focusPlateField:rr,setMinimized:Y,isMinimized:()=>U,toggleMinimized:Qe,destroy:cr}}function ke(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function Ve(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return ke(n)}function jt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function Kt(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function Wt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function Xt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function Yt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const i=Number.parseInt(n,10);if(i===99||i===999)return"1.0";if(i>=100)return(i/1e3).toFixed(1)}const a=t.replace(",",".");return a==="1"?"1.0":a}function Zt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const a=t.replace(/[^\d]/g,"");return a?`${a} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function Jt(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function Ue(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function ze(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function He(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return ze(t)}function oe(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let a=`${n.origin}${n.pathname}`;const o=a.toLowerCase().indexOf(".html");return o!==-1&&(a=a.slice(0,o+5)),a}catch{return""}}const Qt="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",en='#mainContent img[data-testid="swiper-image-lazy"]',tn="#mainContent div.swiper-wrapper img",nn=[Qt,en,tn],an='#mainContent button[data-testid="ad-contact-phone"]',on='#mainContent a[data-testid="contact-phone"][href^="tel:"]',rn='#mainContent [data-testid="ad-parameters-container"]',ln='#mainContent [data-testid="ad-price-container"] h3',lt='link#ssr_canonical[rel="canonical"]',sn='#mainContent [data-testid="offer_title"]',Ma='#mainContent [data-testid="ad_description"]',$a='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',cn='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',dn='script[type="application/ld+json"]';function Da(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function Oa(e=document){const t=pn(e);if(t&&he(t))return t;for(const n of fn(e))if(he(n))return n;return null}function Fa(e){return!!(e&&typeof e.click=="function")}function un(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function Pe(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function st(e){if(e.hidden)return!0;const n=un(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function he(e){if(!e||typeof e.getBoundingClientRect!="function"||st(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(Pe(e)>0)return!0;const n=un(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function fn(e=document){return[...e.querySelectorAll(an)].filter(t=>Fa(t))}function pn(e=document){const t=fn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(l=>!st(l)),i=[...n.length>0?n:t].sort((l,d)=>{const u=he(l)?1:0,b=he(d)?1:0;return u!==b?b-u:Pe(d)-Pe(l)}),o=(()=>{const l=i[0];return{visible:he(l)?1:0,area:Pe(l)}})(),r=i.filter(l=>(he(l)?1:0)===o.visible&&Pe(l)===o.area);return r[r.length-1]||i[i.length-1]||t[t.length-1]}function ct(e=document){const t=[...e.querySelectorAll(on)];for(const n of t){if(t.length>1&&st(n))continue;const a=n.getAttribute("href")||"",i=Ve(a);if(i)return i;const o=ke(n.textContent||"");if(o)return o}if(t.length>0){const n=t[t.length-1],a=n.getAttribute("href")||"",i=Ve(a);if(i)return i;const o=ke(n.textContent||"");if(o)return o}return null}function Ba(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function Va(e){try{e.click()}catch{}Ba(e)}async function Ua(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=ct(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await Da(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=Oa(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const b=Date.now()+n;for(Va(d);Date.now()<b;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=ct(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(v=>setTimeout(v,a))}return{ok:!1,reason:"timeout"}}function za(e){const t=new Map,n=e.querySelector(rn);if(!n)return t;for(const a of n.querySelectorAll("p")){const i=(a.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const o=i.indexOf(":");if(o<=0)continue;const r=i.slice(0,o).trim().toLowerCase(),l=i.slice(o+1).trim();r&&l&&t.set(r,l)}return t}function Ha(e){const t=e.querySelectorAll(dn);for(const n of t){const a=n.textContent||"";if(a.trim())try{const i=JSON.parse(a),o=Array.isArray(i)?i:[i];for(const r of o)if(r&&r["@type"]==="Vehicle")return r}catch{}}return null}function Ga(e){const n=(e.querySelector?.(lt)||(typeof document<"u"?document.querySelector(lt):null))?.getAttribute?.("href")||"";return n?oe(n):typeof location<"u"&&location?.href?oe(location.href):""}function qa(e){const t=e.querySelectorAll(cn);for(const n of t){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function ja(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function Ka(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Wa(e){const t=e.querySelector?.(Ma);if(!t)return"";const n=[...t.children||[]].find(i=>String(i.tagName||"").toUpperCase()!=="H3");if(n)return He(n.innerHTML||"");let a=He(t.innerHTML||"");return a=a.replace(/^Descrição\s*/i,""),ze(a)}function Xa(e=document){const t=[],n=[];function a(w,A){A&&t.push(w)}const i=za(e),o=Ha(e),r=Ga(e);a("url",r);const l=Ka(r,o);a("listingId",l);const u=(e.querySelector(sn)?.textContent||o?.name||"").replace(/\s+/g," ").trim();a("title",u);let b=Wa(e);b||(b=He(o?.description||"")),a("description",b);const v=(e.querySelector($a)?.textContent||"").replace(/\s+/g," ").trim();a("clientName",v);let E=ja(o);E||(E=qa(e)),E=Ue(E),a("make",E);let y=i.get("modelo")||o?.model||"";y=Ue(y),a("model",y);let C=i.get("ano")||o?.productionDate||o?.modelDate||"";C=Jt(C),a("year",C);const h=jt(i.get("quilómetros")||i.get("quilometros")||"");a("mileageKm",h);const m=Wt(i.get("tipo de caixa")||"");a("transmission",m);const g=Xt(i.get("combustível")||i.get("combustivel")||"");a("fuel",g);const f=Yt(i.get("cilindrada")||"");a("engine",f);const S=Zt(i.get("potência")||i.get("potencia")||"");a("powerCv",S);let L=o?.offers?.price;(L==null||L==="")&&(L=e.querySelector(ln)?.textContent||"");const I=Kt(L);return a("priceEur",I),(!E||!y)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"olx-pt",url:r,listingId:l,title:u,description:b,clientName:v,make:E,model:y,year:C,mileageKm:h,transmission:m,fuel:g,engine:f,powerCv:S,priceEur:I,extractedFields:[...new Set(t)],warnings:n}}function Ya(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),a=n[0],i=n[1];let o=null;return i&&/^\d+w$/i.test(i)&&(o=Number.parseInt(i,10)),{url:a,width:o}}).filter(t=>!!t.url)}function Za(e){const t=Ya(e);if(t.length===0)return null;const n=t.filter(i=>typeof i.width=="number");if(n.length===0)return t[t.length-1].url;let a=n[0];for(let i=1;i<n.length;i+=1)n[i].width>a.width&&(a=n[i]);return a.url}function mn(e){if(!e)return null;const t=Za(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function Ja(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function gn(e=document){for(const t of nn){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function dt(e=document){const{images:t,selectorUsed:n}=gn(e),a=[],i=new Set;for(const o of t){const r=mn(o);if(!r)continue;const l=Ja(r);i.has(l)||(i.add(l),a.push(l))}return{urls:a,count:a.length,selectorUsed:n}}async function Qa(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=dt(t);if(i.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=dt(t);return i}const bn={siteId:"olx-pt",discoverListingImages:dt,discoverListingImagesWithWait:Qa,queryGalleryImages:gn,extractListing:Xa,findPhoneRevealButton:pn,readRevealedPhone:ct,revealContactPhone:Ua,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:Qt,FALLBACK_TESTID_SELECTOR:en,FALLBACK_SWIPER_IMG_SELECTOR:tn,GALLERY_SELECTORS:nn,PHONE_REVEAL_BUTTON_SELECTOR:an,CONTACT_PHONE_SELECTOR:on,AD_PARAMETERS_SELECTOR:rn,AD_PRICE_SELECTOR:ln,CANONICAL_LINK_SELECTOR:lt,OFFER_TITLE_SELECTOR:sn,BREADCRUMB_ITEM_SELECTOR:cn,JSON_LD_SELECTOR:dn}},hn="script#__NEXT_DATA__",vn='h1.offer-title, [data-testid="summary-info-area"] h1',yn='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',xn='[data-testid="content-description-section"]',ut='link[rel="canonical"]',Ge='[data-testid="aside-seller-info"]',ei='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',Cn='[data-testid="seller-info-contact-box"]',wn='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',En='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',Sn='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',Ln=[En,Sn];function ti(e){return`[data-testid="${e}"] p:last-of-type`}const ni=/ver\s+telefone/i;function ai(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function ii(e){return!!(e&&typeof e.click=="function")}function In(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function ft(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function qe(e){if(e.hidden)return!0;const n=In(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function je(e){if(!e||typeof e.getBoundingClientRect!="function"||qe(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(ft(e)>0)return!0;const n=In(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function An(e){if(!ii(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return ni.test(t)}function kn(e=document){const t=[],n=new Set;function a(i){const o=e.querySelector?.(i)||null;if(o)for(const r of o.querySelectorAll("button"))!An(r)||n.has(r)||(n.add(r),t.push(r))}a(Ge),a(Cn);for(const i of e.querySelectorAll?.("button")||[])!An(i)||n.has(i)||(n.add(i),t.push(i));return t}function Pn(e=document){const t=kn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(Ge);if(n){const r=t.find(l=>n.contains(l)&&!qe(l));if(r)return r}const a=t.filter(r=>!qe(r));return[...a.length>0?a:t].sort((r,l)=>{const d=je(r)?1:0,u=je(l)?1:0;return d!==u?u-d:ft(l)-ft(r)})[0]||t[0]}function oi(e=document){const t=Pn(e);if(t&&je(t))return t;for(const n of kn(e))if(je(n))return n;return null}function pt(e=document){const t=[...e.querySelectorAll?.(wn)||[]],n=e.querySelector?.(Ge),a=n&&t.length>1?[...t.filter(i=>n.contains(i)),...t.filter(i=>!n.contains(i))]:t;for(const i of a){if(a.length>1&&qe(i))continue;const o=i.getAttribute("href")||"",r=Ve(o);if(r)return r;const l=ke(i.textContent||"");if(l)return l}if(a.length>0){const i=a[0],o=i.getAttribute("href")||"",r=Ve(o);if(r)return r;const l=ke(i.textContent||"");if(l)return l}return null}function ri(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function li(e){try{e.click()}catch{}ri(e)}async function si(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=pt(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await ai(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=oi(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const b=Date.now()+n;for(li(d);Date.now()<b;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=pt(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(v=>setTimeout(v,a))}return{ok:!1,reason:"timeout"}}const mt="https://www.standvirtual.com/";function _n(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function _e(e){const{value:t,label:n}=_n(e);return n||t}function Ke(e){const{value:t,label:n}=_n(e);return t||n}function Tn(e){const n=e.querySelector?.(hn)?.textContent||"";if(!n.trim())return null;try{const i=JSON.parse(n)?.props?.pageProps?.advert;return i&&typeof i=="object"?i:null}catch{return null}}function ci(e){const n=(e.querySelector?.(ut)||(typeof document<"u"?document.querySelector(ut):null))?.getAttribute?.("href")||"";return n?oe(n,mt):typeof location<"u"&&location?.href?oe(location.href,mt):""}function di(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function ce(e,t){return(e.querySelector?.(ti(t))?.textContent||"").replace(/\s+/g," ").trim()}function ui(e=document){const t=[],n=[];function a(A,k){k&&t.push(A)}const i=Tn(e),o=i?.parametersDict||{};let r="";i?.url&&(r=oe(i.url,mt)),r||(r=ci(e)),a("url",r);const l=di(r,i);a("listingId",l);const d=e.querySelector?.(vn),u=(i?.title||d?.textContent||"").replace(/\s+/g," ").trim();a("title",u);let b="";if(i?.description&&(b=He(i.description)),!b){const A=e.querySelector?.(xn);b=ze(A?.textContent||"")}a("description",b);let c="";i?.seller?.name&&(c=String(i.seller.name).replace(/\s+/g," ").trim()),c||(c=(e.querySelector?.(ei)?.textContent||"").replace(/\s+/g," ").trim()),a("clientName",c);let v=_e(o.make)||ce(e,"make")||"";v=Ue(v),a("make",v);let E=_e(o.model)||ce(e,"model")||"";E=Ue(E),a("model",E);let y=Ke(o.first_registration_year)||ce(e,"first_registration_year")||"";y=Jt(y),a("year",y);const C=jt(Ke(o.mileage)||ce(e,"mileage")||"");a("mileageKm",C);const h=Wt(_e(o.gearbox)||ce(e,"gearbox")||"");a("transmission",h);const m=Xt(_e(o.fuel_type)||ce(e,"fuel_type")||"");a("fuel",m);const g=Ke(o.engine_capacity)||ce(e,"engine_capacity")||"",f=/cm\s*3|cm3|\bcc\b/i.test(g)?g.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):g,S=Yt(f);a("engine",S);const L=Zt(Ke(o.engine_power)||_e(o.engine_power)||ce(e,"engine_power")||"");a("powerCv",L);let I=i?.price?.value;(I==null||I==="")&&(I=e.querySelector?.(yn)?.textContent||"");const w=Kt(I);return a("priceEur",w),(!v||!E)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"standvirtual-pt",url:r,listingId:l,title:u,description:b,clientName:c,make:v,model:E,year:y,mileageKm:C,transmission:h,fuel:m,engine:S,powerCv:L,priceEur:w,extractedFields:[...new Set(t)],warnings:n}}function Nn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function fi(e=document){const n=Tn(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const a=[],i=new Set;for(const o of n){const r=o?.url||o?.src||"";if(!r)continue;const l=Nn(String(r));i.has(l)||(i.add(l),a.push(l))}return a.length===0?null:{urls:a,count:a.length,selectorUsed:"next-data:images.photos"}}function Rn(e=document){for(const t of Ln){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function gt(e=document){const t=fi(e);if(t)return t;const{images:n,selectorUsed:a}=Rn(e),i=[],o=new Set;for(const r of n){const l=mn(r);if(!l)continue;const d=Nn(l);o.has(d)||(o.add(d),i.push(d))}return{urls:i,count:i.length,selectorUsed:a}}async function pi(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=gt(t);if(i.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=gt(t);return i}const Mn={siteId:"standvirtual-pt",discoverListingImages:gt,discoverListingImagesWithWait:pi,queryGalleryImages:Rn,extractListing:ui,findPhoneRevealButton:Pn,readRevealedPhone:pt,revealContactPhone:si,selectors:{PRIMARY_GALLERY_SELECTOR:En,FALLBACK_GALLERY_SELECTOR:Sn,GALLERY_SELECTORS:Ln,CONTACT_PHONE_SELECTOR:wn,ASIDE_SELLER_SELECTOR:Ge,CONTENT_CONTACT_SELECTOR:Cn,AD_PRICE_SELECTOR:yn,CANONICAL_LINK_SELECTOR:ut,OFFER_TITLE_SELECTOR:vn,DESCRIPTION_SELECTOR:xn,NEXT_DATA_SELECTOR:hn}},$n=new Map;function Dn(e){$n.set(e.siteId,e)}function On(e){return $n.get(e)}function Fn(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?On("standvirtual-pt")||Mn:On("olx-pt")||bn}Dn(bn),Dn(Mn);async function mi(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let a=null;for(const i of n)try{const o=new Blob([e],{type:i});return await createImageBitmap(o)}catch(o){a=o}try{const i=new Blob([e]);return await createImageBitmap(i)}catch(i){throw a||i}}function gi(e){const t=document.createElement("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(e,0,0);const a=n.getImageData(0,0,t.width,t.height);return{canvas:t,imageData:a,width:t.width,height:t.height}}const bt=new Map;function ht(){return typeof GM<"u"&&GM!=null}async function Bn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):ht()&&typeof GM.getValue=="function"?GM.getValue(e,t):bt.has(e)?bt.get(e):t}async function Vn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(ht()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}bt.set(e,t)}async function bi(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(ht()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function Un(e){const{method:t,url:n,responseType:a="arraybuffer",headers:i,signal:o}=e;return new Promise((r,l)=>{if(o?.aborted){l(new DOMException("Aborted","AbortError"));return}let d=null;const u=()=>{try{d?.abort?.()}catch{}l(new DOMException("Aborted","AbortError"))};o?.addEventListener("abort",u,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(c);return}l(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:a,headers:i,onload(c){o?.removeEventListener("abort",u);const v=c.status;if(v<200||v>=300){l(new Error(`HTTP ${v} for ${n}`));return}r(c.response)},onerror(){o?.removeEventListener("abort",u),l(new Error(`Network error for ${n}`))},ontimeout(){o?.removeEventListener("abort",u),l(new Error(`Timeout for ${n}`))}})})}async function hi(e,t={}){const{signal:n,request:a=Un}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await a({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:i}}function vi(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),a=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),i=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),o=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),r=Math.max(1,i-n),l=Math.max(1,o-a),d=document.createElement("canvas");d.width=e.width,d.height=e.height;const u=d.getContext("2d");return u.putImageData(e,0,0),u.getImageData(n,a,r,l)}function yi(e,t,n){const a=document.createElement("canvas");a.width=e.width,a.height=e.height,a.getContext("2d").putImageData(e,0,0);const i=document.createElement("canvas");i.width=n,i.height=t;const o=i.getContext("2d");o.drawImage(a,0,0,n,t);const{data:r}=o.getImageData(0,0,n,t),l=new Uint8Array(1*t*n*3);let d=0;for(let u=0;u<t*n;u+=1)l[d++]=r[u*4],l[d++]=r[u*4+1],l[d++]=r[u*4+2];return l}function xi(e,t,n=[114,114,114]){const{width:a,height:i}=e,o=Math.min(t/i,t/a),r=Math.round(a*o),l=Math.round(i*o),d=(t-r)/2,u=(t-l)/2,b=Math.round(u-.1),c=Math.round(d-.1),v=document.createElement("canvas");v.width=a,v.height=i,v.getContext("2d").putImageData(e,0,0);const y=document.createElement("canvas");y.width=t,y.height=t;const C=y.getContext("2d");C.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,C.fillRect(0,0,t,t),C.drawImage(v,0,0,a,i,c,b,r,l);const h=C.getImageData(0,0,t,t).data,m=new Float32Array(3*t*t),g=t*t;for(let f=0;f<g;f+=1){const S=h[f*4],L=h[f*4+1],I=h[f*4+2];m[f]=S/255,m[g+f]=L/255,m[2*g+f]=I/255}return{tensor:m,ratio:o,pad:{dw:d,dh:u},size:t}}function Ci(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const wi="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Ei="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Si="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",Li="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function zn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:wi},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Ei,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Si},ortWasmBaseUrl:Li}}const We={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Hn=null;function Ii(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function vt(){const e=Ii();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Gn=new Proxy({},{get(e,t){return vt()[t]}});function Ai(){const e=vt(),t=zn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function qn(e,t={}){Ai();const n=vt(),a=t.prefer||["webgpu","wasm"],i=[];for(const o of a)try{const r=await n.InferenceSession.create(e,{executionProviders:[o]});return Hn=o,{session:r,provider:o}}catch(r){i.push(`${o}: ${r instanceof Error?r.message:String(r)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function yt(){return Hn}const xt=384,ki="images",Pi="output0";async function _i(e,t,n={}){const a=n.confThresh??.4,{tensor:i,ratio:o,pad:r}=xi(t,xt),l=new Gn.Tensor("float32",i,[1,3,xt,xt]),d=await e.run({[ki]:l}),u=d[Pi]||Object.values(d)[0];if(!u)return[];const b=u.data,c=u.dims||[],v=c.length>=2?c[c.length-1]:7,E=Math.floor(b.length/v),y=[];for(let C=0;C<E;C+=1){const h=C*v,m=b[h+1],g=b[h+2],f=b[h+3],S=b[h+4],L=b[h+5],I=b[h+6];if(I<a)continue;const w=Ci({x1:m,y1:g,x2:f,y2:S},o,r);y.push({...w,score:Number(I),classId:Number(L)})}return y.sort((C,h)=>h.score-C.score),y}function Ti(e,t,n=We){const a=n.alphabet,i=n.maxPlateSlots,o=a.length,r=e,l=[],d=[];for(let b=0;b<i;b+=1){let c=0,v=-1/0;for(let E=0;E<o;E+=1){const y=Number(r[b*o+E]);y>v&&(v=y,c=E)}l.push(a[c]),d.push(v)}let u=l.join("");return n.padChar&&(u=u.replace(new RegExp(`${Ni(n.padChar)}+$`),"")),{text:u,charProbs:d.slice(0,Math.max(u.length,1))}}function Ni(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Ri(e,t){const{imgHeight:n,imgWidth:a}=We,i=yi(t,n,a),o=new Gn.Tensor("uint8",i,[1,n,a,3]),r=await e.run({input:o}),l=r.plate||Object.values(r)[0],d=l.dims||[1,We.maxPlateSlots,We.alphabet.length],u=d[d.length-1],c=d[d.length-2]*u,v=l.data,E=v.length>=c?v.slice(0,c):v;return Ti(E)}const de="models",Mi=1;let Xe=null;function Ct(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Xe||(Xe=new Promise((e,t)=>{const n=indexedDB.open(Ft,Mi);n.onupgradeneeded=()=>{const a=n.result;a.objectStoreNames.contains(de)||a.createObjectStore(de,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Xe)}async function jn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function $i(e){const t=await Ct();return new Promise((n,a)=>{const o=t.transaction(de,"readonly").objectStore(de).get(e);o.onsuccess=()=>{const r=o.result;n(r?.bytes||null)},o.onerror=()=>a(o.error)})}async function Di(e,t,n){const a=await Ct();return new Promise((i,o)=>{const r=a.transaction(de,"readwrite");r.objectStore(de).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),r.oncomplete=()=>i(),r.onerror=()=>o(r.error)})}async function Oi(){const e=await Ct();return new Promise((t,n)=>{const a=e.transaction(de,"readwrite");a.objectStore(de).clear(),a.oncomplete=()=>t(),a.onerror=()=>n(a.error)})}async function Kn(e,t={}){const{onStatus:n,signal:a}=t,i=await $i(e.id).catch(()=>null);if(i&&await jn(i)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const o=await Un({method:"GET",url:e.url,responseType:"arraybuffer",signal:a}),r=o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"?o:null;if(!r)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const l=await jn(r);if(l!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${l}`);return await Di(e.id,r,l).catch(()=>{}),{bytes:r,cacheHit:!1}}let Te=null;async function Fi(e={}){if(Te)return{sessions:Te,diagnostics:{provider:yt(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=zn(),n=await Kn(t.detector,e),a=await Kn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const i=await qn(n.bytes),o=await qn(a.bytes);return Te={detector:i.session,ocr:o.session},{sessions:Te,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:a.cacheHit}}}function Bi(){Te=null}async function Vi(e,t,n={}){const{signal:a}=n;let i=0,o;try{const l=await mi(t);o=gi(l).imageData,l.close?.()}catch{return null}const r=await _i(e.detector,o);for(const l of r){if(a?.aborted)throw new DOMException("Aborted","AbortError");i+=1;const d=vi(o,l),u=await Ri(e.ocr,d),b=Aa(u.text,u.charProbs);if(b.accepted)return{plate:b.plate,plateFormatted:b.plateFormatted,meanConfidence:typeof b.meanConfidence=="number"&&Number.isFinite(b.meanConfidence)?b.meanConfidence:null,detectionsTried:i}}return{plate:"",plateFormatted:"",meanConfidence:null,detectionsTried:i}}function Wn(e,t,n,a,i,o){return{ok:!0,plate:e.plate,plateFormatted:e.plateFormatted,meanConfidence:e.meanConfidence,needsConfirmation:o,imageIndex:e.imageIndex,imageUrl:e.imageUrl,diagnostics:{provider:yt()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:a,elapsedMs:Date.now()-i}}}async function Ui(e,t={}){const n=Date.now(),{onStatus:a,signal:i,request:o}=t,r=e.length,l=await Fi({onStatus:a,signal:i}),{detector:d,ocr:u}=l.sessions;let b=0,c=0,v=null;for(let E=0;E<r;E+=1){if(i?.aborted)return Ye("cancelled",l.diagnostics,c,b,n);const y=e[E];a?.(`Downloading image ${E+1} of ${r}`);let C;try{C=await hi(y,{signal:i,request:o})}catch(g){if(i?.aborted||g?.name==="AbortError")return Ye("cancelled",l.diagnostics,c,b,n);a?.(`Failed to download image ${E+1} of ${r}, skipping…`);continue}a?.(`Scanning image ${E+1} of ${r}`),c+=1;let h;try{h=await Vi({detector:d,ocr:u},C.bytes,{signal:i})}catch(g){if(i?.aborted||g?.name==="AbortError")return Ye("cancelled",l.diagnostics,c,b,n);continue}finally{C=null}if(!h||(b+=h.detectionsTried,!h.plate))continue;const m={plate:h.plate,plateFormatted:h.plateFormatted,meanConfidence:h.meanConfidence,imageIndex:E+1,imageUrl:y};if(rt(h.meanConfidence))return Wn(m,l.diagnostics,c,b,n,!1);v=Ia(v,m),a?.("Plate candidate below 90% confidence — scanning remaining images…")}return v?Wn(v,l.diagnostics,c,b,n,!0):Ye("no-reliable-plate",l.diagnostics,c,b,n)}function Ye(e,t,n,a,i){return{ok:!1,reason:e,diagnostics:{provider:yt()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:a,elapsedMs:Date.now()-i}}}async function Xn(e){return await bi(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Yn(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function Zn({plate:e,phone:t,fallbackId:n}={}){const a=e==null?"":String(e).trim();if(a)return{id:a,isRandom:!1};const i=t==null?"":String(t).trim();if(i)return{id:i,isRandom:!1};const o=n==null?"":String(n).trim();return o?{id:o,isRandom:!0}:{id:Yn(),isRandom:!0}}function Jn(e={}){return Zn(e).id}function zi(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function Hi(e,{phone:t="",fallbackId:n=""}={}){const a=e||{},i=t==null?"":String(t).trim(),o=a.plate==null?"":String(a.plate).trim(),l=[`ID: ${Jn({plate:o,phone:i,fallbackId:n})}`,`Telefone: ${i}`,""];for(const u of it){if(u==="url")continue;const b=Vt[u];let c=a[u]==null?"":String(a[u]);u==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),l.push(`${b}: ${c}`)}const d=a.url==null?"":String(a.url);return l.push(""),l.push(d),l.join(`
`)}const wt="<<<LEAD_CLIP_V1>>>",Qn="<<<END_LEAD_CLIP>>>";function Gi(e,t={}){const n=e?.fields||{},a=e?.source||{},i=t.phone==null?"":String(t.phone).trim();return{v:1,id:Jn({plate:n.plate,phone:i,fallbackId:t.fallbackId}),phone:i,plate:String(n.plate||""),clientName:String(n.clientName||a.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||a.url||""),siteId:String(a.siteId||""),title:String(a.title||""),description:ze(a.description||"")}}function qi(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${wt}
${n}
${Qn}
`}function ji(e){const t=String(e||""),n=t.indexOf(wt);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const a=n+wt.length,i=t.indexOf(Qn,a);if(i<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const o=t.slice(a,i).trim(),r=t.slice(0,n).replace(/\s+$/,"");try{const l=JSON.parse(o);return!l||l.v!==1||typeof l!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:l,humanText:r}}catch(l){return{ok:!1,error:l instanceof Error?l.message:"JSON parse failed"}}}const Ki="listingCache",Wi=2880*60*1e3;function ea(){return`${De}${Ki}`}function Et(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function Xi(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,a]of Object.entries(e))typeof n=="string"&&n&&Et(a)&&(t[n]={processedAt:a.processedAt,phone:a.phone,clipboard:a.clipboard,fallbackId:typeof a.fallbackId=="string"?a.fallbackId:"",listingRecord:a.listingRecord});return t}async function Yi(){const e=await Bn(ea(),{});return Xi(e)}async function St(e){await Vn(ea(),e)}async function Lt(e=Date.now()){const t=await Yi(),n={};let a=!1;for(const[i,o]of Object.entries(t))e-o.processedAt<=Wi?n[i]=o:a=!0;return(a||Object.keys(n).length!==Object.keys(t).length)&&await St(n),n}async function Zi(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const i=(await Lt(t))[n];return i&&Et(i)?i:null}async function Ji(e,t,n=Date.now()){const a=typeof e=="string"?e.trim():"";if(!a||!Et(t))return null;const i=await Lt(n),o={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return i[a]=o,await St(i),o}async function Qi(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const a=await Lt(t);return n in a?(delete a[n],await St(a),!0):!1}const ta="valuationDefaults";async function eo(e,t=null){return Bn(`${De}${e}`,t)}async function to(e,t){await Vn(`${De}${e}`,t)}async function na(){const e=await eo(ta,null);return!e||typeof e!="object"?{...Fe}:{...Fe,...e}}async function no(e){const t={...Fe,...e};return await to(ta,t),t}function It(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function ao(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):It(t)?Promise.resolve("visible"):new Promise(a=>{const i=()=>{r(),a("cancelled")},o=()=>{It(t)&&(r(),a("visible"))},r=()=>{t.removeEventListener("visibilitychange",o),n?.removeEventListener("abort",i)};t.addEventListener("visibilitychange",o),n&&n.addEventListener("abort",i,{once:!0})})}const ve=Object.freeze(["⏳","🔔","📋","✅","⛔"]),io=ve[0],oo=ve[1],ro=ve[2],lo=ve[3],so=ve[4];let ye=null;function co(e){const t=String(e??"");for(const n of ve){if(t.startsWith(`${n} `))return t.slice(n.length+1);if(t.startsWith(n))return t.slice(n.length).trimStart()}return t}function uo(e){const t=String(e||"").trim().toLowerCase();return t?t==="waiting"||t==="reading"||t.startsWith("analisando imagem")?io:t==="lendo tel"?oo:t==="ready to copy"?ro:t==="data copied"?lo:t==="no data found."?so:null:null}function fo(e=globalThis.document){return ye==null&&(ye=co(e?.title??"")),ye}function po(e,t=globalThis.document){if(!t)return;const n=uo(e);if(!n)return;const a=fo(t);t.title=`${n} ${a}`}function mo(e=globalThis.document){ye!=null&&(e&&(e.title=ye),ye=null)}const go=5e3;function bo(){let e=Bt(),t=null,n=null,a=null,i="",o=0;function r(s){s&&(t?.setCaptureStatus(s),po(s))}function l(s){e={...e,statusMessage:s},t?.setStatus(s);const x=String(s||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);x&&r(`analisando imagem ${x[1]} de ${x[2]}`)}function d(){try{const s=Fn().extractListing(document);if(s?.url)return oe(s.url)}catch{}return typeof location<"u"&&location?.href?oe(location.href):""}function u(s={}){const x=s.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",R=s.phone??e.lastPhone??"",M=s.fallbackId??e.fallbackId??"",T=!!String(x).trim(),q=!!String(R).trim();if(!T&&!q&&!String(M).trim()){t?.setClipboardId({id:"",isRandom:!1,hasPlate:!1,hasPhone:!1});return}t?.setClipboardId({...Zn({plate:x,phone:R,fallbackId:M}),hasPlate:T,hasPhone:q})}function b(s,x){const R=x.listingRecord,M=x.phone||"",T=R?.fields?.plate||"",z=!String(T).trim()&&!String(M).trim()&&(x.fallbackId||zi(x.clipboard))||"",re=typeof R?.metadata?.plateImageIndex=="number"&&R.metadata.plateImageIndex>0?R.metadata.plateImageIndex:null,H=typeof R?.metadata?.plateImageUrl=="string"?R.metadata.plateImageUrl:"",B=typeof R?.metadata?.plateConfidence=="number"&&Number.isFinite(R.metadata.plateConfidence)?R.metadata.plateConfidence:null;i=s,o=x.processedAt,e={...e,lastPlate:T,lastPhone:M,lastClipboard:x.clipboard||"",fallbackId:z,listingRecord:R,plateImageIndex:re,plateImageUrl:H,plateConfidence:B,view:"form"},t?.showListingForm(R,{phone:M,plateImageIndex:re,plateImageUrl:H,plateConfidence:B}),t?.setCopyEnabled(!!x.clipboard),t?.setCopyLabel("Copy"),u({plate:T,phone:M,fallbackId:z}),r("ready to copy"),l("Ready to copy")}function c(s,x=""){const R=s?.fields?.plate||"",M=x==null?"":String(x).trim();let T=e.fallbackId||"";!String(R).trim()&&!M&&(T||(T=Yn()),e={...e,fallbackId:T});const q=Hi(s.fields,{phone:M,fallbackId:e.fallbackId}),z=Gi(s,{phone:M,fallbackId:e.fallbackId});return qi(q,z)}async function v(s){const x=i||oe(s.listingRecord?.fields?.url||"")||d();if(!x||!s.listingRecord||!s.clipboard)return;const R=s.processedAt??o??Date.now();i=x,o=R,await Ji(x,{processedAt:R,phone:s.phone??e.lastPhone??"",clipboard:s.clipboard,fallbackId:s.fallbackId??e.fallbackId??"",listingRecord:s.listingRecord})}async function E(){try{const s=d();if(s){const x=await Zi(s);if(x){if(Ht(x.listingRecord,{plate:x.listingRecord?.fields?.plate,phone:x.phone})){b(s,x);return}await Qi(s)}}}catch{}C()}function y(){a!=null&&(clearTimeout(a),a=null)}function C(){y(),r("waiting"),a=setTimeout(()=>{a=null,L()},go)}function h(s){e={...e,busy:s,view:s?"reading":e.listingRecord?"form":"idle"},t?.setBusy(s),s&&r("reading")}function m(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const s=e.lastDiagnostics;if(!s){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${s.provider||"n/a"}`,`Detector cache: ${s.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${s.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${s.imagesScanned??0}`,`Detections tried: ${s.detectionsTried??0}`,e.plateImageIndex?`Plate image: ${e.plateImageIndex}`:null,`Elapsed: ${s.elapsedMs??0} ms`].filter(Boolean).join(`
`))}function g(s,x,R){const M=[];if(x.plate){const T=x.plateImageIndex!=null&&x.plateImageIndex>0?` (imagem ${x.plateImageIndex})`:"";M.push(`Plate found: ${x.plate}${T}`)}else M.push("No reliable plate found.");return x.phone&&M.push(`Phone: ${x.phone}`),(s.fields.make||s.fields.model)&&M.push(`Listing: ${[s.fields.make,s.fields.model].filter(Boolean).join(" ")}`.trim()),M.push(R),M.join(`
`)}function f(s){e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)}async function S(s){return f(s),Xn(s)}async function L(){if(y(),e.busy)return;n=new AbortController;const{signal:s}=n;h(!0);try{const x=Fn(),R=await na();l("Extracting listing fields…");const M=x.extractListing(document);let T={ok:!1,reason:"no-images"},q=0;const z=!!e.listingRecord&&!!t?.isMinimized?.();if(z){const se=String(e.listingRecord?.fields?.plate||e.lastPlate||"").trim(),ne=e.plateImageIndex??e.listingRecord?.metadata?.plateImageIndex??null,ge=e.plateImageUrl||e.listingRecord?.metadata?.plateImageUrl||"",Ce=e.plateConfidence??e.listingRecord?.metadata?.plateConfidence??null;T=se?{ok:!0,plate:se,reason:"reused",imageIndex:typeof ne=="number"&&ne>0?ne:void 0,imageUrl:ge||void 0,meanConfidence:typeof Ce=="number"&&Number.isFinite(Ce)?Ce:null,needsConfirmation:!1}:{ok:!1,reason:"reused-no-plate"},l("Refreshing listing text and phone…")}else{l("Looking for listing images…");const se=await x.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:ne,count:ge}=se;q=ge,ge>0?(l(`Found ${ge} listing images — scanning…`),l("Loading plate recognition models…"),T=await Ui(ne,{signal:s,onStatus:l}),e={...e,lastDiagnostics:T.diagnostics},m()):l("No listing images — waiting for phone…")}if(s.aborted||T.reason==="cancelled"){l("Cancelled.");return}if(It()||(r("lendo tel"),l("Waiting for this tab to extract phone…")),await ao({signal:s})==="cancelled"||s.aborted){l("Cancelled.");return}r("lendo tel"),l("Waiting for phone button…");const H=await x.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,buttonAppearDelayMs:2e3,buttonAppearAttempts:2,signal:s});let B=T.ok&&T.plate?T.plate:"";const W=H.ok?H.phone:"";let J=B&&typeof T.imageIndex=="number"&&T.imageIndex>0?T.imageIndex:null,te=B&&typeof T.imageUrl=="string"?T.imageUrl:"",Y=B&&typeof T.meanConfidence=="number"&&Number.isFinite(T.meanConfidence)?T.meanConfidence:null;if(s.aborted){l("Cancelled.");return}const Qe=!!B&&!z&&(T.needsConfirmation===!0||!rt(Y));let $e=null;if(Qe&&t?.promptLowConfidencePlate){t.setMinimized?.(!1);const se=zt({extracted:M,plate:B,defaults:R,plateImage:{index:J,url:te,confidence:Y}});if(t.showListingForm(se,{phone:W,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y}),l("Confiança da placa abaixo de 90% — confirme se quer usar o valor."),$e=await t.promptLowConfidencePlate({plate:B,confidence:Y,imageIndex:J,imageUrl:te}),s.aborted){l("Cancelled.");return}$e==="discard"&&(B="",J=null,te="",Y=null)}const le=zt({extracted:M,plate:B,defaults:R,plateImage:{index:J,url:te,confidence:Y}});if(e={...e,lastPlate:B,lastPhone:W,fallbackId:"",listingRecord:le,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y,view:"form"},t?.showListingForm(le,{phone:W,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y}),$e==="edit"&&t?.focusPlateField?.(),!Ht(le,{plate:B,phone:W})){f(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),r("No data found."),l("No data found.");return}const et=c(le,W);f(et),t?.setCopyLabel("Copy"),u({plate:B,phone:W,fallbackId:e.fallbackId}),r("ready to copy"),i=oe(le.fields.url||"")||d(),o=Date.now(),await v({clipboard:et,phone:W,listingRecord:le,processedAt:o,fallbackId:e.fallbackId});let me=g(le,{plate:B,phone:W,plateImageIndex:J},"Ready to copy");B&&!W&&H.reason==="timeout"?me+=`
Phone reveal timed out.`:B&&!W&&H.reason==="no-button"&&(me+=`
No phone button on this listing.`),!z&&q===0&&!W&&H.reason==="no-button"&&(me+=`
No listing images found.`),l(me)}catch(x){if(s.aborted){l("Cancelled.");return}const R=x instanceof Error?x.message:"Unknown recognition error";l(`Failed: ${R}`)}finally{n=null,h(!1)}}function I(){n?.abort()}async function w(){let s=e.lastClipboard;if(e.listingRecord&&(s=c(e.listingRecord,e.lastPhone),e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)),!s){l("Nothing to copy yet.");return}const x=await Xn(s);x.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await v({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(x.ok?"Data copied":"Clipboard copy failed.")}async function A(){if(!e.listingRecord){l("No listing to copy yet. Run Clip listing.");return}const s=c(e.listingRecord,e.lastPhone),x=await S(s);x.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),await v({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(x.ok?"Data copied":"Clipboard copy failed.")}async function k(){const s=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!s){l("No plate to copy.");return}const x=await S(s);l(x.ok?`Plate copied: ${s}`:"Clipboard copy failed.")}function _(s,x){if(s==="phone"){e={...e,lastPhone:x==null?"":String(x)},u();return}if(!e.listingRecord)return;const R=ya(e.listingRecord,s,x);e={...e,listingRecord:R,lastPlate:s==="plate"?x:e.lastPlate,plateConfidence:s==="plate"?null:e.plateConfidence},s==="plate"&&u()}async function N(){try{await Oi(),Bi(),l("Model cache cleared.")}catch(s){const x=s instanceof Error?s.message:"Failed to clear cache";l(x)}}function D(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},m(),l(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function V(){if(e.busy)return;const s=await na();e={...e,view:"settings"},t?.showSettingsForm(s),l(`Settings. Environment: production. Storage: ${De}* / ${Ft}.`)}function U(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone,plateImageIndex:e.plateImageIndex,plateImageUrl:e.plateImageUrl,plateConfidence:e.plateConfidence}),l("Back to listing review.")):(t?.hideForm(),l("Settings closed."))}async function G(s){await no(s),l("Defaults saved.")}function j(s=document.body){return t||(t=Ra({onClipListing:L,onCancel:I,onCopyAgain:w,onClearModelCache:N,onToggleDiagnostics:D,onSettings:V,onFieldChange:_,onCopyFullText:A,onCopyPlateOnly:k,onSettingsBack:U,onSaveDefaults:G}),t.mount(s),t.setMinimized(!0),E(),t)}function F(){y(),n?.abort(),n=null,mo(),t?.destroy(),t=null,i="",o=0,e=Bt()}function O(){return e}return{mount:j,destroy:F,onClipListing:L,onCancel:I,onCopyAgain:w,onCopyFullText:A,onCopyPlateOnly:k,onFieldChange:_,onClearModelCache:N,onToggleDiagnostics:D,onSettings:V,onSettingsBack:U,onSaveDefaults:G,getState:O,setStatus:l}}function aa(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?ho(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function ho(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const fe="/api";async function pe(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),a=await n.text();let i=null;try{i=a?JSON.parse(a):null}catch{i=a}return{ok:n.ok,status:n.status,data:i}}async function vo(){return pe(`${fe}/auth/me`)}async function yo(){return pe(`${fe}/get_user_local`)}async function Ne(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),pe(`${fe}/lead-clients?${t.toString()}`)}async function xo(e){return pe(`${fe}/purchase-leads/clients/${e}?page=1`)}async function Co(e){return pe(`${fe}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function wo(e){return pe(`${fe}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Ze(e,t=null){return pe(`${fe}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function Eo(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),a=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const i=await fetch(a,{credentials:"include"});if(!i.ok)return[];const o=await i.json();return Array.isArray(o)?o:o?.data||o?.results||[]}catch{return[]}}const ee={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function ia(e){return String(e||"").replace(/\D/g,"")}function xe(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function ue(e){const t=ia(e?.phone);if(t)return t;const n=String(e?.id||"").trim(),a=ia(n);return a&&a===n?a:""}function Z(e,t){return[{label:e,value:t}]}function Je(e,t=""){const n=Array.isArray(e)?e:[],a=t.trim().toLowerCase();if(a){const i=n.find(o=>String(o.label??o.nombre??o.name??"").toLowerCase().includes(a));if(i)return{label:i.label??i.nombre??i.name,value:i.value??i.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function At(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:null,secondSurname:null}:t.length===1?{name:t[0],firstSurname:null,secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function So(e){const t=ue(e),{name:n,firstSurname:a,secondSurname:i}=At(e.clientName);return{name:n,firstSurname:a,secondSurname:i,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function Lo(e){const{clip:t,clientId:n,me:a,localId:i,filters:o={},vehicle:r={}}=e,l=ue(t),d=xe(t.plate),u=a?.id??0,b=Array.isArray(a?.rolesId)?a.rolesId:[6],{name:c,firstSurname:v,secondSurname:E}=At(t.clientName),y=o.estado||ee.estado,C=o.origen||ee.origen,h=o.contacto||ee.forma_contacto,m=o.marca||ee.marca_comercial,g=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,f=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),S=Number(f.replace(",","."))||null,L=r.makeLabel||t.make||"",I=r.modelLabel||t.model||"",w=Number(t.year)||null,A=r.fuelLabel||ra(t.fuel),k=r.transmissionLabel||la(t.transmission);return{data:{toggle:!1,nombre:c,telefono1:l||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:Z(y.label,y.value),origen:Z(C.label,C.value),forma_contacto:Z(h.label,h.value),marca_comercial:Z(m.label,m.value),email:null,telefono2:null,apellido1:v,apellido2:E,kilometros:g,importado:!1,matricula:d||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:S,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:A?Z(A,r.fuelValue??A):null,ccambios:k?Z(k,r.transmissionValue??k):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:u,id_agente_modify:u,rol:b,vehiculo:{marca_vehiculo:L?Z(L,r.makeValue??L):[],modelo:I?Z(I,r.modelValue??I):[],matriculacion:w?Z(w,w):[],combustible:A?Z(A,r.fuelValue??A):[],ccambios:k?Z(k,r.transmissionValue??k):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:i||ee.id_local_actual}}function Re(e,t=""){const n=Array.isArray(e)?e:[],a=String(t||"").trim().toLowerCase();if(!a)return null;const i=d=>String(d?.label??d?.nombre??d?.name??"").trim(),o=d=>d?.value??d?.id,r=n.find(d=>i(d).toLowerCase()===a);if(r)return{label:i(r),value:o(r)};const l=n.find(d=>{const u=i(d).toLowerCase();return u.includes(a)||a.includes(u)});return l?{label:i(l),value:o(l)}:null}function oa(e){return String(e||"").trim().toLowerCase()==="vw"?"Volkswagen":""}async function Io(e,t){const n={};if(!e?.make||typeof t!="function")return n;const a=await t("makes"),i=Re(a,e.make)||Re(a,oa(e.make));if(!i)return n;if(n.makeLabel=i.label,n.makeValue=i.value,e.model){const o=await t("models",{makeId:String(i.value)}),r=Re(o,e.model);if(r){n.modelLabel=r.label,n.modelValue=r.value;const l=String(e.year||"").trim();if(l){const d=ra(e.fuel);if(d){const u=await t("fuels",{makeId:String(i.value),modelId:String(r.value),year:l}),b=Re(u,d);if(b){n.fuelLabel=b.label,n.fuelValue=b.value;const c=la(e.transmission);if(c){const v=await t("transmissions",{makeId:String(i.value),modelId:String(r.value),year:l,fuelId:String(b.value)}),E=Re(v,c);E&&(n.transmissionLabel=E.label,n.transmissionValue=E.value)}}}}}}return n}function ra(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function la(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const Ao="LeadDeskDB",ko=["Audi","BMW","BYD","Citroën","Cupra","Dacia","Fiat","Ford","Honda","Hyundai","Jaguar","Jeep","Kia","Mercedes-Benz","MG","Mini","Mitsubishi","Nissan","Opel","Peugeot","Porsche","Renault","Seat","Skoda","Tesla","Toyota","Volkswagen","Volvo"],Po=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],_o=["Manual","Automática"];function kt(e,t,n){const a=String(t||"").trim();if(!a)return"";const i=e.find(l=>l===a);if(i)return i;const o=a.toLowerCase(),r=e.find(l=>l.toLowerCase()===o);if(r)return r;if(n){const l=n(a);if(l&&e.includes(l))return l}return a}function To(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function No(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function Ro(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function Pt(){return new Promise((e,t)=>{const n=indexedDB.open(Ao);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function Mo(e){const t=await Pt();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}async function $o(e){const t=await Pt();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}function sa(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function Do(e){const t=await Pt(),n=new Date().toISOString(),a=ue(e),i=Ro(e.plate),o=sa("client"),r=sa("lead"),{name:l,firstSurname:d,secondSurname:u}=At(e.clientName),b=d||"",c=u||"",v={id:o,firstName:l,firstSurname:b,secondSurname:c,phone:a,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:a,createdAt:n,updatedAt:n},E={id:r,clientId:o,plate:i,plateNormalized:i,phone:a,phoneNormalized:a,fullName:l,firstSurname:b,secondSurname:c,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:kt(ko,e.make||"",oa),model:e.model||"",year:e.year||"",fuel:kt(Po,e.fuel||"",To),transmission:kt(_o,e.transmission||"",No),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((y,C)=>{const h=t.transaction(["clients","leads"],"readwrite");h.objectStore("clients").put(v),h.objectStore("leads").put(E),h.oncomplete=()=>y(void 0),h.onerror=()=>C(h.error)}),r}function ca(e,t={}){const n=t.open||((...l)=>window.open(...l)),a=t.assign||(l=>location.assign(l)),i=t.origin||location.origin,o=new URL(e,i).href,r=n(o,"_blank");if(r){try{r.opener=null}catch{}return"new-tab"}return a(e),"same-tab"}function da(e={}){const t=e.open||((...o)=>window.open(...o)),n=e.assign||(o=>location.assign(o)),a=e.origin||location.origin,i=t("about:blank","_blank");if(i)try{i.opener=null}catch{}return{go(o){const r=new URL(o,a).href;return i&&!i.closed?(i.location.href=r,"new-tab"):(n(o),"same-tab")},cancel(){try{i?.close()}catch{}}}}function ua(e,t,n,a=()=>location.reload()){if(e==="new-tab"){n?.setStatus?.(`Lead ${t} criado. Aberto em nova aba. A atualizar a lista…`,"ok"),a();return}n?.setStatus?.(`Lead ${t} criado. Pop-up bloqueado — abrindo nesta aba…`,"warn")}const Oo=`
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
`,Fo="Alt+V",Bo="Alt+B",Vo="Alt+A",Uo="⌥V",zo="⌥B",Ho="⌥A";function Go(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function qo(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=Oo;const i=Go(),o=i?Uo:Fo,r=i?zo:Bo,l=i?Ho:Vo,d=document.createElement("div");d.className="lcf-panel";const u=document.createElement("div");u.className="lcf-header";const b=document.createElement("div");b.className="lcf-title",b.textContent="CRM · Leads";const c=document.createElement("span");c.className="lcf-badge",c.textContent="CRM";const v=document.createElement("button");v.type="button",v.className="lcf-mini",v.setAttribute("aria-label","Minimizar painel"),v.title="Minimizar",v.textContent="–",u.append(b,c,v);const E=document.createElement("div");E.className="lcf-body";const y=document.createElement("div");y.className="lcf-hint",y.textContent=`Cole o texto do Clipper (com LEAD_CLIP_V1) ou use Ler área de transferência (${o}). Com dados válidos, a verificação do cadastro corre automaticamente. Abrir 1.º lead: ${l}. Criar lead: ${r}.`;const C=document.createElement("textarea");C.className="lcf-textarea",C.placeholder="Cole aqui o texto do Clipper…";const h=document.createElement("div");h.className="lcf-summary",h.hidden=!0;const m=document.createElement("div");m.className="lcf-section-label",m.textContent="Leads encontrados",m.hidden=!0;const g=document.createElement("ul");g.className="lcf-matches";const f=document.createElement("div");f.className="lcf-actions";const S=document.createElement("button");S.type="button",S.className="lcf-btn lcf-btn-primary",S.title=`Atalho: ${o}`;const L=document.createElement("span");L.textContent="Ler área de transferência";const I=document.createElement("span");I.className="lcf-kbd",I.textContent=o,S.append(L,I);const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-success",w.title=`Atalho: ${r}`,w.disabled=!0,w.hidden=!0;const A=document.createElement("span");A.textContent="Criar lead";const k=document.createElement("span");k.className="lcf-kbd",k.textContent=r,w.append(A,k),f.append(S,w);const _=document.createElement("div");_.className="lcf-status",_.dataset.tone="",_.textContent="Aguardando dados do anúncio.",E.append(y,C,h,m,g,f,_),d.append(u,E),n.append(a,d),document.documentElement.append(t);let N=!1,D=null;function V(){d.classList.toggle("lcf-panel--minimized",N),E.hidden=N,v.textContent=N?"+":"–",v.setAttribute("aria-label",N?"Expandir painel":"Minimizar painel"),v.title=N?"Expandir":"Minimizar"}function U(s){N=!!s,V()}v.addEventListener("click",()=>{U(!N)}),V();let G=!1,j=0,F=0;u.addEventListener("pointerdown",s=>{if(s.target===v)return;G=!0;const x=d.getBoundingClientRect();j=s.clientX-x.left,F=s.clientY-x.top,u.setPointerCapture(s.pointerId)}),u.addEventListener("pointermove",s=>{G&&(d.style.left=`${s.clientX-j}px`,d.style.top=`${s.clientY-F}px`,d.style.right="auto",d.style.bottom="auto")}),u.addEventListener("pointerup",()=>{G=!1}),S.addEventListener("click",()=>e.onReadClipboard()),C.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(C.value),0)}),w.addEventListener("click",()=>e.onCreate());function O(s){if(!(!s.altKey||s.ctrlKey||s.metaKey||s.shiftKey)){if(s.code==="KeyV"){s.preventDefault(),N&&U(!1),S.disabled||e.onReadClipboard();return}if(s.code==="KeyB"){if(w.hidden||w.disabled)return;s.preventDefault(),e.onCreate();return}if(s.code==="KeyA"){if(!D)return;s.preventDefault(),D()}}}return window.addEventListener("keydown",O),{setBadge(s){c.textContent=s},setStatus(s,x=""){_.textContent=s,_.dataset.tone=x||""},setText(s){C.value=s},getText(){return C.value},setSummary(s){if(!s){h.hidden=!0,h.textContent="";return}h.hidden=!1,h.innerHTML=s},setCreateVisible(s,x=!0){w.hidden=!s,w.disabled=!x},setMinimized:U,isMinimized(){return N},setMatches(s,x){g.replaceChildren(),m.hidden=s.length===0,D=s.length>0?()=>x(s[0].id):null,s.forEach((R,M)=>{const T=document.createElement("li"),q=document.createElement("div");q.className="lcf-match";const z=document.createElement("div");z.className="lcf-match-title",z.textContent=R.title;const re=document.createElement("div");re.className="lcf-match-sub",re.textContent=R.subtitle;const H=document.createElement("button");H.type="button",H.className="lcf-match-open",H.textContent=M===0?`Abrir lead → (${l})`:"Abrir lead →",M===0&&(H.title=`Atalho: ${l}`),H.addEventListener("click",()=>x(R.id)),q.append(z,re,H),T.append(q),g.append(T)})},clearMatches(){g.replaceChildren(),m.hidden=!0,D=null},destroy(){window.removeEventListener("keydown",O),t.remove()}}}function fa(e,t){return e==="new-tab"?[`Lead ${t} aberto em nova aba.`,"ok"]:[`Lead ${t}: pop-up bloqueado — abrindo nesta aba…`,"warn"]}function jo(){let e=null,t=null,n=!1,a=null,i=null;function o(){const m=aa();return t?.setBadge(m.label),m.kind==="leadDetail"&&i!=="leadDetail"&&t?.setMinimized(!0),i=m.kind,m}function r(m){const g=ji(m);if(t?.clearMatches(),t?.setCreateVisible(!1),!g.ok)return e=null,t?.setSummary(null),t?.setStatus(`Falha ao analisar o texto: ${g.error}`,"error"),!1;e=g.payload,t?.setText(m);const f=ue(e);return t?.setSummary([`<div><strong>ID</strong> ${Me(e.id)}</div>`,`<div><strong>Placa</strong> ${Me(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${Me(f||"—")}</div>`,`<div><strong>Veículo</strong> ${Me([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${Me(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0}async function l(){try{const m=await navigator.clipboard.readText();t?.setText(m),r(m)&&await u()}catch(m){const g=m instanceof Error?m.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${g}). Cole o texto do Clipper no campo acima.`,"warn")}}async function d(m){r(m)&&await u()}async function u(){if(!e||n)return;if(o().backend==="leaddesk"){await b();return}await c()}async function b(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=xe(e.plate),g=ue(e);let f=[];if(m&&(f=await Mo(m)),f.length===0&&g&&(f=await $o(g)),!m&&!g){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(f.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const S=f.map(L=>({id:L.id,title:`Lead ${L.plate||L.id}`,subtitle:`${L.phone||"—"} · ${[L.make,L.model,L.year].filter(Boolean).join(" · ")||"—"} · ${L.leadStatus||""} · ${L.updatedAt||""}`.trim()}));t?.setMatches(S,L=>{const I=ca(`/crm/leads/${L}`),[w,A]=fa(I,L);t?.setStatus(w,A)}),t?.setStatus(S.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":`${S.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(m){const g=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${g}`,"error")}finally{n=!1}}async function c(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const m=xe(e.plate),g=ue(e);let f;if(m)f=await Ne({plate:m}),f.ok&&Array.isArray(f.data)&&f.data.length===0&&g&&(f=await Ne({phone:g}));else if(g)f=await Ne({phone:g});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!f.ok){t?.setStatus(`Falha na verificação (HTTP ${f.status}). Está autenticado no CRM?`,"error");return}const S=Array.isArray(f.data)?f.data:[];if(S.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const L=[];for(const w of S){const A=w?.purchaseLead?.id;if(A)L.push({id:A,title:`Lead #${A}`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""} · ${w.purchaseLead?.statusName||""}`.trim()});else if(w?.id){const _=(await xo(w.id)).data?.results||[];for(const N of _)L.push({id:N.id,title:`Lead #${N.id}`,subtitle:`Placa ${N.plate||"—"} · ${N.status?.name||""} · ${N.lastAction||""}`.trim()});_.length===0&&L.push({id:`client:${w.id}`,title:`Cliente #${w.id} (sem lead de compra)`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""}`.trim()})}}const I=L.filter(w=>String(w.id).match(/^\d+$/));t?.setMatches(I.length?I:L,w=>{if(String(w).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const A=ca(`/main/lead-tasacion/${w}`),[k,_]=fa(A,w);t?.setStatus(k,_)}),t?.setStatus(I.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":I.length>1?`${I.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",I.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(m){const g=m instanceof Error?m.message:"erro";t?.setStatus(`Erro na verificação: ${g}`,"error")}finally{n=!1}}async function v(){if(!e||n)return;if(o().backend==="leaddesk"){await E();return}await y()}async function E(){if(!ue(e)&&!xe(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}const g=da();n=!0,t?.setStatus("Criando no LeadDesk…");try{const f=await Do(e),S=g.go(`/crm/leads/${f}`);ua(S,f,t)}catch(f){g.cancel();const S=f instanceof Error?f.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${S}`,"error")}finally{n=!1}}async function y(){const m=ue(e);if(!m&&!xe(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(!confirm("Criar cliente/lead no CRM com os dados copiados?"))return;const g=da();n=!0,t?.setStatus("Criando no CRM…");try{const f=await vo();if(!f.ok||!f.data?.id){g.cancel(),t?.setStatus(`Falha de autenticação (HTTP ${f.status}). Faça login no CRM.`,"error");return}const S=f.data,L=await yo(),I=Array.isArray(L.data)&&L.data[0]?.value||ee.id_local_actual,[w,A,k,_]=await Promise.all([Ze("estado_lead_compra"),Ze("origen_lead_compra"),Ze("contacto"),Ze("marcas_comerciales",S.id)]),N={estado:Je(w.data,"Avaliação")||ee.estado,origen:Je(A.data,"Captación")||ee.origen,contacto:Je(k.data,"Whatsapp")||ee.forma_contacto,marca:Je(_.data,"")||ee.marca_comercial};let D=null;if(m){const O=await Ne({phone:m});O.ok&&Array.isArray(O.data)&&O.data[0]?.id&&(D=O.data[0].id)}if(!D){const O=await Co(So(e));if(O.status===409)D=(await Ne({phone:m||void 0,plate:xe(e.plate)||void 0})).data?.[0]?.id;else if(O.ok&&O.data?.resourceId)D=O.data.resourceId;else{g.cancel(),t?.setStatus(`Falha ao criar cliente (HTTP ${O.status}): ${JSON.stringify(O.data)}`,"error");return}}if(!D){g.cancel(),t?.setStatus("Não foi possível obter clientId.","error");return}const V=await Io(e,Eo),U=Lo({clip:e,clientId:D,me:S,localId:I,filters:N,vehicle:V}),G=await wo(U);if(!G.ok){g.cancel(),t?.setStatus(`Falha create_lead_compra (HTTP ${G.status}): ${JSON.stringify(G.data)}`,"error");return}const j=G.data?.id_lead;if(!j){g.cancel(),t?.setStatus(`Resposta inesperada: ${JSON.stringify(G.data)}`,"error");return}const F=g.go(`/main/lead-tasacion/${j}`);ua(F,j,t)}catch(f){g.cancel();const S=f instanceof Error?f.message:"erro";t?.setStatus(`Erro ao criar: ${S}`,"error")}finally{n=!1}}function C(){if(t)return t;t=qo({onReadClipboard:l,onParseText:d,onCreate:v}),o(),window.addEventListener("popstate",o),a=new MutationObserver(()=>o());const m=document.getElementById("app")||document.body;return m&&a.observe(m,{childList:!0,subtree:!0}),l(),t}function h(){window.removeEventListener("popstate",o),a?.disconnect(),a=null,t?.destroy(),t=null,e=null,i=null}return{mount:C,destroy:h,refreshContext:o}}function Me(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const _t="__LEAD_CRM_FILLER_INITIALIZED__",Ko="lead-crm-filler-root";function Wo(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:aa().backend!=="none"?Xo():Yo()}function Xo(){if(window[_t])return{started:!1,reason:"already-initialized"};if(document.getElementById(Ko))return window[_t]=!0,{started:!1,reason:"panel-exists"};window[_t]=!0;const e=jo(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function Yo(){if(window[at])return{started:!1,reason:"already-initialized"};if(document.getElementById(Oe))return window[at]=!0,{started:!1,reason:"panel-exists"};window[at]=!0;const e=bo(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}Wo()})();
