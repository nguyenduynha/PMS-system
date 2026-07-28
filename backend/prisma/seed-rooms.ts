import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const roomTypes = [
  { name: "Standard", pricePerNight: 600000, capacity: 2, description: "Phòng tiêu chuẩn ấm cúng, đầy đủ tiện nghi.", amenities: ["WiFi", "TV", "Air Conditioning"] },
  { name: "Deluxe", pricePerNight: 1000000, capacity: 3, description: "Phòng sang trọng với ban công và trang thiết bị hiện đại.", amenities: ["WiFi", "TV", "Air Conditioning", "Balcony", "Mini Bar"] },
  { name: "Suite", pricePerNight: 1500000, capacity: 4, description: "Phòng thượng hạng với phòng khách riêng biệt.", amenities: ["WiFi", "TV", "Air Conditioning", "Balcony", "Mini Bar", "Living Room", "Jacuzzi"] },
];

async function main() {
  const typesByName = new Map<string, bigint>();

  for (const type of roomTypes) {
    const existing = await prisma.roomType.findFirst({ where: { name: type.name } });
    const saved = existing || await prisma.roomType.create({ data: type });
    typesByName.set(type.name, saved.id);
  }

  const standardId = typesByName.get("Standard")!;
  const deluxeId = typesByName.get("Deluxe")!;
  const suiteId = typesByName.get("Suite")!;
  const rooms = [
    ...["101", "102", "103", "104", "105", "106"].map((roomNumber) => ({ roomNumber, floor: 1, roomTypeId: standardId })),
    ...["201", "202"].map((roomNumber) => ({ roomNumber, floor: 2, roomTypeId: standardId })),
    ...["203", "204", "205", "206"].map((roomNumber) => ({ roomNumber, floor: 2, roomTypeId: deluxeId })),
    ...["301", "302", "303", "304", "305", "306"].map((roomNumber) => ({ roomNumber, floor: 3, roomTypeId: deluxeId })),
    ...["401", "402", "403", "404", "405", "406"].map((roomNumber) => ({ roomNumber, floor: 4, roomTypeId: suiteId })),
  ];

  for (const room of rooms) {
    await prisma.room.upsert({
      where: { roomNumber: room.roomNumber },
      update: {},
      create: { ...room, status: "AVAILABLE", note: room.roomNumber === "101" ? "Gần thang máy" : "" },
    });
  }

  console.log(`Đã bảo đảm ${rooms.length} phòng tồn tại trong database.`);
}

main()
  .catch((error) => {
    console.error("Không thể seed dữ liệu phòng:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
