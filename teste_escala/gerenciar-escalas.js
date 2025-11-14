
const API_URL = 'http://localhost:3000'; 


let colaboradoresAssociadosNaUnidade = []; 


document.addEventListener('DOMContentLoaded', () => {
    carregarUnidades();
    
    const selectUnidade = document.getElementById('select-unidade');
    if (selectUnidade) {

        selectUnidade.addEventListener('change', carregarColaboradoresDaUnidade);
    }

    const dataInput = document.getElementById('escala-data');
    if (dataInput) {
      
        dataInput.addEventListener('change', renderizarEscalasAposData);
    }

    const btnSalvarEquipe = document.getElementById('btn-salvar-associacao');
    if (btnSalvarEquipe) {
        btnSalvarEquipe.addEventListener('click', salvarAssociacoes);
    }
    
    const btnSalvarDiaria = document.getElementById('btn-salvar-escala-diaria');
    if (btnSalvarDiaria) {
        btnSalvarDiaria.addEventListener('click', salvarEscalaDiaria);
    }
});



async function carregarUnidades() {
    try {
        const response = await axios.get(`${API_URL}/unidades`); 
        const selectUnidade = document.getElementById('select-unidade');
        
        selectUnidade.innerHTML = '<option value="">-- Selecione --</option>'; 
        
        response.data.forEach(unidade => {
            const option = document.createElement('option');
            option.value = unidade.id_unidade;
            option.textContent = unidade.nome_unidade;
            selectUnidade.appendChild(option);
        });
        

        carregarColaboradoresDaUnidade(); 

    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        document.getElementById('msg-status').textContent = 'Erro ao carregar lista de unidades.';
    }
}



async function carregarColaboradoresDaUnidade() {
    const idUnidade = document.getElementById('select-unidade').value;
    const listaCheckboxesDiv = document.getElementById('lista-checkboxes');
    const btnSalvarEquipe = document.getElementById('btn-salvar-associacao');
    
    btnSalvarEquipe.disabled = true;
    listaCheckboxesDiv.innerHTML = '<p>Carregando todos os colaboradores...</p>';
    
    if (!idUnidade) {
        listaCheckboxesDiv.innerHTML = '<p>Selecione uma unidade acima.</p>';
        colaboradoresAssociadosNaUnidade = [];
        renderizarEscalasAposData(); 
        return;
    }

    try {
        const [respTodos, respAssociados] = await Promise.all([
            axios.get(`${API_URL}/colaboradores-todos`),
            axios.get(`${API_URL}/unidade/${idUnidade}/colaboradores`)
        ]);

        const todosColaboradores = respTodos.data;
        const colaboradoresAssociadosIds = respAssociados.data.map(c => c.id_colaborador);

        colaboradoresAssociadosNaUnidade = todosColaboradores.filter(c => colaboradoresAssociadosIds.includes(c.id_colaborador));


        
        listaCheckboxesDiv.innerHTML = ''; 
        if (todosColaboradores.length === 0) {
            listaCheckboxesDiv.innerHTML = '<p>Nenhum colaborador cadastrado no sistema.</p>';
            return;
        }

        todosColaboradores.forEach(colaborador => {
            const isChecked = colaboradoresAssociadosIds.includes(colaborador.id_colaborador);
            
            const divItem = document.createElement('div');
            divItem.className = 'colaborador-item';
            
            divItem.innerHTML = `
                <input 
                    type="checkbox" 
                    id="colaborador-${colaborador.id_colaborador}" 
                    value="${colaborador.id_colaborador}" 
                    ${isChecked ? 'checked' : ''}
                >
                <label for="colaborador-${colaborador.id_colaborador}">
                    ${colaborador.nome_colaborador} 
                    ${colaborador.colaborador_ativo ? '' : ' (Inativo)'}
                </label>
            `;
            listaCheckboxesDiv.appendChild(divItem);
        });

     
        renderizarEscalasAposData(); 

        btnSalvarEquipe.disabled = false;
        
    } catch (error) {
        console.error('Erro ao carregar colaboradores:', error);
        listaCheckboxesDiv.innerHTML = '<p style="color: red;">Erro ao carregar dados dos colaboradores. Verifique o console.</p>';
    }
}


