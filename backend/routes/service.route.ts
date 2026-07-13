import { Router } from "express";
import { ServiceController } from "../controllers/service.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requirePermission("SERVICE_VIEW"), ServiceController.getServices);
router.post("/", requirePermission("SERVICE_CREATE"), ServiceController.create);
router.put("/:id", requirePermission("SERVICE_UPDATE"), ServiceController.update);
router.delete("/:id", requirePermission("SERVICE_DELETE"), ServiceController.delete);

export default router;
