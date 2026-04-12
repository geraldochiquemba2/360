import { db } from "./lib/db/src";
import { forumLikesTable } from "./lib/db/src/schema/forum";

async function dumpLikes() {
  try {
    const likes = await db.select().from(forumLikesTable);
    console.log("Total Likes:", likes.length);
    console.log(JSON.stringify(likes, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

dumpLikes();
