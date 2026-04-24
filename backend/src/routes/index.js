const express = require('express');
// import route cua services
const chatRoutes = require('../modules/chat/chat.route');
const authRoutes = require('../modules/auth/auth.routes');
const quizRoutes = require('../modules/quiz/quiz.routes');
const learningPathRoutes = require('../modules/learning-path/learning-path.routes');
const earlyWarningRoutes = require('../modules/early-warning/early-warning.routes');

const router = express.Router();

router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use('/learning-path', learningPathRoutes);
router.use('/early-warning', earlyWarningRoutes);
router.use("/courses", require("../modules/courses/courses.routes"));
router.use("/lessons", require("../modules/lessons/lessons.routes"));
router.use("/dashboard", require("../modules/dashboard/dashboard.routes"));
router.use("/progress", require("../modules/progress/progress.routes"));
router.use("/profile", require("../modules/profile/profile.routes"));

module.exports = router;