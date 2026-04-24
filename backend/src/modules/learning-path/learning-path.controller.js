const learningPathService = require('./learning-path.service');
const logger = require('../../utils/logger');

/**
 * Get the current learning path for a course
 */
exports.getPath = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const path = await learningPathService.getRecommendedPath(userId, courseId);
    res.json(path);
  } catch (error) {
    logger.error("Error fetching learning path:", error);
    res.status(500).json({ error: "Failed to fetch learning path" });
  }
};

/**
 * Manually trigger a recalculation of the learning path
 */
exports.recalculate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const newPath = await learningPathService.recalculate(userId, courseId);
    res.json(newPath);
  } catch (error) {
    logger.error("Error recalculating learning path:", error);
    res.status(500).json({ error: "Failed to recalculate learning path" });
  }
};
