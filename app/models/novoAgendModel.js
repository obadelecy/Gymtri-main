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
            const [resultados] = await pool.query(
                'INSERT INTO AGENDAMENTOS (NUMERO_DOC, DURACAO, HORARIO, DATA_AGENDAMENTO, STATUS) VALUES (?, ?, ?, ?, 1)',
                [dadosForm]
            );
            return resultados;
        } catch (error) {
            console.log(error);
            return null;
        }
    },

    findProfissionais: async () => {
        try {
            const [resultados] = await pool.query(
                'SELECT id, nome FROM profissionais WHERE status = "ativo" ORDER BY nome'
            );
            return resultados;
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
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
