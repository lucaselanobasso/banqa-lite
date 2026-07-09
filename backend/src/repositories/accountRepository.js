const { get, all } = require("./databaseRepository");

function findAccountByUserId(userId) {
  return get(
    `
    SELECT id, full_name, agency, account_number, balance_cents
    FROM users
    WHERE id = ?
  `,
    [userId]
  );
}

function listTransactionsByUserId(userId, filters = {}) {
  const conditions = ["user_id = ?"];
  const params = [userId];

  // Dynamic filters keep the same endpoint and avoid duplicating query functions.
  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }

  if (filters.startDate) {
    conditions.push("datetime(occurred_at) >= datetime(?)");
    params.push(filters.startDate);
  }

  if (filters.endDate) {
    conditions.push("datetime(occurred_at) <= datetime(?)");
    params.push(filters.endDate);
  }

  if (filters.search) {
    conditions.push("(LOWER(description) LIKE ? OR LOWER(reference_code) LIKE ? OR LOWER(type) LIKE ?)");
    const term = `%${filters.search.toLowerCase()}%`;
    params.push(term, term, term);
  }

  const sql = `
    SELECT id, type, amount_cents, description, reference_code, occurred_at, created_at
    FROM transactions
    WHERE ${conditions.join(" AND ")}
    ORDER BY datetime(occurred_at) DESC, id DESC
  `;

  return all(sql, params);
}

module.exports = {
  findAccountByUserId,
  listTransactionsByUserId
};
