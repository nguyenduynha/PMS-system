import "dotenv/config";
import app from "./app";
import prisma from "./config/prisma";
import { SeedService } from "./services/seed.service";
import { RoleService } from "./services/role.service";

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log("✅ Kết nối Database thành công qua Prisma");

    // Chỉ chạy seed trong local/development
    if (process.env.NODE_ENV !== "production") {
      await SeedService.seedAll();
      await RoleService.seedPermissionsAndSystemRoles();
      console.log("✅ Seed dữ liệu development hoàn tất");
    }
  } catch (error) {
    console.error("❌ Không thể kết nối Database PostgreSQL:", error);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
  });
}

startServer();