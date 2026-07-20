import prisma from "../config/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { expandLegacyPermissions, getDefaultPermissions } from "../config/permissions";

export const UserService = {
  // 1. Lấy danh sách user
  getAllUsers: async () => {
    const users = await prisma.user.findMany({
      where: {
  AND: [
    {
      role: {
        not: "SUPERADMIN"
      }
    },
    {
      usercode: {
        not: "ADMIN-SYSTEM"
      }
    }
  ]
},
      select: {
        id: true,
        usercode: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        status: true,
        permissions: true,
        positionId: true,
        createdAt: true,
        position: {
          select: {
            id: true,
            position_name: true,
          }
        },
        roleRecord: {
          select: { id: true, code: true, name: true, permissions: { select: { permissionId: true } } }
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => {
      const directPermissions = expandLegacyPermissions(user.permissions);
      const rolePermissions = user.roleRecord?.permissions.map(item => item.permissionId) || [];
      const { roleRecord, ...safeUser } = user;
      return {
        ...safeUser,
        id: user.id.toString(),
        roleId: user.roleRecord?.id.toString() || null,
        permissions: directPermissions.length > 0 ? directPermissions : rolePermissions.length > 0 ? rolePermissions : getDefaultPermissions(user.role),
      };
    });
  },

  // 2. Tạo user mới
 createUser: async (
  data: any,
  currentUser: { id: string; role: string }
) => {

  const selectedRoleRecord = data.roleId
    ? await prisma.role.findUnique({ where: { id: BigInt(data.roleId) } })
    : null;
  const requestedRole = String(selectedRoleRecord?.code || data.role || "")
    .trim()
    .toUpperCase();

  const currentRole = String(currentUser.role || "")
    .trim()
    .toUpperCase();

  // Chỉ SUPERADMIN mới được tạo SUPERADMIN
  if (
    requestedRole === "SUPERADMIN" &&
    currentRole !== "SUPERADMIN"
  ) {
    throw new Error(
      "Chỉ SUPERADMIN mới được tạo tài khoản SUPERADMIN"
    );
  }

  const { password, roleId, ...userData } = data;
  const hashedPassword = await bcrypt.hash(password, 10);

  const roleRecord = selectedRoleRecord || await prisma.role.findUnique({ where: { code: requestedRole } });

  const newUser = await prisma.user.create({
    data: {
      ...userData,
      role: requestedRole,
      password: hashedPassword,
      permissions: expandLegacyPermissions(userData.permissions),
      roleId: roleRecord?.id || null,
    },
  });

  const { password: _password, ...safeUser } = newUser;
  return {
    ...safeUser,
    id: newUser.id.toString(),
    roleId: newUser.roleId?.toString() || null,
    positionId: newUser.positionId?.toString() || null,
    permissions: expandLegacyPermissions(newUser.permissions),
  };
},

  // 3. Lấy danh sách chức vụ
  getPositions: async () => {
    return await prisma.position.findMany({
      select: {
        id: true,
        position_name: true,
      }
    });
  },

  // 4. Lấy thông tin user theo ID (để edit)
  getUserById: async (id: string) => {
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        position: true,
        roleRecord: { include: { permissions: true } },
      }
    });
    
    if (!user) return null;

    const directPermissions = expandLegacyPermissions(user.permissions);
    const rolePermissions = user.roleRecord?.permissions.map(item => item.permissionId) || [];
    const { password: _password, roleRecord, ...safeUser } = user;
    return {
      ...safeUser,
      id: user.id.toString(),
      roleId: user.roleId?.toString() || null,
      permissions: directPermissions.length > 0 ? directPermissions : rolePermissions.length > 0 ? rolePermissions : getDefaultPermissions(user.role),
    };
  },

  // 5. Cập nhật thông tin người dùng
updateUser: async (
  id: string,
  data: any,
  currentUser: {
    id: string;
    role: string;
  }
) => {
  const currentRole = String(currentUser.role || "")
    .trim()
    .toUpperCase();

  const requestedRole = String(data.role || "")
    .trim()
    .toUpperCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      id: BigInt(id),
    },
  });

  if (!existingUser) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const existingRole = String(existingUser.role || "")
    .trim()
    .toUpperCase();

  if (existingRole === "SUPERADMIN" && currentUser.id !== id) {
    throw new Error("Không tìm thấy tài khoản");
  }

  const isSuperAdmin = currentRole === "SUPERADMIN";
  const isAdmin = currentRole === "ADMIN";
  const isEditingSelf = currentUser.id === id;

  // Chỉ SUPERADMIN mới được cấp role SUPERADMIN
  if (requestedRole === "SUPERADMIN" && !isSuperAdmin) {
    throw new Error(
      "ADMIN không được phép cấp vai trò SUPERADMIN"
    );
  }

  // Người không phải SUPERADMIN không được sửa SUPERADMIN
  if (existingRole === "SUPERADMIN" && !isSuperAdmin) {
    throw new Error(
      "Bạn không được chỉnh sửa tài khoản SUPERADMIN"
    );
  }

  // Tạo bản sao, không sửa trực tiếp data
  const safeData: any = {
    ...data,
  };

  // ADMIN không được tự sửa role, quyền và trạng thái
  if (isAdmin && isEditingSelf) {
    delete safeData.role;
    delete safeData.permissions;
    delete safeData.status;
  }

  // ADMIN không được cấp các quyền quản trị cấp cao
  if (!isSuperAdmin && Array.isArray(safeData.permissions)) {
    const forbiddenPermissions = [
      "SUPERADMIN",
      "SUPERUSER",
      "ROLE_MANAGE",
      "PERMISSION_MANAGE",
      "USER_MANAGE_ALL",
    ];

    const hasForbiddenPermission =
      safeData.permissions.some((permission: unknown) =>
        forbiddenPermissions.includes(
          String(permission).trim().toUpperCase()
        )
      );

    if (hasForbiddenPermission) {
      throw new Error(
        "ADMIN không được cấp quyền quản trị cấp SUPERADMIN"
      );
    }
  }

  const { password, ...userData } = safeData;

  const updateData: any = {
    ...userData,
  };

  if (updateData.role) {
    updateData.role = String(updateData.role)
      .trim()
      .toUpperCase();
  }

  if (Array.isArray(updateData.permissions)) {
    updateData.permissions = expandLegacyPermissions(updateData.permissions);
  }

  if (updateData.roleId) {
    const selectedRole = await prisma.role.findUnique({ where: { id: BigInt(updateData.roleId) } });
    if (!selectedRole) throw new Error("Role không tồn tại");
    updateData.roleId = selectedRole.id;
    updateData.role = selectedRole.code;
  } else if (updateData.role) {
    const roleRecord = await prisma.role.findUnique({ where: { code: updateData.role } });
    updateData.roleId = roleRecord?.id || null;
  }

  if (
    password &&
    typeof password === "string" &&
    password.trim() !== ""
  ) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: BigInt(id),
    },
    data: updateData,
  });

  const { password: _password, ...safeUser } = updatedUser;
  return {
    ...safeUser,
    id: updatedUser.id.toString(),
    roleId: updatedUser.roleId?.toString() ?? null,
    positionId:
      updatedUser.positionId?.toString() ?? null,
  };
},

  // 6. Tạo chức vụ mới (Position)
  createPosition: async (data: { position_name: string; description?: string }) => {
    return await prisma.position.create({
      data: {
        position_name: data.position_name,
        description: data.description,
      },
    });
  },

  // 7. Hàm đăng nhập
  login: async (loginData: any) => {
    const { password } = loginData;
    const loginIdentifier = loginData.username || loginData.email || "";

    if (!loginIdentifier || !password) {
      throw new Error("Thiếu tên đăng nhập hoặc mật khẩu");
    }

    // 1. Lấy cấu hình từ .env
    const envAdminEmail = process.env.ADMIN_EMAIL;
    const envAdminPass = process.env.ADMIN_PASSWORD;

    // 2. CÁCH 1: KIỂM TRA TÀI KHOẢN TRONG .ENV TRƯỚC
    const isEnvAdmin = (envAdminEmail && (loginIdentifier === envAdminEmail || loginIdentifier === "admin" || loginIdentifier === "ADMIN-SYSTEM")) && password === envAdminPass;

    if (isEnvAdmin) {
      console.log("--- Đăng nhập bằng quyền Admin (.env) ---");
      
      let dbAdmin = null;
      try {
        // Thử tìm admin trong database xem có sẵn chưa
        dbAdmin = await prisma.user.findFirst({
          where: {
            OR: [
              { email: envAdminEmail },
              { usercode: "ADMIN-SYSTEM" }
            ]
          },
          include: { position: true, roleRecord: { include: { permissions: true } } }
        });
      } catch (dbError) {
        console.warn("⚠️ Cảnh báo: Không thể truy vấn Database. Đăng nhập bằng tài khoản Admin ảo.");
      }

      // Nếu database online mà chưa có tài khoản admin, tự động tạo mới
      if (!dbAdmin) {
        try {
          const hashedPassword = await bcrypt.hash(envAdminPass, 10);
          
          let adminPos = await prisma.position.findUnique({
            where: { position_name: "ADMIN" }
          });
          if (!adminPos) {
            adminPos = await prisma.position.create({
              data: { position_name: "ADMIN", description: "Quản trị viên" }
            });
          }

          dbAdmin = await prisma.user.create({
            data: {
              usercode: "ADMIN-SYSTEM",
              fullName: "Quản trị viên Hệ thống",
              email: envAdminEmail,
              password: hashedPassword,
              role: "ADMIN",
              status: "ACTIVE",
              positionId: adminPos.id
            },
            include: { position: true }
          });
        } catch (createError) {
          console.warn("⚠️ Cảnh báo: Không thể tạo Admin trong DB (DB offline). Sử dụng User ảo ID '0'.");
          
          // Trả về tài khoản Admin ảo nếu DB offline
          const token = jwt.sign(
            { id: "admin-env", role: "ADMIN" },
            process.env.JWT_SECRET || "pms_secret_key",
            { expiresIn: "1d" }
          );

          return {
            user: {
              id: "0",
              usercode: "ADMIN-SYSTEM",
              fullName: "Quản trị viên Hệ thống",
              email: envAdminEmail,
              role: "ADMIN",
              status: "ACTIVE",
              avatarUrl: null,
              permissions: getDefaultPermissions("ADMIN")
            },
            token
          };
        }
      }

      // Đăng nhập bằng tài khoản database Admin thực tế
      if (dbAdmin) {
        if (dbAdmin.status === "LOCKED") {
          throw new Error("Tài khoản Quản trị viên đã bị khóa. Vui lòng liên hệ hỗ trợ.");
        }
        if (dbAdmin.status === "INACTIVE") {
          throw new Error("Tài khoản Quản trị viên đã ngừng hoạt động.");
        }
      }

      const token = jwt.sign(
        { id: dbAdmin.id.toString(), role: "ADMIN" },
        process.env.JWT_SECRET || "pms_secret_key",
        { expiresIn: "1d" }
      );

      const { password: _, roleRecord, ...userWithoutPass } = dbAdmin as any;
      const directPermissions = expandLegacyPermissions(dbAdmin.permissions);
      const rolePermissions = roleRecord?.permissions?.map((item: any) => item.permissionId) || [];
      return {
        user: {
          ...userWithoutPass,
          id: dbAdmin.id.toString(),
          roleId: dbAdmin.roleId?.toString() || null,
          permissions: directPermissions.length > 0 ? directPermissions : rolePermissions.length > 0 ? rolePermissions : getDefaultPermissions(dbAdmin.role),
        },
        token
      };
    }

    // 3. CÁCH 2: NẾU KHÔNG PHẢI TÀI KHOẢN .ENV -> TÌM TRONG SQL DATABASE
    const user = await prisma.user.findFirst({ 
      where: {
        OR: [
          { email: loginIdentifier },
          { usercode: loginIdentifier }
        ]
      },
      include: { position: true, roleRecord: { include: { permissions: true } } }
    });

    // Nếu không tìm thấy trong cả .env và Database
    if (!user) {
      throw new Error("Tên đăng nhập hoặc Email không tồn tại trong hệ thống");
    }

    // Kiểm tra trạng thái tài khoản
    if (user.status === "LOCKED") {
      throw new Error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên.");
    }
    if (user.status === "INACTIVE") {
      throw new Error("Tài khoản của bạn đã ngừng hoạt động.");
    }
    if (user.status === "PENDING") {
      throw new Error("Tài khoản của bạn đang chờ được kích hoạt.");
    }

    // So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Mật khẩu không chính xác");
    }

    // Tạo token cho user bình thường
    const token = jwt.sign(
      { id: user.id.toString(), role: user.role },
      process.env.JWT_SECRET || "pms_secret_key",
      { expiresIn: "1d" }
    );

    // Trả về dữ liệu (loại bỏ password)
    const { password: _, roleRecord, ...userWithoutPass } = user;
    const directPermissions = expandLegacyPermissions(user.permissions);
    const rolePermissions = roleRecord?.permissions.map(item => item.permissionId) || [];
    return { 
      user: {
        ...userWithoutPass,
        id: user.id.toString(),
        roleId: user.roleId?.toString() || null,
        permissions: directPermissions.length > 0 ? directPermissions : rolePermissions.length > 0 ? rolePermissions : getDefaultPermissions(user.role),
      },
      token 
    };
  },

  // 8. Xóa tài khoản nhân viên
  deleteUser: async (id: string) => {
    const cleanId = BigInt(id);

    // Gỡ mối liên kết khóa ngoại trước để tránh lỗi ràng buộc cơ sở dữ liệu
    await prisma.booking.updateMany({
      where: { userId: cleanId },
      data: { userId: null }
    });

    await prisma.maintenanceRecord.updateMany({
      where: { staffId: cleanId },
      data: { staffId: null }
    });

    return await prisma.user.delete({
      where: { id: cleanId }
    });
  }
};
