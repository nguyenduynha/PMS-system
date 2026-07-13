import { Router } from "express";
import { BookingController } from "../controllers/booking.controller";
import { authMiddleware, requireBookingStatusPermission, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requirePermission("BOOKING_VIEW"), BookingController.getBookings);
router.post("/", requirePermission("BOOKING_CREATE"), BookingController.create);
router.put("/:id/status", requireBookingStatusPermission, BookingController.updateStatus);
router.put("/:id/extend", requirePermission("BOOKING_EXTEND"), BookingController.extend);
router.put("/:id/change-room", requirePermission("BOOKING_TRANSFER"), BookingController.changeRoom);
router.get("/:id/services", requirePermission("SERVICE_VIEW"), BookingController.getServices);
router.post("/:id/services", requirePermission("SERVICE_CREATE"), BookingController.addService);
router.delete("/:id/services/:bookingServiceId", requirePermission("SERVICE_DELETE"), BookingController.removeService);

export default router;
