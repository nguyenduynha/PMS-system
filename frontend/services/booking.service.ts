import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/bookings`;

const getHeaders = () => ({
  "Content-Type": "application/json",
  ...(typeof window !== "undefined" && localStorage.getItem("token")
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
    : {}),
});

const toIsoDateTime = (value: unknown) => {
  if (typeof value !== "string" || !value) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

export const BookingAPI = {
  // 1. Lấy danh sách đặt phòng
  getBookings: async (options?: { limit?: number }) => {
    const url = options?.limit ? `${API_URL}?limit=${options.limit}` : API_URL;
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách đặt phòng");
    }
    return res.json();
  },

  // 2. Tạo đặt phòng mới
  createBooking: async (data: any) => {
    const payload = {
      ...data,
      checkInDate: toIsoDateTime(data.checkInDate),
      checkOutDate: toIsoDateTime(data.checkOutDate),
    };
    const res = await fetch(API_URL, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể lưu đặt phòng");
    }
    return result;
  },

  // 3. Cập nhật trạng thái đặt phòng
  updateBookingStatus: async (id: string, status: string) => {
    const res = await fetch(`${API_URL}/${id}/status`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể cập nhật trạng thái");
    }
    return result;
  },

  // 4. Lấy danh sách dịch vụ của đặt phòng
  getBookingServices: async (bookingId: string) => {
    const res = await fetch(`${API_URL}/${bookingId}/services`, { headers: getHeaders() });
    if (!res.ok) {
      throw new Error("Không thể tải danh sách dịch vụ của phòng");
    }
    return res.json();
  },

  // 5. Thêm dịch vụ vào đặt phòng
  addBookingService: async (bookingId: string, data: { serviceId: string; quantity: number }) => {
    const res = await fetch(`${API_URL}/${bookingId}/services`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể thêm dịch vụ");
    }
    return result;
  },

  // 6. Xóa dịch vụ khỏi đặt phòng
  removeBookingService: async (bookingId: string, bookingServiceId: string) => {
    const res = await fetch(`${API_URL}/${bookingId}/services/${bookingServiceId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể xóa dịch vụ");
    }
    return result;
  },

  // 7. Gia hạn đặt phòng
  extendBooking: async (id: string, checkOutDate: string) => {
    const res = await fetch(`${API_URL}/${id}/extend`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ checkOutDate: toIsoDateTime(checkOutDate) }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể gia hạn phòng");
    }
    return result;
  },

  // 8. Đổi phòng
  changeRoom: async (id: string, newRoomId: string) => {
    const res = await fetch(`${API_URL}/${id}/change-room`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify({ newRoomId }),
    });
    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Không thể đổi phòng");
    }
    return result;
  }
};
