
import type {
  RoomType,
  Room,
  Booking,
  Service,
  Invoice,
  RoomWithType,
  BookingWithRoom,
  User,
  MaintenanceRecord,
  MaintenanceRecordWithDetails,
  Amenity,
  Guest,
  BookingFolio,
} from "./types";

// Loại phòng
export const roomTypes: RoomType[] = [
  {
    id: "rt-1",
    name: "Tiêu chuẩn (Standard)",
    hourlyPrice: 80000,
    dayPrice: 400000,
    nightPrice: 300000,
    capacity: 2,
    amenities: ["WiFi", "TV", "Điều hòa", "Minibar"],
  },
  {
    id: "rt-2",
    name: "Cao cấp (Deluxe)",
    hourlyPrice: 120000,
    dayPrice: 600000,
    nightPrice: 450000,
    capacity: 3,
    amenities: ["WiFi", "TV", "Điều hòa", "Minibar", "Ban công", "Dịch vụ phòng"],
  },
  {
    id: "rt-3",
    name: "Thượng hạng (Suite)",
    hourlyPrice: 200000,
    dayPrice: 1000000,
    nightPrice: 800000,
    capacity: 4,
    amenities: [
      "WiFi",
      "TV",
      "Điều hòa",
      "Minibar",
      "Ban công",
      "Dịch vụ phòng",
      "Phòng khách",
      "Bồn sục Jacuzzi",
    ],
  },
];

// Danh sách phòng - 4 tầng
export const rooms: Room[] = [
  // Tầng 1
  { id: "r-101", roomNumber: "101", status: "AVAILABLE", roomTypeId: "rt-1", floor: 1 },
  { id: "r-102", roomNumber: "102", status: "OCCUPIED", roomTypeId: "rt-1", floor: 1 },
  { id: "r-103", roomNumber: "103", status: "DIRTY", roomTypeId: "rt-1", floor: 1 },
  { id: "r-104", roomNumber: "104", status: "AVAILABLE", roomTypeId: "rt-1", floor: 1 },
  { id: "r-105", roomNumber: "105", status: "OCCUPIED", roomTypeId: "rt-1", floor: 1 },
  { id: "r-106", roomNumber: "106", status: "MAINTENANCE", roomTypeId: "rt-1", floor: 1 },
  // Tầng 2
  { id: "r-201", roomNumber: "201", status: "AVAILABLE", roomTypeId: "rt-1", floor: 2 },
  { id: "r-202", roomNumber: "202", status: "OCCUPIED", roomTypeId: "rt-1", floor: 2 },
  { id: "r-203", roomNumber: "203", status: "AVAILABLE", roomTypeId: "rt-2", floor: 2 },
  { id: "r-204", roomNumber: "204", status: "DIRTY", roomTypeId: "rt-2", floor: 2 },
  { id: "r-205", roomNumber: "205", status: "OCCUPIED", roomTypeId: "rt-2", floor: 2 },
  { id: "r-206", roomNumber: "206", status: "AVAILABLE", roomTypeId: "rt-2", floor: 2 },
  // Tầng 3
  { id: "r-301", roomNumber: "301", status: "OCCUPIED", roomTypeId: "rt-2", floor: 3 },
  { id: "r-302", roomNumber: "302", status: "AVAILABLE", roomTypeId: "rt-2", floor: 3 },
  { id: "r-303", roomNumber: "303", status: "AVAILABLE", roomTypeId: "rt-2", floor: 3 },
  { id: "r-304", roomNumber: "304", status: "DIRTY", roomTypeId: "rt-2", floor: 3 },
  { id: "r-305", roomNumber: "305", status: "OCCUPIED", roomTypeId: "rt-2", floor: 3 },
  { id: "r-306", roomNumber: "306", status: "MAINTENANCE", roomTypeId: "rt-2", floor: 3 },
  // Tầng 4
  { id: "r-401", roomNumber: "401", status: "AVAILABLE", roomTypeId: "rt-3", floor: 4 },
  { id: "r-402", roomNumber: "402", status: "OCCUPIED", roomTypeId: "rt-3", floor: 4 },
  { id: "r-403", roomNumber: "403", status: "AVAILABLE", roomTypeId: "rt-3", floor: 4 },
  { id: "r-404", roomNumber: "404", status: "DIRTY", roomTypeId: "rt-3", floor: 4 },
  { id: "r-405", roomNumber: "405", status: "OCCUPIED", roomTypeId: "rt-3", floor: 4 },
  { id: "r-406", roomNumber: "406", status: "AVAILABLE", roomTypeId: "rt-3", floor: 4 },
];

