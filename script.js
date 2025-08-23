document.addEventListener('DOMContentLoaded', function() {
    
    // Funcionalidade das Abas (Features)
    const tabs = document.querySelectorAll('.feature-tab-button');
    const panes = document.querySelectorAll('.feature-pane');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove a classe 'active' de todos os botões e painéis
            tabs.forEach(item => item.classList.remove('active'));
            panes.forEach(pane => pane.classList.remove('active'));

            // Adiciona a classe 'active' ao botão clicado e ao painel correspondente
            tab.classList.add('active');
            const targetPane = document.getElementById(tab.dataset.target);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // Funcionalidade do Menu Hamburger para mobile
    const hamburger = document.querySelector('.hamburger-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Fecha o menu ao clicar em um link (melhora a experiência do usuário)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
            }
        });
    });
});