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

    // Validação básica
    if (!id_cliente || !id_servico || !id_unidade || !id_funcionario || !data_agendamento || !duracao || !horario) {
        console.error("❌ Dados faltando:", req.body);
        return res.status(400).json({ erro: 'Faltam dados para criar agendamento!', dadosRecebidos: req.body });
    }

    // Combina data + horário
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
    const { id_servico, id_unidade, diaSemana } = req.query;

    if (!id_servico || !id_unidade || !diaSemana) {
        return res.status(400).json({ erro: "Parâmetros ausentes" });
    }

    try {
        const sql = `
            SELECT f.id_funcionario, f.nome_funcionario
            FROM funcionarios f
            JOIN escalas e ON f.id_funcionario = e.id_funcionario
            JOIN servicos_funcionarios sf ON f.id_funcionario = sf.id_funcionario
            WHERE sf.id_servico = ?
              AND e.id_unidade = ?
              AND e.dia_semana = ?
              AND f.funcionario_ativo = 1
        `;

        // ⚠️ Usando 'conexao' ao invés de 'pool'
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

    // Log para verificar os dados recebidos
    console.log("📥 Dados recebidos no backend:", { funcionario, data, diaSemana, duracao });

    if (!funcionario || !data || !diaSemana || !duracao) {
        return res.status(400).json({ erro: "Parâmetros ausentes" });
    }

    try {
        // 1️⃣ Busca a escala do funcionário para aquele dia da semana
        const sqlEscala = `
            SELECT hora_inicio, hora_fim
            FROM escalas
            WHERE id_funcionario = ?
              AND dia_semana = ?
        `;
        const [escalas] = await conexao.promise().query(sqlEscala, [funcionario, diaSemana]);
        console.log("🔹 Escalas retornadas:", escalas);

        if (escalas.length === 0) {
            return res.json([]); // Sem escala, sem horários
        }

        // 2️⃣ Busca agendamentos existentes para o funcionário nessa data
        const sqlAgendamentos = `
            SELECT TIME(data_agendamento) AS inicio, duracao
            FROM agendamentos
            WHERE id_funcionario = ?
              AND DATE(data_agendamento) = ?
        `;
        const [agendamentos] = await conexao.promise().query(sqlAgendamentos, [funcionario, data]);
        console.log("🔹 Agendamentos existentes:", agendamentos);

        const duracaoSegundos = parseInt(duracao.split(':')[0]) * 3600 + parseInt(duracao.split(':')[1]) * 60 + parseInt(duracao.split(':')[2]);

        const horariosDisponiveis = [];

        // 3️⃣ Para cada escala, criar blocos disponíveis
        escalas.forEach(escala => {
            let inicioSegundos = parseInt(escala.hora_inicio.split(':')[0]) * 3600
                               + parseInt(escala.hora_inicio.split(':')[1]) * 60
                               + parseInt(escala.hora_inicio.split(':')[2]);
            const fimSegundos = parseInt(escala.hora_fim.split(':')[0]) * 3600
                              + parseInt(escala.hora_fim.split(':')[1]) * 60
                              + parseInt(escala.hora_fim.split(':')[2]);

            while (inicioSegundos + duracaoSegundos <= fimSegundos) {
                const inicioHH = String(Math.floor(inicioSegundos / 3600)).padStart(2, '0');
                const inicioMM = String(Math.floor((inicioSegundos % 3600) / 60)).padStart(2, '0');
                const inicioSS = String(inicioSegundos % 60).padStart(2, '0');
                const blocoInicio = `${inicioHH}:${inicioMM}:${inicioSS}`;

                const fimBlocoSeg = inicioSegundos + duracaoSegundos;
                const fimHH = String(Math.floor(fimBlocoSeg / 3600)).padStart(2, '0');
                const fimMM = String(Math.floor((fimBlocoSeg % 3600) / 60)).padStart(2, '0');
                const fimSS = String(fimBlocoSeg % 60).padStart(2, '0');
                const blocoFim = `${fimHH}:${fimMM}:${fimSS}`;

                // Verifica se esse bloco bate com algum agendamento
                const ocupado = agendamentos.some(a => {
                    const agInicio = parseInt(a.inicio.split(':')[0]) * 3600
                                   + parseInt(a.inicio.split(':')[1]) * 60
                                   + parseInt(a.inicio.split(':')[2]);
                    const agFim = agInicio + (parseInt(a.duracao.split(':')[0]) * 3600
                                              + parseInt(a.duracao.split(':')[1]) * 60
                                              + parseInt(a.duracao.split(':')[2]));
                    return !(fimBlocoSeg <= agInicio || inicioSegundos >= agFim); // conflito
                });

                if (!ocupado) {
                    horariosDisponiveis.push({ inicio: blocoInicio, fim: blocoFim });
                }

                // Avança o bloco em 15 min (ou outro intervalo desejado)
                inicioSegundos += 15 * 60;
            }
        });

        console.log("🔹 Horários disponíveis finais:", horariosDisponiveis);
        res.json(horariosDisponiveis);

    } catch (erro) {
        console.error("❌ Erro no endpoint /horarios:", erro);
        res.status(500).json({ erro: "Erro ao consultar horários" });
    }
});





