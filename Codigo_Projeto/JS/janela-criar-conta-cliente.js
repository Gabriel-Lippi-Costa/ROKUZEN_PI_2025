function toggleModalCriarContaCliente() {
    const modalWrapper = document.getElementById('modalCriarContaCliente');
    modalWrapper.classList.toggle('show');
    
    if (modalWrapper.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

document.getElementById('modalCriarContaCliente').addEventListener('click', function(e) {
    if (e.target === this) {
        toggleModalCriarContaCliente();
    }
});