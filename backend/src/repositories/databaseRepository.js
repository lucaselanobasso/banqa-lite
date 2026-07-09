const { getDatabase } = require("../database");

function run(sql, params = []) {
  const db = getDatabase();
  return db.prepare(sql).run(...params);
}

function get(sql, params = []) {
  const db = getDatabase();
  return db.prepare(sql).get(...params);
}

function all(sql, params = []) {
  const db = getDatabase();
  return db.prepare(sql).all(...params);
}

function executeInTransaction(callback) {
  const db = getDatabase();
  const transaction = db.transaction(() => callback(db));
  return transaction();
}

module.exports = {
  run,
  get,
  all,
  executeInTransaction
};