//ATÉ AQUI
app.get('/cliente/:id/agendamentos-futuros', (req, res) => {
    const idCliente = req.params.id

    const sql = `
            SELECT
        A.id_agendamento,
        A.data_agendamento,
        A.duracao,
        S.nome_servico,
        C.nome_funcionario AS nome_colaborador,
        C.imagem_funcionario AS imagem_colaborador,
        SP.valor
    FROM
        agendamentos A
    JOIN
        servicos S ON A.id_servico = S.id_servico
    JOIN
        funcionarios C ON A.id_funcionario= C.id_funcionario
    LEFT JOIN 
        servicos_precos SP ON A.id_servico = SP.id_servico
    WHERE
        A.id_cliente = ?
        AND DATE(A.data_agendamento) >= CURDATE()
    ORDER BY
        A.data_agendamento ASC;

    `

    conexao.query(sql, [idCliente], (erro, resultados) => {
        if (erro) {
            console.error("Erro ao buscar agendamentos futuros.", erro)
            return res.status(500).json({ erro: 'Erro ao buscar agendamentos futuros.' })
        }

        const agendamentosFormatados = resultados.map(ag => {
            const valorNumerico = Number(ag.valor) || 0;
            const valorFormatado = `R$ ${valorNumerico.toFixed(2).replace('.', ',')}`;

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
})

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

            // Agora buscamos os serviços do funcionário
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

                // Monta o JSON final
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
            SP.valor AS preco,
            S.nome_servico AS tipo_servico
        FROM agendamentos A
        JOIN funcionarios C ON A.id_funcionario = C.id_funcionario
        JOIN servicos S ON A.id_servico = S.id_servico
        LEFT JOIN servicos_precos SP 
            ON SP.id_servico = A.id_servico 
            AND SP.ativo = TRUE
            AND SP.valor = (
                SELECT MAX(valor)
                FROM servicos_precos
                WHERE id_servico = A.id_servico AND ativo = TRUE
            )
        WHERE A.id_cliente = ? 
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

        // Atualiza dados do funcionário
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

            // Atualizar escala
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

            // Atualizar serviços
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

            // Resposta final apenas no final do fluxo
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

        // 1️⃣ Criar funcionário
        conexao.query(sqlFuncionario, [nome, data_nascimento, telefone, email, senhaHash], (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar funcionário:', erro);
                return res.status(500).json({ erro: 'Erro ao cadastrar funcionário' });
            }

            const idFuncionario = resultado.insertId;

            // 2️⃣ Inserir escala
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

                // 3️⃣ Inserir serviços
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

                    // ✅ Tudo certo, resposta final
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



//GRAFICOS

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
        WHERE p.id_servico = ?
    `;
    
    conexao.query(sql, [id], (erro, resultado) => {
        if (erro) return res.status(500).json({ erro: 'Erro ao buscar serviço' });
        if (resultado.length === 0) return res.status(404).json({ erro: 'Serviço não encontrado' });
        
        // retorna todas as opções de duração e preço
        res.json(resultado);
    });
});