const express = require('express');
// import route cua services
const chatRoutes = require('../modules/chat/chat.routes');
const authRoutes = require('../modules/auth/auth.routes');
const quizRoutes = require('../modules/quiz/quiz.routes');
const router = express.Router();

router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);
router.use('/quiz', quizRoutes);
router.use("/courses", require("../modules/courses/courses.routes"));
router.use("/lessons", require("../modules/lessons/lessons.routes"));
router.use("/dashboard", require("../modules/dashboard/dashboard.routes"));

module.exports = router;