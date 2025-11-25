function renderizarCardsFuncionario(agendamentos, containerSelector, tipo = 'futuro') {
    console.log(`renderizarCardsFuncionario chamado para tipo: ${tipo}`);
    console.log('Agendamentos recebidos:', agendamentos);

    const container = document.querySelector(containerSelector);
    if (!container) return;

    container.innerHTML = '';

    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = `<p class="mensagem-vazia">Nenhum agendamento ${tipo === 'historico' ? 'passado' : 'futuro'} encontrado.</p>`;
        console.log('Nenhum agendamento encontrado.');
        return;
    }

    agendamentos.forEach(ag => {
        const data = new Date(ag.data_agendamento);
        const dataFormatada = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
        const horaFormatada = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        let duracaoFormatada = ag.duracao;
        if (typeof ag.duracao === 'string' && ag.duracao.includes(':')) {
            const [h, m] = ag.duracao.split(':').map(Number);
            duracaoFormatada = h * 60 + m;
        }
console.log(ag.nome_cliente)
        const nomeCliente = ag.nome_cliente || '-';
        const nomeServico = ag.nome_servico || ag.tipo_servico || '-';
        const unidade = ag.unidade || '-';
        const valor = ag.valor || ag.preco || 'R$ 0,00';

        const card = document.createElement('div');
        card.classList.add('card-agendamento');

        card.innerHTML = `
            <div class="card">
                <h3>${nomeServico}</h3>
                <p><strong>Cliente:</strong> ${nomeCliente}</p>
                <p><strong>Unidade:</strong> ${unidade}</p>
                <p><strong>Data:</strong> ${dataFormatada}</p>
                <p><strong>Horário:</strong> ${horaFormatada}</p>
                <p><strong>Duração:</strong> ${duracaoFormatada} min</p>
                <p><strong>Valor:</strong> ${valor}</p>
            </div>
        `;

        container.appendChild(card);
    });
}

async function carregarAgendamentosFuturosFuncionario(idFuncionario) {
    try {
        const response = await axios.get(`http://localhost:3000/funcionario/${idFuncionario}/agendamentos-futuros`);
        renderizarCardsFuncionario(response.data, '#cards-futuros-funcionario', 'futuro');
    } catch (erro) {
        console.error('Erro ao carregar agendamentos futuros do funcionário:', erro);
    }
}

async function carregarAgendamentosHistoricosFuncionario(idFuncionario) {
    try {
        const response = await axios.get(`http://localhost:3000/funcionario/${idFuncionario}/agendamentos-historicos`);
        renderizarCardsFuncionario(response.data, '#cards-historico-funcionario', 'historico');
    } catch (erro) {
        console.error('Erro ao carregar históricos do funcionário:', erro);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (usuario && usuario.id_funcionario) {
        carregarAgendamentosFuturosFuncionario(usuario.id_funcionario);
        carregarAgendamentosHistoricosFuncionario(usuario.id_funcionario);
    } else {
        console.warn('Nenhum funcionário logado encontrado no localStorage.');
    }
});
