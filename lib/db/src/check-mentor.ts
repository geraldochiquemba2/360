import { db } from "./index";
import { usersTable, mentorsTable } from "./schema";
import { eq, like } from "drizzle-orm";

async function main() {
  if (!db) {
    console.error("Database not initialized");
    process.exit(1);
  }
  console.log("Checking DB for Jack...");
  const users = await db.select().from(usersTable).where(like(usersTable.name, "%Jack%"));
  
  if (users.length === 0) {
    console.log("User Jack not found.");
    process.exit(0);
  }

  for (const user of users) {
    console.log("User:", user);
    if (user.role === 'mentor') {
      if (!db) return;
      const mentors = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, user.id));
      console.log("Mentor Data:", mentors);
    }
  }
  process.exit(0);
}

main().catch(console.error);
