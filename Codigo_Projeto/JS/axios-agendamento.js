const baseURL = 'http://localhost:3000';
let idServicoSelecionado = null;
let idUnidadeSelecionada = null;
let idProfissionalSelecionado = null;

const imagensServicos = {
    'Reflexologia Podal': 'reflexo.jpg',
    'Massagem na Maca': 'maca.jpg',
    'Quick Massage': 'quick.jpg',
    'Auriculoterapia': 'auriculo.jpg'
};

const imagensUnidades = {
    'West Plaza Shopping': 'west3.jpg',
    'Grand Plaza Shopping': 'ribeirao.jpg',
    'Mooca Plaza Shopping': 'mooca.jpg',
    'Golden Square Shopping': 'golden.jpg'
};

const imagensProfissionais = {
    'Brunno': 'foto-nao-disponivel-masculino-rokuzen.jpeg',
    'Adriana': 'imagem-generica.png',
    'Eric': 'eric-rokuzen.jpeg',
    'Suzy': 'imagem-generica.png',
    'Marcelo': 'foto-nao-disponivel-masculino-rokuzen.jpeg'
};

const secaoServico = document.querySelector('.escolher-servico');
const secaoUnidade = document.querySelector('.escolher-unidade');
const secaoDuracao = document.querySelector('.escolher-duracao');
const secaoData = document.querySelector('.escolher-data');
const secaoProfissional = document.querySelector('.escolher-profissional');
const secaoHorario = document.querySelector('.escolher-horario');
const secaoConfirmar = document.querySelector('.confirmar-servico');

const todasEtapas = [
    secaoServico,
    secaoUnidade,
    secaoDuracao,
    secaoData,
    secaoProfissional,
    secaoHorario,
    secaoConfirmar
];

// Função para mostrar apenas a etapa atual
function mostrarProximaEtapa(secaoParaMostrar) {
    if (!secaoParaMostrar) return;
    const indiceAlvo = todasEtapas.indexOf(secaoParaMostrar);

    todasEtapas.forEach((secao, idx) => {
        if (secao) {
            if (idx <= indiceAlvo) secao.classList.remove('etapa-escondida');
            else secao.classList.add('etapa-escondida');
        }
    });
}

