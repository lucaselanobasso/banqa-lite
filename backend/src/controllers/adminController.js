const { resetDatabase } = require("../services/adminService");
const { handleHttpError } = require("../utils/http");

function reset(req, res) {
  try {
    const payload = resetDatabase();
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao resetar banco.");
  }
}

module.exports = {
  reset
};
