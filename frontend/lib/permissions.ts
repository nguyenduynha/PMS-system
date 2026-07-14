export type PermissionItem = { id: string; module: string; action: string; name: string; description: string };

const define = (module: string, entries: Array<[string, string, string]>) =>
  entries.map(([action, name, description]) => ({ id: `${module}_${action}`, module, action, name, description }));

export const PERMISSION_MODULE_LABELS: Record<string, string> = {
  DASHBOARD: "Tổng quan (Dashboard)", ROOM: "Quản lý phòng", BOOKING: "Đặt phòng",
  CUSTOMER: "Khách hàng", INVOICE: "Hóa đơn", SERVICE: "Dịch vụ", USER: "Nhân viên",
  ROLE: "Phân quyền", REPORT: "Báo cáo", INVENTORY: "Quản lý kho", FINANCE: "Thu chi",
  HOUSEKEEPING: "Buồng phòng",
};

export const PERMISSIONS: PermissionItem[] = [
  ...define("DASHBOARD", [["VIEW", "Xem Dashboard", "Truy cập màn hình tổng quan"], ["REVENUE", "Xem doanh thu", "Xem chỉ số doanh thu"], ["ROOM_STATS", "Xem thống kê phòng", "Xem công suất và trạng thái phòng"], ["CHART", "Xem biểu đồ", "Xem biểu đồ tổng quan"]]),
  ...define("ROOM", [["VIEW", "Xem danh sách phòng", "Xem phòng và loại phòng"], ["CREATE", "Thêm phòng", "Tạo phòng mới"], ["UPDATE", "Sửa thông tin phòng", "Cập nhật thông tin phòng"], ["DELETE", "Xóa phòng", "Xóa phòng khỏi hệ thống"], ["STATUS", "Cập nhật trạng thái phòng", "Đổi trạng thái sử dụng và dọn phòng"], ["PRICE", "Cập nhật giá phòng", "Thay đổi giá phòng và loại phòng"], ["TRANSFER", "Chuyển phòng", "Chuyển khách sang phòng khác"], ["LOCK", "Khóa/Mở phòng", "Khóa hoặc mở phòng"]]),
  ...define("HOUSEKEEPING", [["VIEW", "Xem Buồng phòng", "Xem danh sách phòng cần vệ sinh"], ["UPDATE", "Cập nhật vệ sinh", "Bắt đầu và hoàn tất dọn phòng"]]),
  ...define("BOOKING", [["VIEW", "Xem booking", "Xem danh sách và chi tiết booking"], ["CREATE", "Tạo booking", "Tạo đặt phòng mới"], ["UPDATE", "Sửa booking", "Cập nhật thông tin booking"], ["CANCEL", "Hủy booking", "Hủy đặt phòng"], ["CHECK_IN", "Check-in", "Thực hiện nhận phòng"], ["CHECK_OUT", "Check-out", "Thực hiện trả phòng"], ["EXTEND", "Gia hạn lưu trú", "Gia hạn thời gian ở"], ["TRANSFER", "Chuyển phòng", "Chuyển phòng cho booking"], ["PRINT", "In phiếu booking", "In thông tin đặt phòng"]]),
  ...define("CUSTOMER", [["VIEW", "Xem khách hàng", "Xem danh sách khách hàng"], ["CREATE", "Thêm khách hàng", "Tạo hồ sơ khách hàng"], ["UPDATE", "Sửa khách hàng", "Cập nhật hồ sơ khách hàng"], ["DELETE", "Xóa khách hàng", "Xóa hồ sơ khách hàng"], ["HISTORY", "Xem lịch sử lưu trú", "Xem booking và lưu trú trước đây"]]),
  ...define("INVOICE", [["VIEW", "Xem hóa đơn", "Xem danh sách hóa đơn"], ["CREATE", "Tạo hóa đơn", "Lập hóa đơn mới"], ["PAYMENT", "Thanh toán", "Ghi nhận thanh toán"], ["REFUND", "Hoàn tiền", "Thực hiện hoàn tiền"], ["PRINT", "In hóa đơn", "In hóa đơn"], ["EXPORT_PDF", "Xuất PDF", "Xuất hóa đơn PDF"], ["EXPORT_EXCEL", "Xuất Excel", "Xuất dữ liệu hóa đơn Excel"]]),
  ...define("SERVICE", [["VIEW", "Xem dịch vụ", "Xem danh sách dịch vụ"], ["CREATE", "Thêm dịch vụ", "Tạo dịch vụ mới"], ["UPDATE", "Sửa dịch vụ", "Cập nhật dịch vụ"], ["DELETE", "Xóa dịch vụ", "Xóa dịch vụ"]]),
  ...define("USER", [["VIEW", "Xem nhân viên", "Xem danh sách nhân viên"], ["CREATE", "Thêm nhân viên", "Tạo tài khoản nhân viên"], ["UPDATE", "Sửa nhân viên", "Cập nhật tài khoản nhân viên"], ["DELETE", "Xóa nhân viên", "Xóa tài khoản nhân viên"]]),
  ...define("ROLE", [["VIEW", "Xem phân quyền", "Xem role và permission"], ["CREATE", "Tạo Role", "Tạo vai trò mới"], ["UPDATE", "Sửa Role", "Cập nhật vai trò"], ["DELETE", "Xóa Role", "Xóa vai trò"], ["ASSIGN_PERMISSION", "Gán Permission", "Gán quyền cho role và user"]]),
  ...define("REPORT", [["VIEW", "Xem báo cáo", "Xem báo cáo hệ thống"], ["EXPORT_EXCEL", "Xuất Excel", "Xuất báo cáo Excel"], ["EXPORT_PDF", "Xuất PDF", "Xuất báo cáo PDF"]]),
  ...define("INVENTORY", [["VIEW", "Xem kho", "Xem vật tư và tồn kho"], ["CREATE", "Thêm vật tư", "Tạo vật tư mới"], ["UPDATE", "Sửa vật tư", "Cập nhật vật tư"], ["DELETE", "Xóa vật tư", "Xóa vật tư"], ["TRANSACTION", "Nhập/Xuất kho", "Thực hiện giao dịch kho"]]),
  ...define("FINANCE", [["VIEW", "Xem thu chi", "Xem giao dịch tài chính"], ["CREATE", "Thêm thu chi", "Tạo giao dịch tài chính"], ["UPDATE", "Sửa thu chi", "Cập nhật giao dịch tài chính"], ["DELETE", "Xóa thu chi", "Xóa giao dịch tài chính"]]),
];

