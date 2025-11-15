// Função para renderizar os cards de profissionais
function renderizarCardsProfissionais(profissionais) {
    console.log('renderizarCardsProfissionais chamado');
    console.log('Profissionais recebidos:', profissionais);

    const container = document.getElementById('cards-profissionais');
    if (!container) {
        console.warn('Container #cards-profissionais não encontrado no DOM');
        return;
    }

    container.innerHTML = ''; // limpa qualquer conteúdo existente

    if (!profissionais || profissionais.length === 0) {
        console.log('Nenhum profissional encontrado para renderizar');
        container.innerHTML = `<p>Nenhum profissional encontrado.</p>`;
        return;
    }

    profissionais.forEach(prof => {
        console.log('Renderizando profissional:', prof);

        const card = document.createElement('section');
        card.classList.add('card');

        card.innerHTML = `
            <section class="parte-de-cima">
                <img src="${prof.imagem_colaborador || '../assets/Profissionais/imagem-generica.png'}" 
                     alt="Foto do profissional ${prof.nome_funcionario}">
            </section>
            <section class="parte-de-baixo">
                <p class="nome-profissional">${prof.nome_funcionario}</p>
            </section>
        `;

        container.appendChild(card);
    });

    console.log('Todos os profissionais foram renderizados');
}

// Função para buscar os profissionais do backend
async function carregarProfissionais() {
    console.log('carregarProfissionais chamado');
    try {
        const response = await axios.get('http://localhost:3000/listar-profissionais'); // rota que retorna todos os profissionais
        console.log('Resposta do backend:', response.data);

        renderizarCardsProfissionais(response.data);
    } catch (erro) {
        console.error('Erro ao carregar profissionais:', erro);
    }
}

// Chamada quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado, iniciando carregamento de profissionais');
    carregarProfissionais();
});
