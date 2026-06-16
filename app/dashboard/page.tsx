import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { StatsCard } from "@/components/stats-card";
import { RoomGrid } from "@/components/room-grid";
import { RecentBookingsTable } from "@/components/recent-bookings-table";
import { QuickActions } from "@/components/quick-actions";
import { getRoomsWithTypes } from "@/lib/services/roomService";
import { getAllBookings } from "@/lib/services/bookingService";
import { getDashboardStats } from "@/lib/services/invoiceService";
import {
  BedDouble,
  Users,
  TrendingUp,
  AlertCircle,
  Banknote,
  CalendarCheck,
} from "lucide-react";

// ─── Helper: định dạng tiền VND ──────────────────────────────────────────────
function formatVND(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)} triệu`;
  }
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

// ─── Dashboard (Server Component – lấy data trực tiếp từ DB) ─────────────────
export default async function TrangTongQuan() {
  const [stats, phongs, datPhongs] = await Promise.all([
    getDashboardStats(),
    getRoomsWithTypes(),
    getAllBookings(),
  ]);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Tổng quan"
          subtitle="Chào mừng trở lại! Đây là tổng quan hoạt động khách sạn hôm nay."
        />

        <main className="flex-1 overflow-y-auto p-6">
          {/* ── Thẻ thống kê chính ── */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Tổng số phòng"
              value={stats.totalRooms}
              subtitle={`${stats.availableRooms} phòng trống`}
              icon={BedDouble}
              variant="default"
            />
            <StatsCard
              title="Tỷ lệ lấp đầy"
              value={`${stats.occupancyRate}%`}
              subtitle={`${stats.occupiedRooms} phòng đang sử dụng`}
              icon={TrendingUp}
              trend={{ value: 8, isPositive: true }}
              variant="info"
            />
            <StatsCard
              title="Khách đang lưu trú"
              value={stats.activeBookings}
              subtitle="Đặt phòng đang hoạt động"
              icon={Users}
              variant="success"
            />
            <StatsCard
              title="Doanh thu hôm nay"
              value={
                stats.todayRevenue > 0
                  ? formatVND(stats.todayRevenue)
                  : "0đ"
              }
              subtitle={
                stats.todayInvoices > 0
                  ? `${stats.todayInvoices} hóa đơn đã thanh toán`
                  : "Chưa có hóa đơn hôm nay"
              }
              icon={Banknote}
              trend={
                stats.todayRevenue > 0
                  ? { value: 12, isPositive: true }
                  : undefined
              }
              variant="success"
            />
          </div>

          {/* ── Doanh thu tháng ── */}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <CalendarCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Doanh thu tháng {new Date().getMonth() + 1}/
                    {new Date().getFullYear()}
                  </p>
                  <p className="text-2xl font-bold text-emerald-800">
                    {stats.monthlyRevenue > 0
                      ? formatVND(stats.monthlyRevenue)
                      : "0đ"}
                  </p>
                  {stats.monthlyInvoices > 0 && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {stats.monthlyInvoices} hóa đơn trong tháng
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl border bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BedDouble className="size-5" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tình trạng phòng</p>
                  <div className="mt-1 flex gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-emerald-500" />
                      Trống: {stats.availableRooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-red-500" />
                      Đang dùng: {stats.occupiedRooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-amber-500" />
                      Cần dọn: {stats.dirtyRooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block size-2 rounded-full bg-gray-400" />
                      Bảo trì: {stats.maintenanceRooms}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Cảnh báo dọn phòng / bảo trì ── */}
          {(stats.dirtyRooms > 0 || stats.maintenanceRooms > 0) && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="size-5 shrink-0 text-amber-600" />
              <p className="text-sm">
                <span className="font-semibold text-amber-700">
                  Cần chú ý:{" "}
                </span>
                <span className="text-amber-600">
                  {stats.dirtyRooms > 0 &&
                    `${stats.dirtyRooms} phòng cần dọn dẹp`}
                  {stats.dirtyRooms > 0 && stats.maintenanceRooms > 0 && ", "}
                  {stats.maintenanceRooms > 0 &&
                    `${stats.maintenanceRooms} phòng đang bảo trì`}
                </span>
              </p>
            </div>
          )}

          {/* ── Lưới phòng & Thao tác nhanh ── */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RoomGrid rooms={phongs} />
            </div>
            <div>
              <QuickActions />
            </div>
          </div>

          {/* ── Đặt phòng gần đây ── */}
          <div className="mt-6">
            <RecentBookingsTable bookings={datPhongs} />
          </div>
        </main>
      </div>
    </div>
  );
}
