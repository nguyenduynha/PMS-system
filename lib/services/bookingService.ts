import { prisma } from "../prisma";
import type { BookingStatus, PriceType, RoomStatus } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const amenitiesMap: Record<string, string[]> = {
  Standard: ["WiFi", "TV", "Air Conditioning", "Mini Bar"],
  Deluxe: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service"],
  Suite: ["WiFi", "TV", "Air Conditioning", "Mini Bar", "Balcony", "Room Service", "Living Room", "Jacuzzi"],
};

function formatBookingService(bs: any) {
  return {
    id: bs.id.toString(),
    bookingId: bs.bookingId.toString(),
    serviceId: bs.serviceId.toString(),
    serviceName: bs.service?.name ?? "",
    serviceUnit: bs.service?.unit ?? "lần",
    quantity: bs.quantity,
    price: Number(bs.price),
    totalAmount: Number(bs.totalAmount),
    createdAt: bs.createdAt.toISOString(),
  };
}

function formatBookingFolio(booking: any) {
  return {
    id: booking.id.toString(),
    roomId: booking.roomId.toString(),
    checkInDate: booking.checkInDate.toISOString().split("T")[0],
    checkOutDate: booking.checkOutDate.toISOString().split("T")[0],
    customerName: booking.customerName,
    customerPhone: booking.customerPhone,
    customerEmail: booking.customerEmail ?? null,
    guestCount: booking.guestCount ?? 1,
    status: booking.status as BookingStatus,
    totalAmount: Number(booking.totalAmount),
    priceType: (booking.priceType ?? "night") as PriceType,
    bookingSource: booking.bookingSource ?? "WALK_IN",
    createdAt: booking.createdAt.toISOString(),
    room: {
      id: booking.room.id.toString(),
      roomNumber: booking.room.roomNumber,
      status: booking.room.status as RoomStatus,
      roomTypeId: booking.room.roomTypeId.toString(),
      floor: booking.room.floor ?? 1,
      roomType: {
        id: booking.room.roomType.id.toString(),
        name: booking.room.roomType.name,
        hourlyPrice: Number(booking.room.roomType.hourlyPrice),
        dayPrice: Number(booking.room.roomType.dayPrice),
        nightPrice: Number(booking.room.roomType.nightPrice),
        capacity: booking.room.roomType.capacity,
        amenities: amenitiesMap[booking.room.roomType.name] ?? ["WiFi"],
      },
    },
    guests: [
      {
        id: `g-${booking.id}-1`,
        bookingId: booking.id.toString(),
        name: booking.customerName,
        phone: booking.customerPhone,
        idType: "PASSPORT" as const,
        idNumber: "ID-" + booking.id,
        isPrimary: true,
      },
    ],
    bookingServices: (booking.bookingServices ?? []).map(formatBookingService),
    invoice: booking.invoice
      ? {
          id: booking.invoice.id.toString(),
          invoiceNumber: booking.invoice.invoiceNumber,
          bookingId: booking.invoice.bookingId.toString(),
          subTotal: Number(booking.invoice.subTotal),
          taxAmount: Number(booking.invoice.taxAmount),
          discount: Number(booking.invoice.discount),
          totalAmount: Number(booking.invoice.totalAmount),
          status: booking.invoice.status,
          createdAt: booking.invoice.createdAt.toISOString(),
        }
      : null,
  };
}

const bookingInclude = {
  room: { include: { roomType: true } },
  bookingServices: { include: { service: true } },
  invoice: true,
} as const;

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getAllBookings() {
  const bookings = await prisma.booking.findMany({
    include: bookingInclude,
    orderBy: { createdAt: "desc" },
  });
  return bookings.map(formatBookingFolio);
}

export async function getBookingFolio(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: BigInt(bookingId) },
    include: bookingInclude,
  });
  if (!booking) return null;
  return formatBookingFolio(booking);
}

