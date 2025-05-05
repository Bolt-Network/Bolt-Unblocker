var namei = document.getElementById("iname");
var submit = document.getElementById("enter");

submit.addEventListener("click", function () {
    if (namei.value === "") {
        alert("Please enter a name");
        return;
    }
    localStorage.setItem("name", namei.value);
    window.top.location.href = "/";
});