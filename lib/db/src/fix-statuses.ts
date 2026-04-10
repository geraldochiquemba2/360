import { pool, db } from "./index";
import { usersTable } from "./schema";
import { eq, or } from "drizzle-orm";

async function fixStatuses() {
  if (!db) {
    console.error("Database connection not established. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log("Fixing user statuses...");

  try {
    // Set all candidato and admin users to 'ativo'
    const updated = await db
      .update(usersTable)
      .set({ status: "ativo" })
      .where(or(eq(usersTable.role, "candidato"), eq(usersTable.role, "admin")))
      .returning({ id: usersTable.id, email: usersTable.email, role: usersTable.role, status: usersTable.status });

    console.log(`Updated ${updated.length} users to 'ativo':`);
    updated.forEach(u => console.log(`  - [${u.role}] ${u.email} → ${u.status}`));

    console.log("Done!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await pool?.end();
  }
}

fixStatuses();
