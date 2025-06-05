const pool = require("../../config/pool_conexoes");
 
const profisModel = {
    // Cadastrar profissional
    create: async (profissionais) => {
        try {
            const [linhas, campos] = await pool.query('INSERT INTO PROFISSIONAIS SET ?', [profissionais])
            console.log(linhas);
            console.log(campos);
            return linhas;
        } catch (error) {
            console.log(error);
            return null;
        }  
    },
    // create: async (dados) => {
    //     const {
    //         fullname,
    //         emailRegister,
    //         profession,
    //         numberRegister,
    //         passwordRegister,
    //         numberDoc,
    //         cpfRegister
    //     } = dados;
    //     //VALUES (?, ?, ?, ?, ?, ?, ?)
    //     try {
    //         const [resultado] = await pool.query(
    //             `INSERT INTO PROFISSIONAIS
    //             (nome, email, profissao, numero_doc, senha, telefone, cpf_prof)
    //             `,
    //             [fullname, emailRegister, profession, numberDoc, passwordRegister, numberRegister, cpfRegister]
    //         );
    //         return resultado.insertId;
    //     } catch (erro) {
    //         console.error("Erro ao criar profissional:", erro);
    //         throw erro;
    //     }
    // },
 
    // Buscar todos os profissionais ativos
    findAll: async () => {
        try {
            const [resultado] = await pool.query(
                `SELECT * FROM PROFISSIONAIS `
            );
            return resultado;
        } catch (erro) {
            console.error("Erro ao buscar profissionais:", erro);
            throw erro;
        }
    },
 
    // Buscar por ID
    findById: async (id) => {
        try {
            const [resultado] = await pool.query(
                `SELECT * FROM PROFISSIONAIS WHERE id_profissional = ? `,
                [id]
            );
            return resultado[0];
        } catch (erro) {
            console.error("Erro ao buscar profissional por ID:", erro);
            throw erro;
        }
    },
 
    // Atualizar profissional
    update: async (id, dados) => {
        const {
            fullname,
            emailRegister,
            profession,
            profissionalReg,
            numberDoc,
            cpfRegister
        } = dados;
 
        try {
            const [resultado] = await pool.query(
                `UPDATE PROFISSIONAIS
                 SET  nome = ?, email = ?, profissao = ?, crm = ?, telefone = ?, cpf = ?
                 WHERE id_profissional = ?`,
                [fullname, emailRegister, profession, profissionalReg, numberDoc, cpfRegister, id]
            );
            return resultado.affectedRows;
        } catch (erro) {
            console.error("Erro ao atualizar profissional:", erro);
            throw erro;
        }
    },

    findEmail: async (email) => {
        try {
            const [resultado] = await pool.query(
                "SELECT * FROM PROFISSIONAIS WHERE email = ? ",
                [email]
            );
            return resultado;
        } catch (erro) {
            console.error("Erro ao buscar profissional por email:", erro);
            throw erro;
        }
    }
 
    // // "Deletar" profissional (soft delete)
    // delete: async (id) => {
    //     try {
    //         const [resultado] = await pool.query(
    //             `UPDATE PROFISSIONAIS SET = 0 WHERE id_profissional = ?`,
    //             [id]
    //         );
    //         return resultado.affectedRows;
    //     } catch (erro) {
    //         console.error("Erro ao deletar profissional:", erro);
    //         throw erro;
    //     }
    // }
};
 
module.exports = profisModel;