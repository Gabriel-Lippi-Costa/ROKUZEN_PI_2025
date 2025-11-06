function gerarGrafico(endpoint, canvasId, labelDataset, titulo, tipo = "bar", backgroundColor = 'rgba(168, 190, 124, 0.8)', labelField = 'nome') {
    fetch(endpoint)
        .then(res => res.json())
        .then(data => {
            const labels = data.map(item => item[labelField]);
            const totals = data.map(item => item.total);

            const ctx = document.getElementById(canvasId).getContext('2d');
            new Chart(ctx, {
                type: tipo,
                data: {
                    labels: labels,
                    datasets: [{
                        label: labelDataset,
                        data: totals,
                        backgroundColor: backgroundColor,
                        borderColor: 'rgba(128, 128, 128, 0.822)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: titulo,
                            font: { size: 18, weight: 'bold' },
                            color: '#333'
                        },
                        legend: { display: true, position: 'top' }
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
        })
        .catch(err => console.error('Erro ao gerar gráfico:', err));
}

gerarGrafico(
  'http://localhost:3000/agendamentos_servicos_ultimo_mes', 
  'graficoServicos',                                  
  'Agendamentos por serviço',                           
  'Agendamentos por Serviço no Último Mês',              
  'bar',                                                    
  'rgba(168, 190, 124, 0.8)',                               
  'nome_servico'                                           
);
gerarGrafico(
    'http://localhost:3000/agendamentos_unidades_ultimo_mes',
    'graficoUnidades',
    'Agendamentos por Unidade',
    'Agendamentos por Unidade no Último Mês',
    'pie',
    [
    'rgba(168, 190, 124, 0.8)',  
    'rgba(102, 160, 50, 0.8)',   
    'rgba(220, 220, 140, 0.8)',  
    'rgba(140, 180, 80, 0.8)'    
],
    'nome_unidade' 
);
gerarGrafico('http://localhost:3000/agendamentos_profissionais', 'graficoProfissionais', 'Agendamentos por profissional', 'Agendamentos por Profissional (Total)', "bar", 'rgba(168, 190, 124, 0.8)', 'nome_colaborador');
gerarGrafico('http://localhost:3000/agendamentos_ultimo_ano', 'graficoMensal', 'Agendamentos por mês', 'Agendamentos no Último Ano', "line", 'rgba(168, 190, 124, 0.8)', 'mes');