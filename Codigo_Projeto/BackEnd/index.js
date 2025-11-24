const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());


const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conexao.connect((erro) => {
    if (erro) {
        console.log('DB_USER:', process.env.DB_USER);
        console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
        console.error('Erro ao se conectar no DB')
        console.error('Erro ao se conectar no DB:');
        console.error('Código do erro:', erro.code);
        console.error('Mensagem:', erro.message);
        console.error('Stack trace:', erro.stack);
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

app.post('/cadastro', async (req, res) => {
    const { nome, data_nascimento, telefone, email, senha } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    try {
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO clientes 
            (nome_cliente, data_nascimento_cliente, telefone_cliente, email_cliente, senha_cliente)
            VALUES (?, ?, ?, ?, ?)
        `;

        conexao.query(sql, [nome, data_nascimento, telefone, email, senhaCriptografada], (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar o usuário:', erro);
                return res.status(500).json({ erro: 'Erro ao cadastrar usuário' });
            }

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
        });
    } catch (erro) {
        console.error('Erro ao criptografar a senha:', erro);
        res.status(500).json({ erro: 'Erro interno ao processar senha' });
    }
});


app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos!' });
    }

    const sqlCliente = 'SELECT * FROM clientes WHERE email_cliente = ?';
    conexao.query(sqlCliente, [email], async (erro, resultadoCliente) => {
        if (erro) {
            console.error('Erro ao consultar cliente:', erro);
            return res.status(500).json({ erro: 'Erro ao realizar login' });
        }

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
        conexao.query(sqlFuncionario, [email], async (erro2, resultadoFunc) => {
            if (erro2) {
                console.error('Erro ao consultar funcionário:', erro2);
                return res.status(500).json({ erro: 'Erro ao realizar login' });
            }

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
        });
    });
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

        conexao.query(sql, [nome, data_nascimento, telefone, email, senhaCriptografada, id], (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar dados do usuário: ', erro);
                return res.status(500).json({ erro: 'Erro ao atualizar dados do usuário' });
            }

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
        });
    } catch (erro) {
        console.error("Erro no bcrypt:", erro);
        res.status(500).json({ erro: "Erro interno ao atualizar o usuário." });
    }
});



app.post('/agendamentos', (req, res) => {
    console.log("📥 Dados recebidos no backend:", req.body);

    const {
        id_cliente,
        id_servico,
        id_unidade,
        id_funcionario,
        data_agendamento,
        duracao,
        horario
    } = req.body;

    if (!id_cliente || !id_servico || !id_unidade || !id_funcionario || !data_agendamento || !duracao || !horario) {
        console.error("❌ Dados faltando:", req.body);
        return res.status(400).json({ erro: 'Faltam dados para criar agendamento!', dadosRecebidos: req.body });
    }

    const dataHora = `${data_agendamento} ${horario}`;

    const sql = `
        INSERT INTO agendamentos 
        (id_cliente, id_servico, id_unidade, id_funcionario, data_agendamento, duracao)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [id_cliente, id_servico, id_unidade, id_funcionario, dataHora, duracao];

    conexao.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Erro ao criar agendamento:', err);
            return res.status(500).json({ erro: 'Erro ao criar agendamento!', detalhes: err });
        }

        res.status(201).json({
            mensagem: 'Agendamento realizado com sucesso!',
            id_agendamento: result.insertId
        });
    });
});










app.get('/profissionais', async (req, res) => {
    let { id_servico, id_unidade, diaSemana } = req.query;

    if (!id_servico || !id_unidade || !diaSemana) {
        return res.status(400).json({ erro: "Parâmetros ausentes" });
    }
    if (id_servico == 5) id_servico = 3;
    else if (id_servico == 6) id_servico = 4;
    try {
        const sql = `
    SELECT f.id_funcionario, f.nome_funcionario
    FROM funcionarios f
    JOIN escalas e ON f.id_funcionario = e.id_funcionario
    JOIN servicos_funcionarios sf ON f.id_funcionario = sf.id_funcionario
    WHERE sf.id_servico = ?
      AND e.id_unidade = ?
      AND e.dia_semana = ?
      AND f.funcionario_ativo
`;


        const [rows] = await conexao.promise().query(sql, [id_servico, id_unidade, diaSemana]);
        console.log("🔹 Rows retornadas do banco:", rows);

        res.json(rows);
    } catch (erro) {
        console.error("❌ Erro no endpoint /profissionais:", erro);
        res.status(500).json({ erro: "Erro ao consultar funcionários" });
    }
});


app.get('/horarios', async (req, res) => {
    const { funcionario, data, diaSemana, duracao } = req.query;

    console.log("📥 Dados recebidos no backend:", { funcionario, data, diaSemana, duracao });

    if (!funcionario || !data || !diaSemana || !duracao) {
        return res.status(400).json({ erro: "Parâmetros ausentes" });
    }

    try {
        const sqlEscala = `
            SELECT hora_inicio, hora_fim, hora_inicio_almoco, hora_fim_almoco
            FROM escalas
            WHERE id_funcionario = ?
              AND dia_semana = ?
        `;
        const [escalas] = await conexao.promise().query(sqlEscala, [funcionario, diaSemana]);
        console.log("🔹 Escalas retornadas:", escalas);

        if (escalas.length === 0) {
            return res.json([]);
        }

        const sqlAgendamentos = `
            SELECT TIME(data_agendamento) AS inicio, duracao
            FROM agendamentos
            WHERE id_funcionario = ?
              AND DATE(data_agendamento) = ?
        `;
        const [agendamentos] = await conexao.promise().query(sqlAgendamentos, [funcionario, data]);
        console.log("🔹 Agendamentos existentes:", agendamentos);

        const duracaoSegundos = parseInt(duracao.split(':')[0]) * 3600 + parseInt(duracao.split(':')[1]) * 60;

        const horariosDisponiveis = [];

        escalas.forEach(escala => {
            let inicioSegundos = parseInt(escala.hora_inicio.split(':')[0]) * 3600
                + parseInt(escala.hora_inicio.split(':')[1]) * 60;
            const fimSegundos = parseInt(escala.hora_fim.split(':')[0]) * 3600
                + parseInt(escala.hora_fim.split(':')[1]) * 60;

            const inicioAlmocoSeg = escala.hora_inicio_almoco
                ? parseInt(escala.hora_inicio_almoco.split(':')[0]) * 3600 + parseInt(escala.hora_inicio_almoco.split(':')[1]) * 60
                : null;
            const fimAlmocoSeg = escala.hora_fim_almoco
                ? parseInt(escala.hora_fim_almoco.split(':')[0]) * 3600 + parseInt(escala.hora_fim_almoco.split(':')[1]) * 60
                : null;

            while (inicioSegundos + duracaoSegundos <= fimSegundos) {
                const inicioHH = String(Math.floor(inicioSegundos / 3600)).padStart(2, '0');
                const inicioMM = String(Math.floor((inicioSegundos % 3600) / 60)).padStart(2, '0');
                const blocoInicio = `${inicioHH}:${inicioMM}`;

                const fimBlocoSeg = inicioSegundos + duracaoSegundos;
                const fimHH = String(Math.floor(fimBlocoSeg / 3600)).padStart(2, '0');
                const fimMM = String(Math.floor((fimBlocoSeg % 3600) / 60)).padStart(2, '0');
                const blocoFim = `${fimHH}:${fimMM}`;

                const ocupado = agendamentos.some(a => {
                    const agInicio = parseInt(a.inicio.split(':')[0]) * 3600
                        + parseInt(a.inicio.split(':')[1]) * 60;
                    const agFim = agInicio + (parseInt(a.duracao.split(':')[0]) * 3600
                        + parseInt(a.duracao.split(':')[1]) * 60);
                    return !(fimBlocoSeg <= agInicio || inicioSegundos >= agFim);
                });

                const duranteAlmoco = inicioAlmocoSeg !== null && fimAlmocoSeg !== null &&
                    !(fimBlocoSeg <= inicioAlmocoSeg || inicioSegundos >= fimAlmocoSeg);

                if (!ocupado && !duranteAlmoco) {
                    horariosDisponiveis.push({ inicio: blocoInicio, fim: blocoFim });
                }

                inicioSegundos += 30 * 60;
            }
        });

        console.log("🔹 Horários disponíveis finais:", horariosDisponiveis);
        res.json(horariosDisponiveis);

    } catch (erro) {
        console.error("❌ Erro no endpoint /horarios:", erro);
        res.status(500).json({ erro: "Erro ao consultar horários" });
    }
});

app.get('/cliente/:id/agendamentos-futuros', (req, res) => {
    const idCliente = req.params.id;
    console.log('ID do cliente recebido:', idCliente);

    const sql = `
       SELECT 
    A.id_agendamento,
    A.data_agendamento,
    A.duracao,
    C.nome_funcionario AS nome_profissional,
    S.nome_servico AS tipo_servico,
    U.nome_unidade AS unidade,
    CASE 
        WHEN A.id_servico = 4 THEN 48.00 
        ELSE (
            SELECT SP.valor
            FROM servicos_precos SP
            WHERE SP.id_servico = A.id_servico AND SP.ativo = TRUE
            ORDER BY SP.valor DESC
            LIMIT 1
        )
    END AS preco
FROM agendamentos A
JOIN funcionarios C ON A.id_funcionario = C.id_funcionario
JOIN servicos S ON A.id_servico = S.id_servico
JOIN unidades U ON A.id_unidade = U.id_unidade
WHERE A.id_cliente = ?
  AND A.data_agendamento > NOW()
ORDER BY A.data_agendamento DESC;


    `;

    conexao.query(sql, [idCliente], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar agendamentos futuros.", erro);
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos futuros.' });
        }

        console.log("Resultados brutos da query:", resultados);

        const agendamentosFormatados = resultados.map(ag => {
            const valorNumerico = Number(ag.preco) || 0;
            const valorFormatado = `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;

            return {
                id_agendamento: ag.id_agendamento,
                data_agendamento: ag.data_agendamento,
                duracao: ag.duracao,
                nome_servico: ag.tipo_servico,
                nome_colaborador: ag.nome_profissional,
                unidade: ag.unidade,
                valor: valorFormatado
            };
        });

        console.log("Agendamentos formatados:", agendamentosFormatados);

        res.json(agendamentosFormatados);
    });
});



app.patch('/agendamento/:id/cancelar', (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM agendamentos
        WHERE id_agendamento = ?
    `;

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) {
            console.error('Erro ao deletar agendamento: ', erro);
            return res.status(500).json({ erro: 'Erro ao deletar agendamento' });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: 'Agendamento não encontrado!' });
        }

        res.status(200).json({ mensagem: 'Agendamento deletado com sucesso!' });
    });
});

