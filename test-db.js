const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function test() {
  try {
    const client = await pool.connect();
    console.log('Connected to DB');
    const resUsers = await client.query('SELECT count(*) FROM users');
    const resOps = await client.query('SELECT count(*) FROM opportunities');
    const resForum = await client.query('SELECT count(*) FROM forum_topics');
    console.log({
      users: resUsers.rows[0].count,
      opportunities: resOps.rows[0].count,
      forum: resForum.rows[0].count
    });
    client.release();
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await pool.end();
  }
}

test();
