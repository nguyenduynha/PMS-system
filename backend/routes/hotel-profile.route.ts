import { Router } from "express";
import { HotelProfileController } from "../controllers/hotel-profile.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", HotelProfileController.get);
router.put("/", requirePermission("ROLE_ASSIGN"), HotelProfileController.update);

export default router;
