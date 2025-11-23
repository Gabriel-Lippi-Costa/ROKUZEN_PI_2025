function toggleModalFuncionario() {
    const modalWrapper = document.getElementById('modalDados');
    modalWrapper.classList.toggle('show');

    if (modalWrapper.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
        preencherCamposFuncionario();
    } else {
        document.body.style.overflow = '';
    }
}
async function preencherCamposFuncionario() {
    const funcionario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    if (!funcionario || !funcionario.id_funcionario) {
        console.warn("Nenhum funcionário logado encontrado no localStorage.");
        return;
    }

    const id = funcionario.id_funcionario;

    try {
        const resp = await axios.get(`http://localhost:3000/funcionario/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const dados = resp.data.funcionario;

      
        document.getElementById('nome-funcionario-editar').value = dados.nome_funcionario || '';
        document.getElementById('data-nascimento-funcionario-editar').value = dados.data_nascimento_funcionario
            ? new Date(dados.data_nascimento_funcionario).toISOString().split('T')[0]
            : '';
        document.getElementById('telefone-funcionario-editar').value = dados.telefone_funcionario || '';
        document.getElementById('email-funcionario-editar').value = dados.email_funcionario || '';
        document.getElementById('password-funcionario-editar').value = ''; 

        if (dados.escala && typeof dados.escala === 'object') {
            Object.entries(dados.escala).forEach(([dia, item]) => {
                const unidadeInput = document.querySelector(`.unidade-dia[data-dia-editar="${dia}"]`);
                const inicioInput = document.querySelector(`.hora-inicio[data-dia-editar="${dia}"]`);
                const fimInput = document.querySelector(`.hora-fim[data-dia-editar="${dia}"]`);
                const inicioAlmocoInput = document.querySelector(`.almoco-inicio[data-dia-editar="${dia}"]`);
                const fimAlmocoInput = document.querySelector(`.almoco-fim[data-dia-editar="${dia}"]`);
                const checkDia = document.querySelector(`.check-dia[data-dia-editar="${dia}"]`);

                if (unidadeInput) unidadeInput.value = item.unidade || '';
                if (inicioInput) inicioInput.value = item.inicio || '';
                if (fimInput) fimInput.value = item.fim || '';
                if (inicioAlmocoInput) inicioAlmocoInput.value = item.inicio_almoco || '';
                if (fimAlmocoInput) fimAlmocoInput.value = item.fim_almoco || '';
                if (checkDia) checkDia.checked = true; 
            });
        }

        if (Array.isArray(dados.servicos)) {
            document.querySelectorAll('.servico-editar').forEach(input => input.checked = false);

            dados.servicos.forEach(idServico => {
                const inputServico = document.querySelector(`#servico-editar-${idServico}`);
                if (inputServico) inputServico.checked = true;
            });
        }

    } catch (err) {
        console.error("Erro ao preencher dados do funcionário:", err);
    mostrarAlertaBootstrap("Erro ao buscar dados do funcionário!", "danger", 3000);
    }
}


async function atualizarDadosFuncionario() {
    const funcionario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    if (!funcionario || !funcionario.id_funcionario) {
        mostrarAlertaBootstrap("Funcionário não identificado!", "danger", 3000);
        return;
    }

    const id = funcionario.id_funcionario;

    const nome = document.getElementById('nome-funcionario-editar').value;
    const data_nascimento = document.getElementById('data-nascimento-funcionario-editar').value;
    const telefone = document.getElementById('telefone-funcionario-editar').value;
    const email = document.getElementById('email-funcionario-editar').value;
    const senha = document.getElementById('password-funcionario-editar').value;

    const escala = [];
    document.querySelectorAll('.check-dia').forEach(check => {
        const dia = check.dataset.diaEditar;
        if (check.checked) {
            escala.push({
                dia,
                unidade: document.querySelector(`.unidade-dia[data-dia-editar="${dia}"]`).value,
                inicio: document.querySelector(`.hora-inicio[data-dia-editar="${dia}"]`).value,
                fim: document.querySelector(`.hora-fim[data-dia-editar="${dia}"]`).value,
                inicio_almoco: document.querySelector(`.almoco-inicio[data-dia-editar="${dia}"]`).value,
                fim_almoco: document.querySelector(`.almoco-fim[data-dia-editar="${dia}"]`).value
            });
        }
    });
const servicos = Array.from(
    document.querySelectorAll(".servico-editar:checked") 
).map(cb => Number(cb.value));

    try {
        const resp = await axios.patch(`http://localhost:3000/funcionario/${id}`, {
            nome,
            data_nascimento,
            telefone,
            email,
            senha,
            escala,
            servicos
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const funcionarioAtualizado = { ...resp.data.funcionario };
        delete funcionarioAtualizado.senha_funcionario;
        localStorage.setItem('usuario', JSON.stringify(funcionarioAtualizado));

        toggleModalEditarFuncionario();

        preencherCamposFuncionario();

        mostrarAlertaBootstrap("Dados atualizados com sucesso!", "success", 3000);
    } catch (err) {
        console.error('Erro ao atualizar os dados do funcionário:', err);
        alert('Erro ao atualizar os dados do funcionário!');
    }
}

const formEditarFuncionario = document.getElementById('formEditarFuncionario');
if (formEditarFuncionario) {
    formEditarFuncionario.addEventListener('submit', (event) => {
        event.preventDefault();
        atualizarDadosFuncionario();
    });
}


document.getElementById('modalEditarFuncionario').addEventListener('click', function (e) {
    if (e.target === this) toggleModalFuncionario();
});






async function criarContaCliente(event) {
    event.preventDefault(); 

    const nome = document.getElementById('nome-cliente').value.trim();
    const data_nascimento = document.getElementById('data-nascimento-cliente').value;
    const telefone = document.getElementById('telefone-cliente').value.trim();
    const email = document.getElementById('email-cliente').value.trim();
    const senha = document.getElementById('password-cliente').value.trim();

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        mostrarAlertaBootstrap("Preencha todos os campos obrigatórios", "warning", 3000);
        return;
    }

    try {
        const resposta = await axios.post('http://localhost:3000/cadastro', {
            nome,
            data_nascimento,
            telefone,
            email,
            senha
        });

        mostrarAlertaBootstrap("Cliente cadastrado com sucesso!", "success", 3000);
        console.log('Cliente criado:', resposta.data);

        document.getElementById('formDadosCriarCliente').reset();

        localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));
        localStorage.setItem('token', resposta.data.token);
        localStorage.setItem('tipoUsuario', 'cliente');

        toggleModalCriarContaCliente();
    } catch (erro) {
        console.error('Erro ao criar conta do cliente:', erro);
       mostrarAlertaBootstrap("Erro ao criar conta, verifique os dados e tente novamente.", "danger", 3000);
    }
}








