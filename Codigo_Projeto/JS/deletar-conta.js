document.addEventListener("DOMContentLoaded", () => {
    const botao = document.getElementById("botao-apagar-conta");

    botao.addEventListener("click", async () => {

        const confirmar = confirm("Tem certeza que deseja apagar DEFINITIVAMENTE sua conta?");

        if (!confirmar) return;

        const tipo = localStorage.getItem("tipoUsuario"); 
        const usuario = JSON.parse(localStorage.getItem("usuario"));

        let idConta;
        if (tipo === "cliente") idConta = usuario.id_cliente;
        if (tipo === "funcionario") idConta = usuario.id_funcionario;

        if (!idConta) {
            alert("Erro: ID da conta não encontrado!");
            return;
        }

        try {
            const resposta = await axios.delete(`http://localhost:3000/deletar/${tipo}/${idConta}`);

            alert("Conta apagada com sucesso!");

            localStorage.clear();
            window.location.href = "index.html";

        } catch (erro) {
            console.error("Erro ao apagar conta:", erro);
            alert("Erro ao apagar conta.");
        }
    });
});


document.addEventListener("DOMContentLoaded", () => {
    const botaoSair = document.getElementById("botao-sair");

    if (!botaoSair) return;

    botaoSair.addEventListener("click", () => {
        const confirmar = confirm("Deseja realmente sair da conta?");

        if (!confirmar) return;

        localStorage.clear();   // limpa tudo
        alert("Você saiu da sua conta.");

        window.location.href = "index.html"; // altere para a página desejada
    });
});
