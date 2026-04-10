import { db, usersTable, opportunitiesTable, forumTopicsTable } from "./index";
import { count } from "drizzle-orm";

async function check() {
  if (!db) {
    console.log("DB not connected");
    return;
  }
  try {
    const u = await db.select({ count: count() }).from(usersTable);
    const o = await db.select({ count: count() }).from(opportunitiesTable);
    const f = await db.select({ count: count() }).from(forumTopicsTable);
    console.log("STAT_CHECK:", JSON.stringify({
      users: u[0].count,
      opportunities: o[0].count,
      forum: f[0].count
    }));
  } catch (e) {
    console.error("STAT_CHECK_ERROR:", (e as any).message);
  } finally {
    process.exit(0);
  }
}

check();
