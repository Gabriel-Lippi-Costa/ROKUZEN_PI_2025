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
                window.location.href = "autenticacao.html";
                return;
            }

            if (tipoUsuario === "cliente") {
                window.location.href = "minha-conta.html";
            } 
            else if (tipoUsuario === "funcionario") {
                window.location.href = "funcionario.html"; 
            } 
            else {
                window.location.href = "autenticacao.html";
            }
        });
    });
});
