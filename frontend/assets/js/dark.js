    var themeToggleBtn = document.getElementById('theme-toggle');
    var htmlElement = document.documentElement; // Seleciona o elemento <html>

    // Função para aplicar o tema
    function applyTheme(theme) {
        if (theme === 'dark') {
            htmlElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            htmlElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    // Verifica o tema salvo no localStorage ou a preferência do sistema
    var savedTheme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Adiciona o evento de clique ao botão
    themeToggleBtn.addEventListener('click', function() {
        if (htmlElement.classList.contains('dark')) {
            applyTheme('light');
        } else {
            applyTheme('dark');
        }
    });
