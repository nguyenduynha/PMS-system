import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25 border-amber-500/20",
  },
  CONFIRMED: {
    label: "Confirmed",
    className: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20",
  },
  BOOKED: {
    label: "Booked",
    className: "bg-blue-500/15 text-blue-700 hover:bg-blue-500/25 border-blue-500/20",
  },
  EXPECTED_ARRIVAL: {
    label: "Expected Arrival",
    className: "bg-violet-500/15 text-violet-700 hover:bg-violet-500/25 border-violet-500/20",
  },
  NO_SHOW: {
    label: "No Show",
    className: "bg-fuchsia-500/15 text-fuchsia-700 hover:bg-fuchsia-500/25 border-fuchsia-500/20",
  },
  CHECKED_IN: {
    label: "Checked In",
    className: "bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-500/20",
  },
  CHECKED_OUT: {
    label: "Checked Out",
    className: "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-500/15 text-red-700 hover:bg-red-500/25 border-red-500/20",
  },
};

interface BookingStatusBadgeProps {
  status: string;
  className?: string;
}

export function BookingStatusBadge({ status, className }: BookingStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status || "Unknown",
    className: "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25 border-slate-500/20",
  };
  return (
    <Badge variant="default" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
