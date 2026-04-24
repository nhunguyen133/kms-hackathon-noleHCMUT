const express = require('express');
const router = express.Router();
const earlyWarningController = require('./early-warning.controller');
const { authenticate } = require('../../middleware/authenticate');
const { requireRole } = require('../../middleware/requireRole');

// Get at-risk students (Instructor only)
router.get('/at-risk', authenticate, requireRole('instructor'), earlyWarningController.getAtRiskStudents);

module.exports = router;
