const express = require("express");
const authRoutes = require("../modules/auth/auth.routes");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/courses", require("../modules/courses/courses.routes"));
router.use("/lessons", require("../modules/lessons/lessons.routes"));

module.exports = router;