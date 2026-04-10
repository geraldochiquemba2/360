import { pool, db } from "./index";
import { usersTable, mentorsTable, opportunitiesTable, forumTopicsTable } from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  if (!db) {
    console.error("Database connection not established. Check DATABASE_URL.");
    process.exit(1);
  }

  console.log("Starting seeding process...");

  try {
    const hashedPassword = await bcrypt.hash("password123", 10);

    // 1. Seed Users (Candidatos)
    console.log("Seeding users...");
    const candidates = [
      { name: "João Pedro", email: "joao@gmail.com", role: "candidato", formation: "Engenharia de Software", areaOfInterest: "Desenvolvimento Web" },
      { name: "Maria Silva", email: "maria@gmail.com", role: "candidato", formation: "Gestão de Empresas", areaOfInterest: "Marketing Digital" },
      { name: "António José", email: "antonio@gmail.com", role: "candidato", formation: "Contabilidade", areaOfInterest: "Finanças" },
      { name: "Isabel Santos", email: "isabel@gmail.com", role: "candidato", formation: "Recursos Humanos", areaOfInterest: "Recrutamento" },
      { name: "Carlos Manuel", email: "carlos@gmail.com", role: "candidato", formation: "Direito", areaOfInterest: "Advocacia" },
    ];

    const insertedUsers = [];
    for (const u of candidates) {
      const [user] = await db.insert(usersTable).values({
        name: u.name,
        email: u.email,
        passwordHash: hashedPassword,
        role: u.role,
        formation: u.formation,
        areaOfInterest: u.areaOfInterest
      }).onConflictDoNothing().returning();
      if (user) insertedUsers.push(user);
    }

    // 2. Seed Mentors
    console.log("Seeding mentors...");
    const mentorData = [
      { name: "Dr. Ricardo Santos", email: "ricardo.mentor@gmail.com", specialties: "Liderança, Estratégia", bio: "Consultor com 15 anos de experiência em multinacionais." },
      { name: "Eng. Ana Paula", email: "ana.mentor@gmail.com", specialties: "Software Architecture, Cloud", bio: "Especialista em sistemas distribuídos e mentora de tecnologia." },
      { name: "Dra. Sofia Lima", email: "sofia.mentor@gmail.com", specialties: "Recursos Humanos, Coaching", bio: "Psicóloga organizacional focada em desenvolvimento de carreira." },
    ];

    for (const m of mentorData) {
      const [u] = await db.insert(usersTable).values({
        name: m.name,
        email: m.email,
        passwordHash: hashedPassword,
        role: "mentor"
      }).onConflictDoNothing().returning();

      if (u) {
        await db.insert(mentorsTable).values({
          userId: u.id,
          bio: m.bio,
          specialties: m.specialties,
          status: "pendente" // Starts as pending for admin to approve
        });
      }
    }

    // 3. Seed Opportunities
    console.log("Seeding opportunities...");
    const opportunities = [
      { 
        title: "Desenvolvedor Frontend Junior", 
        company: "TechAngola", 
        location: "Luanda", 
        type: "emprego", 
        description: "Buscamos talentos em React e Tailwind CSS.",
        requirements: "Conhecimento básico de Git, HTML/CSS/JS.",
        link: "https://techangola.com/vagas/1"
      },
      { 
        title: "Estágio em Marketing Digital", 
        company: "Agência Criativa", 
        location: "Benguela", 
        type: "estagio", 
        description: "Aprenda a gerir campanhas reais e redes sociais.",
        requirements: "Vontade de aprender e boa escrita.",
        link: "mailto:rh@criativa.co.ao"
      },
      { 
        title: "Bolsa de Estudo IT", 
        company: "Fundação Futuro", 
        location: "Remoto", 
        type: "bolsa", 
        description: "Bolsa integral para curso de Cibersegurança.",
        requirements: "Ensino médio concluído.",
        link: "https://fundacaofuturo.org/bolsas"
      },
      { 
        title: "Analista Financeiro Pleno", 
        company: "Banco Sol", 
        location: "Luanda", 
        type: "emprego", 
        description: "Análise de riscos e gestão de portfólio.",
        requirements: "Licenciatura em Economia ou Gestão.",
        link: "https://bancosol.ao/carreiras"
      }
    ];

    for (const op of opportunities) {
      await db.insert(opportunitiesTable).values(op);
    }

    // 4. Seed Forum Topics (using the first candidate as author)
    if (insertedUsers.length > 0) {
      console.log("Seeding forum topics...");
      const topics = [
        { 
          title: "Como conseguir o primeiro emprego em TI?", 
          content: "Estou a terminar a licenciatura e gostava de saber quais os melhores caminhos.", 
          category: "carreira", 
          authorId: insertedUsers[0].id 
        },
        { 
          title: "Dicas para currículo de estagiário", 
          content: "O que colocar quando não temos experiência profissional anterior?", 
          category: "vagas", 
          authorId: insertedUsers[1].id || insertedUsers[0].id
        }
      ];

      for (const t of topics) {
        await db.insert(forumTopicsTable).values(t);
      }
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
  } finally {
    await pool?.end();
  }
}

seed();
