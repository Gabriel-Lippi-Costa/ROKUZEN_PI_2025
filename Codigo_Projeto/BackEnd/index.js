const express = require('express')
const cors = require('cors')
const mysql = require('mysql2')

const app = express()
app.use(express.json())
app.use(cors())

const conexao = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'dbPessoal123',
    database: 'rokuzen'
})

conexao.connect((erro) => {
    if (erro) {
        console.error('Erro ao se conectar no DB')
        return;
    }

    console.log('Conectado ao MySQL com sucesso!')
})

app.post('/cadastro', (req, res) => {
    const {nome, data_nascimento, telefone, email, senha} = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({erro: 'Preencha todos os campos obrigatórios!'})
    }

    const sql = 'INSERT INTO clientes (nome_cliente, data_nascimento_cliente, telefone_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?, ?)'

    conexao.query(sql, [nome, data_nascimento, telefone, email, senha], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar o usuário: ', erro)
            return res.status(500).json({erro: 'Erro ao cadastrar usuário'})
        }

        res.status(201).json({mensagem: 'Usuário cadastrado com sucesso!', id: resultado.insertId})
    })
})

app.listen(3000, () => {console.log('server up & running');
})