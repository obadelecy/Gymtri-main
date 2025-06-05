const pool = require('../../config/pool_conexoes')
const {body, validationResult} = require('express-validator')
const novoAgendModel = require('../models/novoAgendModel')

module.exports = function (application) {
    const agendamentosController = {

        // Validações para os campos do formulário
        regrasValidacao: [
            body("area")
                .not().equals("null").withMessage("Selecione uma especialidade válida!"),

            body("professional")
                .not().equals("null").withMessage("Selecione um profissional válido!"),

            body("date")
                .isISO8601().withMessage("Data inválida!"),

            body("time")
                .notEmpty().withMessage("Horário obrigatório!"),

            body("reason")
                .isLength({ min: 5, max: 200 }).withMessage("Descrição deve ter entre 5 e 200 caracteres!")
        ],

        // Lista os agendamentos do usuário
        listarAgendamentos: async (req, res) => {
            try {
                const usuario = req.session.autenticado; // Obtém o usuário da sessão
                
                // Primeiro tenta listar com a junção com PROFISSIONAL
                try {
                    const agendamentos = await pool.query(`
                        SELECT a.*, p.nome as nome_profissional 
                        FROM AGENDAMENTOS a 
                        JOIN profissionais p ON a.id_profissional = p.id 
                        WHERE a.NUMERO_DOC = ? 
                        ORDER BY a.DATA_AGENDAMENTO DESC`, [usuario.id]);
                    
                    res.render("pages/Aluno/agendamento", {
                        agendamentos: agendamentos
                    });
                    return;
                } catch (joinError) {
                    // Se a tabela PROFISSIONAL não existir, tenta listar apenas os agendamentos
                    if (joinError.code === 'ER_NO_SUCH_TABLE') {
                        const agendamentos = await pool.query(`
                            SELECT * 
                            FROM AGENDAMENTOS 
                            WHERE NUMERO_DOC = ? 
                            ORDER BY DATA_AGENDAMENTO DESC`, [usuario.id]);
                        
                        res.render("pages/Aluno/agendamento", {
                            agendamentos: agendamentos
                        });
                        return;
                    }
                    throw joinError;
                }
            } catch (error) {
                console.error('Erro ao listar agendamentos:', error);
                res.status(500).render("pages/Aluno/agendamento", {
                    agendamentos: [],
                    error: "Erro ao carregar seus agendamentos"
                });
            }
        },

        // Exibe a página de novo agendamento
        novoAgendamento: async (req, res) => {
            try {
                // Busca os profissionais ativos
                const profissionais = await novoAgendModel.findProfissionais();

                res.render("pages/Aluno/novoAgendamento", {
                    nutricionista: "Nutricionista",
                    personal: "Personal Trainer",
                    profissionais: profissionais,
                    nome_profissional: "",
                    date: "",
                    time: "",
                    dateError: "",
                    timeError: "",
                    descricao: ""
                });
            } catch (error) {
                console.error('Erro ao buscar profissionais:', error);
                res.render("pages/Aluno/novoAgendamento", {
                    nutricionista: "Nutricionista",
                    personal: "Personal Trainer",
                    profissionais: [],
                    nome_profissional: "",
                    date: "",
                    time: "",
                    dateError: "",
                    timeError: "",
                    descricao: ""
                });
            }
        },

        criarAgendamento: async (req, res) => {
            const erros = validationResult(req);
            
            if (!erros.isEmpty()) {
                const profissionais = await novoAgendModel.findProfissionais();
                
                res.render("pages/Aluno/novoAgendamento", {
                    nutricionista: "Nutricionista",
                    personal: "Personal Trainer",
                    profissionais: profissionais,
                    nome_profissional: req.body.professional,
                    date: req.body.date,
                    time: req.body.time,
                    dateError: erros.errors.find(e => e.param === 'date')?.msg || '',
                    timeError: erros.errors.find(e => e.param === 'time')?.msg || '',
                    descricao: req.body.reason
                });
                return;
            }

            const dadosAgendamento = {
                especialidade: req.body.area,
                id_profissional: req.body.professional,
                data: req.body.date,
                horario: req.body.time,
                descricao: req.body.reason,
                numero_doc: req.session.autenticado.id
            };

            try {
                await pool.query(
                    'INSERT INTO AGENDAMENTOS (especialidade, id_profissional, data, horario, descricao, numero_doc) VALUES (?, ?, ?, ?, ?, ?)',
                    [dadosAgendamento.especialidade, dadosAgendamento.id_profissional, dadosAgendamento.data, dadosAgendamento.horario, dadosAgendamento.descricao, dadosAgendamento.numero_doc]
                );
                res.redirect("/aluno/agendamentos");
            } catch (e) {
                console.error(e);
                res.json({ erro: "Erro ao salvar o agendamento." });
            }
        }
    };

    return agendamentosController;
};
