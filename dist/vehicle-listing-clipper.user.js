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
(function(){"use strict";const k="Vehicle Listing Clipper",at="vlc_prod_",U="vehicle-listing-clipper",P="__VLC_PROD_INITIALIZED__",D="vlc-panel-root";function st(){return{statusMessage:"",view:"idle",busy:!1,lastPlate:"",diagnosticsVisible:!1,lastDiagnostics:null}}const it=`
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
`;function ct(t){let e=null,n=null,o=null,r=null,a=null,s=null;function i(c=document.body){if(document.getElementById(D))return e=document.getElementById(D),e;e=document.createElement("div"),e.id=D,e.setAttribute("data-vlc-panel","1");const g=e.attachShadow({mode:"open"}),m=document.createElement("style");m.textContent=it;const w=document.createElement("div");w.className="vlc-panel",w.setAttribute("role","region"),w.setAttribute("aria-label",k);const y=document.createElement("div");y.className="vlc-header";const h=document.createElement("h1");h.className="vlc-title",h.textContent=k,y.appendChild(h);const v=document.createElement("div");v.className="vlc-actions",r=d("Read plate",()=>t.onReadPlate()),a=d("Cancel",()=>t.onCancel()),a.disabled=!0,s=d("Copy again",()=>t.onCopyAgain()),s.disabled=!0;const _=d("Clear model cache",()=>t.onClearModelCache()),C=d("Diagnostics",()=>t.onToggleDiagnostics()),F=d("Settings",()=>t.onSettings());return v.append(r,a,s,_,C,F),n=document.createElement("div"),n.className="vlc-status",n.setAttribute("aria-live","polite"),o=document.createElement("div"),o.className="vlc-diag",o.hidden=!0,w.append(y,v,n,o),g.append(m,w),c.appendChild(e),e}function d(c,g){const m=document.createElement("button");return m.type="button",m.className="vlc-btn",m.textContent=c,m.addEventListener("click",g),m}function u(c){n&&(n.textContent=c)}function f(c){r&&(r.disabled=!!c),a&&(a.disabled=!c)}function l(c){s&&(s.disabled=!c)}function p(c,g=""){o&&(o.hidden=!c,o.textContent=g)}function b(){e?.remove(),e=null,n=null,o=null,r=null,a=null,s=null}return{mount:i,setStatus:u,setBusy:f,setCopyEnabled:l,setDiagnostics:p,destroy:b}}const q="#mainContent div.swiper-wrapper > div.swiper-slide div.swiper-zoom-container > img",W='#mainContent img[data-testid="swiper-image-lazy"]',j="#mainContent div.swiper-wrapper img",V=[q,W,j];function lt(t){return!t||typeof t!="string"?[]:t.split(",").map(e=>e.trim()).filter(Boolean).map(e=>{const n=e.split(/\s+/),o=n[0],r=n[1];let a=null;return r&&/^\d+w$/i.test(r)&&(a=Number.parseInt(r,10)),{url:o,width:a}}).filter(e=>!!e.url)}function dt(t){const e=lt(t);if(e.length===0)return null;const n=e.filter(r=>typeof r.width=="number");if(n.length===0)return e[e.length-1].url;let o=n[0];for(let r=1;r<n.length;r+=1)n[r].width>o.width&&(o=n[r]);return o.url}function ut(t){if(!t)return null;const e=dt(t.getAttribute("srcset")||"");return e||(t.currentSrc?t.currentSrc:t.getAttribute("src")||t.src||null)}function ft(t,e){if(!t||/^[a-z][a-z0-9+.-]*:/i.test(t))return t;const n=typeof location<"u"&&location.href?location.href:void 0;if(!n)return t;try{return new URL(t,n).href}catch{return t}}function X(t=document){for(const e of V){const n=t.querySelectorAll(e);if(n.length>0)return{images:[...n],selectorUsed:e}}return{images:[],selectorUsed:null}}function R(t=document){const{images:e,selectorUsed:n}=X(t),o=[],r=new Set;for(const a of e){const s=ut(a);if(!s)continue;const i=ft(s);r.has(i)||(r.add(i),o.push(i))}return{urls:o,count:o.length,selectorUsed:n}}async function pt(t={}){const{root:e=document,timeoutMs:n=2e3,intervalMs:o=100}=t;let r=R(e);if(r.count>0||!!!(e.querySelector("#mainContent .swiper-wrapper")||e.querySelector('#mainContent img[data-testid="swiper-image-lazy"]')))return r;const s=Date.now()+n;for(;r.count===0&&Date.now()<s;)await new Promise(i=>setTimeout(i,o)),r=R(e);return r}const z={siteId:"olx-pt",discoverListingImages:R,discoverListingImagesWithWait:pt,queryGalleryImages:X,selectors:{PRIMARY_OLX_GALLERY_SELECTOR:q,FALLBACK_TESTID_SELECTOR:W,FALLBACK_SWIPER_IMG_SELECTOR:j,GALLERY_SELECTORS:V}},Y=new Map;function gt(t){Y.set(t.siteId,t)}function mt(t){return Y.get(t)}function ht(){return mt("olx-pt")||z}gt(z);async function bt(t,e=""){const n=e?[e]:["image/jpeg","image/png","image/webp","image/svg+xml"];let o=null;for(const r of n)try{const a=new Blob([t],{type:r});return await createImageBitmap(a)}catch(a){o=a}try{const r=new Blob([t]);return await createImageBitmap(r)}catch(r){throw o||r}}function wt(t){const e=document.createElement("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d",{willReadFrequently:!0});if(!n)throw new Error("2D canvas context unavailable");n.drawImage(t,0,0);const o=n.getImageData(0,0,e.width,e.height);return{canvas:e,imageData:o,width:e.width,height:e.height}}function yt(){return typeof GM<"u"&&GM!=null}async function xt(t){if(typeof GM_setClipboard=="function")return GM_setClipboard(t,"text"),!0;if(yt()&&typeof GM.setClipboard=="function")return await GM.setClipboard(t,"text"),!0;if(typeof navigator<"u"&&navigator.clipboard?.writeText)try{return await navigator.clipboard.writeText(t),!0}catch{return!1}return!1}function Z(t){const{method:e,url:n,responseType:o="arraybuffer",headers:r,signal:a}=t;return new Promise((s,i)=>{if(a?.aborted){i(new DOMException("Aborted","AbortError"));return}let d=null;const u=()=>{try{d?.abort?.()}catch{}i(new DOMException("Aborted","AbortError"))};a?.addEventListener("abort",u,{once:!0}),(l=>{if(typeof GM<"u"&&GM&&typeof GM.xmlHttpRequest=="function"){d=GM.xmlHttpRequest(l);return}if(typeof GM_xmlhttpRequest=="function"){d=GM_xmlhttpRequest(l);return}i(new Error("GM.xmlHttpRequest is unavailable. Install via Tampermonkey / Violentmonkey."))})({method:e,url:n,responseType:o,headers:r,onload(l){a?.removeEventListener("abort",u);const p=l.status;if(p<200||p>=300){i(new Error(`HTTP ${p} for ${n}`));return}s(l.response)},onerror(){a?.removeEventListener("abort",u),i(new Error(`Network error for ${n}`))},ontimeout(){a?.removeEventListener("abort",u),i(new Error(`Timeout for ${n}`))}})})}async function vt(t,e={}){const{signal:n,request:o=Z}=e;if(n?.aborted)throw new DOMException("Aborted","AbortError");const r=await o({method:"GET",url:t,responseType:"arraybuffer",signal:n});if(!(r instanceof ArrayBuffer||Object.prototype.toString.call(r)==="[object ArrayBuffer]"))throw new Error(`Expected ArrayBuffer for ${t}`);return{url:t,bytes:r}}function Et(t,e){const n=Math.max(0,Math.floor(Math.min(e.x1,e.x2))),o=Math.max(0,Math.floor(Math.min(e.y1,e.y2))),r=Math.min(t.width,Math.ceil(Math.max(e.x1,e.x2))),a=Math.min(t.height,Math.ceil(Math.max(e.y1,e.y2))),s=Math.max(1,r-n),i=Math.max(1,a-o),d=document.createElement("canvas");d.width=t.width,d.height=t.height;const u=d.getContext("2d");return u.putImageData(t,0,0),u.getImageData(n,o,s,i)}function Ct(t,e,n){const o=document.createElement("canvas");o.width=t.width,o.height=t.height,o.getContext("2d").putImageData(t,0,0);const r=document.createElement("canvas");r.width=n,r.height=e;const a=r.getContext("2d");a.drawImage(o,0,0,n,e);const{data:s}=a.getImageData(0,0,n,e),i=new Uint8Array(1*e*n*3);let d=0;for(let u=0;u<e*n;u+=1)i[d++]=s[u*4],i[d++]=s[u*4+1],i[d++]=s[u*4+2];return i}function It(t,e,n=[114,114,114]){const{width:o,height:r}=t,a=Math.min(e/r,e/o),s=Math.round(o*a),i=Math.round(r*a),d=(e-s)/2,u=(e-i)/2,f=Math.round(u-.1),l=Math.round(d-.1),p=document.createElement("canvas");p.width=o,p.height=r,p.getContext("2d").putImageData(t,0,0);const c=document.createElement("canvas");c.width=e,c.height=e;const g=c.getContext("2d");g.fillStyle=`rgb(${n[0]},${n[1]},${n[2]})`,g.fillRect(0,0,e,e),g.drawImage(p,0,0,o,r,l,f,s,i);const m=g.getImageData(0,0,e,e).data,w=new Float32Array(3*e*e),y=e*e;for(let h=0;h<y;h+=1){const v=m[h*4],_=m[h*4+1],C=m[h*4+2];w[h]=v/255,w[y+h]=_/255,w[2*y+h]=C/255}return{tensor:w,ratio:a,pad:{dw:d,dh:u},size:e}}function At(t,e,n){return{x1:(t.x1-n.dw)/e,y1:(t.y1-n.dh)/e,x2:(t.x2-n.dw)/e,y2:(t.y2-n.dh)/e}}const Mt="888397b96d761c89db40bc9c305838e8652660f5e282c2cadebbe8d2951a77a8",_t="8031afb5fdc6b4d80462c9d542f1284ebd2cfddf5dbacd62609848d7e2855f44",Dt="0335c74a305173bb6f393efed0fde03cadeaa0b649ed8e19f431016d8232d0a6",Tt="https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/";function K(){return{detector:{id:"yolo-v9-t-384-license-plate-end2end",filename:"yolo-v9-t-384-license-plates-end2end.onnx",url:"https://github.com/ankandrew/open-image-models/releases/download/assets/yolo-v9-t-384-license-plates-end2end.onnx",sha256:Mt},ocr:{id:"cct-xs-v2-global-model",filename:"cct_xs_v2_global.onnx",url:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global.onnx",sha256:_t,configFilename:"cct_xs_v2_global_plate_config.yaml",configUrl:"https://github.com/ankandrew/cnn-ocr-lp/releases/download/arg-plates/cct_xs_v2_global_plate_config.yaml",configSha256:Dt},ortWasmBaseUrl:Tt}}const T={maxPlateSlots:10,alphabet:"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_",padChar:"_",imgHeight:64,imgWidth:128,keepAspectRatio:!1,interpolation:"linear",imageColorMode:"rgb"};let J=null;function St(){const t=[];typeof globalThis<"u"&&t.push(globalThis);try{typeof unsafeWindow<"u"&&unsafeWindow&&t.push(unsafeWindow)}catch{}typeof window<"u"&&t.push(window),typeof self<"u"&&t.push(self);for(const e of t)if(e?.ort)return e.ort;try{const e=(0,eval)('typeof ort !== "undefined" ? ort : null');if(e)return typeof globalThis<"u"&&!globalThis.ort&&(globalThis.ort=e),e}catch{}return null}function O(){const t=St();if(t)return t;throw new Error("onnxruntime-web (global ort) is unavailable. Ensure the userscript @require for ort.min.js is installed, then reinstall/update the script in Tampermonkey.")}const Q=new Proxy({},{get(t,e){return O()[e]}});function $t(){const t=O(),e=K();t?.env?.wasm&&(t.env.wasm.wasmPaths=e.ortWasmBaseUrl,t.env.wasm.numThreads=1)}async function tt(t,e={}){$t();const n=O(),o=e.prefer||["webgpu","wasm"],r=[];for(const a of o)try{const s=await n.InferenceSession.create(t,{executionProviders:[a]});return J=a,{session:s,provider:a}}catch(s){r.push(`${a}: ${s instanceof Error?s.message:String(s)}`)}throw new Error(`Failed to create ORT session. Tried: ${r.join(" | ")}`)}function B(){return J}const N=384,Lt="images",Pt="output0";async function Rt(t,e,n={}){const o=n.confThresh??.4,{tensor:r,ratio:a,pad:s}=It(e,N),i=new Q.Tensor("float32",r,[1,3,N,N]),d=await t.run({[Lt]:i}),u=d[Pt]||Object.values(d)[0];if(!u)return[];const f=u.data,l=u.dims||[],p=l.length>=2?l[l.length-1]:7,b=Math.floor(f.length/p),c=[];for(let g=0;g<b;g+=1){const m=g*p,w=f[m+1],y=f[m+2],h=f[m+3],v=f[m+4],_=f[m+5],C=f[m+6];if(C<o)continue;const F=At({x1:w,y1:y,x2:h,y2:v},a,s);c.push({...F,score:Number(C),classId:Number(_)})}return c.sort((g,m)=>m.score-g.score),c}function Ot(t,e,n=T){const o=n.alphabet,r=n.maxPlateSlots,a=o.length,s=t,i=[],d=[];for(let f=0;f<r;f+=1){let l=0,p=-1/0;for(let b=0;b<a;b+=1){const c=Number(s[f*a+b]);c>p&&(p=c,l=b)}i.push(o[l]),d.push(p)}let u=i.join("");return n.padChar&&(u=u.replace(new RegExp(`${Bt(n.padChar)}+$`),"")),{text:u,charProbs:d.slice(0,Math.max(u.length,1))}}function Bt(t){return t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}async function Nt(t,e){const{imgHeight:n,imgWidth:o}=T,r=Ct(e,n,o),a=new Q.Tensor("uint8",r,[1,n,o,3]),s=await t.run({input:a}),i=s.plate||Object.values(s)[0],d=i.dims||[1,T.maxPlateSlots,T.alphabet.length],u=d[d.length-1],l=d[d.length-2]*u,p=i.data,b=p.length>=l?p.slice(0,l):p;return Ot(b)}const I="[A-Z]",A="[0-9]",Ht=[{id:"LLDDDD",re:new RegExp(`^${I}{2}${A}{4}$`)},{id:"DDDDLL",re:new RegExp(`^${A}{4}${I}{2}$`)},{id:"DDLLDD",re:new RegExp(`^${A}{2}${I}{2}${A}{2}$`)},{id:"LLDDLL",re:new RegExp(`^${I}{2}${A}{2}${I}{2}$`)}],Gt={0:"O",1:"I",5:"S",8:"B"},Ft={O:"0",I:"1",L:"1",S:"5",B:"8"};function S(t){return String(t||"").toUpperCase().replace(/[^A-Z0-9]/g,"")}function E(t){const e=S(t);return e.length!==6?e:`${e.slice(0,2)}-${e.slice(2,4)}-${e.slice(4,6)}`}function kt(t){const e=S(t);if(e.length!==6)return null;for(const n of Ht)if(n.re.test(e))return n.id;return null}function H(t,e){const n=S(t).slice(0,6).split("");if(n.length!==6)return[];const o=[];function r(a,s,i){if(s>e)return;if(a===6){const l=i.join(""),p=kt(l);p&&o.push({plate:l,corrections:s,patternId:p});return}if(r(a+1,s,i),s>=e)return;const d=i[a],u=Gt[d];if(u){const l=i.slice();l[a]=u,r(a+1,s+1,l)}const f=Ft[d];if(f){const l=i.slice();l[a]=f,r(a+1,s+1,l)}}return r(0,0,n),o.sort((a,s)=>a.corrections-s.corrections||s.plate.localeCompare(a.plate)),o}function et(t,e){if(!t?.length)return 1;const n=Math.min(e,t.length);if(n===0)return 0;let o=0;for(let r=0;r<n;r+=1)o+=t[r]??0;return o/n}function Ut(t,e=[],n={}){const o=n.minConfidenceNoCorrection??.55,r=n.minConfidenceOneCorrection??.72,a=S(t);if(a.length<6)return{accepted:!1,plate:a,plateFormatted:E(a),patternId:null,corrections:0,meanConfidence:et(e,a.length),reason:"too-short"};const s=a.slice(0,6),i=et(e,6),d=H(s,0);if(d.length>0&&i>=o){const l=d[0];return{accepted:!0,plate:l.plate,plateFormatted:E(l.plate),patternId:l.patternId,corrections:0,meanConfidence:i}}const u=H(s,1).filter(l=>l.corrections===1);if(u.length>0&&i>=r){const l=u[0];return{accepted:!0,plate:l.plate,plateFormatted:E(l.plate),patternId:l.patternId,corrections:1,meanConfidence:i}}return H(s,2).some(l=>l.corrections>1)&&d.length===0&&u.length===0?{accepted:!1,plate:s,plateFormatted:E(s),patternId:null,corrections:2,meanConfidence:i,reason:"excessive-corrections"}:d.length>0||u.length>0?{accepted:!1,plate:s,plateFormatted:E(s),patternId:null,corrections:d.length?0:1,meanConfidence:i,reason:"low-confidence"}:{accepted:!1,plate:s,plateFormatted:E(s),patternId:null,corrections:0,meanConfidence:i,reason:"no-reliable-pattern"}}const x="models",qt=1;let $=null;function G(){return typeof indexedDB>"u"?Promise.reject(new Error("IndexedDB is unavailable")):$||($=new Promise((t,e)=>{const n=indexedDB.open(U,qt);n.onupgradeneeded=()=>{const o=n.result;o.objectStoreNames.contains(x)||o.createObjectStore(x,{keyPath:"id"})},n.onsuccess=()=>t(n.result),n.onerror=()=>e(n.error||new Error("IndexedDB open failed"))}),$)}async function nt(t){const e=await crypto.subtle.digest("SHA-256",t);return[...new Uint8Array(e)].map(n=>n.toString(16).padStart(2,"0")).join("")}async function Wt(t){const e=await G();return new Promise((n,o)=>{const a=e.transaction(x,"readonly").objectStore(x).get(t);a.onsuccess=()=>{const s=a.result;n(s?.bytes||null)},a.onerror=()=>o(a.error)})}async function jt(t,e,n){const o=await G();return new Promise((r,a)=>{const s=o.transaction(x,"readwrite");s.objectStore(x).put({id:t,bytes:e,sha256:n,storedAt:Date.now()}),s.oncomplete=()=>r(),s.onerror=()=>a(s.error)})}async function Vt(){const t=await G();return new Promise((e,n)=>{const o=t.transaction(x,"readwrite");o.objectStore(x).clear(),o.oncomplete=()=>e(),o.onerror=()=>n(o.error)})}async function ot(t,e={}){const{onStatus:n,signal:o}=e,r=await Wt(t.id).catch(()=>null);if(r&&await nt(r)===t.sha256)return n?.(`Model cache hit: ${t.id}`),{bytes:r,cacheHit:!0};n?.(`Downloading model: ${t.id}`);const a=await Z({method:"GET",url:t.url,responseType:"arraybuffer",signal:o}),s=a instanceof ArrayBuffer||Object.prototype.toString.call(a)==="[object ArrayBuffer]"?a:null;if(!s)throw new Error(`Model download did not return ArrayBuffer: ${t.id}`);const i=await nt(s);if(i!==t.sha256)throw new Error(`SHA-256 mismatch for ${t.id}: expected ${t.sha256}, got ${i}`);return await jt(t.id,s,i).catch(()=>{}),{bytes:s,cacheHit:!1}}let M=null;async function Xt(t={}){if(M)return{sessions:M,diagnostics:{provider:B(),detectorCacheHit:!0,ocrCacheHit:!0}};const e=K(),n=await ot(e.detector,t),o=await ot(e.ocr,t);t.onStatus?.("Initializing ONNX Runtime…");const r=await tt(n.bytes),a=await tt(o.bytes);return M={detector:r.session,ocr:a.session},{sessions:M,diagnostics:{provider:r.provider,detectorCacheHit:n.cacheHit,ocrCacheHit:o.cacheHit}}}function zt(){M=null}async function Yt(t,e,n={}){const{signal:o}=n;let r=0,a;try{const i=await bt(e);a=wt(i).imageData,i.close?.()}catch{return null}const s=await Rt(t.detector,a);for(const i of s){if(o?.aborted)throw new DOMException("Aborted","AbortError");r+=1;const d=Et(a,i),u=await Nt(t.ocr,d),f=Ut(u.text,u.charProbs);if(f.accepted)return{plate:f.plate,plateFormatted:f.plateFormatted,detectionsTried:r}}return{plate:"",plateFormatted:"",detectionsTried:r}}async function Zt(t,e={}){const n=Date.now(),{onStatus:o,signal:r,request:a}=e,s=t.length,i=await Xt({onStatus:o,signal:r}),{detector:d,ocr:u}=i.sessions;let f=0,l=0;for(let p=0;p<s;p+=1){if(r?.aborted)return L("cancelled",i.diagnostics,l,f,n);const b=t[p];o?.(`Downloading image ${p+1} of ${s}`);let c;try{c=await vt(b,{signal:r,request:a})}catch(m){if(r?.aborted||m?.name==="AbortError")return L("cancelled",i.diagnostics,l,f,n);o?.(`Failed to download image ${p+1} of ${s}, skipping…`);continue}o?.(`Scanning image ${p+1} of ${s}`),l+=1;let g;try{g=await Yt({detector:d,ocr:u},c.bytes,{signal:r})}catch(m){if(r?.aborted||m?.name==="AbortError")return L("cancelled",i.diagnostics,l,f,n);continue}finally{c=null}if(g&&(f+=g.detectionsTried,g.plate))return{ok:!0,plate:g.plate,plateFormatted:g.plateFormatted,diagnostics:{provider:B()||i.diagnostics.provider,detectorCacheHit:i.diagnostics.detectorCacheHit,ocrCacheHit:i.diagnostics.ocrCacheHit,imagesScanned:l,detectionsTried:f,elapsedMs:Date.now()-n}}}return L("no-reliable-plate",i.diagnostics,l,f,n)}function L(t,e,n,o,r){return{ok:!1,reason:t,diagnostics:{provider:B()||e.provider,detectorCacheHit:e.detectorCacheHit,ocrCacheHit:e.ocrCacheHit,imagesScanned:n,detectionsTried:o,elapsedMs:Date.now()-r}}}async function rt(t){return await xt(t)?typeof GM_setClipboard=="function"?{ok:!0,method:"gm"}:typeof GM<"u"&&GM?.setClipboard?{ok:!0,method:"gm"}:{ok:!0,method:"navigator"}:{ok:!1,method:"none"}}function Kt(){let t=st(),e=null,n=null;function o(c){t={...t,statusMessage:c},e?.setStatus(c)}function r(c){t={...t,busy:c,view:c?"reading":"idle"},e?.setBusy(c)}function a(){if(!t.diagnosticsVisible){e?.setDiagnostics(!1);return}const c=t.lastDiagnostics;if(!c){e?.setDiagnostics(!0,"No diagnostics yet. Run Read plate.");return}e?.setDiagnostics(!0,[`Provider: ${c.provider||"n/a"}`,`Detector cache: ${c.detectorCacheHit?"hit":"miss"}`,`OCR cache: ${c.ocrCacheHit?"hit":"miss"}`,`Images scanned: ${c.imagesScanned??0}`,`Detections tried: ${c.detectionsTried??0}`,`Elapsed: ${c.elapsedMs??0} ms`].join(`
`))}async function s(){if(t.busy)return;n=new AbortController;const{signal:c}=n;r(!0);try{o("Looking for listing images…");const m=await ht().discoverListingImagesWithWait({root:document,timeoutMs:2e3,intervalMs:100}),{urls:w,count:y}=m;if(y===0){o("No listing images found.");return}o(`Found ${y} listing images`),o("Loading plate recognition models…");const h=await Zt(w,{signal:c,onStatus:o});if(t={...t,lastDiagnostics:h.diagnostics},a(),!h.ok){h.reason==="cancelled"?o("Cancelled."):o("No reliable plate found.");return}t={...t,lastPlate:h.plate},e?.setCopyEnabled(!0),(await rt(h.plate)).ok?o(`Plate found: ${h.plate}
Copied to clipboard`):o(`Plate found: ${h.plate}
Clipboard copy failed — use Copy again`)}catch(g){if(c.aborted){o("Cancelled.");return}const m=g instanceof Error?g.message:"Unknown recognition error";o(`Failed: ${m}`)}finally{n=null,r(!1)}}function i(){n?.abort()}async function d(){if(!t.lastPlate){o("No plate to copy yet.");return}const c=await rt(t.lastPlate);o(c.ok?`Copied to clipboard: ${t.lastPlate}`:"Clipboard copy failed.")}async function u(){try{await Vt(),zt(),o("Model cache cleared.")}catch(c){const g=c instanceof Error?c.message:"Failed to clear cache";o(g)}}function f(){t={...t,diagnosticsVisible:!t.diagnosticsVisible},a(),o(t.diagnosticsVisible?"Diagnostics enabled.":"Diagnostics disabled.")}function l(){if(t.busy)return;t={...t,view:"settings"},o(`Settings (stub). Environment: production. Storage: ${at}* / ${U}. Full settings arrive in later stages.`)}function p(c=document.body){return e||(e=ct({onReadPlate:s,onCancel:i,onCopyAgain:d,onClearModelCache:u,onToggleDiagnostics:f,onSettings:l}),e.mount(c),e)}function b(){return t}return{mount:p,onReadPlate:s,onCancel:i,onCopyAgain:d,onClearModelCache:u,onToggleDiagnostics:f,onSettings:l,getState:b,setStatus:o}}function Jt(){if(typeof window>"u"||typeof document>"u")return{started:!1,reason:"no-dom"};if(window[P])return{started:!1,reason:"already-initialized"};if(document.getElementById(D))return window[P]=!0,{started:!1,reason:"panel-exists"};window[P]=!0;const t=Kt(),e=()=>{t.mount(document.body)};return document.body?e():document.addEventListener("DOMContentLoaded",e,{once:!0}),{started:!0}}Jt()})();
