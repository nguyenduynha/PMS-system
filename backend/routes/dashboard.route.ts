import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/stats", requirePermission("DASHBOARD_VIEW"), DashboardController.getStats);
router.get("/reports", requirePermission("REPORT_VIEW"), DashboardController.getReportStats);
router.get("/notifications", requirePermission("DASHBOARD_VIEW"), DashboardController.getNotifications);

export default router;
