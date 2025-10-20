function validarTelefone(input) {
    let telefone = input.value.replace(/\D/g, "");
    let msg = document.querySelector("#msgTEL");

    if (telefone.length <= 10) {
        input.value = telefone.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/,
            function (_, p1, p2, p3) {
                let out = "";
                if (p1) out += "(" + p1;
                if (p1 && p1.length === 2) out += ") ";
                if (p2) out += p2;
                if (p3) out += "-" + p3;
                return out;
            });
    } else {
        input.value = telefone.replace(/(\d{0,2})(\d{0,5})(\d{0,4})/,
            function (_, p1, p2, p3) {
                let out = "";
                if (p1) out += "(" + p1;
                if (p1 && p1.length === 2) out += ") ";
                if (p2) out += p2;
                if (p3) out += "-" + p3;
                return out;
            });
    }

    if (telefone.length === 10 || telefone.length === 11) {
        msg.textContent = "✅ Telefone válido";
        msg.style.color = "green";
    } else if (telefone.length > 0) {
        msg.textContent = "❌ Número incompleto";
        msg.style.color = "red";
    } else {
        msg.textContent = "";
    }
}
