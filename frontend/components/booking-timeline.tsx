"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TimelineView = "day" | "week" | "month";

type TimelineRoom = {
  id: string;
  roomNumber: string;
  floor?: number | null;
  status: string;
  roomType?: { name?: string };
};

type TimelineBooking = {
  id: string;
  roomId: string;
  customerName: string;
  customerPhone?: string;
  checkInDate: string;
  checkOutDate: string;
  status: string;
};

type TimelineSlot = {
  start: Date;
  end: Date;
  label: string;
  subLabel: string;
  isToday: boolean;
  isWeekend: boolean;
};

type DragSelection = {
  roomId: string;
  startIndex: number;
  endIndex: number;
};

type BookingTimelineProps = {
  bookings: TimelineBooking[];
  rooms: TimelineRoom[];
  loading: boolean;
  canCreate?: boolean;
  onCreate: (roomId: string, checkInDate: Date, checkOutDate: Date) => void;
  onBookingClick: (booking: TimelineBooking) => void;
};

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "CHECKED_IN", "CHECKED_OUT"];

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function addHours(value: Date, amount: number) {
  const date = new Date(value);
  date.setHours(date.getHours() + amount);
  return date;
}

function startOfWeek(value: Date) {
  const date = startOfDay(value);
  const day = date.getDay();
  return addDays(date, day === 0 ? -6 : 1 - day);
}

function startOfMonth(value: Date) {
  const date = startOfDay(value);
  date.setDate(1);
  return date;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusStyle(status: string) {
  if (status === "PENDING") return "border-amber-300 bg-amber-500 text-white";
  if (status === "CONFIRMED") return "border-blue-400 bg-blue-600 text-white";
  if (status === "CHECKED_IN") return "border-emerald-400 bg-emerald-600 text-white";
  return "border-slate-300 bg-slate-500 text-white";
}

function getStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CHECKED_IN") return "Đang ở";
  return "Đã trả phòng";
}

function getRoomStatusLabel(status: string) {
  if (status === "AVAILABLE") return "Sẵn sàng";
  if (status === "OCCUPIED") return "Có khách";
  if (status === "DIRTY") return "Chưa dọn";
  if (status === "MAINTENANCE") return "Bảo trì";
  return status;
}

