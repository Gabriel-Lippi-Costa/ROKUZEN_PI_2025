document.addEventListener('DOMContentLoaded', () => {
    carregarAgendamentosFuturos();
    carregarAgendamentosHistoricos();
});

async function carregarAgendamentosHistoricos() {
    const idCliente = localStorage.getItem('idClienteLogado');

    if (!idCliente) {
        console.error("Cliente não logado. Não é possível buscar agendamentos históricos.");
        document.querySelector('.meus-agendamentos-historicos .cards').innerHTML = '<p>Faça login para ver seus agendamentos anteriores.</p>';
        return;
    }

    try {
        const url = `http://localhost:3000/cliente/${idCliente}/agendamentos-historicos`;
        const response = await axios.get(url);
        const agendamentos = response.data;

        renderizarAgendamentosHistoricos(agendamentos);

    } catch (erro) {
        console.error("Erro ao carregar agendamentos históricos:", erro);
        document.querySelector('.meus-agendamentos-historicos .cards').innerHTML = '<p>Erro ao carregar agendamentos históricos.</p>';
    }
}

function renderizarAgendamentosHistoricos(agendamentos) {
    const container = document.querySelector('.meus-agendamentos-historicos .cards');
    container.innerHTML = '';

    if (agendamentos.length === 0) {
        container.innerHTML = '<p>Você ainda não possui agendamentos realizados.</p>';
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
