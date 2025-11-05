const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Permitir requisições do frontend
app.use(cors());

// Conexão com o banco MySQL
const db = mysql.createPool({
    host: 'localhost',      // seu host
    user: 'root',    // seu usuário
    password: 'imtdb',  // sua senha
    database: 'rokuzen' // seu banco
});

// Endpoint para agendamentos por serviço
app.get('/api/agendamentos', (req, res) => {
    const query = `
        SELECT s.nome_servico, COUNT(a.id_agendamento) AS total
        FROM servicos s
        LEFT JOIN agendamentos a ON s.id_servico = a.id_servico
        GROUP BY s.id_servico
    `;

    db.query(query, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
