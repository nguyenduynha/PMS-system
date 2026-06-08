"use client";

import type { RoomWithType, RoomStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RoomStatusBadge } from "@/components/room-status-badge";

interface RoomGridProps {
  rooms: RoomWithType[];
  onRoomClick?: (room: RoomWithType) => void;
}

const statusColors: Record<RoomStatus, string> = {
  AVAILABLE: "bg-emerald-500 hover:bg-emerald-600",
  OCCUPIED: "bg-blue-500 hover:bg-blue-600",
  DIRTY: "bg-amber-500 hover:bg-amber-600",
  MAINTENANCE: "bg-red-500 hover:bg-red-600",
};

export function RoomGrid({ rooms, onRoomClick }: RoomGridProps) {
  // Group rooms by floor
  const roomsByFloor = rooms.reduce(
    (acc, room) => {
      if (!acc[room.floor]) {
        acc[room.floor] = [];
      }
      acc[room.floor].push(room);
      return acc;
    },
    {} as Record<number, RoomWithType[]>
  );

  const floors = Object.keys(roomsByFloor)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Room Status Overview</CardTitle>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-emerald-500" />
              <span className="text-muted-foreground">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-blue-500" />
              <span className="text-muted-foreground">Occupied</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-amber-500" />
              <span className="text-muted-foreground">Dirty</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-3 rounded bg-red-500" />
              <span className="text-muted-foreground">Maintenance</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="space-y-4">
            {floors.map((floor) => (
              <div key={floor} className="flex items-center gap-4">
                <div className="w-16 shrink-0 text-sm font-medium text-muted-foreground">
                  Floor {floor}
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomsByFloor[floor]
                    .sort((a, b) => a.roomNumber.localeCompare(b.roomNumber))
                    .map((room) => (
                      <Tooltip key={room.id}>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            onClick={() => onRoomClick?.(room)}
                            className={cn(
                              "flex size-12 items-center justify-center rounded-lg text-xs font-semibold text-white transition-colors",
                              statusColors[room.status],
                              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            )}
                          >
                            {room.roomNumber}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="p-0">
                          <div className="p-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold">Room {room.roomNumber}</span>
                              <RoomStatusBadge status={room.status} />
                            </div>
                            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                              <div>Type: {room.roomType.name}</div>
                              <div>${room.roomType.pricePerNight}/night</div>
                              <div>Capacity: {room.roomType.capacity} guests</div>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
