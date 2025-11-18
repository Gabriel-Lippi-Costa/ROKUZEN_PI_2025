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

        // Campos básicos
        document.getElementById('nome-funcionario-editar').value = dados.nome_funcionario || '';
        document.getElementById('data-nascimento-funcionario-editar').value = dados.data_nascimento_funcionario
            ? new Date(dados.data_nascimento_funcionario).toISOString().split('T')[0]
            : '';
        document.getElementById('telefone-funcionario-editar').value = dados.telefone_funcionario || '';
        document.getElementById('email-funcionario-editar').value = dados.email_funcionario || '';
        document.getElementById('password-funcionario-editar').value = ''; // senha nunca deve ser preenchida

        // Preencher a escala do modal de edição
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
                if (checkDia) checkDia.checked = true; // marca o checkbox do dia
            });
        }

        // Preencher os serviços do funcionário
        if (Array.isArray(dados.servicos)) {
            // desmarca todos os checkboxes primeiro
            document.querySelectorAll('.servico-editar').forEach(input => input.checked = false);

            dados.servicos.forEach(idServico => {
                const inputServico = document.querySelector(`#servico-editar-${idServico}`);
                if (inputServico) inputServico.checked = true;
            });
        }

    } catch (err) {
        console.error("Erro ao preencher dados do funcionário:", err);
        alert('Erro ao buscar dados do funcionário!');
    }
}


async function atualizarDadosFuncionario() {
    const funcionario = JSON.parse(localStorage.getItem('usuario'));
    const token = localStorage.getItem('token');

    if (!funcionario || !funcionario.id_funcionario) {
        alert("Funcionário não identificado!");
        return;
    }

    const id = funcionario.id_funcionario;

    // Campos básicos
    const nome = document.getElementById('nome-funcionario-editar').value;
    const data_nascimento = document.getElementById('data-nascimento-funcionario-editar').value;
    const telefone = document.getElementById('telefone-funcionario-editar').value;
    const email = document.getElementById('email-funcionario-editar').value;
    const senha = document.getElementById('password-funcionario-editar').value;

    // Monta a escala
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
    document.querySelectorAll(".servico-editar:checked") // pega os checkboxes marcados
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

        // Fecha o modal antes do alert
        toggleModalEditarFuncionario();

        // Atualiza os campos na tela
        preencherCamposFuncionario();

        alert('Dados atualizados com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar os dados do funcionário:', err);
        alert('Erro ao atualizar os dados do funcionário!');
    }
}

// Form vinculado ao submit
const formEditarFuncionario = document.getElementById('formEditarFuncionario');
if (formEditarFuncionario) {
    formEditarFuncionario.addEventListener('submit', (event) => {
        event.preventDefault(); // previne reload da página
        atualizarDadosFuncionario();
    });
}


document.getElementById('modalEditarFuncionario').addEventListener('click', function (e) {
    if (e.target === this) toggleModalEditarFuncionario();
});






async function criarContaCliente(event) {
    event.preventDefault(); // impede o recarregamento da página

    const nome = document.getElementById('nome-cliente').value.trim();
    const data_nascimento = document.getElementById('data-nascimento-cliente').value;
    const telefone = document.getElementById('telefone-cliente').value.trim();
    const email = document.getElementById('email-cliente').value.trim();
    const senha = document.getElementById('password-cliente').value.trim();

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        alert('Preencha todos os campos obrigatórios!');
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

        alert('Cliente cadastrado com sucesso!');
        console.log('Cliente criado:', resposta.data);

        document.getElementById('formDadosCriarCliente').reset();

        localStorage.setItem('usuario', JSON.stringify(resposta.data.usuario));
        localStorage.setItem('token', resposta.data.token);
        localStorage.setItem('tipoUsuario', 'cliente');

        toggleModalCriarContaCliente();
    } catch (erro) {
        console.error('Erro ao criar conta do cliente:', erro);
        alert('Erro ao criar conta. Verifique os dados e tente novamente.');
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

    // DADOS BÁSICOS DO FUNCIONÁRIO
    const novoFuncionario = {
        nome: document.getElementById("nome-funcionario")?.value.trim() || '',
        data_nascimento: document.getElementById("data-nascimento-funcionario")?.value || '',
        telefone: document.getElementById("telefone-funcionario")?.value.trim() || '',
        email: document.getElementById("email-funcionario")?.value.trim() || '',
        senha: document.getElementById("password-funcionario")?.value.trim() || '',
        escala: {},
        servicos: []
    };

    // Validação básica de campos obrigatórios
    
    if (!novoFuncionario.nome || !novoFuncionario.data_nascimento || !novoFuncionario.telefone ||
        !novoFuncionario.email || !novoFuncionario.senha) {
        alert("Preencha todos os campos obrigatórios!");
        return;
    }

    // Monta a escala
    document.querySelectorAll(".check-dia").forEach(chk => {
        const dia = chk.dataset.dia;
        if (chk.checked && dia) { // garante que dia exista
            const unidade = document.querySelector(`.unidade-dia[data-dia="${dia}"]`)?.value.trim() || '';
            const inicio = document.querySelector(`.hora-inicio[data-dia="${dia}"]`)?.value || '';
            const fim = document.querySelector(`.hora-fim[data-dia="${dia}"]`)?.value || '';
            const inicioAlmoco = document.querySelector(`.almoco-inicio[data-dia="${dia}"]`)?.value || null;
            const fimAlmoco = document.querySelector(`.almoco-fim[data-dia="${dia}"]`)?.value || null;

            // valida campos obrigatórios da escala
            if (!unidade || !inicio || !fim) {
                alert(`Preencha unidade, início e fim para o dia ${dia}`);
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

    // Verifica se pelo menos um dia foi selecionado
    if (Object.keys(novoFuncionario.escala).length === 0) {
        alert("Selecione pelo menos um dia de trabalho.");
        return;
    }

    // Coleta os serviços selecionados
    novoFuncionario.servicos = Array.from(
        document.querySelectorAll(".servicos-dashboard input:checked")
    ).map(cb => Number(cb.value));

    console.log("JSON que será enviado para o backend:", JSON.stringify(novoFuncionario, null, 2));

    try {
        const resp = await fetch("http://localhost:3000/cadastro-funcionario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(novoFuncionario)
        });

        const data = await resp.json();

        if (!resp.ok) {
            alert("Erro ao criar funcionário: " + (data.erro || "Desconhecido"));
            return;
        }

        alert("Funcionário criado com sucesso!");
        toggleModalCriarContaFuncionario();
        document.getElementById("formCriarFuncionario")?.reset();

    } catch (erro) {
        console.error("Erro:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}


