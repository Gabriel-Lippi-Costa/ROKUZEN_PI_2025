fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
  .then(res => res.json())
  .then(estados => {
    const estadoSelect = document.getElementById("estado");
    estados.forEach(estado => {
      const option = document.createElement("option");
      option.value = estado.sigla;
      option.textContent = estado.nome;
      option.dataset.id = estado.id;
      estadoSelect.appendChild(option);
    });
  });

document.getElementById("estado").addEventListener("change", function () {
  const estadoId = this.options[this.selectedIndex].dataset.id;
  const cidadeSelect = document.getElementById("cidade");
  cidadeSelect.innerHTML = "<option value=''>Carregando...</option>";

  if (estadoId) {
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estadoId}/municipios`)
      .then(res => res.json())
      .then(cidades => {
        cidadeSelect.innerHTML = "<option value=''>Selecione</option>";
        cidades.forEach(cidade => {
          const option = document.createElement("option");
          option.value = cidade.nome;
          option.textContent = cidade.nome;
          cidadeSelect.appendChild(option);
        });
      });
  }
});
