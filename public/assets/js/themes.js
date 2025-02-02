//This was done by pookie cube
//Sorry pookie cube

var bg = document.getElementById("bg")
const theme = localStorage.getItem("theme");


if (!theme) {
    localStorage.setItem("theme", "default");
}

if (!localStorage.getItem("custombg")) {
    localStorage.setItem("custombg", "");
}

switch (theme) {
    case "night":
        if (localStorage.getItem("custombg") == '') {
            if (bg) { bg.setAttribute("src", "/assets/imgs/bg/night.jpg"); }

        }
        document.documentElement.style.cssText = "--primary: rgb(0, 0, 0);--secondary: rgb(74, 74, 74);--font: rgb(74, 74, 74);--accent: rgb(40, 40, 40); ";
        break;
    case "quartz":
        if (localStorage.getItem("custombg") == '') {
            if (bg) {
                bg.setAttribute("src", "/assets/imgs/bg/quartz.avif");
            }
        }
        document.documentElement.style.cssText = "    --primary: rgb(255, 255, 255);--secondary: rgb(198, 198, 198);--font: rgb(138, 138, 138); --accent: rgb(161, 161, 161); ";
        break;
    case "twelve":
        if (localStorage.getItem("custombg") == '') {
            if (bg) {
                bg.setAttribute("src", "/assets/imgs/bg/twelve.jpg");
            }

        }
        document.documentElement.style.cssText = "    --primary: rgb(0, 0, 0);--secondary: rgb(74, 74, 74); --font: rgb(74, 74, 74); --accent: rgb(40, 40, 40); ";
        break;
    case "dusk":
        if (localStorage.getItem("custombg") == '') {
            if (bg) {
                bg.setAttribute("src", "/assets/imgs/bg/dusk.png");
            }
        }
        document.documentElement.style.cssText = "    --primary: rgb(0, 0, 0);--secondary: rgb(255, 202, 171); --font: rgb(255, 206, 171); --accent: rgb(255, 113, 62); ";
        break;
    case "flourishing":
        if (localStorage.getItem("custombg") == '') {
            if (bg) {
                bg.setAttribute("src", "/assets/imgs/bg/flourishing.jpg");
            }
        }
        document.documentElement.style.cssText = "    --primary: rgb(255, 239, 189);--secondary: rgb(192, 171, 149); --font: rgb(255, 203, 184); --accent: rgb(243, 222, 187); ";
        break;
    case "default":
        if (localStorage.getItem("custombg") == '') {
            if (bg) {
                bg.setAttribute("src", "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E")
            }

        }
        document.documentElement.style.cssText = '    --primary: rgb(0, 5, 7);--secondary: rgb(255, 255, 255);--font: rgb(255, 255, 255);--accent: rgb(0, 153, 255);'
        break;
}

if (localStorage.getItem("custombg") != '') {
    bg.setAttribute("src", localStorage.getItem("custombg"));
}