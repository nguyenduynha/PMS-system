import type { RoomStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<
  RoomStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  AVAILABLE: {
    label: "Phòng trống",
    variant: "default",
    className: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20",
  },
  OCCUPIED: {
    label: "Đang sử dụng",
    variant: "default",
    className: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20",
  },
  DIRTY: {
    label: "Phòng bẩn",
    variant: "destructive",
    className: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20",
  },
  MAINTENANCE: {
    label: "Bảo trì",
    variant: "destructive",
    className: "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20",
  },
};

interface RoomStatusBadgeProps {
  status: RoomStatus;
  className?: string;
}

export function RoomStatusBadge({ status, className }: RoomStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
