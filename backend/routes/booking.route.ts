import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authMiddleware, requireBookingStatusPermission, requirePermission } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Đặt phòng (Bookings)
 *   description: Tra cứu và quản lý đặt phòng
 * /api/bookings:
 *   get:
 *     summary: Lấy danh sách đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *         description: Số bản ghi tối đa
 *     responses:
 *       200: { description: Danh sách đặt phòng }
 *       403: { description: Không có quyền BOOKING_VIEW }
 *   post:
 *     summary: Tạo đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       201: { description: Đặt phòng thành công }
 * /api/bookings/{id}/guest:
 *   put:
 *     summary: Cập nhật thông tin khách của đặt phòng
 *     tags: [Đặt phòng (Bookings)]
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
 * /api/bookings/{id}/status:
 *   put:
 *     summary: Cập nhật trạng thái đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties: { status: { type: string } }
 *     responses:
 *       200: { description: Cập nhật trạng thái thành công }
 * /api/bookings/{id}/extend:
 *   put:
 *     summary: Gia hạn đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [checkOutDate]
 *             properties: { checkOutDate: { type: string, format: date-time } }
 *     responses:
 *       200: { description: Gia hạn thành công }
 * /api/bookings/{id}/change-room:
 *   put:
 *     summary: Chuyển phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [newRoomId]
 *             properties: { newRoomId: { type: string } }
 *     responses:
 *       200: { description: Chuyển phòng thành công }
 * /api/bookings/{id}/services:
 *   get:
 *     summary: Lấy dịch vụ của đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Danh sách dịch vụ }
 *   post:
 *     summary: Thêm dịch vụ vào đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [serviceId, quantity]
 *             properties:
 *               serviceId: { type: string }
 *               quantity: { type: integer, minimum: 1 }
 *     responses:
 *       201: { description: Thêm dịch vụ thành công }
 * /api/bookings/{id}/services/{bookingServiceId}:
 *   delete:
 *     summary: Xóa dịch vụ khỏi đặt phòng
 *     tags: [Đặt phòng (Bookings)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *       - { in: path, name: bookingServiceId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Xóa dịch vụ thành công }
 */
router.use(authMiddleware);
router.get("/", requirePermission("BOOKING_VIEW"), BookingController.getBookings);
router.post("/", requirePermission("BOOKING_CREATE"), BookingController.create);
router.put("/:id/guest", requirePermission("BOOKING_UPDATE"), BookingController.updateGuest);
router.put("/:id/status", requireBookingStatusPermission, BookingController.updateStatus);
router.put("/:id/extend", requirePermission("BOOKING_EXTEND"), BookingController.extend);
router.put("/:id/change-room", requirePermission("BOOKING_TRANSFER"), BookingController.changeRoom);
router.get("/:id/services", requirePermission("SERVICE_VIEW"), BookingController.getServices);
router.post("/:id/services", requirePermission("SERVICE_CREATE"), BookingController.addService);
router.delete("/:id/services/:bookingServiceId", requirePermission("SERVICE_DELETE"), BookingController.removeService);

export default router;
