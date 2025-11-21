console.log("JS carregado!");

document.addEventListener('DOMContentLoaded', () => {
    carregarAgendamentosFuturos();
    carregarAgendamentosHistoricos();
});


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
            const [h, m] = ag.duracao.split(':').map(Number);
            duracaoFormatada = h * 60 + m;
        }

        const nomeServico = ag.nome_servico || ag.tipo_servico;
        const nomeProfissional = ag.nome_colaborador || ag.nome_profissional;
        const valor = ag.valor || ag.preco;

        let nomeArquivoServico = nomeServico.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
            .replace(/\s+/g, "-");

        let imagemServico = `../assets/serviços/${nomeArquivoServico}.jpg`;

        const card = document.createElement('div');
        card.classList.add('card-agendamento');

        card.innerHTML = `
            <img src="${imagemServico}" alt="${nomeServico}" class="img-servico" onerror="this.src='../assets/profissionais/imagem-generica.png'">
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

document.addEventListener('click', async (event) => {
    if (event.target.classList.contains('btn-cancelar')) {

        const idAgendamento = event.target.getAttribute('data-id');

        mostrarConfirmacao(
            "Tem certeza que deseja cancelar este agendamento?",
            async () => { 
                try {
                    const url = `http://localhost:3000/agendamento/${idAgendamento}/cancelar`;
                    const response = await axios.patch(url);

                    if (response.status === 200) {
                        mostrarAlertaBootstrap("Agendamento cancelado!", "success", 3000);
                        carregarAgendamentosFuturos(); 
                    }
                } catch (erro) {
                    mostrarAlertaBootstrap("Erro ao cancelar o agendamento.", "danger", 3000);
                    console.error('Erro ao cancelar o agendamento:', erro);
                }
            },
            () => {
            }
        );
    }
});
