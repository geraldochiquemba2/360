const { db, forumLikesTable, forumTopicsTable } = require("./lib/db/src");
const { eq } = require("drizzle-orm");

async function checkReactions() {
  try {
    const likes = await db.select().from(forumLikesTable);
    console.log("Total reações encontradas:", likes.length);
    console.log(JSON.stringify(likes, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkReactions();
