const protocolo = 'http://'
const baseURL = 'localhost:3000'
const loginEndPoint = '/login'

async function loginUsuario() {
    const email = document.querySelector('#email-login').value
    const senha = document.querySelector('#senha-login').value

    if (!email || !senha) {
    alert('Preencha todos os campos!');
    return;
}

    const URLcompleta = `${protocolo}${baseURL}${loginEndPoint}`

    try {
        const resposta = await axios.post(URLcompleta, {
            email,
            senha
        })


        alert(resposta.data.mensagem)

        document.querySelector('#email-login').value = '';
        document.querySelector('#senha-login').value = '';

    } catch (erro) {
        if (erro.response) {
            alert(erro.response.data.erro)
        } else {
            alert('Erro ao conectar com o servidor!')
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#botao-logar')
        .addEventListener('click', loginUsuario);
})