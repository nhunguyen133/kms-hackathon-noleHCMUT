const express = require("express");
const { authenticate } = require("../../middleware/authenticate");
const profileController = require("./profile.controller");

const router = express.Router();

router.use(authenticate);

router.get("/", profileController.getProfile);
router.put("/", profileController.updateProfile);

module.exports = router;
