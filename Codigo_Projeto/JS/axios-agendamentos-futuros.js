document.addEventListener('DOMContentLoaded', carregarAgendamentosFuturos);

async function carregarAgendamentosFuturos() {
    const idCliente = localStorage.getItem('idClienteLogado'); 

    if (!idCliente) {
        console.error("Cliente não logado. Não é possível buscar agendamentos.");
        document.querySelector('.meus-agendamentos .cards').innerHTML = '<p>Faça login para ver seus agendamentos.</p>';
        return;
    }

    try {
        const url = `http://localhost:3000/cliente/${idCliente}/agendamentos-futuros`;
        const responseFuturos = await axios.get(url);
        const agendamentos = responseFuturos.data;
        
        renderizarAgendamentos(agendamentos);

    } catch (erro) {
        console.error("Erro ao carregar agendamentos:", erro);
        document.querySelector('.meus-agendamentos .cards').innerHTML = '<p>Erro ao carregar agendamentos. Verifique o servidor.</p>';
    }
}

function toggleModal() {
    const modal = document.getElementById('modalDados');
    modal.classList.toggle('ativo'); 
}

async function atualizarDadosUsuario() {
    const idCliente = localStorage.getItem('idClienteLogado'); 
    if (!idCliente) {
        console.error("Não é possível atualizar: cliente não logado.");
        return;
    }
    
    const nome = document.getElementById('nome').value;
    const dataNascimento = document.getElementById('data-nascimento').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const senha = document.getElementById('password').value;

    const dadosAtualizados = { 
        nome: nome,
        data_nascimento: dataNascimento,
        telefone: telefone,
        email: email,
        senha: senha 
    };

    try {
        const url = `http://localhost:3000/atualizar/${idCliente}`;
        const response = await axios.patch(url, dadosAtualizados);

        if (response.status === 200) {
            console.log("Dados atualizados com sucesso!");
            toggleModal();
        }
    } catch (erro) {
        console.error("Erro ao atualizar dados:", erro.response?.data?.erro || erro.message);
    }
}

function salvarDados(event) {
    event.preventDefault(); 
    atualizarDadosUsuario();
}