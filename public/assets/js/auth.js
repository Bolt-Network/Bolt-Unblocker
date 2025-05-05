if (!localStorage.getItem('name') || localStorage.getItem('name') == '') {
    localStorage.setItem('particlesEnabled', true);
    window.location.href = '/onboard.html';
}