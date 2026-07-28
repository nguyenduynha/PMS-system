import prisma from "../config/prisma";

const stringFields = [
  "hotelName",
  "phone",
  "email",
  "website",
  "address",
  "country",
  "province",
  "businessType",
  "taxCode",
  "businessLicense",
  "ownerName",
  "ownerEmail",
  "ownerPhone",
  "ownerIdentity",
] as const;

const defaultProfile = {
  id: 1,
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
  defaultCheckInTime: "14:00",
  defaultCheckOutTime: "12:00",
  freeCancellationHours: 24,
  allowEarlyCheckIn: true,
  allowLateCheckOut: true,
  earlyCheckInFee: 100000,
  lateCheckOutFee: 150000,
  extraGuestFee: 200000,
};

export const HotelProfileService = {
  get: async () => prisma.hotelProfile.upsert({
    where: { id: 1 },
    create: defaultProfile,
    update: {},
  }),

  update: async (input: Record<string, unknown>) => {
    const data: Record<string, string | null> = {};
    for (const field of stringFields) {
      if (input[field] !== undefined) data[field] = String(input[field] ?? "").trim();
    }

    if (input.logoDataUrl !== undefined) {
      const logo = input.logoDataUrl ? String(input.logoDataUrl) : null;
      if (logo && !/^data:image\/(png|jpeg|jpg|webp);base64,/i.test(logo)) {
        throw new Error("Logo phải là ảnh PNG, JPG hoặc WEBP");
      }
      if (logo && logo.length > 2_800_000) throw new Error("Logo không được vượt quá 2MB");
      data.logoDataUrl = logo;
    }

    for (const field of ["defaultCheckInTime", "defaultCheckOutTime"] as const) {
      if (input[field] !== undefined) {
        const value = String(input[field]);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) throw new Error("Giờ vận hành không hợp lệ");
        data[field] = value;
      }
    }
    const numberData: Record<string, number> = {};
    for (const field of ["freeCancellationHours", "earlyCheckInFee", "lateCheckOutFee", "extraGuestFee"] as const) {
      if (input[field] !== undefined) {
        const value = Number(input[field]);
        if (!Number.isFinite(value) || value < 0) throw new Error("Giá trị cấu hình không hợp lệ");
        numberData[field] = value;
      }
    }
    const booleanData: Record<string, boolean> = {};
    for (const field of ["allowEarlyCheckIn", "allowLateCheckOut"] as const) {
      if (input[field] !== undefined) booleanData[field] = Boolean(input[field]);
    }

    return prisma.hotelProfile.upsert({
      where: { id: 1 },
      create: { ...defaultProfile, ...data, ...numberData, ...booleanData },
      update: { ...data, ...numberData, ...booleanData },
    });
  },
};
