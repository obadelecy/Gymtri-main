const pool = require("../../config/pool_conexoes");

const alunoModel = {
    // Buscar todos os alunos ativos
    findAll: async () => {
        try {
            const [resultados] = await pool.query(
                `SELECT * FROM aluno
                 WHERE status_aluno
                 = 1`
            );
            return resultados;
        } catch (erro) {
            console.error("Erro no findAll:", erro);
            return [];
        }
    },

    findEmail: async (email) => {
        try {
            const [resultados] = await pool.query(
                `SELECT * FROM ALUNO WHERE EMAIL = ?`,
                [email]
            );
            return resultados;
        } catch (erro) {
            console.error("Erro no findEmail:", erro);
            if (erro.code === 'ER_USER_LIMIT_REACHED') {
                // Se o erro for limite de conexões, tentamos novamente após um pequeno delay
                console.log("Tentando novamente após 1 segundo...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                return await alunoModel.findEmail(email);
            }
            return null;
        } finally {
            // Com pool.promise(), as conexões são liberadas automaticamente
            // Não precisamos chamar pool.release()
            console.log("Conexão liberada automaticamente pelo pool.promise()");
        }
    },

    // Buscar aluno por ID
    findById: async (id_aluno

    ) => {
        try {
            const [resultados] = await pool.query(
                `SELECT * FROM aluno
                 WHERE id_aluno
                 = ?`,
                [id_aluno

                ]
            );
            return resultados;
        } catch (erro) {
            console.error("Erro no findById:", erro);
            return null;
        }
    },

    // Criar novo aluno
    create: async (aluno) => {
        try {
            const [linhas, campos] = await pool.query('INSERT INTO ALUNO SET ?', [aluno])
            console.log(linhas);
            console.log(campos);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }  
    },

    // Atualizar dados do aluno
    update: async (aluno, id) => {
        try {
            const [linhas] = await pool.query('UPDATE tarefas SET ? WHERE id_tarefa = ?', [aluno, id])
            return linhas;
        } catch (error) {
            return error;
        }  
    },

    // Desativar aluno (soft delete)
    delete: async (aluno, id) => {
        try {
            const [linhas] = await pool.query('UPDATE tarefas SET status_tarefa = 0  WHERE id_tarefa = ?', [aluno, id])
            return linhas;
        } catch (error) {
            return error;
        }  
    },
};

module.exports = alunoModel;