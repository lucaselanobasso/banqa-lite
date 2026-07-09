const { deposit, withdraw, transfer } = require("../services/operationService");
const { handleHttpError } = require("../utils/http");

function createDeposit(req, res) {
  try {
    const payload = deposit(req.auth.userId, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao realizar deposito.");
  }
}

function createWithdraw(req, res) {
  try {
    const payload = withdraw(req.auth.userId, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao realizar saque.");
  }
}

function createTransfer(req, res) {
  try {
    const payload = transfer(req.auth.userId, req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao realizar transferencia.");
  }
}

module.exports = {
  createDeposit,
  createWithdraw,
  createTransfer
};
