document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.getElementById('menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function(event) {
            event.stopPropagation();
            mobileMenu.classList.toggle('active');
            menuButton.setAttribute('aria-expanded', mobileMenu.classList.contains('active'));
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!mobileMenu.contains(event.target) && !menuButton.contains(event.target)) {
                mobileMenu.classList.remove('active');
                menuButton.setAttribute('aria-expanded', 'false');
            }
        });
    } else {
        console.error('Menu button or mobile menu not found');
    }
});