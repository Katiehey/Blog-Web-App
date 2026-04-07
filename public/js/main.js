console.log("Client script loaded");

// Dark mode toggle
(function () {
    const toggle = document.getElementById('themeToggle');
    const root = document.documentElement;

    function applyTheme(theme) {
        root.setAttribute('data-theme', theme);
        if (toggle) toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    // Apply saved preference immediately
    const saved = localStorage.getItem('theme') || 'light';
    applyTheme(saved);

    if (toggle) {
        toggle.addEventListener('click', function () {
            const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            applyTheme(next);
        });
    }
})();
