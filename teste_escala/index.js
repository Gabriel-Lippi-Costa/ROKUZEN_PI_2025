const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});


conexao.getConnection()
    .then(() => {
        console.log('Conectado ao MySQL com sucesso!')
    })
    .catch((erro) => {
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
        console.error('Erro ao se conectar no DB:', erro.code);
        console.error('Mensagem:', erro.message);
        process.exit(1);
    });


function autenticarToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ erro: "Token não fornecido!" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (erro, usuario) => {
        if (erro) {
            return res.status(403).json({ erro: "Token inválido ou expirado!" });
        }
        req.usuario = usuario; 
        next();
    });
}

app.get('/usuario/:id', (req, res) => {
    const { id } = req.params
    const sql = 'SELECT * FROM clientes WHERE id_cliente = ?'
    conexao.query(sql, [id])
        .then(([resultado]) => {
            if (resultado.length === 0) return res.status(404).json({ erro: 'Usuário não encontrado' });
            res.json({ usuario: resultado[0] });
        })
        .catch(erro => {
            console.error('Erro ao buscar usuário:', erro);
            res.status(500).json({ erro: 'Erro ao buscar usuário' });
        });
});

app.post('/cadastro', async (req, res) => {
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);
        // SQL LIMPO E CORRIGIDO
        const sql = "INSERT INTO clientes (nome_cliente, data_nascimento_cliente, telefone_cliente, email_cliente, senha_cliente) VALUES (?, ?, ?, ?, ?)";

        const [resultado] = await conexao.query(sql, [nome, data_nascimento, telefone, email, senhaCriptografada]);

        res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            id: resultado.insertId,
            usuario: {
                id_cliente: resultado.insertId,
                nome_cliente: nome,
                email_cliente: email,
                telefone_cliente: telefone,
                data_nascimento: data_nascimento
            }
        });
    } catch (erro) {
        console.error('Erro ao cadastrar o usuário:', erro);
        res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
    }
});


app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos!' });
    }

    try {
        const sqlCliente = 'SELECT * FROM clientes WHERE email_cliente = ?';
        const [resultadoCliente] = await conexao.query(sqlCliente, [email]);
        
        if (resultadoCliente.length > 0) {
            const cliente = resultadoCliente[0];
            const senhaCorreta = await bcrypt.compare(senha, cliente.senha_cliente);
            
            if (!senhaCorreta) {
                return res.status(401).json({ erro: 'Email ou senha incorretos!' });
            }

            const token = jwt.sign(
                { id: cliente.id_cliente, tipo: 'cliente' },
                process.env.JWT_SECRET,
                { expiresIn: '2h' }
            );

            return res.status(200).json({
                mensagem: 'Login de cliente realizado com sucesso!',
                tipo: 'cliente',
                usuario: cliente,
                token
            });
        }

        const sqlFuncionario = 'SELECT * FROM funcionarios WHERE email_funcionario = ?';
        const [resultadoFunc] = await conexao.query(sqlFuncionario, [email]);

        if (resultadoFunc.length === 0) {
            return res.status(401).json({ erro: 'Email ou senha incorretos!' });
        }

        const funcionario = resultadoFunc[0];
        const senhaCorreta = await bcrypt.compare(senha, funcionario.senha_funcionario);
        
        if (!senhaCorreta) {
            return res.status(401).json({ erro: 'Email ou senha incorretos!' });
        }

        const token = jwt.sign(
            { id: funcionario.id_funcionario, tipo: 'funcionario' },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        return res.status(200).json({
            mensagem: 'Login de funcionário realizado com sucesso!',
            tipo: 'funcionario',
            usuario: funcionario,
            token
        });

    } catch (erro) {
        console.error('Erro ao realizar login:', erro);
        return res.status(500).json({ erro: 'Erro ao realizar login' });
    }
});


