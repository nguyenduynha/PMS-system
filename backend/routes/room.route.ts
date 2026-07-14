import { Router } from "express";
import { RoomController } from "../controllers/room.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authMiddleware, requirePermission("ROOM_VIEW"), RoomController.getRooms);
router.get("/types", authMiddleware, requirePermission("ROOM_VIEW"), RoomController.getRoomTypes);
router.get("/housekeeping", authMiddleware, requirePermission("HOUSEKEEPING_VIEW"), RoomController.getRooms);
router.put("/:id/housekeeping", authMiddleware, requirePermission("HOUSEKEEPING_UPDATE"), RoomController.updateHousekeeping);

// Thêm và xóa phòng chỉ dành cho SUPERADMIN
router.post(
  "/",
  authMiddleware,
  requirePermission("ROOM_CREATE"),
  RoomController.create
);

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
