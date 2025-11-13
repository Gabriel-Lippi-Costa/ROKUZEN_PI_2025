const btnLogin = document.querySelector(".escolha-autenticacao .login-btn button");
const btnCadastro = document.querySelector(".escolha-autenticacao .cadastro-btn button");

const formLogin = document.querySelector(".informacoes-login form");
const formCadastro = document.querySelector(".informacoes-cadastro form");

// Gradientes modernos
const gradienteAtivo = "linear-gradient(90deg, #7e0000 0%, #a80000 100%)";
const gradienteInativo = "linear-gradient(90deg, #c4c4c4 0%, #e0e0e0 100%)";
const corTextoAtivo = "white";
const corTextoInativo = "#333";

// Estado inicial → LOGIN é o padrão
formLogin.style.display = "flex";
formLogin.style.flexDirection = "column";
formLogin.style.gap = "10px";

formCadastro.style.display = "none";

btnLogin.style.background = gradienteAtivo;
btnLogin.style.color = corTextoAtivo;

btnCadastro.style.background = gradienteInativo;
btnCadastro.style.color = corTextoInativo;

// Clique em LOGIN
btnLogin.addEventListener("click", () => {
  formCadastro.style.display = "none";
  formLogin.style.display = "flex";
  formLogin.style.flexDirection = "column";
  formLogin.style.gap = "10px";

  btnLogin.style.background = gradienteAtivo;
  btnLogin.style.color = corTextoAtivo;

  btnCadastro.style.background = gradienteInativo;
  btnCadastro.style.color = corTextoInativo;
});

// Clique em CADASTRO
btnCadastro.addEventListener("click", () => {
  formLogin.style.display = "none";
  formCadastro.style.display = "flex";

  btnCadastro.style.background = gradienteAtivo;
  btnCadastro.style.color = corTextoAtivo;

  btnLogin.style.background = gradienteInativo;
  btnLogin.style.color = corTextoInativo;
});