export const ALL_PERMISSION_IDS = PERMISSIONS.map((permission) => permission.id);

const LEGACY_MODULES: Record<string, string[]> = {
  DASHBOARD: ["DASHBOARD"], ROOMS: ["ROOM"], BOOKINGS: ["BOOKING"], CUSTOMERS: ["CUSTOMER"],
  SERVICES: ["SERVICE"], INVOICES: ["INVOICE"], INVENTORY: ["INVENTORY"], FINANCE: ["FINANCE"],
  HOUSEKEEPING: ["HOUSEKEEPING"],
  REPORTS: ["REPORT"], USERS: ["USER", "ROLE"],
};

export function normalizePermissions(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.flatMap((value) => {
    const key = String(value).trim().toUpperCase();
    const modules = LEGACY_MODULES[key];
    if (modules) return PERMISSIONS.filter((permission) => modules.includes(permission.module)).map((permission) => permission.id);
    return ALL_PERMISSION_IDS.includes(key) ? [key] : [];
  })));
}

export function getDefaultPermissions(role: string): string[] {
  const normalizedRole = String(role || "").toUpperCase();
  if (["SUPERADMIN", "ADMIN"].includes(normalizedRole)) return [...ALL_PERMISSION_IDS];
  if (normalizedRole === "MANAGER") return ALL_PERMISSION_IDS.filter((id) => !["USER_DELETE", "ROLE_CREATE", "ROLE_UPDATE", "ROLE_DELETE", "ROLE_ASSIGN_PERMISSION"].includes(id));
  if (normalizedRole === "STAFF") return ["DASHBOARD_VIEW", "DASHBOARD_ROOM_STATS", "ROOM_VIEW", "ROOM_STATUS", "HOUSEKEEPING_VIEW", "HOUSEKEEPING_UPDATE", "BOOKING_VIEW", "BOOKING_CREATE", "BOOKING_UPDATE", "BOOKING_CHECK_IN", "BOOKING_CHECK_OUT", "BOOKING_EXTEND", "BOOKING_TRANSFER", "CUSTOMER_VIEW", "CUSTOMER_CREATE", "CUSTOMER_UPDATE", "CUSTOMER_HISTORY", "SERVICE_VIEW", "INVOICE_VIEW", "INVOICE_CREATE", "INVOICE_PAYMENT", "INVOICE_PRINT", "INVENTORY_VIEW", "INVENTORY_TRANSACTION"];
  if (normalizedRole === "HOUSEKEEPING") return ["HOUSEKEEPING_VIEW", "HOUSEKEEPING_UPDATE"];
  return [];
}
