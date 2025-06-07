const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/alunoController');
const agendamentosController = require('../controllers/agendamentosController');
const { verificarUsuAutenticado } = require('../models/autenticador_middleware');

// Rota para buscar profissionais por especialidade
router.get('/api/profissionais', verificarUsuAutenticado, agendamentosController.getProfissionais);
// Rota para exibir o formulário (opcional, se quiser usar GET)
/*
router.get('/cadastro', (req, res) => {
    res.render('cadastro'); // ajuste o nome da view se for diferente
});
*/

// Rota para processar o formulário do aluno
router.post('/aluno', usuarioController.cadastrarAluno);

// Rotas de agendamentos
router.get('/agendamentos', agendamentosController.listarAgendamentos);
router.get('/agendamentos/novo', agendamentosController.novoAgendamento);
router.post('/agendamentos', agendamentosController.criarAgendamento);

// Rotas para editar agendamento
router.get('/agendamentos/:id/editar', verificarUsuAutenticado, agendamentosController.editarAgendamento);
router.post('/agendamentos/:id/editar', verificarUsuAutenticado, agendamentosController.atualizarAgendamento);

// Rota para cancelar agendamento
router.post('/agendamentos/:id/cancelar', verificarUsuAutenticado, agendamentosController.cancelarAgendamento);

module.exports = router;
