import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Hash password default: "admin123"
  const hashedPassword = await bcrypt.hash("admin123", 12);

  // Create default admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@catering.com" },
    update: {},
    create: {
      name: "Admin Utama",
      email: "admin@catering.com",
      password: hashedPassword,
      level: "admin",
    },
  });

  // Create default owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@catering.com" },
    update: {},
    create: {
      name: "Owner Catering",
      email: "owner@catering.com",
      password: hashedPassword,
      level: "owner",
    },
  });

  // Create default kurir
  const kurir = await prisma.user.upsert({
    where: { email: "kurir@catering.com" },
    update: {},
    create: {
      name: "Kurir Catering",
      email: "kurir@catering.com",
      password: hashedPassword,
      level: "kurir",
    },
  });

  console.log({ admin, owner, kurir });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });