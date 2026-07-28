"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, CircleUserRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getBookingStatusConfig, getOverdueLabel } from "@/lib/booking-status";
import { toast } from "sonner";
import { HotelProfileAPI } from "@/services/hotel-profile.service";

type TimelineView = "week" | "month" | "year";
type TimelineRoom = { id: string; roomNumber: string; floor?: number | null; status: string; roomType?: { name?: string } };
type TimelineBooking = { id: string; roomId: string; customerName: string; customerPhone?: string; checkInDate: string; checkOutDate: string; status: string };
type TimelineSlot = { start: Date; end: Date; label: string; subLabel: string; isToday: boolean; isWeekend: boolean };
type DragSelection = { roomId: string; startIndex: number; endIndex: number; dateTime: Date };
type BookingTimelineProps = {
  bookings: TimelineBooking[];
  rooms: TimelineRoom[];
  loading: boolean;
  canCreate?: boolean;
  onEmptySlotClick: (roomId: string, checkInDate: Date, checkOutDate: Date) => void;
  onBookingClick: (bookingId: string) => void;
};

const VISIBLE_STATUSES = ["BOOKED", "PENDING", "CONFIRMED", "EXPECTED_ARRIVAL", "NO_SHOW", "CHECKED_IN", "CHECKED_OUT", "COMPLETED"];
const VIEW_LABELS: Record<TimelineView, string> = { week: "Tuần", month: "Tháng", year: "Năm" };

function startOfDay(value: Date) { const date = new Date(value); date.setHours(0, 0, 0, 0); return date; }
function addDays(value: Date, amount: number) { const date = new Date(value); date.setDate(date.getDate() + amount); return date; }
function addMonths(value: Date, amount: number) { const date = new Date(value); date.setMonth(date.getMonth() + amount, 1); return date; }
function startOfWeek(value: Date) { const date = startOfDay(value); return addDays(date, date.getDay() === 0 ? -6 : 1 - date.getDay()); }
function startOfMonth(value: Date) { const date = startOfDay(value); date.setDate(1); return date; }
function startOfYear(value: Date) { const date = startOfDay(value); date.setMonth(0, 1); return date; }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function capitalize(value: string) { return value.charAt(0).toUpperCase() + value.slice(1); }

