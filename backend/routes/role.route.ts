import { Router } from "express";
import { RoleController } from "../controllers/role.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();
router.use(authMiddleware);
router.get("/permissions", requirePermission("ROLE_VIEW"), RoleController.getPermissions);
router.get("/", requirePermission("ROLE_VIEW"), RoleController.getRoles);
router.post("/", requirePermission("ROLE_CREATE"), RoleController.create);
router.put("/:id", requirePermission("ROLE_UPDATE"), RoleController.update);
router.delete("/:id", requirePermission("ROLE_DELETE"), RoleController.delete);
export default router;
