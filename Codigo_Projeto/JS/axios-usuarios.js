const protocolo = 'http://';
const baseURL = 'localhost:3000';
const loginEndPoint = '/login';
const cadastroEndPoint = '/cadastro';

async function loginUsuario() {
    const email = document.querySelector('#email-login').value;
    const senha = document.querySelector('#senha-login').value;

    if (!email || !senha) {
        alert('Preencha todos os campos!');
        return;
    }

    const URLcompleta = `${protocolo}${baseURL}${loginEndPoint}`;

    try {
        const resposta = await axios.post(URLcompleta, { email, senha });
        const dados = resposta.data;

        alert(dados.mensagem);

        localStorage.removeItem('usuario');
        localStorage.removeItem('idClienteLogado');
        localStorage.removeItem('idFuncionarioLogado');
        localStorage.removeItem('tipoUsuario');
        localStorage.removeItem('token');


        const usuarioLimpo = { ...dados.usuario };
        delete usuarioLimpo.senha_cliente;
        delete usuarioLimpo.senha_funcionario;

        localStorage.setItem('usuario', JSON.stringify(usuarioLimpo));
        localStorage.setItem('tipoUsuario', dados.tipo);
        localStorage.setItem('token', dados.token);

        if (dados.tipo === 'cliente') {
            localStorage.setItem('idClienteLogado', dados.usuario.id_cliente);
            window.location.href = 'minha-conta.html';
        } else if (dados.tipo === 'funcionario') {
            localStorage.setItem('idFuncionarioLogado', dados.usuario.id_funcionario);
            window.location.href = 'funcionario.html';
        }

    } catch (erro) {
        if (erro.response && erro.response.data.erro) {
            alert(erro.response.data.erro);
        } else {
            alert('Erro ao conectar com o servidor!');
        }
    }
}

async function cadastrarUsuario() {
    const nome = document.querySelector('#nome').value;
    const data_nascimento = document.querySelector('#data-nascimento').value;
    const telefone = document.querySelector('#telefone').value;
    const email = document.querySelector('#email-cadastro').value;
    const senha = document.querySelector('#password-cadastro').value;
    const confirmar_senha = document.querySelector('#confirmar-password-cadastro').value;

    if (senha !== confirmar_senha) {
        alert('As senhas não são iguais!');
        return;
    }

    const URLcompleta = `${protocolo}${baseURL}${cadastroEndPoint}`;

    try {
        const resposta = await axios.post(URLcompleta, {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        });

        alert(resposta.data.mensagem);

        localStorage.removeItem('usuario');
        localStorage.removeItem('idClienteLogado');
        localStorage.removeItem('token');

        const usuarioLimpo = { ...resposta.data.usuario };
        delete usuarioLimpo.senha_cliente;

        localStorage.setItem('usuario', JSON.stringify(usuarioLimpo));
        localStorage.setItem('token', resposta.data.token);

        const agendamentoPendente = JSON.parse(localStorage.getItem('agendamentoPendente'));
        if (agendamentoPendente) {
            try {
                await axios.post(`${protocolo}${baseURL}/agendamento`, {
                    ...agendamentoPendente,
                    id_cliente: resposta.data.usuario.id_cliente
                }, {
                    headers: {
                        Authorization: `Bearer ${resposta.data.token}`
                    }
                });
                localStorage.removeItem('agendamentoPendente');
                alert('Agendamento pendente realizado com sucesso!');
            } catch (erro) {
                console.error('Erro ao processar agendamento pendente:', erro);
                alert('Erro ao concluir agendamento pendente.');
            }
        }

        window.location.href = 'minha-conta.html';

    } catch (erro) {
        if (erro.response && erro.response.data.erro) {
            alert(erro.response.data.erro);
        } else {
            alert('Erro ao conectar com o servidor!');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#botao-logar')?.addEventListener('click', loginUsuario);
    document.querySelector('#botao-cadastrar')?.addEventListener('click', cadastrarUsuario);
});
