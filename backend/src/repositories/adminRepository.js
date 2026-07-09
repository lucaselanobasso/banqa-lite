const { executeInTransaction } = require("./databaseRepository");

function resetDatabaseData() {
  // Keep schema intact and remove all business data atomically.
  executeInTransaction((db) => {
    db.prepare("DELETE FROM sessions").run();
    db.prepare("DELETE FROM transactions").run();
    db.prepare("DELETE FROM cards").run();
    db.prepare("DELETE FROM users").run();

    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('sessions', 'transactions', 'cards', 'users')").run();
  });
}

module.exports = {
  resetDatabaseData
};
