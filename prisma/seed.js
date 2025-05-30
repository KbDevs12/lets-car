const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.users.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "admin",
      profiles: {
        create: {
          full_name: "Administrator",
          email: "admin@example.com",
          phone: "081234567890",
          address: "Jl. Raya No. 1",
        },
      },
    },
  });

  console.log("✅ User default berhasil dibuat:", user.username);
}

main()
  .catch((e) => {
    console.error("❌ Gagal seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
