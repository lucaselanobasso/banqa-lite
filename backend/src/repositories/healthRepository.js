const { get } = require("./databaseRepository");

function pingDatabase() {
  const result = get("SELECT 1 AS ok");

  return result.ok === 1;
}

module.exports = {
  pingDatabase
};
