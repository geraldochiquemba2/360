import { Router } from "express";
import { db } from "@workspace/db";
import { opportunitiesTable } from "@workspace/db";
import { desc } from "drizzle-orm";

const opportunitiesRouter = Router();

opportunitiesRouter.get("/", async (req, res) => {
  try {
    if (!db) return res.status(500).json({ error: "Database not configured" });
    const list = await db.select().from(opportunitiesTable).orderBy(desc(opportunitiesTable.createdAt));
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

export default opportunitiesRouter;
