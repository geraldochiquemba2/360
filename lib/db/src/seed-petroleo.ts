import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL não encontrada no .env");
  process.exit(1);
}

async function seed() {
  console.log("Iniciando seed da Trilha de Engenharia de Petróleos...");
  const client = new pg.Pool({ connectionString });
  const db = drizzle(client, { schema });

  try {
    // 1. Inserir a Trilha
    const [track] = await db.insert(schema.tracksTable).values({
      title: "TRILHA PROFISSIONAL: ENGENHEIRO DE PETRÓLEOS",
      description: "Levar o jovem engenheiro desde a base técnica até estar preparado para trabalhar em operações, exploração ou produção petrolífera.",
      category: "Engenharia",
      duration: "60 Horas",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop"
    }).returning();

    console.log("Trilha criada:", track.title);

    // 2. Módulos (Fases)
    const phases = [
      {
        title: "FASE 1 — Fundamentos da Indústria Petrolífera",
        order: 1,
        items: [
          { title: "Cadeia de valor do petróleo (Upstream, Midstream, Downstream)", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 150, desc: "Entende o fluxo global do petróleo desde a exploração até ao consumidor final." },
          { title: "Geologia do Petróleo e Tipos de Reservatórios", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 150, desc: "Fundamentos geológicos essenciais para identificar acumulações de hidrocarbonetos." },
          { title: "Actividade Prática: Mapa da Cadeia Petrolífera em Angola", type: "activity", url: "#", xp: 200, desc: "Cria um mapa mental detalhando os principais blocos e refinarias em Angola." },
          { title: "Quiz: Conceitos Técnicos Iniciais", type: "quiz", url: "#", xp: 100, desc: "Valida os teus conhecimentos sobre a indústria petrolífera." }
        ]
      },
      {
        title: "FASE 2 — Bases Técnicas do Engenheiro de Petróleos",
        order: 2,
        items: [
          { title: "Engenharia de Reservatórios e Fluídos de Perfuração", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 200, desc: "Cálculos de fluxo e propriedades dos fluidos em condições de subsuperfície." },
          { title: "Equipamentos Petrolíferos e Produção de Poços", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 200, desc: "Identificação e operação de árvores de natal, bombas e separadores." },
          { title: "Segurança Industrial Offshore (HSE)", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 250, desc: "Protocolos críticos para operações em mar alto." },
          { title: "Estudo de Caso: Análise de Falhas Operacionais Reais", type: "activity", url: "#", xp: 300, desc: "Analisa relatórios de incidentes e propõe medidas correctivas." }
        ]
      },
      {
        title: "FASE 3 — Ferramentas e Competências Profissionais",
        order: 3,
        items: [
          { title: "Excel Aplicado à Engenharia de Petróleos", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 150, desc: "Automação de cálculos de produção e dashboards financeiros." },
          { title: "Interpretação de Dados de Produção", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 150, desc: "Como ler logs de produção e identificar tendências de declínio." },
          { title: "Inglês Técnico Petrolífero", type: "activity", url: "#", xp: 200, desc: "Treino de vocabulário focado em glossários internacionais da indústria." },
          { title: "Escrita de Relatórios Técnicos", type: "activity", url: "#", xp: 150, desc: "Estruturação de relatórios para supervisores e equipas multidisciplinares." }
        ]
      },
      {
        title: "FASE 4 — Experiência Simulada de Campo",
        order: 4,
        items: [
          { title: "Simulação: Diagnóstico de Queda de Produção", type: "simulation", url: "#", xp: 500, desc: "O poço X-23 perdeu 20% de pressão. Identifica a causa e sugere intervenção." },
          { title: "Escolha de Método de Recuperação Secundária", type: "simulation", url: "#", xp: 400, desc: "Injecção de água ou gás? Decide com base nos dados do reservatório." },
          { title: "Plano de Segurança para Operação Offshore", type: "simulation", url: "#", xp: 400, desc: "Cria um plano de evacuação simulado para uma plataforma." }
        ]
      },
      {
        title: "FASE 5 — Preparação para o Mercado Petrolífero",
        order: 5,
        items: [
          { title: "CV Técnico Optimizado para Petróleo", type: "activity", url: "#", xp: 200, desc: "Destaque de projectos académicos e competências técnicas específicas." },
          { title: "Simulação de Entrevista Técnica com IA", type: "evaluation", url: "#", xp: 600, desc: "Responde a perguntas sobre pressão inesperada e métodos de recuperação." },
          { title: "Perguntas Típicas da Indústria (Workshop)", type: "video", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", xp: 150, desc: "Como abordar questões de comportamento e ética em operações críticas." }
        ]
      },
      {
        title: "FASE 6 — Inserção Profissional",
        order: 6,
        items: [
          { title: "Directório de Estágios em Empresas Petrolíferas", type: "activity", url: "#", xp: 100, desc: "Acesso a links directos para programas de estágio da Sonangol, Chevron, Total, etc." },
          { title: "Programas de Trainees e Bolsas", type: "activity", url: "#", xp: 100, desc: "Oportunidades de especialização no exterior e em Angola." }
        ]
      }
    ];

    for (const phase of phases) {
      const [mod] = await db.insert(schema.modulesTable).values({
        trackId: track.id,
        title: phase.title,
        order: phase.order
      }).returning();

      for (let i = 0; i < phase.items.length; i++) {
        const item = phase.items[i];
        await db.insert(schema.videosTable).values({
          trackId: track.id,
          moduleId: mod.id,
          title: item.title,
          url: item.url,
          description: item.desc,
          type: item.type,
          xpPoints: item.xp,
          order: i + 1
        });
      }
    }

    console.log("Seeding da Trilha de Petróleo concluído com sucesso!");
  } catch (err) {
    console.error("Erro no seed:", err);
  } finally {
    await client.end();
  }
}

seed();
