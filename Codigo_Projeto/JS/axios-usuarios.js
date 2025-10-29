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

        alert(resposta.data.mensagem);

        // 🔹 Salva o usuário completo
        localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));

        // 🔹 Salva o ID do cliente separadamente (para facilitar buscas)
        localStorage.setItem('idClienteLogado', resposta.data.usuario.id_cliente);

        // 🔹 Redireciona para a página principal ou conta
        window.location.href = 'minha-conta.html';

    } catch (erro) {
        if (erro.response) {
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

        localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario))

        window.location.href = 'minha-conta.html'

    } catch (erro) {
        if (erro.response) {
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
