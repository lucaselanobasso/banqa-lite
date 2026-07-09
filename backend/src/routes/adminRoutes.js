const express = require("express");
const { authMiddleware } = require("../utils/authMiddleware");
const { reset } = require("../controllers/adminController");

const router = express.Router();

// Admin reset: clears all data while keeping schema, as defined in SPEC-006.
router.post("/reset", authMiddleware, reset);

module.exports = router;
