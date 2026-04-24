const express = require('express');
const router = express.Router();
const learningPathController = require('./learning-path.controller');
const { authenticate } = require('../../middleware/authenticate');

// Get current roadmap for a course
router.get('/:courseId', authenticate, learningPathController.getPath);

// Force recalculate the roadmap
router.post('/:courseId/recalculate', authenticate, learningPathController.recalculate);

module.exports = router;
