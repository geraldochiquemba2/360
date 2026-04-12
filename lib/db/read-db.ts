import { db } from "./src/index.ts";
import { forumPostsTable } from "./src/schema/forum.ts";

async function run() {
  const posts = await db.select().from(forumPostsTable);
  console.dir(posts, { depth: null });
  process.exit();
}

run();
