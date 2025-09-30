var ul = document.querySelector('header nav .parte-do-meio ul');

// Função única para abrir/fechar
function menuToggle() {
    ul.classList.toggle('open');
}

// Opcional: Fechar o menu ao clicar em um link (boa prática no mobile)
var links = document.querySelectorAll('header nav .parte-do-meio ul li a');

links.forEach(function(link) {
    link.addEventListener('click', function() {
        if (ul.classList.contains('open')) {
            ul.classList.remove('open');
        }
    });
});