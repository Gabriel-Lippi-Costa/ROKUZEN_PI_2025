const radios = document.querySelectorAll('.duration-group input[type="radio"]');
  const live = document.getElementById('selecionadoTxt');

  function updateLabel() {
    const selected = document.querySelector('.duration-group input[type="radio"]:checked');
    if (selected) {
      live.innerHTML = `Selecionado: <strong>${selected.value} min</strong>`;
    }
  }

  radios.forEach(r => r.addEventListener('change', updateLabel));