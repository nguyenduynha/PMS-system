import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// ─── Cấu hình singleton để tránh tạo nhiều kết nối trong dev hot-reload ─────
const globalForPrisma = globalThis as unknown as {
  _pgPool: Pool | undefined;
  _prismaClient: PrismaClient | undefined;
};

function khoiTaoPrisma(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "[Prisma] DATABASE_URL chưa được cấu hình. Vui lòng kiểm tra file .env"
    );
  }

  const pool =
    globalForPrisma._pgPool ??
    new Pool({ connectionString: databaseUrl });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma._pgPool = pool;
  }

  return client;
}

export const prisma: PrismaClient =
  globalForPrisma._prismaClient ?? khoiTaoPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma._prismaClient = prisma;
}
