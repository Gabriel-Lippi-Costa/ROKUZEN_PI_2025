function mostrarAlertaBootstrap(mensagem, tipo = "danger", tempo = 3000) {
    const container = document.querySelector("#alert-container");
    if (!container) return;

    const id = "alert-" + Date.now();

    const alertaHTML = `
        <div id="${id}" class="alert-custom alert-${tipo}">
            ${mensagem}
            <span class="close-alert" onclick="this.parentElement.remove()">&times;</span>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", alertaHTML);

    // Remove após tempo
    setTimeout(() => {
        const alerta = document.getElementById(id);
        if (alerta) alerta.remove();
    }, tempo);
}

function mostrarConfirmacao(mensagem, callbackSim, callbackNao) {
    const container = document.querySelector("#alert-container");
    if (!container) return;

    const id = "alert-" + Date.now();
    const alertaHTML = `
        <div id="${id}" class="alert-custom alert-info">
            <div style="margin-bottom: 10px;">${mensagem}</div>
            <div style="text-align: right;">
                <button id="${id}-sim" style="margin-right: 5px; padding:5px 10px;">Sim</button>
                <button id="${id}-nao" style="padding:5px 10px;">Não</button>
            </div>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", alertaHTML);

    const alerta = document.getElementById(id);
    document.getElementById(`${id}-sim`).addEventListener("click", () => {
        alerta.remove();
        if (callbackSim) callbackSim();
    });
    document.getElementById(`${id}-nao`).addEventListener("click", () => {
        alerta.remove();
        if (callbackNao) callbackNao();
    });
}
