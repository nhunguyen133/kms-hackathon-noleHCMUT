const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

async function initDb() {
  try {
    const sqlPath = path.join(__dirname, 'setup_db.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Initializing database schema...');
    await pool.query(sql);
    console.log('Database schema initialized successfully.');
    
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await pool.end();
  }
}

initDb();
