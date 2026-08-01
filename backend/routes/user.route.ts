import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import {
  authMiddleware,
  requirePermission,
} from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Người dùng (Users)
 *   description: Các API liên quan đến quản lý tài khoản và đăng nhập
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Đăng nhập vào hệ thống
 *     tags: [Người dùng (Users)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 */
router.post("/login", UserController.login);

// Các route phía dưới bắt buộc đăng nhập
router.use(authMiddleware);

/**
 * @swagger
 * /api/users/positions:
 *   get:
 *     summary: Lấy danh sách các chức vụ (Positions)
 *     tags: [Người dùng (Users)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về mảng danh sách chức vụ
 */
router.get("/positions", UserController.getPositions);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tất cả người dùng (Yêu cầu quyền USER_VIEW)
 *     tags: [Người dùng (Users)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách người dùng thành công
 */
router.get("/", requirePermission("USER_VIEW"), UserController.getUsers);

/**
 * @swagger
 * /api/users/me/password:
 *   put:
 *     summary: Người dùng tự đổi mật khẩu
 *     tags: [Người dùng (Users)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword, confirmPassword]
 *             properties:
 *               currentPassword: { type: string, format: password }
 *               newPassword: { type: string, format: password, minLength: 6 }
 *               confirmPassword: { type: string, format: password, minLength: 6 }
 *     responses:
 *       200: { description: Đổi mật khẩu thành công }
 *       400: { description: Dữ liệu không hợp lệ hoặc mật khẩu hiện tại không đúng }
 *       401: { description: Chưa đăng nhập hoặc token không hợp lệ }
 */
router.put("/me/password", UserController.changeOwnPassword);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Lấy thông tin chi tiết một người dùng theo ID
 *     tags: [Người dùng (Users)]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về thông tin người dùng
 */
router.get("/:id", UserController.getById);
router.put("/:id", UserController.update);


export default router;
