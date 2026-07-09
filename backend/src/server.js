const app = require("./app");
const env = require("./utils/env");
const { initDatabase } = require("./database");

function startServer() {
  initDatabase();

  app.listen(env.port, () => {
    console.log(`BANQA Lite backend rodando em http://localhost:${env.port}`);
  });
}

startServer();
