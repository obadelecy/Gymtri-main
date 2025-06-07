const pool = require('../../config/pool_conexoes');

// Função para formatar hora no padrão MySQL TIME (HH:MM:SS)
function formatarHora(horaISO) {
    if (!horaISO) return null;
    let horas, minutos;
    if (horaISO.includes('T')) {
        const data = new Date(horaISO);
        horas = data.getHours().toString().padStart(2, '0');
        minutos = data.getMinutes().toString().padStart(2, '0');
    } else {
        [horas, minutos] = horaISO.split(':');
        horas = horas.padStart(2, '0');
        minutos = minutos.padStart(2, '0');
    }
    return `${horas}:${minutos}:00`;
}

// Função para formatar duração em minutos para formato TIME (hh:mm:ss)
function formatDuration(minutes) {
    // Se já é uma string no formato HH:MM:SS, retorna como está
    if (typeof minutes === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(minutes)) {
        return minutes;
    }
    
    // Se é uma string numérica, converte para número
    if (typeof minutes === 'string') {
        const num = parseInt(minutes, 10);
        if (!isNaN(num)) {
            return formatDuration(num);
        }
    }
    
    // Se é um número válido, converte para formato TIME
    if (typeof minutes === 'number' && !isNaN(minutes)) {
        const hrs = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    }
    
    // Caso padrão: retorna duração padrão de 30 minutos
    return '00:30:00';
}

module.exports = {
    // Lista todos os agendamentos
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

    // Lista agendamentos por aluno (usando CPF_ALUNO)
    findByAluno: async (cpfAluno) => {
        try {
            console.log('Buscando agendamentos para aluno:', cpfAluno);
            
            const [resultados] = await pool.query(
                'SELECT a.*, p.NOME as nome_profissional, p.PROFISSAO as tipo ' +
                'FROM AGENDAMENTOS a ' +
                'LEFT JOIN PROFISSIONAIS p ON a.NUMERO_DOC = p.NUMERO_DOC ' +
                'WHERE a.STATUS = 1 AND a.CPF_ALUNO = ? ' +
                'ORDER BY a.DATA_AGENDAMENTO DESC',
                [cpfAluno]
            );
            
            console.log('Resultados da query:', resultados);
            return resultados;
        } catch (error) {
            console.error('Erro ao listar agendamentos por aluno:', error);
            return [];
        }
    },

    // Busca agendamento por ID
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

    // Busca paginada
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

    // Cria novo agendamento
    create: async (dadosForm) => {
        try {
            // Garantir que os dados estão no formato correto
            const duracaoFormatada = formatDuration(dadosForm.DURACAO);
            const horarioFormatado = formatarHora(dadosForm.HORARIO);
            
            const valores = [
                dadosForm.NUMERO_DOC,     // NUMERO_DOC (profissional)
                dadosForm.CPF_ALUNO,      // CPF_ALUNO (aluno)
                duracaoFormatada,         // DURACAO convertido para formato TIME
                horarioFormatado,         // HORARIO formatado para HH:MM:SS
                dadosForm.DATA_AGENDAMENTO, // DATA_AGENDAMENTO (YYYY-MM-DD)
                1 // STATUS
            ];

            const [resultados] = await pool.query(
                'INSERT INTO AGENDAMENTOS (NUMERO_DOC, CPF_ALUNO, DURACAO, HORARIO, DATA_AGENDAMENTO, STATUS) VALUES (?, ?, ?, ?, ?, ?)',
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

    // Busca profissionais por especialidade
    findProfissionais: async (especialidade) => {
        try {
            if (!especialidade || typeof especialidade !== 'string') {
                console.warn('Especialidade inválida:', especialidade);
                return [];
            }

            const especialidadeBusca = String(especialidade)
                .toLowerCase()
                .trim()
                .replace(/\s+/g, ' ');

            const query = `
                SELECT NUMERO_DOC as id, NOME as nome, PROFISSAO as profissao 
                FROM PROFISSIONAIS 
                WHERE 
                    LOWER(PROFISSAO) = LOWER(?)
                    OR LOWER(PROFISSAO) LIKE CONCAT('%', LOWER(?), '%')
                    OR LOWER(PROFISSAO) LIKE CONCAT(LOWER(?), '%')
                    OR LOWER(PROFISSAO) LIKE CONCAT('%', LOWER(?))
                ORDER BY NOME
            `;

            const [resultados] = await pool.query(query, [
                especialidadeBusca, especialidadeBusca,
                especialidadeBusca, especialidadeBusca
            ]);
            return resultados;
        } catch (error) {
            console.error('Erro ao buscar profissionais:', error);
            return [];
        }
    },

    // Atualiza agendamento
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

    // Remove agendamento
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

    // Conta total de registros
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

    // Posição do registro
    posicaoReg: async (id) => {
        try {
            const [resultados] = await pool.query(
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

    // Exporta a função formatDuration
    formatDuration
};
