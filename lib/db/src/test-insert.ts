import { db } from "./index";
import { mentorsTable } from "./schema";

async function main() {
  if (!db) {
    console.error("Database not initialized");
    process.exit(1);
  }
  console.log("Inserting mentor data for user id: 2...");
  try {
    await db.insert(mentorsTable).values({
      userId: 2,
      bio: "",
      specialties: "",
      linkedinUrl: "https://x",
      status: "ativo"
    });
    console.log("Insert success!");
  } catch (error) {
    console.error("Insert failed:", error);
  }
  process.exit(0);
}

main().catch(console.error);
