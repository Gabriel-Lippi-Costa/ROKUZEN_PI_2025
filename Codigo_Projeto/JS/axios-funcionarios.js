function toggleModalFuncionario() {
    const modalWrapper = document.getElementById('modalDados');
    modalWrapper.classList.toggle('show');

    if (modalWrapper.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
        preencherCamposFuncionario(); 
    } else {
        document.body.style.overflow = '';
    }
}

async function preencherCamposFuncionario() {
    const funcionario = JSON.parse(localStorage.getItem('usuario'));
    if (!funcionario || !funcionario.id_funcionario) {
        console.warn("Nenhum funcionário logado encontrado no localStorage.");
        return;
    }

    const id = funcionario.id_funcionario;

    try {
        const resp = await axios.get(`http://localhost:3000/funcionario/${id}`);
        const dados = resp.data.funcionario;

        document.getElementById('nome').value = dados.nome_funcionario || '';
        document.getElementById('data-nascimento').value = dados.data_nascimento_funcionario
            ? new Date(dados.data_nascimento_funcionario).toISOString().split('T')[0]
            : '';
        document.getElementById('telefone').value = dados.telefone_funcionario || '';
        document.getElementById('email').value = dados.email_funcionario || '';
        document.getElementById('password').value = dados.senha_funcionario || '';
    } catch (err) {
        console.error("Erro ao preencher dados do funcionário:", err);
        alert('Erro ao buscar dados do funcionário!');
    }
}

async function atualizarDadosFuncionario() {
    const funcionario = JSON.parse(localStorage.getItem('usuario'));
    if (!funcionario || !funcionario.id_funcionario) {
        alert("Funcionário não identificado!");
        return;
    }

    const id = funcionario.id_funcionario;

    const nome = document.getElementById('nome').value;
    const data_nascimento = document.getElementById('data-nascimento').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    try {
        const resp = await axios.patch(`http://localhost:3000/funcionario/${id}`, {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        });

        localStorage.setItem('usuarioLogado', JSON.stringify(resp.data.funcionario));

        preencherCamposFuncionario();
        alert('Dados atualizados com sucesso!');
    } catch (err) {
        console.error(err);
        alert('Erro ao atualizar os dados do funcionário!');
    }
}

document.getElementById('modalDados').addEventListener('click', function (e) {
    if (e.target === this) toggleModal();
});

async function criarContaCliente() {
    const nome = document.getElementById('nome-cliente').value.trim();
    const data_nascimento = document.getElementById('data-nascimento-cliente').value;
    const telefone = document.getElementById('telefone-cliente').value.trim();
    const email = document.getElementById('email-cliente').value.trim();
    const senha = document.getElementById('password-cliente').value.trim();

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        alert('Preencha todos os campos obrigatórios!');
        return;
    }

    try {
        const resposta = await axios.post('http://localhost:3000/cadastro', {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        });

        alert('Cliente cadastrado com sucesso!');
        console.log('Cliente criado:', resposta.data);

        document.getElementById('formDadosCriarCliente').reset();

        toggleModalCriarContaCliente();
    } catch (erro) {
        console.error('Erro ao criar conta do cliente:', erro);
        alert('Erro ao criar conta. Verifique os dados e tente novamente.');
    }
}
