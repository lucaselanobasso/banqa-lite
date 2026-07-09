const { getHealthStatus } = require("../services/healthService");

function getHealth(req, res) {
  const payload = getHealthStatus();
  return res.status(200).json(payload);
}

module.exports = {
  getHealth
};
