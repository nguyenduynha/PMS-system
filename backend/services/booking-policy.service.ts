import prisma from "../config/prisma";

export const HOLDING_BOOKING_STATUSES = [
  "BOOKED", "PENDING", "CONFIRMED", "EXPECTED_ARRIVAL", "NO_SHOW", "CHECKED_IN",
];

export const PRE_ARRIVAL_BOOKING_STATUSES = [
  "BOOKED", "PENDING", "CONFIRMED", "EXPECTED_ARRIVAL",
];

const NO_SHOW_SYNC_INTERVAL_MS = 60_000;
let lastNoShowSyncAt = 0;
let noShowSyncPromise: Promise<void> | null = null;

export const BookingPolicyService = {
  syncNoShows: async (now = new Date()) => {
    await prisma.booking.updateMany({
      where: {
        status: { in: PRE_ARRIVAL_BOOKING_STATUSES },
        checkInDate: { lt: now },
      },
      data: { status: "NO_SHOW" },
    });
  },

  syncNoShowsIfDue: async (now = new Date()) => {
    if (now.getTime() - lastNoShowSyncAt < NO_SHOW_SYNC_INTERVAL_MS) return;
    if (noShowSyncPromise) return noShowSyncPromise;

    noShowSyncPromise = prisma.booking.updateMany({
      where: {
        status: { in: PRE_ARRIVAL_BOOKING_STATUSES },
        checkInDate: { lt: now },
      },
      data: { status: "NO_SHOW" },
    }).then(() => {
      lastNoShowSyncAt = Date.now();
    }).finally(() => {
      noShowSyncPromise = null;
    });

    return noShowSyncPromise;
  },

  assertBookablePeriod: (checkIn: Date, checkOut: Date, now = new Date()) => {
    if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) {
      throw new Error("Ngày nhận phòng hoặc trả phòng không hợp lệ");
    }
    const currentMinute = new Date(now);
    currentMinute.setSeconds(0, 0);
    if (checkIn < currentMinute) {
      throw new Error("Không thể tạo đặt phòng trước thời gian hiện tại.");
    }
    if (checkOut <= checkIn) {
      throw new Error("Thời gian trả phòng phải sau thời gian nhận phòng");
    }
  },
};
