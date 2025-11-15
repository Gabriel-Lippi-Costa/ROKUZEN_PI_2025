document.addEventListener('DOMContentLoaded', () => {

    async function clicarBotaoServico(botao) {

        // 🔒 Verifica login antes de qualquer coisa
        const token = localStorage.getItem("token");
        const tipo = localStorage.getItem("tipoUsuario");

        if (!token || tipo !== "cliente") {
            alert("Você precisa estar logado como cliente para agendar um serviço!");
            return; // ❗ não deixa continuar
        }

        const idServico = botao.dataset.idServico;
        console.log("Botão clicado, ID do serviço:", idServico);

        try {
            const resposta = await fetch(`http://localhost:3000/servico/${idServico}`);
            if (!resposta.ok) throw new Error('Serviço não encontrado');

            const dadosServico = await resposta.json();
            console.log("Dados recebidos do backend:", dadosServico);

            // Salva o JSON no localStorage
            localStorage.setItem('servicoSelecionado', JSON.stringify(dadosServico));

            window.location.href = 'agendar.html';

        } catch (erro) {
            console.error("Erro ao buscar serviço:", erro);
            alert('Não foi possível carregar os dados do serviço.');
        }
    }

    document.querySelectorAll('.btn-agendar').forEach(botao => {
        botao.addEventListener('click', () => clicarBotaoServico(botao));
    });

});
