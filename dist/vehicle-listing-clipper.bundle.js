(function(){try{if(typeof ort!=="undefined"&&ort){if(typeof globalThis!=="undefined")globalThis.ort=ort;if(typeof window!=="undefined")window.ort=ort;}}catch(e){console.error("[Vehicle Listing Clipper] Failed to bind ort",e);}})();
(function(){"use strict";const at="Vehicle Listing Clipper",Oe="vlc_prod_",Bt="vehicle-listing-clipper",it="__VLC_PROD_INITIALIZED__",Fe="vlc-panel-root";function Ut(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",lastPhone:"",lastClipboard:"",fallbackId:"",listingRecord:null,plateImageIndex:null,plateImageUrl:"",plateConfidence:null,diagnosticsVisible:!1,lastDiagnostics:null}}const Be={paintParts:"OK",bodyParts:"OK",tires:"OK",saleReason:"VENDA",keyCount:"2",deductibleVat:"NÃO"},ot=["plate","clientName","make","model","year","mileageKm","transmission","fuel","engine","powerCv","paintParts","bodyParts","tires","customerValueEur","saleReason","keyCount","deductibleVat","url"],Vt={plate:"Matrícula",clientName:"Nome cliente",make:"Marca",model:"Modelo",year:"Ano",mileageKm:"Km",transmission:"Tipo caixa",fuel:"Combustivel",engine:"Motor",powerCv:"Potencia",paintParts:"Peças Pintura",bodyParts:"Peças Chapa",tires:"Pneus",customerValueEur:"Valor cliente",saleReason:"Razão venda",keyCount:"Numero de Chaves",deductibleVat:"Iva dedutivel",url:"URL"},zt=["paintParts","bodyParts","tires","saleReason","keyCount","deductibleVat"];function Ca(){return{plate:"",make:"",model:"",year:"",mileageKm:"",transmission:"",fuel:"",engine:"",powerCv:"",paintParts:"",bodyParts:"",tires:"",customerValueEur:"",saleReason:"",keyCount:"",deductibleVat:"",url:""}}function wa(e={}){return{...Be,...e}}function Ht({extracted:e=null,plate:t="",defaults:n={},plateImage:a=null}={}){const i=wa(n),o=Ca(),r={},l=[],d=[],u=[],g=[...e?.warnings||[]];function c(f,b,p){const S=b==null?"":String(b);if(o[f]=S,!S){r[f]="missing";return}r[f]=p,p==="extracted"||p==="anpr"?l.push(f):p==="default"&&d.push(f)}const v=t?String(t).trim():"";c("plate",v,v?"anpr":"missing");const E=e?.clientName?String(e.clientName).trim():"";c("clientName",E,E?"extracted":"missing"),c("make",e?.make||"",e?.make?"extracted":"missing"),c("model",e?.model||"",e?.model?"extracted":"missing"),c("year",e?.year||"",e?.year?"extracted":"missing"),c("mileageKm",e?.mileageKm||"",e?.mileageKm?"extracted":"missing"),c("transmission",e?.transmission||"",e?.transmission?"extracted":"missing"),c("fuel",e?.fuel||"",e?.fuel?"extracted":"missing"),c("engine",e?.engine||"",e?.engine?"extracted":"missing"),c("powerCv",e?.powerCv||"",e?.powerCv?"extracted":"missing"),c("customerValueEur",e?.priceEur||"",e?.priceEur?"extracted":"missing"),c("url",e?.url||"",e?.url?"extracted":"missing"),c("paintParts",i.paintParts,"default"),c("bodyParts",i.bodyParts,"default"),c("tires",i.tires,"default"),c("saleReason",i.saleReason,"default"),c("keyCount",i.keyCount,"default"),c("deductibleVat",i.deductibleVat,"default");const h=a&&typeof a.index=="number"&&Number.isFinite(a.index)&&a.index>0?Math.floor(a.index):null,C=a&&typeof a.url=="string"?a.url.trim():"",y=v&&a&&typeof a.confidence=="number"&&Number.isFinite(a.confidence)?a.confidence:null;return{source:{siteId:e?.siteId||"olx-pt",url:o.url,listingId:e?.listingId||"",title:e?.title||"",description:e?.description||"",clientName:o.clientName||e?.clientName||""},fields:o,origins:r,metadata:{extractedFields:[...new Set(l)],defaultedFields:[...new Set(d)],editedFields:u,warnings:g,plateImageIndex:h,plateImageUrl:C,plateConfidence:y}}}function Gt(e,t={}){return String(t.plate||"").trim()||String(t.phone||"").trim()?!0:e?String(e.fields?.plate||"").trim()?!0:(e.metadata?.extractedFields||[]).some(i=>i&&i!=="url"):!1}function Ea(e,t,n){const a=n==null?"":String(n),i={...e.fields,[t]:a},o={...e.origins,[t]:a?"edited":"missing"},r=[...new Set([...e.metadata.editedFields||[],t])],l={...e.metadata,editedFields:r};return t==="plate"&&(l.plateConfidence=null),{...e,fields:i,origins:o,source:{...e.source,url:t==="url"?a:e.source.url,clientName:t==="clientName"?a:e.source.clientName},metadata:l}}const Ae="[A-Z]",ke="[0-9]",Sa=[{id:"LLDDDD",re:new RegExp(`^${Ae}{2}${ke}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${ke}{4}${Ae}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${ke}{2}${Ae}{2}${ke}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${Ae}{2}${ke}{2}${Ae}{2}$`)}],La={0:"O",1:"I",5:"S",8:"B"},Ia={O:"0",I:"1",L:"1",S:"5",B:"8"};function Ue(e){return String(e||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function be(e){const t=Ue(e);return t.length!==6?t:`${t.slice(0,2)}-${t.slice(2,4)}-${t.slice(4,6)}`}function Aa(e){const t=Ue(e);if(t.length!==6)return null;for(const n of Sa)if(n.re.test(t))return n.id;return null}function rt(e,t){const n=Ue(e).slice(0,6).split("");if(n.length!==6)return[];const a=[];function i(o,r,l){if(r>t)return;if(o===6){const c=l.join(""),v=Aa(c);v&&a.push({plate:c,corrections:r,patternId:v});return}if(i(o+1,r,l),r>=t)return;const d=l[o],u=La[d];if(u){const c=l.slice();c[o]=u,i(o+1,r+1,c)}const g=Ia[d];if(g){const c=l.slice();c[o]=g,i(o+1,r+1,c)}}return i(0,0,n),a.sort((o,r)=>o.corrections-r.corrections||r.plate.localeCompare(o.plate)),a}function qt(e,t){if(!e?.length)return 1;const n=Math.min(t,e.length);if(n===0)return 0;let a=0;for(let i=0;i<n;i+=1)a+=e[i]??0;return a/n}function ka(e){if(typeof e!="number"||!Number.isFinite(e))return null;const t=e>1?e/100:e;return Math.round(Math.min(1,Math.max(0,t))*100)}const Pa=.9;function Ve(e){return typeof e=="number"&&Number.isFinite(e)&&e>=Pa}function jt(e,t){if(!e)return t;const n=typeof e.meanConfidence=="number"&&Number.isFinite(e.meanConfidence)?e.meanConfidence:-1;return(typeof t.meanConfidence=="number"&&Number.isFinite(t.meanConfidence)?t.meanConfidence:-1)>n?t:e}function _a(e,t=[],n={}){const a=n.minConfidenceNoCorrection??.55,i=n.minConfidenceOneCorrection??.72,o=Ue(e);if(o.length<6)return{accepted:!1,plate:o,plateFormatted:be(o),patternId:null,corrections:0,meanConfidence:qt(t,o.length),reason:"too-short"};const r=o.slice(0,6),l=qt(t,6),d=rt(r,0);if(d.length>0&&l>=a){const c=d[0];return{accepted:!0,plate:c.plate,plateFormatted:be(c.plate),patternId:c.patternId,corrections:0,meanConfidence:l}}const u=rt(r,1).filter(c=>c.corrections===1);if(u.length>0&&l>=i){const c=u[0];return{accepted:!0,plate:c.plate,plateFormatted:be(c.plate),patternId:c.patternId,corrections:1,meanConfidence:l}}return rt(r,2).some(c=>c.corrections>1)&&d.length===0&&u.length===0?{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:2,meanConfidence:l,reason:"excessive-corrections"}:d.length>0||u.length>0?{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:d.length?0:1,meanConfidence:l,reason:"low-confidence"}:{accepted:!1,plate:r,plateFormatted:be(r),patternId:null,corrections:0,meanConfidence:l,reason:"no-reliable-pattern"}}function Kt(e){switch(e){case"extracted":return"vlc-origin-extracted";case"anpr":return"vlc-origin-anpr";case"default":return"vlc-origin-default";case"edited":return"vlc-origin-edited";default:return"vlc-origin-missing"}}function Ta(e){let t=null;const n=new Map;let a="listing";function i(){return t||(t=document.createElement("div"),t.className="vlc-form",t.hidden=!0,t)}function o(){t&&(t.replaceChildren(),n.clear())}const r='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>';function l(h,C,y="missing",f,b={}){const p=document.createElement("label");p.className=`vlc-field ${Kt(y)}`,p.dataset.field=h;const S=document.createElement("span");S.className="vlc-field-label";const L=document.createElement("span");L.className="vlc-field-label-text",L.textContent=f||Vt[h]||h;const I=document.createElement("span");I.className="vlc-field-origin",y==="anpr"?I.hidden=!0:I.textContent=y;const w=document.createElement("span");w.className="vlc-field-label-meta",w.appendChild(I);let A=null;if(h==="plate"){const _=ka(b.plateConfidence);_!=null&&y==="anpr"&&(A=document.createElement("span"),A.className="vlc-plate-confidence-badge",Ve(b.plateConfidence)||A.classList.add("vlc-plate-confidence-badge--low"),A.textContent=`${_}%`,A.title=`Confiança do reconhecimento: ${_}%`,w.appendChild(A))}if(h==="plate"&&b.plateImageIndex!=null&&b.plateImageIndex>0){const _=document.createElement("span");if(_.className="vlc-plate-image-badge",_.textContent=`img ${b.plateImageIndex}`,_.title=`Placa encontrada na imagem ${b.plateImageIndex}`,w.appendChild(_),b.plateImageUrl){const N=document.createElement("button");N.type="button",N.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",N.title=`Ver imagem ${b.plateImageIndex}`,N.setAttribute("aria-label",`Ver imagem ${b.plateImageIndex} da placa`),N.innerHTML=r,N.addEventListener("mousedown",D=>{D.preventDefault()}),N.addEventListener("click",D=>{D.preventDefault(),D.stopPropagation(),e.onPreviewPlateImage?.()}),w.appendChild(N)}}const k=document.createElement("input");k.type="text",k.className="vlc-field-input",k.value=C??"",k.dataset.field=h,k.addEventListener("input",()=>{a==="listing"&&(e.onFieldChange(h,k.value),p.className=`vlc-field ${Kt("edited")}`,I.hidden=!1,I.textContent="edited",A&&(A.remove(),A=null))}),S.append(L,w),p.append(S,k),n.set(h,k),t?.appendChild(p)}function d(){const h=document.createElement("div");h.className="vlc-form-actions";const C=document.createElement("button");C.type="button",C.className="vlc-btn vlc-btn-primary",C.textContent="Copy full text",C.addEventListener("click",()=>e.onCopyFullText());const y=document.createElement("button");y.type="button",y.className="vlc-btn",y.textContent="Copy plate only",y.addEventListener("click",()=>e.onCopyPlateOnly()),h.append(C,y),t?.appendChild(h)}function u(h,{phone:C="",plateImageIndex:y=null,plateImageUrl:f="",plateConfidence:b=null}={}){a="listing",i(),o(),t.hidden=!1;const p=document.createElement("div");p.className="vlc-form-heading",p.textContent="Review listing",t.appendChild(p);const S=C==null?"":String(C).trim();l("phone",S,S?"extracted":"missing","Telefone");for(const L of ot){let I=h.fields[L]||"",w=h.origins[L]||"missing";L==="clientName"&&!I&&h.source?.clientName&&(I=String(h.source.clientName),w="extracted");const A=L==="plate"?{plateImageIndex:y??h.metadata?.plateImageIndex??null,plateImageUrl:f||h.metadata?.plateImageUrl||"",plateConfidence:b??h.metadata?.plateConfidence??null}:{};l(L,I,w,void 0,A)}d()}function g(h){a="settings",i(),o(),t.hidden=!1;const C=document.createElement("div");C.className="vlc-form-heading",C.textContent="Default values",t.appendChild(C);for(const p of zt)l(p,h[p]||"","default");const y=document.createElement("div");y.className="vlc-form-actions";const f=document.createElement("button");f.type="button",f.className="vlc-btn vlc-btn-primary",f.textContent="Save defaults",f.addEventListener("click",()=>{const p={};for(const S of zt)p[S]=n.get(S)?.value??"";e.onSaveDefaults?.(p)});const b=document.createElement("button");b.type="button",b.className="vlc-btn",b.textContent="Back",b.addEventListener("click",()=>e.onBack?.()),y.append(f,b),t.appendChild(y)}function c(){t&&(t.hidden=!0)}function v(){const h=n.get("plate");h&&(h.focus(),h.select())}function E(h,{phone:C}={}){if(a==="listing"){if(C!==void 0){const y=n.get("phone");y&&document.activeElement!==y&&(y.value=C==null?"":String(C))}for(const y of ot){const f=n.get(y);if(f&&document.activeElement!==f){let b=h.fields[y]||"";y==="clientName"&&!b&&h.source?.clientName&&(b=String(h.source.clientName)),f.value=b}}}}return{ensureRoot:i,showListing:u,showSettings:g,syncListingValues:E,focusPlateField:v,hide:c,getMode:()=>a,getElement:()=>i()}}const Na=`
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
`,Ra="Alt+C",Ma="⌥C";function $a(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function Da(e){let t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,g=null,c=null,v=null,E=null,h=null,C=null,y=null,f=null,b=null,p=null,S=null,L=null,I=null,w=null,A=null,k=null,_=null,N=null,D=!1,U=null,V=!0,G="waiting",j=!1,F=null,O="",s=null,x=0,R=0,M=null;const T=$a()?Ma:Ra;function q(m){return`${m} (${T})`}const z=Ta({onFieldChange:(m,P)=>e.onFieldChange(m,P),onCopyFullText:()=>e.onCopyFullText(),onCopyPlateOnly:()=>e.onCopyPlateOnly(),onBack:()=>e.onSettingsBack(),onSaveDefaults:m=>e.onSaveDefaults(m),onPreviewPlateImage:()=>Rt()}),re='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 10.2a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L8 6.56 4.26 10.2a.75.75 0 0 1-1.06 0Z"/></svg>',H='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M3.2 5.8a.75.75 0 0 1 1.06 0L8 9.44l3.74-3.64a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L3.2 6.86a.75.75 0 0 1 0-1.06Z"/></svg>',B='<svg class="vlc-icon vlc-icon-sm" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M2.5 3.5A1.5 1.5 0 0 1 4 2h8a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 12 14H4A1.5 1.5 0 0 1 2.5 12.5v-9Zm1.5 0v6.19l2.1-2.1a.75.75 0 0 1 1.06 0L10.5 10.94l1-1a.75.75 0 0 1 1.06 0l.44.44V3.5H4Zm0 9h8v-.56l-1.47-1.47-2.28 2.28a.75.75 0 0 1-1.06 0L4.94 10.5 4 11.44V12.5ZM6.25 6a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>',W='<svg class="vlc-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M4.22 4.22a.75.75 0 0 1 1.06 0L8 6.94l2.72-2.72a.75.75 0 1 1 1.06 1.06L9.06 8l2.72 2.72a.75.75 0 1 1-1.06 1.06L8 9.06l-2.72 2.72a.75.75 0 0 1-1.06-1.06L6.94 8 4.22 5.28a.75.75 0 0 1 0-1.06Z"/></svg>';function J(){i&&(i.textContent=V?G:at)}function te(){!n||!U||(n.classList.toggle("vlc-panel--minimized",V),U.innerHTML=V?re:H,U.setAttribute("aria-label",V?"Expand panel":"Minimize panel"),U.title=V?"Expand":"Minimize",J())}function Y(m){V=!!m,te()}function et(){Y(!V)}function De(m){G=m,n?.classList.toggle("vlc-panel--ready",String(m).toLowerCase()==="ready to copy"),J()}function le(){u&&(u.disabled=!j),g&&(g.disabled=!j)}function tt(m,P){if(!n)return;const $=n.getBoundingClientRect(),X=Math.max(0,window.innerWidth-$.width),K=Math.max(0,window.innerHeight-$.height),ae=Math.min(Math.max(0,m),X),ie=Math.min(Math.max(0,P),K);n.style.left=`${ae}px`,n.style.top=`${ie}px`,n.style.right="auto",n.style.bottom="auto"}function me(m){if(!n||!a||m.target?.closest("button")||m.button!==0)return;const $=n.getBoundingClientRect();s=m.pointerId,x=m.clientX-$.left,R=m.clientY-$.top,a.classList.add("vlc-header--dragging"),a.setPointerCapture(m.pointerId),m.preventDefault()}function se(m){s===m.pointerId&&tt(m.clientX-x,m.clientY-R)}function ne(m){s===m.pointerId&&(s=null,a?.classList.remove("vlc-header--dragging"),a?.hasPointerCapture(m.pointerId)&&a.releasePointerCapture(m.pointerId))}function ge(m=document.body){if(document.getElementById(Fe))return t=document.getElementById(Fe),t;t=document.createElement("div"),t.id=Fe,t.setAttribute("data-vlc-panel","1");const P=t.attachShadow({mode:"open"}),$=document.createElement("style");$.textContent=Na,n=document.createElement("div"),n.className="vlc-panel",n.setAttribute("role","region"),n.setAttribute("aria-label",at),a=document.createElement("div"),a.className="vlc-header",a.addEventListener("pointerdown",me),a.addEventListener("pointermove",se),a.addEventListener("pointerup",ne),a.addEventListener("pointercancel",ne);const X=document.createElement("div");X.className="vlc-header-main";const K=document.createElement("div");K.className="vlc-header-text",i=document.createElement("h1"),i.className="vlc-title",i.textContent=at,K.appendChild(i),v=document.createElement("div"),v.className="vlc-id-signals",v.hidden=!0,v.setAttribute("aria-label","Sinais de captura"),E=Mt("P","Matrícula"),E.classList.add("vlc-signal--plate"),h=Mt("T","Telefone"),h.classList.add("vlc-signal--phone"),C=Mt("R","ID aleatório"),C.classList.add("vlc-signal--random"),y=document.createElement("span"),y.className="vlc-plate-image-meta",y.hidden=!0,f=document.createElement("span"),f.className="vlc-plate-image-index",b=document.createElement("button"),b.type="button",b.className="vlc-btn vlc-btn-icon vlc-btn-plate-preview",b.innerHTML=B,b.hidden=!0,b.addEventListener("click",xa=>{xa.preventDefault(),xa.stopPropagation(),Rt()}),y.append(f,b),v.append(E,y,h,C),K.appendChild(v),X.appendChild(K),c=Q("Clip again",()=>e.onClipListing()),c.classList.add("vlc-btn-header-clip"),g=Q(q("Copy again"),()=>e.onCopyAgain()),g.classList.add("vlc-btn-header-copy"),g.title=`Shortcut: ${T}`,g.disabled=!0,U=document.createElement("button"),U.type="button",U.className="vlc-btn vlc-btn-icon",U.addEventListener("click",et);const ae=document.createElement("div");ae.className="vlc-header-actions",ae.append(c,g,U),a.append(X,ae);const ie=document.createElement("div");ie.className="vlc-body";const Ie=document.createElement("div");Ie.className="vlc-actions",l=Q("Clip listing",()=>e.onClipListing()),d=Q("Cancel",()=>e.onCancel()),d.disabled=!0,u=Q(q("Copy again"),()=>e.onCopyAgain()),u.title=`Shortcut: ${T}`,u.disabled=!0;const xr=Q("Clear model cache",()=>e.onClearModelCache()),Cr=Q("Diagnostics",()=>e.onToggleDiagnostics()),wr=Q("Settings",()=>e.onSettings());Ie.append(l,d,u,xr,Cr,wr),o=document.createElement("div"),o.className="vlc-status",o.setAttribute("aria-live","polite"),r=document.createElement("div"),r.className="vlc-diag",r.hidden=!0;const Er=z.getElement();ie.append(Ie,o,r,Er),n.append(a,ie),p=document.createElement("div"),p.className="vlc-plate-preview-overlay",p.hidden=!0,p.setAttribute("role","dialog"),p.setAttribute("aria-modal","true"),p.setAttribute("aria-label","Imagem da placa"),_=document.createElement("button"),_.type="button",_.className="vlc-plate-preview-backdrop",_.setAttribute("aria-label","Fechar preview"),_.addEventListener("click",()=>{D||Se()});const $t=document.createElement("div");$t.className="vlc-plate-preview-dialog";const Dt=document.createElement("div");Dt.className="vlc-plate-preview-header",L=document.createElement("div"),L.className="vlc-plate-preview-caption",k=document.createElement("button"),k.type="button",k.className="vlc-btn vlc-btn-icon",k.innerHTML=W,k.setAttribute("aria-label","Fechar"),k.title="Fechar",k.addEventListener("click",()=>{if(D){Ee("discard");return}Se()}),Dt.append(L,k),S=document.createElement("img"),S.className="vlc-plate-preview-img",S.alt="Imagem onde a placa foi reconhecida",I=document.createElement("div"),I.className="vlc-plate-confirm",I.hidden=!0;const Ot=document.createElement("div");Ot.className="vlc-plate-confirm-alert",Ot.textContent="Confiança baixa",w=document.createElement("p"),w.className="vlc-plate-confirm-msg",A=document.createElement("p"),A.className="vlc-plate-confirm-value";const Ft=document.createElement("div");Ft.className="vlc-plate-confirm-actions";const ya=Q("Usar este valor",()=>{Ee("use")});ya.classList.add("vlc-btn-primary");const Sr=Q("Editar valor",()=>{Ee("edit")}),Lr=Q("Não usar placa",()=>{Ee("discard")});return Ft.append(ya,Sr,Lr),I.append(Ot,w,A,Ft),$t.append(Dt,S,I),p.append(_,$t),P.append($,n,p),te(),va(),m.appendChild(t),window.addEventListener("keydown",we),window.addEventListener("keydown",ha),t}function we(m){!m.altKey||m.ctrlKey||m.metaKey||m.shiftKey||m.code==="KeyC"&&j&&(m.preventDefault(),e.onCopyAgain())}function ha(m){if(m.key==="Escape"&&!(!p||p.hidden)){if(m.preventDefault(),D){Ee("discard");return}Se()}}function va(){const m=F!=null&&Number.isFinite(F)&&F>0,P=!!String(O||"").trim();y&&(y.hidden=!m),f&&(f.textContent=m?String(F):"",f.title=m?`Placa encontrada na imagem ${F}`:""),b&&(b.hidden=!(m&&P),b.title=m?`Ver imagem ${F}`:"Ver imagem da placa",b.setAttribute("aria-label",m?`Ver imagem ${F} da placa`:"Ver imagem da placa")),E&&m?(E.title=`Matrícula (imagem ${F})`,E.setAttribute("aria-label",`Matrícula encontrada na imagem ${F}`)):E&&(E.title="Matrícula",E.setAttribute("aria-label","Matrícula"))}function Nt({index:m=null,url:P=""}={}){F=typeof m=="number"&&Number.isFinite(m)&&m>0?Math.floor(m):null,O=typeof P=="string"?P.trim():"",va(),O||Se()}function nt(){D=!1,I&&(I.hidden=!0),_&&(_.disabled=!1,_.style.cursor="pointer"),k&&(k.hidden=!1,k.title="Fechar",k.setAttribute("aria-label","Fechar")),p&&(p.setAttribute("aria-label","Imagem da placa"),p.classList.remove("vlc-plate-preview-overlay--confirm"))}function Ee(m){const P=N;N=null,nt(),p&&(p.hidden=!0),S&&S.removeAttribute("src"),P?.(m)}function Rt(){!p||!S||!O||(nt(),S.src=O,L&&(L.textContent=F!=null&&F>0?`Imagem ${F} — origem da placa`:"Imagem — origem da placa"),p.hidden=!1)}function lr(m){const P=typeof m.imageUrl=="string"?m.imageUrl.trim():"",$=typeof m.imageIndex=="number"&&Number.isFinite(m.imageIndex)&&m.imageIndex>0?Math.floor(m.imageIndex):null;if(P&&Nt({index:$,url:P}),!p||!S||!O)return Promise.resolve("use");N&&Ee("discard"),Y(!1),nt(),D=!0,S.src=O;const X=typeof m.confidence=="number"&&Number.isFinite(m.confidence)?Math.round(Math.min(1,Math.max(0,m.confidence>1?m.confidence/100:m.confidence))*100):null;return L&&(L.textContent=$!=null?`Imagem ${$} — confiança baixa`:"Imagem — confiança baixa"),w&&(w.textContent=X!=null?`Nenhuma imagem atingiu 90% de confiança. A melhor leitura ficou em ${X}%. Quer usar este valor?`:"Nenhuma imagem atingiu 90% de confiança. Quer usar o valor encontrado?"),A&&(A.textContent=`Valor encontrado: ${m.plate||"—"}`),I&&(I.hidden=!1),_&&(_.disabled=!0,_.style.cursor="default"),k&&(k.title="Não usar placa",k.setAttribute("aria-label","Não usar placa")),p&&(p.setAttribute("aria-label","Confirmar matrícula com confiança baixa"),p.classList.add("vlc-plate-preview-overlay--confirm"),p.hidden=!1),new Promise(K=>{N=K})}function Se(){D&&N||p&&(p.hidden=!0,S&&S.removeAttribute("src"),nt())}function Q(m,P){const $=document.createElement("button");return $.type="button",$.className="vlc-btn",$.textContent=m,$.addEventListener("click",P),$}function Mt(m,P){const $=document.createElement("span");return $.className="vlc-signal",$.textContent=m,$.title=P,$.setAttribute("aria-label",P),$.setAttribute("aria-pressed","false"),$}function Le(m,P){m&&(m.classList.toggle("vlc-signal--on",!!P),m.setAttribute("aria-pressed",P?"true":"false"))}function sr(m){o&&(o.textContent=m)}function cr(m){const P=!!m;l&&(l.disabled=P),c&&(c.disabled=P),d&&(d.disabled=!P)}function dr({id:m="",isRandom:P=!1,hasPlate:$=!1,hasPhone:X=!1}={}){if(!v)return;const K=!!$,ae=!!X,ie=!!P;if(!(K||ae||ie||!!String(m||"").trim())){v.hidden=!0,Le(E,!1),Le(h,!1),Le(C,!1);return}v.hidden=!1,Le(E,K),Le(h,ae),Le(C,ie)}function ur(m){j=!!m,le()}function fr(m){const P=q(m||"Copy again");u&&(u.textContent=P,u.title=`Shortcut: ${T}`),g&&(g.textContent=P,g.title=`Shortcut: ${T}`)}function pr(m=2e3){M!=null&&(clearTimeout(M),M=null);for(const P of[g,u])P&&P.classList.add("vlc-btn--copied");M=setTimeout(()=>{M=null;for(const P of[g,u])P?.classList.remove("vlc-btn--copied")},m)}function mr(m,P=""){r&&(r.hidden=!m,r.textContent=P)}function gr(m,{phone:P="",plateImageIndex:$,plateImageUrl:X,plateConfidence:K}={}){const ae=$!==void 0?$:m?.metadata?.plateImageIndex??F,ie=X!==void 0?X:m?.metadata?.plateImageUrl||O;Nt({index:ae,url:ie});const Ie=K!==void 0?K:m?.metadata?.plateConfidence??null;z.showListing(m,{phone:P,plateImageIndex:F,plateImageUrl:O,plateConfidence:Ie})}function br(){z.focusPlateField()}function hr(m){z.showSettings(m)}function vr(){z.hide()}function yr(){M!=null&&(clearTimeout(M),M=null),window.removeEventListener("keydown",we),window.removeEventListener("keydown",ha),Se(),a&&(a.removeEventListener("pointerdown",me),a.removeEventListener("pointermove",se),a.removeEventListener("pointerup",ne),a.removeEventListener("pointercancel",ne)),t?.remove(),t=null,n=null,a=null,i=null,o=null,r=null,l=null,d=null,u=null,g=null,c=null,v=null,E=null,h=null,C=null,y=null,f=null,b=null,p=null,S=null,L=null,I=null,w=null,A=null,k=null,_=null,N=null,D=!1,U=null,V=!0,G="waiting",j=!1,F=null,O="",s=null}return{mount:ge,setStatus:sr,setBusy:cr,setClipboardId:dr,setPlateImageSource:Nt,openPlateImagePreview:Rt,closePlateImagePreview:Se,promptLowConfidencePlate:lr,setCopyEnabled:ur,setCopyLabel:fr,flashCopySuccess:pr,setCaptureStatus:De,setDiagnostics:mr,showListingForm:gr,showSettingsForm:hr,hideForm:vr,focusPlateField:br,setMinimized:Y,isMinimized:()=>V,toggleMinimized:et,destroy:yr}}function Pe(e){let t=String(e||"").replace(/\D/g,"");return t.startsWith("00")&&(t=t.slice(2)),t.startsWith("351")&&t.length>9&&(t=t.slice(3)),t}function ze(e){const t=String(e||"").trim();if(!/^tel:/i.test(t))return"";const n=t.slice(t.indexOf(":")+1);return Pe(n)}function Wt(e){return e==null||e===""?"":String(e).replace(/[^\d]/g,"")||""}function Xt(e){return e==null||e===""?"":typeof e=="number"&&Number.isFinite(e)?String(Math.round(e)):String(e).replace(/[^\d]/g,"")||""}function Yt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase();return t?t.includes("manual")?"MANUAL":t.includes("auto")||t.includes("cvt")||t.includes("dsg")||t.includes("eat")?"AUTOMÁTICA":String(e).trim().toUpperCase():""}function Zt(e){if(e==null||e==="")return"";const t=String(e).trim().toLowerCase().normalize("NFD").replace(/\p{M}/gu,"");return t?t.includes("gasolina")||t.includes("gasoline")||t==="petrol"?"GASOLINA":t.includes("diesel")||t.includes("gasoleo")||t.includes("gásóleo")?"DIESEL":t.includes("eletr")||t.includes("electr")?"ELÉTRICO":t.includes("hibr")||t.includes("hybrid")?"HÍBRIDO":t.includes("gpl")||t.includes("lpg")||t.includes("gnv")?"GPL":String(e).trim().toUpperCase():""}function Jt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";const n=t.replace(/\s/g,"").replace(/\./g,"").replace(/,/g,"");if(/^\d+$/.test(n)){const i=Number.parseInt(n,10);if(i===99||i===999)return"1.0";if(i>=100)return(i/1e3).toFixed(1)}const a=t.replace(",",".");return a==="1"?"1.0":a}function Qt(e){if(e==null||e==="")return"";const t=String(e).trim();if(!t)return"";if(/\bcv\b/i.test(t)){const a=t.replace(/[^\d]/g,"");return a?`${a} CV`:t.toUpperCase().replace(/\s+/g," ")}const n=t.replace(/[^\d]/g,"");return n?`${n} CV`:t}function en(e){if(e==null||e==="")return"";const t=String(e).replace(/[^\d]/g,"");return t.length>=4?t.slice(0,4):t}function He(e){return e==null||e===""?"":String(e).trim().toUpperCase()}function Ge(e){return e==null||e===""?"":String(e).replace(/\r\n/g,`
`).replace(/\r/g,`
`).replace(/[^\S\n]+/g," ").replace(/ *\n */g,`
`).replace(/\n{3,}/g,`

