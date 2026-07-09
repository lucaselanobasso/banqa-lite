const { findAccountByUserId, listTransactionsByUserId } = require("../repositories/accountRepository");

function getAccount(userId) {
  const account = findAccountByUserId(userId);

  if (!account) {
    const error = new Error("Conta nao encontrada.");
    error.statusCode = 404;
    throw error;
  }

  return {
    name: account.full_name,
    agency: account.agency,
    account: account.account_number,
    balanceCents: account.balance_cents
  };
}

function normalizeTransactionFilters(query = {}) {
  return {
    type: query.type ? String(query.type).trim() : "",
    search: query.search ? String(query.search).trim() : "",
    startDate: query.startDate ? String(query.startDate).trim() : "",
    endDate: query.endDate ? String(query.endDate).trim() : ""
  };
}

function getTransactions(userId, query) {
  const filters = normalizeTransactionFilters(query);
  return listTransactionsByUserId(userId, filters);
}

module.exports = {
  getAccount,
  getTransactions
};
