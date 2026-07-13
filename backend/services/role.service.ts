import prisma from "../config/prisma";
import {
  getDefaultPermissions,
  PERMISSION_CATALOG,
} from "../config/permissions";

function normalizeCode(value: unknown) {
  return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

function validatePermissionIds(permissionIds: unknown): string[] {
  if (!Array.isArray(permissionIds)) return [];
  const validIds = new Set(PERMISSION_CATALOG.map((permission) => permission.id));
  const normalized = Array.from(new Set(permissionIds.map((id) => String(id).trim().toUpperCase())));
  const invalid = normalized.filter((id) => !validIds.has(id));
  if (invalid.length > 0) throw new Error(`Permission không hợp lệ: ${invalid.join(", ")}`);
  return normalized;
}

export const RoleService = {
  seedPermissionsAndSystemRoles: async () => {
    await prisma.$transaction(
      PERMISSION_CATALOG.map((permission) =>
        prisma.permission.upsert({
          where: { id: permission.id },
          update: permission,
          create: permission,
        }),
      ),
    );

    for (const code of ["SUPERADMIN", "ADMIN", "MANAGER", "STAFF"]) {
      const role = await prisma.role.upsert({
        where: { code },
        update: { name: code, isSystem: true },
        create: { code, name: code, isSystem: true },
      });
      const permissionIds = getDefaultPermissions(code);
      const assignedPermissionCount = await prisma.rolePermission.count({ where: { roleId: role.id } });
      if (assignedPermissionCount === 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({ roleId: role.id, permissionId })),
          skipDuplicates: true,
        });
      }
      await prisma.user.updateMany({ where: { role: code, roleId: null }, data: { roleId: role.id } });
    }
  },

  getPermissions: async () => {
    const permissions = await prisma.permission.findMany({ orderBy: [{ module: "asc" }, { name: "asc" }] });
    return permissions.length > 0 ? permissions : PERMISSION_CATALOG;
  },

  getRoles: async () => {
    const roles = await prisma.role.findMany({
      where: { code: { not: "SUPERADMIN" } },
      include: { permissions: { include: { permission: true } }, _count: { select: { users: true } } },
      orderBy: [{ isSystem: "desc" }, { name: "asc" }],
    });
    return roles.map((role) => ({
      ...role,
      id: role.id.toString(),
      permissionIds: role.permissions.map((item) => item.permissionId),
      permissions: role.permissions.map((item) => item.permission),
      userCount: role._count.users,
      _count: undefined,
    }));
  },

  createRole: async (data: any) => {
    const code = normalizeCode(data.code || data.name);
    if (!code || !String(data.name || "").trim()) throw new Error("Mã và tên Role không được để trống");
    const permissionIds = validatePermissionIds(data.permissions ?? data.permissionIds);
    const role = await prisma.role.create({
      data: {
        code,
        name: String(data.name).trim(),
        description: data.description ? String(data.description).trim() : null,
        permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) },
      },
      include: { permissions: true },
    });
    const { permissions, ...safeRole } = role;
    return { ...safeRole, id: role.id.toString(), permissionIds: permissions.map((item) => item.permissionId) };
  },

  updateRole: async (id: string, data: any) => {
    const existing = await prisma.role.findUnique({ where: { id: BigInt(id) } });
    if (!existing) throw new Error("Role không tồn tại");
    if (existing.code === "SUPERADMIN") throw new Error("Role không tồn tại");
    const permissionIds = validatePermissionIds(data.permissions ?? data.permissionIds);
    const role = await prisma.$transaction(async (transaction) => {
      await transaction.rolePermission.deleteMany({ where: { roleId: existing.id } });
      return transaction.role.update({
        where: { id: existing.id },
        data: {
          name: data.name ? String(data.name).trim() : existing.name,
          description: data.description === undefined ? existing.description : String(data.description || "").trim() || null,
          permissions: { create: permissionIds.map((permissionId) => ({ permissionId })) },
        },
        include: { permissions: true },
      });
    });
    const { permissions, ...safeRole } = role;
    return { ...safeRole, id: role.id.toString(), permissionIds: permissions.map((item) => item.permissionId) };
  },

  deleteRole: async (id: string) => {
    const role = await prisma.role.findUnique({ where: { id: BigInt(id) }, include: { _count: { select: { users: true } } } });
    if (!role) throw new Error("Role không tồn tại");
    if (role.code === "SUPERADMIN") throw new Error("Role không tồn tại");
    if (role.isSystem) throw new Error("Không thể xóa Role hệ thống");
    if (role._count.users > 0) throw new Error("Không thể xóa Role đang được gán cho nhân viên");
    await prisma.role.delete({ where: { id: role.id } });
  },
};
