"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DashboardAPI } from "@/services/dashboard.service";
import { FinanceAPI } from "@/services/finance.service";
import { BookingAPI } from "@/services/booking.service";
import { RoomAPI } from "@/services/room.service";
import { EMPTY_HOTEL_PROFILE, HotelProfile, HotelProfileAPI } from "@/services/hotel-profile.service";
import { buildBookingReportRows, exportBookingReportExcel, exportBookingReportPdf, formatReportMoney } from "@/lib/booking-report";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  Hotel,
  TrendingUp,
  Users,
  Loader2,
  Calendar,
  Filter,
  Download,
} from "lucide-react";

// Ánh xạ các icon
const iconMap: Record<string, React.ElementType> = {
  DollarSign,
  CalendarCheck,
  Hotel,
  Users,
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [bookingSources, setBookingSources] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [hotelProfile, setHotelProfile] = useState<HotelProfile>(EMPTY_HOTEL_PROFILE);
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("monthly");

  // State cho Modal Dashboard Chi tiết
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailViewMode, setDetailViewMode] = useState<"daily" | "monthly">("daily");
  const [detailStartDate, setDetailStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [detailEndDate, setDetailEndDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailTransactions, setDetailTransactions] = useState<any[]>([]);
  const [reportBookings, setReportBookings] = useState<any[]>([]);
  const [reportRooms, setReportRooms] = useState<any[]>([]);
  const [reportStatus, setReportStatus] = useState("ALL");
  const [reportSource, setReportSource] = useState("ALL");
  const [reportRoomType, setReportRoomType] = useState("ALL");
  const [reportRoom, setReportRoom] = useState("ALL");
  const [reportUser, setReportUser] = useState("ALL");
  const [exporting, setExporting] = useState<"excel" | "pdf" | null>(null);

  const loadReportData = async () => {
    try {
      const [data, profile] = await Promise.all([DashboardAPI.getReportStats(), HotelProfileAPI.get()]);
      setStats(data.stats);
      setRevenueData(data.revenueData);
      setBookingSources(data.bookingSources);
      setRecentReports(data.recentReports);
      setHotelProfile(profile);
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu báo cáo thống kê");
      console.error(error);
    }
  };

  const loadDetailData = useCallback(async () => {
    try {
      setDetailLoading(true);
      const txs = await FinanceAPI.getTransactions({
        startDate: detailStartDate || undefined,
        endDate: detailEndDate || undefined
      });
      setDetailTransactions(txs);
    } catch (error: any) {
      toast.error("Không thể tải dữ liệu chi tiết: " + error.message);
    } finally {
      setDetailLoading(false);
    }
  }, [detailStartDate, detailEndDate]);

  useEffect(() => {
    loadReportData().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showDetailModal) {
      loadDetailData();
      Promise.all([BookingAPI.getBookings(), RoomAPI.getRooms()])
        .then(([bookings, rooms]) => { setReportBookings(bookings); setReportRooms(rooms); })
        .catch((error) => toast.error("Không thể tải dữ liệu booking: " + error.message));
    }
  }, [showDetailModal, loadDetailData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  // Hàm tính toán dữ liệu gộp chi tiết hiển thị trong Modal
  const getAggregatedDetailData = () => {
    const result: any[] = [];
    if (!detailStartDate || !detailEndDate) return result;

    const start = new Date(detailStartDate);
    const end = new Date(detailEndDate);

    if (detailViewMode === "daily") {
      const current = new Date(start);
      while (current <= end) {
        const label = current.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
        const key = current.toISOString().split("T")[0];
        result.push({
          label,
          key,
          revenue: 0,
          expense: 0,
          profit: 0
        });
        current.setDate(current.getDate() + 1);
      }

      detailTransactions.forEach(tx => {
        const txDateStr = new Date(tx.date).toISOString().split("T")[0];
        const bucket = result.find(r => r.key === txDateStr);
        if (bucket) {
          const amt = Number(tx.amount);
          if (tx.type === "INCOME") bucket.revenue += amt;
          else if (tx.type === "EXPENSE") bucket.expense += amt;
        }
      });
    } else {
      const current = new Date(start);
      current.setDate(1);
      while (current <= end) {
        const label = `${current.getMonth() + 1}/${current.getFullYear()}`;
        const year = current.getFullYear();
        const month = current.getMonth();
        result.push({
          label,
          year,
          month,
          revenue: 0,
          expense: 0,
          profit: 0
        });
        current.setMonth(current.getMonth() + 1);
      }

      detailTransactions.forEach(tx => {
        const txDate = new Date(tx.date);
        const y = txDate.getFullYear();
        const m = txDate.getMonth();
        const bucket = result.find(r => r.year === y && r.month === m);
        if (bucket) {
          const amt = Number(tx.amount);
          if (tx.type === "INCOME") bucket.revenue += amt;
          else if (tx.type === "EXPENSE") bucket.expense += amt;
        }
      });
    }

    result.forEach(r => {
      r.profit = r.revenue - r.expense;
    });

    return result;
  };

  const aggregatedDetailData = getAggregatedDetailData();
  const maxDetailRevenue = Math.max(...aggregatedDetailData.map(r => r.revenue), 100000);

  // Tính tổng cộng doanh thu trong khoảng lọc
  const detailTotals = aggregatedDetailData.reduce(
    (acc, r) => {
      acc.revenue += r.revenue;
      acc.expense += r.expense;
      acc.profit += r.profit;
      return acc;
    },
    { revenue: 0, expense: 0, profit: 0 }
  );

  // Tìm giá trị doanh thu lớn nhất để co giãn cột biểu đồ chính
  const maxRevenue = Math.max(...revenueData.map((item) => item.revenue), 100000);

  const reportFilters = {
    startDate: detailStartDate, endDate: detailEndDate, status: reportStatus,
    source: reportSource, roomTypeId: reportRoomType, roomId: reportRoom, userId: reportUser,
  };
  const reportRows = buildBookingReportRows(reportBookings, reportFilters);
  const reportFileName = `Bao_cao_booking_${detailStartDate || "tat-ca"}_${detailEndDate || "tat-ca"}`;

  const handleExportExcel = async () => {
    try {
      toast.loading("Đang tổng hợp dữ liệu báo cáo chi tiết...", { id: "export-excel" });
      
      // Tải danh sách đặt phòng và danh sách phòng từ DB
      const [bookings, rooms] = await Promise.all([
        BookingAPI.getBookings(),
        RoomAPI.getRooms()
      ]);

      if (!rooms || rooms.length === 0) {
        toast.error("Không tìm thấy dữ liệu phòng", { id: "export-excel" });
        return;
      }

      // Khởi tạo nội dung CSV (Sử dụng dấu phân cách chấm phẩy để Excel tự chia cột trên máy tiếng Việt)
      let csvContent = "";
      const csvValue = (value: string) => `"${String(value || "").replace(/"/g, '""')}"`;
      csvContent += `Khách sạn;${csvValue(hotelProfile.hotelName)}\n`;
      csvContent += `Địa chỉ;${csvValue([hotelProfile.address, hotelProfile.province, hotelProfile.country].filter(Boolean).join(", "))}\n`;
      csvContent += `Liên hệ;${csvValue([hotelProfile.phone, hotelProfile.email].filter(Boolean).join(" | "))}\n`;
      csvContent += `Mã số thuế;${csvValue(hotelProfile.taxCode)}\n`;
      csvContent += `Chủ sở hữu/Pháp nhân;${csvValue(hotelProfile.ownerName)}\n\n`;
      csvContent += "Ngày;Công suất phòng ngày;Số phòng;Giá niêm yết (VNĐ);Doanh thu phòng mang lại (VNĐ)\n";

      const start = new Date(detailStartDate);
      const end = new Date(detailEndDate);
      const days: Date[] = [];
      const current = new Date(start);
      while (current <= end) {
        days.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Sắp xếp ngày mới nhất lên trước
      days.reverse().forEach(dayDate => {
        const dayFormatted = dayDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
        
        // Tìm các đặt phòng đang có khách ở vào ngày hôm đó (Trạng thái CHECKED_IN hoặc CHECKED_OUT)
        const activeBookings = bookings.filter((b: any) => {
          if (b.status !== "CHECKED_IN" && b.status !== "CHECKED_OUT") return false;
          const bStart = new Date(b.checkInDate);
          bStart.setHours(0, 0, 0, 0);
          const bEnd = new Date(b.checkOutDate);
          bEnd.setHours(0, 0, 0, 0);
          
          const target = new Date(dayDate);
          target.setHours(0, 0, 0, 0);
          
          return target >= bStart && target < bEnd;
        });

        const totalRoomsCount = rooms.length || 1;
        const occupancyRate = Math.round((activeBookings.length / totalRoomsCount) * 100);

        // Kê chi tiết từng phòng
        rooms.forEach((room: any) => {
          const activeBooking = activeBookings.find((b: any) => b.roomId.toString() === room.id.toString());
          let dayRevenue = 0;
          if (activeBooking) {
            const bStart = new Date(activeBooking.checkInDate);
            const bEnd = new Date(activeBooking.checkOutDate);
            const nights = Math.max(1, Math.round((bEnd.getTime() - bStart.getTime()) / (24 * 60 * 60 * 1000)));
            dayRevenue = Math.round(Number(activeBooking.totalAmount) / nights);
          }

          // Dùng room.pricePerNight thay vì room.price để tránh bị NaN
          const roomPrice = Number(room.pricePerNight ?? 0);

          csvContent += `"${dayFormatted}";"${occupancyRate}%";"Phòng ${room.roomNumber}";${roomPrice};${dayRevenue}\n`;
        });
      });

      // Tạo blob với mảng byte raw UTF-8 BOM ở vị trí đầu tiên để Excel nhận diện chuẩn bảng mã UTF-8
      const utf8BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([utf8BOM, csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Báo_cáo_chi_tiết_doanh_thu_${detailStartDate}_đến_${detailEndDate}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Xuất file báo cáo chi tiết Excel thành công", { id: "export-excel" });
    } catch (error: any) {
      toast.error("Lỗi khi xuất file báo cáo: " + error.message, { id: "export-excel" });
    }
  };

  const exportCurrentBookingReport = async (format: "excel" | "pdf") => {
    try {
      setExporting(format);
      const freshBookings = await BookingAPI.getBookings();
      const rows = buildBookingReportRows(freshBookings, reportFilters);
      setReportBookings(freshBookings);
      if (!rows.length) throw new Error("Không có booking phù hợp với bộ lọc");
      if (format === "excel") await exportBookingReportExcel(rows, reportFileName);
      else await exportBookingReportPdf(rows, reportFileName);
      toast.success(`Đã xuất ${rows.length} booking ra ${format === "excel" ? "Excel" : "PDF"}`);
    } catch (error: any) {
      toast.error(error.message || "Không thể xuất báo cáo");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Thống kê & Báo cáo"
          subtitle="Theo dõi doanh thu, đặt phòng và hiệu suất vận hành khách sạn thực tế"
        />

        <main className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Tổng quan thống kê hoạt động</h2>
                  <p className="text-sm text-muted-foreground">
                    Dữ liệu được cập nhật tự động theo thời gian thực từ sổ quỹ và đặt phòng
                  </p>
                </div>
              </div>

              {hotelProfile.hotelName && (
                <Card className="mb-6">
                  <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                    <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/20">
                      {hotelProfile.logoDataUrl ? <img src={hotelProfile.logoDataUrl} alt="Logo khách sạn" className="max-h-full max-w-full object-contain p-2" /> : <Hotel className="size-8 text-muted-foreground/40" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold">{hotelProfile.hotelName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{[hotelProfile.address, hotelProfile.province, hotelProfile.country].filter(Boolean).join(", ")}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{[hotelProfile.phone, hotelProfile.email, hotelProfile.taxCode && `MST: ${hotelProfile.taxCode}`].filter(Boolean).join(" · ")}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Hàng thẻ thống kê */}
              <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {stats.map((item) => {
                  const Icon = iconMap[item.iconName] || DollarSign;
                  const isPositive = item.description.includes("+");

                  return (
                    <Card key={item.title}>
                      <CardContent className="flex items-center justify-between p-5">
                        <div className="text-left">
                          <p className="text-sm text-muted-foreground">
                            {item.title}
                          </p>
                          <h3 className="mt-2 text-2xl font-bold">
                            {item.value}
                          </h3>
                          <p className={`mt-1 text-xs ${isPositive ? "text-green-600" : "text-muted-foreground"}`}>
                            {item.description}
                          </p>
                        </div>

                        <div className="rounded-full bg-primary/10 p-3">
                          <Icon className="size-6 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Hàng biểu đồ và phân tích nguồn */}
              <div className="mb-6 grid gap-6 lg:grid-cols-2">
                {/* Biểu đồ cột Doanh thu */}
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow relative group"
                  onClick={() => setShowDetailModal(true)}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 text-left">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <BarChart3 className="size-5 text-primary" />
                      Doanh thu & Chi phí 6 tháng gần nhất
                    </CardTitle>
                    <span className="text-xs text-primary font-semibold group-hover:underline flex items-center gap-1">
                      Xem chi tiết &rarr;
                    </span>
                  </CardHeader>

                  <CardContent>
                    <div className="flex h-64 items-end gap-4 px-2 pt-6">
                      {revenueData.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex flex-1 flex-col items-center gap-2 group/bar relative"
                        >
                          {/* Cột chính hiển thị doanh thu */}
                          <div
                            className="w-full rounded-t bg-primary/80 group-hover/bar:bg-primary transition-colors cursor-pointer relative"
                            style={{ height: `${Math.max(10, (item.revenue / maxRevenue) * 180)}px` }}
                          >
                            {/* Tooltip khi di chuột */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/bar:block bg-slate-900/95 text-white text-[11px] p-2.5 rounded-md shadow-xl border border-slate-700 whitespace-nowrap z-50 transition-opacity">
                              <p className="font-bold border-b border-slate-700 pb-1 mb-1 text-center text-primary">{item.month}</p>
                              <p className="flex justify-between gap-4"><span>Thu (Income):</span> <span className="font-semibold text-emerald-400">{formatCurrency(item.revenue)}</span></p>
                              <p className="flex justify-between gap-4"><span>Chi (Expense):</span> <span className="font-semibold text-rose-400">{formatCurrency(item.expense)}</span></p>
                              <p className="flex justify-between gap-4 border-t border-slate-700 pt-1 mt-1 font-bold"><span>Lãi (Profit):</span> <span className={item.profit >= 0 ? "text-emerald-400" : "text-rose-400"}>{formatCurrency(item.profit)}</span></p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground font-semibold">
                            {item.month}
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-4 text-center">
                      💡 Bấm vào biểu đồ hoặc nút "Xem chi tiết" để mở Dashboard doanh thu đầy đủ theo ngày/tháng và lọc ngày.
                    </p>
                  </CardContent>
                </Card>

                {/* Phân tích nguồn đặt phòng */}
                <Card>
                  <CardHeader className="text-left">
                    <CardTitle className="flex items-center gap-2 text-base font-bold">
                      <TrendingUp className="size-5 text-primary" />
                      Tỷ lệ nguồn đặt phòng
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {bookingSources.length > 0 ? (
                      bookingSources.map((item) => (
                        <div key={item.source}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium">{item.source}</span>
                            <span className="font-semibold text-muted-foreground">{item.value}% ({item.count} đơn)</span>
                          </div>

                          <div className="h-2 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary transition-all duration-500"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-60 flex items-center justify-center text-muted-foreground">
                        Chưa có dữ liệu nguồn đặt phòng.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Bảng báo cáo gần đây */}
              <Card className="mb-6">
                <CardHeader className="text-left">
                  <CardTitle className="text-base font-bold">Lịch sử giao dịch sổ quỹ gần đây</CardTitle>
                </CardHeader>

                <CardContent>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="py-3 text-left font-semibold">Tên phiếu giao dịch / Báo cáo</th>
                        <th className="py-3 text-left font-semibold">Ngày ghi nhận</th>
                        <th className="py-3 text-left font-semibold">Phân loại</th>
                        <th className="py-3 text-right font-semibold">Số tiền</th>
                      </tr>
                    </thead>

                    <tbody>
                      {recentReports.length > 0 ? (
                        recentReports.map((report: any, idx: number) => (
                          <tr key={idx} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="py-3 font-medium text-left">{report.name}</td>
                            <td className="py-3 text-left">{report.date}</td>
                            <td className="py-3 text-left">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                report.type === "INCOME" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                  : "bg-rose-50 text-rose-700 border border-rose-100"
                              }`}>
                                {report.type === "INCOME" ? "Thu" : "Chi"}
                              </span>
                            </td>
                            <td className={`py-3 text-right font-semibold ${
                              report.type === "INCOME" ? "text-emerald-600" : "text-rose-600"
                            }`}>
                              {report.type === "INCOME" ? "+" : "-"}{formatCurrency(report.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-6 text-center text-muted-foreground">
                            Chưa có báo cáo thu chi nào được ghi nhận.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>

              {/* Dashboard Chi tiết Doanh thu Modal */}
              <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
                <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-6 overflow-hidden">
                  <DialogHeader className="text-left">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <BarChart3 className="size-5 text-primary" />
                      Báo cáo & Phân tích Doanh thu Chi tiết
                    </DialogTitle>
                    <DialogDescription>
                      Phân tích động dữ liệu thu chi thực tế của khách sạn theo ngày, tháng, năm.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Bộ lọc động */}
                  <div className="bg-muted/50 border rounded-xl p-4 grid gap-4 grid-cols-1 sm:grid-cols-4 items-end text-xs mb-4">
                    <div className="space-y-1 text-left">
                      <Label className="font-semibold">Chế độ xem</Label>
                      <Select value={detailViewMode} onValueChange={(val: any) => setDetailViewMode(val)}>
                        <SelectTrigger className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Xem theo Ngày (Daily)</SelectItem>
                          <SelectItem value="monthly">Xem theo Tháng (Monthly)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1 text-left">
                      <Label className="font-semibold">Từ ngày</Label>
                      <Input
                        type="date"
                        value={detailStartDate}
                        onChange={(e) => setDetailStartDate(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <Label className="font-semibold">Đến ngày</Label>
                      <Input
                        type="date"
                        value={detailEndDate}
                        onChange={(e) => setDetailEndDate(e.target.value)}
                        className="bg-background"
                      />
                    </div>

                    <Button 
                      onClick={() => exportCurrentBookingReport("excel")}
                      variant="outline"
                      className="border-primary text-primary hover:bg-primary/5 font-semibold h-9 flex items-center gap-1.5"
                    >
                      {exporting === "excel" ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                      Xuất Excel (.xlsx)
                    </Button>
                    <div className="space-y-1 text-left"><Label className="font-semibold">Trạng thái</Label><Select value={reportStatus} onValueChange={setReportStatus}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả</SelectItem>{Array.from(new Set(reportBookings.map(b => b.status))).map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1 text-left"><Label className="font-semibold">Nguồn đặt</Label><Select value={reportSource} onValueChange={setReportSource}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả</SelectItem>{Array.from(new Set(reportBookings.map(b => b.bookingSource))).filter(Boolean).map(value => <SelectItem key={String(value)} value={String(value)}>{String(value)}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1 text-left"><Label className="font-semibold">Loại phòng</Label><Select value={reportRoomType} onValueChange={setReportRoomType}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả</SelectItem>{Array.from(new Map(reportRooms.map(r => [String(r.roomTypeId), r.roomType?.name])).entries()).map(([id, name]) => <SelectItem key={id} value={id}>{name || id}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1 text-left"><Label className="font-semibold">Phòng</Label><Select value={reportRoom} onValueChange={setReportRoom}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả</SelectItem>{reportRooms.map(room => <SelectItem key={room.id} value={String(room.id)}>Phòng {room.roomNumber}</SelectItem>)}</SelectContent></Select></div>
                    <div className="space-y-1 text-left"><Label className="font-semibold">Nhân viên tạo</Label><Select value={reportUser} onValueChange={setReportUser}><SelectTrigger className="bg-background"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ALL">Tất cả</SelectItem>{Array.from(new Map(reportBookings.filter(b => b.user).map(b => [String(b.userId), b.user.fullName])).entries()).map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}</SelectContent></Select></div>
                    <Button onClick={() => exportCurrentBookingReport("pdf")} variant="outline" className="border-rose-500 text-rose-600 hover:bg-rose-50 font-semibold h-9" disabled={!!exporting}>
                      {exporting === "pdf" ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}Xuất PDF
                    </Button>
                  </div>

                  {/* Tóm tắt thông số lọc */}
                  <div className="grid gap-3 grid-cols-3 mb-4 text-center">
                    <div className="border rounded-xl p-3 bg-emerald-50/10 dark:bg-emerald-950/10">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Tổng doanh thu</span>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-500">{formatCurrency(detailTotals.revenue)}</span>
                    </div>
                    <div className="border rounded-xl p-3 bg-red-50/10 dark:bg-red-950/10">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Tổng chi phí</span>
                      <span className="text-lg font-bold text-red-600 dark:text-red-500">{formatCurrency(detailTotals.expense)}</span>
                    </div>
                    <div className="border rounded-xl p-3 bg-blue-50/10 dark:bg-blue-950/10">
                      <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Lợi nhuận ròng</span>
                      <span className={cn("text-lg font-bold", detailTotals.profit >= 0 ? "text-blue-600 dark:text-blue-500" : "text-red-600")}>
                        {formatCurrency(detailTotals.profit)}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 overflow-x-auto rounded-xl border bg-card">
                    <div className="flex items-center justify-between border-b px-4 py-3 text-xs"><strong>Dữ liệu booking sẽ xuất</strong><span>{reportRows.length} booking · Tổng {formatReportMoney(reportRows.reduce((sum, row) => sum + row.totalAmount, 0))}</span></div>
                    <table className="min-w-[1050px] w-full text-[11px]">
                      <thead className="bg-muted/60"><tr><th className="p-2 text-left">Mã đặt phòng</th><th className="p-2 text-left">Tên phòng</th><th className="p-2 text-left">Số phòng</th><th className="p-2 text-left">Tên khách</th><th className="p-2 text-left">Ngày đến</th><th className="p-2 text-left">Ngày đi</th><th className="p-2 text-left">Nguồn</th><th className="p-2 text-left">Dịch vụ</th><th className="p-2 text-right">Số tiền</th><th className="p-2 text-left">Nhân viên</th></tr></thead>
                      <tbody className="divide-y">{reportRows.slice(0, 100).map(row => <tr key={row.bookingCode}><td className="p-2 font-semibold">{row.bookingCode}</td><td className="p-2">{row.roomName}</td><td className="p-2">{row.roomNumber}</td><td className="p-2">{row.customerName}</td><td className="p-2">{row.checkIn}</td><td className="p-2">{row.checkOut}</td><td className="p-2">{row.source}</td><td className="max-w-[240px] truncate p-2" title={row.services}>{row.services}</td><td className="p-2 text-right font-semibold">{formatReportMoney(row.totalAmount)}</td><td className="p-2">{row.createdBy}</td></tr>)}</tbody>
                    </table>
                    {reportRows.length > 100 && <p className="border-t p-2 text-center text-xs text-muted-foreground">Đang xem trước 100 dòng; file xuất chứa đủ {reportRows.length} dòng.</p>}
                  </div>

                  {/* Biểu đồ và Bảng chi tiết cuộn */}
                  <div className="flex-1 overflow-y-auto min-h-0 space-y-6 pr-1">
                    
                    {/* Biểu đồ cột mini trong modal */}
                    <div className="border rounded-xl p-4 bg-card shadow-sm">
                      <h4 className="text-xs font-bold text-muted-foreground mb-2 uppercase text-left">Biểu đồ trực quan</h4>
                      {detailLoading ? (
                        <div className="h-60 flex items-center justify-center text-muted-foreground">
                          <Loader2 className="size-6 animate-spin text-primary mr-2" />
                          Đang xử lý dữ liệu biểu đồ...
                        </div>
                      ) : aggregatedDetailData.length === 0 ? (
                        <div className="h-60 flex items-center justify-center text-muted-foreground">
                          Không có dữ liệu trong khoảng thời gian này.
                        </div>
                      ) : (
                        <div className="overflow-x-auto pb-2">
                          <div 
                            className={cn("flex h-60 items-end px-2 pt-20 min-w-max", detailViewMode === "daily" ? "gap-1.5" : "gap-5")}
                            style={{ width: detailViewMode === "daily" ? `${aggregatedDetailData.length * 36 + 40}px` : "100%" }}
                          >
                            {aggregatedDetailData.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex flex-col items-center gap-1.5 group relative"
                                style={{ width: "30px" }}
                              >
                                <div
                                  className="w-full rounded-t bg-primary/80 group-hover:bg-primary transition-colors cursor-pointer relative"
                                  style={{ height: `${Math.max(5, (item.revenue / maxDetailRevenue) * 110)}px` }}
                                >
                                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900/95 text-white text-[10px] p-2 rounded-md shadow-xl border border-slate-700 whitespace-nowrap z-50 transition-opacity">
                                    <p className="font-bold border-b border-slate-700 pb-0.5 mb-0.5 text-center text-primary">{item.label}</p>
                                    <p className="flex justify-between gap-3"><span>Thu:</span> <span className="font-semibold text-emerald-400">{formatCurrency(item.revenue)}</span></p>
                                    <p className="flex justify-between gap-3"><span>Chi:</span> <span className="font-semibold text-rose-400">{formatCurrency(item.expense)}</span></p>
                                    <p className="flex justify-between gap-3 border-t border-slate-700 pt-0.5 mt-0.5 font-bold"><span>Lãi:</span> <span className={item.profit >= 0 ? "text-emerald-400" : "text-rose-400"} >{formatCurrency(item.profit)}</span></p>
                                  </div>
                                </div>
                                <span className="text-[9px] text-muted-foreground font-semibold block text-center truncate w-full">
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bảng kê chi tiết */}
                    <div className="border rounded-xl overflow-hidden bg-card">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted font-bold text-muted-foreground border-b">
                          <tr>
                            <th className="p-3">Thời gian</th>
                            <th className="p-3 text-right">Doanh thu (Thu)</th>
                            <th className="p-3 text-right">Chi phí (Chi)</th>
                            <th className="p-3 text-right">Lợi nhuận ròng</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {detailLoading ? (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                Đang tải bảng kê...
                              </td>
                            </tr>
                          ) : aggregatedDetailData.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                                Không có dữ liệu đối chiếu.
                              </td>
                            </tr>
                          ) : (
                            [...aggregatedDetailData].reverse().map((row, idx) => (
                              <tr key={idx} className="hover:bg-muted/30 transition-colors">
                                <td className="p-3 font-semibold text-foreground">{row.label}</td>
                                <td className="p-3 text-right text-emerald-600 font-medium">+{formatCurrency(row.revenue)}</td>
                                <td className="p-3 text-right text-rose-600">-{formatCurrency(row.expense)}</td>
                                <td className={cn("p-3 text-right font-bold", row.profit >= 0 ? "text-blue-600" : "text-red-600")}>
                                  {formatCurrency(row.profit)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
