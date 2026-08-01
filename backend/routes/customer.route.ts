import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Khách hàng (Customers)
 *   description: Tra cứu và quản lý khách hàng
 * /api/customers:
 *   get:
 *     summary: Lấy danh sách khách hàng
 *     tags: [Khách hàng (Customers)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách khách hàng }
 *       403: { description: Không có quyền CUSTOMER_VIEW }
 *   post:
 *     summary: Tạo khách hàng
 *     tags: [Khách hàng (Customers)]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       201: { description: Tạo khách hàng thành công }
 * /api/customers/search:
 *   get:
 *     summary: Tìm khách hàng theo số điện thoại
 *     tags: [Khách hàng (Customers)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: phone, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Kết quả tìm kiếm }
 * /api/customers/{id}:
 *   get:
 *     summary: Lấy chi tiết khách hàng
 *     tags: [Khách hàng (Customers)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Chi tiết khách hàng }
 *       404: { description: Không tìm thấy khách hàng }
 *   put:
 *     summary: Cập nhật khách hàng
 *     tags: [Khách hàng (Customers)]
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
 *   delete:
 *     summary: Xóa khách hàng
 *     tags: [Khách hàng (Customers)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Xóa khách hàng thành công }
 */
// Tất cả các route khách hàng đều yêu cầu đăng nhập
router.use(authMiddleware);

router.get("/search", requirePermission("CUSTOMER_VIEW"), CustomerController.getByPhone);
router.get("/", requirePermission("CUSTOMER_VIEW"), CustomerController.getAll);
router.get("/:id", requirePermission("CUSTOMER_VIEW"), CustomerController.getById);
router.post("/", requirePermission("CUSTOMER_CREATE"), CustomerController.create);
router.put("/:id", requirePermission("CUSTOMER_UPDATE"), CustomerController.update);
router.delete("/:id", requirePermission("CUSTOMER_DELETE"), CustomerController.delete);

export default router;
