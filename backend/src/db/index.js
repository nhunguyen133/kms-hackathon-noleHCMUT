const { Pool } = require("pg");
require("dotenv").config();

// Neon: prefer sslmode=require in DATABASE_URL. Only provide an ssl object when
// needed to satisfy node-postgres in some environments.
const useSsl = (process.env.DATABASE_URL || "").includes("sslmode=require");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(useSsl ? { ssl: { rejectUnauthorized: false } } : {}),
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
