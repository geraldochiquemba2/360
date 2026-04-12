import { db, userTracksTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function test() {
  if (!db) {
    console.error("DB NOT CONFIGURED");
    return;
  }
  try {
    console.log("Checking user_tracks table...");
    const results = await db.select().from(userTracksTable).limit(1);
    console.log("SUCCESS: Table accessible. Results:", results);
  } catch (err: any) {
    console.error("ERROR: Table NOT accessible:", err.message);
  }
}

test().then(() => process.exit());
