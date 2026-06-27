// script.js – dark mode toggle with localStorage persistence

(function() {
    "use strict";

    // DOM elements
    const toggleBtn = document.getElementById('darkModeToggle');
    const body = document.body;

    // key for localStorage
    const STORAGE_KEY = 'darkModePreference';

    // ---------- helper functions ----------
    function enableDarkMode() {
        body.classList.add('dark-mode');
        // update button text/icon
        if (toggleBtn) {
            toggleBtn.innerHTML = `<span class="toggle-icon">☀️</span> Light mode`;
            toggleBtn.setAttribute('aria-label', 'Switch to light mode');
        }
        // save preference
        localStorage.setItem(STORAGE_KEY, 'enabled');
    }

    function disableDarkMode() {
        body.classList.remove('dark-mode');
        if (toggleBtn) {
            toggleBtn.innerHTML = `<span class="toggle-icon">🌙</span> Dark mode`;
            toggleBtn.setAttribute('aria-label', 'Switch to dark mode');
        }
        localStorage.setItem(STORAGE_KEY, 'disabled');
    }

    function toggleDarkMode() {
        if (body.classList.contains('dark-mode')) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    }

    // ---------- restore saved preference ----------
    function applyStoredPreference() {
        const stored = localStorage.getItem(STORAGE_KEY);
        // if no stored preference, default to 'disabled' (light mode)
        if (stored === 'enabled') {
            enableDarkMode();
        } else if (stored === 'disabled') {
            disableDarkMode();
        } else {
            // no preference saved: default to light mode (but ensure button matches)
            // we explicitly set disabled state and clean up any leftover class
            disableDarkMode();
        }
    }

    // ---------- init ----------
    function init() {
        // 1. apply stored preference (or default light)
        applyStoredPreference();

        // 2. attach event listener to toggle button
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleDarkMode);
        } else {
            console.warn('Dark mode toggle button not found (#darkModeToggle)');
        }

        // (optional) small enhancement: if user clicks on any .demo-btn, just demo purpose
        // not required, but adds a tiny interactive feedback.
        const demoBtns = document.querySelectorAll('.demo-btn');
        demoBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                // simple feedback – just change text temporarily
                const original = this.textContent;
                this.textContent = '✨ clicked!';
                setTimeout(() => { this.textContent = original; }, 400);
            });
        });

        // handle link click (prevent navigation for demo)
        const demoLinks = document.querySelectorAll('.demo-link');
        demoLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                alert('🌓 Dark mode works on links too! (demo)');
            });
        });

        console.log('🌗 Dark mode converter ready · separate files');
    }

    // run after DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();