require('dotenv').config();
const db = require('./database/db');
(async () => {
  try {
    const res = await db.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
    console.log('Users table columns:');
    console.table(res.rows);
    process.exit(0);
  } catch (err) {
    console.error('Error querying columns:', err);
    process.exit(1);
  }
})();
