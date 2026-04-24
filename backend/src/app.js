const express = require('express');
const routes = require('./routes');
const logger = require('./utils/logger');

const app = express();

app.use(express.json());

app.use('/api', routes);

app.use((req, res, next) => {
    res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;