import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seeding...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";
  const adminFullName = process.env.ADMIN_FULLNAME || "المشرف الرئيسي";
  const adminPhone = process.env.ADMIN_PHONE || "+966500000000";

  const existingAdmin = await db
    .select()
    .from(users)
    .where(eq(users.role, "admin"))
    .limit(1);

  if (existingAdmin.length > 0) {
    console.log("✅ Admin user already exists. Skipping seed.");
    console.log(`   Email: ${existingAdmin[0].email}`);
    return;
  }

  const existingUserByEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, adminEmail))
    .limit(1);

  if (existingUserByEmail.length > 0) {
    console.log("⚠️  User with admin email already exists. Promoting to admin...");
    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.email, adminEmail));
    console.log("✅ User promoted to admin successfully!");
    console.log(`   Email: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const [adminUser] = await db
    .insert(users)
    .values({
      fullName: adminFullName,
      email: adminEmail,
      phone: adminPhone,
      passwordHash,
      role: "admin",
    })
    .returning();

  console.log("✅ Admin user created successfully!");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Password: ${adminPassword}`);
  console.log(`   Full Name: ${adminFullName}`);
  console.log(`   Phone: ${adminPhone}`);
  console.log("\n⚠️  IMPORTANT: Please change the admin password after first login!");
  
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
