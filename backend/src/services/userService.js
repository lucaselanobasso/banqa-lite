const crypto = require("node:crypto");
const {
  findByEmail,
  findAuthUserByEmail,
  createSession,
  revokeSessionById,
  createUserWithVirtualCard
} = require("../repositories/userRepository");

function validateRequiredFields(payload) {
  const fullName = payload?.fullName?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password?.trim();

  if (!fullName || !email || !password) {
    const error = new Error("Campos obrigatorios: fullName, email e password.");
    error.statusCode = 400;
    throw error;
  }

  return { fullName, email, password };
}

function registerUser(payload) {
  const data = validateRequiredFields(payload);
  const existing = findByEmail(data.email);

  if (existing) {
    const error = new Error("Email ja cadastrado.");
    error.statusCode = 409;
    throw error;
  }

  return createUserWithVirtualCard(data);
}

function validateLoginFields(payload) {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password?.trim();

  if (!email || !password) {
    const error = new Error("Campos obrigatorios: email e password.");
    error.statusCode = 400;
    throw error;
  }

  return { email, password };
}

function loginUser(payload) {
  const { email, password } = validateLoginFields(payload);
  const user = findAuthUserByEmail(email);

  if (!user || Number(user.is_active) !== 1) {
    const error = new Error("Email ou senha invalidos.");
    error.statusCode = 401;
    throw error;
  }

  const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

  if (passwordHash !== user.password_hash) {
    const error = new Error("Email ou senha invalidos.");
    error.statusCode = 401;
    throw error;
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  createSession({
    userId: user.id,
    token,
    expiresAt
  });

  return {
    token
  };
}

function logoutUser(sessionId) {
  revokeSessionById(sessionId);

  return {
    message: "Logout realizado com sucesso."
  };
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser
};
