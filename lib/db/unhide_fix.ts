import { db } from "./src/index.ts";
import { forumPostsTable } from "./src/schema/forum.ts";
import { eq } from "drizzle-orm";

async function run() {
  await db.update(forumPostsTable).set({ isHidden: false, hideReason: null }).where(eq(forumPostsTable.id, 26));
  console.log('Unhide done via script');
  process.exit();
}
run();
