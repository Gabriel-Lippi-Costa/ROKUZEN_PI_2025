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

app.get('/usuario/:id', (req, res) => {
    const { id } = req.params

    const sql = 'SELECT * FROM clientes WHERE id_cliente = ?'

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar usuário' })
        if (resultado.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' })

        res.json({ usuario: resultado[0] })
    })
})

app.post('/cadastro', (req, res) => {
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' })
    }

    const sql = 'INSERT INTO clientes (nome_cliente, data_nascimento_cliente, telefone_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?, ?)'

    conexao.query(sql, [nome, data_nascimento, telefone, email, senha], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar o usuário: ', erro)
            return res.status(500).json({ erro: 'Erro ao cadastrar usuário' })
        }

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!', id: resultado.insertId,
            usuario: {
                id_cliente: resultado.insertId,
                nome_cliente: nome,
                email_cliente: email,
                telefone_cliente: telefone,
                data_nascimento: data_nascimento
            }
        })
    })
})


app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos!' });
    }

    const sql = 'SELECT * FROM clientes WHERE email_cliente = ? AND senha_cliente = ?';
    conexao.query(sql, [email, senha], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao consultar usuário: ', erro);
            return res.status(500).json({ erro: 'Erro ao realizar login' });
        }

        if (resultado.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha incorretos!' });
        }

        const usuario = resultado[0];
        res.status(200).json({ mensagem: 'Login realizado com sucesso!', usuario });
    });
});

app.patch('/atualizar/:id', (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    const sql = `
        UPDATE clientes
        SET nome_cliente = ?, data_nascimento_cliente = ?, telefone_cliente = ?, email_cliente = ?, senha_cliente = ?
        WHERE id_cliente = ?
    `;

    conexao.query(sql, [nome, data_nascimento, telefone, email, senha, id], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao atualizar dados do usuário: ', erro);
            return res.status(500).json({ erro: 'Erro ao atualizar dados do usuário' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado!' });
        }

        res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso!',
            usuario: {
                id_cliente: id,
                nome_cliente: nome,
                email_cliente: email,
                telefone_cliente: telefone,
                data_nascimento: data_nascimento
            }
        });
    });
});

app.post('/agendamento', (req, res) => {
    const { id_cliente, servico, unidade, duracao, data, profissional, horario } = req.body;

    if (!id_cliente || !servico || !unidade || !duracao || !data || !profissional || !horario) {
        return res.status(400).json({ erro: 'Selecione todos os campos necessários para o agendamento!' });
    }

    const sql = `
        INSERT INTO agendamentos 
        (id_cliente, id_servico, id_unidade, id_colaborador, data_agendamento, duracao)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const dataHora = `${data} ${horario}:00`;
    const duracaoTime = `${duracao}:00`;

    const values = [id_cliente, servico, unidade, profissional, dataHora, duracaoTime];

    conexao.query(sql, values, (err, result) => {
        if (err) {
            console.error('Erro ao confirmar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao agendar massagem!' });
        }

        res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!', id_agendamento: result.insertId });
    });
});

app.get('/servicos', (req, res) => {
    const sql = 'SELECT * FROM servicos WHERE servico_ativo = TRUE'

    conexao.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar serviços!' })
        res.json(resultado)
    })
})

app.get('/unidades', (req, res) => {
    const sql = 'SELECT * FROM unidades'
    conexao.query(sql, (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar unidades!' })
        res.json(resultado)
    })
})

app.get('/profissionais', (req, res) => {
    const { id_unidade, id_servico } = req.query

    if (!id_unidade || !id_servico) {
        return res.status(400).json({ erro: 'Informe id_unidade e id_servico' })
    }

    const sql = ` SELECT c.id_colaborador, c.nome_colaborador
        FROM colaboradores c
        JOIN unidades_colaboradores uc ON c.id_colaborador = uc.id_colaborador
        JOIN servicos_colaboradores sc ON c.id_colaborador = sc.id_colaborador
        WHERE uc.id_unidade = ? AND sc.id_servico = ? AND c.colaborador_ativo = TRUE
    `

    conexao.query(sql, [id_unidade, id_servico], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar profissionais disponíveis' })
        res.json(resultado)
    })
})

app.get('/horarios', (req, res) => {
    const { id_colaborador, id_unidade, data } = req.query

    if (!id_colaborador || !id_unidade || !data) {
        return res.status(400).json({ erro: 'Informe id_colaborador, id_unidade e data!' })
    }

    const sqlEscala = `
        SELECT e.inicio_escala, e.fim_escala
        FROM escalas e
        JOIN escalas_unidades_colaboradores euc ON e.id_escala = euc.id_escala
        JOIN unidades_colaboradores uc ON euc.id_unidade_colaborador = uc.id_unidade_colaborador
        WHERE uc.id_colaborador = ? AND uc.id_unidade = ?
        AND DATE(e.inicio_escala) = ?
    `

    conexao.query(sqlEscala, [id_colaborador, id_unidade, data], (erroEscala, escalas) => {
        if (erroEscala) {
            console.error('Erro ao buscar escala: ', erroEscala)
            return res.status(500).json({ erro: 'Erro ao buscar escala colaborador.' })
        }

        if (escalas.length === 0) {
            return res.status(404).json({ erro: 'Nenhuma escala encontrada para este colaborador nesta data!' })
        }

        const { inicio_escala, fim_escala } = escalas[0]

        const sqlAgendamentos = `
            SELECT TIME(data_agendamento) AS horario_ocupado
            FROM agendamentos
            WHERE id_colaborador = ? AND id_unidade = ? AND DATE(data_agendamento) = ? 
            AND status_agendamento != 'cancelado'
        `

        conexao.query(sqlAgendamentos, [id_colaborador, id_unidade, data], (erroAg, agendamentos) => {
            if (erroAg) {
                console.error('Erro ao buscar agendamentos:', erroAg);
                return res.status(500).json({ erro: 'Erro ao buscar agendamentos.' });
            }

            const ocupados = agendamentos.map(a => a.horario_ocupado.slice(0, 5));

            const inicio = new Date(inicio_escala);
            const fim = new Date(fim_escala);
            const duracaoSlot = 30; // minutos

            const disponiveis = [];
            const atual = new Date(inicio);

            while (atual < fim) {
                const hora = atual.toTimeString().slice(0, 5);
                if (!ocupados.includes(hora)) {
                    disponiveis.push(hora);
                }
                atual.setMinutes(atual.getMinutes() + duracaoSlot);
            }

            res.json({ horarios_disponiveis: disponiveis });
        })
    })
})

app.listen(3000, () => {
    console.log('server up & running');
})