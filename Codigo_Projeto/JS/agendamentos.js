document.addEventListener('DOMContentLoaded', () => {
    const unidades = document.querySelectorAll('.unidade-card');
    const containerDura = document.getElementById('conteudo-selecionado');

    unidades.forEach(card => {
        card.addEventListener('click', () => {
            const idUnidade = parseInt(card.getAttribute('data-id'), 10);
            localStorage.setItem('unidadeSelecionada', idUnidade);
            console.log("Unidade selecionada:", idUnidade);

            // Mostra o container de duração apenas depois de clicar
            if (containerDura) containerDura.style.display = 'block';
        });
    });
});



document.addEventListener('DOMContentLoaded', () => {
    // Exemplo: dados que você salvou no localStorage após clicar no botão
    const dadosServico = JSON.parse(localStorage.getItem('servicoSelecionado'));
    const idCliente = localStorage.getItem('usuarioId');
    if (!dadosServico) return;

    const container = document.querySelector('.duration-group');
    if (!container) return;

    container.innerHTML = ''; // limpa caso haja algo

    // Se o JSON for um array
    const precos = Array.isArray(dadosServico) ? dadosServico : [dadosServico];

    precos.forEach(item => {
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'duracao';
        radio.id = `dur${item.duracao}`;
        radio.value = item.duracao;

        const label = document.createElement('label');
        label.classList.add('chip');
        label.setAttribute('for', `dur${item.duracao}`);
        label.textContent = `${item.duracao} min - R$ ${parseFloat(item.valor).toFixed(2)}`;

        // Evento ao selecionar
        radio.addEventListener('change', () => {
            console.log("Duração selecionada:", item.duracao);
            const calendario = document.getElementById('form-calendario');
            if (calendario) calendario.style.display = 'block';

            // Mostrar os radios (ou container) somente quando necessário
            const containerPai = document.getElementById('conteudo-selecionado');
            if (containerPai) containerPai.style.display = 'block';
        });

        container.appendChild(radio);
        container.appendChild(label);
    });

});

