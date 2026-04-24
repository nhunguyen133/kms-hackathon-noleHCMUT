const express = require("express");
const { authenticate } = require("../../middleware/authenticate");
const { requireRole } = require("../../middleware/requireRole");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

// Instructor only
router.use(authenticate, requireRole("instructor"));

router.get("/overview", dashboardController.overview);
router.get("/students", dashboardController.students);
router.get("/students/:id", dashboardController.studentDetail);
router.get("/at-risk", dashboardController.atRisk);

module.exports = router;
