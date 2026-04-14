import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.ts";

const connectionString = "postgresql://neondb_owner:npg_17YnmtECOwdJ@ep-billowing-snow-am24xzwl-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

async function seed() {
  console.log("Starting seed...");
  const client = new pg.Pool({ connectionString });
  const db = drizzle(client, { schema });

  try {
    // 1. Inserir Trilhas
    const tracks = await db.insert(schema.tracksTable).values([
      {
        title: "ANALISTA FINANCEIRO: GESTÃO DE RISCOS",
        description: "Domina a análise financeira moderna e gestão estratégica de riscos em mercados emergentes.",
        category: "Finanças",
        duration: "12 Horas",
        imageUrl: "https://images.unsplash.com/photo-1454165833767-02484d720bed?q=80&w=2070&auto=format&fit=crop"
      },
      {
        title: "LIDERANÇA DIGITAL E GESTÃO DE EQUIPAS",
        description: "Lidera transformações digitais e gere equipas híbridas de alta performance.",
        category: "Gestão",
        duration: "8 Horas",
        imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop"
      },
      {
        title: "DESENVOLVIMENTO WEB FULLSTACK 2026",
        description: "Constrói aplicações modernas com React, Next.js e Inteligência Artificial.",
        category: "Tecnologia",
        duration: "45 Horas",
        imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2070&auto=format&fit=crop"
      }
    ]).returning();

    console.log("Tracks inserted:", tracks.length);

    // 2. Inserir Módulos para a primeira trilha
    for (const track of tracks) {
      const modules = await db.insert(schema.modulesTable).values([
        { trackId: track.id, title: "Módulo 1: Introdução e Fundamentos", order: 1 },
        { trackId: track.id, title: "Módulo 2: Estratégias Avançadas", order: 2 }
      ]).returning();

      // 3. Inserir Vídeos "Mock"
      for (const mod of modules) {
        await db.insert(schema.videosTable).values([
          {
            trackId: track.id,
            moduleId: mod.id,
            title: `Vídeo 1: Panorama Geral do ${track.category}`,
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Vídeo de teste
            description: "Uma introdução completa ao tema central desta fase da aprendizagem.",
            order: 1,
            xpPoints: 150
          }
        ]);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await client.end();
  }
}

seed();
