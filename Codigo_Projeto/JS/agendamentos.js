document.addEventListener('DOMContentLoaded', () => {

    // ---------- Inicializa containers ----------
    const containerFuncionarios = document.getElementById('funcionarios-container');
    if (containerFuncionarios) containerFuncionarios.style.display = 'none';

    // ---------- Seleção de unidade ----------
    const unidades = document.querySelectorAll('.unidade-card');
    const containerDura = document.getElementById('conteudo-selecionado');

    unidades.forEach(card => {
        card.addEventListener('click', () => {
            const idUnidade = parseInt(card.getAttribute('data-id'), 10);
            localStorage.setItem('unidadeSelecionada', idUnidade);
            console.log("Unidade selecionada:", idUnidade);

            if (containerDura) containerDura.style.display = 'block';

            unidades.forEach(c => c.classList.remove('ativo'));
            card.classList.add('ativo');
        });
    });

    // ---------- Mostra serviço selecionado ----------
    const servicosSelecionados = JSON.parse(localStorage.getItem('servicoSelecionado'));
    if (servicosSelecionados && servicosSelecionados.length > 0) {
        const servico = servicosSelecionados[0];
        const containerNomeServico = document.querySelector('.nome-servico');

        const h2 = document.createElement('h2');
        h2.textContent = servico.nome_servico;
        h2.classList.add('titulo-servico');
        containerNomeServico.appendChild(h2);

        const img = document.createElement('img');
        const nomeImagem = servico.nome_servico.toLowerCase().replace(/\s+/g, '-') + '.jpg';
        img.src = `../assets/Serviços/${nomeImagem}`;
        img.alt = servico.nome_servico;
        img.classList.add('imagem-servico');
        containerNomeServico.appendChild(img);
    }

    // ---------- Seleção de duração ----------
    const containerDuracao = document.querySelector('.duration-group');
    if (containerDuracao && servicosSelecionados) {
        containerDuracao.innerHTML = '';
        const precos = Array.isArray(servicosSelecionados) ? servicosSelecionados : [servicosSelecionados];

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
                precos.forEach(otherItem => {
                    const otherRadio = document.getElementById(`dur${otherItem.duracao}`);
                    const otherLabel = document.querySelector(`label[for='dur${otherItem.duracao}']`);
                    if (otherRadio !== radio) {
                        otherRadio.disabled = true;
                        otherLabel.style.pointerEvents = 'none';
                        otherLabel.style.opacity = '0.6';
                    }
                });

                const calendario = document.getElementById('form-calendario');
                if (calendario) calendario.style.display = 'block';

                const containerPai = document.getElementById('conteudo-selecionado');
                if (containerPai) containerPai.style.display = 'block';
            });

            containerDuracao.appendChild(radio);
            containerDuracao.appendChild(label);
        });
    }

    // ---------- Seleção de data ----------
    const inputData = document.getElementById('data-agendamento');
    if (inputData) {
        inputData.addEventListener('change', async () => {
            const dataSelecionada = inputData.value;
            if (!dataSelecionada) return;

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
                return;
            }

            const diaSemana = dataInput.getDay() + 1;
            if (diaSemana == 8) { diaSemana = 0; }
            console.log(diaSemana)
            const unidadeSelecionada = localStorage.getItem('unidadeSelecionada');
            if (!servicosSelecionados || !unidadeSelecionada) return;

            const idServico = Array.isArray(servicosSelecionados) ? servicosSelecionados[0].id_servico : servicosSelecionados.id_servico;

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
                            if (div.classList.contains('selecionado')) return;

                            document.querySelectorAll('.funcionario-item').forEach(f => f.classList.remove('selecionado'));
                            div.classList.add('selecionado');
                            localStorage.setItem('funcionarioSelecionado', func.id_funcionario);

                            document.querySelectorAll('.funcionario-item').forEach(f => {
                                if (f !== div) {
                                    f.style.pointerEvents = 'none';
                                    f.style.opacity = '0.6';
                                }
                            });

                            if (inputData) {
                                inputData.disabled = true;
                                inputData.style.opacity = '0.6';
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
                                    msg.classList.add('sem-horarios-msg');
                                    containerHorarios.appendChild(msg);
                                    requestAnimationFrame(() => msg.classList.add('show'));
                                } else {
                                    horarios.forEach(h => {
                                        const btn = document.createElement('button');
                                        btn.classList.add('horario-btn', 'btn-horario');
                                        btn.textContent = `${h.inicio} - ${h.fim}`;

                                        btn.addEventListener('click', () => {
                                            botoesContainer.querySelectorAll('.btn-horario').forEach(b => b.classList.remove('selecionado'));
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
    }

    // ---------- Botão agendar ----------
    const btnAgendar = document.getElementById('btn-agendar');
    if (btnAgendar) {
        btnAgendar.addEventListener('click', async () => {
            const servico = JSON.parse(localStorage.getItem('servicoSelecionado'));
            const unidade = localStorage.getItem('unidadeSelecionada');
            const horario = localStorage.getItem('horarioSelecionado');
            const idFuncionario = localStorage.getItem('funcionarioSelecionado');
            const data = document.getElementById('data-agendamento').value;
            const idCliente = localStorage.getItem('idClienteLogado');
            const duracaoSelecionada = document.querySelector('input[name="duracao"]:checked')?.value;

            if (!servico || !unidade || !horario || !idFuncionario || !data || !duracaoSelecionada) {
                mostrarAlertaBootstrap("Faltam dados para agendar!", "danger", 3000);
                return;
            }

            const agendamentoData = {
                id_cliente: idCliente,
                id_servico: Array.isArray(servico) ? servico[0].id_servico : servico.id_servico,
                id_unidade: unidade,
                id_funcionario: idFuncionario,
                data_agendamento: data,
                duracao: duracaoSelecionada,
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
                mostrarAlertaBootstrap("Agendamento realizado com sucesso!", "success", 3000);

                // ---------- Verificação de promoção ----------
                try {
                    const duracaoMin = duracaoParaMinutos(duracaoSelecionada);
                    const temPromo = await verificarPromocao(idFuncionario, data, horario, duracaoMin);

                    if (temPromo) {
                        console.log("🎉 Promoção disponível!");
                        abrirModalPromocao(); // função do modal
                    } else {
                        console.log("Sem promoção disponível.");
                    }
                } catch (e) {
                    console.error("Erro ao verificar promoção:", e);
                }
            } catch (erro) {
                console.error("Erro no POST de agendamento:", erro);
                mostrarAlertaBootstrap("Erro ao criar agendamento.", "danger", 3000);
            }
        });
    }

});

// ---------- Funções auxiliares ----------

async function verificarPromocao(funcionario, data, inicio, duracao) {
    // Log dos parâmetros recebidos
    console.log("🔹 verificarPromocao chamada com:");
    console.log("   Funcionário:", funcionario);
    console.log("   Data:", data);
    console.log("   Início:", inicio);
    console.log("   Duração em minutos:", duracao);

    // Monta a URL e log
    const url = `http://localhost:3000/promocao?funcionario=${funcionario}&data=${data}&inicio=${inicio}&duracao=${duracao}`;
    console.log("🔗 URL chamada:", url);

    try {
        const resp = await fetch(url);

        // Log do status HTTP
        console.log("📤 Status da resposta:", resp.status);

        if (!resp.ok) {
            console.error("❌ Erro ao consultar promoção:", resp.statusText);
            return false;
        }

        const json = await resp.json();

        // Log da resposta completa do backend
        console.log("📥 Resposta JSON da promoção:", json);

        // Log do valor que será retornado
        console.log("✅ Promoção disponível?", json.promocao === true);

        return json.promocao === true;
    } catch (erro) {
        console.error("💥 Erro na requisição de promoção:", erro);
        return false;
    }
}

function duracaoParaMinutos(duracao) {
    if (!duracao) return 0;
    if (duracao.includes(':')) {
        const [h, m] = duracao.split(':').map(Number);
        return h * 60 + m;
    }
    return Number(duracao); // já é minutos
}

async function verificarPromocao(funcionario, data, inicio, duracao) {
    // Log dos parâmetros recebidos
    console.log("🔹 verificarPromocao chamada com:");
    console.log("   Funcionário:", funcionario);
    console.log("   Data:", data);
    console.log("   Início:", inicio);
    console.log("   Duração em minutos:", duracao);

    // Converte a data para dia da semana (0=domingo, 1=segunda, ...)
    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay() + 1;
    if (diaSemana == 8) { diaSemana = 0; }
    console.log("📅 Dia da semana calculado:", diaSemana);

    // Monta a URL e log
    const url = `http://localhost:3000/promocao?funcionario=${funcionario}&diaSemana=${diaSemana}&inicio=${inicio}&duracao=${duracao}`;
    console.log("🔗 URL chamada:", url);

    try {
        const resp = await fetch(url);

        // Log do status HTTP
        console.log("📤 Status da resposta:", resp.status);

        if (!resp.ok) {
            console.error("❌ Erro ao consultar promoção:", resp.statusText);
            return false;
        }

        const json = await resp.json();

        // Log da resposta completa do backend
        console.log("📥 Resposta JSON da promoção:", json);

        // Log do valor que será retornado
        console.log("✅ Promoção disponível?", json.promocao === true);

        return json.promocao === true;
    } catch (erro) {
        console.error("💥 Erro na requisição de promoção:", erro);
        return false;
    }
}

function duracaoParaMinutos(duracao) {
    if (!duracao) return 0;
    if (duracao.includes(':')) {
        const [h, m] = duracao.split(':').map(Number);
        return h * 60 + m;
    }
    return Number(duracao);
}


// Abre o modal de promoção
function abrirModalPromocao(texto) {
    const modal = document.getElementById('modal-promocao');
    const p = document.getElementById('promo-texto');
    if (!modal || !p) return;

    p.textContent = texto || "Aproveite a pausa!";
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    const btnOk = document.getElementById('btn-promo-ok');
    btnOk.onclick = () => fecharModalPromocao();
}

// Fecha o modal de promoção
function fecharModalPromocao() {
    const modal = document.getElementById('modal-promocao');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
}

// Exemplo de como chamar após verificar promoção
async function verificarEMostrarPromocao(funcionario, data, inicio, duracao) {
    const promocao = await verificarPromocao(funcionario, data, inicio, duracao);
    if (promocao) {
        abrirModalPromocao("Promoção disponível! Aproveite serviços rápidos!");
    } else {
        console.log("Sem promoção disponível.");
    }
}
