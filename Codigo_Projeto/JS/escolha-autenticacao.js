const btnLogin = document.querySelector(".escolha-autenticacao .login-btn button");
const btnCadastro = document.querySelector(".escolha-autenticacao .cadastro-btn button");

const formLogin = document.querySelector(".informacoes-login form");
const formCadastro = document.querySelector(".informacoes-cadastro form");

const corAtiva = "white";
const corPadrao = "rgba(128, 128, 128, 0.5)";

formLogin.style.display = "none";
formCadastro.style.display = "flex";

btnLogin.style.backgroundColor = corPadrao;
btnCadastro.style.backgroundColor = corAtiva;

btnLogin.addEventListener("click", () => {
    formCadastro.style.display = "none";
    formLogin.style.display = "flex";
    formLogin.style.flexDirection = "column";
    formLogin.style.gap = "10px";

    btnLogin.style.backgroundColor = corAtiva;
    btnCadastro.style.backgroundColor = corPadrao;
});

btnCadastro.addEventListener("click", () => {
    formLogin.style.display = "none";
    formCadastro.style.display = "flex";

    btnCadastro.style.backgroundColor = corAtiva;
    btnLogin.style.backgroundColor = corPadrao;
});