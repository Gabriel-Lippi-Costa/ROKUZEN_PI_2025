document.addEventListener('DOMContentLoaded', carregarAgendamentosFuturos);

// Função para buscar os agendamentos
async function carregarAgendamentosFuturos() {
    // ⚠️ CRÍTICO: O valor é lido do LocalStorage. A chave 'idClienteLogado' deve ser
    // definida no script da página de login (autenticacao.html) ao logar com sucesso.
    const idCliente = localStorage.getItem('idClienteLogado'); 

    // Se não houver ID logado, pare a execução.
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

// Função para injetar o HTML na tela
function renderizarAgendamentos(agendamentos) {
    const container = document.querySelector('.meus-agendamentos .cards');
    // Limpa o conteúdo para evitar duplicidade
    container.innerHTML = ''; 

    if (agendamentos.length === 0) {
        container.innerHTML = '<p>Você não possui agendamentos futuros.</p>';
        return;
    }
    
    // Mapeia os dados recebidos para o HTML (use as classes que você já tem)
    const cardsHTML = agendamentos.map(ag => {
        // Formata a data e hora do DB (ex: "2025-10-30T13:30:00.000Z")
        const dataAgendamento = new Date(ag.data_agendamento);
        const dataFormatada = dataAgendamento.toLocaleDateString('pt-BR');
        const horaFormatada = dataAgendamento.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        
        // Formata a duração para HH:MM
        const duracaoFormatada = ag.duracao.substring(0, 5); 

        return `
            <section class="card" data-id="${ag.id_agendamento}">
                <section class="lado-imagem">
                    <img src="${ag.imagem_colaborador || '../assets/Profissionais/default.jpeg'}" alt="Foto do profissional" onerror="this.onerror=null; this.src='../assets/Profissionais/default.jpeg';">
                </section>
                <section class="lado-dados">
                    <p><strong>${dataFormatada} ${horaFormatada}</strong></p>
                    <p>${ag.nome_servico} - ${duracaoFormatada}</p>
                    <p>${ag.nome_colaborador}</p>
                    <p><strong>${ag.valor}</strong></p>
                    <p><a href="#" onclick="cancelarAgendamento(${ag.id_agendamento}); return false;">Cancelar agendamento</a></p>
                </section>
            </section>
        `;
    }).join('');

    container.innerHTML = cardsHTML;
}

// Implementação da função para cancelar agendamento
async function cancelarAgendamento(idAgendamento) {
    // Você precisa de uma rota PATCH no backend que atualize o status para 'cancelado'.
    const urlCancelamento = `http://localhost:3000/agendamento/${idAgendamento}`;
    
    try {
        console.log(`Tentando cancelar agendamento ID: ${idAgendamento}`);
        
        // Simulação do PATCH (seu backend precisa ter a rota /agendamento/:id configurada)
        const response = await axios.patch(urlCancelamento, { status_agendamento: 'cancelado' }); 
        
        if (response.status === 200) {
            console.log(`Agendamento ${idAgendamento} cancelado com sucesso.`);
            carregarAgendamentosFuturos(); 
        }
    } catch (erro) {
        console.error("Erro ao cancelar agendamento:", erro);
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