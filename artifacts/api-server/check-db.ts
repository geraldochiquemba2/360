import pg from 'pg';

const connectionString = "postgresql://neondb_owner:npg_17YnmtECOwdJ@ep-billowing-snow-am24xzwl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function run() {
  const client = new pg.Pool({ connectionString });
  try {
    console.log("Checking tables...");
    const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log("Existing tables:", tables.rows.map(r => r.table_name));

    if (tables.rows.some(r => r.table_name === 'tracks')) {
      const tracks = await client.query("SELECT * FROM tracks");
      console.log("Tracks count:", tracks.rowCount);
    } else {
      console.log("Table 'tracks' does NOT exist.");
    }
  } catch (e) {
    console.error("Database error:", e.message);
  } finally {
    await client.end();
  }
}

run();
