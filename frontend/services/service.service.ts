import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/services`;
const getHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token") || ""}` });

export const ServiceAPI = {
  // 1. Lấy danh sách dịch vụ
  getServices: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách dịch vụ");
    }
    return res.json();
  },

  // 2. Tạo dịch vụ mới
  createService: async (data: any) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể tạo dịch vụ");
    }
    return result;
  },

  // 3. Cập nhật dịch vụ
  updateService: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể cập nhật dịch vụ");
    }
    return result;
  },

  // 4. Xóa dịch vụ
  deleteService: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể xóa dịch vụ");
    }
    return result;
  }
};