// Dịch vụ
export const services: Service[] = [
  { id: "s-1", name: "Ăn sáng tại phòng", price: 25000, unit: "phần", status: "ACTIVE", category: "FOOD" },
  { id: "s-2", name: "Ăn trưa tại phòng", price: 35000, unit: "phần", status: "ACTIVE", category: "FOOD" },
  { id: "s-3", name: "Ăn tối tại phòng", price: 45000, unit: "phần", status: "ACTIVE", category: "FOOD" },
  { id: "s-4", name: "Bổ sung Minibar", price: 50000, unit: "lần", status: "ACTIVE", category: "FOOD" },
  { id: "s-5", name: "Spa - Massage toàn thân", price: 120000, unit: "lần", status: "ACTIVE", category: "SPA" },
  { id: "s-6", name: "Spa - Chăm sóc da mặt", price: 80000, unit: "lần", status: "ACTIVE", category: "SPA" },
  { id: "s-7", name: "Giặt ủi - Tiêu chuẩn", price: 15000, unit: "kg", status: "ACTIVE", category: "LAUNDRY" },
  { id: "s-8", name: "Giặt ủi - Nhanh", price: 30000, unit: "kg", status: "ACTIVE", category: "LAUNDRY" },
  { id: "s-9", name: "Đưa đón sân bay", price: 250000, unit: "lượt", status: "ACTIVE", category: "TRANSPORT" },
  { id: "s-10", name: "Tour tham quan thành phố", price: 350000, unit: "người", status: "ACTIVE", category: "TRANSPORT" },
];


// Nhân viên
export const users: User[] = [
  { id: "u-1", name: "Carlos Rodriguez", email: "carlos@hotel.com", role: "MAINTENANCE" },
  { id: "u-2", name: "Maria Santos", email: "maria@hotel.com", role: "MAINTENANCE" },
  { id: "u-3", name: "James Wilson", email: "james@hotel.com", role: "MAINTENANCE" },
  { id: "u-4", name: "Anna Chen", email: "anna@hotel.com", role: "HOUSEKEEPING" },
  { id: "u-5", name: "Robert Brown", email: "robert@hotel.com", role: "STAFF" },
  { id: "u-6", name: "Quản trị viên", email: "admin@hotel.com", role: "ADMIN" },
];

// Ghi chú bảo trì
export const maintenanceRecords: MaintenanceRecord[] = [
  {
    id: "mr-1",
    roomId: "r-106",
    description: "Máy lạnh không mát - Cần thay block",
    startDate: "2026-05-18",
    repairCost: 450.00,
    status: "IN_PROGRESS",
    staffId: "u-1",
  },
  {
    id: "mr-2",
    roomId: "r-306",
    description: "Rò rỉ bồn rửa mặt - Thay ống dẫn",
    startDate: "2026-05-19",
    repairCost: 180.50,
    status: "IN_PROGRESS",
    staffId: "u-2",
  },
  // ... các mục còn lại giữ nguyên logic
];

// Tiện nghi (Amenities)
export const amenities: Amenity[] = [
  { id: "a-1", name: "WiFi", icon: "Wifi", category: "COMFORT" },
  { id: "a-2", name: "TV", icon: "Tv", category: "ENTERTAINMENT" },
  { id: "a-3", name: "Điều hòa", icon: "Wind", category: "COMFORT" },
  { id: "a-4", name: "Minibar", icon: "Wine", category: "KITCHEN" },
  // ... các mục còn lại tương tự
];

export function getAvailableRoomsByType(roomTypeId: string): RoomWithType[] {
  return rooms
    .filter((room) => room.roomTypeId === roomTypeId && room.status === "AVAILABLE")
    .map((room) => ({
      ...room,
      roomType: roomTypes.find((type) => type.id === room.roomTypeId)!,
    }));
}