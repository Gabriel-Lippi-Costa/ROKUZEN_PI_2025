async function buscarFuncionario(id) {
    try {
        const resposta = await axios.get(`http://localhost:3000/funcionario/${id}`);
        const funcionario = resposta.data.funcionario;

        // Preencher o formulário com os dados do funcionário
        document.getElementById('nome').value = funcionario.nome_funcionario;
        document.getElementById('data-nascimento').value = funcionario.data_nascimento_funcionario;
        document.getElementById('telefone').value = funcionario.telefone_funcionario;
        document.getElementById('email').value = funcionario.email_funcionario;
        document.getElementById('password').value = funcionario.senha_funcionario; // opcional mostrar senha

    } catch (erro) {
        console.error('Erro ao buscar funcionário:', erro);
        alert(erro.response?.data?.erro || 'Erro ao buscar funcionário');
    }
}
