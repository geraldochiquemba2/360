import { db } from "../lib/db/src/index";
import { usersTable, mentorsTable } from "../lib/db/src/schema";
import { eq, like } from "drizzle-orm";

async function main() {
  console.log("Checking DB for Jack...");
  const users = await db.select().from(usersTable).where(like(usersTable.name, "%Jack%"));
  
  if (users.length === 0) {
    console.log("User Jack not found.");
    process.exit(0);
  }

  for (const user of users) {
    console.log("User:", user);
    if (user.role === 'mentor') {
      const mentors = await db.select().from(mentorsTable).where(eq(mentorsTable.userId, user.id));
      console.log("Mentor Data:", mentors);
    }
  }
  process.exit(0);
}

main().catch(console.error);
