import dummyProxy from "./encoding";

const siteRunnerFrame = document.getElementById('site-runner') as HTMLIFrameElement;

const url = new URLSearchParams(window.location.search).get('url');
if (url) {
    siteRunnerFrame.src = dummyProxy.encodeUrl(url);
}