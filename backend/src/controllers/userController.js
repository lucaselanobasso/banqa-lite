const { registerUser, loginUser, logoutUser } = require("../services/userService");
const { handleHttpError } = require("../utils/http");

function register(req, res) {
  try {
    const createdUser = registerUser(req.body);
    return res.status(201).json(createdUser);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao cadastrar usuario.");
  }
}

function login(req, res) {
  try {
    const payload = loginUser(req.body);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao fazer login.");
  }
}

function logout(req, res) {
  try {
    const payload = logoutUser(req.auth.sessionId);
    return res.status(200).json(payload);
  } catch (error) {
    return handleHttpError(res, error, "Erro interno ao fazer logout.");
  }
}

module.exports = {
  register,
  login,
  logout
};
