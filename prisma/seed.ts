import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Bắt đầu dọn dẹp cơ sở dữ liệu...");
  // Clear tables in reverse dependency order
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bookingService.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.room.deleteMany();
  await prisma.roomType.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  console.log("Dọn dẹp cơ sở dữ liệu hoàn tất.");

  // 1. Seed Users
  console.log("Seeding Users...");
  const hashedPassword = await bcrypt.hash("123456", 10);
  
  const mockUsers = [
    { fullName: "Carlos Rodriguez", email: "carlos@hotel.com", role: "MAINTENANCE", status: "ACTIVE", phoneNumber: "0911111111" },
    { fullName: "Maria Santos", email: "maria@hotel.com", role: "MAINTENANCE", status: "ACTIVE", phoneNumber: "0922222222" },
    { fullName: "James Wilson", email: "james@hotel.com", role: "MAINTENANCE", status: "ACTIVE", phoneNumber: "0933333333" },
    { fullName: "Anna Chen", email: "anna@hotel.com", role: "HOUSEKEEPING", status: "ACTIVE", phoneNumber: "0944444444" },
    { fullName: "Robert Brown", email: "robert@hotel.com", role: "STAFF", status: "ACTIVE", phoneNumber: "0955555555" },
    { fullName: "Quản trị viên", email: "admin@hotel.com", role: "ADMIN", status: "ACTIVE", phoneNumber: "0900000000" },
  ];

  const userMap: Record<string, bigint> = {};
  
  for (const u of mockUsers) {
    const created = await prisma.user.create({
      data: {
        fullName: u.fullName,
        email: u.email,
        password: hashedPassword,
        phoneNumber: u.phoneNumber,
        role: u.role,
        status: u.status,
      },
    });
    // Map email/original name to database BigInt ID
    const key = u.email === "carlos@hotel.com" ? "u-1" :
                u.email === "maria@hotel.com" ? "u-2" :
                u.email === "james@hotel.com" ? "u-3" :
                u.email === "anna@hotel.com" ? "u-4" :
                u.email === "robert@hotel.com" ? "u-5" : "u-6";
    userMap[key] = created.id;
  }

  // 2. Seed Room Types
  console.log("Seeding Room Types...");
  const mockRoomTypes = [
    { name: "Standard", hourlyPrice: 80000, dayPrice: 400000, nightPrice: 300000, capacity: 2, description: "Standard Room with essential comfort" },
    { name: "Deluxe", hourlyPrice: 120000, dayPrice: 600000, nightPrice: 450000, capacity: 3, description: "Deluxe Room with premium amenities and more space" },
    { name: "Suite", hourlyPrice: 200000, dayPrice: 1000000, nightPrice: 800000, capacity: 4, description: "Luxurious Suite with jacuzzi and balcony view" },
  ];

  const roomTypeMap: Record<string, bigint> = {};
  for (const rt of mockRoomTypes) {
    const created = await prisma.roomType.create({
      data: {
        name: rt.name,
        hourlyPrice: rt.hourlyPrice,
        dayPrice: rt.dayPrice,
        nightPrice: rt.nightPrice,
        capacity: rt.capacity,
        description: rt.description,
      },
    });
    const key = rt.name === "Standard" ? "rt-1" :
                rt.name === "Deluxe" ? "rt-2" : "rt-3";
    roomTypeMap[key] = created.id;
  }

  // 3. Seed Rooms
  console.log("Seeding Rooms...");
  // Rooms list mapped from mock-data
  const mockRooms = [
    // Floor 1
    { roomNumber: "101", status: "AVAILABLE", roomTypeKey: "rt-1", floor: 1 },
    { roomNumber: "102", status: "OCCUPIED", roomTypeKey: "rt-1", floor: 1 },
    { roomNumber: "103", status: "DIRTY", roomTypeKey: "rt-1", floor: 1 },
    { roomNumber: "104", status: "AVAILABLE", roomTypeKey: "rt-1", floor: 1 },
    { roomNumber: "105", status: "OCCUPIED", roomTypeKey: "rt-1", floor: 1 },
    { roomNumber: "106", status: "MAINTENANCE", roomTypeKey: "rt-1", floor: 1 },
    // Floor 2
    { roomNumber: "201", status: "AVAILABLE", roomTypeKey: "rt-1", floor: 2 },
    { roomNumber: "202", status: "OCCUPIED", roomTypeKey: "rt-1", floor: 2 },
    { roomNumber: "203", status: "AVAILABLE", roomTypeKey: "rt-2", floor: 2 },
    { roomNumber: "204", status: "DIRTY", roomTypeKey: "rt-2", floor: 2 },
    { roomNumber: "205", status: "OCCUPIED", roomTypeKey: "rt-2", floor: 2 },
    { roomNumber: "206", status: "AVAILABLE", roomTypeKey: "rt-2", floor: 2 },
    // Floor 3
    { roomNumber: "301", status: "OCCUPIED", roomTypeKey: "rt-2", floor: 3 },
    { roomNumber: "302", status: "AVAILABLE", roomTypeKey: "rt-2", floor: 3 },
    { roomNumber: "303", status: "AVAILABLE", roomTypeKey: "rt-2", floor: 3 },
    { roomNumber: "304", status: "DIRTY", roomTypeKey: "rt-2", floor: 3 },
    { roomNumber: "305", status: "OCCUPIED", roomTypeKey: "rt-2", floor: 3 },
    { roomNumber: "306", status: "MAINTENANCE", roomTypeKey: "rt-2", floor: 3 },
    // Floor 4
    { roomNumber: "401", status: "AVAILABLE", roomTypeKey: "rt-3", floor: 4 },
    { roomNumber: "402", status: "OCCUPIED", roomTypeKey: "rt-3", floor: 4 },
    { roomNumber: "403", status: "AVAILABLE", roomTypeKey: "rt-3", floor: 4 },
    { roomNumber: "404", status: "DIRTY", roomTypeKey: "rt-3", floor: 4 },
    { roomNumber: "405", status: "OCCUPIED", roomTypeKey: "rt-3", floor: 4 },
    { roomNumber: "406", status: "AVAILABLE", roomTypeKey: "rt-3", floor: 4 },
  ];

  const roomMap: Record<string, bigint> = {};
  for (const r of mockRooms) {
    const created = await prisma.room.create({
      data: {
        roomNumber: r.roomNumber,
        status: r.status,
        roomTypeId: roomTypeMap[r.roomTypeKey],
        floor: r.floor,
      },
    });
    roomMap[`r-${r.roomNumber}`] = created.id;
  }

  // 4. Seed Services
  console.log("Seeding Services...");
  const mockServices = [
    { name: "Room Service - Breakfast", price: 25, unit: "lần" },
    { name: "Room Service - Lunch", price: 35, unit: "lần" },
    { name: "Room Service - Dinner", price: 45, unit: "lần" },
    { name: "Mini Bar Restock", price: 50, unit: "lần" },
    { name: "Spa - Full Body Massage", price: 120, unit: "giờ" },
    { name: "Spa - Facial Treatment", price: 80, unit: "giờ" },
    { name: "Laundry - Standard", price: 15, unit: "kg" },
    { name: "Laundry - Express", price: 30, unit: "kg" },
    { name: "Airport Transfer", price: 60, unit: "lượt" },
    { name: "City Tour", price: 100, unit: "lượt" },
  ];

  for (const s of mockServices) {
    await prisma.service.create({
      data: {
        name: s.name,
        price: s.price,
        unit: s.unit,
        status: "ACTIVE",
      },
    });
  }

  // 5. Seed Bookings
  console.log("Seeding Bookings...");
  const mockBookings = [
    { key: "b-1", roomKey: "r-102", checkInDate: "2026-05-20", checkOutDate: "2026-05-24", customerName: "John Smith", customerPhone: "+1 555-0101", status: "CHECKED_IN", totalAmount: 396 },
    { key: "b-2", roomKey: "r-105", checkInDate: "2026-05-21", checkOutDate: "2026-05-23", customerName: "Emily Johnson", customerPhone: "+1 555-0102", status: "CHECKED_IN", totalAmount: 198 },
    { key: "b-3", roomKey: "r-202", checkInDate: "2026-05-22", checkOutDate: "2026-05-25", customerName: "Michael Brown", customerPhone: "+1 555-0103", status: "CHECKED_IN", totalAmount: 297 },
    { key: "b-4", roomKey: "r-205", checkInDate: "2026-05-19", checkOutDate: "2026-05-22", customerName: "Sarah Davis", customerPhone: "+1 555-0104", status: "CHECKED_IN", totalAmount: 537 },
    { key: "b-5", roomKey: "r-301", checkInDate: "2026-05-20", checkOutDate: "2026-05-26", customerName: "David Wilson", customerPhone: "+1 555-0105", status: "CHECKED_IN", totalAmount: 1074 },
    { key: "b-6", roomKey: "r-305", checkInDate: "2026-05-21", checkOutDate: "2026-05-24", customerName: "Jennifer Taylor", customerPhone: "+1 555-0106", status: "CHECKED_IN", totalAmount: 537 },
    { key: "b-7", roomKey: "r-402", checkInDate: "2026-05-18", checkOutDate: "2026-05-25", customerName: "Robert Anderson", customerPhone: "+1 555-0107", status: "CHECKED_IN", totalAmount: 2093 },
    { key: "b-8", roomKey: "r-405", checkInDate: "2026-05-22", checkOutDate: "2026-05-27", customerName: "Lisa Martinez", customerPhone: "+1 555-0108", status: "CHECKED_IN", totalAmount: 1495 },
    { key: "b-9", roomKey: "r-101", checkInDate: "2026-05-25", checkOutDate: "2026-05-28", customerName: "James Garcia", customerPhone: "+1 555-0109", status: "CONFIRMED", totalAmount: 297 },
    { key: "b-10", roomKey: "r-203", checkInDate: "2026-05-26", checkOutDate: "2026-05-30", customerName: "Patricia Thompson", customerPhone: "+1 555-0110", status: "PENDING", totalAmount: 716 },
  ];

  const bookingMap: Record<string, bigint> = {};
  for (const b of mockBookings) {
    const created = await prisma.booking.create({
      data: {
        roomId: roomMap[b.roomKey],
        checkInDate: new Date(b.checkInDate),
        checkOutDate: new Date(b.checkOutDate),
        customerName: b.customerName,
        customerPhone: b.customerPhone,
        customerEmail: `${b.customerName.toLowerCase().replace(" ", "")}@gmail.com`,
        status: b.status,
        totalAmount: b.totalAmount,
        bookingSource: "WALK_IN",
      },
    });
    bookingMap[b.key] = created.id;
  }

  // 6. Seed Invoices
  console.log("Seeding Invoices...");
  const mockInvoices = [
    { bookingKey: "b-7", invoiceNumber: "INV-2026-001", totalAmount: 2093, taxAmount: 188.37, discount: 100, status: "PAID" },
    { bookingKey: "b-5", invoiceNumber: "INV-2026-002", totalAmount: 1074, taxAmount: 96.66, discount: 0, status: "PAID" },
  ];

  for (const inv of mockInvoices) {
    await prisma.invoice.create({
      data: {
        invoiceNumber: inv.invoiceNumber,
        bookingId: bookingMap[inv.bookingKey],
        subTotal: inv.totalAmount - inv.taxAmount + inv.discount,
        taxAmount: inv.taxAmount,
        discount: inv.discount,
        totalAmount: inv.totalAmount,
        status: inv.status,
      },
    });
  }

  // 7. Seed Maintenance Records
  console.log("Seeding Maintenance Records...");
  const mockMaintenance = [
    { roomKey: "r-106", staffKey: "u-1", description: "AC unit not cooling properly - compressor replacement needed", startDate: "2026-05-18", repairCost: 450.00, status: "IN_PROGRESS" },
    { roomKey: "r-306", staffKey: "u-2", description: "Bathroom sink leak - pipe replacement", startDate: "2026-05-19", repairCost: 180.50, status: "IN_PROGRESS" },
    { roomKey: "r-203", staffKey: "u-3", description: "TV remote control replacement", startDate: "2026-05-15", endDate: "2026-05-15", repairCost: 25.00, status: "COMPLETED" },
    { roomKey: "r-401", staffKey: "u-1", description: "Mini bar refrigerator repair - thermostat issue", startDate: "2026-05-16", endDate: "2026-05-17", repairCost: 120.00, status: "COMPLETED" },
    { roomKey: "r-102", staffKey: "u-2", description: "Door lock mechanism replacement", startDate: "2026-05-14", endDate: "2026-05-14", repairCost: 275.00, status: "COMPLETED" },
    { roomKey: "r-305", staffKey: "u-3", description: "Balcony door alignment and seal replacement", startDate: "2026-05-12", endDate: "2026-05-13", repairCost: 150.00, status: "COMPLETED" },
  ];

  for (const mr of mockMaintenance) {
    await prisma.maintenanceRecord.create({
      data: {
        roomId: roomMap[mr.roomKey],
        staffId: userMap[mr.staffKey],
        description: mr.description,
        startDate: new Date(mr.startDate),
        endDate: mr.endDate ? new Date(mr.endDate) : null,
        repairCost: mr.repairCost,
        status: mr.status,
      },
    });
  }

  console.log("Seeding cơ sở dữ liệu thành công!");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });