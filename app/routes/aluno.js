const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/alunoController');

// Rota para exibir o formulário (opcional, se quiser usar GET)
/*
router.get('/cadastro', (req, res) => {
    res.render('cadastro'); // ajuste o nome da view se for diferente
});
*/

// Rota para processar o formulário do aluno
router.post('/aluno', usuarioController.cadastrarAluno);

module.exports = router;
