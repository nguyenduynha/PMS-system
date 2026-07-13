import prisma from "../config/prisma";
import { RoleService } from "../services/role.service";

RoleService.seedPermissionsAndSystemRoles()
  .then(() => console.log("✅ Đã đồng bộ Permission và Role hệ thống"))
  .catch((error) => {
    console.error("❌ Không thể đồng bộ Permission và Role:", error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
