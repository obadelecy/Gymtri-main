const pool = require('../../config/pool_conexoes')
const {body, validationResult} = require('express-validator')
const novoAgendModel = require('../models/novoAgendModel')

const agendamentosController = {
    // Busca profissionais por especialidade
    getProfissionais: async (req, res) => {
        try {
            console.log('Recebida requisição para buscar profissionais');
            console.log('URL da requisição:', req.originalUrl);
            console.log('Especialidade:', req.query.especialidade);
            console.log('Usuário autenticado:', req.session.autenticado);
            console.log('Headers da requisição:', req.headers);
            
            const especialidade = req.query.especialidade;
            const profissionais = await novoAgendModel.findProfissionais(especialidade);
            
            console.log('Profissionais encontrados:', profissionais);
            res.header('Content-Type', 'application/json');
            res.json(profissionais);
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            res.status(500).json({ error: 'Erro ao buscar profissionais' });
        }
    },

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
            console.log('Iniciando listagem de agendamentos');
            const usuario = req.session.autenticado; // Obtém o usuário da sessão
            console.log('Usuário autenticado:', usuario);
            
            // Verifica se o usuário está autenticado
            if (!usuario || !usuario.id) {
                console.warn('Usuário não autenticado ou sem ID');
                return res.render("pages/Aluno/agendamento", {
                    agendamentos: [],
                    hasAgendamentos: false
                });
            }
            
            // Tenta listar com a junção com PROFISSIONAL
            try {
                const agendamentos = await pool.query(`
                    SELECT 
                        a.PROTOCOLO as protocolo,
                        p.PROFISSAO as tipo,
                        p.NOME as nome_profissional,
                        DATE_FORMAT(a.DATA_AGENDAMENTO, '%d/%m/%Y') as data_agendamento,
                        TIME_FORMAT(a.HORARIO, '%H:%i') as horario_agendamento
                    FROM AGENDAMENTOS a 
                    LEFT JOIN PROFISSIONAIS p ON a.NUMERO_DOC = p.NUMERO_DOC 
                    WHERE a.STATUS = 1 AND a.NUMERO_DOC = ? 
                    ORDER BY a.DATA_AGENDAMENTO DESC`, [usuario.id]);
                
                // Logs removidos para evitar poluição do console com dados brutos
                // console.log('Agendamentos encontrados:', JSON.stringify(agendamentos, null, 2));
                
                // Garantir que sempre retornamos um array e formatar os dados
                const agendamentosArray = Array.isArray(agendamentos) ? agendamentos : [];
                
                // Remover agendamentos com dados inválidos
                const agendamentosValidos = agendamentosArray.filter(agendamento => 
                    agendamento.protocolo && 
                    agendamento.data_agendamento && 
                    agendamento.horario_agendamento
                );
                
                // Formatar os dados para garantir consistência
                const agendamentosFormatados = agendamentosValidos.map(agendamento => ({
                    tipo: agendamento.tipo || 'Consulta',
                    profissional: agendamento.nome_profissional || 'Profissional não encontrado',
                    data: agendamento.data_agendamento,
                    horario: agendamento.horario_agendamento,
                    protocolo: agendamento.protocolo
                }));
                
                // Verificar se há agendamentos válidos
                const hasAgendamentos = agendamentosFormatados.length > 0;
                
                res.render("pages/Aluno/agendamento", {
                    agendamentos: agendamentosFormatados,
                    hasAgendamentos: hasAgendamentos
                });
                return;
            } catch (joinError) {
                // Se a tabela PROFISSIONAL não existir, tenta listar apenas os agendamentos
                if (joinError.code === 'ER_NO_SUCH_TABLE') {
                    const agendamentos = await pool.query(`
                        SELECT 
                        PROTOCOLO,
                        NUMERO_DOC as profissional,
                        DATE_FORMAT(DATA_AGENDAMENTO, '%d/%m/%Y') as data,
                        TIME_FORMAT(HORARIO, '%H:%i') as horario
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
            res.render("pages/Aluno/agendamento", {
                agendamentos: [],
                error: "Erro ao carregar seus agendamentos"
            });
            return;
        }
    },

    // Exibe a página de novo agendamento
    novoAgendamento: async (req, res) => {
        try {
            // Busca os profissionais ativos
            const especialidade = req.query.area || 'nutricionista'; // Usa a especialidade passada por query ou nutricionista como padrão
            const profissionais = await novoAgendModel.findProfissionais(especialidade);

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
        try {
            // Log detalhado do corpo da requisição
            // Logs removidos para evitar poluição do console com dados brutos
            // console.log('Corpo da requisição:', req.body);

            // Verifica se o corpo da requisição existe
            if (!req.body) {
                return res.status(400).json({
                    success: false,
                    message: "Corpo da requisição vazio"
                });
            }

            // Definir campos obrigatórios
            const camposObrigatorios = ['area', 'professional', 'date', 'time'];

            // Validação dos dados recebidos
            const dadosRecebidos = {
                area: req.body.area,
                professional: req.body.professional,
                date: req.body.date,
                time: req.body.time
            };

            // Função para validar campo
            const validarCampo = (campo, valor) => {
                if (!valor) {
                    return `Campo ${campo} é obrigatório.`;
                }
                if (typeof valor === 'string' && valor.trim() === '') {
                    return `Campo ${campo} não pode estar vazio.`;
                }
                return null;
            };

            // Validar cada campo
            const erros = camposObrigatorios.map(campo => {
                const valor = dadosRecebidos[campo];
                return validarCampo(campo, valor);
            }).filter(erro => erro !== null);

            // Se houver erros, retornar mensagem
            if (erros.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Dados inválidos",
                    errors: erros
                });
            }

            // Validar o profissional usando NUMERO_DOC
            try {
                // Validar NUMERO_DOC
                const numeroDoc = dadosRecebidos.professional;
                if (!numeroDoc || !/^[0-9]+$/.test(numeroDoc)) {
                    return res.status(400).json({
                        success: false,
                        message: "Número do documento do profissional inválido."
                    });
                }

                // Validar data e horário
                const data = new Date(dadosRecebidos.date);
                if (isNaN(data.getTime())) {
                    return res.status(400).json({
                        success: false,
                        message: "Data inválida."
                    });
                }

                // Validar horário
                const horario = dadosRecebidos.time;
                if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(horario)) {
                    return res.status(400).json({
                        success: false,
                        message: "Horário inválido. Formato deve ser HH:MM"
                    });
                }

                // Validar se o profissional existe
                const [profissional] = await pool.query(
                    `SELECT NUMERO_DOC FROM PROFISSIONAIS WHERE NUMERO_DOC = ?`,
                    [numeroDoc]
                );

                if (!profissional || profissional.length === 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Profissional não encontrado."
                    });
                }

                // Montar dados para inserção
                const dadosAgendamento = {
                    PROTOCOLO: Math.floor(Date.now() / 1000),
                    NUMERO_DOC: numeroDoc,
                    DATA_AGENDAMENTO: dadosRecebidos.date,
                    HORARIO: horario,
                    MOTIVO: dadosRecebidos.descricao || ""
                };

                // Inserir agendamento
                const resultadoAgendamento = await novoAgendModel.create(dadosAgendamento);
                
                if (!resultadoAgendamento) {
                    return res.status(500).json({
                        success: false,
                        message: "Erro ao criar agendamento"
                    });
                }

                // Retornar sucesso com redirecionamento
                return res.status(201).json({
                    success: true,
                    message: "Agendamento criado com sucesso!",
                    redirect: "/aluno/agendamentos"
                });

            } catch (error) {
                console.error("Erro ao processar agendamento:", error);
                return res.status(500).json({
                    success: false,
                    message: "Erro ao processar o agendamento."
                });
            }
        } catch (error) {
            console.error('Erro no controller:', error);
            return res.status(500).json({
                success: false,
                message: "Erro interno do servidor."
            });
        }
    }
};

module.exports = agendamentosController;
