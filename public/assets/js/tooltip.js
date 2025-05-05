const tooltip = document.getElementById('tooltip');

document.addEventListener('DOMContentLoaded', () => {
    // Find all elements with the 'data-tooltip' attribute
    const tooltipElements = document.querySelectorAll('[data-tooltip]');

    // Add event listeners to each element
    tooltipElements.forEach(element => {
        element.addEventListener('mouseover', (e) => {
            tooltip.textContent = element.getAttribute('data-tooltip');
            tooltip.style.opacity = '1';
            updateTooltipPosition(e);
        });

        element.addEventListener('mousemove', (e) => {
            updateTooltipPosition(e);
        });

        element.addEventListener('mouseout', () => {
            tooltip.style.opacity = '0';
        });
    });

    function updateTooltipPosition(e) {
        tooltip.style.left = (e.clientX + 15) + 'px';
        tooltip.style.top = (e.clientY - 25) + 'px';
    }

});