document.addEventListener('DOMContentLoaded', () => {
    const inputData = document.getElementById('data-agendamento');
    if (!inputData) {
        console.warn("Input de data não encontrado!");
        return;
    }

    inputData.addEventListener('change', async () => {
        const dataSelecionada = inputData.value;
        if (!dataSelecionada) {
            console.log("Nenhuma data selecionada.");
            return;
        }

        const diaSemana = new Date(dataSelecionada).getDay();
        const dadosServico = JSON.parse(localStorage.getItem('servicoSelecionado'));
        const unidadeSelecionada = localStorage.getItem('unidadeSelecionada');

        if (!dadosServico || !unidadeSelecionada) return;

        const idServico = Array.isArray(dadosServico) ? dadosServico[0].id_servico : dadosServico.id_servico;

        console.log("📤 Dados que seriam enviados ao backend:", {
            idServico,
            idUnidade: unidadeSelecionada,
            diaSemana,
            dataSelecionada
        });

        try {
            const resposta = await fetch(`http://localhost:3000/profissionais?id_servico=${idServico}&id_unidade=${encodeURIComponent(unidadeSelecionada)}&diaSemana=${diaSemana}`);
            const funcionarios = await resposta.json();
            console.log("📥 Funcionários recebidos do backend:", funcionarios);

            const containerFuncionarios = document.getElementById('funcionarios-container');
            if (!containerFuncionarios) return;

            containerFuncionarios.innerHTML = '';

            if (funcionarios.length === 0) {
                containerFuncionarios.textContent = 'Nenhum funcionário disponível nesse dia.';
            } else {
                funcionarios.forEach(func => {
                    const div = document.createElement('div');
                    div.classList.add('funcionario-item');

                    const img = document.createElement('img');
                    img.src = "../assets/profissionais/eric-rokuzen.jpeg";
                    img.alt = func.nome_funcionario;
                    img.classList.add('thumb-funcionario');

                    const nome = document.createElement('h3');
                    nome.textContent = func.nome_funcionario;

                    div.appendChild(img);
                    div.appendChild(nome);

                    div.addEventListener('click', async () => {
                        const idFuncionario = func.id_funcionario;
                        localStorage.setItem('funcionarioSelecionado', idFuncionario);
                        const dataSelecionada = inputData.value;
                        const duracaoSelecionada = document.querySelector('input[name="duracao"]:checked')?.value;


                        try {
                            console.log(`http://localhost:3000/horarios?funcionario=${idFuncionario}&data=${dataSelecionada}&diaSemana=${diaSemana}&duracao=${duracaoSelecionada}`);

                            const resposta = await fetch(`http://localhost:3000/horarios?funcionario=${idFuncionario}&data=${dataSelecionada}&diaSemana=${diaSemana}&duracao=${duracaoSelecionada}`);
                            if (!resposta.ok) throw new Error("Erro ao buscar horários.");

                            const horarios = await resposta.json();
                            console.log("Horários disponíveis:", horarios);

                            const containerHorarios = document.getElementById('horarios-container');
                            if (!containerHorarios) {
                                console.error("Container de horários não encontrado!");
                                return;
                            }
                            containerHorarios.innerHTML = '';

                            if (horarios.length === 0) {
                                containerHorarios.textContent = 'Nenhum horário disponível nesse dia.';
                            } else {
                                horarios.forEach(h => {
                                    const btn = document.createElement('button');
                                    btn.classList.add('horario-btn');
                                    btn.textContent = `${h.inicio} - ${h.fim}`;

                                    btn.addEventListener('click', () => {
                                        // Armazena o horário selecionado
                                        localStorage.setItem('horarioSelecionado', h.inicio);

                                        // Destaca o botão clicado
                                        document.querySelectorAll('.horario-btn').forEach(b => b.classList.remove('selecionado'));
                                        btn.classList.add('selecionado');

                                        // Mostra o botão de agendar
                                        const btnAgendar = document.getElementById('btn-agendar');
                                        if (btnAgendar) btnAgendar.style.display = 'inline-block';
                                    });

                                    containerHorarios.appendChild(btn);
                                });
                            }
                        } catch (erro) {
                            console.error("Erro ao buscar horários:", erro);
                        }
                    });

                    containerFuncionarios.appendChild(div);
                });
            }
        } catch (erro) {
            console.error("Erro no fetch de profissionais:", erro);
        }
    });
});





// Botão Agendar
document.getElementById('btn-agendar').addEventListener('click', async () => {
    const servico = JSON.parse(localStorage.getItem('servicoSelecionado'));
    const unidade = localStorage.getItem('unidadeSelecionada');
    const horario = localStorage.getItem('horarioSelecionado');
    const idFuncionario = localStorage.getItem('funcionarioSelecionado'); // salvar ao clicar no funcionário
    const data = document.getElementById('data-agendamento').value;
    const idCliente = localStorage.getItem('idClienteLogado');
    const duracaoSelecionada = document.querySelector('input[name="duracao"]:checked')?.value;
    console.log("servicos", servico)
    console.log("unidade", unidade)
    console.log("funcionario", idFuncionario)
    console.log("horario", horario)
    console.log("data", data)

    if (!servico || !unidade || !horario || !idFuncionario || !data) {
        alert("Faltam dados para agendar!");
        return;
    }
 const agendamentoData = {
        id_cliente: idCliente, // pega do localStorage ou sessão
    id_servico: Array.isArray(servico) ? servico[0].id_servico : servico.id_servico,
    id_unidade: unidade,
    id_funcionario: idFuncionario,
    data_agendamento: data,
    duracao: duracaoSelecionada,  // em HH:MM:SS
    horario 
    };

    console.log("📤 Dados que serão enviados ao backend:", agendamentoData);

    try {
        const resposta = await fetch('http://localhost:3000/agendamentos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(agendamentoData)
        });

        if (!resposta.ok) throw new Error("Erro ao criar agendamento");

        const resultado = await resposta.json();
        console.log("Agendamento criado:", resultado);
        alert("Agendamento realizado com sucesso!");
    } catch (erro) {
        console.error("Erro no POST de agendamento:", erro);
        alert("Erro ao criar agendamento.");
    }
});