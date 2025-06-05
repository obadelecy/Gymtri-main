const { validationResult } = require("express-validator");
const aluno = require("./alunoModel");
const academia = require("./academiaModel");
const profisModel = require("./profisModel");
const bcrypt = require("bcryptjs");
const profissional = require("./profisModel")

const verificarUsuAutenticado = (req, res, next) => {
    if (req.session.autenticado) {
        var autenticado = req.session.autenticado;
        req.session.logado = req.session.logado + 1;
    } else {
        var autenticado = { autenticado: null, id: null, tipo: null };
        req.session.logado = 0;
    }
    req.session.autenticado = autenticado;
    next();
};

limparSessao = (req, res, next) => {
    req.session.destroy();
    next();
};

gravarUsuAutenticado = async (req, res, next) => {
    const erros = validationResult(req);
    var autenticado = { autenticado: null, id: null, tipo: null };
    if (erros.isEmpty()) {
        var dadosForm = {
            user_usuario: req.body.nome,
            senha_usuario: req.body.senha,
            tipo_usuario: req.body.tipo
        };
        if (dadosForm.tipo_usuario === 'interfaceUsuario'){
            var results = await aluno.findEmail(dadosForm.user_usuario);
            var tipoUsuario = 'aluno'
        } else if (dadosForm.tipo_usuario === 'interfaceAcademia'){
            var results = await academia.findEmail(dadosForm.user_usuario);
            var tipoUsuario = 'academia'
        } else if (dadosForm.tipo_usuario === 'interfaceProfissional') {
            var results = await profisModel.findEmail(dadosForm.user_usuario);
            var tipoUsuario = 'profissional'
        }
        console.log(results);
        if (results && results.length === 1) {
            if (bcrypt.compareSync(dadosForm.senha_usuario, results[0].SENHA)) {
                var autenticado = {
                    autenticado: results[0].NOME_COMPLETO,
                    id: results[0].CPF,
                    tipo: tipoUsuario
                };
            }
        }
    }
    console.log(autenticado)
    req.session.autenticado = autenticado;
    req.session.logado = 0;
    next();
};

verificarUsuAutorizado = (tipoPermitido, destinoFalha) => {
    return (req, res, next) => {
        if (
            req.session.autenticado.autenticado != null &&
            tipoPermitido.find(function (element) {
                return element == req.session.autenticado.tipo;
            }) != undefined
        ) {
            next();
        } else {
            res.render(destinoFalha, req.session.autenticado);
        }
    };
};

module.exports = {
    verificarUsuAutenticado,
    limparSessao,
    gravarUsuAutenticado,
    verificarUsuAutorizado,
};
