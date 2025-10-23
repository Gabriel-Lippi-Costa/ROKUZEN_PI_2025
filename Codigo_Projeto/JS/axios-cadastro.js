const protocolo = 'http://'
const baseURL = 'localhost:3000'
const cadastroEndPoint = '/cadastro'

async function cadastrarUsuario() {
    const nome = document.querySelector('#nome').value
    const data_nascimento = document.querySelector('#data-nascimento').value
    const telefone = document.querySelector('#telefone').value
    const email = document.querySelector('#email-cadastro').value
    const senha = document.querySelector('#password-cadastro').value
    const confirmar_senha = document.querySelector('#confirmar-password-cadastro').value

    if (senha !== confirmar_senha) {
        alert('As senhas não são iguais!')
        return
    }

    const URLcompleta = `${protocolo}${baseURL}${cadastroEndPoint}`

    try {
        const resposta = await axios.post(URLcompleta, {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        })


        alert(resposta.data.mensagem)

        document.querySelector('#nome').value = '';
        document.querySelector('#data-nascimento').value = '';
        document.querySelector('#telefone').value = '';
        document.querySelector('#email-cadastro').value = '';
        document.querySelector('#password-cadastro').value = '';
        document.querySelector('#confirmar-password-cadastro').value = '';
        document.querySelector('#msgTEL').style.display = 'none' 

    } catch (erro) {
        if (erro.response) {
            alert(erro.response.data.erro)
        } else {
            alert('Erro ao conectar com o servidor!')
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#botao-cadastrar')
        .addEventListener('click', cadastrarUsuario);
})