import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/maintenance`;

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const MaintenanceAPI = {
  // 1. Lấy danh sách lịch sử bảo trì
  getMaintenanceRecords: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách lịch sử bảo trì");
    }
    return res.json();
  },

  // 2. Tạo yêu cầu bảo trì mới
  createMaintenanceRecord: async (data: any) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể tạo yêu cầu bảo trì");
    }
    return result;
  },

  // 3. Đánh dấu hoàn tất bảo trì
  completeMaintenanceRecord: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}/complete`, {
      method: "PUT",
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể hoàn tất bảo trì");
    }
    return result;
  },

  // 4. Cập nhật trạng thái bảo trì chi tiết
  updateMaintenanceStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể cập nhật trạng thái bảo trì");
    }
    return result;
  }
};
