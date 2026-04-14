import { db } from "../../lib/db/src/index";
import { usersTable } from "../../lib/db/src/schema/users";
import { desc } from "drizzle-orm";

async function checkUsers() {
  try {
    console.log("Fetching last users...");
    const lastUsers = await db.select().from(usersTable).orderBy(desc(usersTable.id)).limit(5);
    console.log(JSON.stringify(lastUsers, null, 2));
  } catch (err) {
    console.error("Error:", err);
  }
}

checkUsers();
