
import { db } from "./lib/db/src/index.ts";
import { usersTable } from "./lib/db/src/schema/users.ts";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Updating all admins to 'ativo'...");
  const result = await db.update(usersTable)
    .set({ status: "ativo" })
    .where(eq(usersTable.role, "admin"))
    .returning();
  
  console.log(`Updated ${result.length} admin users.`);
  result.forEach(u => console.log(`- ${u.email}: ${u.status}`));
  process.exit(0);
}

main().catch(err => {
  console.error("Error updating admins:", err);
  process.exit(1);
});
