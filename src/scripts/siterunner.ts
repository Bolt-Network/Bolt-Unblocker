import proxy, { swReady } from "./proxy";

const siteRunnerFrame = document.getElementById('site-runner') as HTMLIFrameElement;

const url = new URLSearchParams(window.location.search).get('url');
await swReady;
if (url) {
    siteRunnerFrame.src = proxy.encodeUrl(url);
}