app.patch('/atualizar/:id', autenticarToken, async (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const sql = `
            UPDATE clientes
            SET nome_cliente = ?, data_nascimento_cliente = ?, telefone_cliente = ?, email_cliente = ?, senha_cliente = ?
            WHERE id_cliente = ?
        `;

        const [resultado] = await conexao.query(sql, [nome, data_nascimento, telefone, email, senhaCriptografada, id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Usuário não encontrado!' });
        }

        const novoToken = jwt.sign(
            { id: id, tipo: req.usuario.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso!',
            usuario: {
                id_cliente: id,
                nome_cliente: nome,
                email_cliente: email,
                telefone_cliente: telefone,
                data_nascimento: data_nascimento
            },
            token: novoToken
        });
    } catch (erro) {
        console.error("Erro no bcrypt/atualizar:", erro);
        res.status(500).json({ erro: "Erro interno ao atualizar o usuário." });
    }
});
app.post('/agendamento', (req, res) => {
    const { id_cliente, servico, unidade, duracao, data, profissional, horario } = req.body;

    if (!id_cliente || !servico || !unidade || !duracao || !data || !profissional || !horario) {
        return res.status(400).json({ erro: 'Selecione todos os campos necessários para o agendamento!' });
    }

 
    const sql = "INSERT INTO agendamentos (id_cliente, id_servico, id_unidade, id_colaborador, data_agendamento, duracao) VALUES (?, ?, ?, ?, ?, ?)";

    const dataHora = `${data} ${horario}:00`;
    const duracaoTime = `${duracao}:00`;

    const values = [id_cliente, servico, unidade, profissional, dataHora, duracaoTime];

    conexao.query(sql, values)
        .then(([result]) => {
            res.status(201).json({ mensagem: 'Agendamento realizado com sucesso!', id_agendamento: result.insertId });
        })
        .catch(err => {
            console.error('Erro ao confirmar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao agendar massagem!' });
        });
});

app.get('/servicos', (req, res) => {
    const sql = 'SELECT * FROM servicos WHERE servico_ativo = TRUE'
    conexao.query(sql)
        .then(([resultado]) => {
            res.json(resultado);
        })
        .catch(erro => res.status(500).json({ erro: 'Erro ao buscar serviços!' }));
});

app.get('/unidades', (req, res) => {
    const sql = 'SELECT * FROM unidades'
    conexao.query(sql)
        .then(([resultado]) => {
            res.json(resultado);
        })
        .catch(erro => res.status(500).json({ erro: 'Erro ao buscar unidades!' }));
});

app.get('/profissionais', (req, res) => {
    const { id_unidade, id_servico } = req.query

    if (!id_unidade || !id_servico) {
        return res.status(400).json({ erro: 'Informe id_unidade e id_servico' })
    }

    // SQL LIMPO E CORRIGIDO
    const sql = "SELECT c.id_colaborador, c.nome_colaborador FROM colaboradores c JOIN unidades_colaboradores uc ON c.id_colaborador = uc.id_colaborador JOIN servicos_colaboradores sc ON c.id_colaborador = sc.id_colaborador WHERE uc.id_unidade = ? AND sc.id_servico = ? AND c.colaborador_ativo = TRUE";

    conexao.query(sql, [id_unidade, id_servico])
        .then(([resultado]) => {
            if (resultado.length === 0) {
                return res.status(404).json({ erro: 'Nenhum profissional encontrado para o serviço nesta unidade.' });
            }
            res.json(resultado);
        })
        .catch(erro => {
            console.error('ERRO NO SQL DA ROTA /profissionais:', erro); 
            return res.status(500).json({ erro: 'Erro ao buscar profissionais disponíveis' });
        });
});