function toggleModalCriarContaFuncionario() {
    const modal = document.getElementById("modalCriarFuncionario");
    modal.classList.toggle("show");
}

function toggleDia(header) {
    const content = header.nextElementSibling;
    content.classList.toggle("show");
}
async function salvarDados(event) {
    event.preventDefault();

    const form = event.target; 

    const novoFuncionario = {
        nome: form.querySelector('[id$="nome-funcionario"]').value.trim() || '',
        data_nascimento: form.querySelector('[id$="data-nascimento-funcionario"]').value || '',
        telefone: form.querySelector('[id$="telefone-funcionario"]').value.trim() || '',
        email: form.querySelector('[id$="email-funcionario"]').value.trim() || '',
        senha: form.querySelector('[id$="password-funcionario"]').value.trim() || '',
        escala: {},
        servicos: []
    };

    if (!novoFuncionario.nome || !novoFuncionario.data_nascimento || !novoFuncionario.telefone ||
        !novoFuncionario.email || !novoFuncionario.senha) {
        mostrarAlertaBootstrap("Preencha todos os campos obrigatórios!", "danger", 3000);
        return;
    }

    form.querySelectorAll(".check-dia").forEach(chk => {
        const dia = chk.dataset.dia || chk.dataset.diaEditar;
        if (chk.checked && dia) { 
            const unidade = form.querySelector(`.unidade-dia[data-dia="${dia}"], .unidade-dia[data-dia-editar="${dia}"]`)?.value.trim() || '';
            const inicio = form.querySelector(`.hora-inicio[data-dia="${dia}"], .hora-inicio[data-dia-editar="${dia}"]`)?.value || '';
            const fim = form.querySelector(`.hora-fim[data-dia="${dia}"], .hora-fim[data-dia-editar="${dia}"]`)?.value || '';
            const inicioAlmoco = form.querySelector(`.almoco-inicio[data-dia="${dia}"], .almoco-inicio[data-dia-editar="${dia}"]`)?.value || null;
            const fimAlmoco = form.querySelector(`.almoco-fim[data-dia="${dia}"], .almoco-fim[data-dia-editar="${dia}"]`)?.value || null;

            if (!unidade || !inicio || !fim) {
                mostrarAlertaBootstrap(`Preencha unidade, início e fim para o dia ${dia}`, "warning", 3000);
                return;
            }

            novoFuncionario.escala[dia] = {
                unidade,
                inicio,
                fim,
                inicio_almoco: inicioAlmoco,
                fim_almoco: fimAlmoco
            };
        }
    });

    if (Object.keys(novoFuncionario.escala).length === 0) {
        mostrarAlertaBootstrap("Selecione pelo menos um dia de trabalho.", "warning", 3000);
        return;
    }

  
novoFuncionario.servicos = Array.from(
    form.querySelectorAll("input[type='checkbox']:checked")
)
.map(cb => Number(cb.value))
.filter(v => !isNaN(v)); // remove valores que não são número


    console.log("JSON que será enviado para o backend:", JSON.stringify(novoFuncionario, null, 2));

    try {
        const url = form.id === "formCriarFuncionario"
            ? "http://localhost:3000/cadastro-funcionario"
            : "http://localhost:3000/editar-funcionario"; 

        const method = form.id === "formCriarFuncionario" ? "POST" : "PATCH";

        const resp = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoFuncionario)
        });

        const data = await resp.json();

        if (!resp.ok) {
            mostrarAlertaBootstrap("Erro: " + (data.erro || "Desconhecido"), "danger", 3000);
            return;
        }

        mostrarAlertaBootstrap(
            form.id === "formCriarFuncionario"
                ? "Funcionário criado com sucesso!"
                : "Funcionário atualizado com sucesso!",
            "success",
            3000
        );

        if (form.id === "formCriarFuncionario") toggleModalCriarContaFuncionario();
        else toggleModalEditarFuncionario();

        form.reset();

    } catch (erro) {
        console.error("Erro:", erro);
        mostrarAlertaBootstrap("Erro ao conectar com o servidor.", "danger", 3000);
    }
}



