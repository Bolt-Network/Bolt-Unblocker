var proxySelect = document.getElementById("proxy-select");
var transSelect = document.getElementById("trans-select");
var ab = document.getElementById("ab");
var blooket = document.getElementById("blooket");
var gimkit = document.getElementById("gimkit");
var tab = 0;
var ptab = document.getElementById("ptab");
var ttab = document.getElementById("ttab");
var etab = document.getElementById("etab");
var themeselect = document.getElementById("theme-select");
var bginput = document.getElementById("bginput");
var bgset = document.getElementById("bgset");
var engineSelect = document.getElementById("engine-select");
var particlesSelect = document.getElementById("p-select");

if (proxySelect) {
  proxySelect.value = localStorage.getItem("proxy") || "uv";
  proxySelect.addEventListener("change", function () {
    localStorage.setItem("proxy", proxySelect.value);
  });
}

if (localStorage.getItem("transport") == null) {
  localStorage.setItem("transport", "epoxy");
}
if (transSelect) {
  transSelect.value = localStorage.getItem("transport") || "epoxy";
  transSelect.addEventListener("change", function () {
    localStorage.setItem("transport", transSelect.value);
  });
}

if (ab) {
  ab.addEventListener("click", function () {
    var abtab = window.open("about:blank", "blank");
    abtab.document.write(`
  <html>
    <head>
      
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
        }
        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="/index.html" frameborder="0"></iframe>
    </body>
  </html>
`);
    window.location.href = "https://classroom.google.com/u/";
  });
}

if (blooket) {
  blooket.addEventListener("click", async function () {
    try {
      const response = await fetch('/assets/cheats/blooket.txt');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy cheats");
    }
  });
}

if (gimkit) {
  gimkit.addEventListener("click", async function () {
    try {
      const response = await fetch('/assets/cheats/gimkit.txt');
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Failed to copy cheats");
    }
  });
}

if (themeselect) {
  themeselect.value = localStorage.getItem("theme") || "default";
  themeselect.addEventListener("change", function () {
    localStorage.setItem("theme", themeselect.value);
    location.reload();
  });
}

if (bginput && bgset) {
  bginput.value = localStorage.getItem("custombg") || "";
  bgset.addEventListener("click", function () {
    localStorage.setItem("custombg", bginput.value);
    location.reload();
  });
}



if (engineSelect) {
  engineSelect.value = localStorage.getItem("engine") || "google";
  engineSelect.addEventListener("change", function () {
    localStorage.setItem("engine", engineSelect.value);
  });
}

if (particlesSelect) {
  particlesSelect.value = localStorage.getItem("particles") || "true";
  particlesSelect.addEventListener("change", function () {
    localStorage.setItem("particles", particlesSelect.value);
    location.reload();
  });
}