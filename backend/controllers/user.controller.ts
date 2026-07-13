import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { AuthRequest } from "../middleware/auth.middleware";
import fs from "fs";
import path from "path";

export const UserController = {
  // 1. Lấy danh sách tài khoản
  getUsers: async (_req: AuthRequest, res: Response) => {
    try {
      const users = await UserService.getAllUsers();

      return res.status(200).json(users);
    } catch (error: any) {
      console.error("Lỗi lấy danh sách tài khoản:", error);

      return res.status(500).json({
        message:
          error?.message || "Không thể tải danh sách tài khoản",
      });
    }
  },

  // 2. Tạo tài khoản mới
 create: async (req: AuthRequest, res: Response) => {
  try {
    const authUser = req.user;

    if (!authUser) {
      return res.status(401).json({
        message: "Yêu cầu đăng nhập trước",
      });
    }

    const currentRole = String(authUser.role || "")
      .trim()
      .toUpperCase();

    const requestedRole = String(req.body.role || "")
      .trim()
      .toUpperCase();

    const requestedUsercode = String(req.body.usercode || "")
      .trim()
      .toUpperCase();

    if (!authUser.permissions.includes("USER_CREATE") && currentRole !== "SUPERADMIN") {
      return res.status(403).json({
        message: "Bạn không có quyền tạo tài khoản",
      });
    }

    if (requestedRole === "SUPERADMIN") {
      return res.status(403).json({
        message: "SUPERADMIN là tài khoản hệ thống và không thể tạo từ giao diện quản trị",
      });
    }

    // Không cho tạo tài khoản hệ thống bằng form
    if (requestedUsercode === "ADMIN-SYSTEM") {
      return res.status(403).json({
        message:
          "Không được phép tạo tài khoản ADMIN-SYSTEM",
      });
    }

    const newUser = await UserService.createUser(
  req.body,
  authUser
);

    return res.status(201).json({
      message: "Thêm tài khoản thành công",
      data: newUser,
    });
  } catch (error: any) {
    console.error("Lỗi tạo tài khoản:", error);

    return res.status(400).json({
      message:
        error?.message || "Không thể tạo tài khoản",
    });
  }
},

  // 3. Lấy danh sách chức vụ
  getPositions: async (_req: Request, res: Response) => {
    try {
      const positions = await UserService.getPositions();

      const result = positions.map((position: any) => ({
        ...position,
        id: position.id?.toString(),
      }));

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Lỗi lấy danh sách chức vụ:", error);

      return res.status(500).json({
        message:
          "Lỗi server khi lấy chức vụ: " +
          (error?.message || "Không xác định"),
      });
    }
  },

  // 4. Lấy cấu hình Cloudinary
  getCloudinaryConfig: async (
    _req: Request,
    res: Response
  ) => {
    return res.status(200).json({
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      uploadPreset:
        process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  },

  // 5. Lấy thông tin tài khoản theo ID
  getById: async (req: AuthRequest, res: Response) => {
    try {
      const authUser = req.user;
      const targetId = req.params.id;

      if (!authUser) {
        return res.status(401).json({
          message: "Yêu cầu đăng nhập trước",
        });
      }

      const isAdmin = authUser.role === "ADMIN";
      const isSuperAdmin =
        authUser.role === "SUPERADMIN";
      const isViewingSelf = authUser.id === targetId;
      const canViewUsers = authUser.permissions.includes("USER_VIEW") || isSuperAdmin;

      // Nhân viên chỉ được xem chính mình
      if (!canViewUsers && !isViewingSelf) {
        return res.status(403).json({
          message:
            "Bạn không có quyền xem tài khoản này",
        });
      }

      const user =
        await UserService.getUserById(targetId);

      if (!user) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      // SUPERADMIN là tài khoản hệ thống ẩn, chỉ chính tài khoản đó được xem hồ sơ của mình.
      if (user.role === "SUPERADMIN" && !isViewingSelf) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      return res.status(200).json({
        ...user,
        id: user.id.toString(),
        positionId:
          (user as any).positionId?.toString() ?? null,
        position: (user as any).position
          ? {
              ...(user as any).position,
              id: (user as any).position.id.toString(),
            }
          : null,
      });
    } catch (error: any) {
      console.error("Lỗi lấy tài khoản theo ID:", error);

      return res.status(500).json({
        message:
          error?.message ||
          "Không thể lấy thông tin tài khoản",
      });
    }
  },

  // 6. Cập nhật tài khoản
  update: async (req: AuthRequest, res: Response) => {
  try {
    const authUser = req.user;
    const targetId = req.params.id;

    if (!authUser) {
      return res.status(401).json({
        message: "Yêu cầu đăng nhập trước",
      });
    }

    const currentRole = String(authUser.role || "")
      .trim()
      .toUpperCase();

    const requestedRole = String(req.body.role || "")
      .trim()
      .toUpperCase();

    const isAdmin = currentRole === "ADMIN";
    const isSuperAdmin = currentRole === "SUPERADMIN";
    const isEditingSelf = authUser.id === targetId;

    const canUpdateUsers = authUser.permissions.includes("USER_UPDATE") || isSuperAdmin;
    if (!canUpdateUsers && !isEditingSelf) {
      return res.status(403).json({
        message: "Bạn không có quyền sửa tài khoản này",
      });
    }

    // ADMIN không được cấp SUPERADMIN
    if (
      requestedRole === "SUPERADMIN" &&
      !isSuperAdmin
    ) {
      return res.status(403).json({
        message: "ADMIN không được cấp quyền SUPERADMIN",
      });
    }

    const updateData = {
      ...req.body,
    };

    if (updateData.role) {
      updateData.role = requestedRole;
    }

    // ADMIN không được tự đổi role của mình
    if (isAdmin && isEditingSelf) {
      delete updateData.role;
      delete updateData.permissions;
      delete updateData.status;
    }

    const updatedUser = await UserService.updateUser(
      targetId,
      updateData,
      authUser
    );

    return res.status(200).json({
      message: "Cập nhật tài khoản thành công",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Lỗi cập nhật tài khoản:", error);

    return res.status(400).json({
      message: error?.message || "Không thể cập nhật tài khoản",
    });
  }
},

  // 7. Tạo chức vụ mới
  createPosition: async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const authUser = req.user;

      if (!authUser) {
        return res.status(401).json({
          message: "Yêu cầu đăng nhập trước",
        });
      }

      if (!authUser.permissions.includes("USER_CREATE") && authUser.role !== "SUPERADMIN") {
        return res.status(403).json({
          message: "Bạn không có quyền tạo chức vụ",
        });
      }

      const positionName =
        req.body.position_name?.trim();

      if (!positionName) {
        return res.status(400).json({
          message: "Tên chức vụ không được để trống",
        });
      }

      const newPosition =
        await UserService.createPosition({
          position_name: positionName,
          description: req.body.description,
        });

      return res.status(201).json({
        message: "Tạo chức vụ thành công",
        data: {
          ...newPosition,
          id: newPosition.id.toString(),
        },
      });
    } catch (error: any) {
      console.error("Lỗi tạo chức vụ:", error);

      return res.status(400).json({
        message:
          error?.message ||
          "Chức vụ đã tồn tại hoặc dữ liệu không hợp lệ",
      });
    }
  },

  // 8. Đăng nhập
  login: async (req: Request, res: Response) => {
    try {
      const result = await UserService.login(req.body);

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);

      return res.status(401).json({
        message:
          error?.message || "Đăng nhập thất bại",
      });
    }
  },

  // 9. Xóa tài khoản
  delete: async (req: AuthRequest, res: Response) => {
    try {
      const authUser = req.user;
      const targetId = req.params.id;

      if (!authUser) {
        return res.status(401).json({
          message: "Yêu cầu đăng nhập trước",
        });
      }

      if (!authUser.permissions.includes("USER_DELETE") && authUser.role !== "SUPERADMIN") {
        return res.status(403).json({
          message:
            "Bạn không có quyền xóa tài khoản",
        });
      }

      if (authUser.id === targetId) {
        return res.status(400).json({
          message:
            "Bạn không thể tự xóa tài khoản của chính mình",
        });
      }

      const targetUser =
        await UserService.getUserById(targetId);

      if (!targetUser) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      if (targetUser.role === "SUPERADMIN") {
        return res.status(404).json({ message: "Không tìm thấy tài khoản" });
      }

      // ADMIN không được xóa SUPERADMIN
      if (
        targetUser.role === "SUPERADMIN" &&
        authUser.role !== "SUPERADMIN"
      ) {
        return res.status(403).json({
          message:
            "ADMIN không được xóa tài khoản SUPERADMIN",
        });
      }

      // Không cho xóa tài khoản hệ thống
      if (targetUser.usercode === "ADMIN-SYSTEM") {
        return res.status(403).json({
          message:
            "Không được phép xóa tài khoản hệ thống",
        });
      }

      await UserService.deleteUser(targetId);

      return res.status(200).json({
        message: "Xóa tài khoản thành công",
      });
    } catch (error: any) {
      console.error("Lỗi xóa tài khoản:", error);

      return res.status(400).json({
        message:
          error?.message || "Không thể xóa tài khoản",
      });
    }
  },

  // 10. Upload ảnh đại diện
  uploadAvatar: async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const { image } = req.body;

      if (!image || typeof image !== "string") {
        return res.status(400).json({
          message: "Không tìm thấy dữ liệu hình ảnh",
        });
      }

      const matches = image.match(
        /^data:(image\/(?:png|jpeg|jpg|gif|webp));base64,(.+)$/
      );

      if (!matches || matches.length !== 3) {
        return res.status(400).json({
          message:
            "Định dạng ảnh không hợp lệ. Chỉ hỗ trợ PNG, JPG, GIF hoặc WEBP",
        });
      }

      const imageType = matches[1];
      const base64Data = matches[2];
      const buffer = Buffer.from(
        base64Data,
        "base64"
      );

      const maxSize = 5 * 1024 * 1024;

      if (buffer.length > maxSize) {
        return res.status(400).json({
          message:
            "Kích thước ảnh không được vượt quá 5 MB",
        });
      }

      let extension = "png";

      if (
        imageType === "image/jpeg" ||
        imageType === "image/jpg"
      ) {
        extension = "jpg";
      } else if (imageType === "image/gif") {
        extension = "gif";
      } else if (imageType === "image/webp") {
        extension = "webp";
      }

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "avatars"
      );

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, {
          recursive: true,
        });
      }

      const filename = `avatar-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}.${extension}`;

      const filePath = path.join(
        uploadDir,
        filename
      );

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `http://localhost:5000/public/avatars/${filename}`;

      return res.status(200).json({
        message: "Upload ảnh thành công",
        url: fileUrl,
      });
    } catch (error: any) {
      console.error("Lỗi upload ảnh:", error);

      return res.status(500).json({
        message:
          "Lỗi server khi upload ảnh đại diện: " +
          (error?.message || "Không xác định"),
      });
    }
  },
};
