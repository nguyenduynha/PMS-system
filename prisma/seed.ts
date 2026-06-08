import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash("123456", 10);

  await prisma.user.upsert({
    where: { email: "admin@hotel.com" },
    update: {},
    create: {
      fullName: "Quản trị viên",
      email: "admin@hotel.com",
      password:"2004",
      phoneNumber: "0900000000",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Tạo tài khoản admin thành công");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });