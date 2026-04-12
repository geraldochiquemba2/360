import { db } from "./src/index.ts";
import { forumPostsTable } from "./src/schema/forum.ts";
import { eq } from "drizzle-orm";

async function run() {
  await db.update(forumPostsTable).set({ isHidden: true, hideReason: 'Censurado por script' }).where(eq(forumPostsTable.id, 26));
  console.log('Update done');
  process.exit();
}
run();
