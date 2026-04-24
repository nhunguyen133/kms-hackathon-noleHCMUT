const express = require('express');
// import route cua services
const chatRoutes = require('../modules/chat/chat.routes');
const authRoutes = require('../modules/auth/auth.routes');
const router = express.Router();

router.use('/chat', chatRoutes);
router.use('/auth', authRoutes);

module.exports = router;