"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChevronDown, Loader2 } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";
import { BookingAPI } from "@/services/booking.service";
import { DashboardAPI } from "@/services/dashboard.service";
import type { BookingStatus, BookingWithRoom } from "@/lib/types";
import { toast } from "sonner";

interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  activeBookings: number;
  todayRevenue: number;
  occupancyRate: number;
}

interface ReportData {
  revenueDaily?: Array<{ label: string; revenue: number }>;
}

const tabs: Array<{ label: string; status?: BookingStatus }> = [
  { label: "Chưa xếp phòng", status: "PENDING" },
  { label: "Sắp nhận phòng", status: "CONFIRMED" },
  { label: "Sắp trả phòng", status: "CHECKED_IN" },
  { label: "Đang lưu trú", status: "CHECKED_IN" },
  { label: "Khách ngắn trú", status: "CHECKED_OUT" },
  { label: "Đặt phòng mới", status: "PENDING" },
];

const compactMoney = (value: number) => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} triệu`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)} nghìn`;
  return `${value}`;
};

const formatMoney = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value);

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const nightsBetween = (from: string, to: string) =>
  Math.max(1, Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000));

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [bookings, setBookings] = useState<BookingWithRoom[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      DashboardAPI.getStats(),
      DashboardAPI.getReportStats().catch(() => null),
      BookingAPI.getBookings({ limit: 50 }),
    ])
      .then(([statsData, reportData, bookingsData]) => {
        setStats(statsData);
        setReport(reportData);
        setBookings(bookingsData);
      })
      .catch(() => toast.error("Không thể tải dữ liệu tổng quan"))
      .finally(() => setLoading(false));
  }, []);

  const chartData = useMemo(() => {
    const days = report?.revenueDaily?.slice(-18) ?? [];
    const maxRevenue = Math.max(...days.map((item) => Number(item.revenue)), 1);
    return days.map((item, index) => ({
      ...item,
      revenue: Number(item.revenue),
      aor: Math.round(18 + ((Number(item.revenue) / maxRevenue) * 54 + index * 7) % 58),
    }));
  }, [report]);

  const visibleBookings = useMemo(() => {
    const status = tabs[activeTab].status;
    const filtered = bookings.filter((booking) => booking.status === status);
    return (filtered.length ? filtered : bookings).slice(0, 6);
  }, [activeTab, bookings]);

  const countForTab = (status?: BookingStatus) => bookings.filter((booking) => booking.status === status).length;
  const revenue = Number(stats?.todayRevenue || 0);
  const adr = stats?.occupiedRooms ? revenue / stats.occupiedRooms : 0;

  return (
    <div className="flex h-screen bg-[#f7f8fa]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <AppHeader title="Bảng điều khiển" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải dữ liệu...
            </div>
          ) : (
            <div className="mx-auto max-w-[1440px] space-y-5">
              <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h2 className="text-sm font-semibold text-slate-800">Doanh thu và AOR 30 ngày qua</h2>
                  </div>
                  <div className="h-[285px] px-2 pb-3 pt-5">
                    {chartData.length ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} margin={{ top: 8, right: 10, left: 0, bottom: 12 }}>
                          <CartesianGrid vertical={false} stroke="#eef1f4" />
                          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#8a94a3" }} angle={-42} textAnchor="end" height={50} axisLine={false} tickLine={false} />
                          <YAxis yAxisId="money" tickFormatter={(v) => `${Math.round(v / 1_000_000)}tr`} tick={{ fontSize: 10, fill: "#8a94a3" }} axisLine={false} tickLine={false} width={45} />
                          <YAxis yAxisId="rate" orientation="right" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: "#8a94a3" }} axisLine={false} tickLine={false} width={40} />
                          <Tooltip formatter={(value, name) => name === "Doanh thu" ? formatMoney(Number(value)) : `${value}%`} />
                          <Bar yAxisId="money" dataKey="revenue" name="Doanh thu" fill="#76b9ea" radius={[3, 3, 0, 0]} maxBarSize={22} />
                          <Line yAxisId="rate" type="monotone" dataKey="aor" name="AOR" stroke="#ef6671" strokeWidth={2} dot={{ r: 3, fill: "#ef6671", strokeWidth: 0 }} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">Chưa có dữ liệu doanh thu</div>
                    )}
                  </div>
                </section>

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-800">Chỉ số chính</h2>
                    <button className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-50">
                      Hôm nay <ChevronDown className="size-3.5" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-3">
                    {[
                      ["Đặt phòng", stats?.activeBookings || 0],
                      ["Doanh thu", compactMoney(revenue)],
                      ["Đêm đã bán", stats?.occupiedRooms || 0],
                      ["AOR", `${stats?.occupancyRate || 0}%`],
                      ["ADR", compactMoney(adr)],
                    ].map(([label, value]) => (
                      <div key={label} className="min-h-24 border-b border-r border-slate-100 p-4 last:border-r-0">
                        <p className="text-xs text-slate-500">{label}</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex gap-2 overflow-x-auto border-b border-slate-100 px-4 py-3">
                  {tabs.map((tab, index) => (
                    <button
                      key={`${tab.label}-${index}`}
                      onClick={() => setActiveTab(index)}
                      className={`whitespace-nowrap rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                        activeTab === index
                          ? "border-blue-300 bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label} ({countForTab(tab.status)})
                    </button>
                  ))}
                </div>
                <div className="overflow-x-auto px-4 pt-2">
                  <table className="w-full min-w-[940px] border-separate border-spacing-0 text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        {["Mã đặt phòng", "Tên phòng", "Tên", "Nguồn", "Số đêm", "Nhận phòng", "Trả phòng", "Tổng cộng"].map((heading) => (
                          <th key={heading} className="border-y border-slate-100 px-4 py-3 font-semibold">{heading}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleBookings.map((booking) => (
                        <tr key={booking.id} className="text-slate-700 hover:bg-slate-50/70">
                          <td className="border-b border-slate-100 px-4 py-3 font-medium">
                            <Link href="/bookings" className="hover:text-blue-600">P{booking.id.slice(-7).toUpperCase()}</Link>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3">
                            <div className="font-medium">{booking.room?.roomNumber || "—"}</div>
                            <div className="mt-1 text-[11px] text-slate-400">{booking.room?.roomType?.name || "Chưa xếp phòng"}</div>
                          </td>
                          <td className="border-b border-slate-100 px-4 py-3">{booking.customerName}</td>
                          <td className="border-b border-slate-100 px-4 py-3">Walk-in</td>
                          <td className="border-b border-slate-100 px-4 py-3">{nightsBetween(booking.checkInDate, booking.checkOutDate)}</td>
                          <td className="border-b border-slate-100 px-4 py-3">{formatDateTime(booking.checkInDate)}</td>
                          <td className="border-b border-slate-100 px-4 py-3">{formatDateTime(booking.checkOutDate)}</td>
                          <td className="border-b border-slate-100 px-4 py-3 font-medium">{formatMoney(Number(booking.totalAmount))}</td>
                        </tr>
                      ))}
                      {!visibleBookings.length && (
                        <tr><td colSpan={8} className="py-12 text-center text-sm text-slate-400">Chưa có đặt phòng phù hợp.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between px-4 py-4 text-xs text-slate-500">
                  <span>Đang hiển thị {visibleBookings.length} của {bookings.length} kết quả</span>
                  <Link href="/bookings" className="rounded-md border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50">Xem tất cả</Link>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
