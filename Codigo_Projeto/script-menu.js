var ul = document.querySelector('header nav .opcoes-menu');
var menuBtn = document.querySelector('.menu-btn i');

function menuShow() {
    if (ul.classList.contains('open')) {
        ul.classList.remove('open')
    } else {
        ul.classList.add('open')
    }
}