const {
  findVirtualCardByUserId,
  updateCardStatus,
  updateCardPresentation
} = require("../repositories/cardRepository");

function generateMaskedCardNumber(last4) {
  return `**** **** **** ${last4}`;
}

function generateExpiry() {
  const date = new Date();
  date.setFullYear(date.getFullYear() + 5);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${year}`;
}

function ensureCardForResponse(card) {
  if (!card) {
    const error = new Error("Cartao virtual nao encontrado.");
    error.statusCode = 404;
    throw error;
  }

  const cardNumberMasked = card.card_number_masked || generateMaskedCardNumber(card.last4);
  const expiry = card.expiry_mm_yy || generateExpiry();
  const cvvMasked = card.cvv_masked || "***";

  if (!card.card_number_masked || !card.expiry_mm_yy || !card.cvv_masked) {
    updateCardPresentation(card.id, {
      cardNumberMasked,
      expiry,
      cvvMasked
    });
  }

  return {
    numberMasked: cardNumberMasked,
    expiry,
    cvvMasked,
    status: card.status
  };
}

function getCard(userId) {
  const card = findVirtualCardByUserId(userId);
  return ensureCardForResponse(card);
}

function blockCard(userId) {
  const card = findVirtualCardByUserId(userId);
  const normalizedCard = ensureCardForResponse(card);

  if (normalizedCard.status !== "blocked") {
    updateCardStatus(card.id, "blocked");
  }

  return {
    ...normalizedCard,
    status: "blocked"
  };
}

function unblockCard(userId) {
  const card = findVirtualCardByUserId(userId);
  const normalizedCard = ensureCardForResponse(card);

  if (normalizedCard.status !== "active") {
    updateCardStatus(card.id, "active");
  }

  return {
    ...normalizedCard,
    status: "active"
  };
}

module.exports = {
  getCard,
  blockCard,
  unblockCard
};