function renderizarEscalasAposData() {
    const container = document.getElementById('tabela-escala-container');
    const dataInput = document.getElementById('escala-data').value;
    const btnSalvarDiaria = document.getElementById('btn-salvar-escala-diaria');

    if (!dataInput) {
        container.innerHTML = '<p>Selecione a data para definir os horários.</p>';
        btnSalvarDiaria.disabled = true;
        return;
    }
    
    if (colaboradoresAssociadosNaUnidade.length === 0) {
        container.innerHTML = '<p>Nenhum colaborador associado a esta unidade. Adicione-os acima.</p>';
        btnSalvarDiaria.disabled = true;
        return;
    }

 
    let html = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
                <tr style="background-color: #eee;">
                    <th style="padding: 10px; border: 1px solid #ccc; text-align: left;">Colaborador</th>
                    <th style="padding: 10px; border: 1px solid #ccc;">Início (HH:MM)</th>
                    <th style="padding: 10px; border: 1px solid #ccc;">Fim (HH:MM)</th>
                </tr>
            </thead>
            <tbody>
    `;

    colaboradoresAssociadosNaUnidade.forEach(c => {
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ccc;" data-colaborador-id="${c.id_colaborador}">
                    ${c.nome_colaborador}
                </td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">
                    <input type="time" 
                           class="input-inicio" 
                           id="inicio-${c.id_colaborador}"
                           value="09:00" style="width: 85px;">
                </td>
                <td style="padding: 10px; border: 1px solid #ccc; text-align: center;">
                    <input type="time" 
                           class="input-fim" 
                           id="fim-${c.id_colaborador}"
                           value="17:00" style="width: 85px;">
                </td>
            </tr>
        `;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
    btnSalvarDiaria.disabled = false;
}



async function salvarAssociacoes() {
    const idUnidade = document.getElementById('select-unidade').value;
    const msgStatus = document.getElementById('msg-status');
    msgStatus.textContent = 'Salvando...'; 
    msgStatus.style.color = 'blue';

    if (!idUnidade) {
        msgStatus.textContent = 'Selecione uma unidade antes de salvar.';
        msgStatus.style.color = 'red';
        return;
    }

    const colaboradoresSelecionados = [];
    const checkboxes = document.querySelectorAll('#lista-checkboxes input[type="checkbox"]:checked');
    
    checkboxes.forEach(checkbox => {
        colaboradoresSelecionados.push(Number(checkbox.value));
    });

    try {
        const response = await axios.post(`${API_URL}/unidade/${idUnidade}/associar-colaboradores`, 
            { colaboradores: colaboradoresSelecionados }
        );

        msgStatus.textContent = response.data.mensagem || 'Associações salvas com sucesso!';
        msgStatus.style.color = 'green';
        
     
        carregarColaboradoresDaUnidade(); 
        
    } catch (error) {
        const mensagemErro = error.response?.data?.erro || 'Erro desconhecido ao salvar associações.';
        msgStatus.textContent = `Falha ao salvar: ${mensagemErro}`;
        msgStatus.style.color = 'red';
        console.error('Erro de salvamento:', error);
    }
}


async function salvarEscalaDiaria() {
    const idUnidade = document.getElementById('select-unidade').value;
    const data = document.getElementById('escala-data').value;
    const msgEscala = document.getElementById('msg-escala');
    
    if (!idUnidade || !data) {
        msgEscala.textContent = 'Selecione a unidade e a data.';
        msgEscala.style.color = 'red';
        return;
    }

    const jornadas = [];
    const linhas = document.querySelectorAll('#tabela-escala-container tbody tr');


    linhas.forEach(linha => {
        const idColaborador = linha.querySelector('td[data-colaborador-id]').dataset.colaboradorId;
        const inicio = linha.querySelector('.input-inicio').value;
        const fim = linha.querySelector('.input-fim').value;

      
        if (inicio && fim && inicio !== '00:00' && fim !== '00:00') {
            jornadas.push({
                id_unidade: idUnidade,
                id_colaborador: idColaborador,
                data: data,
                inicio: inicio,
                fim: fim
            });
        }
    });

    if (jornadas.length === 0) {
        msgEscala.textContent = 'Nenhuma jornada preenchida para salvar.';
        msgEscala.style.color = 'orange';
        return;
    }
    
    msgEscala.textContent = `Salvando ${jornadas.length} escalas...`;
    msgEscala.style.color = 'blue';

    try {
       
        for (const jornada of jornadas) {
             await axios.post(`${API_URL}/escala`, jornada);
        }

        msgEscala.textContent = `Escalas de ${jornadas.length} colaboradores cadastradas com sucesso para ${data}!`;
        msgEscala.style.color = 'green';
        
    } catch (error) {
        const mensagemErro = error.response?.data?.erro || 'Erro desconhecido ao salvar escala diária.';
        msgEscala.textContent = `Falha ao salvar escala: ${mensagemErro}`;
        msgEscala.style.color = 'red';
        console.error('Erro de salvamento de escala:', error);
    }
}