// Carrega serviços do servidor
async function carregarServicos() {
    idServicoSelecionado = null;
    idUnidadeSelecionada = null;
    idProfissionalSelecionado = null;

    todasEtapas.slice(1).forEach(secao => secao.classList.add('etapa-escondida'));
    secaoServico.classList.remove('etapa-escondida');

    try {
        const { data } = await axios.get(`${baseURL}/servicos`);
        const container = document.querySelector('.escolher-servico .cards');
        container.innerHTML = '';

        if (!data.length) {
            container.innerHTML = '<p>Nenhum serviço disponível no momento.</p>';
            return;
        }

        data.forEach(servico => {
            const card = document.createElement('section');
            card.classList.add('card');
            const imagem = servico.imagem_servico || imagensServicos[servico.nome_servico] || 'default.jpg';

            card.innerHTML = `
                <section class="parte-de-cima">
                    <img src="../assets/Serviços/${imagem}" alt="${servico.nome_servico}">
                </section>
                <section class="parte-de-baixo">
                    <p class="tipo-massagem">${servico.nome_servico}</p>
                </section>
            `;
            card.onclick = () => {
                container.querySelectorAll('.card.selecionado').forEach(c => c.classList.remove('selecionado'));
                card.classList.add('selecionado');
                selecionarServico(servico.id_servico);
            };
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar serviços:", error);
        document.querySelector('.escolher-servico .cards').innerHTML =
            '<p>Erro ao carregar serviços. Verifique a conexão com o servidor.</p>';
    }
}

// Carrega unidades
async function carregarUnidades() {
    try {
        const { data } = await axios.get(`${baseURL}/unidades`);
        const container = document.querySelector('.escolher-unidade .cards');
        container.innerHTML = '';

        data.forEach(unidade => {
            const card = document.createElement('section');
            card.classList.add('card');
            const imagem = unidade.imagem_unidade || imagensUnidades[unidade.nome_unidade] || 'default.jpg';

            card.innerHTML = `
                <section class="parte-de-cima">
                    <img src="../assets/Unidades/${imagem}" alt="${unidade.nome_unidade}">
                </section>
                <section class="parte-de-baixo">
                    <p class="tipo-massagem">${unidade.nome_unidade}</p>
                </section>
            `;
            card.onclick = () => {
                container.querySelectorAll('.card.selecionado').forEach(c => c.classList.remove('selecionado'));
                card.classList.add('selecionado');
                selecionarUnidade(unidade.id_unidade);
            };
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar unidades:", error);
    }
}

// Carrega profissionais
async function carregarProfissionais(idUnidade, idServico) {
    const containerHorario = document.querySelector('.escolher-horario .duration-group');
    if (containerHorario) containerHorario.innerHTML = '';

    const container = document.querySelector('.escolher-profissional .cards');
    if (!container) return;
    container.innerHTML = 'Carregando profissionais...';

    try {
        const { data } = await axios.get(`${baseURL}/profissionais?id_unidade=${idUnidade}&id_servico=${idServico}`);
        container.innerHTML = '';

        if (!data.length) {
            container.innerHTML = '<p>Nenhum profissional disponível para esta combinação.</p>';
            return;
        }

        data.forEach(prof => {
            const card = document.createElement('section');
            card.classList.add('card');
            const imagem = prof.imagem_colaborador || imagensProfissionais[prof.nome_colaborador] || 'foto-nao-disponivel-masculino-rokuzen.jpeg';

            card.innerHTML = `
                <section class="parte-de-cima">
                    <img src="../assets/Profissionais/${imagem}" alt="${prof.nome_colaborador}">
                </section>
                <section class="parte-de-baixo">
                    <p class="tipo-massagem">${prof.nome_colaborador}</p>
                </section>
            `;
            card.onclick = () => {
                container.querySelectorAll('.card.selecionado').forEach(c => c.classList.remove('selecionado'));
                card.classList.add('selecionado');
                selecionarProfissional(prof.id_colaborador);
            };
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Erro ao carregar profissionais:", error);
        container.innerHTML = '<p>Erro ao buscar profissionais.</p>';
    }
}

// Carrega horários
async function carregarHorarios(dataSelecionada) {
    const usuarioAtual = JSON.parse(localStorage.getItem('usuario'));
    if (!idProfissionalSelecionado || !idUnidadeSelecionada || !usuarioAtual?.id_cliente) {
        return alert('Selecione profissional e unidade corretamente!');
    }

    const container = document.querySelector('.escolher-horario .duration-group');
    if (!container) return;
    container.innerHTML = 'Carregando horários...';

    try {
        const { data } = await axios.get(`${baseURL}/horarios?id_colaborador=${idProfissionalSelecionado}&id_unidade=${idUnidadeSelecionada}&data=${dataSelecionada}`);
        container.innerHTML = '';

        if (data.horarios_disponiveis?.length > 0) {
            data.horarios_disponiveis.forEach(hora => {
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'horario';
                input.id = `hora-${hora.replace(':', '')}`;
                input.value = hora;

                const label = document.createElement('label');
                label.classList.add('chip');
                label.setAttribute('for', input.id);
                label.textContent = hora;

                container.appendChild(input);
                container.appendChild(label);
            });
            document.getElementById('selecionadoHorarioTxt').innerHTML = 'Selecione um horário acima';
        } else {
            container.innerHTML = 'Nenhum horário disponível para esta data.';
        }
    } catch (error) {
        console.error('Erro ao buscar horários:', error);
        container.innerHTML = error.response?.data?.erro || 'Erro ao buscar horários.';
    }
}

// Seleção de serviço/unidade/profissional
function selecionarServico(idServico) {
    idServicoSelecionado = idServico;
    carregarUnidades();
    mostrarProximaEtapa(secaoUnidade);
}

function selecionarUnidade(idUnidade) {
    idUnidadeSelecionada = idUnidade;
    mostrarProximaEtapa(secaoDuracao);
}

function selecionarProfissional(idColaborador) {
    idProfissionalSelecionado = idColaborador;
    const dataSelecionada = document.getElementById('data-servico').value;
    carregarHorarios(dataSelecionada);
    mostrarProximaEtapa(secaoHorario);
}

// Eventos
document.querySelectorAll('input[name="duracao"]').forEach(radio => {
    radio.addEventListener('change', event => {
        document.getElementById('selecionadoTxt').innerHTML = `Selecionado: <strong>${event.target.value} min</strong>`;
        mostrarProximaEtapa(secaoData);
    });
});

document.getElementById('data-servico').addEventListener('change', event => {
    const dataSelecionada = event.target.value;
    if (dataSelecionada) {
        carregarProfissionais(idUnidadeSelecionada, idServicoSelecionado);
        mostrarProximaEtapa(secaoProfissional);
    }
});

secaoHorario.addEventListener('change', event => {
    if (event.target.name === 'horario') {
        const horarioSelecionado = event.target.value;
        document.getElementById('selecionadoHorarioTxt').innerHTML = `Selecionado: <strong>${horarioSelecionado}</strong>`;
        mostrarProximaEtapa(secaoConfirmar);
    }
});

// Agendamento
document.getElementById('botao-agendar').addEventListener('click', async () => {
    const usuarioAtual = JSON.parse(localStorage.getItem('usuario'));
    const idCliente = usuarioAtual?.id_cliente;

    if (!idCliente) {
        alert('Faça login para agendar.');
        const agendamentoPendente = {
            servico: idServicoSelecionado,
            unidade: idUnidadeSelecionada,
            profissional: idProfissionalSelecionado,
            duracao: document.querySelector('input[name="duracao"]:checked')?.value,
            data: document.getElementById('data-servico').value,
            horario: document.querySelector('input[name="horario"]:checked')?.value
        };
        localStorage.setItem('agendamentoPendente', JSON.stringify(agendamentoPendente));
        window.location.href = 'autenticacao.html';
        return;
    }

    const dataSelecionada = document.getElementById('data-servico').value;
    const horarioSelecionado = document.querySelector('input[name="horario"]:checked')?.value;
    const duracao = document.querySelector('input[name="duracao"]:checked')?.value;

    if (!idServicoSelecionado || !idUnidadeSelecionada || !idProfissionalSelecionado || !duracao || !dataSelecionada || !horarioSelecionado) {
        return alert('Por favor, preencha todas as etapas anteriores.');
    }

    const body = {
        servico: idServicoSelecionado,
        unidade: idUnidadeSelecionada,
        profissional: idProfissionalSelecionado,
        duracao,
        data: dataSelecionada,
        horario: horarioSelecionado
    };

    try {
        const { data } = await axios.post(`${baseURL}/agendamento`, { ...body, id_cliente: idCliente });
        alert(data.mensagem || 'Agendamento realizado com sucesso!');
        localStorage.removeItem('agendamentoPendente');
    } catch (error) {
        console.error('❌ Erro ao agendar:', error);
        alert(error.response?.data?.erro || 'Erro ao agendar!');
    }
});

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario?.id_cliente) {
        alert('Faça login antes de agendar!');
        window.location.href = 'autenticacao.html';
        return;
    }
    carregarServicos();
});
