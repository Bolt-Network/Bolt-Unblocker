function createStars() {
    const starsContainer = document.querySelector('.stars');
    const numberOfStars = 100;

    // Clear existing stars
    starsContainer.innerHTML = '';

    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 4}s`;
        star.style.animationDuration = `${3 + Math.random() * 3}s`;
        starsContainer.appendChild(star);
    }
}

if (localStorage.getItem('particlesEnabled') === 'true') {
    createStars();
    window.addEventListener('resize', createStars);
}
