import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Phòng (Rooms)
 *   description: Tra cứu và quản lý phòng
 */

/**
 * @swagger
 * /api/rooms:
 *   get:
 *     summary: Lấy danh sách phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách phòng }
 *       401: { description: Chưa đăng nhập hoặc token không hợp lệ }
 *       403: { description: Không có quyền ROOM_VIEW }
 *   post:
 *     summary: Thêm phòng mới
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       201: { description: Tạo phòng thành công }
 *       403: { description: Không có quyền ROOM_CREATE }
 */
router.get("/", authMiddleware, requirePermission("ROOM_VIEW"), RoomController.getRooms);

/**
 * @swagger
 * /api/rooms/types:
 *   get:
 *     summary: Lấy danh sách loại phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách loại phòng }
 */
router.get("/types", authMiddleware, requirePermission("ROOM_VIEW"), RoomController.getRoomTypes);

/**
 * @swagger
 * /api/rooms/types/{id}:
 *   put:
 *     summary: Cập nhật giá loại phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: Cập nhật thành công }
 */
router.put("/types/:id", authMiddleware, requirePermission("ROLE_ASSIGN_PERMISSION"), RoomController.updateRoomTypePricing);

/**
 * @swagger
 * /api/rooms/housekeeping:
 *   get:
 *     summary: Lấy danh sách phòng cho bộ phận buồng phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách phòng }
 */
router.get("/housekeeping", authMiddleware, requirePermission("HOUSEKEEPING_VIEW"), RoomController.getRooms);

/**
 * @swagger
 * /api/rooms/{id}/housekeeping:
 *   put:
 *     summary: Cập nhật trạng thái buồng phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties: { status: { type: string } }
 *     responses:
 *       200: { description: Cập nhật thành công }
 */
router.put("/:id/housekeeping", authMiddleware, requirePermission("HOUSEKEEPING_UPDATE"), RoomController.updateHousekeeping);

// Thêm và xóa phòng chỉ dành cho SUPERADMIN
router.post(
  "/",
  authMiddleware,
  requirePermission("ROOM_CREATE"),
  RoomController.create
);

/**
 * @swagger
 * /api/rooms/{id}:
 *   put:
 *     summary: Cập nhật phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: Cập nhật thành công }
 *   delete:
 *     summary: Xóa phòng
 *     tags: [Phòng (Rooms)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Xóa phòng thành công }
 */
// Cho phép nhân viên cập nhật trạng thái phòng để dọn dẹp
router.put(
  "/:id",
  authMiddleware,
  requirePermission("ROOM_UPDATE"),
  RoomController.update
);

router.delete(
  "/:id",
  authMiddleware,
  requirePermission("ROOM_DELETE"),
  RoomController.delete
);

export default router;
