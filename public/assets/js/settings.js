var proxySelect = document.getElementById("proxy-select");
var wispSelect = document.getElementById("wisp-select");
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
var loadselect = document.getElementById("load-select");
var engineSelect = document.getElementById("engine-select");

if (ptab && ttab && etab) {
  checkTabs();
  ptab.addEventListener("click", function () {
    tab = 0;
    checkTabs();
  });
  ttab.addEventListener("click", function () {
    tab = 1;
    checkTabs();
  });
  etab.addEventListener("click", function () {
    tab = 2;
    checkTabs();
  });

  if (!localStorage.getItem("engine")) {
    localStorage.setItem("engine", "google");
  }

  function checkTabs() {
    proxy.hidden = true;
    wisp.hidden = true;
    cloaking.hidden = true;
    cheats.hidden = true;
    themes.hidden = true;
    load.hidden = true;
    engine.hidden = true;
    cbg.style.display = "none";
    if (tab == 0) {
      ptab.classList.add("active");
      ttab.classList.remove("active");
      etab.classList.remove("active");
      proxy.hidden = false;
      wisp.hidden = false;
      load.hidden = false;
    } else if (tab == 1) {
      ttab.classList.add("active");
      ptab.classList.remove("active");
      etab.classList.remove("active");
      themes.hidden = false;
      cbg.style.display = "flex";
    } else if (tab == 2) {
      etab.classList.add("active");
      ptab.classList.remove("active");
      ttab.classList.remove("active");
      cheats.hidden = false;
      cloaking.hidden = false;
      engine.hidden = false;
    }
  }
}

if (proxySelect) {
  proxySelect.value = localStorage.getItem("proxy") || "uv";
  proxySelect.addEventListener("change", function () {
    localStorage.setItem("proxy", proxySelect.value);
  });
}

if (wispSelect) {
  if (localStorage.getItem("wisp") == (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/") {
    wispSelect.value = "default";
  } else {
    wispSelect.value = "tp";
  }
  wispSelect.addEventListener("change", function () {
    if (wispSelect.value == "default") {
      localStorage.setItem("wisp", (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/");
    }
    if (wispSelect.value == "tp") {
      localStorage.setItem("wisp", prompt("Enter your WISP URL:"));
    }
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

if (load) {
  loadselect.value = localStorage.getItem("load") || "fancy";
  loadselect.addEventListener("change", function () {
    localStorage.setItem("load", loadselect.value);
  });
}


if (engineSelect) {
  engineSelect.value = localStorage.getItem("engine") || "google";
  engineSelect.addEventListener("change", function () {
    localStorage.setItem("engine", engineSelect.value);
  });
}