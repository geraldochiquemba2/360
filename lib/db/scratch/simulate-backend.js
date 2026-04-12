import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_17YnmtECOwdJ@ep-billowing-snow-am24xzwl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: { rejectUnauthorized: false }
});

async function simulateBackend(topicId) {
  try {
    console.log(`Simulating backend for topic ID: ${topicId}`);
    
    // 1. Topic Query
    console.log("Querying topic...");
    const topicRes = await pool.query(`
      SELECT t.id, t.title, t.content, t.category, t.created_at, t.author_id, u.name as author_name
      FROM forum_topics t
      LEFT JOIN users u ON t.author_id = u.id
      WHERE t.id = $1
    `, [topicId]);
    console.log("Topic found:", topicRes.rows[0] ? "YES" : "NO");

    // 2. Comments Query
    console.log("Querying comments...");
    const commentsRes = await pool.query(`
      SELECT p.id, p.content, p.created_at, u.name as author_name, p.author_id, p.is_hidden, p.hide_reason, p.parent_id
      FROM forum_posts p
      LEFT JOIN users u ON p.author_id = u.id
      WHERE p.topic_id = $1
      ORDER BY p.created_at ASC
    `, [topicId]);
    console.log("Comments count:", commentsRes.rows.length);

    // 3. Likes Query
    console.log("Querying likes...");
    const likesRes = await pool.query(`
      SELECT l.user_id, u.name as user_name
      FROM forum_likes l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.topic_id = $1
    `, [topicId]);
    console.log("Likes count:", likesRes.rows.length);

    console.log("All queries successful!");

  } catch (err) {
    console.error("SIMULATION FAILED:", err.message);
    if (err.hint) console.log("Hint:", err.hint);
    if (err.position) console.log("Position:", err.position);
  } finally {
    await pool.end();
  }
}

const id = process.argv[2] || 10;
simulateBackend(parseInt(id));
