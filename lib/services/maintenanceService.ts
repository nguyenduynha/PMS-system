import { prisma } from "../prisma";
import type { MaintenanceStatus, RoomStatus } from "../types";

const amenitiesMap: Record<string, string[]> = {
  "Standard": ["WiFi", "TV", "Air Conditioning", "Mini Bar"],
  "Deluxe": ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service"],
  "Suite": ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service", "Living Room", "Jacuzzi"],
};

export async function getAllRecords() {
  const records = await prisma.maintenanceRecord.findMany({
    include: {
      room: {
        include: { roomType: true },
      },
      staff: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return records.map((r) => ({
    id: r.id.toString(),
    roomId: r.roomId.toString(),
    staffId: r.staffId ? r.staffId.toString() : "",
    description: r.description || "",
    startDate: r.startDate ? r.startDate.toISOString().split("T")[0] : "",
    endDate: r.endDate ? r.endDate.toISOString().split("T")[0] : undefined,
    repairCost: Number(r.repairCost),
    status: r.status as MaintenanceStatus,
    room: {
      id: r.room.id.toString(),
      roomNumber: r.room.roomNumber,
      status: r.room.status as RoomStatus,
      roomTypeId: r.room.roomTypeId.toString(),
      floor: r.room.floor || 1,
      roomType: {
        id: r.room.roomType.id.toString(),
        name: r.room.roomType.name,
        hourlyPrice: Number(r.room.roomType.hourlyPrice),
        dayPrice: Number(r.room.roomType.dayPrice),
        nightPrice: Number(r.room.roomType.nightPrice),
        capacity: r.room.roomType.capacity,
        amenities: amenitiesMap[r.room.roomType.name] || ["WiFi"],
      },
    },
    staff: r.staff
      ? {
          id: r.staff.id.toString(),
          name: r.staff.fullName,
          email: r.staff.email,
          role: r.staff.role as any,
        }
      : {
          id: "",
          name: "Chưa phân công",
          email: "",
          role: "MAINTENANCE" as const,
        },
  }));
}

export async function createRecord(data: {
  roomId: string;
  description: string;
  staffId: string;
  repairCost?: number;
}) {
  const record = await prisma.maintenanceRecord.create({
    data: {
      roomId: BigInt(data.roomId),
      staffId: BigInt(data.staffId),
      description: data.description,
      status: "IN_PROGRESS",
      startDate: new Date(),
      repairCost: data.repairCost || 0,
    },
  });

  // Update room status
  await prisma.room.update({
    where: { id: BigInt(data.roomId) },
    data: { status: "MAINTENANCE" },
  });

  return record;
}

export async function completeRecord(id: string) {
  const record = await prisma.maintenanceRecord.update({
    where: { id: BigInt(id) },
    data: {
      status: "COMPLETED",
      endDate: new Date(),
    },
  });

  // Revert room status to AVAILABLE
  await prisma.room.update({
    where: { id: record.roomId },
    data: { status: "AVAILABLE" },
  });

  return record;
}
