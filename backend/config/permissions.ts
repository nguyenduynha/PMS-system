export type PermissionDefinition = {
  id: string;
  module: string;
  action: string;
  name: string;
  description: string;
};

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  { id: "DASHBOARD_VIEW", module: "DASHBOARD", action: "VIEW", name: "Xem Dashboard", description: "Truy cập màn hình tổng quan" },
  { id: "DASHBOARD_REVENUE", module: "DASHBOARD", action: "REVENUE", name: "Xem doanh thu", description: "Xem chỉ số doanh thu" },
  { id: "DASHBOARD_ROOM_STATS", module: "DASHBOARD", action: "ROOM_STATS", name: "Xem thống kê phòng", description: "Xem công suất và trạng thái phòng" },
  { id: "DASHBOARD_CHART", module: "DASHBOARD", action: "CHART", name: "Xem biểu đồ", description: "Xem biểu đồ tổng quan" },
  { id: "ROOM_VIEW", module: "ROOM", action: "VIEW", name: "Xem danh sách phòng", description: "Xem phòng và loại phòng" },
  { id: "ROOM_CREATE", module: "ROOM", action: "CREATE", name: "Thêm phòng", description: "Tạo phòng mới" },
  { id: "ROOM_UPDATE", module: "ROOM", action: "UPDATE", name: "Sửa thông tin phòng", description: "Cập nhật thông tin phòng" },
  { id: "ROOM_DELETE", module: "ROOM", action: "DELETE", name: "Xóa phòng", description: "Xóa phòng khỏi hệ thống" },
  { id: "ROOM_STATUS", module: "ROOM", action: "STATUS", name: "Cập nhật trạng thái phòng", description: "Đổi trạng thái sử dụng và dọn phòng" },
  { id: "ROOM_PRICE", module: "ROOM", action: "PRICE", name: "Cập nhật giá phòng", description: "Thay đổi giá phòng và loại phòng" },
  { id: "ROOM_TRANSFER", module: "ROOM", action: "TRANSFER", name: "Chuyển phòng", description: "Chuyển khách sang phòng khác" },
  { id: "ROOM_LOCK", module: "ROOM", action: "LOCK", name: "Khóa/Mở phòng", description: "Khóa hoặc mở phòng" },
  { id: "BOOKING_VIEW", module: "BOOKING", action: "VIEW", name: "Xem booking", description: "Xem danh sách và chi tiết booking" },
  { id: "BOOKING_CREATE", module: "BOOKING", action: "CREATE", name: "Tạo booking", description: "Tạo đặt phòng mới" },
  { id: "BOOKING_UPDATE", module: "BOOKING", action: "UPDATE", name: "Sửa booking", description: "Cập nhật thông tin booking" },
  { id: "BOOKING_CANCEL", module: "BOOKING", action: "CANCEL", name: "Hủy booking", description: "Hủy đặt phòng" },
  { id: "BOOKING_CHECK_IN", module: "BOOKING", action: "CHECK_IN", name: "Check-in", description: "Thực hiện nhận phòng" },
  { id: "BOOKING_CHECK_OUT", module: "BOOKING", action: "CHECK_OUT", name: "Check-out", description: "Thực hiện trả phòng" },
  { id: "BOOKING_EXTEND", module: "BOOKING", action: "EXTEND", name: "Gia hạn lưu trú", description: "Gia hạn thời gian ở" },
  { id: "BOOKING_TRANSFER", module: "BOOKING", action: "TRANSFER", name: "Chuyển phòng", description: "Chuyển phòng cho booking" },
  { id: "BOOKING_PRINT", module: "BOOKING", action: "PRINT", name: "In phiếu booking", description: "In thông tin đặt phòng" },
  { id: "CUSTOMER_VIEW", module: "CUSTOMER", action: "VIEW", name: "Xem khách hàng", description: "Xem danh sách khách hàng" },
  { id: "CUSTOMER_CREATE", module: "CUSTOMER", action: "CREATE", name: "Thêm khách hàng", description: "Tạo hồ sơ khách hàng" },
  { id: "CUSTOMER_UPDATE", module: "CUSTOMER", action: "UPDATE", name: "Sửa khách hàng", description: "Cập nhật hồ sơ khách hàng" },
  { id: "CUSTOMER_DELETE", module: "CUSTOMER", action: "DELETE", name: "Xóa khách hàng", description: "Xóa hồ sơ khách hàng" },
  { id: "CUSTOMER_HISTORY", module: "CUSTOMER", action: "HISTORY", name: "Xem lịch sử lưu trú", description: "Xem booking và lưu trú trước đây" },
  { id: "INVOICE_VIEW", module: "INVOICE", action: "VIEW", name: "Xem hóa đơn", description: "Xem danh sách hóa đơn" },
  { id: "INVOICE_CREATE", module: "INVOICE", action: "CREATE", name: "Tạo hóa đơn", description: "Lập hóa đơn mới" },
  { id: "INVOICE_PAYMENT", module: "INVOICE", action: "PAYMENT", name: "Thanh toán", description: "Ghi nhận thanh toán" },
  { id: "INVOICE_REFUND", module: "INVOICE", action: "REFUND", name: "Hoàn tiền", description: "Thực hiện hoàn tiền" },
  { id: "INVOICE_PRINT", module: "INVOICE", action: "PRINT", name: "In hóa đơn", description: "In hóa đơn" },
  { id: "INVOICE_EXPORT_PDF", module: "INVOICE", action: "EXPORT_PDF", name: "Xuất PDF", description: "Xuất hóa đơn PDF" },
  { id: "INVOICE_EXPORT_EXCEL", module: "INVOICE", action: "EXPORT_EXCEL", name: "Xuất Excel", description: "Xuất dữ liệu hóa đơn Excel" },
  { id: "SERVICE_VIEW", module: "SERVICE", action: "VIEW", name: "Xem dịch vụ", description: "Xem danh sách dịch vụ" },
  { id: "SERVICE_CREATE", module: "SERVICE", action: "CREATE", name: "Thêm dịch vụ", description: "Tạo dịch vụ mới" },
  { id: "SERVICE_UPDATE", module: "SERVICE", action: "UPDATE", name: "Sửa dịch vụ", description: "Cập nhật dịch vụ" },
  { id: "SERVICE_DELETE", module: "SERVICE", action: "DELETE", name: "Xóa dịch vụ", description: "Xóa dịch vụ" },
  { id: "USER_VIEW", module: "USER", action: "VIEW", name: "Xem nhân viên", description: "Xem danh sách nhân viên" },
  { id: "USER_CREATE", module: "USER", action: "CREATE", name: "Thêm nhân viên", description: "Tạo tài khoản nhân viên" },
  { id: "USER_UPDATE", module: "USER", action: "UPDATE", name: "Sửa nhân viên", description: "Cập nhật tài khoản nhân viên" },
  { id: "USER_DELETE", module: "USER", action: "DELETE", name: "Xóa nhân viên", description: "Xóa tài khoản nhân viên" },
  { id: "ROLE_VIEW", module: "ROLE", action: "VIEW", name: "Xem phân quyền", description: "Xem role và permission" },
  { id: "ROLE_CREATE", module: "ROLE", action: "CREATE", name: "Tạo Role", description: "Tạo vai trò mới" },
  { id: "ROLE_UPDATE", module: "ROLE", action: "UPDATE", name: "Sửa Role", description: "Cập nhật vai trò" },
  { id: "ROLE_DELETE", module: "ROLE", action: "DELETE", name: "Xóa Role", description: "Xóa vai trò" },
  { id: "ROLE_ASSIGN_PERMISSION", module: "ROLE", action: "ASSIGN_PERMISSION", name: "Gán Permission", description: "Gán quyền cho role và user" },
  { id: "REPORT_VIEW", module: "REPORT", action: "VIEW", name: "Xem báo cáo", description: "Xem báo cáo hệ thống" },
  { id: "REPORT_EXPORT_EXCEL", module: "REPORT", action: "EXPORT_EXCEL", name: "Xuất Excel", description: "Xuất báo cáo Excel" },
  { id: "REPORT_EXPORT_PDF", module: "REPORT", action: "EXPORT_PDF", name: "Xuất PDF", description: "Xuất báo cáo PDF" },
  { id: "INVENTORY_VIEW", module: "INVENTORY", action: "VIEW", name: "Xem kho", description: "Xem vật tư và tồn kho" },
  { id: "INVENTORY_CREATE", module: "INVENTORY", action: "CREATE", name: "Thêm vật tư", description: "Tạo vật tư mới" },
  { id: "INVENTORY_UPDATE", module: "INVENTORY", action: "UPDATE", name: "Sửa vật tư", description: "Cập nhật vật tư" },
  { id: "INVENTORY_DELETE", module: "INVENTORY", action: "DELETE", name: "Xóa vật tư", description: "Xóa vật tư" },
  { id: "INVENTORY_TRANSACTION", module: "INVENTORY", action: "TRANSACTION", name: "Nhập/Xuất kho", description: "Thực hiện giao dịch kho" },
  { id: "FINANCE_VIEW", module: "FINANCE", action: "VIEW", name: "Xem thu chi", description: "Xem giao dịch tài chính" },
  { id: "FINANCE_CREATE", module: "FINANCE", action: "CREATE", name: "Thêm thu chi", description: "Tạo giao dịch tài chính" },
  { id: "FINANCE_UPDATE", module: "FINANCE", action: "UPDATE", name: "Sửa thu chi", description: "Cập nhật giao dịch tài chính" },
  { id: "FINANCE_DELETE", module: "FINANCE", action: "DELETE", name: "Xóa thu chi", description: "Xóa giao dịch tài chính" },
];

