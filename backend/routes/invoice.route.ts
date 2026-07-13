import { Router } from "express";
import { InvoiceController } from "../controllers/invoice.controller";
import { authMiddleware, requirePermission } from "../middleware/auth.middleware";

const router = Router();

router.use(authMiddleware);
router.get("/", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoices);
router.get("/no-invoice", requirePermission("INVOICE_CREATE"), InvoiceController.getBookingsWithoutInvoice);
router.get("/booking/:bookingId", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoiceByBookingId);
router.get("/:id", requirePermission("INVOICE_VIEW"), InvoiceController.getInvoiceById);
router.post("/", requirePermission("INVOICE_CREATE"), InvoiceController.create);
router.put("/:id/pay", requirePermission("INVOICE_PAYMENT"), InvoiceController.pay);

export default router;
