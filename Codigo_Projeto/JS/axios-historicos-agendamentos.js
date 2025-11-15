console.log("JS carregado!");

document.addEventListener('DOMContentLoaded', () => {
    carregarAgendamentosFuturos();
    carregarAgendamentosHistoricos();
});

// ===============================
// FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO
// ===============================
function renderizarCards(agendamentos, containerSelector, tipo = 'futuro') {
    const container = document.querySelector(containerSelector);

    if (!container) {
        console.error(`Container não encontrado: ${containerSelector}`);
        return;
    }

    container.innerHTML = '';

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = `
            <p class="mensagem-vazia">Nenhum agendamento ${tipo === 'historico' ? 'passado' : 'futuro'} encontrado.</p>`;
        return;
    }

    agendamentos.forEach(ag => {

        // ---- FORMATAR DATA ----
        const data = new Date(ag.data_agendamento);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // ---- FORMATAR HORA ----
        const horaFormatada = data.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        // ---- FORMATAR DURAÇÃO ----
        let duracaoFormatada = ag.duracao;
        if (typeof ag.duracao === 'string' && ag.duracao.includes(':')) {
            const [h, m] = ag.duracao.split(':').map(Number);
            duracaoFormatada = h * 60 + m;
        }

        // ---- CAMPOS DIFERENTES ENTRE ROTAS ----
        const nomeServico = ag.nome_servico || ag.tipo_servico;
        const nomeProfissional = ag.nome_colaborador || ag.nome_profissional;
        const valor = ag.valor || ag.preco;

        // ---- CARD HTML ----
        const card = document.createElement('div');
        card.classList.add('card-agendamento');

        card.innerHTML = `
            <img src="${ag.imagem_colaborador || '../IMG/sem-foto.png'}" alt="${nomeProfissional}">
            <div class="card">
                <h3>${nomeServico}</h3>
                <p><strong>Profissional:</strong> ${nomeProfissional}</p>
                <p><strong>Unidade:</strong> ${ag.unidade || '-'}</p> 
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${horaFormatada}</p>
                <p><strong>Duração:</strong> ${duracaoFormatada} min</p>
                <p><strong>Valor:</strong> ${valor || 'R$ 0,00'}</p>
                ${tipo === 'futuro' ? `<button class="btn-cancelar" data-id="${ag.id_agendamento}">Cancelar</button>` : ''}
            </div>
        `;

        container.appendChild(card);
    });
}

// ===================================================
// FUTUROS
// ===================================================
async function carregarAgendamentosFuturos() {
    const idCliente = localStorage.getItem('idClienteLogado');

    if (!idCliente) {
        document.querySelector('.meus-agendamentos .cards').innerHTML =
            '<p>Faça login para ver seus agendamentos futuros.</p>';
        return;
    }

    try {
        const url = `http://localhost:3000/cliente/${idCliente}/agendamentos-futuros`;
        const response = await axios.get(url);

        console.log("FUTUROS RECEBIDOS:", response.data.length);
        console.log("RESPOSTA COMPLETA:", response.data);

        renderizarCards(response.data, '.meus-agendamentos .cards', 'futuro');
    } catch (erro) {
        console.error("Erro ao carregar agendamentos futuros:", erro);
    }
}

// ===================================================
// HISTÓRICO
// ===================================================
async function carregarAgendamentosHistoricos() {
    const idCliente = localStorage.getItem('idClienteLogado');

    if (!idCliente) {
        document.querySelector('.meu-historico .cards').innerHTML =
            '<p>Faça login para ver o histórico.</p>';
        return;
    }

    try {
        const url = `http://localhost:3000/cliente/${idCliente}/agendamentos-historicos`;
        const response = await axios.get(url);

        renderizarCards(response.data, '.meu-historico .cards', 'historico');

    } catch (erro) {
        console.error("Erro ao carregar históricos:", erro);
        document.querySelector('.meu-historico .cards').innerHTML =
            '<p>Erro ao carregar históricos.</p>';
    }
}

// ===================================================
// CANCELAR AGENDAMENTO
// ===================================================
document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-cancelar')) {

        const idAgendamento = event.target.getAttribute('data-id');

        if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

        try {
            const url = `http://localhost:3000/agendamento/${idAgendamento}/cancelar`;
            const response = await axios.patch(url);

            if (response.status === 200) {
                alert('Agendamento cancelado!');
                carregarAgendamentosFuturos(); // atualiza lista
            }
        } catch (erro) {
            alert('Erro ao cancelar o agendamento.');
            console.error('Erro ao cancelar o agendamento:', erro);
        }
    }
});
