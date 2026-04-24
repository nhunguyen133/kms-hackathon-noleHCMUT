const quizService = require('./quiz.service');
const logger = require('../../utils/logger');

/**
 * Start a quiz session
 */
exports.start = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.id;

    if (!lessonId) {
      return res.status(400).json({ error: "lessonId is required" });
    }

    const session = await quizService.startSession(userId, lessonId);
    res.json(session);
  } catch (error) {
    logger.error("Error starting quiz session:", error);
    res.status(500).json({ error: error.message || "Failed to start quiz session" });
  }
};

/**
 * Process an answer and get next question
 */
exports.answer = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questionId, answer, lessonId, sessionState } = req.body;

    if (!questionId || answer === undefined || !lessonId || !sessionState) {
      return res.status(400).json({ error: "Missing required fields in request body" });
    }

    const result = await quizService.processAnswer(userId, { 
      questionId, answer, lessonId, sessionState 
    });
    res.json(result);
  } catch (error) {
    logger.error("Error processing quiz answer:", error);
    res.status(500).json({ error: error.message || "Failed to process quiz answer" });
  }
};
