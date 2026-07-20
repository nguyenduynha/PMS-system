export const BOOKING_STATUS_CONFIG: Record<string, { label: string; timelineClass: string }> = {
  PENDING: { label: "Đã đặt", timelineClass: "border-indigo-300 bg-indigo-500 text-white" },
  BOOKED: { label: "Đã đặt", timelineClass: "border-indigo-300 bg-indigo-500 text-white" },
  CONFIRMED: { label: "Đã đặt", timelineClass: "border-indigo-300 bg-indigo-500 text-white" },
  EXPECTED_ARRIVAL: { label: "Đã đặt", timelineClass: "border-indigo-300 bg-indigo-500 text-white" },
  NO_SHOW: { label: "Chưa đến", timelineClass: "border-[#B052C0] bg-[#B052C0] text-white" },
  CHECKED_IN: { label: "Có khách", timelineClass: "border-emerald-400 bg-emerald-600 text-white" },
  CHECKED_OUT: { label: "Đã hoàn thành", timelineClass: "border-[#EE82EE] bg-[#EE82EE] text-slate-900" },
  COMPLETED: { label: "Đã hoàn thành", timelineClass: "border-[#EE82EE] bg-[#EE82EE] text-slate-900" },
};

export const HOLDING_BOOKING_STATUSES = [
  "BOOKED", "PENDING", "CONFIRMED", "EXPECTED_ARRIVAL", "NO_SHOW", "CHECKED_IN",
];

export const getBookingStatusConfig = (status: string) =>
  BOOKING_STATUS_CONFIG[status] || { label: status, timelineClass: "border-slate-300 bg-slate-500 text-white" };

export const getOverdueLabel = (checkInDate: string | Date, now = new Date()) => {
  const minutes = Math.max(0, Math.floor((now.getTime() - new Date(checkInDate).getTime()) / 60000));
  if (minutes < 60) return `Quá giờ Check-in ${minutes} phút`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `Quá giờ Check-in ${hours} giờ${remainder ? ` ${remainder} phút` : ""}`;
};

export const getRoomDisplayStatus = (room: any) => {
  const booking = room?.currentBooking || room?.bookings?.[0] || null;
  if (booking?.status === "NO_SHOW") return "NO_SHOW";
  if (booking?.status === "CHECKED_IN") return "OCCUPIED";
  if (["BOOKED", "PENDING", "CONFIRMED", "EXPECTED_ARRIVAL"].includes(booking?.status)) return "RESERVED";
  return room?.status;
};
