import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

// Tất cả các route khách hàng đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get("/search", requirePermission("CUSTOMER_VIEW"), CustomerController.getByPhone);
router.get("/", requirePermission("CUSTOMER_VIEW"), CustomerController.getAll);
router.get("/:id", requirePermission("CUSTOMER_VIEW"), CustomerController.getById);
router.post("/", requirePermission("CUSTOMER_CREATE"), CustomerController.create);
router.put("/:id", requirePermission("CUSTOMER_UPDATE"), CustomerController.update);
router.delete("/:id", requirePermission("CUSTOMER_DELETE"), CustomerController.delete);

export default router;
