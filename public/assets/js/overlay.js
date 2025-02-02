// Make the DIV element draggable:
dragElement(document.getElementById("overlay"));

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
        // if present, the header is where you move the DIV from:
        document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
        // otherwise, move the DIV from anywhere inside the DIV:
        elmnt.onmousedown = dragMouseDown;
    }

    function dragMouseDown(e) {
        if (e) {
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(event) {
        event.preventDefault();
        event.stopPropagation();
        // calculate the new cursor position:
        pos1 = event.clientX - pos3;
        pos2 = event.clientY - pos4;
        pos3 = event.clientX;
        pos4 = event.clientY;
        // set the element's new position:
        elmnt.style.top = (elmnt.offsetTop + pos2) + "px";
        elmnt.style.left = (elmnt.offsetLeft + pos1) + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

