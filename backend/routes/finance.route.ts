import { Router } from "express";
import { FinanceController } from "../controllers/finance.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

// Tất cả các route tài chính đều yêu cầu đăng nhập và phân quyền
router.use(authMiddleware);
router.get("/", requirePermission("FINANCE_VIEW"), FinanceController.getTransactions);
router.post("/", requirePermission("FINANCE_CREATE"), FinanceController.create);
router.get("/stats", requirePermission("FINANCE_VIEW"), FinanceController.getStats);
router.delete("/:id", requirePermission("FINANCE_DELETE"), FinanceController.delete);

export default router;
