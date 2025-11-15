document.addEventListener("DOMContentLoaded", () => {
    const botoes = [
        document.querySelector("#botao-autenticacao-topo"),
        document.querySelector("#botao-autenticacao-menu")
    ];

    botoes.forEach(botao => {
        if (!botao) return;

        botao.addEventListener("click", (e) => {
            e.preventDefault();

            const token = localStorage.getItem("token");
            const tipoUsuario = localStorage.getItem("tipoUsuario");

            if (!token) {
                // Ninguém logado → vai pra login
                window.location.href = "autenticacao.html";
                return;
            }

            // Redirecionamento correto:
            if (tipoUsuario === "cliente") {
                window.location.href = "minha-conta.html";
            } 
            else if (tipoUsuario === "funcionario") {
                window.location.href = "funcionario.html"; 
            } 
            else {
                // Caso de segurança (não deveria acontecer)
                window.location.href = "autenticacao.html";
            }
        });
    });
});