app.get('/funcionario/:id', autenticarToken, (req, res) => {
    const id = parseInt(req.params.id, 10);
    console.log('ID do funcionário recebido:', id);

    if (isNaN(id)) {
        console.warn('ID inválido recebido:', req.params.id);
        return res.status(400).json({ erro: 'ID de funcionário inválido' });
    }

    const sqlFuncionario = `
        SELECT 
            id_funcionario,
            nome_funcionario,
            email_funcionario,
            telefone_funcionario,
            data_nascimento_funcionario
        FROM funcionarios
        WHERE id_funcionario = ?;
    `;

    conexao.query(sqlFuncionario, [id], (erro, resultado) => {
        if (erro) {
            console.error('Erro na query de funcionário:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar funcionário' });
        }

        if (resultado.length === 0) {
            console.warn('Funcionário não encontrado com id:', id);
            return res.status(404).json({ erro: 'Funcionário não encontrado' });
        }

        const funcionario = resultado[0];

        const sqlEscala = `
            SELECT dia_semana,
                   id_unidade AS unidade,
                   hora_inicio AS inicio,
                   hora_fim AS fim,
                   hora_inicio_almoco AS inicio_almoco,
                   hora_fim_almoco AS fim_almoco
            FROM escalas
            WHERE id_funcionario = ?;
        `;

        conexao.query(sqlEscala, [id], (erroEscala, resultadoEscala) => {
            if (erroEscala) {
                console.error('Erro detalhado da query de escala:', erroEscala);
                return res.status(500).json({ erro: 'Erro ao buscar escala', detalhes: erroEscala });
            }

            const escala = {};
            resultadoEscala.forEach(item => {
                escala[item.dia_semana] = {
                    unidade: item.unidade,
                    inicio: item.inicio,
                    fim: item.fim,
                    inicio_almoco: item.inicio_almoco,
                    fim_almoco: item.fim_almoco
                };
            });

            const sqlServicos = `
                SELECT id_servico
                FROM servicos_funcionarios
                WHERE id_funcionario = ?;
            `;

            conexao.query(sqlServicos, [id], (erroServicos, resultadoServicos) => {
                if (erroServicos) {
                    console.error('Erro ao buscar serviços do funcionário:', erroServicos);
                    return res.status(500).json({ erro: 'Erro ao buscar serviços' });
                }

                const servicos = resultadoServicos.map(item => item.id_servico);

                const resposta = {
                    funcionario: { ...funcionario, escala, servicos }
                };

                console.log('JSON retornado:', resposta);
                res.json(resposta);
            });
        });
    });
});

