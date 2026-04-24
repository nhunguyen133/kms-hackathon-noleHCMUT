const express = require('express');
// import route cua services
const chatRoutes = require('../modules/chat/chat.routes');

const router = express.Router();

router.use('/chat', chatRoutes);
module.exports = router;