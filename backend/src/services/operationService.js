const { createDeposit, createWithdraw, createTransfer } = require("../repositories/operationRepository");

function parseAmountCents(value) {
  const amount = Number(value);

  if (!Number.isInteger(amount) || amount <= 0) {
    const error = new Error("amountCents deve ser um inteiro maior que zero.");
    error.statusCode = 400;
    throw error;
  }

  return amount;
}

function deposit(userId, payload) {
  const amountCents = parseAmountCents(payload?.amountCents);
  const balanceCents = createDeposit({ userId, amountCents });

  return {
    message: "Deposito realizado com sucesso.",
    balanceCents
  };
}

function withdraw(userId, payload) {
  const amountCents = parseAmountCents(payload?.amountCents);
  const balanceCents = createWithdraw({ userId, amountCents });

  return {
    message: "Saque realizado com sucesso.",
    balanceCents
  };
}

function transfer(userId, payload) {
  const amountCents = parseAmountCents(payload?.amountCents);
  const destinationAgency = String(payload?.destinationAgency || "").trim();
  const destinationAccount = String(payload?.destinationAccount || "").trim();

  if (!destinationAgency || !destinationAccount) {
    const error = new Error("Campos obrigatorios: destinationAgency e destinationAccount.");
    error.statusCode = 400;
    throw error;
  }

  const balanceCents = createTransfer({
    userId,
    amountCents,
    destinationAgency,
    destinationAccount
  });

  return {
    message: "Transferencia realizada com sucesso.",
    balanceCents
  };
}

module.exports = {
  deposit,
  withdraw,
  transfer
};
