const express = require("express");
const { getHealth } = require("../controllers/healthController");
const userRoutes = require("./userRoutes");
const accountRoutes = require("./accountRoutes");
const operationRoutes = require("./operationRoutes");
const cardRoutes = require("./cardRoutes");
const adminRoutes = require("./adminRoutes");

const router = express.Router();

router.get("/health", getHealth);
router.use(userRoutes);
router.use(accountRoutes);
router.use(operationRoutes);
router.use(cardRoutes);
router.use(adminRoutes);

module.exports = router;