app.get('/cliente/:id/agendamentos-historicos', (req, res) => {
    const idCliente = req.params.id;
    console.log('ID do cliente recebido:', idCliente);

    const sql = `
        SELECT 
            A.id_agendamento,
            A.data_agendamento,
            A.duracao,
            C.nome_funcionario AS nome_profissional,
            S.nome_servico AS tipo_servico,
            U.nome_unidade AS unidade,
            SP.valor AS preco
        FROM agendamentos A
        JOIN funcionarios C ON A.id_funcionario = C.id_funcionario
        JOIN servicos S ON A.id_servico = S.id_servico
        JOIN unidades U ON A.id_unidade = U.id_unidade
        LEFT JOIN servicos_precos SP 
            ON SP.id_servico = A.id_servico 
            AND SP.ativo = TRUE
            AND SP.valor = (
                SELECT MAX(valor)
                FROM servicos_precos
                WHERE id_servico = A.id_servico AND ativo = TRUE
            )
        WHERE A.id_cliente = ? 
        AND A.data_agendamento < NOW()
        ORDER BY A.data_agendamento DESC;
    `;

    conexao.query(sql, [idCliente], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar agendamentos históricos.", erro);
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos históricos.' });
        }

        console.log("Resultados brutos da query:", resultados);

        const agendamentosFormatados = resultados.map(ag => {
            const valorNumerico = Number(ag.preco) || 0;
            const valorFormatado = `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;
            return {
                id_agendamento: ag.id_agendamento,
                data_agendamento: ag.data_agendamento,
                duracao: ag.duracao,
                nome_profissional: ag.nome_profissional,
                tipo_servico: ag.tipo_servico,
                unidade: ag.unidade,
                preco: valorFormatado
            };
        });

        console.log("Agendamentos formatados:", JSON.stringify(agendamentosFormatados, null, 2));

        res.json(agendamentosFormatados);
    });
});






app.patch('/funcionario/:id', (req, res) => {
    const { id } = req.params;
    const { nome, data_nascimento, telefone, email, senha, escala, servicos } = req.body;

    if (!nome || !data_nascimento || !telefone || !email || !senha) {
        console.log('Campos obrigatórios não preenchidos!');
        return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
    }

    bcrypt.hash(senha, 10, (erroHash, senhaHash) => {
        if (erroHash) {
            console.error('Erro ao gerar hash da senha:', erroHash);
            return res.status(500).json({ erro: 'Erro ao gerar hash da senha' });
        }

        const sqlFuncionario = `
            UPDATE funcionarios
            SET nome_funcionario = ?, data_nascimento_funcionario = ?, telefone_funcionario = ?, email_funcionario = ?, senha_funcionario = ?
            WHERE id_funcionario = ?;
        `;
        conexao.query(sqlFuncionario, [nome, data_nascimento, telefone, email, senhaHash, id], (erro, resultado) => {
            if (erro) {
                console.error('Erro ao atualizar funcionário:', erro);
                return res.status(500).json({ erro: 'Erro ao atualizar funcionário' });
            }

            if (Array.isArray(escala)) {
                const sqlDeleteEscala = `DELETE FROM escalas WHERE id_funcionario = ?;`;
                conexao.query(sqlDeleteEscala, [id], (erroDelete) => {
                    if (erroDelete) console.error('Erro ao deletar escala antiga:', erroDelete);
                    else {
                        const valoresEscala = escala
                            .filter(item => item.dia !== undefined)
                            .map(item => [
                                Number(id),
                                Number(item.dia),
                                item.unidade ? Number(item.unidade) : null,
                                item.inicio || null,
                                item.fim || null,
                                item.inicio_almoco || null,
                                item.fim_almoco || null
                            ]);

                        if (valoresEscala.length > 0) {
                            const sqlInsertEscala = `
                                INSERT INTO escalas (id_funcionario, dia_semana, id_unidade, hora_inicio, hora_fim, hora_inicio_almoco, hora_fim_almoco)
                                VALUES ?;
                            `;
                            conexao.query(sqlInsertEscala, [valoresEscala], (erroInsert) => {
                                if (erroInsert) console.error('Erro ao inserir nova escala:', erroInsert);
                            });
                        }
                    }
                });
            }

            if (Array.isArray(servicos)) {
                const sqlDeleteServicos = `DELETE FROM servicos_funcionarios WHERE id_funcionario = ?;`;
                conexao.query(sqlDeleteServicos, [id], (erroDelete) => {
                    if (erroDelete) console.error('Erro ao deletar serviços antigos:', erroDelete);
                    else {
                        const valoresServicos = servicos.map(idServico => [id, idServico]);
                        if (valoresServicos.length > 0) {
                            const sqlInsertServicos = `
                                INSERT INTO servicos_funcionarios (id_funcionario, id_servico)
                                VALUES ?;
                            `;
                            conexao.query(sqlInsertServicos, [valoresServicos], (erroInsert) => {
                                if (erroInsert) console.error('Erro ao inserir serviços:', erroInsert);
                            });
                        }
                    }
                });
            }

            console.log('Funcionário atualizado com sucesso:', { id, nome, email, telefone, data_nascimento });
            res.status(200).json({
                mensagem: 'Funcionário atualizado com sucesso!',
                funcionario: { id_funcionario: id, nome_funcionario: nome, email_funcionario: email, telefone_funcionario: telefone, data_nascimento_funcionario: data_nascimento }
            });
        });
    });
});











app.post('/cadastro-funcionario', async (req, res) => {
    try {
        const { nome, data_nascimento, telefone, email, senha, escala, servicos } = req.body;

        if (!nome || !data_nascimento || !telefone || !email || !senha) {
            return res.status(400).json({ erro: 'Preencha todos os campos obrigatórios!' });
        }

        if (!escala || typeof escala !== 'object') {
            return res.status(400).json({ erro: 'Escala inválida!' });
        }

        if (!Array.isArray(servicos) || servicos.length === 0) {
            return res.status(400).json({ erro: 'Selecione pelo menos um serviço!' });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const sqlFuncionario = `
            INSERT INTO funcionarios 
            (nome_funcionario, data_nascimento_funcionario, telefone_funcionario, email_funcionario, senha_funcionario)
            VALUES (?, ?, ?, ?, ?)
        `;

        conexao.query(sqlFuncionario, [nome, data_nascimento, telefone, email, senhaHash], (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar funcionário:', erro);
                return res.status(500).json({ erro: 'Erro ao cadastrar funcionário' });
            }

            const idFuncionario = resultado.insertId;

            const valoresEscala = [];
            for (const dia of Object.keys(escala)) {
                const dado = escala[dia];
                if (!dado || !dado.unidade || !dado.inicio || !dado.fim) continue;

                valoresEscala.push([
                    idFuncionario,
                    dia,
                    dado.unidade,
                    dado.inicio,
                    dado.fim,
                    dado.inicio_almoco || null,
                    dado.fim_almoco || null
                ]);
            }

            const sqlEscala = `
                INSERT INTO escalas
                (id_funcionario, dia_semana, id_unidade, hora_inicio, hora_fim, hora_inicio_almoco, hora_fim_almoco)
                VALUES ?
            `;

            conexao.query(sqlEscala, [valoresEscala], (erro) => {
                if (erro) {
                    console.error('Erro ao inserir escala:', erro);
                    return res.status(500).json({ erro: 'Erro ao salvar escala do funcionário' });
                }

                const valoresServicos = servicos.map(idServico => [idFuncionario, idServico]);
                const sqlServicos = `
                    INSERT INTO servicos_funcionarios
                    (id_funcionario, id_servico)
                    VALUES ?
                `;

                conexao.query(sqlServicos, [valoresServicos], (erro) => {
                    if (erro) {
                        console.error('Erro ao inserir serviços:', erro);
                        return res.status(500).json({ erro: 'Erro ao salvar serviços do funcionário' });
                    }

                    return res.status(201).json({
                        mensagem: 'Funcionário, escala e serviços cadastrados com sucesso!',
                        funcionario_id: idFuncionario
                    });
                });
            });
        });

    } catch (erro) {
        console.error('Erro inesperado:', erro);
        res.status(500).json({ erro: 'Erro inesperado ao cadastrar funcionário' });
    }
});




app.use(express.static(__dirname + '/../../html'));

app.get('/agendamentos_servicos_ultimo_mes', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const sql = `
        SELECT S.nome_servico, COUNT(A.id_agendamento) AS total
    FROM agendamentos A
    JOIN servicos S ON A.id_servico = S.id_servico
    WHERE A.data_agendamento >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
    GROUP BY S.nome_servico;

    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar dados do gráfico:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar dados do gráfico' });
        }

        console.log('🔹 Resultados do gráfico:', resultados);
        res.json(resultados);
    });
});

