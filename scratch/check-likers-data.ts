import { db } from "../lib/db/src/index";
import { forumLikesTable, usersTable } from "../lib/db/src/schema/index";
import { eq } from "drizzle-orm";

async function checkLikers() {
  console.log("--- Diagnóstico de Admiradores ---");
  
  if (!db) {
    console.error("ERRO: Objeto 'db' não inicializado. Verifique DATABASE_URL.");
    return;
  }

  // Vamos buscar as reações de tópicos e os nomes dos utilizadores
  const reacoes = await db.select({
    id: forumLikesTable.id,
    topicId: forumLikesTable.topicId,
    userId: forumLikesTable.userId,
    userName: usersTable.name,
    type: forumLikesTable.type
  })
  .from(forumLikesTable)
  .leftJoin(usersTable, eq(forumLikesTable.userId, usersTable.id))
  .where(eq(forumLikesTable.targetType, "topic"));

  console.log(`Encontradas ${reacoes.length} reações para tópicos.`);
  console.table(reacoes);

  const semNome = reacoes.filter(r => !r.userName);
  if (semNome.length > 0) {
    console.log(`AVISO: Encontradas ${semNome.length} reações sem nome de utilizador associado.`);
    console.log("Detalhes das reações problemáticas:");
    console.table(semNome);
  } else if (reacoes.length > 0) {
    console.log("SUCESSO: Todas as reações têm um nome de utilizador associado.");
  }
}

checkLikers().catch(console.error);
