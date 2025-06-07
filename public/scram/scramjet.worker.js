(()=>{var e={8810:function(e,t,r){r.d(t,{Sp:()=>s,h3:()=>n,t8:()=>o}),"$scramjet"in self||(self.$scramjet={version:{build:"3cc9242",version:"1.0.2-dev"},codec:{},flagEnabled:s});let n=self.$scramjet,i=Function;function o(){n.codec.encode=i(`return ${n.config.codec.encode}`)(),n.codec.decode=i(`return ${n.config.codec.decode}`)()}function s(e,t){let r=n.config.flags[e];for(let r in n.config.siteFlags){let i=n.config.siteFlags[r];if(new RegExp(r).test(t.href)&&e in i)return i[e]}return r}},4471:function(e,t,r){r.d(t,{$O:()=>m,Ag:()=>d,KF:()=>o,Sd:()=>c,U5:()=>u,V6:()=>b,r4:()=>h});var n=r(8810);let{util:{BareClient:i,ScramjetHeaders:o,BareMuxConnection:s},url:{rewriteUrl:a,unrewriteUrl:c,rewriteBlob:l,unrewriteBlob:d},rewrite:{rewriteCss:u,unrewriteCss:f,rewriteHtml:h,unrewriteHtml:g,rewriteSrcset:w,rewriteJs:p,rewriteHeaders:b,rewriteWorkers:m,htmlRules:_},CookieStore:y}=n.h3.shared;n.h3.config},4079:function(e,t,r){r.d(t,{L:()=>s});var n=r(8810),i=r(522);Error.stackTraceLimit=50;let o=new TextDecoder;function s(e,t,r,a=!1){return function(e,t,r,s=!1){if((0,n.Sp)("naiiveRewriter",r.origin)){var a;return{js:("string"!=typeof(a="string"==typeof e?e:new TextDecoder().decode(e))&&(a=new TextDecoder().decode(a)),`
		with (${n.h3.config.globals.wrapfn}(globalThis)) {

			${a}

		}
	`),tag:"",map:null}}return function(e,t,r,s){let a,c=(0,i.p)(),l=performance.now();try{a="string"==typeof e?c.rewrite_js(e,r.base.href,t||"(unknown)",s):c.rewrite_js_bytes(e,r.base.href,t||"(unknown)",s)}catch(r){return console.warn("failed rewriting js for",t,r.message,e),{js:e,tag:"",map:null}}let d=performance.now(),{js:u,map:f,scramtag:h,errors:g}=a,w=d-l;if((0,n.Sp)("sourcemaps",r.base)&&!globalThis.clients&&(globalThis[globalThis.$scramjet.config.globals.pushsourcemapfn](Array.from(f),h),f=null),(0,n.Sp)("rewriterLogs",r.base))for(let e of g)console.error("oxc parse error",e);(0,n.Sp)("rewriterLogs",r.base)&&console.log(`oxc rewrite for "${t||"(unknown)"}" was ${w<1?"BLAZINGLY FAST":w<500?"decent speed":"really slow"} (${w}ms)`);return{js:"string"==typeof e?o.decode(u):u,tag:h,map:f}}(e,t,r,s)}(e,t,r,a)}},522:function(e,t,r){r.d(t,{V:()=>o,p:()=>c});var n=r(7418),i=r(8810);async function o(){let e=await fetch(i.h3.config.files.wasm).then(e=>e.arrayBuffer());self.REAL_WASM=new Uint8Array(e)}self.WASM&&(self.REAL_WASM=Uint8Array.from(atob(self.WASM),e=>e.charCodeAt(0)));let s=new TextDecoder,a="\0asm".split("").map(e=>e.charCodeAt(0));function c(){if(!(self.REAL_WASM&&self.REAL_WASM instanceof Uint8Array))throw Error("rewriter wasm not found (was it fetched correctly?)");if(![...self.REAL_WASM.slice(0,4)].every((e,t)=>e===a[t]))throw Error("rewriter wasm does not have wasm magic (was it fetched correctly?)\nrewriter wasm contents: "+s.decode(self.REAL_WASM));return(0,n.rb)({module:new WebAssembly.Module(self.REAL_WASM)}),i.h3.shared.rewriter||(i.h3.shared.rewriter=new n.mZ(i.h3)),i.h3.shared.rewriter}},4155:function(e,t,r){r.d(t,{O:()=>i});var n=r(8810);function i(e,t){let r={"content-type":"text/html"};return crossOriginIsolated&&(r["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(function(e,t){let r=`
                errorTrace.value = ${JSON.stringify(e)};
                fetchedURL.textContent = ${JSON.stringify(t)};
                for (const node of document.querySelectorAll("#hostname")) node.textContent = ${JSON.stringify(location.hostname)};
                reload.addEventListener("click", () => location.reload());
                version.textContent = ${JSON.stringify(n.h3.version.version)};
                build.textContent = ${JSON.stringify(n.h3.version.build)};
                
                document.getElementById('copy-button').addEventListener('click', async () => {
                    const text = document.getElementById('errorTrace').value;
                    await navigator.clipboard.writeText(text);
                    const btn = document.getElementById('copy-button');
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
        `;return`<!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8" />
                    <title>Scramjet</title>
                    <style>
                    :root {
                        --deep: #080602;
                        --shallow: #181412;
                        --beach: #f1e8e1;
                        --shore: #b1a8a1;
                        --accent: #ffa938;
                        --font-sans: -apple-system, system-ui, BlinkMacSystemFont, sans-serif;
                        --font-monospace: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    }

                    *:not(div,p,span,ul,li,i,span) {
                        background-color: var(--deep);
                        color: var(--beach);
                        font-family: var(--font-sans);
                    }

                    textarea,
                    button {
                        background-color: var(--shallow);
                        border-radius: 0.6em;
                        padding: 0.6em;
                        border: none;
                        appearance: none;
                        font-family: var(--font-sans);
                        color: var(--beach);
                    }

                    button.primary {
                        background-color: var(--accent);
                        color: var(--deep);
                        font-weight: bold;
                    }

                    textarea {
                        resize: none;
                        height: 20em;
                        text-align: left;
                        font-family: var(--font-monospace);
                    }

                    body {
                        width: 100vw;
                        height: 100vh;
                        justify-content: center;
                        align-items: center;
                    }

                    body,
                    html,
                    #inner {
                        display: flex;
                        align-items: center;
                        flex-direction: column;
                        gap: 0.5em;
                        overflow: hidden;
                    }

                    #inner {
                        z-index: 100;
                    }

                    #cover {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        background-color: color-mix(in srgb, var(--deep) 70%, transparent);
                        z-index: 99;
                    }

                    #info {
                        display: flex;
                        flex-direction: row;
                        align-items: flex-start;
                        gap: 1em;
                    }

                    #version-wrapper {
                        width: auto;
                        text-align: right;
                        position: absolute;
                        top: 0.5rem;
                        right: 0.5rem;
                        font-size: 0.8rem;
                        color: var(--shore)!important;
                        i {
                            background-color: color-mix(in srgb, var(--deep), transparent 50%);
                            border-radius: 9999px;
                            padding: 0.2em 0.5em;
                        }
                        z-index: 101;
                    }

                    #errorTrace-wrapper {
                        position: relative;
                        width: fit-content;
                    }

                    #copy-button {
                        position: absolute;
                        top: 0.5em;
                        right: 0.5em;
                        padding: 0.23em;
                        cursor: pointer;
                        opacity: 0;
                        transition: opacity 0.4s;
                        font-size: 0.9em;
                    }

                    #errorTrace-wrapper:hover #copy-button {
                        opacity: 1;
                    }
                    </style>
                </head>
                <body>
                    <div id="cover"></div>
                    <div id="inner">
                        <h1 id="errorTitle">Uh oh!</h1>
                        <p>There was an error loading <b id="fetchedURL"></b></p>
                        <!-- <p id="errorMessage">Internal Server Error</p> -->

                        <div id="info">
                            <div id="errorTrace-wrapper">
                                <textarea id="errorTrace" cols="40" rows="10" readonly></textarea>
                                <button id="copy-button" class="primary">Copy</button>
                            </div>
                            <div id="troubleshooting">
                                <p>Try:</p>
                                <ul>
                                    <li>Checking your internet connection</li>
                                    <li>Verifying you entered the correct address</li>
                                    <li>Clearing the site data</li>
                                    <li>Contacting <b id="hostname"></b>'s administrator</li>
                                    <li>Verify the server isn't censored</li>
                                </ul>
                                <p>If you're the administrator of <b id="hostname"></b>, try:</p>
                                    <ul>
                                    <li>Restarting your server</li>
                                    <li>Updating Scramjet</li>
                                    <li>Troubleshooting the error on the <a href="https://github.com/MercuryWorkshop/scramjet" target="_blank">GitHub repository</a></li>
                                </ul>
                            </div>
                        </div>
                        <br>
                        <button id="reload" class="primary">Reload</button>
                    </div>
                    <p id="version-wrapper"><i>Scramjet v<span id="version"></span> (build <span id="build"></span>)</i></p>
                    <script src="${"data:application/javascript,"+encodeURIComponent(r)}"></script>
                </body>
            </html>
        `}(String(e),t),{status:500,headers:r})}},9022:function(e,t,r){r.d(t,{Y:()=>n});class n{handle;origin;syncToken;promises;messageChannel;connected;constructor(e,t){this.handle=e,this.origin=t,this.syncToken=0,this.promises={},this.messageChannel=new MessageChannel,this.connected=!1,this.messageChannel.port1.addEventListener("message",e=>{"scramjet$type"in e.data&&("init"===e.data.scramjet$type?this.connected=!0:this.handleMessage(e.data))}),this.messageChannel.port1.start(),this.handle.postMessage({scramjet$type:"init",scramjet$port:this.messageChannel.port2},[this.messageChannel.port2])}handleMessage(e){let t=this.promises[e.scramjet$token];t&&(t(e),delete this.promises[e.scramjet$token])}async fetch(e){let t=this.syncToken++,r={scramjet$type:"fetch",scramjet$token:t,scramjet$request:{url:e.url,body:e.body,headers:Array.from(e.headers.entries()),method:e.method,mode:e.mode,destinitation:e.destination}},n=e.body?[e.body]:[];this.handle.postMessage(r,n);let{scramjet$response:i}=await new Promise(e=>{this.promises[t]=e});return!!i&&new Response(i.body,{headers:i.headers,status:i.status,statusText:i.statusText})}}},8931:function(e,t,r){r.d(t,{pd:()=>c});var n=r(4155),i=r(4471),o=r(8810),s=r(4079);function a(e){return{origin:e,base:e}}async function c(e,t){try{let r=new URL(e.url),n="";if(r.searchParams.has("type")&&(n=r.searchParams.get("type"),r.searchParams.delete("type")),r.searchParams.has("dest")&&r.searchParams.delete("dest"),r.pathname===this.config.files.wasm)return fetch(this.config.files.wasm).then(async e=>{let t=await e.arrayBuffer(),r=btoa(new Uint8Array(t).reduce((e,t)=>(e.push(String.fromCharCode(t)),e),[]).join("")),n="";return n+=`if ('document' in self && document.currentScript) { document.currentScript.remove(); }
self.WASM = '${r}';`,new Response(n,{headers:{"content-type":"text/javascript"}})});if(r.pathname.startsWith(this.config.prefix+"blob:")||r.pathname.startsWith(this.config.prefix+"data:")){let o,s=r.pathname.substring(this.config.prefix.length);s.startsWith("blob:")&&(s=(0,i.Ag)(s));let c=await fetch(s,{});c.finalURL=s.startsWith("blob:")?s:"(data url)",c.body&&(o=await d(c,t?{base:new URL(new URL(t.url).origin),origin:new URL(new URL(t.url).origin)}:a(new URL((0,i.Sd)(e.referrer))),e.destination,n,this.cookieStore));let l=Object.fromEntries(c.headers.entries());return crossOriginIsolated&&(l["Cross-Origin-Opener-Policy"]="same-origin",l["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(o,{status:c.status,statusText:c.statusText,headers:l})}let s=new URL((0,i.Sd)(r)),c=this.serviceWorkers.find(e=>e.origin===s.origin);if(c&&c.connected&&"swruntime"!==r.searchParams.get("from")){let t=await c.fetch(e);if(t)return t}if(s.origin==new URL(e.url).origin)throw Error("attempted to fetch from same origin - this means the site has obtained a reference to the real origin, aborting");let u=new i.KF;for(let[t,r]of e.headers.entries())u.set(t,r);if(t&&new URL(t.url).pathname.startsWith(o.h3.config.prefix)){let e=new URL((0,i.Sd)(t.url));e.toString().includes("youtube.com")||(u.set("Referer",e.toString()),u.set("Origin",e.origin?`${e.protocol}//${e.host}`:"null"))}let h=this.cookieStore.getCookies(s,!1);h.length&&u.set("Cookie",h),u.set("Sec-Fetch-Dest",e.destination),u.set("Sec-Fetch-Site","same-origin"),u.set("Sec-Fetch-Mode","cors"===e.mode?e.mode:"same-origin");let g=new f(s,u.headers,e.body,e.method,e.destination,t);this.dispatchEvent(g);let w=g.response||await this.client.fetch(g.url,{method:g.method,body:g.body,headers:g.requestHeaders,credentials:"omit",mode:"cors"===e.mode?e.mode:"same-origin",cache:e.cache,redirect:"manual",duplex:"half"});return await l(s,n,e.destination,w,this.cookieStore,t,this)}catch(o){let t={message:o.message,url:e.url,destination:e.destination,timestamp:new Date().toISOString()};if(o.stack&&(t.stack=o.stack),console.error("ERROR FROM SERVICE WORKER FETCH: ",t),!["document","iframe"].includes(e.destination))return new Response(void 0,{status:500});let r=Object.entries(t).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("\n\n");return(0,n.O)(r,(0,i.Sd)(e.url))}}async function l(e,t,r,n,o,s,c){let l,f=(0,i.V6)(n.rawHeaders,a(e)),h=f["set-cookie"]||[];for(let t in h)if(s){let n=c.dispatch(s,{scramjet$type:"cookie",cookie:t,url:e.href});"document"!==r&&"iframe"!==r&&await n}for(let t in await o.setCookies(h instanceof Array?h:[h],e),f)Array.isArray(f[t])&&(f[t]=f[t][0]);if(n.body&&(l=await d(n,a(e),r,t,o)),["document","iframe"].includes(r)){let e=f["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(e)){let t=/^\s*?attachment/i.test(e)?"attachment":"inline",[r]=new URL(n.finalURL).pathname.split("/").slice(-1);f["content-disposition"]=`${t}; filename=${JSON.stringify(r)}`}}"text/event-stream"===f.accept&&(f["content-type"]="text/event-stream"),delete f["permissions-policy"],crossOriginIsolated&&["document","iframe","worker","sharedworker","style","script"].includes(r)&&(f["Cross-Origin-Embedder-Policy"]="require-corp",f["Cross-Origin-Opener-Policy"]="same-origin");let g=new u(l,f,n.status,n.statusText,r,e,n,s);return c.dispatchEvent(g),new Response(g.responseBody,{headers:g.responseHeaders,status:g.status,statusText:g.statusText})}async function d(e,t,r,n,a){switch(r){case"iframe":case"document":if(e.headers.get("content-type")?.startsWith("text/html"))return(0,i.r4)(await e.text(),a,t,!0);return e.body;case"script":{let{js:r,tag:i,map:a}=(0,s.L)(new Uint8Array(await e.arrayBuffer()),e.finalURL,t,"module"===n);if((0,o.Sp)("sourcemaps",t.base)&&a){r instanceof Uint8Array&&(r=new TextDecoder().decode(r));let e=`${globalThis.$scramjet.config.globals.pushsourcemapfn}([${a.join(",")}], "${i}");`,t=/^\s*(['"])use strict\1;?/;r=t.test(r)?r.replace(t,`$&
${e}`):`${e}
${r}`}return r}case"style":return(0,i.U5)(await e.text(),t);case"sharedworker":case"worker":return(0,i.$O)(new Uint8Array(await e.arrayBuffer()),n,e.finalURL,t);default:return e.body}}class u extends Event{responseBody;responseHeaders;status;statusText;destination;url;rawResponse;client;constructor(e,t,r,n,i,o,s,a){super("handleResponse"),this.responseBody=e,this.responseHeaders=t,this.status=r,this.statusText=n,this.destination=i,this.url=o,this.rawResponse=s,this.client=a}}class f extends Event{url;requestHeaders;body;method;destination;client;constructor(e,t,r,n,i,o){super("request"),this.url=e,this.requestHeaders=t,this.body=r,this.method=n,this.destination=i,this.client=o}response}},3093:function(e,t,r){r.d(t,{t:()=>n});function n(){return"10000000000".replace(/[018]/g,e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16))}},7418:function(e,t,r){let n;r.d(t,{mZ:()=>m,rb:()=>x});var i=r(3093);function o(e,t){try{return e.apply(this,t)}catch(t){let e=function(e){let t=n.__externref_table_alloc();return n.__wbindgen_export_2.set(t,e),t}(t);n.__wbindgen_exn_store(e)}}let s="undefined"!=typeof TextDecoder?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};"undefined"!=typeof TextDecoder&&s.decode();let a=null;function c(){return(null===a||0===a.byteLength)&&(a=new Uint8Array(n.memory.buffer)),a}function l(e,t){return e>>>=0,s.decode(c().subarray(e,e+t))}let d=0,u="undefined"!=typeof TextEncoder?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},f="function"==typeof u.encodeInto?function(e,t){return u.encodeInto(e,t)}:function(e,t){let r=u.encode(e);return t.set(r),{read:e.length,written:r.length}};function h(e,t,r){if(void 0===r){let r=u.encode(e),n=t(r.length,1)>>>0;return c().subarray(n,n+r.length).set(r),d=r.length,n}let n=e.length,i=t(n,1)>>>0,o=c(),s=0;for(;s<n;s++){let t=e.charCodeAt(s);if(t>127)break;o[i+s]=t}if(s!==n){0!==s&&(e=e.slice(s)),i=r(i,n,n=s+3*e.length,1)>>>0;let t=f(e,c().subarray(i+s,i+n));s+=t.written,i=r(i,n,s,1)>>>0}return d=s,i}let g=null;function w(){return(null===g||!0===g.buffer.detached||void 0===g.buffer.detached&&g.buffer!==n.memory.buffer)&&(g=new DataView(n.memory.buffer)),g}function p(e){let t=n.__wbindgen_export_2.get(e);return n.__externref_table_dealloc(e),t}let b="undefined"==typeof FinalizationRegistry?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(e=>n.__wbg_rewriter_free(e>>>0,1));class m{__destroy_into_raw(){let e=this.__wbg_ptr;return this.__wbg_ptr=0,b.unregister(this),e}free(){let e=this.__destroy_into_raw();n.__wbg_rewriter_free(e,0)}constructor(e){let t=n.rewriter_new(e);if(t[2])throw p(t[1]);return this.__wbg_ptr=t[0]>>>0,b.register(this,this.__wbg_ptr,this),this}rewrite_js(e,t,r,i){let o=h(e,n.__wbindgen_malloc,n.__wbindgen_realloc),s=d,a=h(t,n.__wbindgen_malloc,n.__wbindgen_realloc),c=d,l=h(r,n.__wbindgen_malloc,n.__wbindgen_realloc),u=d,f=n.rewriter_rewrite_js(this.__wbg_ptr,o,s,a,c,l,u,i);if(f[2])throw p(f[1]);return p(f[0])}rewrite_js_bytes(e,t,r,i){let o=function(e,t){let r=t(+e.length,1)>>>0;return c().set(e,r/1),d=e.length,r}(e,n.__wbindgen_malloc),s=d,a=h(t,n.__wbindgen_malloc,n.__wbindgen_realloc),l=d,u=h(r,n.__wbindgen_malloc,n.__wbindgen_realloc),f=d,g=n.rewriter_rewrite_js_bytes(this.__wbg_ptr,o,s,a,l,u,f,i);if(g[2])throw p(g[1]);return p(g[0])}}async function _(e,t){if("function"==typeof Response&&e instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if("application/wasm"!=e.headers.get("Content-Type"))console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",t);else throw t}let r=await e.arrayBuffer();return await WebAssembly.instantiate(r,t)}{let r=await WebAssembly.instantiate(e,t);return r instanceof WebAssembly.Instance?{instance:r,module:e}:r}}function y(){let e={};return e.wbg={},e.wbg.__wbg_buffer_609cc3eee51ed158=function(e){return e.buffer},e.wbg.__wbg_call_7cccdd69e0791ae2=function(){return o(function(e,t,r){return e.call(t,r)},arguments)},e.wbg.__wbg_call_833bed5770ea2041=function(){return o(function(e,t,r,n){return e.call(t,r,n)},arguments)},e.wbg.__wbg_get_67b2ba62fc30de12=function(){return o(function(e,t){return Reflect.get(e,t)},arguments)},e.wbg.__wbg_new_405e22f390576ce2=function(){return{}},e.wbg.__wbg_new_78feb108b6472713=function(){return[]},e.wbg.__wbg_new_9ffbe0a71eff35e3=function(){return o(function(e,t){return new URL(l(e,t))},arguments)},e.wbg.__wbg_new_a12002a7f91c75be=function(e){return new Uint8Array(e)},e.wbg.__wbg_newwithbase_161c299e7a34e2eb=function(){return o(function(e,t,r,n){return new URL(l(e,t),l(r,n))},arguments)},e.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a=function(e,t,r){return new Uint8Array(e,t>>>0,r>>>0)},e.wbg.__wbg_scramtag_3a255d78b157986d=function(e){let t=h((0,i.t)(),n.__wbindgen_malloc,n.__wbindgen_realloc),r=d;w().setInt32(e+4,r,!0),w().setInt32(e+0,t,!0)},e.wbg.__wbg_set_bb8cecf6a62b9f46=function(){return o(function(e,t,r){return Reflect.set(e,t,r)},arguments)},e.wbg.__wbg_toString_5285597960676b7b=function(e){return e.toString()},e.wbg.__wbg_toString_c813bbd34d063839=function(e){return e.toString()},e.wbg.__wbindgen_boolean_get=function(e){return"boolean"==typeof e?+!!e:2},e.wbg.__wbindgen_error_new=function(e,t){return Error(l(e,t))},e.wbg.__wbindgen_init_externref_table=function(){let e=n.__wbindgen_export_2,t=e.grow(4);e.set(0,void 0),e.set(t+0,void 0),e.set(t+1,null),e.set(t+2,!0),e.set(t+3,!1)},e.wbg.__wbindgen_is_function=function(e){return"function"==typeof e},e.wbg.__wbindgen_memory=function(){return n.memory},e.wbg.__wbindgen_string_get=function(e,t){let r="string"==typeof t?t:void 0;var i=null==r?0:h(r,n.__wbindgen_malloc,n.__wbindgen_realloc),o=d;w().setInt32(e+4,o,!0),w().setInt32(e+0,i,!0)},e.wbg.__wbindgen_string_new=function(e,t){return l(e,t)},e.wbg.__wbindgen_throw=function(e,t){throw Error(l(e,t))},e}function v(e,t){return n=e.exports,S.__wbindgen_wasm_module=t,g=null,a=null,n.__wbindgen_start(),n}function x(e){if(void 0!==n)return n;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module:e}=e:console.warn("using deprecated parameters for `initSync()`; pass a single object instead"));let t=y();return e instanceof WebAssembly.Module||(e=new WebAssembly.Module(e)),v(new WebAssembly.Instance(e,t),e)}async function S(e){if(void 0!==n)return n;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e}=e:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),void 0===e&&(e=new URL("wasm_bg.wasm",""));let t=y();("string"==typeof e||"function"==typeof Request&&e instanceof Request||"function"==typeof URL&&e instanceof URL)&&(e=fetch(e));let{instance:r,module:i}=await _(await e,t);return v(r,i)}}},t={};function r(n){var i=t[n];if(void 0!==i)return i.exports;var o=t[n]={exports:{}};return e[n](o,o.exports,r),o.exports}r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=r(9022),t=r(8931),n=r(8810),i=r(522);class o extends EventTarget{client;config;syncPool={};synctoken=0;cookieStore=new n.h3.shared.CookieStore;serviceWorkers=[];constructor(){super(),this.client=new n.h3.shared.util.BareClient;let t=indexedDB.open("$scramjet",1);t.onsuccess=()=>{let e=t.result.transaction("cookies","readonly").objectStore("cookies").get("cookies");e.onsuccess=()=>{e.result&&this.cookieStore.load(e.result)}},addEventListener("message",async({data:r})=>{if("scramjet$type"in r){if("scramjet$token"in r){let e=this.syncPool[r.scramjet$token];delete this.syncPool[r.scramjet$token],e(r);return}if("registerServiceWorker"===r.scramjet$type)return void this.serviceWorkers.push(new e.Y(r.port,r.origin));"cookie"===r.scramjet$type&&(this.cookieStore.setCookies([r.cookie],new URL(r.url)),t.result.transaction("cookies","readwrite").objectStore("cookies").put(JSON.parse(this.cookieStore.dump()),"cookies")),"loadConfig"===r.scramjet$type&&(this.config=r.config)}})}async dispatch(e,t){let r,n=this.synctoken++,i=new Promise(e=>r=e);return this.syncPool[n]=r,t.scramjet$token=n,e.postMessage(t),await i}async loadConfig(){if(this.config)return;let e=indexedDB.open("$scramjet",1);return new Promise((t,r)=>{e.onsuccess=async()=>{let o=e.result.transaction("config","readonly").objectStore("config").get("config");o.onsuccess=async()=>{this.config=o.result,n.h3.config=o.result,(0,n.t8)(),await (0,i.V)(),t()},o.onerror=()=>r(o.error)},e.onerror=()=>r(e.error)})}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)||!!e.url.startsWith(location.origin+this.config.files.wasm)}async fetch({request:e,clientId:r}){this.config||await this.loadConfig();let n=await self.clients.get(r);return t.pd.call(this,e,n)}}self.ScramjetServiceWorker=o})()})();
//# sourceMappingURL=scramjet.worker.js.map