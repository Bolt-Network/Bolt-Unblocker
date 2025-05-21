(()=>{var e={8810:function(e,t,n){n.d(t,{Sp:()=>s,h3:()=>r,t8:()=>i}),"$scramjet"in self||(self.$scramjet={version:{build:"dc134c1",version:"1.0.2-dev"},codec:{},flagEnabled:s});let r=self.$scramjet,o=Function;function i(){r.codec.encode=o("url",r.config.codec.encode),r.codec.decode=o("url",r.config.codec.decode)}function s(e,t){let n=r.config.flags[e];for(let n in r.config.siteFlags){let o=r.config.siteFlags[n];if(new RegExp(n).test(t.href)&&e in o)return o[e]}return n}},4471:function(e,t,n){n.d(t,{$O:()=>m,Ag:()=>d,KF:()=>i,Sd:()=>c,U5:()=>u,V6:()=>p,r4:()=>g});var r=n(8810);let{util:{BareClient:o,ScramjetHeaders:i,BareMuxConnection:s},url:{rewriteUrl:a,unrewriteUrl:c,rewriteBlob:l,unrewriteBlob:d},rewrite:{rewriteCss:u,unrewriteCss:f,rewriteHtml:g,unrewriteHtml:h,rewriteSrcset:b,rewriteJs:w,rewriteHeaders:p,rewriteWorkers:m,htmlRules:_},CookieStore:y}=r.h3.shared;r.h3.config},4079:function(e,t,n){n.d(t,{LC:()=>a,o:()=>i});var r=n(7418),o=n(8810);async function i(){let e=await fetch(o.h3.config.files.wasm).then(e=>e.arrayBuffer());self.REAL_WASM=new Uint8Array(e)}self.WASM&&(self.REAL_WASM=Uint8Array.from(atob(self.WASM),e=>e.charCodeAt(0))),Error.stackTraceLimit=50;let s=new TextDecoder;function a(e,t,n,i=!1){return function(e,t,n,i=!1){if((0,o.Sp)("naiiveRewriter",n.origin)){var a;return{js:("string"!=typeof(a="string"==typeof e?e:new TextDecoder().decode(e))&&(a=new TextDecoder().decode(a)),`
		with (${o.h3.config.globals.wrapfn}(globalThis)) {

			${a}

		}
	`),tag:"",map:null}}return function(e,t,n,i){let a;if(!(self.REAL_WASM&&self.REAL_WASM instanceof Uint8Array))throw Error("rewriter wasm not found (was it fetched correctly?)");(0,r.rb)({module:new WebAssembly.Module(self.REAL_WASM)});let c=performance.now();try{a="string"==typeof e?(0,r.DF)(e,n.base.href,t||"(unknown)",i,o.h3):(0,r.Fp)(e,n.base.href,t||"(unknown)",i,o.h3)}catch(n){return console.warn("failed rewriting js for",t,n.message,e),{js:e,tag:"",map:null}}let l=performance.now(),{js:d,map:u,scramtag:f,errors:g,duration:h}=a;if((0,o.Sp)("sourcemaps",n.base)&&!globalThis.clients&&(globalThis[globalThis.$scramjet.config.globals.pushsourcemapfn](Array.from(u),f),u=null),(0,o.Sp)("rewriterLogs",n.base))for(let e of g)console.error("oxc parse error",e);if((0,o.Sp)("rewriterLogs",n.base)){let e=(l-c-Number(h)).toFixed(2);console.log(`oxc rewrite for "${t||"(unknown)"}" was ${h<1n?"BLAZINGLY FAST":h<500n?"decent speed":"really slow"} (${h}ms; ${e}ms overhead)`)}return{js:"string"==typeof e?s.decode(d):d,tag:f,map:u}}(e,t,n,i)}(e,t,n,i)}},4155:function(e,t,n){n.d(t,{O:()=>o});var r=n(8810);function o(e,t){let n={"content-type":"text/html"};return crossOriginIsolated&&(n["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(function(e,t){let n=`
                errorTrace.value = ${JSON.stringify(e)};
                fetchedURL.textContent = ${JSON.stringify(t)};
                for (const node of document.querySelectorAll("#hostname")) node.textContent = ${JSON.stringify(location.hostname)};
                reload.addEventListener("click", () => location.reload());
                version.textContent = ${JSON.stringify(r.h3.version.version)};
                build.textContent = ${JSON.stringify(r.h3.version.build)};
                
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
                    <script src="${"data:application/javascript,"+encodeURIComponent(n)}"></script>
                </body>
            </html>
        `}(String(e),t),{status:500,headers:n})}},9022:function(e,t,n){n.d(t,{Y:()=>r});class r{handle;origin;syncToken;promises;messageChannel;connected;constructor(e,t){this.handle=e,this.origin=t,this.syncToken=0,this.promises={},this.messageChannel=new MessageChannel,this.connected=!1,this.messageChannel.port1.addEventListener("message",e=>{"scramjet$type"in e.data&&("init"===e.data.scramjet$type?this.connected=!0:this.handleMessage(e.data))}),this.messageChannel.port1.start(),this.handle.postMessage({scramjet$type:"init",scramjet$port:this.messageChannel.port2},[this.messageChannel.port2])}handleMessage(e){let t=this.promises[e.scramjet$token];t&&(t(e),delete this.promises[e.scramjet$token])}async fetch(e){let t=this.syncToken++,n={scramjet$type:"fetch",scramjet$token:t,scramjet$request:{url:e.url,body:e.body,headers:Array.from(e.headers.entries()),method:e.method,mode:e.mode,destinitation:e.destination}},r=e.body?[e.body]:[];this.handle.postMessage(n,r);let{scramjet$response:o}=await new Promise(e=>{this.promises[t]=e});return!!o&&new Response(o.body,{headers:o.headers,status:o.status,statusText:o.statusText})}}},8931:function(e,t,n){n.d(t,{pd:()=>c});var r=n(4155),o=n(4471),i=n(8810),s=n(4079);function a(e){return{origin:e,base:e}}async function c(e,t){try{let n=new URL(e.url),r="";if(n.searchParams.has("type")&&(r=n.searchParams.get("type"),n.searchParams.delete("type")),n.searchParams.has("dest")&&n.searchParams.delete("dest"),n.pathname===this.config.files.wasm)return fetch(this.config.files.wasm).then(async e=>{let t=await e.arrayBuffer(),n=btoa(new Uint8Array(t).reduce((e,t)=>(e.push(String.fromCharCode(t)),e),[]).join("")),r="";return r+=`if ('document' in self && document.currentScript) { document.currentScript.remove(); }
self.WASM = '${n}';`,new Response(r,{headers:{"content-type":"text/javascript"}})});if(n.pathname.startsWith(this.config.prefix+"blob:")||n.pathname.startsWith(this.config.prefix+"data:")){let i,s=n.pathname.substring(this.config.prefix.length);s.startsWith("blob:")&&(s=(0,o.Ag)(s));let c=await fetch(s,{});c.finalURL=s.startsWith("blob:")?s:"(data url)",c.body&&(i=await d(c,t?{base:new URL(new URL(t.url).origin),origin:new URL(new URL(t.url).origin)}:a(new URL((0,o.Sd)(e.referrer))),e.destination,r,this.cookieStore));let l=Object.fromEntries(c.headers.entries());return crossOriginIsolated&&(l["Cross-Origin-Opener-Policy"]="same-origin",l["Cross-Origin-Embedder-Policy"]="require-corp"),new Response(i,{status:c.status,statusText:c.statusText,headers:l})}let s=new URL((0,o.Sd)(n)),c=this.serviceWorkers.find(e=>e.origin===s.origin);if(c&&c.connected&&"swruntime"!==n.searchParams.get("from")){let t=await c.fetch(e);if(t)return t}if(s.origin==new URL(e.url).origin)throw Error("attempted to fetch from same origin - this means the site has obtained a reference to the real origin, aborting");let u=new o.KF;for(let[t,n]of e.headers.entries())u.set(t,n);if(t&&new URL(t.url).pathname.startsWith(i.h3.config.prefix)){let e=new URL((0,o.Sd)(t.url));e.toString().includes("youtube.com")||(u.set("Referer",e.toString()),u.set("Origin",e.origin?`${e.protocol}//${e.host}`:"null"))}let g=this.cookieStore.getCookies(s,!1);g.length&&u.set("Cookie",g),u.set("Sec-Fetch-Dest",e.destination),u.set("Sec-Fetch-Site","same-origin"),u.set("Sec-Fetch-Mode","cors"===e.mode?e.mode:"same-origin");let h=new f(s,u.headers,e.body,e.method,e.destination,t);this.dispatchEvent(h);let b=h.response||await this.client.fetch(h.url,{method:h.method,body:h.body,headers:h.requestHeaders,credentials:"omit",mode:"cors"===e.mode?e.mode:"same-origin",cache:e.cache,redirect:"manual",duplex:"half"});return await l(s,r,e.destination,b,this.cookieStore,t,this)}catch(i){let t={message:i.message,url:e.url,destination:e.destination,timestamp:new Date().toISOString()};if(i.stack&&(t.stack=i.stack),console.error("ERROR FROM SERVICE WORKER FETCH: ",t),!["document","iframe"].includes(e.destination))return new Response(void 0,{status:500});let n=Object.entries(t).map(([e,t])=>`${e.charAt(0).toUpperCase()+e.slice(1)}: ${t}`).join("\n\n");return(0,r.O)(n,(0,o.Sd)(e.url))}}async function l(e,t,n,r,i,s,c){let l,f=(0,o.V6)(r.rawHeaders,a(e)),g=f["set-cookie"]||[];for(let t in g)if(s){let r=c.dispatch(s,{scramjet$type:"cookie",cookie:t,url:e.href});"document"!==n&&"iframe"!==n&&await r}for(let t in await i.setCookies(g instanceof Array?g:[g],e),f)Array.isArray(f[t])&&(f[t]=f[t][0]);if(r.body&&(l=await d(r,a(e),n,t,i)),["document","iframe"].includes(n)){let e=f["content-disposition"];if(!/\s*?((inline|attachment);\s*?)filename=/i.test(e)){let t=/^\s*?attachment/i.test(e)?"attachment":"inline",[n]=new URL(r.finalURL).pathname.split("/").slice(-1);f["content-disposition"]=`${t}; filename=${JSON.stringify(n)}`}}"text/event-stream"===f.accept&&(f["content-type"]="text/event-stream"),delete f["permissions-policy"],crossOriginIsolated&&["document","iframe","worker","sharedworker","style","script"].includes(n)&&(f["Cross-Origin-Embedder-Policy"]="require-corp",f["Cross-Origin-Opener-Policy"]="same-origin");let h=new u(l,f,r.status,r.statusText,n,e,r,s);return c.dispatchEvent(h),new Response(h.responseBody,{headers:h.responseHeaders,status:h.status,statusText:h.statusText})}async function d(e,t,n,r,a){switch(n){case"iframe":case"document":if(e.headers.get("content-type")?.startsWith("text/html"))return(0,o.r4)(await e.text(),a,t,!0);return e.body;case"script":{let{js:n,tag:o,map:a}=(0,s.LC)(new Uint8Array(await e.arrayBuffer()),e.finalURL,t,"module"===r);if((0,i.Sp)("sourcemaps",t.base)&&a){n instanceof Uint8Array&&(n=new TextDecoder().decode(n));let e=`${globalThis.$scramjet.config.globals.pushsourcemapfn}([${a.join(",")}], "${o}");`,t=/^\s*(['"])use strict\1;?/;n=t.test(n)?n.replace(t,`$&
${e}`):`${e}
${n}`}return n}case"style":return(0,o.U5)(await e.text(),t);case"sharedworker":case"worker":return(0,o.$O)(new Uint8Array(await e.arrayBuffer()),r,e.finalURL,t);default:return e.body}}class u extends Event{responseBody;responseHeaders;status;statusText;destination;url;rawResponse;client;constructor(e,t,n,r,o,i,s,a){super("handleResponse"),this.responseBody=e,this.responseHeaders=t,this.status=n,this.statusText=r,this.destination=o,this.url=i,this.rawResponse=s,this.client=a}}class f extends Event{url;requestHeaders;body;method;destination;client;constructor(e,t,n,r,o,i){super("request"),this.url=e,this.requestHeaders=t,this.body=n,this.method=r,this.destination=o,this.client=i}response}},3093:function(e,t,n){n.d(t,{t:()=>r});function r(){return"10000000000".replace(/[018]/g,e=>(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16))}},7418:function(e,t,n){let r;n.d(t,{DF:()=>_,Fp:()=>y,rb:()=>R});var o=n(3093);function i(e){let t=r.__externref_table_alloc();return r.__wbindgen_export_2.set(t,e),t}function s(e,t){try{return e.apply(this,t)}catch(t){let e=i(t);r.__wbindgen_exn_store(e)}}let a="undefined"!=typeof TextDecoder?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};"undefined"!=typeof TextDecoder&&a.decode();let c=null;function l(){return(null===c||c.buffer!==r.memory.buffer)&&(c=new Uint8Array(r.memory.buffer)),c}function d(e,t){return e>>>=0,a.decode(l().slice(e,e+t))}let u=0,f="undefined"!=typeof TextEncoder?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},g=function(e,t){let n=f.encode(e);return t.set(n),{read:e.length,written:n.length}};function h(e,t,n){if(void 0===n){let n=f.encode(e),r=t(n.length,1)>>>0;return l().subarray(r,r+n.length).set(n),u=n.length,r}let r=e.length,o=t(r,1)>>>0,i=l(),s=0;for(;s<r;s++){let t=e.charCodeAt(s);if(t>127)break;i[o+s]=t}if(s!==r){0!==s&&(e=e.slice(s)),o=n(o,r,r=s+3*e.length,1)>>>0;let t=g(e,l().subarray(o+s,o+r));s+=t.written,o=n(o,r,s,1)>>>0}return u=s,o}let b=null;function w(){return(null===b||b.buffer!==r.memory.buffer)&&(b=new DataView(r.memory.buffer)),b}function p(e){return null==e}function m(e){let t=r.__wbindgen_export_2.get(e);return r.__externref_table_dealloc(e),t}function _(e,t,n,o,i){let s=h(e,r.__wbindgen_malloc,r.__wbindgen_realloc),a=u,c=h(t,r.__wbindgen_malloc,r.__wbindgen_realloc),l=u,d=h(n,r.__wbindgen_malloc,r.__wbindgen_realloc),f=u,g=r.rewrite_js(s,a,c,l,d,f,o,i);if(g[2])throw m(g[1]);return m(g[0])}function y(e,t,n,o,i){let s=function(e,t){let n=t(+e.length,1)>>>0;return l().set(e,n/1),u=e.length,n}(e,r.__wbindgen_malloc),a=u,c=h(t,r.__wbindgen_malloc,r.__wbindgen_realloc),d=u,f=h(n,r.__wbindgen_malloc,r.__wbindgen_realloc),g=u,b=r.rewrite_js_from_arraybuffer(s,a,c,d,f,g,o,i);if(b[2])throw m(b[1]);return m(b[0])}async function v(e,t){if("function"==typeof Response&&e instanceof Response){if("function"==typeof WebAssembly.instantiateStreaming)try{return await WebAssembly.instantiateStreaming(e,t)}catch(t){if("application/wasm"!=e.headers.get("Content-Type"))console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",t);else throw t}let n=await e.arrayBuffer();return await WebAssembly.instantiate(n,t)}{let n=await WebAssembly.instantiate(e,t);return n instanceof WebAssembly.Instance?{instance:n,module:e}:n}}function x(){let e={};return e.wbg={},e.wbg.__wbg_buffer_609cc3eee51ed158=function(e){return e.buffer},e.wbg.__wbg_call_672a4d21634d4a24=function(){return s(function(e,t){return e.call(t)},arguments)},e.wbg.__wbg_call_7cccdd69e0791ae2=function(){return s(function(e,t,n){return e.call(t,n)},arguments)},e.wbg.__wbg_call_833bed5770ea2041=function(){return s(function(e,t,n,r){return e.call(t,n,r)},arguments)},e.wbg.__wbg_get_67b2ba62fc30de12=function(){return s(function(e,t){return Reflect.get(e,t)},arguments)},e.wbg.__wbg_new_405e22f390576ce2=function(){return{}},e.wbg.__wbg_new_78feb108b6472713=function(){return[]},e.wbg.__wbg_new_9ffbe0a71eff35e3=function(){return s(function(e,t){return new URL(d(e,t))},arguments)},e.wbg.__wbg_new_a12002a7f91c75be=function(e){return new Uint8Array(e)},e.wbg.__wbg_newnoargs_105ed471475aaf50=function(e,t){return Function(d(e,t))},e.wbg.__wbg_newwithbase_161c299e7a34e2eb=function(){return s(function(e,t,n,r){return new URL(d(e,t),d(n,r))},arguments)},e.wbg.__wbg_newwithbyteoffsetandlength_d97e637ebe145a9a=function(e,t,n){return new Uint8Array(e,t>>>0,n>>>0)},e.wbg.__wbg_now_d18023d54d4e5500=function(e){return e.now()},e.wbg.__wbg_scramtag_3a255d78b157986d=function(e){let t=h((0,o.t)(),r.__wbindgen_malloc,r.__wbindgen_realloc),n=u;w().setInt32(e+4,n,!0),w().setInt32(e+0,t,!0)},e.wbg.__wbg_set_bb8cecf6a62b9f46=function(){return s(function(e,t,n){return Reflect.set(e,t,n)},arguments)},e.wbg.__wbg_static_accessor_GLOBAL_88a902d13a557d07=function(){let e="undefined"==typeof global?null:global;return p(e)?0:i(e)},e.wbg.__wbg_static_accessor_GLOBAL_THIS_56578be7e9f832b0=function(){let e="undefined"==typeof globalThis?null:globalThis;return p(e)?0:i(e)},e.wbg.__wbg_static_accessor_SELF_37c5d418e4bf5819=function(){let e="undefined"==typeof self?null:self;return p(e)?0:i(e)},e.wbg.__wbg_static_accessor_WINDOW_5de37043a91a9c40=function(){let e="undefined"==typeof window?null:window;return p(e)?0:i(e)},e.wbg.__wbg_toString_5285597960676b7b=function(e){return e.toString()},e.wbg.__wbg_toString_c813bbd34d063839=function(e){return e.toString()},e.wbg.__wbindgen_boolean_get=function(e){return"boolean"==typeof e?+!!e:2},e.wbg.__wbindgen_error_new=function(e,t){return Error(d(e,t))},e.wbg.__wbindgen_init_externref_table=function(){let e=r.__wbindgen_export_2,t=e.grow(4);e.set(0,void 0),e.set(t+0,void 0),e.set(t+1,null),e.set(t+2,!0),e.set(t+3,!1)},e.wbg.__wbindgen_is_function=function(e){return"function"==typeof e},e.wbg.__wbindgen_is_undefined=function(e){return void 0===e},e.wbg.__wbindgen_memory=function(){return r.memory},e.wbg.__wbindgen_number_new=function(e){return e},e.wbg.__wbindgen_string_get=function(e,t){let n="string"==typeof t?t:void 0;var o=p(n)?0:h(n,r.__wbindgen_malloc,r.__wbindgen_realloc),i=u;w().setInt32(e+4,i,!0),w().setInt32(e+0,o,!0)},e.wbg.__wbindgen_string_new=function(e,t){return d(e,t)},e.wbg.__wbindgen_throw=function(e,t){throw Error(d(e,t))},e}function S(e,t){e.wbg.memory=t||new WebAssembly.Memory({initial:18,maximum:16384,shared:!0})}function k(e,t,n){if(r=e.exports,j.__wbindgen_wasm_module=t,b=null,c=null,void 0!==n&&("number"!=typeof n||0===n||n%65536!=0))throw"invalid stack size";return r.__wbindgen_start(n),r}function R(e,t){let n;if(void 0!==r)return r;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module:e,memory:t,thread_stack_size:n}=e:console.warn("using deprecated parameters for `initSync()`; pass a single object instead"));let o=x();return S(o,t),e instanceof WebAssembly.Module||(e=new WebAssembly.Module(e)),k(new WebAssembly.Instance(e,o),e,n)}async function j(e,t){let n;if(void 0!==r)return r;void 0!==e&&(Object.getPrototypeOf(e)===Object.prototype?{module_or_path:e,memory:t,thread_stack_size:n}=e:console.warn("using deprecated parameters for the initialization function; pass a single object instead")),void 0===e&&(e=new URL("wasm_bg.wasm",""));let o=x();("string"==typeof e||"function"==typeof Request&&e instanceof Request||"function"==typeof URL&&e instanceof URL)&&(e=fetch(e)),S(o,t);let{instance:i,module:s}=await v(await e,o);return k(i,s,n)}}},t={};function n(r){var o=t[r];if(void 0!==o)return o.exports;var i=t[r]={exports:{}};return e[r](i,i.exports,n),i.exports}n.d=(e,t)=>{for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{var e=n(9022),t=n(8931),r=n(8810),o=n(4079);class i extends EventTarget{client;config;syncPool={};synctoken=0;cookieStore=new r.h3.shared.CookieStore;serviceWorkers=[];constructor(){super(),this.client=new r.h3.shared.util.BareClient;let t=indexedDB.open("$scramjet",1);t.onsuccess=()=>{let e=t.result.transaction("cookies","readonly").objectStore("cookies").get("cookies");e.onsuccess=()=>{e.result&&this.cookieStore.load(e.result)}},addEventListener("message",async({data:n})=>{if("scramjet$type"in n){if("scramjet$token"in n){let e=this.syncPool[n.scramjet$token];delete this.syncPool[n.scramjet$token],e(n);return}if("registerServiceWorker"===n.scramjet$type)return void this.serviceWorkers.push(new e.Y(n.port,n.origin));"cookie"===n.scramjet$type&&(this.cookieStore.setCookies([n.cookie],new URL(n.url)),t.result.transaction("cookies","readwrite").objectStore("cookies").put(JSON.parse(this.cookieStore.dump()),"cookies")),"loadConfig"===n.scramjet$type&&(this.config=n.config)}})}async dispatch(e,t){let n,r=this.synctoken++,o=new Promise(e=>n=e);return this.syncPool[r]=n,t.scramjet$token=r,e.postMessage(t),await o}async loadConfig(){if(this.config)return;let e=indexedDB.open("$scramjet",1);return new Promise((t,n)=>{e.onsuccess=async()=>{let i=e.result.transaction("config","readonly").objectStore("config").get("config");i.onsuccess=async()=>{this.config=i.result,r.h3.config=i.result,(0,r.t8)(),await (0,o.o)(),t()},i.onerror=()=>n(i.error)},e.onerror=()=>n(e.error)})}route({request:e}){return!!e.url.startsWith(location.origin+this.config.prefix)||!!e.url.startsWith(location.origin+this.config.files.wasm)}async fetch({request:e,clientId:n}){this.config||await this.loadConfig();let r=await self.clients.get(n);return t.pd.call(this,e,r)}}self.ScramjetServiceWorker=i})()})();
//# sourceMappingURL=scramjet.worker.js.map