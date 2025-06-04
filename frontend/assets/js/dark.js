var themeToggleBtn = document.getElementById('theme-toggle');
var htmlEl = document.documentElement;

function applyTheme(theme) {
    if (theme === 'dark') {
    htmlEl.classList.add('dark');
    localStorage.setItem('theme', 'dark');
    } else {
    htmlEl.classList.remove('dark');
    localStorage.setItem('theme', 'light');
    }
}

// (Opcional) podemos checar novamente qual o tema atual e garantir que o botão fique em sincronia
// mas já resolvemos isso no script inline. Aqui só vamos mesmo alternar sob clique:
themeToggleBtn.addEventListener('click', function() {
    if (htmlEl.classList.contains('dark')) {
    applyTheme('light');
    } else {
    applyTheme('dark');
    }
});