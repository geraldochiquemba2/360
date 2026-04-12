import { db } from "@workspace/db";
import { forumLikesTable, userStatsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

async function test() {
  try {
    const topicId = 1;
    const userId = 1;
    const type = 'like';
    
    console.log("Attempting to insert reaction...");
    await db.insert(forumLikesTable).values({ topicId, userId, type });
    console.log("Reaction inserted successfully!");

    console.log("Attempting to add XP...");
    const XP_PER_LEVEL = 500;
    const amount = 10;
    
    const [stats] = await db.select().from(userStatsTable).where(eq(userStatsTable.userId, userId));
    const currentXp = (stats?.xp || 0) + amount;
    const currentLevel = Math.floor(currentXp / XP_PER_LEVEL) + 1;

    await db.insert(userStatsTable).values({ 
      userId, 
      xp: currentXp, 
      level: currentLevel,
      updatedAt: new Date()
    })
    .onConflictDoUpdate({
      target: userStatsTable.userId,
      set: { xp: currentXp, level: currentLevel, updatedAt: new Date() }
    });
    console.log("XP added successfully!");

  } catch (err: any) {
    console.error("Test Error:", err);
  }
}

test();
