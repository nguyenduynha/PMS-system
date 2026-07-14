import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/rooms`;

// Helper function to get headers with authentication token
const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const RoomAPI = {
  // 1. Lấy danh sách phòng
  getRooms: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách phòng");
    }
    return res.json();
  },

  // 1.5. Lấy danh sách loại phòng
  getRoomTypes: async () => {
    const res = await fetch(`${API_URL}/types`, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách loại phòng");
    }
    return res.json();
  },

  getHousekeepingRooms: async () => {
    const res = await fetch(`${API_URL}/housekeeping`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Không thể tải danh sách buồng phòng");
    return res.json();
  },

  updateHousekeepingStatus: async (id: string, status: "DIRTY" | "CLEANING" | "AVAILABLE") => {
    const res = await fetch(`${API_URL}/${id}/housekeeping`, {
      method: "PUT", headers: getHeaders(), body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.message || "Không thể cập nhật trạng thái vệ sinh");
    return result.data;
  },

  // 2. Tạo phòng mới
  createRoom: async (data: any) => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể tạo phòng");
    }
    return result;
  },

  // 3. Cập nhật phòng
  updateRoom: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể cập nhật phòng");
    }
    return result;
  },

  // 4. Xóa phòng
  deleteRoom: async (id: string) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      headers: {
        ...(typeof window !== 'undefined' && localStorage.getItem("token") 
          ? { "Authorization": `Bearer ${localStorage.getItem("token")}` } 
          : {})
      }
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể xóa phòng");
    }
    return result;
  }
};
