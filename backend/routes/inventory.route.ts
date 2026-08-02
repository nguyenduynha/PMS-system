import { Router } from "express";
import { InventoryController } from "../controllers/inventory.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

// Áp dụng middleware kiểm tra đăng nhập cho tất cả các request kho
router.use(authMiddleware);

// Routes cho sản phẩm kho (Items)
router.get("/items", requirePermission("INVENTORY_VIEW"), InventoryController.getItems);
router.post("/items", requirePermission("INVENTORY_CREATE"), InventoryController.createItem);
router.put("/items/:id", requirePermission("INVENTORY_UPDATE"), InventoryController.updateItem);
router.delete("/items/:id", requirePermission("INVENTORY_DELETE"), InventoryController.deleteItem);

// Routes cho giao dịch kho (Transactions)
router.get("/transactions", requirePermission("INVENTORY_TRANSACTION"), InventoryController.getTransactions);
router.post("/import", requirePermission("INVENTORY_TRANSACTION"), InventoryController.importStock);
router.post("/export", requirePermission("INVENTORY_TRANSACTION"), InventoryController.exportStock);

export default router;