app.get('/horarios', (req, res) => {
    const { id_colaborador, id_unidade, data } = req.query

    if (!id_colaborador || !id_unidade || !data) {
        return res.status(400).json({ erro: 'Informe id_colaborador, id_unidade e data!' })
    }
    
    // SQL ESCALA LIMPO E CORRIGIDO
    const sqlEscala = `SELECT e.id_escala, e.inicio_escala, e.fim_escala FROM escalas e WHERE e.id_colaborador = ? AND e.id_unidade = ? AND DATE(e.inicio_escala) = ? ORDER BY e.inicio_escala`;

    conexao.query(sqlEscala, [id_colaborador, id_unidade, data])
        .then(([escalas]) => {
            if (escalas.length === 0) {
                return res.status(404).json({ erro: 'Nenhuma escala encontrada para este colaborador nesta data!' })
            }

            const { inicio_escala, fim_escala } = escalas[0]

            // SQL AGENDAMENTOS LIMPO E CORRIGIDO
            const sqlAgendamentos = `SELECT TIME(data_agendamento) AS horario_ocupado FROM agendamentos WHERE id_colaborador = ? AND id_unidade = ? AND DATE(data_agendamento) = ? AND status_agendamento != 'cancelado'`;

            return conexao.query(sqlAgendamentos, [id_colaborador, id_unidade, data])
                .then(([agendamentos]) => {
                    const ocupados = agendamentos.map(a => a.horario_ocupado.slice(0, 5));

                    const inicio = new Date(inicio_escala);
                    const fim = new Date(fim_escala);
                    const duracaoSlot = 30;

                    const disponiveis = [];
                    const atual = new Date(inicio);
                    atual.setSeconds(0, 0); 
                    
                    while (atual < fim) {
                        const hora = atual.toTimeString().slice(0, 5);
                        if (!ocupados.includes(hora)) {
                            disponiveis.push(hora);
                        }
                        atual.setMinutes(atual.getMinutes() + duracaoSlot);
                    }

                    res.json({ horarios_disponiveis: disponiveis });
                });
        })
        .catch(erro => {
            console.error('❌ ERRO AO BUSCAR ESCALA/AGENDAMENTOS:', erro);
            if (erro.status !== 404) { // Evita logar 404 como erro grave
                return res.status(500).json({ erro: 'Erro ao buscar escala colaborador.' });
            }
        });
});

app.patch('/agendamento/:id/cancelar', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE agendamentos SET status_agendamento = "cancelado" WHERE id_agendamento = ?';

    conexao.query(sql, [id])
        .then(([resultado]) => {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Agendamento não encontrado!' });
            }
            res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso!' });
        })
        .catch(erro => {
            console.error('Erro ao cancelar agendamento: ', erro);
            return res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
        });
});

// ROTA DE AGENDAMENTOS FUTUROS (CORRIGIDA)
app.get('/cliente/:id/agendamentos-futuros', (req, res) => {
    const idCliente = req.params.id

    // QUERY LIMPA E EM LINHA ÚNICA (SEM ESPAÇOS INVISÍVEIS)
    const sql = "SELECT A.id_agendamento, A.data_agendamento, A.duracao, S.nome_servico, C.nome_colaborador, C.imagem_colaborador, IFNULL((SELECT SP.valor FROM servicos_precos SP WHERE SP.id_servico = A.id_servico AND SP.ativo = TRUE ORDER BY SP.criado_em DESC LIMIT 1), 0) AS valor FROM agendamentos A JOIN servicos S ON A.id_servico = S.id_servico JOIN colaboradores C ON A.id_colaborador = C.id_colaborador WHERE A.id_cliente = ? AND (A.status_agendamento = 'pendente' OR A.status_agendamento = 'confirmado') AND DATE(A.data_agendamento) >= CURDATE() ORDER BY A.data_agendamento ASC";

    conexao.query(sql, [idCliente])
        .then(([resultados]) => {
            const agendamentosFormatados = resultados.map(ag => {
                const valorNumerico = Number(ag.valor);

                const valorFormatado = (valorNumerico || valorNumerico === 0) 
                    ? `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`
                    : 'R$ 0,00';

                return {
                    id_agendamento: ag.id_agendamento,
                    data_agendamento: ag.data_agendamento,
                    duracao: ag.duracao,
                    nome_servico: ag.nome_servico,
                    nome_colaborador: ag.nome_colaborador,
                    imagem_colaborador: ag.imagem_colaborador,
                    valor: valorFormatado
                }
            })

            res.json(agendamentosFormatados)
        })
        .catch(erro => {
            console.error("Erro ao buscar agendamentos futuros. ", erro)
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos futuros.' })
        })
})


