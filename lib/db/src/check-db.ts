import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function check() {
  try {
    const resColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users table:', resColumns.rows.map(r => r.column_name));

    const resUser = await pool.query("SELECT email, role FROM users WHERE email = 'admin@gmail.com'");
    console.log('Admin user search result:', resUser.rows);
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await pool.end();
  }
}

check();
