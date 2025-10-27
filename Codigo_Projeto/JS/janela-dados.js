function toggleModal() {
    const modalWrapper = document.getElementById('modalDados');
    modalWrapper.classList.toggle('show');

    if (modalWrapper.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
        preencherCamposUsuario();
    } else {
        document.body.style.overflow = '';
    }
}

async function preencherCamposUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) return;

    const id = usuario.id_cliente;

    try {
        const resp = await axios.get(`http://localhost:3000/usuario/${id}`);
        const dados = resp.data.usuario;

        document.getElementById('nome').value = dados.nome_cliente || '';

        const dataNascimento = dados.data_nascimento_cliente
            ? new Date(dados.data_nascimento_cliente).toISOString().split('T')[0]
            : '';

        document.getElementById('data-nascimento').value = dataNascimento;

        document.getElementById('telefone').value = dados.telefone_cliente || '';
        document.getElementById('email').value = dados.email_cliente || '';
        document.getElementById('password').value = dados.senha_cliente || '';
    } catch (err) {
        console.error(err);
    }
}

async function atualizarDadosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'))

    const id = usuario.id_cliente

    const nome = document.getElementById('nome').value;
    const data_nascimento = document.getElementById('data-nascimento').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    try {
        const resp = await axios.patch(`http://localhost:3000/atualizar/${id}`, {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        });

        localStorage.setItem('usuario', JSON.stringify(resp.data.usuario));

        preencherCamposUsuario();

        alert('Dados atualizados com sucesso!');
    } catch (err) {
        console.error(err);
        alert('Erro ao atualizar os dados do usuário!');
    }
}

document.getElementById('modalDados').addEventListener('click', function (e) {
    if (e.target === this) {
        toggleModal();
    }
});