app.get('/cliente/:id/agendamentos-historicos', (req, res) => {
    const idCliente = req.params.id;

    // QUERY CORRIGIDA: Usa subquery segura para buscar o preço do serviço
    const sql = `
        SELECT
            A.id_agendamento,
            A.data_agendamento,
            A.duracao,
            S.nome_servico,
            C.nome_colaborador,
            C.imagem_colaborador,
            IFNULL(
                (SELECT SP.valor FROM servicos_precos SP 
                 WHERE SP.id_servico = A.id_servico AND SP.ativo = TRUE 
                 ORDER BY SP.criado_em DESC LIMIT 1), 
                0
            ) AS valor
        FROM
            agendamentos A
        JOIN
            servicos S ON A.id_servico = S.id_servico
        JOIN
            colaboradores C ON A.id_colaborador = C.id_colaborador
        WHERE   
            A.id_cliente = ?
            AND DATE(A.data_agendamento) < CURDATE()
            AND A.status_agendamento != 'cancelado'
        ORDER BY
            A.data_agendamento DESC;
    `;

    conexao.query(sql, [idCliente])
        .then(([resultados]) => {
            const agendamentosFormatados = resultados.map(ag => {
                const valorNumerico = Number(ag.valor);

                const valorFormatado = (valorNumerico || valorNumerico === 0) 
                    ? `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`
                    : 'R$ 0,00';

                return {
                    id_agendamento: ag.id_agendamento,
                    data_agendamento: ag.data_agendamento,
                    duracao: ag.duracao,
                    nome_servico: ag.nome_servico,
                    nome_colaborador: ag.nome_colaborador,
                    imagem_colaborador: ag.imagem_colaborador,
                    valor: valorFormatado
                };
            });

            res.json(agendamentosFormatados);
        })
        .catch(erro => {
            console.error("Erro ao buscar agendamentos históricos.", erro);
            res.status(500).json({ erro: 'Erro ao buscar agendamentos históricos.' });
        });
});

app.patch('/agendamento/:id/cancelar', (req, res) => {
    const { id } = req.params;
    const sql = 'UPDATE agendamentos SET status_agendamento = "cancelado" WHERE id_agendamento = ?';

    conexao.query(sql, [id])
        .then(([resultado]) => {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Agendamento não encontrado!' });
            }
            res.status(200).json({ mensagem: 'Agendamento cancelado com sucesso!' });
        })
        .catch(erro => {
            console.error('Erro ao cancelar agendamento: ', erro);
            return res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
        });
});

app.patch('/funcionario/:id', autenticarToken, async (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const sql = `
        UPDATE funcionarios
        SET nome_funcionario = ?, data_nascimento_funcionario = ?, telefone_funcionario = ?, email_funcionario = ?, senha_funcionario = ?
        WHERE id_funcionario = ?
    `;

    conexao.query(sql, [nome, data_nascimento, telefone, email, senhaHash, id])
        .then(([resultado]) => {
            if (resultado.affectedRows === 0) {
                return res.status(404).json({ erro: 'Funcionário não encontrado!' });
            }

            res.status(200).json({
                mensagem: 'Funcionário atualizado com sucesso!',
                funcionario: { id_funcionario: id, nome_funcionario: nome, email_funcionario: email, telefone_funcionario: telefone, data_nascimento_funcionario: data_nascimento }
            });
        })
        .catch(erro => {
            console.error('Erro ao atualizar funcionário:', erro);
            res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
        });
});


