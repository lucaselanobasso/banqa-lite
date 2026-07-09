const { pingDatabase } = require("../repositories/healthRepository");

function getHealthStatus() {
  const database = pingDatabase() ? "ok" : "error";

  return {
    status: "ok",
    database,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  getHealthStatus
};
