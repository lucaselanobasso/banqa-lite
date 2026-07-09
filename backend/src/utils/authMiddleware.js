const { findValidSessionByToken } = require("../repositories/userRepository");

function extractBearerToken(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }

  const [scheme, token] = authorizationHeader.split(" ");

  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token.trim();
}

function authMiddleware(req, res, next) {
  const token = extractBearerToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: "Token de autenticacao ausente ou invalido." });
  }

  const session = findValidSessionByToken(token);

  if (!session) {
    return res.status(401).json({ message: "Sessao invalida ou expirada." });
  }

  req.auth = {
    userId: session.user_id,
    sessionId: session.id,
    token: session.token
  };

  return next();
}

module.exports = {
  authMiddleware
};
