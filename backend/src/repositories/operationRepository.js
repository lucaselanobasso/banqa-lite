const crypto = require("node:crypto");
const { executeInTransaction } = require("./databaseRepository");

function createReferenceCode(prefix) {
  return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

function findUserById(db, userId) {
  return db
    .prepare(
      `
      SELECT id, full_name, agency, account_number, balance_cents
      FROM users
      WHERE id = ?
    `
    )
    .get(userId);
}

function findUserByAgencyAndAccount(db, agency, accountNumber) {
  return db
    .prepare(
      `
      SELECT id, full_name, agency, account_number, balance_cents
      FROM users
      WHERE agency = ? AND account_number = ?
    `
    )
    .get(agency, accountNumber);
}

function insertTransaction(db, payload) {
  db.prepare(
    `
    INSERT INTO transactions (user_id, type, amount_cents, description, reference_code)
    VALUES (?, ?, ?, ?, ?)
  `
  ).run(payload.userId, payload.type, payload.amountCents, payload.description, payload.referenceCode);
}

function updateUserBalance(db, userId, balanceCents) {
  db.prepare(
    `
    UPDATE users
    SET balance_cents = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `
  ).run(balanceCents, userId);
}

function createDeposit({ userId, amountCents }) {
  return executeInTransaction((db) => {
    const user = findUserById(db, userId);

    if (!user) {
      throw new Error("Conta nao encontrada.");
    }

    const newBalance = Number(user.balance_cents) + amountCents;
    updateUserBalance(db, user.id, newBalance);

    insertTransaction(db, {
      userId: user.id,
      type: "deposit",
      amountCents,
      description: "Deposito em conta",
      referenceCode: createReferenceCode("dep")
    });

    return newBalance;
  });
}

function createWithdraw({ userId, amountCents }) {
  return executeInTransaction((db) => {
    const user = findUserById(db, userId);

    if (!user) {
      throw new Error("Conta nao encontrada.");
    }

    if (Number(user.balance_cents) < amountCents) {
      const error = new Error("Saldo insuficiente para saque.");
      error.statusCode = 422;
      throw error;
    }

    const newBalance = Number(user.balance_cents) - amountCents;
    updateUserBalance(db, user.id, newBalance);

    insertTransaction(db, {
      userId: user.id,
      type: "withdraw",
      amountCents,
      description: "Saque em conta",
      referenceCode: createReferenceCode("wdw")
    });

    return newBalance;
  });
}

function createTransfer({ userId, amountCents, destinationAgency, destinationAccount }) {
  return executeInTransaction((db) => {
    const originUser = findUserById(db, userId);

    if (!originUser) {
      throw new Error("Conta de origem nao encontrada.");
    }

    const destinationUser = findUserByAgencyAndAccount(db, destinationAgency, destinationAccount);

    if (!destinationUser) {
      const error = new Error("Conta de destino nao encontrada.");
      error.statusCode = 404;
      throw error;
    }

    if (originUser.id === destinationUser.id) {
      const error = new Error("Transferencia para a mesma conta nao e permitida.");
      error.statusCode = 400;
      throw error;
    }

    if (Number(originUser.balance_cents) < amountCents) {
      const error = new Error("Saldo insuficiente para transferencia.");
      error.statusCode = 422;
      throw error;
    }

    const originBalance = Number(originUser.balance_cents) - amountCents;
    const destinationBalance = Number(destinationUser.balance_cents) + amountCents;

    updateUserBalance(db, originUser.id, originBalance);
    updateUserBalance(db, destinationUser.id, destinationBalance);

    const transferId = createReferenceCode("trf");

    insertTransaction(db, {
      userId: originUser.id,
      type: "transfer_out",
      amountCents,
      description: `Transferencia enviada para ${destinationUser.agency}/${destinationUser.account_number}`,
      referenceCode: `${transferId}_out`
    });

    insertTransaction(db, {
      userId: destinationUser.id,
      type: "transfer_in",
      amountCents,
      description: `Transferencia recebida de ${originUser.agency}/${originUser.account_number}`,
      referenceCode: `${transferId}_in`
    });

    return originBalance;
  });
}

module.exports = {
  createDeposit,
  createWithdraw,
  createTransfer
};
