const express = require("express");
const { authenticate } = require("../../middleware/authenticate");
const { requireRole } = require("../../middleware/requireRole");
const progressController = require("./progress.controller");

const router = express.Router();

router.use(authenticate, requireRole("student"));

router.get("/", progressController.getProgress);

module.exports = router;
