const express = require("express");
const { getAccountDetails, getAccountTransactions } = require("../controllers/accountController");
const { authMiddleware } = require("../utils/authMiddleware");

const router = express.Router();

router.get("/account", authMiddleware, getAccountDetails);
router.get("/transactions", authMiddleware, getAccountTransactions);

module.exports = router;
