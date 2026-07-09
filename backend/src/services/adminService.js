const { resetDatabaseData } = require("../repositories/adminRepository");

function resetDatabase() {
  resetDatabaseData();

  return {
    message: "Banco resetado com sucesso."
  };
}

module.exports = {
  resetDatabase
};