app.get('/agendamentos_unidades_ultimo_mes', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const sql = `
        SELECT U.nome_unidade, COUNT(A.id_agendamento) AS total
        FROM agendamentos A
        JOIN unidades U ON A.id_unidade = U.id_unidade
        WHERE A.data_agendamento >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
        GROUP BY U.nome_unidade;
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar dados do gráfico de unidades:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar dados do gráfico de unidades' });
        }

        console.log('🔹 Resultados do gráfico de unidades:', resultados);
        res.json(resultados);
    });
});

app.get('/agendamentos_ultimo_ano', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const sql = `
        SELECT DATE_FORMAT(A.data_agendamento, '%Y-%m') AS mes, COUNT(*) AS total
        FROM agendamentos A
        GROUP BY mes
        ORDER BY mes ASC;

    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar dados do gráfico de agendamentos:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar dados do gráfico de agendamentos' });
        }

        console.log('🔹 Resultados do gráfico de agendamentos:', resultados);
        res.json(resultados);
    });
});

app.get('/agendamentos_profissionais', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    const sql = `
        SELECT C.nome_funcionario, COUNT(A.id_agendamento) AS total
FROM agendamentos A
JOIN funcionarios C ON A.id_funcionario = C.id_funcionario
GROUP BY C.nome_funcionario;
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar dados do gráfico dos profissionais :', erro);
            return res.status(500).json({ erro: 'Erro ao buscar dados do gráfico de profissionais' });
        }

        console.log('🔹 Resultados do gráfico de profissionais:', resultados);
        res.json(resultados);
    });
});

app.get("/buscar", (req, res) => {
    const termo = req.query.q || "";
    const sql = "SELECT opcao, acao FROM acoes WHERE opcao LIKE ? LIMIT 10";

    conexao.query(sql, [`%${termo}%`], (err, results) => {
        if (err) {
            console.error("Erro na busca:", err);
            return res.status(500).json({ error: "Erro no servidor" });
        }
        console.log('🔹 Resultados das acoes:', results);
        res.json(results);
    });
});

app.listen(3000, () => {
    console.log('server up & running');
})

app.get('/servico/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT 
            p.id_preco, 
            p.id_servico, 
            s.nome_servico,
            p.duracao, 
            p.valor
        FROM servicos_precos p
        JOIN servicos s ON p.id_servico = s.id_servico
        WHERE p.id_servico = ? AND p.id_unidade = 1 AND p.promocao = 0
    `;

    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar serviço' });
        if (resultado.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });

        res.json(resultado);
    });
});

