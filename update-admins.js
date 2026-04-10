
const pg = require("pg");
const { Pool } = pg;

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("Updating all admins to 'ativo'...");
    const result = await pool.query(
      "UPDATE users SET status = 'ativo' WHERE role = 'admin' RETURNING email, status"
    );
    
    console.log(`Updated ${result.rowCount} admin users.`);
    result.rows.forEach(u => console.log(`- ${u.email}: ${u.status}`));
  } catch (err) {
    console.error("Error updating admins:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
