const express = require("express");
const { authMiddleware } = require("../utils/authMiddleware");
const {
  createDeposit,
  createWithdraw,
  createTransfer
} = require("../controllers/operationController");

const router = express.Router();

router.post("/deposit", authMiddleware, createDeposit);
router.post("/withdraw", authMiddleware, createWithdraw);
router.post("/transfer", authMiddleware, createTransfer);

module.exports = router;
