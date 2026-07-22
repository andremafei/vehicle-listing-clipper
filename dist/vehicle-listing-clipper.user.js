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
(function(){"use strict";const F="Vehicle Listing Clipper",at="vlc_prod_",U="vehicle-listing-clipper",L="__VLC_PROD_INITIALIZED__",S="vlc-panel-root";function st(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",diagnosticsVisible:!1,lastDiagnostics:null}}const it=`
:host, .vlc-root {
  all: initial;
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
}

.vlc-panel {
  position: fixed;
  z-index: 2147483646;
  right: 16px;
  bottom: 16px;
  width: 280px;
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
`;function ct(t){let e=null,n=null,o=null,a=null,r=null,s=null;function i(l=document.body){if(document.getElementById(S))return e=document.getElementById(S),e;e=document.createElement("div"),e.id=S,e.setAttribute("data-vlc-panel","1");const m=e.attachShadow({mode:"open"}),p=document.createElement("style");p.textContent=it;const y=document.createElement("div");y.className="vlc-panel",y.setAttribute("role","region"),y.setAttribute("aria-label",F);const x=document.createElement("div");x.className="vlc-header";const b=document.createElement("h1");b.className="vlc-title",b.textContent=F,x.appendChild(b);const w=document.createElement("div");w.className="vlc-actions",a=c("Read plate",()=>t.onReadPlate()),r=c("Cancel",()=>t.onCancel()),r.disabled=!0,s=c("Copy again",()=>t.onCopyAgain()),s.disabled=!0;const I=c("Clear model cache",()=>t.onClearModelCache()),E=c("Diagnostics",()=>t.onToggleDiagnostics()),D=c("Settings",()=>t.onSettings());return w.append(a,r,s,I,E,D),n=document.createElement("div"),n.className="vlc-status",n.setAttribute("aria-live","polite"),o=document.createElement("div"),o.className="vlc-diag",o.hidden=!0,y.append(x,w,n,o),m.append(p,y),l.appendChild(e),e}function c(l,m){const p=document.createElement("button");return p.type="button",p.className="vlc-btn",p.textContent=l,p.addEventListener("click",m),p}function d(l){n&&(n.textContent=l)}function f(l){a&&(a.disabled=!!l),r&&(r.disabled=!l)}function u(l){s&&(s.disabled=!l)}function g(l,m=""){o&&(o.hidden=!l,o.textContent=m)}function h(){e?.remove(),e=null,n=null,o=null,a=null,r=null,s=null}return{mount:i,setStatus:d,setBusy:f,setCopyEnabled:u,setDiagnostics:g,destroy:h}}const q="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",W='#mainContent img[data-testid="swiper-image-lazy"]',j="#mainContent div.swiper-wrapper img",V=[q,W,j];function lt(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],a=n[1];let r=null;return a&&/^\d+w$/i.test(a)&&(r=Number.parseInt(a,10)),{url:o,width:r}}).filter(e=>!!e.url)}function dt(t){const e=lt(t);if(e.length===0)return null;const n=e.filter(a=>typeof a.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let a=1;a<n.length;a+=1)n[a].width>o.width&&(o=n[a]);return o.url}function ut(t){if(!t)return null;const e=dt(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function ft(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function X(t=document){for(const e of V){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function R(t=document){const{images:e,selectorUsed:n}=X(t),o=[],a=new Set;for(const r of e){const s=ut(r);if(!s)continue;const i=ft(s);a.has(i)||(a.add(i),o.push(i))}return{urls:o,count:o.length,selectorUsed:n}}async function pt(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let a=R(e);if(a.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return a;const s=Date.now()+n;for(;a.count===0&&Date.now()<s;)await new Promise(i=>setTimeout(i,o)),a=R(e);return a}const z={siteId:"olx-pt",discoverListingImages:R,discoverListingImagesWithWait:pt,queryGalleryImages:X,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:q,FALLBACK_TESTID_SELECTOR:W,FALLBACK_SWIPER_IMG_SELECTOR:j,GALLERY_SELECTORS:V}},Y=new Map;function gt(t){Y.set(t.siteId,t)}function mt(t){return Y.get(t)}function ht(){return mt("olx-pt")||z}gt(z);function bt(){return typeof GM<"u"&&GM!=null}async function wt(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(bt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function Z(t){const{method:e,url:n,responseType:o="arraybuffer",headers:a,signal:r}=t;return new Promise((s,i)=>{if(r?.aborted){i(new DOMException("Aborted","AbortError"));return}let c=null;const d=()=>{try{c?.abort?.()}catch{}i(new DOMException("Aborted","AbortError"))};r?.addEventListener("abort",d,{once:!0}),(u=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){c=GM.xmlHttpRequest(u);return}if(typeof GM_xmlhttpRequest=="function"){c=GM_xmlhttpRequest(u);return}i(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:a,onload(u){r?.removeEventListener("abort",d);const g=u.status;if(g<200||g>=300){i(new Error(`HTTP ${g} for ${n}`));return}s(u.response)},onerror(){r?.removeEventListener("abort",d),i(new Error(`Network error for ${n}`))},ontimeout(){r?.removeEventListener("abort",d),i(new Error(`Timeout for ${n}`))}})})}async function yt(t,e={}){const{onProgress:n,signal:o,request:a=Z}=e,r=[],s=t.length;for(let i=0;i<s;i+=1){if(o?.aborted)throw new DOMException("Aborted","AbortError");const c=t[i];n?.({index:i+1,total:s,url:c});const d=await a({method:"GET",url:c,responseType:"arraybuffer",signal:o});if(!(d instanceof ArrayBuffer||Object.prototype.toString.call(d)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${c}`);r.push({url:c,bytes:d})}return r}async function xt(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const a of n)try{const r=new Blob([t],{type:a});return await createImageBitmap(r)}catch(r){o=r}try{const a=new Blob([t]);return await createImageBitmap(a)}catch(a){throw o||a}}function vt(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const o=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:o,width:e.width,height:e.height}}function Et(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),o=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),a=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),r=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),s=Math.max(1,a-n),i=Math.max(1,r-o),c=document.createElement("canvas");c.width=t.width,c.height=t.height;const d=c.getContext("2d");return d.putImageData(t,0,0),d.getImageData(n,o,s,i)}function Ct(t,e,n){const o=document.createElement("canvas");o.width=t.width,o.height=t.height,o.getContext("2d").putImageData(t,0,0);const a=document.createElement("canvas");a.width=n,a.height=e;const r=a.getContext("2d");r.drawImage(o,0,0,n,e);const{data:s}=r.getImageData(0,0,n,e),i=new Uint8Array(1*e*n*3);let c=0;for(let d=0;d<e*n;d+=1)i[c++]=s[d*4],i[c++]=s[d*4+1],i[c++]=s[d*4+2];return i}function It(t,e,n=[114,114,114]){const{width:o,height:a}=t,r=Math.min(e/a,e/o),s=Math.round(o*r),i=Math.round(a*r),c=(e-s)/2,d=(e-i)/2,f=Math.round(d-.1),u=Math.round(c-.1),g=document.createElement("canvas");g.width=o,g.height=a,g.getContext("2d").putImageData(t,0,0);const l=document.createElement("canvas");l.width=e,l.height=e;const m=l.getContext("2d");m.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,m.fillRect(0,0,e,e),m.drawImage(g,0,0,o,a,u,f,s,i);const p=m.getImageData(0,0,e,e).data,y=new Float32Array(3*e*e),x=e*e;for(let b=0;b<x;b+=1){const w=p[b*4],I=p[b*4+1],E=p[b*4+2];y[b]=w/255,y[x+b]=I/255,y[2*x+b]=E/255}return{tensor:y,ratio:r,pad:{dw:c,dh:d},size:e}}function At(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Mt="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",_t="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Dt="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",St="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function K(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Mt},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:_t,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Dt},ortWasmBaseUrl:St}}const T={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let J=null;function Tt(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function O(){const t=Tt();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Q=new Proxy({},{get(t,e){return O()[e]}});function $t(){const t=O(),e=K();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function tt(t,e={}){$t();const n=O(),o=e.prefer||["webgpu","wasm"],a=[];for(const r of o)try{const s=await n.InferenceSession.create(t,{executionProviders:[r]});return J=r,{session:s,provider:r}}catch(s){a.push(`${r}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${a.join(" | ")}`)}function B(){return J}const N=384,Pt="images",Lt="output0";async function Rt(t,e,n={}){const o=n.confThresh??.4,{tensor:a,ratio:r,pad:s}=It(e,N),i=new Q.Tensor("float32",a,[1,3,N,N]),c=await t.run({[Pt]:i}),d=c[Lt]||Object.values(c)[0];if(!d)return[];const f=d.data,u=d.dims||[],g=u.length>=2?u[u.length-1]:7,h=Math.floor(f.length/g),l=[];for(let m=0;m<h;m+=1){const p=m*g,y=f[p+1],x=f[p+2],b=f[p+3],w=f[p+4],I=f[p+5],E=f[p+6];if(E<o)continue;const D=At({x1:y,y1:x,x2:b,y2:w},r,s);l.push({...D,score:Number(E),classId:Number(I)})}return l.sort((m,p)=>p.score-m.score),l}function Ot(t,e,n=T){const o=n.alphabet,a=n.maxPlateSlots,r=o.length,s=t,i=[],c=[];for(let f=0;f<a;f+=1){let u=0,g=-1/0;for(let h=0;h<r;h+=1){const l=Number(s[f*r+h]);l>g&&(g=l,u=h)}i.push(o[u]),c.push(g)}let d=i.join("");return n.padChar&&(d=d.replace(new RegExp(`${Bt(n.padChar)}+$`),"")),{text:d,charProbs:c.slice(0,Math.max(d.length,1))}}function Bt(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Nt(t,e){const{imgHeight:n,imgWidth:o}=T,a=Ct(e,n,o),r=new Q.Tensor("uint8",a,[1,n,o,3]),s=await t.run({input:r}),i=s.plate||Object.values(s)[0],c=i.dims||[1,T.maxPlateSlots,T.alphabet.length],d=c[c.length-1],u=c[c.length-2]*d,g=i.data,h=g.length>=u?g.slice(0,u):g;return Ot(h)}const A="[A-Z]",M="[0-9]",Ht=[{id:"LLDDDD",re:new RegExp(`^${A}{2}${M}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${M}{4}${A}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${M}{2}${A}{2}${M}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${A}{2}${M}{2}${A}{2}$`)}],Gt={0:"O",1:"I",5:"S",8:"B"},kt={O:"0",I:"1",L:"1",S:"5",B:"8"};function $(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function C(t){const e=$(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function Ft(t){const e=$(t);if(e.length!==6)return null;for(const n of Ht)if(n.re.test(e))return n.id;return null}function H(t,e){const n=$(t).slice(0,6).split("");if(n.length!==6)return[];const o=[];function a(r,s,i){if(s>e)return;if(r===6){const u=i.join(""),g=Ft(u);g&&o.push({plate:u,corrections:s,patternId:g});return}if(a(r+1,s,i),s>=e)return;const c=i[r],d=Gt[c];if(d){const u=i.slice();u[r]=d,a(r+1,s+1,u)}const f=kt[c];if(f){const u=i.slice();u[r]=f,a(r+1,s+1,u)}}return a(0,0,n),o.sort((r,s)=>r.corrections-s.corrections||s.plate.localeCompare(r.plate)),o}function et(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let o=0;for(let a=0;a<n;a+=1)o+=t[a]??0;return o/n}function Ut(t,e=[],n={}){const o=n.minConfidenceNoCorrection??.55,a=n.minConfidenceOneCorrection??.72,r=$(t);if(r.length<6)return{accepted:!1,plate:r,plateFormatted:C(r),patternId:null,corrections:0,meanConfidence:et(e,r.length),reason:"too-short"};const s=r.slice(0,6),i=et(e,6),c=H(s,0);if(c.length>0&&i>=o){const u=c[0];return{accepted:!0,plate:u.plate,plateFormatted:C(u.plate),patternId:u.patternId,corrections:0,meanConfidence:i}}const d=H(s,1).filter(u=>u.corrections===1);if(d.length>0&&i>=a){const u=d[0];return{accepted:!0,plate:u.plate,plateFormatted:C(u.plate),patternId:u.patternId,corrections:1,meanConfidence:i}}return H(s,2).some(u=>u.corrections>1)&&c.length===0&&d.length===0?{accepted:!1,plate:s,plateFormatted:C(s),patternId:null,corrections:2,meanConfidence:i,reason:"excessive-corrections"}:c.length>0||d.length>0?{accepted:!1,plate:s,plateFormatted:C(s),patternId:null,corrections:c.length?0:1,meanConfidence:i,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:C(s),patternId:null,corrections:0,meanConfidence:i,reason:"no-reliable-pattern"}}const v="models",qt=1;let P=null;function G(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):P||(P=new Promise((t,e)=>{const n=indexedDB.open(U,qt);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(v)||o.createObjectStore(v,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),P)}async function nt(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function Wt(t){const e=await G();return new Promise((n,o)=>{const r=e.transaction(v,"readonly").objectStore(v).get(t);r.onsuccess=()=>{const s=r.result;n(s?.bytes||null)},r.onerror=()=>o(r.error)})}async function jt(t,e,n){const o=await G();return new Promise((a,r)=>{const s=o.transaction(v,"readwrite");s.objectStore(v).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>a(),s.onerror=()=>r(s.error)})}async function Vt(){const t=await G();return new Promise((e,n)=>{const o=t.transaction(v,"readwrite");o.objectStore(v).clear(),o.oncomplete=()=>e(),o.onerror=()=>n(o.error)})}async function ot(t,e={}){const{onStatus:n,signal:o}=e,a=await Wt(t.id).catch(()=>null);if(a&&await nt(a)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:a,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const r=await Z({method:"GET",url:t.url,responseType:"arraybuffer",signal:o}),s=r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"?r:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const i=await nt(s);if(i!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${i}`);return await jt(t.id,s,i).catch(()=>{}),{bytes:s,cacheHit:!1}}let _=null;async function Xt(t={}){if(_)return{sessions:_,diagnostics:{provider:B(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=K(),n=await ot(e.detector,t),o=await ot(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const a=await tt(n.bytes),r=await tt(o.bytes);return _={detector:a.session,ocr:r.session},{sessions:_,diagnostics:{provider:a.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function zt(){_=null}async function Yt(t,e={}){const n=Date.now(),{onStatus:o,signal:a}=e,r=await Xt({onStatus:o,signal:a}),{detector:s,ocr:i}=r.sessions;let c=0,d=0;for(let f=0;f<t.length;f+=1){if(a?.aborted)return k("cancelled",r.diagnostics,d,c,n);o?.(`Scanning image ${f+1} of ${t.length}`),d+=1;let u;try{const h=await xt(t[f].bytes);u=vt(h).imageData,h.close?.()}catch{continue}const g=await Rt(s,u);for(const h of g){if(a?.aborted)return k("cancelled",r.diagnostics,d,c,n);c+=1;const l=Et(u,h),m=await Nt(i,l),p=Ut(m.text,m.charProbs);if(p.accepted)return{ok:!0,plate:p.plate,plateFormatted:p.plateFormatted,diagnostics:{provider:B()||r.diagnostics.provider,detectorCacheHit:r.diagnostics.detectorCacheHit,ocrCacheHit:r.diagnostics.ocrCacheHit,imagesScanned:d,detectionsTried:c,elapsedMs:Date.now()-n}}}}return k("no-reliable-plate",r.diagnostics,d,c,n)}function k(t,e,n,o,a){return{ok:!1,reason:t,diagnostics:{provider:B()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-a}}}async function rt(t){return await wt(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Zt(){let t=st(),e=null,n=null;function o(l){t={...t,statusMessage:l},e?.setStatus(l)}function a(l){t={...t,busy:l,view:l?"reading":"idle"},e?.setBusy(l)}function r(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const l=t.lastDiagnostics;if(!l){e?.setDiagnostics(!0,"No diagnostics yet. Run Read plate.");return}e?.setDiagnostics(!0,[`Provider: ${l.provider||"n/a"}`,`Detector cache: ${l.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${l.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${l.imagesScanned??0}`,`Detections tried: ${l.detectionsTried??0}`,`Elapsed: ${l.elapsedMs??0} ms`].join(`
`))}async function s(){if(t.busy)return;n=new AbortController;const{signal:l}=n;a(!0);try{o("Looking for listing images…");const p=await ht().discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:y,count:x}=p;if(x===0){o("No listing images found.");return}o(`Found ${x} listing images`);const b=await yt(y,{signal:l,onProgress({index:E,total:D}){o(`Downloading image ${E} of ${D}`)}});o("Loading plate recognition models…");const w=await Yt(b,{signal:l,onStatus:o});if(t={...t,lastDiagnostics:w.diagnostics},r(),!w.ok){w.reason==="cancelled"?o("Cancelled."):o("No reliable plate found.");return}t={...t,lastPlate:w.plate},e?.setCopyEnabled(!0),(await rt(w.plate)).ok?o(`Plate found: ${w.plate}
Copied to clipboard`):o(`Plate found: ${w.plate}
Clipboard copy failed — use Copy again`)}catch(m){if(l.aborted){o("Cancelled.");return}const p=m instanceof Error?m.message:"Unknown recognition error";o(`Failed: ${p}`)}finally{n=null,a(!1)}}function i(){n?.abort()}async function c(){if(!t.lastPlate){o("No plate to copy yet.");return}const l=await rt(t.lastPlate);o(l.ok?`Copied to clipboard: ${t.lastPlate}`:"Clipboard copy failed.")}async function d(){try{await Vt(),zt(),o("Model cache cleared.")}catch(l){const m=l instanceof Error?l.message:"Failed to clear cache";o(m)}}function f(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},r(),o(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}function u(){if(t.busy)return;t={...t,view:"settings"},o(`Settings (stub). Environment: production. Storage: ${at}* / ${U}. Full settings arrive in later stages.`)}function g(l=document.body){return e||(e=ct({onReadPlate:s,onCancel:i,onCopyAgain:c,onClearModelCache:d,onToggleDiagnostics:f,onSettings:u}),e.mount(l),e)}function h(){return t}return{mount:g,onReadPlate:s,onCancel:i,onCopyAgain:c,onClearModelCache:d,onToggleDiagnostics:f,onSettings:u,getState:h,setStatus:o}}function Kt(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[L])return{started:!1,reason:"already-initialized"};if(document.getElementById(S))return window[L]=!0,{started:!1,reason:"panel-exists"};window[L]=!0;const t=Zt(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}Kt()})();
