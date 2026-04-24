const fs = require("fs");
const path = require("path");
const { pool } = require("./index");
const logger = require("../utils/logger");

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, "setup_db.sql");
    const sql = fs.readFileSync(sqlPath, "utf8");

    logger.info("Initializing database schema...");
    await pool.query(sql);
    logger.info("Database schema initialized successfully.");
  } catch (err) {
    logger.error("Error initializing database:", err);
  } finally {
    await pool.end();
  }
}

initDb();
