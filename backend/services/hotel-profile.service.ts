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

    if (!data.hotelName) throw new Error("Tên khách sạn không được để trống");
    if (!data.ownerName) throw new Error("Tên chủ khách sạn không được để trống");
    if (!data.address) throw new Error("Địa chỉ khách sạn không được để trống");

    return prisma.hotelProfile.upsert({
      where: { id: 1 },
      create: { ...defaultProfile, ...data },
      update: data,
    });
  },
};
