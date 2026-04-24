const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const logger = require("./src/utils/logger");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Morgan middleware for logging HTTP requests
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }),
);

// API routes
const apiRoutes = require("./src/routes");
app.use("/api", apiRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// Global error handler (must be last)
const { errorHandler } = require("./src/middleware/errorHandler");
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
