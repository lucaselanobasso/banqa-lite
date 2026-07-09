const { getAccount, getTransactions } = require("../services/accountService");
const { handleHttpError } = require("../utils/http");

function getAccountDetails(req, res) {
  try {
    const payload = getAccount(req.auth.userId);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao carregar conta.");
  }
}

function getAccountTransactions(req, res) {
  try {
    const payload = getTransactions(req.auth.userId, req.query);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao carregar extrato.");
  }
}

module.exports = {
  getAccountDetails,
  getAccountTransactions
};
