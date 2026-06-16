import { prisma } from "../prisma";
import type { RoomStatus } from "../types";

const amenitiesMap: Record<string, string[]> = {
  "Standard": ["WiFi", "TV", "Air Conditioning", "Mini Bar"],
  "Deluxe": ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service"],
  "Suite": ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service", "Living Room", "Jacuzzi"],
};

export async function getRoomTypes() {
  const types = await prisma.roomType.findMany({
    orderBy: { id: "asc" },
  });
  return types.map((t) => ({
    id: t.id.toString(),
    name: t.name,
    hourlyPrice: Number(t.hourlyPrice),
    dayPrice: Number(t.dayPrice),
    nightPrice: Number(t.nightPrice),
    capacity: t.capacity,
    amenities: amenitiesMap[t.name] || ["WiFi"],
  }));
}

export async function getRoomsWithTypes() {
  const rooms = await prisma.room.findMany({
    include: { roomType: true },
    orderBy: { roomNumber: "asc" },
  });
  return rooms.map((r) => ({
    id: r.id.toString(),
    roomNumber: r.roomNumber,
    status: r.status as RoomStatus,
    roomTypeId: r.roomTypeId.toString(),
    floor: r.floor || 1,
    roomType: {
      id: r.roomType.id.toString(),
      name: r.roomType.name,
      hourlyPrice: Number(r.roomType.hourlyPrice),
      dayPrice: Number(r.roomType.dayPrice),
      nightPrice: Number(r.roomType.nightPrice),
      capacity: r.roomType.capacity,
      amenities: amenitiesMap[r.roomType.name] || ["WiFi"],
    },
  }));
}

export async function updateRoomStatus(id: string, status: RoomStatus) {
  const updatedRoom = await prisma.room.update({
    where: { id: BigInt(id) },
    data: { status },
    include: { roomType: true },
  });
  return {
    id: updatedRoom.id.toString(),
    roomNumber: updatedRoom.roomNumber,
    status: updatedRoom.status as RoomStatus,
    roomTypeId: updatedRoom.roomTypeId.toString(),
    floor: updatedRoom.floor || 1,
    roomType: {
      id: updatedRoom.roomType.id.toString(),
      name: updatedRoom.roomType.name,
      hourlyPrice: Number(updatedRoom.roomType.hourlyPrice),
      dayPrice: Number(updatedRoom.roomType.dayPrice),
      nightPrice: Number(updatedRoom.roomType.nightPrice),
      capacity: updatedRoom.roomType.capacity,
      amenities: amenitiesMap[updatedRoom.roomType.name] || ["WiFi"],
    },
  };
}
