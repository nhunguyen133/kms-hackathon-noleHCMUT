const express = require('express');
const router = express.Router();
const chatController = require('./chat.controller');
const { authenticate } = require('../../middleware/authenticate');

// Endpoint: POST /api/chat
router.post('/', authenticate, chatController.send);

module.exports = router;
