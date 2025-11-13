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

function renderizarAgendamentos(agendamentos) {
    const container = document.querySelector('.meus-agendamentos .cards');
    container.innerHTML = '';

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

        let duracaoFormatada = ag.duracao;

        if (typeof ag.duracao === 'string' && ag.duracao.includes(':')) {
            const parts = ag.duracao.split(':').map(Number);
            if (parts.length === 3) {
                const [h, m] = parts;
                if (h >= 24) {
                    duracaoFormatada = h;
                } else {
                    duracaoFormatada = h * 60 + m;
                }
            } else {
                duracaoFormatada = Number(parts[0]) || ag.duracao;
            }
        }

        const card = document.createElement('div');
        card.classList.add('card-agendamento');

        card.innerHTML = `
            <img src="${ag.imagem_colaborador || '../IMG/sem-foto.png'}" alt="${ag.nome_colaborador}">
            <div class="card">
                <h3>${ag.nome_servico}</h3>
                <p><strong>Profissional:</strong> ${ag.nome_colaborador}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${horaFormatada}</p>
                <p><strong>Duração:</strong> ${duracaoFormatada} min</p>
                <p><strong>Valor:</strong> ${ag.valor || 'R$ 0,00'}</p>
                <button class="btn-cancelar" data-id="${ag.id_agendamento}">Cancelar</button>
            </div>
        `;

        container.appendChild(card);
    });
}function renderizarAgendamentosHistoricos(agendamentos) {
    const container = document.querySelector('.meu-historico .cards');
    container.innerHTML = '';

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = '<p class="mensagem-vazia">Você não possui agendamentos passados.</p>';
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

        let duracaoFormatada = ag.duracao;
        if (typeof ag.duracao === 'string' && ag.duracao.includes(':')) {
            const parts = ag.duracao.split(':').map(Number);
            if (parts.length === 3) {
                const [h, m] = parts;
                duracaoFormatada = h * 60 + m; // total em minutos
            } else {
                duracaoFormatada = Number(parts[0]) || ag.duracao;
            }
        }

        const card = document.createElement('div');
        card.classList.add('card-agendamento'); // MESMA CLASSE DO FUTURO
      card.innerHTML = `
    <img src="${ag.imagem_colaborador || '../IMG/sem-foto.png'}" alt="${ag.nome_profissional}">
    <div class="card">
        <h3>${ag.tipo_servico}</h3>
        <p><strong>Profissional:</strong> ${ag.nome_profissional}</p>
        <p><strong>Data:</strong> ${dataFormatada}</p>
        <p><strong>Horário:</strong> ${horaFormatada}</p>
        <p><strong>Duração:</strong> ${duracaoFormatada} min</p>
        <p><strong>Valor:</strong> ${ag.preco || 'R$ 0,00'}</p>
    </div>
`;

        container.appendChild(card);
    });
}
