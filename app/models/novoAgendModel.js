const pool = require('../../config/pool_conexoes');

module.exports = {

    findAll: async () => {
        try {
            const [resultados] = await pool.query(
                'SELECT * FROM AGENDAMENTOS WHERE STATUS = 1'
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    findId: async (id) => {
        try {
            const [resultados] = await pool.query(
                'SELECT * FROM AGENDAMENTOS WHERE STATUS = 1 AND PROTOCOLO = ?',
                [id]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    findPage: async (pagina, total) => {
        try {
            const [resultados] = await pool.query(
                'SELECT * FROM AGENDAMENTOS WHERE STATUS = 1 LIMIT ?, ?',
                [pagina, total]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

    create: async (dadosForm) => {
        try {
            // Garantir que os dados estão no formato correto
            const protocolo = Math.floor(Date.now() / 1000);
            const valores = [
                dadosForm.NUMERO_DOC,     // NUMERO_DOC
                dadosForm.DURACAO,       // DURACAO
                dadosForm.HORARIO,       // HORARIO
                dadosForm.DATA_AGENDAMENTO, // DATA_AGENDAMENTO
                1 // STATUS
            ];

            const [resultados] = await pool.query(
                'INSERT INTO AGENDAMENTOS (NUMERO_DOC, DURACAO, HORARIO, DATA_AGENDAMENTO, STATUS) VALUES (?, ?, ?, ?, ?)',
                valores
            );
            return resultados;
        } catch (error) {
            console.error('Erro ao criar agendamento:', {
                error,
                message: error.message,
                stack: error.stack
            });
            return null;
        }
    },

    findProfissionais: async (especialidade) => {
        try {
            // Validação do parâmetro
            if (!especialidade || typeof especialidade !== 'string') {
                console.warn('Especialidade inválida:', especialidade);
                return [];
            }

            // Prepara a string para busca flexível
            const especialidadeBusca = String(especialidade)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ');

            // Logs detalhados
            // Logs removidos para evitar poluição do console com dados brutos
            // console.log('Query completa:', { ... });

            // Query SQL mais flexível
            const query = `
                SELECT NUMERO_DOC as id, NOME as nome, PROFISSAO as profissao 
                FROM PROFISSIONAIS 
                WHERE 
                    -- Busca exata (case-insensitive)
                    LOWER(PROFISSAO) = LOWER(?)
                    -- Busca contém (case-insensitive)
                    OR LOWER(PROFISSAO) LIKE CONCAT('%', LOWER(?), '%')
                    -- Busca início (case-insensitive)
                    OR LOWER(PROFISSAO) LIKE CONCAT(LOWER(?), '%')
                    -- Busca fim (case-insensitive)
                    OR LOWER(PROFISSAO) LIKE CONCAT('%', LOWER(?))
                ORDER BY NOME
            `;

            console.log('Query SQL:', query);
            console.log('Parâmetro usado na query:', especialidadeBusca);
            
            // Usa especialidadeBusca que foi corretamente definida
            const [resultados] = await pool.query(query, [especialidadeBusca, especialidadeBusca, especialidadeBusca, especialidadeBusca]);
            
            // Logs removidos para evitar poluição do console com dados brutos
            // console.log('Profissionais encontrados:', resultados);
            return resultados || [];
        } catch (error) {
            console.error('Erro ao buscar profissionais:', {
                error,
                message: error.message,
                stack: error.stack
            });
            return [];
        }
    },

    update: async (dadosForm, id) => {
        try {
            const [resultados] = await pool.query(
                'UPDATE AGENDAMENTOS SET ? WHERE PROTOCOLO = ?',
                [dadosForm, id]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    delete: async (id) => {
        try {
            const [resultados] = await pool.query(
                'UPDATE AGENDAMENTOS SET STATUS = 0 WHERE PROTOCOLO = ?',
                [id]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    totalReg: async () => {
        try {
            const [resultados] = await pool.query(
                'SELECT COUNT(*) as total FROM AGENDAMENTOS WHERE STATUS = 1'
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },


    posicaoReg: async (id) => {
        try {
            const [resultados] = await application.config.pool_conexoes.query(
                `SELECT *, 
                  (SELECT COUNT(*) + 1 FROM agendamentos AS a2 WHERE a2.id_agendamento < a1.id_agendamento AND status_agendamento = 1) AS numero_ordem 
                  FROM agendamentos AS a1 
                  WHERE a1.id_agendamento = ? AND status_agendamento = 1`,
                [id]
            );
            return resultados;
        } catch (error) {
            return error;
        }
    },

};
