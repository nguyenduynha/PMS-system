"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  CalendarDays,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  LogOut,
} from "lucide-react";

const bookings = [
  {
    id: 1,
    code: "BK-001",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    roomNumber: "101",
    roomType: "Deluxe",
    checkIn: "01/06/2026",
    checkOut: "03/06/2026",
    guests: 2,
    source: "Walk-in",
    total: 1200000,
    status: "CONFIRMED",
  },
  {
    id: 2,
    code: "BK-002",
    customerName: "Trần Thị B",
    phone: "0908888888",
    roomNumber: "203",
    roomType: "Family",
    checkIn: "02/06/2026",
    checkOut: "04/06/2026",
    guests: 4,
    source: "Booking.com",
    total: 1800000,
    status: "CHECKED_IN",
  },
  {
    id: 3,
    code: "BK-003",
    customerName: "Lê Văn C",
    phone: "0912345678",
    roomNumber: "305",
    roomType: "Suite",
    checkIn: "04/06/2026",
    checkOut: "06/06/2026",
    guests: 2,
    source: "Agoda",
    total: 2400000,
    status: "PENDING",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function getStatusLabel(status: string) {
  if (status === "PENDING") return "Chờ xác nhận";
  if (status === "CONFIRMED") return "Đã xác nhận";
  if (status === "CHECKED_IN") return "Đã nhận phòng";
  if (status === "CHECKED_OUT") return "Đã trả phòng";
  if (status === "CANCELLED") return "Đã hủy";
  return status;
}

function getStatusClass(status: string) {
  if (status === "PENDING") return "bg-amber-100 text-amber-700";
  if (status === "CONFIRMED") return "bg-blue-100 text-blue-700";
  if (status === "CHECKED_IN") return "bg-green-100 text-green-700";
  if (status === "CHECKED_OUT") return "bg-gray-100 text-gray-700";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-muted text-muted-foreground";
}

export default function BookingsPage() {
    const [openBookingDialog, setOpenBookingDialog] = useState(false);
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const checkedInBookings = bookings.filter(
    (b) => b.status === "CHECKED_IN"
  ).length;
  const totalRevenue = bookings.reduce((sum, b) => sum + b.total, 0);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Đặt phòng"
          subtitle="Quản lý đặt phòng, nhận phòng và trả phòng"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quản lý đặt phòng</h2>
              <p className="text-sm text-muted-foreground">
                Theo dõi danh sách đặt phòng và trạng thái lưu trú của khách hàng
              </p>
            </div>

            <Button onClick={() => setOpenBookingDialog(true)}>
  <Plus className="mr-2 size-4" />
  Tạo đặt phòng
</Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 p-3">
                  <CalendarDays className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đặt phòng</p>
                  <h3 className="text-2xl font-bold">{totalBookings}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-amber-100 p-3">
                  <Clock className="size-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chờ xác nhận</p>
                  <h3 className="text-2xl font-bold">{pendingBookings}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="size-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đang lưu trú</p>
                  <h3 className="text-2xl font-bold">{checkedInBookings}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-purple-100 p-3">
                  <CalendarDays className="size-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
                  <h3 className="text-xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách đặt phòng</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">Mã đặt phòng</th>
                    <th className="p-4 text-left">Khách hàng</th>
                    <th className="p-4 text-left">Phòng</th>
                    <th className="p-4 text-left">Thời gian</th>
                    <th className="p-4 text-left">Số khách</th>
                    <th className="p-4 text-left">Nguồn</th>
                    <th className="p-4 text-left">Tổng tiền</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b hover:bg-muted/40">
                      <td className="p-4 font-medium">{booking.code}</td>

                      <td className="p-4">
                        <p className="font-medium">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.phone}
                        </p>
                      </td>

                      <td className="p-4">
                        <Badge variant="outline">
                          Phòng {booking.roomNumber}
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {booking.roomType}
                        </p>
                      </td>

                      <td className="p-4">
                        <p>{booking.checkIn}</p>
                        <p className="text-xs text-muted-foreground">
                          đến {booking.checkOut}
                        </p>
                      </td>

                      <td className="p-4">{booking.guests} khách</td>

                      <td className="p-4">{booking.source}</td>

                      <td className="p-4 font-semibold">
                        {formatCurrency(booking.total)}
                      </td>

                      <td className="p-4">
                        <Badge className={getStatusClass(booking.status)}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 size-4" />
                            Xem
                          </Button>

                          <Button variant="outline" size="sm">
                            <LogIn className="mr-1 size-4" />
                            Nhận
                          </Button>

                          <Button variant="outline" size="sm">
                            <LogOut className="mr-1 size-4" />
                            Trả
                          </Button>

                          <Button variant="destructive" size="sm">
                            <XCircle className="mr-1 size-4" />
                            Hủy
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

        <Dialog
  open={openBookingDialog}
  onOpenChange={setOpenBookingDialog}
>
  <DialogContent className="sm:max-w-[650px]">
    <DialogHeader>
      <DialogTitle>Tạo đặt phòng mới</DialogTitle>
    </DialogHeader>

    <div className="grid gap-4 py-4">
      <div>
        <Label>Họ tên khách hàng</Label>
        <Input placeholder="Nguyễn Văn A" />
      </div>

      <div>
        <Label>Số điện thoại</Label>
        <Input placeholder="0901234567" />
      </div>

      <div>
        <Label>Email</Label>
        <Input placeholder="example@gmail.com" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Ngày nhận phòng</Label>
          <Input type="date" />
        </div>

        <div>
          <Label>Ngày trả phòng</Label>
          <Input type="date" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Số khách</Label>
          <Input type="number" min="1" />
        </div>

        <div>
          <Label>Số phòng</Label>
          <Input placeholder="101" />
        </div>
      </div>

      <div>
  <Label>Nguồn đặt phòng</Label>
  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Chọn nguồn đặt phòng" />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="walkin">Walk-in</SelectItem>
      <SelectItem value="website">Website</SelectItem>
      <SelectItem value="booking">Booking.com</SelectItem>
      <SelectItem value="agoda">Agoda</SelectItem>
      <SelectItem value="airbnb">Airbnb</SelectItem>
      <SelectItem value="traveloka">Traveloka</SelectItem>
      <SelectItem value="expedia">Expedia</SelectItem>
    </SelectContent>
  </Select>
</div>

      <div>
        <Label>Ghi chú</Label>
        <Input placeholder="Yêu cầu đặc biệt..." />
      </div>
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setOpenBookingDialog(false)}
      >
        Hủy
      </Button>

      <Button
        onClick={() => {
          alert("Đặt phòng thành công");
          setOpenBookingDialog(false);
        }}
      >
        Lưu đặt phòng
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
        </main>
      </div>
    </div>
  );
}