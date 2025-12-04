require('dotenv').config();
const fs = require('fs');
const path = require('path');
const db = require('./db');

(async () => {
  try {
    const filePath = path.join(__dirname, 'migrations', 'add_auth_columns.sql');
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log('Running migration: add_auth_columns.sql');
    const res = await db.query(sql);
    console.log('Migration executed, result:', res);
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