`).trim()}function qe(e){if(e==null||e==="")return"";const t=String(e).replace(/<\s*br\s*\/?\s*>/gi,`
`).replace(/<\/\s*p\s*>/gi,`
`).replace(/<\/\s*div\s*>/gi,`
`).replace(/<\/\s*li\s*>/gi,`
`).replace(/<[^>]+>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&#39;/gi,"'").replace(/&quot;/gi,'"');return Ge(t)}function oe(e,t="https://www.olx.pt/"){if(e==null||e==="")return"";try{const n=new URL(String(e),t);let a=`${n.origin}${n.pathname}`;const o=a.toLowerCase().indexOf(".html");return o!==-1&&(a=a.slice(0,o+5)),a}catch{return""}}const tn="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",nn='#mainContent img[data-testid="swiper-image-lazy"]',an="#mainContent div.swiper-wrapper img",on=[tn,nn,an],rn='#mainContent button[data-testid="ad-contact-phone"]',ln='#mainContent a[data-testid="contact-phone"][href^="tel:"]',sn='#mainContent [data-testid="ad-parameters-container"]',cn='#mainContent [data-testid="ad-price-container"] h3',lt='link#ssr_canonical[rel="canonical"]',dn='#mainContent [data-testid="offer_title"]',Oa='#mainContent [data-testid="ad_description"]',Fa='#mainContent [data-testid="user-profile-user-name"], [data-testid="seller_card"] [data-testid="user-profile-user-name"], [data-testid="user-profile-user-name"]',un='#mainContent [data-testid="breadcrumbs"] [data-testid="breadcrumb-item"], #mainContent [data-testid="breadcrumbs"] a',fn='script[type="application/ld+json"]';function Ba(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function Ua(e=document){const t=gn(e);if(t&&he(t))return t;for(const n of mn(e))if(he(n))return n;return null}function Va(e){return!!(e&&typeof e.click=="function")}function pn(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function _e(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function st(e){if(e.hidden)return!0;const n=pn(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function he(e){if(!e||typeof e.getBoundingClientRect!="function"||st(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(_e(e)>0)return!0;const n=pn(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function mn(e=document){return[...e.querySelectorAll(rn)].filter(t=>Va(t))}function gn(e=document){const t=mn(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=t.filter(l=>!st(l)),i=[...n.length>0?n:t].sort((l,d)=>{const u=he(l)?1:0,g=he(d)?1:0;return u!==g?g-u:_e(d)-_e(l)}),o=(()=>{const l=i[0];return{visible:he(l)?1:0,area:_e(l)}})(),r=i.filter(l=>(he(l)?1:0)===o.visible&&_e(l)===o.area);return r[r.length-1]||i[i.length-1]||t[t.length-1]}function ct(e=document){const t=[...e.querySelectorAll(ln)];for(const n of t){if(t.length>1&&st(n))continue;const a=n.getAttribute("href")||"",i=ze(a);if(i)return i;const o=Pe(n.textContent||"");if(o)return o}if(t.length>0){const n=t[t.length-1],a=n.getAttribute("href")||"",i=ze(a);if(i)return i;const o=Pe(n.textContent||"");if(o)return o}return null}function za(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function Ha(e){try{e.click()}catch{}za(e)}async function Ga(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=ct(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await Ba(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=Ua(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const g=Date.now()+n;for(Ha(d);Date.now()<g;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=ct(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(v=>setTimeout(v,a))}return{ok:!1,reason:"timeout"}}function qa(e){const t=new Map,n=e.querySelector(sn);if(!n)return t;for(const a of n.querySelectorAll("p")){const i=(a.textContent||"").replace(/\s+/g," ").trim();if(!i)continue;const o=i.indexOf(":");if(o<=0)continue;const r=i.slice(0,o).trim().toLowerCase(),l=i.slice(o+1).trim();r&&l&&t.set(r,l)}return t}function ja(e){const t=e.querySelectorAll(fn);for(const n of t){const a=n.textContent||"";if(a.trim())try{const i=JSON.parse(a),o=Array.isArray(i)?i:[i];for(const r of o)if(r&&r["@type"]==="Vehicle")return r}catch{}}return null}function Ka(e){const n=(e.querySelector?.(lt)||(typeof document<"u"?document.querySelector(lt):null))?.getAttribute?.("href")||"";return n?oe(n):typeof location<"u"&&location?.href?oe(location.href):""}function Wa(e){const t=e.querySelectorAll(un);for(const n of t){const i=(n.getAttribute?.("href")||"").match(/\/carros\/([^/?#]+)\//i);if(i?.[1])try{return decodeURIComponent(i[1]).replace(/-/g," ")}catch{return i[1].replace(/-/g," ")}}return""}function Xa(e){return e?.brand?typeof e.brand=="string"?e.brand:typeof e.brand?.name=="string"?e.brand.name:"":""}function Ya(e,t){return t?.sku!=null&&String(t.sku).trim()?String(t.sku).trim():String(e).match(/-ID([A-Za-z0-9]+)\.html/i)?.[1]||""}function Za(e){const t=e.querySelector?.(Oa);if(!t)return"";const n=[...t.children||[]].find(i=>String(i.tagName||"").toUpperCase()!=="H3");if(n)return qe(n.innerHTML||"");let a=qe(t.innerHTML||"");return a=a.replace(/^Descrição\s*/i,""),Ge(a)}function Ja(e=document){const t=[],n=[];function a(w,A){A&&t.push(w)}const i=qa(e),o=ja(e),r=Ka(e);a("url",r);const l=Ya(r,o);a("listingId",l);const u=(e.querySelector(dn)?.textContent||o?.name||"").replace(/\s+/g," ").trim();a("title",u);let g=Za(e);g||(g=qe(o?.description||"")),a("description",g);const v=(e.querySelector(Fa)?.textContent||"").replace(/\s+/g," ").trim();a("clientName",v);let E=Xa(o);E||(E=Wa(e)),E=He(E),a("make",E);let h=i.get("modelo")||o?.model||"";h=He(h),a("model",h);let C=i.get("ano")||o?.productionDate||o?.modelDate||"";C=en(C),a("year",C);const y=Wt(i.get("quilómetros")||i.get("quilometros")||"");a("mileageKm",y);const f=Yt(i.get("tipo de caixa")||"");a("transmission",f);const b=Zt(i.get("combustível")||i.get("combustivel")||"");a("fuel",b);const p=Jt(i.get("cilindrada")||"");a("engine",p);const S=Qt(i.get("potência")||i.get("potencia")||"");a("powerCv",S);let L=o?.offers?.price;(L==null||L==="")&&(L=e.querySelector(cn)?.textContent||"");const I=Xt(L);return a("priceEur",I),(!E||!h)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"olx-pt",url:r,listingId:l,title:u,description:g,clientName:v,make:E,model:h,year:C,mileageKm:y,transmission:f,fuel:b,engine:p,powerCv:S,priceEur:I,extractedFields:[...new Set(t)],warnings:n}}function Qa(e){return!e||typeof e!="string"?[]:e.split(",").map(t=>t.trim()).filter(Boolean).map(t=>{const n=t.split(/\s+/),a=n[0],i=n[1];let o=null;return i&&/^\d+w$/i.test(i)&&(o=Number.parseInt(i,10)),{url:a,width:o}}).filter(t=>!!t.url)}function ei(e){const t=Qa(e);if(t.length===0)return null;const n=t.filter(i=>typeof i.width=="number");if(n.length===0)return t[t.length-1].url;let a=n[0];for(let i=1;i<n.length;i+=1)n[i].width>a.width&&(a=n[i]);return a.url}function bn(e){if(!e)return null;const t=ei(e.getAttribute("srcset")||"");return t||(e.currentSrc?e.currentSrc:e.getAttribute("src")||e.src||null)}function ti(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function hn(e=document){for(const t of on){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function dt(e=document){const{images:t,selectorUsed:n}=hn(e),a=[],i=new Set;for(const o of t){const r=bn(o);if(!r)continue;const l=ti(r);i.has(l)||(i.add(l),a.push(l))}return{urls:a,count:a.length,selectorUsed:n}}async function ni(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=dt(t);if(i.count>0||!!!(t.querySelector("#mainContent .swiper-wrapper")||t.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=dt(t);return i}const vn={siteId:"olx-pt",discoverListingImages:dt,discoverListingImagesWithWait:ni,queryGalleryImages:hn,extractListing:Ja,findPhoneRevealButton:gn,readRevealedPhone:ct,revealContactPhone:Ga,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:tn,FALLBACK_TESTID_SELECTOR:nn,FALLBACK_SWIPER_IMG_SELECTOR:an,GALLERY_SELECTORS:on,PHONE_REVEAL_BUTTON_SELECTOR:rn,CONTACT_PHONE_SELECTOR:ln,AD_PARAMETERS_SELECTOR:sn,AD_PRICE_SELECTOR:cn,CANONICAL_LINK_SELECTOR:lt,OFFER_TITLE_SELECTOR:dn,BREADCRUMB_ITEM_SELECTOR:un,JSON_LD_SELECTOR:fn}},yn="script#__NEXT_DATA__",xn='h1.offer-title, [data-testid="summary-info-area"] h1',Cn='[data-testid="ad-price"] h3.offer-price__number, [data-testid="ad-price"] h3',wn='[data-testid="content-description-section"]',ut='link[rel="canonical"]',je='[data-testid="aside-seller-info"]',ai='[data-testid="aside-seller-info"] [data-testid="seller-header"] p, [data-testid="seller-header"] p',En='[data-testid="seller-info-contact-box"]',Sn='[data-testid="aside-seller-info"] a[href^="tel:"], [data-testid="seller-info-contact-box"] a[href^="tel:"], a[href^="tel:"]',Ln='[data-testid="main-gallery"] img, [data-testid^="gallery-image-"] img',In='[data-testid="main-gallery"] img, img[data-testid^="gallery-image-"]',An=[Ln,In];function ii(e){return`[data-testid="${e}"] p:last-of-type`}const oi=/ver\s+telefone/i;function ri(e,t){return e<=0?Promise.resolve(t?.aborted?"cancelled":"ok"):t?.aborted?Promise.resolve("cancelled"):new Promise(n=>{const a=setTimeout(()=>{t?.removeEventListener("abort",i),n("ok")},e),i=()=>{clearTimeout(a),n("cancelled")};t?.addEventListener("abort",i,{once:!0})})}function li(e){return!!(e&&typeof e.click=="function")}function kn(e){try{if(typeof getComputedStyle!="function")return null;const t=getComputedStyle(e);return{display:t.display||"",visibility:t.visibility||"",opacity:t.opacity||""}}catch{return null}}function ft(e){try{const t=e.getBoundingClientRect();return Math.max(0,t.width)*Math.max(0,t.height)}catch{return 0}}function Ke(e){if(e.hidden)return!0;const n=kn(e);return n?n.display==="none"||n.visibility==="hidden"||n.opacity==="0":!1}function We(e){if(!e||typeof e.getBoundingClientRect!="function"||Ke(e))return!1;if(typeof e.checkVisibility=="function")try{if(e.checkVisibility({checkOpacity:!0,checkVisibilityCSS:!0}))return!0}catch{}if(ft(e)>0)return!0;const n=kn(e);return!!(n&&n.display!=="none"&&n.visibility!=="hidden")}function Pn(e){if(!li(e)||e.closest('a[href^="tel:"]'))return!1;const t=(e.textContent||"").replace(/\s+/g," ").trim();return oi.test(t)}function _n(e=document){const t=[],n=new Set;function a(i){const o=e.querySelector?.(i)||null;if(o)for(const r of o.querySelectorAll("button"))!Pn(r)||n.has(r)||(n.add(r),t.push(r))}a(je),a(En);for(const i of e.querySelectorAll?.("button")||[])!Pn(i)||n.has(i)||(n.add(i),t.push(i));return t}function Tn(e=document){const t=_n(e);if(t.length===0)return null;if(t.length===1)return t[0];const n=e.querySelector?.(je);if(n){const r=t.find(l=>n.contains(l)&&!Ke(l));if(r)return r}const a=t.filter(r=>!Ke(r));return[...a.length>0?a:t].sort((r,l)=>{const d=We(r)?1:0,u=We(l)?1:0;return d!==u?u-d:ft(l)-ft(r)})[0]||t[0]}function si(e=document){const t=Tn(e);if(t&&We(t))return t;for(const n of _n(e))if(We(n))return n;return null}function pt(e=document){const t=[...e.querySelectorAll?.(Sn)||[]],n=e.querySelector?.(je),a=n&&t.length>1?[...t.filter(i=>n.contains(i)),...t.filter(i=>!n.contains(i))]:t;for(const i of a){if(a.length>1&&Ke(i))continue;const o=i.getAttribute("href")||"",r=ze(o);if(r)return r;const l=Pe(i.textContent||"");if(l)return l}if(a.length>0){const i=a[0],o=i.getAttribute("href")||"",r=ze(o);if(r)return r;const l=Pe(i.textContent||"");if(l)return l}return null}function ci(e){try{const t=Object.keys(e).find(i=>i.startsWith("__reactProps$")||i.startsWith("__reactEventHandlers$"));if(!t)return!1;const n=e[t];if(typeof n?.onClick!="function")return!1;const a={type:"click",target:e,currentTarget:e,bubbles:!0,cancelable:!0,defaultPrevented:!1,isTrusted:!0,preventDefault(){this.defaultPrevented=!0},stopPropagation(){},persist(){},nativeEvent:{isTrusted:!0}};return n.onClick(a),!0}catch{return!1}}function di(e){try{e.click()}catch{}ci(e)}async function ui(e={}){const{root:t=document,timeoutMs:n=15e3,intervalMs:a=250,buttonAppearDelayMs:i=2e3,buttonAppearAttempts:o=2,signal:r}=e,l=pt(t);if(l)return{ok:!0,phone:l,clicked:!1,alreadyVisible:!0};if(r?.aborted)return{ok:!1,reason:"cancelled"};let d=null;const u=Math.max(1,o);for(let c=0;c<u;c+=1){if(await ri(i,r)==="cancelled"||r?.aborted)return{ok:!1,reason:"cancelled"};if(d=si(t),d)break}if(!d)return{ok:!1,reason:"no-button"};const g=Date.now()+n;for(di(d);Date.now()<g;){if(r?.aborted)return{ok:!1,reason:"cancelled"};const c=pt(t);if(c)return{ok:!0,phone:c,clicked:!0,alreadyVisible:!1};await new Promise(v=>setTimeout(v,a))}return{ok:!1,reason:"timeout"}}const mt="https://www.standvirtual.com/";function Nn(e){if(!e||typeof e!="object")return{value:"",label:""};const n=(Array.isArray(e.values)?e.values:[])[0];return!n||typeof n!="object"?{value:"",label:""}:{value:n.value==null?"":String(n.value).trim(),label:n.label==null?"":String(n.label).trim()}}function Te(e){const{value:t,label:n}=Nn(e);return n||t}function Xe(e){const{value:t,label:n}=Nn(e);return t||n}function Rn(e){const n=e.querySelector?.(yn)?.textContent||"";if(!n.trim())return null;try{const i=JSON.parse(n)?.props?.pageProps?.advert;return i&&typeof i=="object"?i:null}catch{return null}}function fi(e){const n=(e.querySelector?.(ut)||(typeof document<"u"?document.querySelector(ut):null))?.getAttribute?.("href")||"";return n?oe(n,mt):typeof location<"u"&&location?.href?oe(location.href,mt):""}function pi(e,t){const n=String(e).match(/-ID([A-Za-z0-9]+)\.html/i);return n?.[1]?n[1]:t?.id!=null&&String(t.id).trim()?String(t.id).trim():""}function ce(e,t){return(e.querySelector?.(ii(t))?.textContent||"").replace(/\s+/g," ").trim()}function mi(e=document){const t=[],n=[];function a(A,k){k&&t.push(A)}const i=Rn(e),o=i?.parametersDict||{};let r="";i?.url&&(r=oe(i.url,mt)),r||(r=fi(e)),a("url",r);const l=pi(r,i);a("listingId",l);const d=e.querySelector?.(xn),u=(i?.title||d?.textContent||"").replace(/\s+/g," ").trim();a("title",u);let g="";if(i?.description&&(g=qe(i.description)),!g){const A=e.querySelector?.(wn);g=Ge(A?.textContent||"")}a("description",g);let c="";i?.seller?.name&&(c=String(i.seller.name).replace(/\s+/g," ").trim()),c||(c=(e.querySelector?.(ai)?.textContent||"").replace(/\s+/g," ").trim()),a("clientName",c);let v=Te(o.make)||ce(e,"make")||"";v=He(v),a("make",v);let E=Te(o.model)||ce(e,"model")||"";E=He(E),a("model",E);let h=Xe(o.first_registration_year)||ce(e,"first_registration_year")||"";h=en(h),a("year",h);const C=Wt(Xe(o.mileage)||ce(e,"mileage")||"");a("mileageKm",C);const y=Yt(Te(o.gearbox)||ce(e,"gearbox")||"");a("transmission",y);const f=Zt(Te(o.fuel_type)||ce(e,"fuel_type")||"");a("fuel",f);const b=Xe(o.engine_capacity)||ce(e,"engine_capacity")||"",p=/cm\s*3|cm3|\bcc\b/i.test(b)?b.replace(/cm\s*3|cm3|\bcc\b/gi,"").replace(/[^\d]/g,""):b,S=Jt(p);a("engine",S);const L=Qt(Xe(o.engine_power)||Te(o.engine_power)||ce(e,"engine_power")||"");a("powerCv",L);let I=i?.price?.value;(I==null||I==="")&&(I=e.querySelector?.(Cn)?.textContent||"");const w=Xt(I);return a("priceEur",w),(!v||!E)&&n.push("missing-make-or-model"),r||n.push("missing-url"),{siteId:"standvirtual-pt",url:r,listingId:l,title:u,description:g,clientName:c,make:v,model:E,year:h,mileageKm:C,transmission:y,fuel:f,engine:S,powerCv:L,priceEur:w,extractedFields:[...new Set(t)],warnings:n}}function Mn(e,t){if(!e||/^[a-z][a-z0-9+.-]*:/i.test(e))return e;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return e;try{return new URL(e,n).href}catch{return e}}function gi(e=document){const n=Rn(e)?.images?.photos;if(!Array.isArray(n)||n.length===0)return null;const a=[],i=new Set;for(const o of n){const r=o?.url||o?.src||"";if(!r)continue;const l=Mn(String(r));i.has(l)||(i.add(l),a.push(l))}return a.length===0?null:{urls:a,count:a.length,selectorUsed:"next-data:images.photos"}}function $n(e=document){for(const t of An){const n=e.querySelectorAll(t);if(n.length>0)return{images:[...n],selectorUsed:t}}return{images:[],selectorUsed:null}}function gt(e=document){const t=gi(e);if(t)return t;const{images:n,selectorUsed:a}=$n(e),i=[],o=new Set;for(const r of n){const l=bn(r);if(!l)continue;const d=Mn(l);o.has(d)||(o.add(d),i.push(d))}return{urls:i,count:i.length,selectorUsed:a}}async function bi(e={}){const{root:t=document,timeoutMs:n=2e3,intervalMs:a=100}=e;let i=gt(t);if(i.count>0||!!!(t.querySelector('[data-testid="main-gallery"]')||t.querySelector('[data-testid^="gallery-image-"]')))return i;const r=Date.now()+n;for(;i.count===0&&Date.now()<r;)await new Promise(l=>setTimeout(l,a)),i=gt(t);return i}const Dn={siteId:"standvirtual-pt",discoverListingImages:gt,discoverListingImagesWithWait:bi,queryGalleryImages:$n,extractListing:mi,findPhoneRevealButton:Tn,readRevealedPhone:pt,revealContactPhone:ui,selectors:{PRIMARY_GALLERY_SELECTOR:Ln,FALLBACK_GALLERY_SELECTOR:In,GALLERY_SELECTORS:An,CONTACT_PHONE_SELECTOR:Sn,ASIDE_SELLER_SELECTOR:je,CONTENT_CONTACT_SELECTOR:En,AD_PRICE_SELECTOR:Cn,CANONICAL_LINK_SELECTOR:ut,OFFER_TITLE_SELECTOR:xn,DESCRIPTION_SELECTOR:wn,NEXT_DATA_SELECTOR:yn}},On=new Map;function Fn(e){On.set(e.siteId,e)}function Bn(e){return On.get(e)}function Un(e){return String((typeof location<"u"?location.hostname:"")??"").toLowerCase().includes("standvirtual.com")?Bn("standvirtual-pt")||Dn:Bn("olx-pt")||vn}Fn(vn),Fn(Dn);function hi(e,t,n){let a=e,i=t;if(typeof n=="number"&&Number.isFinite(n)&&n>0){const o=Math.max(a,i);if(o>n){const r=n/o;a=Math.max(1,Math.round(a*r)),i=Math.max(1,Math.round(i*r))}}return{width:a,height:i}}async function vi(e,t=""){const n=t?[t]:["image/jpeg","image/png","image/webp","image/svg+xml"];let a=null;for(const i of n)try{const o=new Blob([e],{type:i});return await createImageBitmap(o)}catch(o){a=o}try{const i=new Blob([e]);return await createImageBitmap(i)}catch(i){throw a||i}}function yi(e,t={}){const{maxLongEdge:n}=t,{width:a,height:i}=hi(e.width,e.height,n),o=document.createElement("canvas");o.width=a,o.height=i;const r=o.getContext("2d",{willReadFrequently:!0});if(!r)throw new Error("2D canvas context unavailable");r.drawImage(e,0,0,a,i);const l=r.getImageData(0,0,a,i);return{canvas:o,imageData:l,width:a,height:i}}const bt=new Map;function ht(){return typeof GM<"u"&&GM!=null}async function Vn(e,t=null){return typeof GM_getValue=="function"?GM_getValue(e,t):ht()&&typeof GM.getValue=="function"?GM.getValue(e,t):bt.has(e)?bt.get(e):t}async function zn(e,t){if(typeof GM_setValue=="function"){GM_setValue(e,t);return}if(ht()&&typeof GM.setValue=="function"){await GM.setValue(e,t);return}bt.set(e,t)}async function xi(e){if(typeof GM_setClipboard=="function")return GM_setClipboard(e,"text"),!0;if(ht()&&typeof GM.setClipboard=="function")return await GM.setClipboard(e,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(e),!0}catch{return!1}return!1}function Hn(e){const{method:t,url:n,responseType:a="arraybuffer",headers:i,signal:o}=e;return new Promise((r,l)=>{if(o?.aborted){l(new DOMException("Aborted","AbortError"));return}let d=null;const u=()=>{try{d?.abort?.()}catch{}l(new DOMException("Aborted","AbortError"))};o?.addEventListener("abort",u,{once:!0}),(c=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(c);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(c);return}l(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:t,url:n,responseType:a,headers:i,onload(c){o?.removeEventListener("abort",u);const v=c.status;if(v<200||v>=300){l(new Error(`HTTP ${v} for ${n}`));return}r(c.response)},onerror(){o?.removeEventListener("abort",u),l(new Error(`Network error for ${n}`))},ontimeout(){o?.removeEventListener("abort",u),l(new Error(`Timeout for ${n}`))}})})}async function Ci(e,t={}){const{signal:n,request:a=Hn}=t;if(n?.aborted)throw new DOMException("Aborted","AbortError");const i=await a({method:"GET",url:e,responseType:"arraybuffer",signal:n});if(!(i instanceof ArrayBuffer||Object.prototype.toString.call(i)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${e}`);return{url:e,bytes:i}}function wi(e,t){const n=Math.max(0,Math.floor(Math.min(t.x1,t.x2))),a=Math.max(0,Math.floor(Math.min(t.y1,t.y2))),i=Math.min(e.width,Math.ceil(Math.max(t.x1,t.x2))),o=Math.min(e.height,Math.ceil(Math.max(t.y1,t.y2))),r=Math.max(1,i-n),l=Math.max(1,o-a),d=document.createElement("canvas");d.width=e.width,d.height=e.height;const u=d.getContext("2d");return u.putImageData(e,0,0),u.getImageData(n,a,r,l)}function Ei(e,t,n){const a=document.createElement("canvas");a.width=e.width,a.height=e.height,a.getContext("2d").putImageData(e,0,0);const i=document.createElement("canvas");i.width=n,i.height=t;const o=i.getContext("2d");o.drawImage(a,0,0,n,t);const{data:r}=o.getImageData(0,0,n,t),l=new Uint8Array(1*t*n*3);let d=0;for(let u=0;u<t*n;u+=1)l[d++]=r[u*4],l[d++]=r[u*4+1],l[d++]=r[u*4+2];return l}const Gn=1440,Si=`${Gn}x0`,Li=/apollo\.olxcdn\.com/i,Ii=/;s=\d+x\d+/i;function Ai(e){return typeof e=="string"&&Li.test(e)}function qn(e,t){if(!e||typeof e!="string"||!Ai(e))return e;const n=e.replace(Ii,"");return t?/;q=/i.test(n)?n.replace(/;q=/i,`;s=${t};q=`):`${n};s=${t}`:n}function ki(e){return qn(e,Si)}function Pi(e){return qn(e,null)}function _i(e,t,n=[114,114,114]){const{width:a,height:i}=e,o=Math.min(t/i,t/a),r=Math.round(a*o),l=Math.round(i*o),d=(t-r)/2,u=(t-l)/2,g=Math.round(u-.1),c=Math.round(d-.1),v=document.createElement("canvas");v.width=a,v.height=i,v.getContext("2d").putImageData(e,0,0);const h=document.createElement("canvas");h.width=t,h.height=t;const C=h.getContext("2d");C.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,C.fillRect(0,0,t,t),C.drawImage(v,0,0,a,i,c,g,r,l);const y=C.getImageData(0,0,t,t).data,f=new Float32Array(3*t*t),b=t*t;for(let p=0;p<b;p+=1){const S=y[p*4],L=y[p*4+1],I=y[p*4+2];f[p]=S/255,f[b+p]=L/255,f[2*b+p]=I/255}return{tensor:f,ratio:o,pad:{dw:d,dh:u},size:t}}function Ti(e,t,n){return{x1:(e.x1-n.dw)/t,y1:(e.y1-n.dh)/t,x2:(e.x2-n.dw)/t,y2:(e.y2-n.dh)/t}}const Ni="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",Ri="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Mi="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",$i="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function jn(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Ni},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:Ri,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Mi},ortWasmBaseUrl:$i}}const Ye={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let Kn=null;function Di(){const e=[];typeof globalThis<"u"&&e.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&e.push(unsafeWindow)}catch{}typeof window<"u"&&e.push(window),typeof self<"u"&&e.push(self);for(const t of e)if(t?.ort)return t.ort;try{const t=(0,eval)('typeof ort !== "undefined" ? ort : null');if(t)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=t),t}catch{}return null}function vt(){const e=Di();if(e)return e;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Wn=new Proxy({},{get(e,t){return vt()[t]}});function Oi(){const e=vt(),t=jn();e?.env?.wasm&&(e.env.wasm.wasmPaths=t.ortWasmBaseUrl,e.env.wasm.numThreads=1)}async function Xn(e,t={}){Oi();const n=vt(),a=t.prefer||["webgpu","wasm"],i=[];for(const o of a)try{const r=await n.InferenceSession.create(e,{executionProviders:[o]});return Kn=o,{session:r,provider:o}}catch(r){i.push(`${o}: ${r instanceof Error?r.message:String(r)}`)}throw new Error(`Failed to create ORT session. Tried: ${i.join(" | ")}`)}function yt(){return Kn}const xt=384,Fi="images",Bi="output0";async function Ui(e,t,n={}){const a=n.confThresh??.4,{tensor:i,ratio:o,pad:r}=_i(t,xt),l=new Wn.Tensor("float32",i,[1,3,xt,xt]),d=await e.run({[Fi]:l}),u=d[Bi]||Object.values(d)[0];if(!u)return[];const g=u.data,c=u.dims||[],v=c.length>=2?c[c.length-1]:7,E=Math.floor(g.length/v),h=[];for(let C=0;C<E;C+=1){const y=C*v,f=g[y+1],b=g[y+2],p=g[y+3],S=g[y+4],L=g[y+5],I=g[y+6];if(I<a)continue;const w=Ti({x1:f,y1:b,x2:p,y2:S},o,r);h.push({...w,score:Number(I),classId:Number(L)})}return h.sort((C,y)=>y.score-C.score),h}function Vi(e,t,n=Ye){const a=n.alphabet,i=n.maxPlateSlots,o=a.length,r=e,l=[],d=[];for(let g=0;g<i;g+=1){let c=0,v=-1/0;for(let E=0;E<o;E+=1){const h=Number(r[g*o+E]);h>v&&(v=h,c=E)}l.push(a[c]),d.push(v)}let u=l.join("");return n.padChar&&(u=u.replace(new RegExp(`${zi(n.padChar)}+$`),"")),{text:u,charProbs:d.slice(0,Math.max(u.length,1))}}function zi(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Hi(e,t){const{imgHeight:n,imgWidth:a}=Ye,i=Ei(t,n,a),o=new Wn.Tensor("uint8",i,[1,n,a,3]),r=await e.run({input:o}),l=r.plate||Object.values(r)[0],d=l.dims||[1,Ye.maxPlateSlots,Ye.alphabet.length],u=d[d.length-1],c=d[d.length-2]*u,v=l.data,E=v.length>=c?v.slice(0,c):v;return Vi(E)}const de="models",Gi=1;let Ze=null;function Ct(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):Ze||(Ze=new Promise((e,t)=>{const n=indexedDB.open(Bt,Gi);n.onupgradeneeded=()=>{const a=n.result;a.objectStoreNames.contains(de)||a.createObjectStore(de,{keyPath:"id"})},n.onsuccess=()=>e(n.result),n.onerror=()=>t(n.error||new Error("IndexedDB open failed"))}),Ze)}async function Yn(e){const t=await crypto.subtle.digest("SHA-256",e);return[...new Uint8Array(t)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function qi(e){const t=await Ct();return new Promise((n,a)=>{const o=t.transaction(de,"readonly").objectStore(de).get(e);o.onsuccess=()=>{const r=o.result;n(r?.bytes||null)},o.onerror=()=>a(o.error)})}async function ji(e,t,n){const a=await Ct();return new Promise((i,o)=>{const r=a.transaction(de,"readwrite");r.objectStore(de).put({id:e,bytes:t,sha256:n,storedAt:Date.now()}),r.oncomplete=()=>i(),r.onerror=()=>o(r.error)})}async function Ki(){const e=await Ct();return new Promise((t,n)=>{const a=e.transaction(de,"readwrite");a.objectStore(de).clear(),a.oncomplete=()=>t(),a.onerror=()=>n(a.error)})}async function Zn(e,t={}){const{onStatus:n,signal:a}=t,i=await qi(e.id).catch(()=>null);if(i&&await Yn(i)===e.sha256)return n?.(`Model cache hit: ${e.id}`),{bytes:i,cacheHit:!0};n?.(`Downloading model: ${e.id}`);const o=await Hn({method:"GET",url:e.url,responseType:"arraybuffer",signal:a}),r=o instanceof ArrayBuffer||Object.prototype.toString.call(o)==="[object ArrayBuffer]"?o:null;if(!r)throw new Error(`Model download did not return ArrayBuffer: ${e.id}`);const l=await Yn(r);if(l!==e.sha256)throw new Error(`SHA-256 mismatch for ${e.id}: expected ${e.sha256}, got ${l}`);return await ji(e.id,r,l).catch(()=>{}),{bytes:r,cacheHit:!1}}let Ne=null;async function Wi(e={}){if(Ne)return{sessions:Ne,diagnostics:{provider:yt(),detectorCacheHit:!0,ocrCacheHit:!0}};const t=jn(),n=await Zn(t.detector,e),a=await Zn(t.ocr,e);e.onStatus?.("Initializing ONNX Runtime…");const i=await Xn(n.bytes),o=await Xn(a.bytes);return Ne={detector:i.session,ocr:o.session},{sessions:Ne,diagnostics:{provider:i.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:a.cacheHit}}}function Xi(){Ne=null}async function Yi(e,t,n={}){const{signal:a,maxLongEdge:i}=n;let o=0,r;try{const d=await vi(t);r=yi(d,{maxLongEdge:i}).imageData,d.close?.()}catch{return null}const l=await Ui(e.detector,r);for(const d of l){if(a?.aborted)throw new DOMException("Aborted","AbortError");o+=1;const u=wi(r,d),g=await Hi(e.ocr,u),c=_a(g.text,g.charProbs);if(c.accepted)return{plate:c.plate,plateFormatted:c.plateFormatted,meanConfidence:typeof c.meanConfidence=="number"&&Number.isFinite(c.meanConfidence)?c.meanConfidence:null,detectionsTried:o}}return{plate:"",plateFormatted:"",meanConfidence:null,detectionsTried:o}}function wt(e,t,n,a,i,o){return{ok:!0,plate:e.plate,plateFormatted:e.plateFormatted,meanConfidence:e.meanConfidence,needsConfirmation:o,imageIndex:e.imageIndex,imageUrl:e.imageUrl,diagnostics:{provider:yt()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:a,elapsedMs:Date.now()-i}}}async function Jn(e){const{sessionPair:t,downloadUrl:n,galleryUrl:a,imageIndex:i,maxLongEdge:o,signal:r,request:l,onDownloaded:d,scan:u}=e;let g;try{g=await Ci(n,{signal:r,request:l})}catch(v){if(r?.aborted||v?.name==="AbortError")throw v;return{status:"download-failed"}}d?.();let c;try{c=await u(t,g.bytes,{signal:r,maxLongEdge:o})}finally{g=null}return!c||!c.plate?{status:"scanned",hit:null,detectionsTried:c?.detectionsTried??0}:{status:"scanned",hit:{plate:c.plate,plateFormatted:c.plateFormatted,meanConfidence:c.meanConfidence,imageIndex:i,imageUrl:a},detectionsTried:c.detectionsTried}}async function Zi(e,t={}){const n=Date.now(),{onStatus:a,signal:i,request:o}=t,r=t.scanImageForPlate||Yi,l=e.length,d=await Wi({onStatus:a,signal:i}),u=d.sessions;let g=0,c=0;const v=[];for(let h=0;h<l;h+=1){if(i?.aborted)return ve("cancelled",d.diagnostics,c,g,n);const C=e[h],y=ki(C);a?.(`Downloading image ${h+1} of ${l}`);let f;try{f=await Jn({sessionPair:u,downloadUrl:y,galleryUrl:C,imageIndex:h+1,maxLongEdge:Gn,signal:i,request:o,scan:r,onDownloaded:()=>{a?.(`Scanning image ${h+1} of ${l}`)}})}catch(b){if(i?.aborted||b?.name==="AbortError")return ve("cancelled",d.diagnostics,c,g,n);a?.(`Failed to download image ${h+1} of ${l}, skipping…`);continue}if(f.status==="download-failed"){a?.(`Failed to download image ${h+1} of ${l}, skipping…`);continue}if(c+=1,g+=f.detectionsTried,!!f.hit){if(Ve(f.hit.meanConfidence))return wt(f.hit,d.diagnostics,c,g,n,!1);v.push(f.hit),a?.("Plate candidate below 90% confidence — scanning remaining images…")}}if(v.length===0)return ve("no-reliable-plate",d.diagnostics,c,g,n);a?.(`Re-scanning ${v.length} plate candidate(s) at high resolution…`);let E=null;for(const h of v){if(E=jt(E,h),i?.aborted)return ve("cancelled",d.diagnostics,c,g,n);const C=e[h.imageIndex-1]||h.imageUrl,y=Pi(C);a?.(`Downloading high-resolution candidate ${h.imageIndex} of ${l}`);let f;try{f=await Jn({sessionPair:u,downloadUrl:y,galleryUrl:C,imageIndex:h.imageIndex,maxLongEdge:void 0,signal:i,request:o,scan:r})}catch(b){if(i?.aborted||b?.name==="AbortError")return ve("cancelled",d.diagnostics,c,g,n);continue}if(f.status!=="download-failed"&&(c+=1,g+=f.detectionsTried,!!f.hit)){if(Ve(f.hit.meanConfidence))return wt(f.hit,d.diagnostics,c,g,n,!1);E=jt(E,f.hit)}}return E?wt(E,d.diagnostics,c,g,n,!0):ve("no-reliable-plate",d.diagnostics,c,g,n)}function ve(e,t,n,a,i){return{ok:!1,reason:e,diagnostics:{provider:yt()||t.provider,detectorCacheHit:t.detectorCacheHit,ocrCacheHit:t.ocrCacheHit,imagesScanned:n,detectionsTried:a,elapsedMs:Date.now()-i}}}async function Qn(e){return await xi(e)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function ea(){return`99${String(Math.floor(Math.random()*1e5)).padStart(5,"0")}99`}function ta({plate:e,phone:t,fallbackId:n}={}){const a=e==null?"":String(e).trim();if(a)return{id:a,isRandom:!1};const i=t==null?"":String(t).trim();if(i)return{id:i,isRandom:!1};const o=n==null?"":String(n).trim();return o?{id:o,isRandom:!0}:{id:ea(),isRandom:!0}}function na(e={}){return ta(e).id}function Ji(e){const t=/^ID:\s*(.+)\s*$/m.exec(String(e||""));return t?t[1].trim():""}function Qi(e,{phone:t="",fallbackId:n=""}={}){const a=e||{},i=t==null?"":String(t).trim(),o=a.plate==null?"":String(a.plate).trim(),l=[`ID: ${na({plate:o,phone:i,fallbackId:n})}`,`Telefone: ${i}`,""];for(const u of ot){if(u==="url")continue;const g=Vt[u];let c=a[u]==null?"":String(a[u]);u==="customerValueEur"&&c&&!/€/.test(c)&&(c=`${c} €`),l.push(`${g}: ${c}`)}const d=a.url==null?"":String(a.url);return l.push(""),l.push(d),l.join(`
`)}const Et="<<<LEAD_CLIP_V1>>>",aa="<<<END_LEAD_CLIP>>>";function eo(e,t={}){const n=e?.fields||{},a=e?.source||{},i=t.phone==null?"":String(t.phone).trim();return{v:1,id:na({plate:n.plate,phone:i,fallbackId:t.fallbackId}),phone:i,plate:String(n.plate||""),clientName:String(n.clientName||a.clientName||"").trim(),make:String(n.make||""),model:String(n.model||""),year:String(n.year||""),mileageKm:String(n.mileageKm||""),transmission:String(n.transmission||""),fuel:String(n.fuel||""),engine:String(n.engine||""),powerCv:String(n.powerCv||""),customerValueEur:String(n.customerValueEur||""),url:String(n.url||a.url||""),siteId:String(a.siteId||""),title:String(a.title||""),description:Ge(a.description||"")}}function to(e,t){const n=JSON.stringify(t,null,2);return`${String(e||"").replace(/\s+$/,"")}

${Et}
${n}
${aa}
`}function no(e){const t=String(e||""),n=t.indexOf(Et);if(n<0)return{ok:!1,error:"LEAD_CLIP_V1 block not found"};const a=n+Et.length,i=t.indexOf(aa,a);if(i<0)return{ok:!1,error:"LEAD_CLIP_V1 end delimiter missing"};const o=t.slice(a,i).trim(),r=t.slice(0,n).replace(/\s+$/,"");try{const l=JSON.parse(o);return!l||l.v!==1||typeof l!="object"?{ok:!1,error:"Invalid LEAD_CLIP payload (expected v:1)"}:{ok:!0,payload:l,humanText:r}}catch(l){return{ok:!1,error:l instanceof Error?l.message:"JSON parse failed"}}}const ao="listingCache",io=2880*60*1e3;function ia(){return`${Oe}${ao}`}function St(e){if(!e||typeof e!="object")return!1;const t=e;return typeof t.processedAt=="number"&&Number.isFinite(t.processedAt)&&typeof t.phone=="string"&&typeof t.clipboard=="string"&&t.listingRecord!=null&&typeof t.listingRecord=="object"}function oo(e){if(!e||typeof e!="object"||Array.isArray(e))return{};const t={};for(const[n,a]of Object.entries(e))typeof n=="string"&&n&&St(a)&&(t[n]={processedAt:a.processedAt,phone:a.phone,clipboard:a.clipboard,fallbackId:typeof a.fallbackId=="string"?a.fallbackId:"",listingRecord:a.listingRecord});return t}async function ro(){const e=await Vn(ia(),{});return oo(e)}async function Lt(e){await zn(ia(),e)}async function It(e=Date.now()){const t=await ro(),n={};let a=!1;for(const[i,o]of Object.entries(t))e-o.processedAt<=io?n[i]=o:a=!0;return(a||Object.keys(n).length!==Object.keys(t).length)&&await Lt(n),n}async function lo(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return null;const i=(await It(t))[n];return i&&St(i)?i:null}async function so(e,t,n=Date.now()){const a=typeof e=="string"?e.trim():"";if(!a||!St(t))return null;const i=await It(n),o={processedAt:t.processedAt,phone:t.phone,clipboard:t.clipboard,fallbackId:typeof t.fallbackId=="string"?t.fallbackId:"",listingRecord:t.listingRecord};return i[a]=o,await Lt(i),o}async function co(e,t=Date.now()){const n=typeof e=="string"?e.trim():"";if(!n)return!1;const a=await It(t);return n in a?(delete a[n],await Lt(a),!0):!1}const oa="valuationDefaults";async function uo(e,t=null){return Vn(`${Oe}${e}`,t)}async function fo(e,t){await zn(`${Oe}${e}`,t)}async function ra(){const e=await uo(oa,null);return!e||typeof e!="object"?{...Be}:{...Be,...e}}async function po(e){const t={...Be,...e};return await fo(oa,t),t}function At(e=document){return e?typeof e.visibilityState=="string"?e.visibilityState==="visible":!e.hidden:!0}function mo(e={}){const{doc:t=document,signal:n}=e;return n?.aborted?Promise.resolve("cancelled"):At(t)?Promise.resolve("visible"):new Promise(a=>{const i=()=>{r(),a("cancelled")},o=()=>{At(t)&&(r(),a("visible"))},r=()=>{t.removeEventListener("visibilitychange",o),n?.removeEventListener("abort",i)};t.addEventListener("visibilitychange",o),n&&n.addEventListener("abort",i,{once:!0})})}const ye=Object.freeze(["⏳","🔔","📋","✅","⛔"]),go=ye[0],bo=ye[1],ho=ye[2],vo=ye[3],yo=ye[4];let xe=null;function xo(e){const t=String(e??"");for(const n of ye){if(t.startsWith(`${n} `))return t.slice(n.length+1);if(t.startsWith(n))return t.slice(n.length).trimStart()}return t}function Co(e){const t=String(e||"").trim().toLowerCase();return t?t==="waiting"||t==="reading"||t.startsWith("analisando imagem")?go:t==="lendo tel"?bo:t==="ready to copy"?ho:t==="data copied"?vo:t==="no data found."?yo:null:null}function wo(e=globalThis.document){return xe==null&&(xe=xo(e?.title??"")),xe}function Eo(e,t=globalThis.document){if(!t)return;const n=Co(e);if(!n)return;const a=wo(t);t.title=`${n} ${a}`}function So(e=globalThis.document){xe!=null&&(e&&(e.title=xe),xe=null)}const Lo=5e3;function Io(){let e=Ut(),t=null,n=null,a=null,i="",o=0;function r(s){s&&(t?.setCaptureStatus(s),Eo(s))}function l(s){e={...e,statusMessage:s},t?.setStatus(s);const x=String(s||"").match(/^(?:Scanning|Downloading) image (\d+) of (\d+)/i);x&&r(`analisando imagem ${x[1]} de ${x[2]}`)}function d(){try{const s=Un().extractListing(document);if(s?.url)return oe(s.url)}catch{}return typeof location<"u"&&location?.href?oe(location.href):""}function u(s={}){const x=s.plate??e.listingRecord?.fields?.plate??e.lastPlate??"",R=s.phone??e.lastPhone??"",M=s.fallbackId??e.fallbackId??"",T=!!String(x).trim(),q=!!String(R).trim();if(!T&&!q&&!String(M).trim()){t?.setClipboardId({id:"",isRandom:!1,hasPlate:!1,hasPhone:!1});return}t?.setClipboardId({...ta({plate:x,phone:R,fallbackId:M}),hasPlate:T,hasPhone:q})}function g(s,x){const R=x.listingRecord,M=x.phone||"",T=R?.fields?.plate||"",z=!String(T).trim()&&!String(M).trim()&&(x.fallbackId||Ji(x.clipboard))||"",re=typeof R?.metadata?.plateImageIndex=="number"&&R.metadata.plateImageIndex>0?R.metadata.plateImageIndex:null,H=typeof R?.metadata?.plateImageUrl=="string"?R.metadata.plateImageUrl:"",B=typeof R?.metadata?.plateConfidence=="number"&&Number.isFinite(R.metadata.plateConfidence)?R.metadata.plateConfidence:null;i=s,o=x.processedAt,e={...e,lastPlate:T,lastPhone:M,lastClipboard:x.clipboard||"",fallbackId:z,listingRecord:R,plateImageIndex:re,plateImageUrl:H,plateConfidence:B,view:"form"},t?.showListingForm(R,{phone:M,plateImageIndex:re,plateImageUrl:H,plateConfidence:B}),t?.setCopyEnabled(!!x.clipboard),t?.setCopyLabel("Copy"),u({plate:T,phone:M,fallbackId:z}),r("ready to copy"),l("Ready to copy")}function c(s,x=""){const R=s?.fields?.plate||"",M=x==null?"":String(x).trim();let T=e.fallbackId||"";!String(R).trim()&&!M&&(T||(T=ea()),e={...e,fallbackId:T});const q=Qi(s.fields,{phone:M,fallbackId:e.fallbackId}),z=eo(s,{phone:M,fallbackId:e.fallbackId});return to(q,z)}async function v(s){const x=i||oe(s.listingRecord?.fields?.url||"")||d();if(!x||!s.listingRecord||!s.clipboard)return;const R=s.processedAt??o??Date.now();i=x,o=R,await so(x,{processedAt:R,phone:s.phone??e.lastPhone??"",clipboard:s.clipboard,fallbackId:s.fallbackId??e.fallbackId??"",listingRecord:s.listingRecord})}async function E(){try{const s=d();if(s){const x=await lo(s);if(x){if(Gt(x.listingRecord,{plate:x.listingRecord?.fields?.plate,phone:x.phone})){g(s,x);return}await co(s)}}}catch{}C()}function h(){a!=null&&(clearTimeout(a),a=null)}function C(){h(),r("waiting"),a=setTimeout(()=>{a=null,L()},Lo)}function y(s){e={...e,busy:s,view:s?"reading":e.listingRecord?"form":"idle"},t?.setBusy(s),s&&r("reading")}function f(){if(!e.diagnosticsVisible){t?.setDiagnostics(!1);return}const s=e.lastDiagnostics;if(!s){t?.setDiagnostics(!0,"No diagnostics yet. Run Clip listing.");return}t?.setDiagnostics(!0,[`Provider: ${s.provider||"n/a"}`,`Detector cache: ${s.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${s.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${s.imagesScanned??0}`,`Detections tried: ${s.detectionsTried??0}`,e.plateImageIndex?`Plate image: ${e.plateImageIndex}`:null,`Elapsed: ${s.elapsedMs??0} ms`].filter(Boolean).join(`
`))}function b(s,x,R){const M=[];if(x.plate){const T=x.plateImageIndex!=null&&x.plateImageIndex>0?` (imagem ${x.plateImageIndex})`:"";M.push(`Plate found: ${x.plate}${T}`)}else M.push("No reliable plate found.");return x.phone&&M.push(`Phone: ${x.phone}`),(s.fields.make||s.fields.model)&&M.push(`Listing: ${[s.fields.make,s.fields.model].filter(Boolean).join(" ")}`.trim()),M.push(R),M.join(`
`)}function p(s){e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)}async function S(s){return p(s),Qn(s)}async function L(){if(h(),e.busy)return;n=new AbortController;const{signal:s}=n;y(!0);try{const x=Un(),R=await ra();l("Extracting listing fields…");const M=x.extractListing(document);let T={ok:!1,reason:"no-images"},q=0;const z=!!e.listingRecord&&!!t?.isMinimized?.();if(z){const se=String(e.listingRecord?.fields?.plate||e.lastPlate||"").trim(),ne=e.plateImageIndex??e.listingRecord?.metadata?.plateImageIndex??null,ge=e.plateImageUrl||e.listingRecord?.metadata?.plateImageUrl||"",we=e.plateConfidence??e.listingRecord?.metadata?.plateConfidence??null;T=se?{ok:!0,plate:se,reason:"reused",imageIndex:typeof ne=="number"&&ne>0?ne:void 0,imageUrl:ge||void 0,meanConfidence:typeof we=="number"&&Number.isFinite(we)?we:null,needsConfirmation:!1}:{ok:!1,reason:"reused-no-plate"},l("Refreshing listing text and phone…")}else{l("Looking for listing images…");const se=await x.discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:ne,count:ge}=se;q=ge,ge>0?(l(`Found ${ge} listing images — scanning…`),l("Loading plate recognition models…"),T=await Zi(ne,{signal:s,onStatus:l}),e={...e,lastDiagnostics:T.diagnostics},f()):l("No listing images — waiting for phone…")}if(s.aborted||T.reason==="cancelled"){l("Cancelled.");return}if(At()||(r("lendo tel"),l("Waiting for this tab to extract phone…")),await mo({signal:s})==="cancelled"||s.aborted){l("Cancelled.");return}r("lendo tel"),l("Waiting for phone button…");const H=await x.revealContactPhone({root:document,timeoutMs:15e3,intervalMs:250,buttonAppearDelayMs:2e3,buttonAppearAttempts:2,signal:s});let B=T.ok&&T.plate?T.plate:"";const W=H.ok?H.phone:"";let J=B&&typeof T.imageIndex=="number"&&T.imageIndex>0?T.imageIndex:null,te=B&&typeof T.imageUrl=="string"?T.imageUrl:"",Y=B&&typeof T.meanConfidence=="number"&&Number.isFinite(T.meanConfidence)?T.meanConfidence:null;if(s.aborted){l("Cancelled.");return}const et=!!B&&!z&&(T.needsConfirmation===!0||!Ve(Y));let De=null;if(et&&t?.promptLowConfidencePlate){t.setMinimized?.(!1);const se=Ht({extracted:M,plate:B,defaults:R,plateImage:{index:J,url:te,confidence:Y}});if(t.showListingForm(se,{phone:W,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y}),l("Confiança da placa abaixo de 90% — confirme se quer usar o valor."),De=await t.promptLowConfidencePlate({plate:B,confidence:Y,imageIndex:J,imageUrl:te}),s.aborted){l("Cancelled.");return}De==="discard"&&(B="",J=null,te="",Y=null)}const le=Ht({extracted:M,plate:B,defaults:R,plateImage:{index:J,url:te,confidence:Y}});if(e={...e,lastPlate:B,lastPhone:W,fallbackId:"",listingRecord:le,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y,view:"form"},t?.showListingForm(le,{phone:W,plateImageIndex:J,plateImageUrl:te,plateConfidence:Y}),De==="edit"&&t?.focusPlateField?.(),!Gt(le,{plate:B,phone:W})){p(""),t?.setCopyLabel("Copy"),t?.setClipboardId({id:"",isRandom:!1}),r("No data found."),l("No data found.");return}const tt=c(le,W);p(tt),t?.setCopyLabel("Copy"),u({plate:B,phone:W,fallbackId:e.fallbackId}),r("ready to copy"),i=oe(le.fields.url||"")||d(),o=Date.now(),await v({clipboard:tt,phone:W,listingRecord:le,processedAt:o,fallbackId:e.fallbackId});let me=b(le,{plate:B,phone:W,plateImageIndex:J},"Ready to copy");B&&!W&&H.reason==="timeout"?me+=`
Phone reveal timed out.`:B&&!W&&H.reason==="no-button"&&(me+=`
No phone button on this listing.`),!z&&q===0&&!W&&H.reason==="no-button"&&(me+=`
No listing images found.`),l(me)}catch(x){if(s.aborted){l("Cancelled.");return}const R=x instanceof Error?x.message:"Unknown recognition error";l(`Failed: ${R}`)}finally{n=null,y(!1)}}function I(){n?.abort()}async function w(){let s=e.lastClipboard;if(e.listingRecord&&(s=c(e.listingRecord,e.lastPhone),e={...e,lastClipboard:s},t?.setCopyEnabled(!!s)),!s){l("Nothing to copy yet.");return}const x=await Qn(s);x.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),t?.flashCopySuccess(),await v({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(x.ok?"Data copied":"Clipboard copy failed.")}async function A(){if(!e.listingRecord){l("No listing to copy yet. Run Clip listing.");return}const s=c(e.listingRecord,e.lastPhone),x=await S(s);x.ok&&(r("data copied"),t?.setCopyLabel("Copy again"),await v({clipboard:s,phone:e.lastPhone,listingRecord:e.listingRecord,processedAt:o||Date.now(),fallbackId:e.fallbackId})),l(x.ok?"Data copied":"Clipboard copy failed.")}async function k(){const s=e.listingRecord?.fields?.plate||e.lastPlate||"";if(!s){l("No plate to copy.");return}const x=await S(s);l(x.ok?`Plate copied: ${s}`:"Clipboard copy failed.")}function _(s,x){if(s==="phone"){e={...e,lastPhone:x==null?"":String(x)},u();return}if(!e.listingRecord)return;const R=Ea(e.listingRecord,s,x);e={...e,listingRecord:R,lastPlate:s==="plate"?x:e.lastPlate,plateConfidence:s==="plate"?null:e.plateConfidence},s==="plate"&&u()}async function N(){try{await Ki(),Xi(),l("Model cache cleared.")}catch(s){const x=s instanceof Error?s.message:"Failed to clear cache";l(x)}}function D(){e={...e,diagnosticsVisible:!e.diagnosticsVisible},f(),l(e.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}async function U(){if(e.busy)return;const s=await ra();e={...e,view:"settings"},t?.showSettingsForm(s),l(`Settings. Environment: production. Storage: ${Oe}* / ${Bt}.`)}function V(){e={...e,view:e.listingRecord?"form":"idle"},e.listingRecord?(t?.showListingForm(e.listingRecord,{phone:e.lastPhone,plateImageIndex:e.plateImageIndex,plateImageUrl:e.plateImageUrl,plateConfidence:e.plateConfidence}),l("Back to listing review.")):(t?.hideForm(),l("Settings closed."))}async function G(s){await po(s),l("Defaults saved.")}function j(s=document.body){return t||(t=Da({onClipListing:L,onCancel:I,onCopyAgain:w,onClearModelCache:N,onToggleDiagnostics:D,onSettings:U,onFieldChange:_,onCopyFullText:A,onCopyPlateOnly:k,onSettingsBack:V,onSaveDefaults:G}),t.mount(s),t.setMinimized(!0),E(),t)}function F(){h(),n?.abort(),n=null,So(),t?.destroy(),t=null,i="",o=0,e=Ut()}function O(){return e}return{mount:j,destroy:F,onClipListing:L,onCancel:I,onCopyAgain:w,onCopyFullText:A,onCopyPlateOnly:k,onFieldChange:_,onClearModelCache:N,onToggleDiagnostics:D,onSettings:U,onSettingsBack:V,onSaveDefaults:G,getState:O,setStatus:l}}function la(){const e=typeof location<"u"?location.hostname:"",t=typeof location<"u"&&location.pathname||"";return e==="crm.flexicar.pt"?Ao(t):{kind:"offCrm",leadId:null,label:"Fora do CRM",backend:"none"}}function Ao(e){const t=e.match(/^\/main\/lead-tasacion\/(\d+)\/?$/);return t?{kind:"leadDetail",leadId:t[1],label:`CRM · Lead ${t[1]}`,backend:"flexicar"}:/^\/main\/lead-tasacion\/?$/.test(e)?{kind:"leadNew",leadId:null,label:"CRM · Novo lead",backend:"flexicar"}:e.includes("listaleads")||e.includes("lista")?{kind:"leadList",leadId:null,label:"CRM · Lista",backend:"flexicar"}:{kind:"otherCrm",leadId:null,label:"CRM",backend:"flexicar"}}const fe="/api";async function pe(e,t={}){const n=await fetch(e,{credentials:"same-origin",...t,headers:{Accept:"application/json",...t.body?{"Content-Type":"application/json"}:{},...t.headers||{}}}),a=await n.text();let i=null;try{i=a?JSON.parse(a):null}catch{i=a}return{ok:n.ok,status:n.status,data:i}}async function ko(){return pe(`${fe}/auth/me`)}async function Po(){return pe(`${fe}/get_user_local`)}async function Re(e){const t=new URLSearchParams;return e.phone&&t.set("phone",e.phone),e.plate&&t.set("plate",e.plate),pe(`${fe}/lead-clients?${t.toString()}`)}async function _o(e){return pe(`${fe}/purchase-leads/clients/${e}?page=1`)}async function To(e){return pe(`${fe}/lead-clients`,{method:"POST",body:JSON.stringify(e)})}async function No(e){return pe(`${fe}/create_lead_compra`,{method:"POST",body:JSON.stringify(e)})}async function Je(e,t=null){return pe(`${fe}/filtros`,{method:"POST",body:JSON.stringify({dataCall:{data_query:e,data_call:t}})})}async function Ro(e,t={}){const n=new URLSearchParams({mode:"MANUAL",vehicleType:"passenger",...t}),a=`https://crm-services-pro.flexicar.pt/api/v1/crm-stock-api/${e}?${n}`;try{const i=await fetch(a,{credentials:"include"});if(!i.ok)return[];const o=await i.json();return Array.isArray(o)?o:o?.data||o?.results||[]}catch{return[]}}const ee={estado:{label:"Avaliação mínima",value:5},origen:{label:"Captación Central",value:29},forma_contacto:{label:"Whatsapp",value:5},marca_comercial:{label:"Flexicar",value:3},id_local_actual:147};function sa(e){return String(e||"").replace(/\D/g,"")}function Ce(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function ue(e){const t=sa(e?.phone);if(t)return t;const n=String(e?.id||"").trim(),a=sa(n);return a&&a===n?a:""}function Z(e,t){return[{label:e,value:t}]}function Qe(e,t=""){const n=Array.isArray(e)?e:[],a=t.trim().toLowerCase();if(a){const i=n.find(o=>String(o.label??o.nombre??o.name??"").toLowerCase().includes(a));if(i)return{label:i.label??i.nombre??i.name,value:i.value??i.id}}return n[0]?{label:n[0].label??n[0].nombre??n[0].name,value:n[0].value??n[0].id}:null}function kt(e){const t=String(e||"").replace(/\s+/g," ").trim().split(" ").filter(Boolean);return t.length===0?{name:"Lead",firstSurname:null,secondSurname:null}:t.length===1?{name:t[0],firstSurname:null,secondSurname:null}:{name:t[0],firstSurname:t[1],secondSurname:t.length>2?t.slice(2).join(" "):null}}function Mo(e){const t=ue(e),{name:n,firstSurname:a,secondSurname:i}=kt(e.clientName);return{name:n,firstSurname:a,secondSurname:i,contact:{email:null,primaryPhone:t||null},address:{province:{id:null,name:null},municipality:null}}}function $o(e){const{clip:t,clientId:n,me:a,localId:i,filters:o={},vehicle:r={}}=e,l=ue(t),d=Ce(t.plate),u=a?.id??0,g=Array.isArray(a?.rolesId)?a.rolesId:[6],{name:c,firstSurname:v,secondSurname:E}=kt(t.clientName),h=o.estado||ee.estado,C=o.origen||ee.origen,y=o.contacto||ee.forma_contacto,f=o.marca||ee.marca_comercial,b=Number(String(t.mileageKm||"").replace(/\D/g,""))||0,p=String(t.customerValueEur||"").replace(/[^\d.,]/g,""),S=Number(p.replace(",","."))||null,L=r.makeLabel||t.make||"",I=r.modelLabel||t.model||"",w=Number(t.year)||null,A=r.fuelLabel||da(t.fuel),k=r.transmissionLabel||ua(t.transmission);return{data:{toggle:!1,nombre:c,telefono1:l||null,cliente:n,client_id:n,id_cliente_lead:n,id_existente_lead:null,condiciones:!1,comercial:!1,provincia:null,municipio:null,estado:Z(h.label,h.value),origen:Z(C.label,C.value),forma_contacto:Z(y.label,y.value),marca_comercial:Z(f.label,f.value),email:null,telefono2:null,apellido1:v,apellido2:E,kilometros:b,importado:!1,matricula:d||null,bastidor:null,tasacion_max:null,tasacion_min:null,buscado:S,pactado:null,url_anuncio:t.url||null,platform:t.siteId||null,publishedAt:null,extractedAt:null,comentarios:t.url||t.description||null,combustible:A?Z(A,r.fuelValue??A):null,ccambios:k?Z(k,r.transmissionValue??k):null,itv:null,cita:null,local:null,carroceria:null,captacionAgreed:!1,extras:null,estados:null,precio_preliminar_cd:null,precio_ofrecido_cd:null,precio_preliminar_gdv:null,precio_ofrecido_gdv:null,estimatedFinancedSalesPrice:null,estimatedCashSalesPrice:null},agente:u,id_agente_modify:u,rol:g,vehiculo:{marca_vehiculo:L?Z(L,r.makeValue??L):[],modelo:I?Z(I,r.modelValue??I):[],matriculacion:w?Z(w,w):[],combustible:A?Z(A,r.fuelValue??A):[],ccambios:k?Z(k,r.transmissionValue??k):[],carroceria:[],version:t.model?[{value:t.model,label:t.model,id:""}]:[],jato:!1,id_jato:null,vehicleType:"passenger",modify:!1},extras:"[]",estados:[],precio_nuevo:null,precio_final:null,id_local_actual:i||ee.id_local_actual}}function Me(e,t=""){const n=Array.isArray(e)?e:[],a=String(t||"").trim().toLowerCase();if(!a)return null;const i=d=>String(d?.label??d?.nombre??d?.name??"").trim(),o=d=>d?.value??d?.id,r=n.find(d=>i(d).toLowerCase()===a);if(r)return{label:i(r),value:o(r)};const l=n.find(d=>{const u=i(d).toLowerCase();return u.includes(a)||a.includes(u)});return l?{label:i(l),value:o(l)}:null}function ca(e){return String(e||"").trim().toLowerCase()==="vw"?"Volkswagen":""}async function Do(e,t){const n={};if(!e?.make||typeof t!="function")return n;const a=await t("makes"),i=Me(a,e.make)||Me(a,ca(e.make));if(!i)return n;if(n.makeLabel=i.label,n.makeValue=i.value,e.model){const o=await t("models",{makeId:String(i.value)}),r=Me(o,e.model);if(r){n.modelLabel=r.label,n.modelValue=r.value;const l=String(e.year||"").trim();if(l){const d=da(e.fuel);if(d){const u=await t("fuels",{makeId:String(i.value),modelId:String(r.value),year:l}),g=Me(u,d);if(g){n.fuelLabel=g.label,n.fuelValue=g.value;const c=ua(e.transmission);if(c){const v=await t("transmissions",{makeId:String(i.value),modelId:String(r.value),year:l,fuelId:String(g.value)}),E=Me(v,c);E&&(n.transmissionLabel=E.label,n.transmissionValue=E.value)}}}}}}return n}function da(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":String(e):""}function ua(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":String(e):""}const Oo="LeadDeskDB",Fo=["Audi","BMW","BYD","Citroën","Cupra","Dacia","Fiat","Ford","Honda","Hyundai","Jaguar","Jeep","Kia","Mercedes-Benz","MG","Mini","Mitsubishi","Nissan","Opel","Peugeot","Porsche","Renault","Seat","Skoda","Tesla","Toyota","Volkswagen","Volvo"],Bo=["Gasolina","Diesel","Híbrido","Elétrico","GPL","Outro"],Uo=["Manual","Automática"];function Pt(e,t,n){const a=String(t||"").trim();if(!a)return"";const i=e.find(l=>l===a);if(i)return i;const o=a.toLowerCase(),r=e.find(l=>l.toLowerCase()===o);if(r)return r;if(n){const l=n(a);if(l&&e.includes(l))return l}return a}function Vo(e){const t=String(e||"").toLowerCase();return t?t.includes("diesel")||t.includes("gasóleo")||t.includes("gasoleo")?"Diesel":t.includes("híbrid")||t.includes("hybrid")?"Híbrido":t.includes("elétr")||t.includes("electr")?"Elétrico":t.includes("gpl")||t.includes("lpg")?"GPL":t.includes("gasol")?"Gasolina":"":""}function zo(e){const t=String(e||"").toLowerCase();return t?t.includes("auto")?"Automática":t.includes("manual")?"Manual":"":""}function Ho(e){return String(e||"").toUpperCase().replace(/[\s\-.]/g,"")}function _t(){return new Promise((e,t)=>{const n=indexedDB.open(Oo);n.onerror=()=>t(n.error||new Error("IndexedDB open failed")),n.onsuccess=()=>e(n.result)})}async function Go(e){const t=await _t();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("plate").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}async function qo(e){const t=await _t();return new Promise((n,a)=>{const r=t.transaction("leads","readonly").objectStore("leads").index("phone").getAll(e);r.onsuccess=()=>{const l=r.result||[];l.sort((d,u)=>String(u.updatedAt).localeCompare(String(d.updatedAt))),n(l)},r.onerror=()=>a(r.error)})}function fa(e){return`${e}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`}async function jo(e){const t=await _t(),n=new Date().toISOString(),a=ue(e),i=Ho(e.plate),o=fa("client"),r=fa("lead"),{name:l,firstSurname:d,secondSurname:u}=kt(e.clientName),g=d||"",c=u||"",v={id:o,firstName:l,firstSurname:g,secondSurname:c,phone:a,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,phoneNormalized:a,createdAt:n,updatedAt:n},E={id:r,clientId:o,plate:i,plateNormalized:i,phone:a,phoneNormalized:a,fullName:l,firstSurname:g,secondSurname:c,otherContact:"",email:"",province:"",municipality:"",acceptTerms:!1,acceptMarketing:!1,leadStatus:"Novo",leadOrigin:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",contactMethod:"Whatsapp",branch:"Lisboa",commercialBrand:"LeadDesk",portal:e.siteId==="standvirtual-pt"?"Standvirtual":"OLX",adId:"",publicationDate:"",extractionDate:"",adDescription:e.description||e.url||"",make:Pt(Fo,e.make||"",ca),model:e.model||"",year:e.year||"",fuel:Pt(Bo,e.fuel||"",Vo),transmission:Pt(Uo,e.transmission||"",zo),bodyType:"",version:"",mileageKm:e.mileageKm||"0",chassis:"",imported:!1,itvDate:"",engine:e.engine||"",powerCv:e.powerCv||"",customerValueEur:e.customerValueEur||"",comments:e.url||"",createdAt:n,updatedAt:n};return await new Promise((h,C)=>{const y=t.transaction(["clients","leads"],"readwrite");y.objectStore("clients").put(v),y.objectStore("leads").put(E),y.oncomplete=()=>h(void 0),y.onerror=()=>C(y.error)}),r}function pa(e,t={}){const n=t.open||((...l)=>window.open(...l)),a=t.assign||(l=>location.assign(l)),i=t.origin||location.origin,o=new URL(e,i).href,r=n(o,"_blank");if(r){try{r.opener=null}catch{}return"new-tab"}return a(e),"same-tab"}function ma(e={}){const t=e.open||((...o)=>window.open(...o)),n=e.assign||(o=>location.assign(o)),a=e.origin||location.origin,i=t("about:blank","_blank");if(i)try{i.opener=null}catch{}return{go(o){const r=new URL(o,a).href;return i&&!i.closed?(i.location.href=r,"new-tab"):(n(o),"same-tab")},cancel(){try{i?.close()}catch{}}}}function ga(e,t,n,a=()=>location.reload()){if(e==="new-tab"){n?.setStatus?.(`Lead ${t} criado. Aberto em nova aba. A atualizar a lista…`,"ok"),a();return}n?.setStatus?.(`Lead ${t} criado. Pop-up bloqueado — abrindo nesta aba…`,"warn")}const Ko=`
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
`,Wo="Alt+V",Xo="Alt+B",Yo="Alt+A",Zo="⌥V",Jo="⌥B",Qo="⌥A";function er(){return/Mac|iPhone|iPad|iPod/i.test(navigator.platform||"")||/Mac OS/i.test(navigator.userAgent||"")}function tr(e){const t=document.createElement("div");t.id="lead-crm-filler-root";const n=t.attachShadow({mode:"open"}),a=document.createElement("style");a.textContent=Ko;const i=er(),o=i?Zo:Wo,r=i?Jo:Xo,l=i?Qo:Yo,d=document.createElement("div");d.className="lcf-panel";const u=document.createElement("div");u.className="lcf-header";const g=document.createElement("div");g.className="lcf-title",g.textContent="CRM · Leads";const c=document.createElement("span");c.className="lcf-badge",c.textContent="CRM";const v=document.createElement("button");v.type="button",v.className="lcf-mini",v.setAttribute("aria-label","Minimizar painel"),v.title="Minimizar",v.textContent="–",u.append(g,c,v);const E=document.createElement("div");E.className="lcf-body";const h=document.createElement("div");h.className="lcf-hint",h.textContent=`Cole o texto do Clipper (com LEAD_CLIP_V1) ou use Ler área de transferência (${o}). Com dados válidos, a verificação do cadastro corre automaticamente. Abrir 1.º lead: ${l}. Criar lead: ${r}.`;const C=document.createElement("textarea");C.className="lcf-textarea",C.placeholder="Cole aqui o texto do Clipper…";const y=document.createElement("div");y.className="lcf-summary",y.hidden=!0;const f=document.createElement("div");f.className="lcf-section-label",f.textContent="Leads encontrados",f.hidden=!0;const b=document.createElement("ul");b.className="lcf-matches";const p=document.createElement("div");p.className="lcf-actions";const S=document.createElement("button");S.type="button",S.className="lcf-btn lcf-btn-primary",S.title=`Atalho: ${o}`;const L=document.createElement("span");L.textContent="Ler área de transferência";const I=document.createElement("span");I.className="lcf-kbd",I.textContent=o,S.append(L,I);const w=document.createElement("button");w.type="button",w.className="lcf-btn lcf-btn-success",w.title=`Atalho: ${r}`,w.disabled=!0,w.hidden=!0;const A=document.createElement("span");A.textContent="Criar lead";const k=document.createElement("span");k.className="lcf-kbd",k.textContent=r,w.append(A,k),p.append(S,w);const _=document.createElement("div");_.className="lcf-status",_.dataset.tone="",_.textContent="Aguardando dados do anúncio.",E.append(h,C,y,f,b,p,_),d.append(u,E),n.append(a,d),document.documentElement.append(t);let N=!1,D=null;function U(){d.classList.toggle("lcf-panel--minimized",N),E.hidden=N,v.textContent=N?"+":"–",v.setAttribute("aria-label",N?"Expandir painel":"Minimizar painel"),v.title=N?"Expandir":"Minimizar"}function V(s){N=!!s,U()}v.addEventListener("click",()=>{V(!N)}),U();let G=!1,j=0,F=0;u.addEventListener("pointerdown",s=>{if(s.target===v)return;G=!0;const x=d.getBoundingClientRect();j=s.clientX-x.left,F=s.clientY-x.top,u.setPointerCapture(s.pointerId)}),u.addEventListener("pointermove",s=>{G&&(d.style.left=`${s.clientX-j}px`,d.style.top=`${s.clientY-F}px`,d.style.right="auto",d.style.bottom="auto")}),u.addEventListener("pointerup",()=>{G=!1}),S.addEventListener("click",()=>e.onReadClipboard()),C.addEventListener("paste",()=>{setTimeout(()=>e.onParseText(C.value),0)}),w.addEventListener("click",()=>e.onCreate());function O(s){if(!(!s.altKey||s.ctrlKey||s.metaKey||s.shiftKey)){if(s.code==="KeyV"){s.preventDefault(),N&&V(!1),S.disabled||e.onReadClipboard();return}if(s.code==="KeyB"){if(w.hidden||w.disabled)return;s.preventDefault(),e.onCreate();return}if(s.code==="KeyA"){if(!D)return;s.preventDefault(),D()}}}return window.addEventListener("keydown",O),{setBadge(s){c.textContent=s},setStatus(s,x=""){_.textContent=s,_.dataset.tone=x||""},setText(s){C.value=s},getText(){return C.value},setSummary(s){if(!s){y.hidden=!0,y.textContent="";return}y.hidden=!1,y.innerHTML=s},setCreateVisible(s,x=!0){w.hidden=!s,w.disabled=!x},setMinimized:V,isMinimized(){return N},setMatches(s,x){b.replaceChildren(),f.hidden=s.length===0,D=s.length>0?()=>x(s[0].id):null,s.forEach((R,M)=>{const T=document.createElement("li"),q=document.createElement("div");q.className="lcf-match";const z=document.createElement("div");z.className="lcf-match-title",z.textContent=R.title;const re=document.createElement("div");re.className="lcf-match-sub",re.textContent=R.subtitle;const H=document.createElement("button");H.type="button",H.className="lcf-match-open",H.textContent=M===0?`Abrir lead → (${l})`:"Abrir lead →",M===0&&(H.title=`Atalho: ${l}`),H.addEventListener("click",()=>x(R.id)),q.append(z,re,H),T.append(q),b.append(T)})},clearMatches(){b.replaceChildren(),f.hidden=!0,D=null},destroy(){window.removeEventListener("keydown",O),t.remove()}}}function ba(e,t){return e==="new-tab"?[`Lead ${t} aberto em nova aba.`,"ok"]:[`Lead ${t}: pop-up bloqueado — abrindo nesta aba…`,"warn"]}function nr(){let e=null,t=null,n=!1,a=null,i=null;function o(){const f=la();return t?.setBadge(f.label),f.kind==="leadDetail"&&i!=="leadDetail"&&t?.setMinimized(!0),i=f.kind,f}function r(f){const b=no(f);if(t?.clearMatches(),t?.setCreateVisible(!1),!b.ok)return e=null,t?.setSummary(null),t?.setStatus(`Falha ao analisar o texto: ${b.error}`,"error"),!1;e=b.payload,t?.setText(f);const p=ue(e);return t?.setSummary([`<div><strong>ID</strong> ${$e(e.id)}</div>`,`<div><strong>Placa</strong> ${$e(e.plate||"—")}</div>`,`<div><strong>Telefone</strong> ${$e(p||"—")}</div>`,`<div><strong>Veículo</strong> ${$e([e.make,e.model,e.year].filter(Boolean).join(" · ")||"—")}</div>`,`<div><strong>URL</strong> ${$e(e.url||"—")}</div>`].join("")),o(),t?.setStatus("LEAD_CLIP_V1 encontrado. Verificando cadastro…","ok"),!0}async function l(){try{const f=await navigator.clipboard.readText();t?.setText(f),r(f)&&await u()}catch(f){const b=f instanceof Error?f.message:"área de transferência indisponível";t?.setStatus(`Não foi possível ler a área de transferência (${b}). Cole o texto do Clipper no campo acima.`,"warn")}}async function d(f){r(f)&&await u()}async function u(){if(!e||n)return;if(o().backend==="leaddesk"){await g();return}await c()}async function g(){n=!0,t?.setStatus("Verificando no LeadDesk…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const f=Ce(e.plate),b=ue(e);let p=[];if(f&&(p=await Go(f)),p.length===0&&b&&(p=await qo(b)),!f&&!b){t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(p.length===0){t?.setStatus("Nenhum cadastro no LeadDesk. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const S=p.map(L=>({id:L.id,title:`Lead ${L.plate||L.id}`,subtitle:`${L.phone||"—"} · ${[L.make,L.model,L.year].filter(Boolean).join(" · ")||"—"} · ${L.leadStatus||""} · ${L.updatedAt||""}`.trim()}));t?.setMatches(S,L=>{const I=pa(`/crm/leads/${L}`),[w,A]=ba(I,L);t?.setStatus(w,A)}),t?.setStatus(S.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":`${S.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`,"ok"),t?.setCreateVisible(!0,!0)}catch(f){const b=f instanceof Error?f.message:"erro";t?.setStatus(`Erro na verificação LeadDesk: ${b}`,"error")}finally{n=!1}}async function c(){n=!0,t?.setStatus("Verificando no CRM…"),t?.clearMatches(),t?.setCreateVisible(!1);try{const f=Ce(e.plate),b=ue(e);let p;if(f)p=await Re({plate:f}),p.ok&&Array.isArray(p.data)&&p.data.length===0&&b&&(p=await Re({phone:b}));else if(b)p=await Re({phone:b});else{t?.setStatus("Os dados não têm placa nem telefone.","warn");return}if(!p.ok){t?.setStatus(`Falha na verificação (HTTP ${p.status}). Está autenticado no CRM?`,"error");return}const S=Array.isArray(p.data)?p.data:[];if(S.length===0){t?.setStatus("Nenhum cadastro para esta placa/telefone. É possível criar o lead.","warn"),t?.setCreateVisible(!0,!0);return}const L=[];for(const w of S){const A=w?.purchaseLead?.id;if(A)L.push({id:A,title:`Lead #${A}`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""} · ${w.purchaseLead?.statusName||""}`.trim()});else if(w?.id){const _=(await _o(w.id)).data?.results||[];for(const N of _)L.push({id:N.id,title:`Lead #${N.id}`,subtitle:`Placa ${N.plate||"—"} · ${N.status?.name||""} · ${N.lastAction||""}`.trim()});_.length===0&&L.push({id:`client:${w.id}`,title:`Cliente #${w.id} (sem lead de compra)`,subtitle:`${w.name||""} ${w.firstSurname||""} · ${w.contact?.primaryPhone||""}`.trim()})}}const I=L.filter(w=>String(w.id).match(/^\d+$/));t?.setMatches(I.length?I:L,w=>{if(String(w).startsWith("client:")){t?.setStatus("Cliente sem lead de compra. É possível criar um novo lead.","warn"),t?.setCreateVisible(!0,!0);return}const A=pa(`/main/lead-tasacion/${w}`),[k,_]=ba(A,w);t?.setStatus(k,_)}),t?.setStatus(I.length===1?"1 lead encontrado. Use Abrir lead (Alt+A) ou crie outro.":I.length>1?`${I.length} leads encontrados. Use Abrir lead (Alt+A) no 1.º ou crie outro.`:"Cliente encontrado sem lead válido para abrir. É possível criar um lead.",I.length?"ok":"warn"),t?.setCreateVisible(!0,!0)}catch(f){const b=f instanceof Error?f.message:"erro";t?.setStatus(`Erro na verificação: ${b}`,"error")}finally{n=!1}}async function v(){if(!e||n)return;if(o().backend==="leaddesk"){await E();return}await h()}async function E(){if(!ue(e)&&!Ce(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}const b=ma();n=!0,t?.setStatus("Criando no LeadDesk…");try{const p=await jo(e),S=b.go(`/crm/leads/${p}`);ga(S,p,t)}catch(p){b.cancel();const S=p instanceof Error?p.message:"erro";t?.setStatus(`Erro ao criar no LeadDesk: ${S}`,"error")}finally{n=!1}}async function h(){const f=ue(e);if(!f&&!Ce(e.plate)){t?.setStatus("É necessário telefone ou placa para criar.","warn");return}if(!confirm("Criar cliente/lead no CRM com os dados copiados?"))return;const b=ma();n=!0,t?.setStatus("Criando no CRM…");try{const p=await ko();if(!p.ok||!p.data?.id){b.cancel(),t?.setStatus(`Falha de autenticação (HTTP ${p.status}). Faça login no CRM.`,"error");return}const S=p.data,L=await Po(),I=Array.isArray(L.data)&&L.data[0]?.value||ee.id_local_actual,[w,A,k,_]=await Promise.all([Je("estado_lead_compra"),Je("origen_lead_compra"),Je("contacto"),Je("marcas_comerciales",S.id)]),N={estado:Qe(w.data,"Avaliação")||ee.estado,origen:Qe(A.data,"Captación")||ee.origen,contacto:Qe(k.data,"Whatsapp")||ee.forma_contacto,marca:Qe(_.data,"")||ee.marca_comercial};let D=null;if(f){const O=await Re({phone:f});O.ok&&Array.isArray(O.data)&&O.data[0]?.id&&(D=O.data[0].id)}if(!D){const O=await To(Mo(e));if(O.status===409)D=(await Re({phone:f||void 0,plate:Ce(e.plate)||void 0})).data?.[0]?.id;else if(O.ok&&O.data?.resourceId)D=O.data.resourceId;else{b.cancel(),t?.setStatus(`Falha ao criar cliente (HTTP ${O.status}): ${JSON.stringify(O.data)}`,"error");return}}if(!D){b.cancel(),t?.setStatus("Não foi possível obter clientId.","error");return}const U=await Do(e,Ro),V=$o({clip:e,clientId:D,me:S,localId:I,filters:N,vehicle:U}),G=await No(V);if(!G.ok){b.cancel(),t?.setStatus(`Falha create_lead_compra (HTTP ${G.status}): ${JSON.stringify(G.data)}`,"error");return}const j=G.data?.id_lead;if(!j){b.cancel(),t?.setStatus(`Resposta inesperada: ${JSON.stringify(G.data)}`,"error");return}const F=b.go(`/main/lead-tasacion/${j}`);ga(F,j,t)}catch(p){b.cancel();const S=p instanceof Error?p.message:"erro";t?.setStatus(`Erro ao criar: ${S}`,"error")}finally{n=!1}}function C(){if(t)return t;t=tr({onReadClipboard:l,onParseText:d,onCreate:v}),o(),window.addEventListener("popstate",o),a=new MutationObserver(()=>o());const f=document.getElementById("app")||document.body;return f&&a.observe(f,{childList:!0,subtree:!0}),l(),t}function y(){window.removeEventListener("popstate",o),a?.disconnect(),a=null,t?.destroy(),t=null,e=null,i=null}return{mount:C,destroy:y,refreshContext:o}}function $e(e){return String(e||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const Tt="__LEAD_CRM_FILLER_INITIALIZED__",ar="lead-crm-filler-root";function ir(){return typeof window>"u"||typeof document>"u"?{started:!1,reason:"no-dom"}:la().backend!=="none"?or():rr()}function or(){if(window[Tt])return{started:!1,reason:"already-initialized"};if(document.getElementById(ar))return window[Tt]=!0,{started:!1,reason:"panel-exists"};window[Tt]=!0;const e=nr(),t=()=>{e.mount()};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0,reason:"crm"}}function rr(){if(window[it])return{started:!1,reason:"already-initialized"};if(document.getElementById(Fe))return window[it]=!0,{started:!1,reason:"panel-exists"};window[it]=!0;const e=Io(),t=()=>{e.mount(document.body)};return document.body?t():document.addEventListener("DOMContentLoaded",t,{once:!0}),{started:!0}}ir()})();
