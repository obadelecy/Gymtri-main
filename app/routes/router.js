const express = require("express");

module.exports = function(application) {
  const router = express.Router();

  const alunoController = require("../controllers/alunoController");
  const academiaController = require("../controllers/academiaController");
  const profisController = require("../controllers/profisController");
  const agendamentosController = require("../controllers/agendamentosController")();

  const {
    verificarUsuAutenticado,
    limparSessao,
    gravarUsuAutenticado,
    verificarUsuAutorizado
  } = require("../models/autenticador_middleware");

  router.get("/", (req, res) => {
    res.render("pages/index");
  });

  router.get("/login", (req, res) => {
    res.render("pages/login", { falha: null, listaErros: null });
  });

  router.get("/cadastro", (req, res) => {
    res.render("pages/cadastro", {
      valores: {
        cep: "",
        logradouro: "",
        bairro: "",
        cidade: "",
        uf: "",
        numero: "",
        complemento: ""
      }
    });
  });

  router.get("/produtos", (req, res) => {
    res.render("pages/produtos");
  });

  router.post("/loginInterface", gravarUsuAutenticado, (req, res) => {
    alunoController.logar(req, res);
  });



  router.get("/aluno/agendamento", verificarUsuAutenticado, (req, res) => {
    agendamentosController.listarAgendamentos(req, res);
  });

  router.get("/aluno/novoAgendamento", verificarUsuAutenticado, (req, res) => {
    agendamentosController.novoAgendamento(req, res);
  });

  router.get("/aluno/relatorio", (req, res) => {
    res.render("pages/Aluno/relatorio");
  });

  router.get("/aluno/saude", (req, res) => {
    res.render("pages/Aluno/saude");
  });

  router.get("/aluno/treinos", (req, res) => {
    res.render("pages/Aluno/treinos");
  });

  router.get("/aluno/editarDados", (req, res) => {
    res.render("pages/Aluno/editarDados");
  });

  router.get("/aluno/buscarProfissional", (req, res) => {
    res.render("pages/Aluno/buscarProfissional");
  });

  router.get("/aluno/buscarAcademia", (req, res) => {
    res.render("pages/Aluno/buscarAcademia");
  });

  router.post(
    '/Aluno/createAgend',
    agendamentosController.regrasValidacao,
    (req, res) => {
      agendamentosController.criarAgendamento(req, res);
    }
  );
  router.post("/aluno", alunoController.cadastrarAluno);
  router.post("/academia", academiaController.cadastrarAcademia);
  router.post("/profissional", profisController.cadastrarProfis);
  router.post("/createAgend", agendamentosController.criarAgendamento);
  return router;
};
