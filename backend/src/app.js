require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const logger = require('./utils/logger');
const { startEarlyWarningCron } = require('./modules/early-warning/early-warning.cron');

const app = express();

// Middlewares
app.use(cors()); // cho phép Frontend (React) giao tiếp với Backend (Node)
app.use(express.json()); // cho phép đọc JSON từ client
app.use(morgan('combined', { // Ghi log mọi request (rất tốt để debug lúc Demo)
    stream: {
        write: (message) => logger.info(message.trim()),
    },
}));

startEarlyWarningCron();

// ROUTES (Định tuyến API)
app.use('/api', routes);

// ERROR HANDLING (Xử lý Ngoại lệ)
app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  logger.error(err.stack || err);
  const status = err.status || 500;
  res.status(status).json({ 
    error: err.message || 'Something went wrong!', 
    details: err.details 
  });
});

module.exports = app;