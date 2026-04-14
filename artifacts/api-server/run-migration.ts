import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = "postgresql://neondb_owner:npg_17YnmtECOwdJ@ep-billowing-snow-am24xzwl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function run() {
  const client = new pg.Pool({ connectionString });
  try {
    console.log("Reading SQL script...");
    const sqlPath = path.join(process.cwd(), "create-tracks.sql");
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log("Executing SQL...");
    await client.query(sql);
    console.log("Tables created successfully!");
  } catch (e) {
    console.error("Migration error:", e.message);
  } finally {
    await client.end();
  }
}

run();
