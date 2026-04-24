const earlyWarningService = require('./early-warning.service');
const logger = require('../../utils/logger');

exports.getAtRiskStudents = async (req, res) => {
  try {
    const instructorId = req.user.id;
    const students = await earlyWarningService.getAtRiskStudents(instructorId);
    res.json(students);
  } catch (error) {
    logger.error("Error fetching at-risk students:", error);
    res.status(500).json({ error: "Failed to fetch at-risk students" });
  }
};
