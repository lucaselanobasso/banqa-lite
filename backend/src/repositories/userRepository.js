const crypto = require("node:crypto");
const { executeInTransaction, get, run } = require("./databaseRepository");

function findByEmail(email) {
  return get("SELECT id, email FROM users WHERE email = ?", [email]);
}

function findAuthUserByEmail(email) {
  return get(
    `
    SELECT id, email, password_hash, is_active
    FROM users
    WHERE email = ?
  `,
    [email]
  );
}

function createSession({ userId, token, expiresAt }) {
  run(
    `
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (?, ?, ?)
  `,
    [userId, token, expiresAt]
  );
}

function revokeSessionById(sessionId) {
  run(
    `
    UPDATE sessions
    SET revoked_at = CURRENT_TIMESTAMP
    WHERE id = ? AND revoked_at IS NULL
  `,
    [sessionId]
  );
}

function findValidSessionByToken(token) {
  return get(
    `
    SELECT s.id, s.user_id, s.token, s.expires_at, s.revoked_at
    FROM sessions s
    WHERE s.token = ?
      AND s.revoked_at IS NULL
      AND datetime(s.expires_at) > datetime('now')
  `,
    [token]
  );
}

function generateAgency() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

function generateAccountNumber() {
  const base = String(Math.floor(Math.random() * 90000000) + 10000000);
  const digit = String(Math.floor(Math.random() * 10));
  return `${base}-${digit}`;
}

function generateCardLast4() {
  return String(Math.floor(Math.random() * 9000) + 1000);
}

function generateMaskedCardNumber(last4) {
  return `**** **** **** ${last4}`;
}

function generateExpiry() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
}

function generateMaskedCvv() {
  return "***";
}

function generateUniqueAgencyAndAccount() {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const agency = generateAgency();
    const accountNumber = generateAccountNumber();

    const existing = get(
      "SELECT id FROM users WHERE agency = ? AND account_number = ?",
      [agency, accountNumber]
    );

    if (!existing) {
      return { agency, accountNumber };
    }
  }

  throw new Error("Nao foi possivel gerar conta unica no momento.");
}

function createUserWithVirtualCard({ fullName, email, password }) {
  return executeInTransaction((db) => {
    const { agency, accountNumber } = generateUniqueAgencyAndAccount();
    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const userResult = db
      .prepare(
        `
        INSERT INTO users (full_name, email, password_hash, agency, account_number, balance_cents)
        VALUES (?, ?, ?, ?, ?, 0)
      `
      )
      .run(fullName, email, passwordHash, agency, accountNumber);

    const userId = userResult.lastInsertRowid;
    const last4 = generateCardLast4();

    db.prepare(
      `
      INSERT INTO cards (user_id, card_type, brand, card_number_masked, expiry_mm_yy, cvv_masked, last4, status, limit_cents)
      VALUES (?, 'virtual', 'BANQA', ?, ?, ?, ?, 'active', 0)
    `
    ).run(userId, generateMaskedCardNumber(last4), generateExpiry(), generateMaskedCvv(), last4);

    return db
      .prepare(
        `
        SELECT id, full_name, email, agency, account_number, balance_cents, created_at
        FROM users
        WHERE id = ?
      `
      )
      .get(userId);
  });
}

module.exports = {
  findByEmail,
  findAuthUserByEmail,
  createSession,
  revokeSessionById,
  findValidSessionByToken,
  createUserWithVirtualCard
};