export async function getBookingFolioByRoomId(roomId: string) {
  // Tìm booking đang active nhất cho phòng này (ưu tiên CHECKED_IN, sau đó CONFIRMED/PENDING)
  const booking = await prisma.booking.findFirst({
    where: {
      roomId: BigInt(roomId),
      status: { in: ["CHECKED_IN", "CONFIRMED", "PENDING"] },
    },
    orderBy: [
      // Ưu tiên CHECKED_IN trước
      { createdAt: "desc" },
    ],
    include: bookingInclude,
  });
  if (!booking) return null;
  return formatBookingFolio(booking);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export async function createBooking(data: {
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  guestCount?: number;
  totalAmount: number;
  status: BookingStatus;
  bookingSource?: string;
  priceType?: PriceType;
}) {
  const booking = await prisma.booking.create({
    data: {
      roomId: BigInt(data.roomId),
      checkInDate: new Date(data.checkInDate),
      checkOutDate: new Date(data.checkOutDate),
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerEmail: data.customerEmail ?? "",
      guestCount: data.guestCount ?? 1,
      totalAmount: data.totalAmount,
      status: data.status,
      bookingSource: data.bookingSource ?? "WALK_IN",
      priceType: data.priceType ?? "night",
    },
    include: bookingInclude,
  });

  if (data.status === "CHECKED_IN") {
    await prisma.room.update({
      where: { id: BigInt(data.roomId) },
      data: { status: "OCCUPIED" },
    });
  }

  return formatBookingFolio(booking);
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  const booking = await prisma.booking.update({
    where: { id: BigInt(id) },
    data: { status },
    include: bookingInclude,
  });

  if (status === "CHECKED_IN") {
    await prisma.room.update({ where: { id: booking.roomId }, data: { status: "OCCUPIED" } });
  } else if (status === "CHECKED_OUT") {
    await prisma.room.update({ where: { id: booking.roomId }, data: { status: "DIRTY" } });
  } else if (status === "CANCELLED") {
    await prisma.room.update({ where: { id: booking.roomId }, data: { status: "AVAILABLE" } });
  }

  return formatBookingFolio(booking);
}

export async function updateBookingPriceType(bookingId: string, priceType: PriceType) {
  const booking = await prisma.booking.update({
    where: { id: BigInt(bookingId) },
    data: { priceType },
    include: bookingInclude,
  });
  return formatBookingFolio(booking);
}

export async function extendStay(bookingId: string, newCheckOutDate: string, newTotalAmount: number) {
  const booking = await prisma.booking.update({
    where: { id: BigInt(bookingId) },
    data: { checkOutDate: new Date(newCheckOutDate), totalAmount: newTotalAmount },
    include: bookingInclude,
  });
  return formatBookingFolio(booking);
}

export async function changeRoom(bookingId: string, newRoomId: string) {
  const oldBooking = await prisma.booking.findUnique({ where: { id: BigInt(bookingId) } });
  if (!oldBooking) throw new Error("Booking not found");

  const booking = await prisma.booking.update({
    where: { id: BigInt(bookingId) },
    data: { roomId: BigInt(newRoomId) },
    include: bookingInclude,
  });

  await prisma.room.update({ where: { id: oldBooking.roomId }, data: { status: "DIRTY" } });

  if (booking.status === "CHECKED_IN") {
    await prisma.room.update({ where: { id: BigInt(newRoomId) }, data: { status: "OCCUPIED" } });
  }

  return formatBookingFolio(booking);
}

// ─── BookingService (dịch vụ) ─────────────────────────────────────────────────

export async function addServiceToBooking(data: {
  bookingId: string;
  serviceId: string;
  quantity: number;
}) {
  const service = await prisma.service.findUnique({ where: { id: BigInt(data.serviceId) } });
  if (!service) throw new Error("Service not found");

  const totalAmount = Number(service.price) * data.quantity;

  const bookingService = await prisma.bookingService.create({
    data: {
      bookingId: BigInt(data.bookingId),
      serviceId: BigInt(data.serviceId),
      quantity: data.quantity,
      price: service.price,
      totalAmount,
    },
    include: { service: true },
  });

  return formatBookingService(bookingService);
}

export async function removeServiceFromBooking(bookingServiceId: string) {
  await prisma.bookingService.delete({ where: { id: BigInt(bookingServiceId) } });
}
