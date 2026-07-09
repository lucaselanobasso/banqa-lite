const { getCard, blockCard, unblockCard } = require("../services/cardService");
const { handleHttpError } = require("../utils/http");

function getVirtualCard(req, res) {
  try {
    const payload = getCard(req.auth.userId);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao carregar cartao virtual.");
  }
}

function blockVirtualCard(req, res) {
  try {
    const payload = blockCard(req.auth.userId);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao bloquear cartao virtual.");
  }
}

function unblockVirtualCard(req, res) {
  try {
    const payload = unblockCard(req.auth.userId);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao desbloquear cartao virtual.");
  }
}

module.exports = {
  getVirtualCard,
  blockVirtualCard,
  unblockVirtualCard
};
