import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hóa đơn (Invoices)
 *   description: Tra cứu, tạo và thanh toán hóa đơn
 * /api/invoices:
 *   get:
 *     summary: Lấy danh sách hóa đơn
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách hóa đơn }
 *       403: { description: Không có quyền INVOICE_VIEW }
 *   post:
 *     summary: Tạo hóa đơn từ đặt phòng
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bookingId]
 *             properties: { bookingId: { type: string } }
 *             additionalProperties: true
 *     responses:
 *       201: { description: Tạo hóa đơn thành công }
 * /api/invoices/no-invoice:
 *   get:
 *     summary: Lấy danh sách đặt phòng chưa lập hóa đơn
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Danh sách đặt phòng chưa có hóa đơn }
 * /api/invoices/booking/{bookingId}:
 *   get:
 *     summary: Lấy hóa đơn theo mã đặt phòng
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: bookingId, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Hóa đơn của đặt phòng }
 * /api/invoices/{id}:
 *   get:
 *     summary: Lấy chi tiết hóa đơn
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     responses:
 *       200: { description: Chi tiết hóa đơn }
 *       404: { description: Không tìm thấy hóa đơn }
 * /api/invoices/{id}/pay:
 *   put:
 *     summary: Thanh toán hóa đơn
 *     tags: [Hóa đơn (Invoices)]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { type: object, additionalProperties: true }
 *     responses:
 *       200: { description: Thanh toán thành công }
 */
router.use(authMiddleware);
router.get("/", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoices);
router.get("/no-invoice", requirePermission("INVOICE_CREATE"), InvoiceController.getBookingsWithoutInvoice);
router.get("/booking/:bookingId", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoiceByBookingId);
router.get("/:id", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoiceById);
router.post("/", requirePermission("INVOICE_CREATE"), InvoiceController.create);
router.put("/:id/pay", requirePermission("INVOICE_PAYMENT"), InvoiceController.pay);

export default router;
