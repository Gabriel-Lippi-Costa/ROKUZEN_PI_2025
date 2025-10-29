(function () {
    const input = document.getElementById('faqSearch');
    const clear = document.getElementById('faqClear');
    const items = Array.from(document.querySelectorAll('.faq-item'));
  
    function normalizar(txt) {
      return (txt || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
  
    function filtrar() {
      const termo = normalizar(input.value);
      let algumVisivel = false;
  
      items.forEach(d => {
        const texto = normalizar(d.innerText);
        const match = texto.includes(termo);
        d.style.display = match ? '' : 'none';
        if (match) algumVisivel = true;
  
        if (match && termo) d.setAttribute('open', 'open');
        else if (!termo) d.removeAttribute('open');
      });
  
      clear.style.visibility = termo ? 'visible' : 'hidden';
    }
  
    if (input) {
      input.addEventListener('input', filtrar);
      clear.addEventListener('click', () => {
        input.value = '';
        filtrar();
        input.focus();
      });
      clear.style.visibility = 'hidden';
    }
  })();
  