import { pool, db } from "./index";
import { usersTable } from "./schema";
import bcrypt from "bcryptjs";

async function createAdmin() {
  if (!db) {
    console.error("Database connection not established. Check DATABASE_URL.");
    process.exit(1);
  }

  const email = "admin@gmail.com";
  const password = "1234567890";
  const role = "admin";
  const name = "Administrador";

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.insert(usersTable).values({
      name,
      email,
      passwordHash: hashedPassword,
      role,
    }).onConflictDoUpdate({
      target: usersTable.email,
      set: { passwordHash: hashedPassword, role }
    });

    console.log(`User ${email} created/updated successfully with role ${role}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await pool?.end();
  }
}

createAdmin();
