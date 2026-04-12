import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_17YnmtECOwdJ@ep-billowing-snow-am24xzwl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function checkForum() {
  try {
    console.log("Checking forum_topics table...");
    const topicsRes = await pool.query("SELECT * FROM forum_topics ORDER BY created_at DESC LIMIT 5");
    console.log("Last 5 topics:", topicsRes.rows);

    if (topicsRes.rows.length > 0) {
      for (const topic of topicsRes.rows) {
        console.log(`Checking comments for topic ID ${topic.id} (${topic.title})...`);
        const commentsRes = await pool.query("SELECT * FROM forum_posts WHERE topic_id = $1", [topic.id]);
        console.log(`Found ${commentsRes.rows.length} comments.`);
      }
    } else {
      console.log("No topics found in forum_topics table.");
    }

  } catch (err) {
    console.error("Error during check:", err);
  } finally {
    await pool.end();
  }
}

checkForum();
