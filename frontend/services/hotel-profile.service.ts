import { API_BASE_URL } from "@/lib/app-config";

const API_URL = `${API_BASE_URL}/hotel-profile`;

export type HotelProfile = {
  id?: number;
  hotelName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  country: string;
  province: string;
  businessType: string;
  taxCode: string;
  businessLicense: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  ownerIdentity: string;
  logoDataUrl: string | null;
};

export const EMPTY_HOTEL_PROFILE: HotelProfile = {
  hotelName: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  country: "Việt Nam",
  province: "",
  businessType: "Khách sạn lưu trú",
  taxCode: "",
  businessLicense: "",
  ownerName: "",
  ownerEmail: "",
  ownerPhone: "",
  ownerIdentity: "",
  logoDataUrl: null,
};

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export const HotelProfileAPI = {
  get: async (): Promise<HotelProfile> => {
    const response = await fetch(API_URL, { headers: headers() });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Không thể tải thông tin khách sạn");
    return { ...EMPTY_HOTEL_PROFILE, ...result };
  },

  update: async (data: HotelProfile): Promise<HotelProfile> => {
    const response = await fetch(API_URL, { method: "PUT", headers: headers(), body: JSON.stringify(data) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Không thể lưu thông tin khách sạn");
    return { ...EMPTY_HOTEL_PROFILE, ...result };
  },
};
