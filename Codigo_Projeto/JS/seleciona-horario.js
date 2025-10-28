const radiosHorario = document.querySelectorAll('input[name="horario"]');
const selecionadoHorarioTxt = document.getElementById('selecionadoHorarioTxt');

radiosHorario.forEach(radio => {
  radio.addEventListener('change', () => {
    selecionadoHorarioTxt.innerHTML = `Selecionado: <strong>${radio.value}</strong>`;
  });
});