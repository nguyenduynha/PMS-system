export type BookingReportFilters = {
  startDate?: string;
  endDate?: string;
  status?: string;
  source?: string;
  roomTypeId?: string;
  roomId?: string;
  userId?: string;
};

export type BookingReportRow = {
  bookingCode: string;
  roomName: string;
  roomNumber: string;
  customerName: string;
  checkIn: string;
  checkOut: string;
  source: string;
  services: string;
  serviceAmount: number;
  totalAmount: number;
  status: string;
  createdBy: string;
  checkInTimestamp: number;
};

const formatDateTime = (value: string | Date) => new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false,
}).format(new Date(value));

export const formatReportMoney = (value: number) => `${new Intl.NumberFormat("vi-VN").format(Math.round(value || 0))} VND`;

export function buildBookingReportRows(bookings: any[], filters: BookingReportFilters): BookingReportRow[] {
  const start = filters.startDate ? new Date(`${filters.startDate}T00:00:00`) : null;
  const end = filters.endDate ? new Date(`${filters.endDate}T23:59:59.999`) : null;

  return bookings
    .filter((booking) => {
      const checkIn = new Date(booking.checkInDate);
      return booking.status !== "DELETED"
        && (!start || checkIn >= start)
        && (!end || checkIn <= end)
        && (!filters.status || filters.status === "ALL" || booking.status === filters.status)
        && (!filters.source || filters.source === "ALL" || booking.bookingSource === filters.source)
        && (!filters.roomTypeId || filters.roomTypeId === "ALL" || String(booking.room?.roomTypeId) === filters.roomTypeId)
        && (!filters.roomId || filters.roomId === "ALL" || String(booking.roomId) === filters.roomId)
        && (!filters.userId || filters.userId === "ALL" || String(booking.userId || "") === filters.userId);
    })
    .map((booking) => {
      const items = booking.bookingServices || [];
      const serviceAmount = items.reduce((sum: number, item: any) => sum + Number(item.totalAmount || 0), 0);
      const invoiceTotal = booking.invoice?.totalAmount;
      return {
        bookingCode: booking.bookingCode || `BK-${String(booking.id).padStart(6, "0")}`,
        roomName: booking.room?.roomType?.name || "Không xác định",
        roomNumber: booking.room?.roomNumber || "-",
        customerName: booking.customerName || "-",
        checkIn: formatDateTime(booking.checkInDate),
        checkOut: formatDateTime(booking.checkOutDate),
        source: booking.bookingSource || "Không xác định",
        services: items.length ? items.map((item: any) => `${item.service?.name || "Dịch vụ"} x${item.quantity || 1}`).join(", ") : "Không có",
        serviceAmount,
        // booking.totalAmount được backend tái tính thành tiền phòng + dịch vụ;
        // khi đã có hóa đơn thì Invoice luôn là nguồn đối soát ưu tiên.
        totalAmount: invoiceTotal != null ? Number(invoiceTotal) : Number(booking.totalAmount || 0),
        status: booking.status,
        createdBy: booking.user?.fullName?.trim() || booking.user?.usercode?.trim() || booking.user?.email?.trim() || "Không xác định",
        checkInTimestamp: new Date(booking.checkInDate).getTime(),
      };
    })
    .sort((left, right) => right.checkInTimestamp - left.checkInTimestamp);
}

const exportColumns = (rows: BookingReportRow[]) => rows.map(row => ({
  "Mã đặt phòng": row.bookingCode,
  "Tên phòng": row.roomName,
  "Số phòng": row.roomNumber,
  "Tên khách": row.customerName,
  "Ngày đến": row.checkIn,
  "Ngày đi": row.checkOut,
  "Nguồn": row.source,
  "Dịch vụ": row.services,
  "Tiền dịch vụ": formatReportMoney(row.serviceAmount),
  "Số tiền": formatReportMoney(row.totalAmount),
  "Trạng thái": row.status,
  "Nhân viên tạo": row.createdBy,
}));

export async function exportBookingReportExcel(rows: BookingReportRow[], fileName: string) {
  const XLSX = await import("xlsx");
  const sheet = XLSX.utils.json_to_sheet(exportColumns(rows));
  sheet["!cols"] = [16, 20, 12, 24, 20, 20, 16, 42, 18, 18, 16, 22].map(wch => ({ wch }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Bookings");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export async function exportBookingReportPdf(rows: BookingReportRow[], fileName: string) {
  const pdfMakeModule: any = await import("pdfmake/build/pdfmake");
  const pdfFontsModule: any = await import("pdfmake/build/vfs_fonts");
  const pdfMake = pdfMakeModule.default || pdfMakeModule;
  const fonts = pdfFontsModule.default || pdfFontsModule;
  pdfMake.vfs = fonts.vfs || fonts;
  pdfMake.createPdf({
    pageOrientation: "landscape",
    pageSize: "A3",
    content: [
      { text: "BÁO CÁO ĐẶT PHÒNG", style: "title" },
      { text: `Thời điểm xuất: ${formatDateTime(new Date())} · ${rows.length} booking`, margin: [0, 0, 0, 12] },
      {
        table: {
          headerRows: 1,
          widths: [55, 60, 40, 70, 65, 65, 50, "*", 62, 65, 70],
          body: [
            ["Mã đặt phòng", "Tên phòng", "Số phòng", "Tên khách", "Ngày đến", "Ngày đi", "Nguồn", "Dịch vụ", "Tiền dịch vụ", "Số tiền", "Nhân viên"],
            ...rows.map(row => [row.bookingCode, row.roomName, row.roomNumber, row.customerName, row.checkIn, row.checkOut, row.source, row.services, formatReportMoney(row.serviceAmount), formatReportMoney(row.totalAmount), row.createdBy]),
          ],
        },
        layout: "lightHorizontalLines",
        fontSize: 8,
      },
    ],
    styles: { title: { fontSize: 16, bold: true, alignment: "center", margin: [0, 0, 0, 6] } },
    defaultStyle: { font: "Roboto" },
  }).download(`${fileName}.pdf`);
}