export function BookingTimeline({ bookings, rooms, loading, canCreate = true, onEmptySlotClick, onBookingClick }: BookingTimelineProps) {
  const [view, setView] = useState<TimelineView>("month");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selection, setSelection] = useState<DragSelection | null>(null);
  const [hoverTime, setHoverTime] = useState<{ roomId: string; value: Date; left: number } | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [operatingTimes, setOperatingTimes] = useState({ checkIn: "14:00", checkOut: "12:00" });

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 60_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    HotelProfileAPI.get().then(profile => setOperatingTimes({ checkIn: profile.defaultCheckInTime, checkOut: profile.defaultCheckOutTime })).catch(() => {});
  }, []);
  const setConfiguredTime = (date: Date, value: string) => {
    const [hours, minutes] = value.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
  };

  const slots = useMemo<TimelineSlot[]>(() => {
    const today = new Date();
    const rangeStart = view === "week" ? startOfWeek(cursorDate) : view === "year" ? startOfYear(cursorDate) : startOfMonth(cursorDate);
    const count = view === "week" ? 7 : view === "year" ? 12 : 35;
    return Array.from({ length: count }, (_, index) => {
      const start = view === "year" ? addMonths(rangeStart, index) : addDays(rangeStart, index);
      const end = view === "year" ? addMonths(start, 1) : addDays(start, 1);
      const weekday = capitalize(new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(start));
      return {
        start, end,
        label: view === "year" ? `Thg ${start.getMonth() + 1}` : String(start.getDate()),
        subLabel: view === "year" ? String(start.getFullYear()) : weekday,
        isToday: isSameDay(start, today),
        isWeekend: start.getDay() === 0 || start.getDay() === 6,
      };
    });
  }, [cursorDate, view]);

  const rangeStart = slots[0].start;
  const rangeEnd = slots[slots.length - 1].end;
  const cellWidth = view === "week" ? 132 : view === "year" ? 116 : 52;
  const timelineWidth = slots.length * cellWidth;
  const nowMarkerLeft = ((now.getTime() - rangeStart.getTime()) / (rangeEnd.getTime() - rangeStart.getTime())) * timelineWidth;
  const showNowMarker = now >= rangeStart && now < rangeEnd;
  const monthGroups = useMemo(() => slots.reduce<{ key: string; label: string; count: number }[]>((groups, slot) => {
    const key = `${slot.start.getFullYear()}-${slot.start.getMonth()}`;
    const last = groups[groups.length - 1];
    if (last?.key === key) last.count++;
    else groups.push({ key, label: capitalize(new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(slot.start)), count: 1 });
    return groups;
  }, []), [slots]);

  const periodLabel = useMemo(() => {
    if (view === "year") return `Năm ${rangeStart.getFullYear()}`;
    if (view === "month") return capitalize(new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(rangeStart));
    const format = (date: Date) => new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
    return `${format(rangeStart)} – ${format(addDays(rangeEnd, -1))}`;
  }, [rangeEnd, rangeStart, view]);

  const movePeriod = (direction: -1 | 1) => {
    setSelection(null);
    setCursorDate((current) => {
      const next = new Date(current);
      if (view === "week") next.setDate(next.getDate() + direction * 7);
      if (view === "month") next.setMonth(next.getMonth() + direction, 1);
      if (view === "year") next.setFullYear(next.getFullYear() + direction, 0, 1);
      return next;
    });
  };

  const getSlotIndex = (clientX: number, element: HTMLDivElement) => Math.max(0, Math.min(slots.length - 1, Math.floor((clientX - element.getBoundingClientRect().left) / cellWidth)));
  const getDateAtPointer = (clientX: number, element: HTMLDivElement) => {
    const ratio = Math.max(0, Math.min(.999999, (clientX - element.getBoundingClientRect().left) / timelineWidth));
    const value = new Date(rangeStart.getTime() + ratio * (rangeEnd.getTime() - rangeStart.getTime()));
    setConfiguredTime(value, operatingTimes.checkIn);
    const earliest = new Date(Date.now() + 5 * 60_000);
    earliest.setSeconds(0, 0);
    if (isSameDay(value, earliest) && value < earliest) value.setTime(earliest.getTime());
    return { value, left: ratio * timelineWidth };
  };
  const finishSelection = (pointerEndIndex?: number) => {
    if (!selection) return;
    const endIndex = pointerEndIndex ?? selection.endIndex;
    const firstIndex = Math.min(selection.startIndex, endIndex);
    const lastIndex = Math.max(selection.startIndex, endIndex);
    const checkInDate = new Date(slots[firstIndex].start);
    const checkOutDate = new Date(
      firstIndex === lastIndex ? slots[lastIndex].end : slots[lastIndex].start,
    );
    setConfiguredTime(checkInDate, operatingTimes.checkIn);
    setConfiguredTime(checkOutDate, operatingTimes.checkOut);
    const earliestCheckIn = new Date(Date.now() + 5 * 60_000);
    earliestCheckIn.setSeconds(0, 0);
    if (isSameDay(checkInDate, earliestCheckIn) && checkInDate < earliestCheckIn) checkInDate.setTime(earliestCheckIn.getTime());
    if (checkInDate < new Date()) { toast.error("Không thể tạo đặt phòng trước thời gian hiện tại."); setSelection(null); return; }
    if (checkOutDate <= checkInDate) checkOutDate.setDate(checkOutDate.getDate() + 1);
    onEmptySlotClick(selection.roomId, checkInDate, checkOutDate);
    setSelection(null);
  };

  if (loading) return <div className="flex h-72 items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>;

  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="flex flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex overflow-hidden rounded-md border border-blue-600">
          {(["week", "month", "year"] as TimelineView[]).map((item) => (
            <Button key={item} type="button" variant="ghost" className={cn("h-8 rounded-none border-r border-blue-600 px-4 text-xs font-semibold text-blue-700 last:border-r-0 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-300", view === item && "bg-blue-600 text-white hover:bg-blue-700 hover:text-white")} onClick={() => { setView(item); setSelection(null); }}>
              {VIEW_LABELS[item]}
            </Button>
          ))}
        </div>
        <div className="flex items-center overflow-hidden rounded-md border border-blue-600">
          <Button type="button" size="icon-sm" variant="ghost" className="h-8 rounded-none bg-blue-600 text-white hover:bg-blue-700 hover:text-white" onClick={() => movePeriod(-1)} aria-label="Kỳ trước"><ChevronLeft className="size-4" /></Button>
          <Button type="button" variant="ghost" className="h-8 min-w-24 rounded-none border-x border-blue-600 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300" onClick={() => setCursorDate(new Date())}>Hôm nay</Button>
          <Button type="button" size="icon-sm" variant="ghost" className="h-8 rounded-none bg-blue-600 text-white hover:bg-blue-700 hover:text-white" onClick={() => movePeriod(1)} aria-label="Kỳ sau"><ChevronRight className="size-4" /></Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-slate-50/80 px-4 py-2 text-xs text-muted-foreground dark:bg-slate-900/60">
        <span className="font-semibold text-slate-700 dark:text-slate-200">{periodLabel}</span>
        <span>{canCreate ? "Kéo trên dòng phòng trống để tạo đặt phòng." : "Lịch phòng đang ở chế độ chỉ đọc."}</span>
      </div>

      <div className="max-h-[640px] overflow-auto select-none">
        <div style={{ minWidth: 156 + timelineWidth }}>
          <div className="sticky top-0 z-30 flex border-b bg-white shadow-sm dark:bg-slate-950">
            <div className="sticky left-0 z-40 flex h-[74px] w-[156px] shrink-0 items-center border-r bg-slate-100 px-4 text-xs font-bold text-slate-700 dark:bg-slate-900 dark:text-slate-200">Phòng</div>
            <div className="relative" style={{ width: timelineWidth }}>
              {view !== "year" && <div className="flex h-[30px] border-b bg-slate-50 dark:bg-slate-900">{monthGroups.map((group) => <div key={group.key} className="flex items-center justify-center border-r text-[11px] font-bold text-slate-600 dark:text-slate-300" style={{ width: group.count * cellWidth }}>{group.label}</div>)}</div>}
              <div className={cn("grid", view === "year" ? "h-[74px]" : "h-11")} style={{ gridTemplateColumns: `repeat(${slots.length}, ${cellWidth}px)` }}>
                {slots.map((slot) => <div key={slot.start.toISOString()} className={cn("flex flex-col items-center justify-center border-r text-[10px]", slot.isWeekend && "bg-slate-50 dark:bg-slate-900/70", slot.isToday && "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300")}><span className={cn("text-xs font-bold", slot.isToday && "flex size-6 items-center justify-center rounded bg-blue-600 text-white")}>{slot.label}</span><span className="text-[9px] text-muted-foreground">{slot.subLabel}</span></div>)}
              </div>
              {showNowMarker && <>
                <div className="pointer-events-none absolute inset-y-0 z-50 border-l border-dotted border-red-500" style={{ left: nowMarkerLeft }} />
                <div className="pointer-events-none absolute bottom-0 z-[51] -translate-x-1/2 rounded-sm bg-amber-500 px-1 py-0.5 text-[9px] font-bold leading-none text-white shadow-sm" style={{ left: nowMarkerLeft }}>
                  {now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                </div>
              </>}
            </div>
          </div>

          {rooms.length === 0 ? <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">Chưa có phòng để hiển thị.</div> : rooms.map((room) => {
            const roomBookings = bookings.filter((booking) => booking.roomId === room.id && VISIBLE_STATUSES.includes(booking.status) && new Date(booking.checkInDate) < rangeEnd && new Date(booking.checkOutDate) > rangeStart);
            const isBlocked = room.status === "MAINTENANCE";
            const roomSelection = selection?.roomId === room.id ? selection : null;
            const selectionStart = roomSelection ? Math.min(roomSelection.startIndex, roomSelection.endIndex) : 0;
            const selectionLength = roomSelection ? Math.abs(roomSelection.endIndex - roomSelection.startIndex) + 1 : 0;
            return <div key={room.id} className="flex h-12 border-b border-slate-200 bg-white hover:bg-blue-50/30 dark:border-slate-800 dark:bg-slate-950">
              <div className="sticky left-0 z-20 flex h-12 w-[156px] shrink-0 items-center border-r bg-white px-3 dark:bg-slate-950">
                <span className={cn("mr-2 size-2 rounded-full", room.status === "MAINTENANCE" ? "bg-amber-500" : room.status === "OCCUPIED" ? "bg-rose-500" : room.status === "DIRTY" ? "bg-slate-400" : "bg-emerald-500")} />
                <div className="min-w-0"><p className="truncate text-xs font-bold">{room.roomNumber}</p><p className="truncate text-[9px] text-muted-foreground">{room.roomType?.name || `Tầng ${room.floor ?? "-"}`}</p></div>
              </div>
              <div className={cn("relative h-12 touch-none overflow-hidden", isBlocked || !canCreate ? "cursor-default" : "cursor-crosshair")} style={{ width: timelineWidth }}
                onPointerDown={(event) => { if (isBlocked || !canCreate || event.button !== 0) return; const point = getDateAtPointer(event.clientX, event.currentTarget); if (point.value < new Date()) { toast.error("Không thể tạo đặt phòng trước thời gian hiện tại."); return; } const index = getSlotIndex(event.clientX, event.currentTarget); event.currentTarget.setPointerCapture(event.pointerId); setSelection({ roomId: room.id, startIndex: index, endIndex: index, dateTime: point.value }); }}
                onPointerMove={(event) => { const point = getDateAtPointer(event.clientX, event.currentTarget); setHoverTime({ roomId: room.id, ...point }); if (selection?.roomId === room.id && event.buttons === 1) setSelection({ ...selection, endIndex: getSlotIndex(event.clientX, event.currentTarget) }); }}
                onPointerUp={(event) => finishSelection(getSlotIndex(event.clientX, event.currentTarget))} onPointerCancel={() => setSelection(null)} onPointerLeave={() => setHoverTime(null)}>
                <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${slots.length}, ${cellWidth}px)` }}>{slots.map((slot) => <div key={slot.start.toISOString()} className={cn("border-r border-slate-200 dark:border-slate-800", slot.isWeekend && "bg-slate-50/80 dark:bg-slate-900/50", slot.isToday && "bg-blue-50/70 dark:bg-blue-950/20", isBlocked && "bg-amber-50 dark:bg-amber-950/20", slot.end <= now && "bg-slate-100/60 dark:bg-slate-900/60")} />)}</div>
                {showNowMarker && <div className="pointer-events-none absolute inset-y-0 z-30 border-l border-dotted border-red-500" style={{ left: nowMarkerLeft }} />}
                {hoverTime?.roomId === room.id && <div className="pointer-events-none absolute top-0 z-40 -translate-x-1/2 rounded bg-slate-900 px-1.5 py-0.5 text-[9px] font-semibold text-white shadow" style={{ left: hoverTime.left }}>{hoverTime.value.toLocaleDateString("vi-VN")}</div>}
                {roomSelection && <div className="pointer-events-none absolute inset-y-1.5 z-10 rounded-md border-2 border-dashed border-blue-500 bg-blue-200/40" style={{ left: selectionStart * cellWidth + 2, width: selectionLength * cellWidth - 4 }} />}
                {roomBookings.map((booking) => {
                  const bookingStart = Math.max(new Date(booking.checkInDate).getTime(), rangeStart.getTime());
                  const bookingEnd = Math.min(new Date(booking.checkOutDate).getTime(), rangeEnd.getTime());
                  const total = rangeEnd.getTime() - rangeStart.getTime();
                  const left = ((bookingStart - rangeStart.getTime()) / total) * timelineWidth;
                  const width = Math.max(24, ((bookingEnd - bookingStart) / total) * timelineWidth);
                  return <button key={booking.id} type="button" className={cn("absolute inset-y-[7px] z-20 flex items-center gap-1.5 overflow-hidden rounded-full border px-2 text-left text-[10px] font-semibold shadow-sm transition hover:z-30 hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500", getBookingStatusConfig(booking.status).timelineClass)} style={{ left: left + 2, width: Math.max(20, width - 4) }} onPointerDown={(e) => e.stopPropagation()} onPointerUp={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onBookingClick(booking.id); }} title={`${booking.customerName} · ${getBookingStatusConfig(booking.status).label}${booking.status === "NO_SHOW" ? ` · ${getOverdueLabel(booking.checkInDate)}` : ""}`}><CircleUserRound className="size-3 shrink-0" /><span className="truncate">{booking.customerName}</span></button>;
                })}
              </div>
            </div>;
          })}
        </div>
      </div>
    </div>
  );
}
