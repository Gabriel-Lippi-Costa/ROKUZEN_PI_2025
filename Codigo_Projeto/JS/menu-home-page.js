var ul = document.querySelector('header nav .parte-do-meio ul');

function menuToggle() {
    ul.classList.toggle('open');
}

var links = document.querySelectorAll('header nav .parte-do-meio ul li a');

links.forEach(function (link) {
    link.addEventListener('click', function () {
        if (ul.classList.contains('open')) {
            ul.classList.remove('open');
        }
    });
});