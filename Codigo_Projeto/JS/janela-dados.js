function toggleModal() {
    const modalWrapper = document.getElementById('modalDados');
    modalWrapper.classList.toggle('show');

    if (modalWrapper.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

document.getElementById('modalDados').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleModal();
    }
});