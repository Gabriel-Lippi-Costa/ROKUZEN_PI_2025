function validarTelefone(input) {
    let tel = input.value.replace(/\D/g, "");

    let msg = input.nextElementSibling;
    if (!msg) return; 

    if (tel.length > 11) tel = tel.slice(0, 11);

    if (tel.length === 0) {
        input.value = "";
        msg.textContent = "";
        return;
    }

    let ddd = tel.substring(0, 2);
    let numero;

    if (tel.length <= 10) {
        numero = tel.substring(2, 6);
        if (tel.length > 6) numero += "-" + tel.substring(6);
    } else {
        numero = tel.substring(2, 7) + "-" + tel.substring(7);
    }

    input.value = `(${ddd}) ${numero}`;

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
