const pool = require("../../config/pool_conexoes");

const academiaModel = {
    // // Buscar todas academias ativas
    // findAll: async () => {
    //     try {
    //         const [resultados] = await pool.query(
    //             `SELECT * FROM ACADEMIA
    //              WHERE status_academia
    //              = 1`
    //         );
    //         return resultados;
    //     } catch (erro) {
    //         console.error("Erro no findAll:", erro);
    //         return [];
    //     }
    // },

    findEmail: async (email) =>{
        try {
            const [resultados] = await pool.query(
                `SELECT * FROM ACADEMIA WHERE EMAIL = ?`,
                [email]
            );
            return resultados;
        } catch (erro) {
            console.error("Erro no findById:", erro);
            return null;
        }
    },

    // // Buscar aluno por ID
    // findById: async (id_academia

    // ) => {
    //     try {
    //         const [resultados] = await pool.query(
    //             `SELECT * FROM aluno
    //              WHERE id_aluno
    //              = ?`,
    //             [id_aluno

    //             ]
    //         );
    //         return resultados;
    //     } catch (erro) {
    //         console.error("Erro no findById:", erro);
    //         return null;
    //     }
    // },

    // Criar nova academia
    create: async (academia) => {
        try {
            const [linhas, campos] = await pool.query('INSERT INTO ACADEMIA SET ?', [academia])
            console.log(linhas);
            console.log(campos);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }  
    },

//     // Atualizar dados da academia
//     update: async (academia, id) => {
//         try {
//             const [linhas] = await pool.query('UPDATE tarefas SET ? WHERE id_tarefa = ?', [academia, id])
//             return linhas;
//         } catch (error) {
//             return error;
//         }  
//     },

//     // Desativar academia (soft delete)
//     delete: async (academia, id) => {
//         try {
//             const [linhas] = await pool.query('UPDATE tarefas SET status_tarefa = 0  WHERE id_tarefa = ?', [academia, id])
//             return linhas;
//         } catch (error) {
//             return error;
//         }  
//     },
};

module.exports = academiaModel;