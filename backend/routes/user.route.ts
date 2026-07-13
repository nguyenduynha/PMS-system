import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  authMiddleware,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

// Đăng nhập không cần token
router.post("/login", UserController.login);

// Các route phía dưới bắt buộc đăng nhập
router.use(authMiddleware);

// Các route cố định phải đặt trước /:id
router.get(
  "/positions",
  UserController.getPositions
);

router.post(
  "/positions",
  requirePermission("USER_CREATE"),
  UserController.createPosition
);

router.get(
  "/cloudinary-config",
  UserController.getCloudinaryConfig
);

router.post(
  "/upload-avatar",
  UserController.uploadAvatar
);

// Quản lý tài khoản
router.get(
  "/",
  requirePermission("USER_VIEW"),
  UserController.getUsers
);

router.post(
  "/",
  requirePermission("USER_CREATE"),
  UserController.create
);

router.get("/:id", UserController.getById);

router.put("/:id", UserController.update);

router.delete(
  "/:id",
  requirePermission("USER_DELETE"),
  UserController.delete
);

export default router;
