
const searchBar = document.getElementById('searchBar');
const resultsList = document.getElementById('results');

let debounceTimer;
function redirecionar(url) {
  if (
    url.startsWith('http://') || 
    url.startsWith('https://') || 
    url.endsWith('.html')
  ) {
    window.location.href = url;
  } else {
    console.warn('Ação desconhecida:', url);
  }
}
function selecionar(opcao, acao) {
  searchBar.value = opcao;    
  resultsList.innerHTML = ''; 
  redirecionar(acao);    
}

searchBar.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(async () => {
    const query = searchBar.value.trim();
    if (!query) {
      resultsList.innerHTML = ''; 
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/buscar?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      resultsList.innerHTML = data.map(item => `
        <li onclick="selecionar('${item.opcao}', '${item.acao}')">
          ${item.opcao}
        </li>
      `).join('');
    } catch (err) {
      console.error('Erro ao buscar sugestões:', err);
    }
  }, 300); 
});