const express = require("express");
const { authMiddleware } = require("../utils/authMiddleware");
const {
  getVirtualCard,
  blockVirtualCard,
  unblockVirtualCard
} = require("../controllers/cardController");

const router = express.Router();

router.get("/card", authMiddleware, getVirtualCard);
router.patch("/card/block", authMiddleware, blockVirtualCard);
router.patch("/card/unblock", authMiddleware, unblockVirtualCard);

module.exports = router;
