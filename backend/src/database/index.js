const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dbFilePath = path.resolve(__dirname, "..", "..", "database.db");
const schemaPath = path.resolve(__dirname, "schema.sql");

let db;

function hasColumn(tableName, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  return columns.some((column) => column.name === columnName);
}

function runMigrations() {
  if (!hasColumn("users", "agency")) {
    db.exec("ALTER TABLE users ADD COLUMN agency TEXT");
  }

  if (!hasColumn("users", "account_number")) {
    db.exec("ALTER TABLE users ADD COLUMN account_number TEXT");
  }

  if (!hasColumn("users", "balance_cents")) {
    db.exec("ALTER TABLE users ADD COLUMN balance_cents INTEGER NOT NULL DEFAULT 0 CHECK (balance_cents >= 0)");
  }

  if (!hasColumn("cards", "card_type")) {
    db.exec("ALTER TABLE cards ADD COLUMN card_type TEXT NOT NULL DEFAULT 'virtual'");
  }

  if (!hasColumn("cards", "card_number_masked")) {
    db.exec("ALTER TABLE cards ADD COLUMN card_number_masked TEXT");
  }

  if (!hasColumn("cards", "expiry_mm_yy")) {
    db.exec("ALTER TABLE cards ADD COLUMN expiry_mm_yy TEXT");
  }

  if (!hasColumn("cards", "cvv_masked")) {
    db.exec("ALTER TABLE cards ADD COLUMN cvv_masked TEXT");
  }

  db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_agency_account ON users(agency, account_number)");
}

function initDatabase() {
  const dbDir = path.dirname(dbFilePath);

  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbFilePath);

  const schemaSQL = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schemaSQL);
  runMigrations();

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error("Database nao foi inicializado. Chame initDatabase() primeiro.");
  }

  return db;
}

module.exports = {
  initDatabase,
  getDatabase
};
