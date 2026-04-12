import { db } from "@workspace/db";
import { forumTopicsTable } from "@workspace/db/src/schema/forum";
import { eq } from "drizzle-orm";

async function testUpdate() {
  const url = "https://tse4.mm.bing.net/th/id/OIP.4x30pKT_7EcqZIqtyJ7mTwHaFa?w=1380&h=1010&rs=1&pid=ImgDetMain&o=7&rm=3";
  console.log("Testing update with URL:", url);
  
  try {
    // Get the first topic
    const [topic] = await db.select().from(forumTopicsTable).limit(1);
    if (!topic) {
      console.log("No topics found to test.");
      return;
    }
    
    console.log("Found topic ID:", topic.id);
    
    const [updated] = await db.update(forumTopicsTable)
      .set({ imageUrl: url })
      .where(eq(forumTopicsTable.id, topic.id))
      .returning();
      
    console.log("Updated topic:", updated);
    if (updated.imageUrl === url) {
      console.log("SUCCESS: Image URL updated correctly.");
    } else {
      console.log("FAILURE: URL mismatch.");
    }
  } catch (err) {
    console.error("DB Error:", err);
  }
}

testUpdate();