app.delete('/deletar/:tipo/:id', (req, res) => {
    const { tipo, id } = req.params;

    let tabela = '';

    if (tipo === 'cliente') tabela = 'clientes';
    else if (tipo === 'funcionario') tabela = 'funcionarios';
    else return res.status(400).json({ erro: "Tipo inválido." });

    const sql = `DELETE FROM ${tabela} WHERE id_${tipo} = ?`;

    conexao.query(sql, [id], (erro) => {
        if (erro) {
            console.log("Erro ao apagar conta:", erro);
            return res.status(500).json({ erro: "Erro ao apagar conta." });
        }

        res.json({ mensagem: "Conta deletada com sucesso!" });
    });
});

app.get('/funcionario/:id/agendamentos-futuros', (req, res) => {
    console.log('Requisição recebida para agendamentos futuros do funcionário:', req.params.id);
    const idFuncionario = req.params.id;

    const sql = `
        SELECT 
A.id_agendamento,
    A.data_agendamento,
    A.duracao,
    CL.nome_cliente AS nome_cliente, -- nome do cliente
    S.nome_servico AS tipo_servico,
    U.nome_unidade AS unidade,
    SP.valor AS preco
FROM agendamentos A
JOIN clientes CL ON A.id_cliente = CL.id_cliente  -- join com clientes
JOIN servicos S ON A.id_servico = S.id_servico
JOIN unidades U ON A.id_unidade = U.id_unidade
LEFT JOIN servicos_precos SP 
    ON SP.id_servico = A.id_servico 
    AND SP.ativo = TRUE
    AND SP.valor = (
        SELECT MAX(valor)
        FROM servicos_precos
        WHERE id_servico = A.id_servico AND ativo = TRUE
    )
WHERE A.id_funcionario = ?
AND A.data_agendamento > NOW()
ORDER BY A.data_agendamento DESC;
    `;

    conexao.query(sql, [idFuncionario], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar agendamentos históricos:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos históricos.' });
        }

        console.log('Agendamentos brutos encontrados (backend):', resultados);

        const agendamentosFormatados = resultados.map(ag => ({
            id_agendamento: ag.id_agendamento,
            data_agendamento: ag.data_agendamento,
            duracao: ag.duracao,
            nome_cliente: ag.nome_cliente,
            nome_servico: ag.tipo_servico,
            unidade: ag.unidade,
            valor: `R$ ${(Number(ag.preco) || 0).toFixed(2).replace('.', ',')}`
        }));

        res.json(agendamentosFormatados);
    });
});
app.get('/funcionario/:id/agendamentos-historicos', (req, res) => {
    const idFuncionario = req.params.id;

    const sql = `
       SELECT 
A.id_agendamento,
    A.data_agendamento,
    A.duracao,
    CL.nome_cliente AS nome_cliente, -- nome do cliente
    S.nome_servico AS tipo_servico,
    U.nome_unidade AS unidade,
    SP.valor AS preco
FROM agendamentos A
JOIN clientes CL ON A.id_cliente = CL.id_cliente  -- join com clientes
JOIN servicos S ON A.id_servico = S.id_servico
JOIN unidades U ON A.id_unidade = U.id_unidade
LEFT JOIN servicos_precos SP 
    ON SP.id_servico = A.id_servico 
    AND SP.ativo = TRUE
    AND SP.valor = (
        SELECT MAX(valor)
        FROM servicos_precos
        WHERE id_servico = A.id_servico AND ativo = TRUE
    )
WHERE A.id_funcionario = ?
AND A.data_agendamento < NOW()
ORDER BY A.data_agendamento DESC;
    `;

    conexao.query(sql, [idFuncionario], (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar agendamentos históricos:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos históricos.' });
        }

        console.log('Agendamentos brutos encontrados (backend):', resultados);

        const agendamentosFormatados = resultados.map(ag => ({
            id_agendamento: ag.id_agendamento,
            data_agendamento: ag.data_agendamento,
            duracao: ag.duracao,
            nome_cliente: ag.nome_cliente,
            nome_servico: ag.tipo_servico,
            unidade: ag.unidade,
            valor: `R$ ${(Number(ag.preco) || 0).toFixed(2).replace('.', ',')}`
        }));

        res.json(agendamentosFormatados);
    });
});