export const ALL_PERMISSION_IDS = PERMISSION_CATALOG.map((permission) => permission.id);

const LEGACY_MODULES: Record<string, string[]> = {
  DASHBOARD: ["DASHBOARD"],
  ROOMS: ["ROOM"],
  BOOKINGS: ["BOOKING"],
  CUSTOMERS: ["CUSTOMER"],
  SERVICES: ["SERVICE"],
  INVOICES: ["INVOICE"],
  INVENTORY: ["INVENTORY"],
  FINANCE: ["FINANCE"],
  REPORTS: ["REPORT"],
  USERS: ["USER", "ROLE"],
};

export function expandLegacyPermissions(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];
  const expanded = permissions.flatMap((permission) => {
    const key = String(permission).trim().toUpperCase();
    const modules = LEGACY_MODULES[key];
    if (!modules) return ALL_PERMISSION_IDS.includes(key) ? [key] : [];
    return PERMISSION_CATALOG.filter((item) => modules.includes(item.module)).map((item) => item.id);
  });
  return Array.from(new Set(expanded));
}

export function getDefaultPermissions(role: string): string[] {
  const normalizedRole = String(role || "").toUpperCase();
  if (["SUPERADMIN", "ADMIN"].includes(normalizedRole)) return [...ALL_PERMISSION_IDS];
  if (normalizedRole === "MANAGER") {
    return ALL_PERMISSION_IDS.filter((id) => !["USER_DELETE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_ASSIGN_PERMISSION"].includes(id));
  }
  if (normalizedRole === "STAFF") {
    return [
      "DASHBOARD_VIEW", "DASHBOARD_ROOM_STATS", "ROOM_VIEW", "ROOM_STATUS",
      "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_UPDATE", "BOOKING_CHECK_IN", "BOOKING_CHECK_OUT", "BOOKING_EXTEND", "BOOKING_TRANSFER",
      "CUSTOMER_VIEW", "CUSTOMER_CREATE", "CUSTOMER_UPDATE", "CUSTOMER_HISTORY",
      "SERVICE_VIEW", "INVOICE_VIEW", "INVOICE_CREATE", "INVOICE_PAYMENT", "INVOICE_PRINT", "INVENTORY_VIEW", "INVENTORY_TRANSACTION",
    ];
  }
  return [];
}
