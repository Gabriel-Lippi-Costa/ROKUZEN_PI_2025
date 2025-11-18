function validarTelefone(input) {
    // Remove tudo que não é número
    let tel = input.value.replace(/\D/g, "");

    // Pega o span logo após o input
    let msg = input.nextElementSibling;
    if (!msg) return; // segurança

    // Limita o número a 11 dígitos
    if (tel.length > 11) tel = tel.slice(0, 11);

    // Se está vazio
    if (tel.length === 0) {
        input.value = "";
        msg.textContent = "";
        return;
    }

    // Formata o telefone
    let ddd = tel.substring(0, 2);
    let numero;

    if (tel.length <= 10) {
        numero = tel.substring(2, 6);
        if (tel.length > 6) numero += "-" + tel.substring(6);
    } else {
        numero = tel.substring(2, 7) + "-" + tel.substring(7);
    }

    input.value = `(${ddd}) ${numero}`;

    // Mensagem de validação
    if (tel.length === 10 || tel.length === 11) {
        msg.textContent = "Telefone válido";
        msg.style.color = "green";
    } else if (tel.length < 10) {
        msg.textContent = "Número incompleto";
        msg.style.color = "#7e0000";
    }

    msg.style.fontFamily = "'Poppins', sans-serif";
    msg.style.fontWeight = "500";
}