app.get('/listar-profissionais', (req, res) => {
    console.log('Requisição para /profissionais recebida');
    console.log('Headers:', req.headers);
    console.log('Query params:', req.query);

    const sql = `
        SELECT id_funcionario, nome_funcionario, imagem_colaborador
        FROM funcionarios
        WHERE funcionario_ativo = 1
        ORDER BY nome_funcionario ASC;
    `;

    conexao.query(sql, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao executar query:', erro);
            return res.status(500).json({ erro: 'Erro ao buscar profissionais.' });
        }
        console.log('Resultados encontrados:', resultados.length);
        res.json(resultados);
    });
});
app.get('/promocao', async (req, res) => {
    const { funcionario, diaSemana, inicio, duracao } = req.query;

    if (!funcionario || diaSemana === undefined || !inicio || !duracao) {
        console.log("❌ Parâmetros ausentes:", { funcionario, diaSemana, inicio, duracao });
        return res.status(400).json({ erro: "Parâmetros ausentes" });
    }

    try {
        console.log("📌 Verificando promoção para:", { funcionario, diaSemana, inicio, duracao });

        // 1. Pega escala do dia da semana
        const [escala] = await conexao.promise().query(`
            SELECT hora_inicio, hora_fim
            FROM escalas
            WHERE id_funcionario = ?
              AND dia_semana = ?
        `, [funcionario, diaSemana]);

        if (escala.length === 0) {
            console.log("⚠️ Nenhuma escala encontrada para o funcionário nesse dia.");
            return res.json({ promocao: false });
        }

        const fimEscala = escala[0].hora_fim;

        // helpers
        const toMin = t => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
        };

        const inicioMin = toMin(inicio);
        const durMin = Number(duracao);
        const fimMin = inicioMin + durMin;
        const limiteMin = fimMin + 20;
        const fimEscalaMin = toMin(fimEscala);

        console.log("⏱️ Horários em minutos:", { inicioMin, durMin, fimMin, limiteMin, fimEscalaMin });

        // 2. Se passar do fim da escala, não tem promoção
        if (limiteMin > fimEscalaMin) {
            console.log("⛔ Intervalo com promoção ultrapassa o fim da escala.");
            return res.json({ promocao: false });
        }

        // 3. Verifica se algum agendamento ocupa o intervalo extra
        const [agendamentos] = await conexao.promise().query(`
            SELECT TIME(data_agendamento) AS inicio, duracao
            FROM agendamentos
            WHERE id_funcionario = ?
              AND DATE(data_agendamento) = CURDATE()
        `, [funcionario]);

        console.log("📋 Agendamentos existentes:", agendamentos);

        const conflito = agendamentos.some(a => {
            const aInicioMin = toMin(a.inicio);
            const aFimMin = aInicioMin + Number(a.duracao);
            console.log(`🔹 Agendamento: ${a.inicio} (${aInicioMin}-${aFimMin})`);

            const overlap = !(aFimMin <= fimMin || aInicioMin >= limiteMin);
            if (overlap) console.log("⚠️ Conflito detectado com agendamento existente!");
            return overlap;
        });

        if (conflito) return res.json({ promocao: false });

        console.log("✅ Promoção disponível!");
        return res.json({ promocao: true });

    } catch (erro) {
        console.error("Erro ao verificar promoção:", erro);
        res.status(500).json({ erro: "Erro ao verificar promoção" });
    }
});
