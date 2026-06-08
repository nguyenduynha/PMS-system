import type { BookingWithRoom } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface RecentBookingsTableProps {
  bookings: BookingWithRoom[];
}

export function RecentBookingsTable({ bookings }: RecentBookingsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/bookings" className="gap-1 text-xs">
            View All
            <ArrowRight className="size-3" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Guest</TableHead>
              <TableHead>Room</TableHead>
              <TableHead className="hidden sm:table-cell">Check-in</TableHead>
              <TableHead className="hidden md:table-cell">Check-out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.slice(0, 5).map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.customerName}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.customerPhone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{booking.room.roomNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {booking.room.roomType.name}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {format(new Date(booking.checkInDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {format(new Date(booking.checkOutDate), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  <BookingStatusBadge status={booking.status} />
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${booking.totalAmount.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
