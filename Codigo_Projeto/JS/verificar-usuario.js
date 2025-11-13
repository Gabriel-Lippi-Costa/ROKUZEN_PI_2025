document.addEventListener("DOMContentLoaded", () => {
    const botoes = [
        document.querySelector("#botao-autenticacao-topo"),
        document.querySelector("#botao-autenticacao-menu")
    ];

    botoes.forEach(botao => {
        if (!botao) return;

        botao.addEventListener("click", (e) => {
            e.preventDefault(); // impede ir direto para autenticacao.html

            const token = localStorage.getItem("token");

            if (token) {

                window.location.href = "minha-conta.html";
            } else {
                window.location.href = "autenticacao.html";
            }
        });
    });
});
