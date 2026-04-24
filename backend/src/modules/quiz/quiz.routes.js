const express = require('express');
const router = express.Router();
const quizController = require('./quiz.controller');
const { authenticate } = require('../../middleware/authenticate');

// Start a quiz session for a lesson
router.get('/:lessonId/start', authenticate, quizController.start);

// Submit an answer and get next question or summary
router.post('/answer', authenticate, quizController.answer);

module.exports = router;
