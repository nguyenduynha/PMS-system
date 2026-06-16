import { prisma } from "../prisma";

// ─── Lấy tất cả hóa đơn ──────────────────────────────────────────────────────
export async function getAllInvoices() {
  const invoices = await prisma.invoice.findMany({
    include: {
      booking: {
        include: {
          room: true,
          bookingServices: { include: { service: true } },
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return invoices.map((inv) => ({
    id: inv.id.toString(),
    invoiceNumber: inv.invoiceNumber,
    bookingId: inv.bookingId.toString(),
    customerName: inv.booking.customerName,
    roomNumber: inv.booking.room.roomNumber,
    checkIn: inv.booking.checkInDate.toISOString().split("T")[0],
    checkOut: inv.booking.checkOutDate.toISOString().split("T")[0],
    subTotal: Number(inv.subTotal),
    taxAmount: Number(inv.taxAmount),
    discount: Number(inv.discount),
    totalAmount: Number(inv.totalAmount),
    status: inv.status,
    paymentMethod:
      inv.payments[0]?.paymentMethod ??
      (inv.status === "PAID" ? "CASH" : "CHUA_THANH_TOAN"),
    paidAt: inv.payments[0]?.paidAt?.toISOString() ?? null,
    createdAt: inv.createdAt.toISOString(),
  }));
}

// ─── Upsert hóa đơn (tạo mới hoặc cập nhật theo bookingId) ──────────────────
export async function upsertInvoice(data: {
  bookingId: string;
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  ghiChu?: string;
}) {
  const bookingIdBig = BigInt(data.bookingId);

  // Kiểm tra đã có hóa đơn chưa
  const existing = await prisma.invoice.findUnique({
    where: { bookingId: bookingIdBig },
  });

  let invoice;

  if (existing) {
    // Cập nhật hóa đơn hiện tại
    invoice = await prisma.invoice.update({
      where: { bookingId: bookingIdBig },
      data: {
        subTotal: data.subTotal,
        taxAmount: data.taxAmount,
        discount: data.discount,
        totalAmount: data.totalAmount,
        status: data.status,
      },
    });

    // Nếu trạng thái là PAID và có paymentMethod → thêm payment mới
    if (data.status === "PAID" && data.paymentMethod) {
      const existingPayment = await prisma.payment.findFirst({
        where: { invoiceId: invoice.id },
      });
      if (!existingPayment) {
        await prisma.payment.create({
          data: {
            invoiceId: invoice.id,
            amount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            note: data.ghiChu ?? null,
          },
        });
      } else {
        // Cập nhật payment hiện tại
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            amount: data.totalAmount,
            paymentMethod: data.paymentMethod,
            note: data.ghiChu ?? null,
          },
        });
      }
    }
  } else {
    // Tạo hóa đơn mới
    const count = await prisma.invoice.count();
    const invoiceNumber = `HD-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

    invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: bookingIdBig,
        subTotal: data.subTotal,
        taxAmount: data.taxAmount,
        discount: data.discount,
        totalAmount: data.totalAmount,
        status: data.status,
      },
    });

    if (data.status === "PAID" && data.paymentMethod) {
      await prisma.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          note: data.ghiChu ?? null,
        },
      });
    }
  }

  return {
    id: invoice.id.toString(),
    invoiceNumber: invoice.invoiceNumber,
    bookingId: invoice.bookingId.toString(),
    subTotal: Number(invoice.subTotal),
    taxAmount: Number(invoice.taxAmount),
    discount: Number(invoice.discount),
    totalAmount: Number(invoice.totalAmount),
    status: invoice.status,
    createdAt: invoice.createdAt.toISOString(),
  };
}

// ─── Thống kê Dashboard ───────────────────────────────────────────────────────
export async function getDashboardStats() {
  const now = new Date();
  const batDauThang = new Date(now.getFullYear(), now.getMonth(), 1);
  const batDauHomNay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const ketThucHomNay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const [
    rooms,
    soLuongDatPhong,
    doanhThuThang,
    doanhThuHomNay,
    doanhThuTong,
    soHoaDonHomNay,
  ] = await Promise.all([
    prisma.room.findMany(),
    prisma.booking.count({ where: { status: { in: ["CHECKED_IN", "CONFIRMED"] } } }),
    prisma.invoice.aggregate({
      where: { status: "PAID", createdAt: { gte: batDauThang } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID", createdAt: { gte: batDauHomNay, lte: ketThucHomNay } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.invoice.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.invoice.count({ where: { createdAt: { gte: batDauHomNay, lte: ketThucHomNay } } }),
  ]);

  const tongSoPhong = rooms.length;
  const phongDaDung = rooms.filter((r) => r.status === "OCCUPIED").length;
  const tyLeLayDay = tongSoPhong > 0 ? Math.round((phongDaDung / tongSoPhong) * 100) : 0;

  return {
    totalRooms: tongSoPhong,
    availableRooms: rooms.filter((r) => r.status === "AVAILABLE").length,
    occupiedRooms: phongDaDung,
    dirtyRooms: rooms.filter((r) => r.status === "DIRTY").length,
    maintenanceRooms: rooms.filter((r) => r.status === "MAINTENANCE").length,
    occupancyRate: tyLeLayDay,
    activeBookings: soLuongDatPhong,
    todayRevenue: Number(doanhThuHomNay._sum.totalAmount ?? 0),
    monthlyRevenue: Number(doanhThuThang._sum.totalAmount ?? 0),
    totalRevenue: Number(doanhThuTong._sum.totalAmount ?? 0),
    todayInvoices: soHoaDonHomNay,
    monthlyInvoices: doanhThuThang._count,
  };
}
