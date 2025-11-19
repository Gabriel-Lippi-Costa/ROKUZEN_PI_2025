// 🔹 Esconde o container de funcionários no início
document.addEventListener('DOMContentLoaded', () => {
    const containerFuncionarios = document.getElementById('funcionarios-container');
    if (containerFuncionarios) {
        containerFuncionarios.style.display = 'none';
    }
});

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
        radio.classList.add('radio-duracao');

        const label = document.createElement('label');
        label.classList.add('chip', 'label-duracao');
        label.setAttribute('for', `dur${item.duracao}`);
        label.textContent = `${item.duracao} min - R$ ${parseFloat(item.valor).toFixed(2)}`;
        radio.addEventListener('change', () => {
            // desabilita todos os outros radios imediatamente
            precos.forEach(otherItem => {
                const otherRadio = document.getElementById(`dur${otherItem.duracao}`);
                const otherLabel = document.querySelector(`label[for='dur${otherItem.duracao}']`);
                if (otherRadio !== radio) {
                    otherRadio.disabled = true;
                    otherLabel.style.pointerEvents = 'none';
                    otherLabel.style.opacity = '0.6';
                }
            });

            // mostra calendário e container pai
            const calendario = document.getElementById('form-calendario');
            if (calendario) calendario.style.display = 'block';

            const containerPai = document.getElementById('conteudo-selecionado');
            if (containerPai) containerPai.style.display = 'block';
        });

        // Adiciona os elementos ao container
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

        const containerFuncionarios = document.getElementById('funcionarios-container');
        containerFuncionarios.style.display = 'flex';
        containerFuncionarios.innerHTML = '';


        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataInput = new Date(dataSelecionada);
        if (dataInput < hoje) {
            const msg = document.createElement('div');
            msg.classList.add('sem-funcionarios-msg');
            msg.textContent = 'Não é possível selecionar uma data passada.';
            containerFuncionarios.appendChild(msg);
            requestAnimationFrame(() => msg.classList.add('show'));
            return; // sai do listener, não busca funcionários
        }

        const diaSemana = new Date(dataSelecionada).getDay();
        const dadosServico = JSON.parse(localStorage.getItem('servicoSelecionado'));
        const unidadeSelecionada = localStorage.getItem('unidadeSelecionada');

        if (!dadosServico || !unidadeSelecionada) return;



        const idServico = Array.isArray(dadosServico) ? dadosServico[0].id_servico : dadosServico.id_servico;

        try {
            const resposta = await fetch(`http://localhost:3000/profissionais?id_servico=${idServico}&id_unidade=${encodeURIComponent(unidadeSelecionada)}&diaSemana=${diaSemana}`);
            const funcionarios = await resposta.json();

            containerFuncionarios.innerHTML = '';

            const titulo = document.createElement('h2');
            titulo.classList.add('selecionar-profissional');
            titulo.textContent = 'Escolha um profissional';
            containerFuncionarios.appendChild(titulo);

            const areaCards = document.createElement('div');
            areaCards.classList.add('funcionarios-cards');
            containerFuncionarios.appendChild(areaCards);

            if (funcionarios.length === 0) {
                const msg = document.createElement('div');
                msg.classList.add('sem-funcionarios-msg');
                msg.textContent = 'Nenhum funcionário disponível nesse dia.';
                containerFuncionarios.appendChild(msg);
                requestAnimationFrame(() => msg.classList.add('show'));
            } else {
                funcionarios.forEach(func => {
                    const div = document.createElement('div');
                    div.classList.add('funcionario-item');
                    div.setAttribute('data-id', func.id_funcionario);

                    const img = document.createElement('img');
                    img.src = "../assets/profissionais/imagem-generica.png";
                    img.alt = func.nome_funcionario;
                    img.classList.add('thumb-funcionario');

                    const nome = document.createElement('h3');
                    nome.textContent = func.nome_funcionario;

                    div.appendChild(img);
                    div.appendChild(nome);

                    div.addEventListener('click', async () => {
                        if (div.classList.contains('selecionado')) return; // não permite mudar após selecionar

                        document.querySelectorAll('.funcionario-item')
                            .forEach(f => f.classList.remove('selecionado'));

                        div.classList.add('selecionado');
                        localStorage.setItem('funcionarioSelecionado', func.id_funcionario);

                        document.querySelectorAll('.funcionario-item').forEach(f => {
                            if (f !== div) {
                                f.style.pointerEvents = 'none';   // não clicável
                                f.style.opacity = '0.6';          // efeito visual de desativado
                            }
                        });

                        // 🔹 Desabilita o input de data
                        const inputData = document.getElementById('data-agendamento');
                        if (inputData) {
                            inputData.disabled = true;
                            inputData.style.opacity = '0.6'; // efeito visual opcional
                        }

                        document.querySelectorAll('.unidade-card').forEach(card => {
                            card.style.pointerEvents = 'none';
                            card.style.opacity = '0.9';
                        });

                        const duracaoSelecionada = document.querySelector('input[name="duracao"]:checked')?.value;

                        try {
                            const respostaHorarios = await fetch(
                                `http://localhost:3000/horarios?funcionario=${func.id_funcionario}&data=${dataSelecionada}&diaSemana=${diaSemana}&duracao=${duracaoSelecionada}`
                            );
                            if (!respostaHorarios.ok) throw new Error("Erro ao buscar horários.");

                            const horarios = await respostaHorarios.json();
                            const containerHorarios = document.getElementById('horarios-container');
                            if (!containerHorarios) return;

                            containerHorarios.innerHTML = '';

                            const tituloHorarios = document.createElement('h2');
                            tituloHorarios.textContent = 'Escolha um horário';
                            tituloHorarios.classList.add('selecionar-horario');
                            containerHorarios.appendChild(tituloHorarios);

                            const botoesContainer = document.createElement('div');
                            botoesContainer.classList.add('botoes-horarios');
                            containerHorarios.appendChild(botoesContainer);

                            if (horarios.length === 0) {
                                const msg = document.createElement('div');
                                msg.textContent = 'Nenhum horário disponível nesse dia.';
                                msg.classList.add('sem-horarios-msg'); // nova classe
                                containerHorarios.appendChild(msg);
                                requestAnimationFrame(() => msg.classList.add('show')); // animação
                            } else {
                                horarios.forEach(h => {
                                    const btn = document.createElement('button');
                                    btn.classList.add('horario-btn', 'btn-horario');
                                    btn.textContent = `${h.inicio} - ${h.fim}`;

                                    btn.addEventListener('click', () => {
                                        botoesContainer.querySelectorAll('.btn-horario')
                                            .forEach(b => b.classList.remove('selecionado'));

                                        btn.classList.add('selecionado');
                                        localStorage.setItem('horarioSelecionado', h.inicio);

                                        const btnAgendar = document.getElementById('btn-agendar');
                                        if (btnAgendar) btnAgendar.style.display = 'block';
                                    });

                                    botoesContainer.appendChild(btn);
                                });
                            }
                        } catch (erroHorarios) {
                            console.error("Erro ao buscar horários:", erroHorarios);
                        }
                    });

                    areaCards.appendChild(div);
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

const unidades = document.querySelectorAll('.unidade-card');

unidades.forEach(card => {
    card.addEventListener('click', () => {
        unidades.forEach(c => c.classList.remove('ativo'));
        card.classList.add('ativo');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const servicosSelecionados = JSON.parse(localStorage.getItem('servicoSelecionado'));

    if (servicosSelecionados && servicosSelecionados.length > 0) {
        const servico = servicosSelecionados[0];
        const containerNomeServico = document.querySelector('.nome-servico');

        // Cria o H2 com o nome do serviço
        const h2 = document.createElement('h2');
        h2.textContent = servico.nome_servico;
        h2.classList.add('titulo-servico'); // ✅ adiciona classe
        containerNomeServico.appendChild(h2);

        // Cria a imagem do serviço
        const img = document.createElement('img');
        const nomeImagem = servico.nome_servico.toLowerCase().replace(/\s+/g, '-') + '.jpg';
        img.src = `../assets/Serviços/${nomeImagem}`;
        img.alt = servico.nome_servico;
        img.classList.add('imagem-servico'); // ✅ adiciona classe
        containerNomeServico.appendChild(img);
    } else {
        console.error('Nenhum serviço encontrado no localStorage:', servicosSelecionados);
    }
});
