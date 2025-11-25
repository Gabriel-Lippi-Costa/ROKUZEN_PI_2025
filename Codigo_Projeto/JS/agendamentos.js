document.addEventListener('DOMContentLoaded', () => {
    let radiosDuracao;
    let hora;
    const containerFuncionarios = document.getElementById('funcionarios-container');
    if (containerFuncionarios) containerFuncionarios.style.display = 'none';

    
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
                let servicosSelecionados = localStorage.getItem('servicoSelecionado');

                if (servicosSelecionados) {
                    servicosSelecionados = JSON.parse(servicosSelecionados);
                }

                let idServico = Array.isArray(servicosSelecionados)
                    ? servicosSelecionados[0].id_servico
                    : servicosSelecionados.id_servico;


                if (idServico === 5) {
                    const divisao = document.getElementById('divisao-servico');
                    const radioSelecionado = document.querySelector('input[name="duracao"]:checked');

                    if (radioSelecionado) {
                        const label = document.querySelector(`label[for='${radioSelecionado.id}']`);
                        if (label) {
                            const texto = label.textContent;
                            console.log("Label text:", texto);

                            const match = texto.match(/(\d{2}):(\d{2}):(\d{2})/);
                            if (match) {
                                const horas = parseInt(match[1], 10);
                                const minutos = parseInt(match[2], 10);
                                const duracaoEmMinutos = horas * 60 + minutos;
                                console.log("⏱ Duração via label (minutos):", duracaoEmMinutos);
                                hora = duracaoEmMinutos;
                            }
                        }
                    }

                    if (divisao) divisao.style.display = 'flex';

                    iniciarDivisao(hora);

                } else {
                    const divisao = document.getElementById('divisao-servico');
                    if (divisao) divisao.style.display = 'none';
                }
                if (idServico === 6) {
                    const divisao = document.getElementById('divisao-servico2');
                    const radioSelecionado = document.querySelector('input[name="duracao"]:checked');

                    if (radioSelecionado) {
                        const label = document.querySelector(`label[for='${radioSelecionado.id}']`);
                        if (label) {
                            const texto = label.textContent;
                            console.log("Label text:", texto);

                            const match = texto.match(/(\d{2}):(\d{2}):(\d{2})/);
                            if (match) {
                                const horas = parseInt(match[1], 10);
                                const minutos = parseInt(match[2], 10);
                                const duracaoEmMinutos = horas * 60 + minutos;
                                console.log("⏱ Duração via label (minutos):", duracaoEmMinutos);
                                hora = duracaoEmMinutos;
                            }
                        }
                    }

                    if (divisao) divisao.style.display = 'flex';

                    iniciarDivisao2(hora);

                } else {
                    const divisao = document.getElementById('divisao-servico2');
                    if (divisao) divisao.style.display = 'none';
                }

                console.log("⏱ 2", hora);

            });

            containerDuracao.appendChild(radio);
            containerDuracao.appendChild(label);
        });
        radiosDuracao = document.querySelectorAll('input[name="duracao"]');
        console.log("⏱ Duração selecionada:", radiosDuracao);



    }
    const input1 = document.getElementById('parte1');
    const input2 = document.getElementById('parte2');
    const tempoRestante = document.getElementById('tempo-restante');

    function verificarTempoRestante() {
        const valor1 = parseInt(input1.value) || 0;
        const valor2 = parseInt(input2.value) || 0;
        const restante = duracaoSelecionada - (valor1 + valor2);

        tempoRestante.textContent = `Tempo restante: ${restante} min`;

        if (restante <= 0) {
            input1.disabled = true;
            input2.disabled = true;

            radiosDuracao.forEach(radio => {
                if (!radio.checked) {
                    radio.disabled = true;
                    const label = document.querySelector(`label[for='${radio.id}']`);
                    if (label) {
                        label.style.pointerEvents = 'none';
                        label.style.opacity = '0.6';
                    }
                }
            });
        } else {
            input1.disabled = false;
            input2.disabled = false;

            radiosDuracao.forEach(radio => {
                if (!radio.checked) {
                    radio.disabled = false;
                    const label = document.querySelector(`label[for='${radio.id}']`);
                    if (label) {
                        label.style.pointerEvents = 'auto';
                        label.style.opacity = '1';
                    }
                }
            });
        }
    }


    function atualizarDivisao() {
        atualizarDuracaoSelecionada(); 

        let valor1 = parseInt(input1.value) || 0;
        let valor2 = parseInt(input2.value) || 0;

        if (valor1 < 15) valor1 = 15;
        if (valor1 > 35) valor1 = 35;

        const maxValor2 = duracaoSelecionada - valor1;
        if (valor2 > maxValor2) valor2 = maxValor2;
        if (valor2 < 0) valor2 = 0;

        input1.value = valor1;
        input2.value = valor2;

        verificarTempoRestante();
    }

    function atualizarDuracaoSelecionada() {
        const radioSelecionado = document.querySelector('input[name="duracao"]:checked');
        if (radioSelecionado) {
            duracaoSelecionada = parseInt(radioSelecionado.value, 10);
        } else {
            duracaoSelecionada = 0;
        }
    }

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

            let diaSemana = dataInput.getDay() + 1;
            if (diaSemana == 8) { diaSemana = 0; }
            console.log(diaSemana)
            const unidadeSelecionada = localStorage.getItem('unidadeSelecionada');
            if (!servicosSelecionados || !unidadeSelecionada) return;

            let idServico = Array.isArray(servicosSelecionados) ? servicosSelecionados[0].id_servico : servicosSelecionados.id_servico
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
            if (duracaoSelecionada) {
    localStorage.setItem('duracaoSelecionada', duracaoSelecionada);
}

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

                try {
                    const duracaoMin = duracaoParaMinutos(duracaoSelecionada);
                    const temPromo = await verificarPromocao(idFuncionario, data, horario, duracaoMin);

                    if (temPromo) {
                        console.log("🎉 Promoção disponível!");
                        abrirModalPromocao(); 
                    } else {
                        console.log("Sem promoção disponível.");
                        window.location.href = "minha-conta.html";
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


async function verificarPromocao(funcionario, data, inicio, duracao) {
    console.log("🔹 verificarPromocao chamada com:");
    console.log("   Funcionário:", funcionario);
    console.log("   Data:", data);
    console.log("   Início:", inicio);
    console.log("   Duração em minutos:", duracao);

    const url = `http://localhost:3000/promocao?funcionario=${funcionario}&data=${data}&inicio=${inicio}&duracao=${duracao}`;
    console.log("🔗 URL chamada:", url);

    try {
        const resp = await fetch(url);

        console.log("📤 Status da resposta:", resp.status);

        if (!resp.ok) {
            console.error("❌ Erro ao consultar promoção:", resp.statusText);
            return false;
        }

        const json = await resp.json();

        console.log("📥 Resposta JSON da promoção:", json);

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

async function verificarPromocao(funcionario, data, inicio, duracao) {
    console.log("🔹 verificarPromocao chamada com:");
    console.log("   Funcionário:", funcionario);
    console.log("   Data:", data);
    console.log("   Início:", inicio);
    console.log("   Duração em minutos:", duracao);

    const dataObj = new Date(data);
    const diaSemana = dataObj.getDay() + 1;
    if (diaSemana == 8) { diaSemana = 0; }
    console.log("📅 Dia da semana calculado:", diaSemana);

    const url = `http://localhost:3000/promocao?funcionario=${funcionario}&diaSemana=${diaSemana}&inicio=${inicio}&duracao=${duracao}`;
    console.log("🔗 URL chamada:", url);

    try {
        const resp = await fetch(url);

        console.log("📤 Status da resposta:", resp.status);

        if (!resp.ok) {
            console.error("❌ Erro ao consultar promoção:", resp.statusText);
            return false;
        }

        const json = await resp.json();

        console.log("📥 Resposta JSON da promoção:", json);

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
function abrirModalPromocao() {
    const modal = document.getElementById('modal-promocao');
    const p = document.getElementById('promo-texto');
    const btnFechar = document.getElementById('btn-promo-cancel'); 
    const btnConfirmar = document.getElementById('btn-promo-ok'); 

    if (!modal || !p || !btnFechar || !btnConfirmar) return;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    btnFechar.onclick = () => fecharModalPromocao();

    btnConfirmar.onclick = async () => {
        const idCliente = localStorage.getItem('idClienteLogado');
        const unidade = localStorage.getItem('unidadeSelecionada');
        const funcionario = localStorage.getItem('funcionarioSelecionado');
        const data = document.getElementById('data-agendamento').value;
        const horario = localStorage.getItem('horarioSelecionado');
        const duracaoAnterior = localStorage.getItem('duracaoSelecionada');

        if (!idCliente || !unidade || !funcionario || !data || !horario) {
            alert("Faltam dados para agendamento.");
            return;
        }
const novoHorario = somarHorarioComDuracao(horario, duracaoAnterior);
        const agendamento = {
            id_cliente: idCliente,
            id_servico: 1, 
            id_unidade: unidade,
            id_funcionario: funcionario,
            data_agendamento: data,
            duracao: "00:20:00", 
            horario: novoHorario
        };

        try {
            const resposta = await fetch('http://localhost:3000/agendamentos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(agendamento)
            });

            if (!resposta.ok) throw new Error("Erro ao enviar agendamento");

            const resultado = await resposta.json();
            console.log("Agendamento criado via promoção:", resultado);

            mostrarAlertaBootstrap("Agendamento promocional confirmado!", "success", 3000);
            setTimeout(() => {
                window.location.href = "minha-conta.html";
            }, 1000);
        } catch (erro) {
            console.error("Erro no POST de agendamento:", erro);
            alert("Erro ao confirmar agendamento promocional.");
        }
    };
}



function fecharModalPromocao() {
    const modal = document.getElementById('modal-promocao');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = '';
    window.location.href = "minha-conta.html";
}

async function verificarEMostrarPromocao(funcionario, data, inicio, duracao) {
    const promocao = await verificarPromocao(funcionario, data, inicio, duracao);
    if (promocao) {
        abrirModalPromocao();
    } else {
        console.log("Sem promoção disponível.");
    }
}
function iniciarDivisao(hora) {

    const bloco = document.getElementById("divisao-servico"); 
    const s1 = bloco.querySelector("#s1");
    const s2 = bloco.querySelector("#s2");
    const restante = bloco.querySelector("#tempo-restante");

    const btnUpList = bloco.querySelectorAll(".btn-up");
    const btnDownList = bloco.querySelectorAll(".btn-down");

    const MIN_S1 = 15;
    const MAX_S1 = 35;
    const MIN_S2 = 0;

    function atualizar() {
        const v1 = parseInt(s1.textContent);
        const v2 = parseInt(s2.textContent);
        const soma = v1 + v2;

        restante.textContent = `Tempo restante: ${hora - soma} min`;

        btnUpList.forEach(btn => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            const isS1 = btn.dataset.target === "s1";
            const valorAtual = parseInt(alvo.textContent);

            if (soma + 5 > hora) {
                btn.disabled = true;
                return;
            }

            if (isS1 && valorAtual >= MAX_S1) {
                btn.disabled = true;
                return;
            }

            btn.disabled = false;
        });

        btnDownList.forEach(btn => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            const isS1 = btn.dataset.target === "s1";
            const valorAtual = parseInt(alvo.textContent);

            if (isS1 && valorAtual <= MIN_S1) {
                btn.disabled = true;
                return;
            }

            if (!isS1 && valorAtual <= MIN_S2) {
                btn.disabled = true;
                return;
            }

            btn.disabled = false;
        });
    }

    btnUpList.forEach(btn => {
        btn.addEventListener("click", () => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            alvo.textContent = parseInt(alvo.textContent) + 5;
            atualizar();
        });
    });

    btnDownList.forEach(btn => {
        btn.addEventListener("click", () => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            alvo.textContent = parseInt(alvo.textContent) - 5;
            atualizar();
        });
    });

    atualizar();
}


function iniciarDivisao2(hora) {

    const bloco = document.getElementById("divisao-servico2"); 
    const s1 = bloco.querySelector("#s3");
    const s2 = bloco.querySelector("#s4");
    const restante = bloco.querySelector("#tempo-restante2");

    const btnUpList = bloco.querySelectorAll(".btn-up");
    const btnDownList = bloco.querySelectorAll(".btn-down");

    const MIN_S1 = 30;
    const MAX_S1 = 100;
    const MIN_S2 = 0;

    function atualizar() {
        const v1 = parseInt(s1.textContent);
        const v2 = parseInt(s2.textContent);
        const soma = v1 + v2;

        restante.textContent = `Tempo restante: ${hora - soma} min`;

        btnUpList.forEach(btn => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            const isS1 = btn.dataset.target === "s3";
            const valorAtual = parseInt(alvo.textContent);

            if (soma + 10 > hora) {
                btn.disabled = true;
                return;
            }

            if (isS1 && valorAtual >= MAX_S1) {
                btn.disabled = true;
                return;
            }

            btn.disabled = false;
        });

        btnDownList.forEach(btn => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            const isS1 = btn.dataset.target === "s3";
            const valorAtual = parseInt(alvo.textContent);

            if (isS1 && valorAtual <= MIN_S1) {
                btn.disabled = true;
                return;
            }

            if (!isS1 && valorAtual <= MIN_S2) {
                btn.disabled = true;
                return;
            }

            btn.disabled = false;
        });
    }

    btnUpList.forEach(btn => {
        btn.addEventListener("click", () => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            alvo.textContent = parseInt(alvo.textContent) + 10;
            atualizar();
        });
    });

    btnDownList.forEach(btn => {
        btn.addEventListener("click", () => {
            const alvo = bloco.querySelector(`#${btn.dataset.target}`);
            alvo.textContent = parseInt(alvo.textContent) - 10;
            atualizar();
        });
    });

    atualizar();
}


function somarHorarioComDuracao(horario, duracao) {
    const [hHor, mHor] = horario.split(':').map(Number);
    const [hDur, mDur, sDur] = duracao.split(':').map(Number);


    let totalMinutos = hHor * 60 + mHor + hDur * 60 + mDur;


    const horasFinais = Math.floor(totalMinutos / 60);
    const minutosFinais = totalMinutos % 60;

    return `${String(horasFinais).padStart(2,'0')}:${String(minutosFinais).padStart(2,'0')}`;
};