app.post('/cadastro-funcionario', async (req, res) => {
    try {
        const { nome, data_nascimento, telefone, email, senha } = req.body;

        if (!nome || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = "INSERT INTO funcionarios (nome_funcionario, data_nascimento_funcionario, telefone_funcionario, email_funcionario, senha_funcionario) VALUES (?, ?, ?, ?, ?)";

        const [resultado] = await conexao.query(sql, [nome, data_nascimento, telefone, email, senhaHash]);

        const token = jwt.sign(
            { id: resultado.insertId, tipo: 'funcionario' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            mensagem: 'Funcionário cadastrado com sucesso!',
            funcionario: {
                id_funcionario: resultado.insertId,
                nome_funcionario: nome,
                data_nascimento_funcionario: data_nascimento,
                telefone_funcionario: telefone,
                email_funcionario: email
            },
            token
        });

    } catch (erro) {
        console.error('Erro inesperado:', erro);
        res.status(500).json({ erro: 'Erro inesperado ao cadastrar funcionário' });
    }
});

// Rotas de Colaboradores e Escalas (Temporariamente Desprotegidas para Teste)

// [NOVA] Rota 1: Lista TODOS os colaboradores para o painel de ADMIN
app.get('/colaboradores-todos', (req, res) => {
    const sql = "SELECT id_colaborador, nome_colaborador, colaborador_ativo FROM colaboradores ORDER BY nome_colaborador";
    conexao.query(sql)
        .then(([resultados]) => res.json(resultados))
        .catch(erro => {
            console.error('Erro ao listar todos os colaboradores:', erro);
            res.status(500).json({ erro: 'Erro ao listar todos os colaboradores.' });
        });
});

// [NOVA] Rota 2: Lista colaboradores JÁ associados a uma unidade
app.get('/unidade/:id_unidade/colaboradores', (req, res) => {
    const { id_unidade } = req.params;
    const sql = "SELECT c.id_colaborador, c.nome_colaborador FROM colaboradores c JOIN unidades_colaboradores uc ON c.id_colaborador = uc.id_colaborador WHERE uc.id_unidade = ? AND c.colaborador_ativo = TRUE";
    
    conexao.query(sql, [id_unidade])
        .then(([resultados]) => res.json(resultados))
        .catch(erro => {
            console.error('Erro ao buscar colaboradores da unidade:', erro);
            res.status(500).json({ erro: 'Erro ao listar colaboradores.' });
        });
});

// [NOVA] Rota 3: Salva associações de Colaborador a Unidade (Sobrescreve tudo)
app.post('/unidade/:id_unidade/associar-colaboradores', async (req, res) => {
    const { id_unidade } = req.params;
    const { colaboradores } = req.body; 

    if (!colaboradores || !Array.isArray(colaboradores)) {
        return res.status(400).json({ erro: 'Lista de colaboradores inválida.' });
    }

    let connection;
    try {
        connection = await conexao.getConnection();
        await connection.beginTransaction();

        // 1. DELETA todas as associações existentes para esta unidade
        const sqlDelete = 'DELETE FROM unidades_colaboradores WHERE id_unidade = ?';
        await connection.query(sqlDelete, [id_unidade]);

        // 2. INSERE as novas associações
        if (colaboradores.length > 0) {
            const values = colaboradores.map(id => [id_unidade, id]);
            const sqlInsert = 'INSERT INTO unidades_colaboradores (id_unidade, id_colaborador) VALUES ?';
            await connection.query(sqlInsert, [values]);
        }
        
        await connection.commit();
        res.status(200).json({ mensagem: `Associações da Unidade ${id_unidade} atualizadas com sucesso.` });

    } catch (erro) {
        if (connection) await connection.rollback();
        console.error('Erro ao salvar associações de unidade/colaborador:', erro);
        res.status(500).json({ erro: 'Erro interno ao processar associações.' });
    } finally {
        if (connection) connection.release();
    }
});

// [NOVA] Rota 4: Salva escala DIÁRIA (para resolver o problema de dados de agendamento)
app.post('/escala', async (req, res) => {
    const { id_unidade, id_colaborador, data, inicio, fim } = req.body;

    if (!id_unidade || !id_colaborador || !data || !inicio || !fim) {
        return res.status(400).json({ erro: 'Faltam dados: unidade, colaborador, data, início ou fim.' });
    }

    const inicio_escala_dt = `${data} ${inicio}:00`;
    const fim_escala_dt = `${data} ${fim}:00`;

    let connection;
    try {
        connection = await conexao.getConnection();
        await connection.beginTransaction();

        // 1. Deleta a escala existente para este dia/colaborador/unidade
        const sqlDelete = 'DELETE FROM escalas WHERE id_colaborador = ? AND id_unidade = ? AND DATE(inicio_escala) = ?';
        await connection.query(sqlDelete, [id_colaborador, id_unidade, data]);

        // 2. Insere a nova escala
        const sqlInsert = 'INSERT INTO escalas (id_unidade, id_colaborador, inicio_escala, fim_escala) VALUES (?, ?, ?, ?)';
        const values = [id_unidade, id_colaborador, inicio_escala_dt, fim_escala_dt];
        const [resultadoInsert] = await connection.query(sqlInsert, values);
        
        await connection.commit();

        res.status(201).json({ 
            mensagem: 'Escala cadastrada com sucesso!', 
            id_escala: resultadoInsert.insertId 
        });

    } catch (erro) {
        if (connection) await connection.rollback();
        console.error('Erro ao cadastrar escala:', erro);
        res.status(500).json({ erro: 'Erro ao cadastrar escala.' });
    } finally {
        if (connection) connection.release();
    }
});

app.use(express.static(__dirname + '/../../html'));

app.listen(3000, () => {
    console.log('server up & running');
})