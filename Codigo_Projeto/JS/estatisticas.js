// estatisticas.js
fetch('http://localhost:3000/api/grafico-agendamentos')
    .then(res => res.json())
    .then(data => {
        const nomes = data.map(item => item.nome_servico);
        const totais = data.map(item => item.total);

        const ctx = document.getElementById('graficoAgendamentos').getContext('2d');
        new Chart(ctx, {
            type: 'bar', // ou 'line', 'pie' etc
            data: {
                labels: nomes,
                datasets: [{
                    label: 'Agendamentos por serviço',
                    data: totais,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    })
    .catch(err => console.error('Erro ao carregar gráfico:', err));
