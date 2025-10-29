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

function renderizarAgendamentos(agendamentos) {
    const container = document.querySelector('.meus-agendamentos .cards');
    container.innerHTML = ''; // limpa o conteúdo anterior

    if (agendamentos.length === 0) {
        container.innerHTML = '<p>Você não possui agendamentos futuros.</p>';
        return;
    }

    agendamentos.forEach(ag => {
        const data = new Date(ag.data_agendamento);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        const horaFormatada = data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const card = document.createElement('div');
        card.classList.add('card-agendamento');

        card.innerHTML = `
            <img src="${ag.imagem_colaborador || '../IMG/sem-foto.png'}" alt="${ag.nome_colaborador}">
            <div class="card">
                <h3>${ag.nome_servico}</h3>
                <p><strong>Profissional:</strong> ${ag.nome_colaborador}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${horaFormatada}</p>
                <p><strong>Duração:</strong> ${ag.duracao} min</p>
                <p><strong>Valor:</strong> ${ag.valor}</p>
            </div>
        `;

        container.appendChild(card);
    });
}