export function BookingTimeline({
  bookings,
  rooms,
  loading,
  canCreate = true,
  onCreate,
  onBookingClick,
}: BookingTimelineProps) {
  const [view, setView] = useState<TimelineView>("week");
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [selection, setSelection] = useState<DragSelection | null>(null);

  const slots = useMemo<TimelineSlot[]>(() => {
    const today = new Date();

    if (view === "day") {
      const rangeStart = startOfDay(cursorDate);
      return Array.from({ length: 24 }, (_, index) => {
        const start = addHours(rangeStart, index);
        return {
          start,
          end: addHours(start, 1),
          label: `${String(index).padStart(2, "0")}:00`,
          subLabel: index === 0 ? "Đầu ngày" : "",
          isToday: isSameDay(start, today),
          isWeekend: false,
        };
      });
    }

    const rangeStart = view === "week" ? startOfWeek(cursorDate) : startOfMonth(cursorDate);
    const slotCount =
      view === "week"
        ? 7
        : new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 0).getDate();

    return Array.from({ length: slotCount }, (_, index) => {
      const start = addDays(rangeStart, index);
      const weekday = capitalize(
        new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(start),
      );
      return {
        start,
        end: addDays(start, 1),
        label: view === "week" ? weekday : String(start.getDate()).padStart(2, "0"),
        subLabel:
          view === "week"
            ? new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(start)
            : weekday,
        isToday: isSameDay(start, today),
        isWeekend: start.getDay() === 0 || start.getDay() === 6,
      };
    });
  }, [cursorDate, view]);

  const rangeStart = slots[0]?.start;
  const rangeEnd = slots[slots.length - 1]?.end;
  const cellWidth = view === "day" ? 68 : view === "week" ? 150 : 64;
  const timelineWidth = slots.length * cellWidth;

  const periodLabel = useMemo(() => {
    if (!rangeStart || !rangeEnd) return "";
    const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (view === "day") return dateFormatter.format(rangeStart);
    if (view === "month") {
      return capitalize(
        new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(rangeStart),
      );
    }
    return `${dateFormatter.format(rangeStart)} - ${dateFormatter.format(addDays(rangeEnd, -1))}`;
  }, [rangeEnd, rangeStart, view]);

  const movePeriod = (direction: -1 | 1) => {
    setSelection(null);
    setCursorDate((current) => {
      const next = new Date(current);
      if (view === "day") next.setDate(next.getDate() + direction);
      if (view === "week") next.setDate(next.getDate() + direction * 7);
      if (view === "month") next.setMonth(next.getMonth() + direction, 1);
      return next;
    });
  };

  const getSlotIndex = (clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    return Math.max(0, Math.min(slots.length - 1, Math.floor((clientX - rect.left) / cellWidth)));
  };

  const finishSelection = () => {
    if (!selection) return;
    const firstIndex = Math.min(selection.startIndex, selection.endIndex);
    const lastIndex = Math.max(selection.startIndex, selection.endIndex);
    const start = new Date(slots[firstIndex].start);
    const end = new Date(slots[lastIndex].end);

    if (view !== "day") {
      start.setHours(14, 0, 0, 0);
      end.setHours(12, 0, 0, 0);
    }

    onCreate(selection.roomId, start, end);
    setSelection(null);
  };

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 px-5 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-lg border bg-muted/40 p-1">
            {(["day", "week", "month"] as TimelineView[]).map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={view === item ? "default" : "ghost"}
                className="h-7 px-3"
                onClick={() => {
                  setView(item);
                  setSelection(null);
                }}
              >
                {item === "day" ? "Ngày" : item === "week" ? "Tuần" : "Tháng"}
              </Button>
            ))}
          </div>

          <div className="flex items-center rounded-lg border">
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => movePeriod(-1)} aria-label="Kỳ trước">
              <ChevronLeft />
            </Button>
            <div className="min-w-44 px-2 text-center text-sm font-semibold">{periodLabel}</div>
            <Button type="button" size="icon-sm" variant="ghost" onClick={() => movePeriod(1)} aria-label="Kỳ sau">
              <ChevronRight />
            </Button>
          </div>

          <Button type="button" size="sm" variant="outline" onClick={() => setCursorDate(new Date())}>
            <CalendarDays />
            Hôm nay
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {[
            ["bg-amber-500", "Chờ xác nhận"],
            ["bg-blue-600", "Đã xác nhận"],
            ["bg-emerald-600", "Đang ở"],
            ["bg-slate-500", "Đã trả phòng"],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className={cn("size-2.5 rounded-full", color)} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 text-xs text-muted-foreground">
        {canCreate
          ? "Kéo chuột trên dòng phòng trống để chọn thời gian và tạo đặt phòng."
          : "Bạn đang xem lịch phòng ở chế độ chỉ đọc."}
      </div>

      <div className="max-h-[620px] overflow-auto border-y select-none">
        <div style={{ minWidth: 200 + timelineWidth }}>
          <div className="sticky top-0 z-30 flex border-b bg-background shadow-sm">
            <div className="sticky left-0 z-40 flex h-16 w-[200px] shrink-0 items-center border-r bg-muted/70 px-4 text-sm font-semibold">
              Phòng / Loại phòng
            </div>
            <div className="grid h-16" style={{ width: timelineWidth, gridTemplateColumns: `repeat(${slots.length}, ${cellWidth}px)` }}>
              {slots.map((slot) => (
                <div
                  key={slot.start.toISOString()}
                  className={cn(
                    "flex flex-col items-center justify-center border-r text-xs",
                    slot.isWeekend && "bg-muted/40",
                    slot.isToday && "bg-primary/10 text-primary",
                  )}
                >
                  <span className={cn("font-semibold", slot.isToday && "rounded-full bg-primary px-2 py-0.5 text-primary-foreground")}>
                    {slot.label}
                  </span>
                  <span className="mt-1 text-[10px] text-muted-foreground">{slot.subLabel}</span>
                </div>
              ))}
            </div>
          </div>

          {rooms.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
              Chưa có phòng để hiển thị.
            </div>
          ) : (
            rooms.map((room) => {
              const roomBookings = bookings.filter((booking) => {
                if (booking.roomId !== room.id || !ACTIVE_STATUSES.includes(booking.status)) return false;
                const bookingStart = new Date(booking.checkInDate);
                const bookingEnd = new Date(booking.checkOutDate);
                return bookingStart < rangeEnd && bookingEnd > rangeStart;
              });
              const isBlocked = room.status === "MAINTENANCE" || room.status === "DIRTY";
              const roomSelection = selection?.roomId === room.id ? selection : null;
              const selectionStart = roomSelection ? Math.min(roomSelection.startIndex, roomSelection.endIndex) : 0;
              const selectionLength = roomSelection ? Math.abs(roomSelection.endIndex - roomSelection.startIndex) + 1 : 0;

              return (
                <div key={room.id} className="flex border-b last:border-b-0">
                  <div className="sticky left-0 z-20 flex h-[70px] w-[200px] shrink-0 items-center justify-between gap-2 border-r bg-background px-4 shadow-[3px_0_6px_-5px_rgba(0,0,0,0.35)]">
                    <div className="min-w-0">
                      <p className="font-semibold">Phòng {room.roomNumber}</p>
                      <p className="truncate text-xs text-muted-foreground">{room.roomType?.name || "Chưa phân loại"}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0 px-1.5 text-[9px]">
                      {getRoomStatusLabel(room.status)}
                    </Badge>
                  </div>

                  <div
                    className={cn("relative h-[70px] touch-none", isBlocked || !canCreate ? "cursor-default" : "cursor-crosshair")}
                    style={{ width: timelineWidth }}
                    onPointerDown={(event) => {
                      if (isBlocked || !canCreate || event.button !== 0) return;
                      const index = getSlotIndex(event.clientX, event.currentTarget);
                      setSelection({ roomId: room.id, startIndex: index, endIndex: index });
                    }}
                    onPointerMove={(event) => {
                      if (!selection || selection.roomId !== room.id || event.buttons !== 1) return;
                      const index = getSlotIndex(event.clientX, event.currentTarget);
                      if (index !== selection.endIndex) setSelection({ ...selection, endIndex: index });
                    }}
                    onPointerUp={finishSelection}
                    onPointerCancel={() => setSelection(null)}
                  >
                    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${slots.length}, ${cellWidth}px)` }}>
                      {slots.map((slot) => (
                        <div
                          key={slot.start.toISOString()}
                          className={cn(
                            "border-r",
                            slot.isWeekend && "bg-muted/30",
                            slot.isToday && "bg-primary/5",
                            isBlocked && "bg-zinc-200/50 dark:bg-zinc-800/50",
                          )}
                        />
                      ))}
                    </div>

                    {roomSelection && (
                      <div
                        className="pointer-events-none absolute inset-y-2 z-10 rounded-md border-2 border-dashed border-primary bg-primary/15"
                        style={{ left: selectionStart * cellWidth + 2, width: selectionLength * cellWidth - 4 }}
                      />
                    )}

                    {roomBookings.map((booking) => {
                      const bookingStart = Math.max(new Date(booking.checkInDate).getTime(), rangeStart.getTime());
                      const bookingEnd = Math.min(new Date(booking.checkOutDate).getTime(), rangeEnd.getTime());
                      const totalDuration = rangeEnd.getTime() - rangeStart.getTime();
                      const left = ((bookingStart - rangeStart.getTime()) / totalDuration) * timelineWidth;
                      const width = Math.max(20, ((bookingEnd - bookingStart) / totalDuration) * timelineWidth);

                      return (
                        <button
                          key={booking.id}
                          type="button"
                          className={cn(
                            "absolute inset-y-2 z-20 overflow-hidden rounded-md border px-2 text-left text-xs shadow-sm transition hover:z-30 hover:brightness-105 focus-visible:z-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            getStatusStyle(booking.status),
                          )}
                          style={{ left: left + 2, width: Math.max(16, width - 4) }}
                          onPointerDown={(event) => event.stopPropagation()}
                          onClick={() => onBookingClick(booking)}
                          title={`${booking.customerName} - ${getStatusLabel(booking.status)}`}
                        >
                          <span className="block truncate font-semibold">{booking.customerName}</span>
                          <span className="block truncate text-[10px] opacity-90">{getStatusLabel(booking.status)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
