const { get, run } = require("./databaseRepository");

function findVirtualCardByUserId(userId) {
  return get(
    `
    SELECT id, user_id, brand, card_number_masked, expiry_mm_yy, cvv_masked, last4, status
    FROM cards
    WHERE user_id = ? AND card_type = 'virtual'
    ORDER BY id DESC
    LIMIT 1
  `,
    [userId]
  );
}

function updateCardStatus(cardId, status) {
  run(
    `
    UPDATE cards
    SET status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [status, cardId]
  );
}

function updateCardPresentation(cardId, payload) {
  run(
    `
    UPDATE cards
    SET card_number_masked = ?, expiry_mm_yy = ?, cvv_masked = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `,
    [payload.cardNumberMasked, payload.expiry, payload.cvvMasked, cardId]
  );
}

module.exports = {
  findVirtualCardByUserId,
  updateCardStatus,
  updateCardPresentation
};
