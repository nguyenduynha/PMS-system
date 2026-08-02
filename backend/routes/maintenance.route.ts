import { Router } from "express";
import { MaintenanceController } from "../controllers/maintenance.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requirePermission("MAINTENANCE_VIEW"), MaintenanceController.getRecords);
router.post("/", requirePermission("MAINTENANCE_CREATE"), MaintenanceController.create);
router.put("/:id/complete", requirePermission("MAINTENANCE_UPDATE"), MaintenanceController.complete);
router.put("/:id/status", requirePermission("MAINTENANCE_UPDATE"), MaintenanceController.updateStatus);

export default router;
