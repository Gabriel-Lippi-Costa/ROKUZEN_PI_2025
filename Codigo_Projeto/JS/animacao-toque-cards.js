const grupos = document.querySelectorAll('.cards');

grupos.forEach(grupo => {
    const cards = grupo.querySelectorAll('.card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            cards.forEach(c => c.classList.remove('selecionado'));

            card.classList.add('selecionado');
        });
    });
});