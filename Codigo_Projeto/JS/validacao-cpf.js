function validarCPF(input) {
    let cpf = input.value.replace(/\D/g, "");
    let msg = document.querySelector("#msgCPF");

    if (cpf.length <= 11) {
        input.value = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,
            function (_, p1, p2, p3, p4) {
                let out = p1;
                if (p2) out += "." + p2;
                if (p3) out += "." + p3;
                if (p4) out += "-" + p4;
                return out;
            });
    }

    if (cpf.length === 11) {
        if (testarCPF(cpf)) {
            msg.textContent = "✅ CPF válido";
            msg.style.color = "green";
        } else {
            msg.textContent = "❌ CPF inválido";
            msg.style.color = "red";
        }
    } else {
        msg.textContent = "";
    }
}

function testarCPF(cpf) {
    if (/^(\d)\1+$/.test(cpf)) return false;

    let soma = 0, resto;
    for (let i = 1; i <= 9; i++) soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;

    soma = 0;
    for (let i = 1; i <= 10; i++) soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if ((resto === 10) || (resto === 11)) resto = 0;
    if (resto !== parseInt(cpf.substring(10, 11))) return false;

    return true;
}
