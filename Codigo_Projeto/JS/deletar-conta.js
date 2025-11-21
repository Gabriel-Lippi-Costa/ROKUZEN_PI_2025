
document.addEventListener("DOMContentLoaded", () => {

    const botaoApagar = document.getElementById("botao-apagar-conta");
    if (botaoApagar) {
        botaoApagar.addEventListener("click", () => {
            mostrarConfirmacao(
                "Tem certeza que deseja apagar DEFINITIVAMENTE sua conta?",
                async () => {
                    const tipo = localStorage.getItem("tipoUsuario"); 
                    const usuario = JSON.parse(localStorage.getItem("usuario"));

                    let idConta;
                    if (tipo === "cliente") idConta = usuario.id_cliente;
                    if (tipo === "funcionario") idConta = usuario.id_funcionario;

                    if (!idConta) {
                        mostrarAlertaBootstrap("Erro: ID da conta não encontrado!", "danger", 3000);
                        return;
                    }

                    try {
                        await axios.delete(`http://localhost:3000/deletar/${tipo}/${idConta}`);
                        mostrarAlertaBootstrap("Conta apagada com sucesso!", "success", 3000);

                        localStorage.clear();
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 1000);
                    } catch (erro) {
                        console.error("Erro ao apagar conta:", erro);
                        mostrarAlertaBootstrap("Erro ao apagar conta.", "danger", 3000);
                    }
                },
                () => {
                   
                }
            );
        });
    }

    const botaoSair = document.getElementById("botao-sair");
    if (botaoSair) {
        botaoSair.addEventListener("click", () => {
            mostrarConfirmacao(
                "Deseja realmente sair da conta?",
                () => { 
                    localStorage.clear();
                    mostrarAlertaBootstrap("Você saiu da sua conta.", "success", 3000);

                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 1000); 
                },
                () => {
                }
            );
        });
    }

});
