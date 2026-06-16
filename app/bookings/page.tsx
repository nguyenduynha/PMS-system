"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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
import type { BookingWithRoom, BookingStatus, RoomWithType } from "@/lib/types";
import { ModalThanhToan } from "@/components/modal-thanh-toan";
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  DollarSign,
} from "lucide-react";

// ─── Helpers UI ──────────────────────────────────────────────────────────────
function formatTienTe(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function nhanTrangThai(status: string) {
  const map: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    CHECKED_IN: "Đang lưu trú",
    CHECKED_OUT: "Đã trả phòng",
    CANCELLED: "Đã hủy",
  };
  return map[status] ?? status;
}

function mauTrangThai(status: string) {
  const map: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-blue-100 text-blue-700",
    CHECKED_IN: "bg-emerald-100 text-emerald-700",
    CHECKED_OUT: "bg-gray-100 text-gray-600",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return map[status] ?? "bg-muted text-muted-foreground";
}

// ─── Component chính ─────────────────────────────────────────────────────────
export default function TrangDatPhong() {
  const [datPhongs, setDatPhongs] = useState<BookingWithRoom[]>([]);
  const [phongs, setPhongs] = useState<RoomWithType[]>([]);
  const [moDialog, setMoDialog] = useState(false);
  const [dangTai, setDangTai] = useState(true);

  // State cho Modal Thanh Toán (Trả phòng)
  const [datPhongThanhToan, setDatPhongThanhToan] =
    useState<BookingWithRoom | null>(null);
  const [moModalThanhToan, setMoModalThanhToan] = useState(false);

  // Form thêm đặt phòng
  const [tenKhach, setTenKhach] = useState("");
  const [sdtKhach, setSdtKhach] = useState("");
  const [emailKhach, setEmailKhach] = useState("");
  const [ngayNhan, setNgayNhan] = useState("");
  const [ngayTra, setNgayTra] = useState("");
  const [soKhach, setSoKhach] = useState("1");
  const [phongChon, setPhongChon] = useState("");
  const [nguonDat, setNguonDat] = useState("Walk-in");
  const [ghiChu, setGhiChu] = useState("");

  const [hinhThucThue, setHinhThucThue] = useState<"hourly" | "daily" | "nightly">("daily");
  const [giaGio, setGiaGio] = useState<number>(0);
  const [giaNgay, setGiaNgay] = useState<number>(0);
  const [giaDem, setGiaDem] = useState<number>(0);
  const [soGioThue, setSoGioThue] = useState<number>(2);
  const [tongTienThuong, setTongTienThuong] = useState<number | null>(null);

  // Cập nhật giá mặc định khi chọn phòng
  useEffect(() => {
    if (phongChon) {
      const phong = phongs.find((r) => r.id === phongChon);
      if (phong && phong.roomType) {
        setGiaGio(Number(phong.roomType.hourlyPrice) || 0);
        setGiaNgay(Number(phong.roomType.dayPrice) || 0);
        setGiaDem(Number(phong.roomType.nightPrice) || 0);
        setTongTienThuong(null); // Reset custom price override
      }
    }
  }, [phongChon, phongs]);

  // Tính tổng tiền tạm tính để hiển thị trên UI
  const tinhTienTamTinh = () => {
    if (tongTienThuong !== null) return tongTienThuong;
    if (!phongChon) return 0;
    
    if (hinhThucThue === "hourly") {
      return soGioThue * giaGio;
    }
    
    if (!ngayNhan || !ngayTra) return 0;
    const soDem = Math.max(
      1,
      Math.ceil(
        (new Date(ngayTra).getTime() - new Date(ngayNhan).getTime()) / 86_400_000
      )
    );
    return soDem * (hinhThucThue === "daily" ? giaNgay : giaDem);
  };

  // ── Load dữ liệu ──
  const taiDuLieu = async () => {
    try {
      setDangTai(true);
      const [resDatPhong, resPhong] = await Promise.all([
        fetch("/api/bookings"),
        fetch("/api/rooms"),
      ]);
      if (resDatPhong.ok) setDatPhongs(await resDatPhong.json());
      if (resPhong.ok) {
        const data = await resPhong.json();
        setPhongs(data.rooms ?? data);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiDuLieu();
  }, []);

  // ── Cập nhật trạng thái đặt phòng (không dùng cho CHECKED_OUT – dùng modal) ──
  const capNhatTrangThai = async (
    datPhongId: string,
    trangThaiMoi: BookingStatus
  ) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: datPhongId,
          status: trangThaiMoi,
          action: "status",
        }),
      });
      if (res.ok) taiDuLieu();
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái:", err);
    }
  };

  // ── Mở modal thanh toán khi click "Trả phòng" ──
  const moTraPhong = (dp: BookingWithRoom) => {
    setDatPhongThanhToan(dp);
    setMoModalThanhToan(true);
  };

  // ── Tạo đặt phòng mới ──
  const taoMoiDatPhong = async () => {
    if (!tenKhach || !sdtKhach || !ngayNhan || !ngayTra || !phongChon) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }
    const phong = phongs.find((r) => r.id === phongChon);
    if (!phong) return;

    const tongTien = tinhTienTamTinh();

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: phongChon,
          checkInDate: ngayNhan,
          checkOutDate: ngayTra,
          customerName: tenKhach,
          customerPhone: sdtKhach,
          customerEmail: emailKhach,
          totalAmount: tongTien,
          status: "CONFIRMED",
          bookingSource: nguonDat,
          notes: ghiChu,
        }),
      });
      if (res.ok) {
        alert("Đặt phòng thành công!");
        setMoDialog(false);
        setTenKhach(""); setSdtKhach(""); setEmailKhach("");
        setNgayNhan(""); setNgayTra(""); setPhongChon("");
        setGhiChu("");
        setHinhThucThue("daily");
        setGiaGio(0); setGiaNgay(0); setGiaDem(0);
        setSoGioThue(2);
        setTongTienThuong(null);
        taiDuLieu();
      } else {
        const err = await res.json();
        alert("Lỗi: " + (err.error || "Không thể đặt phòng"));
      }
    } catch (err) {
      console.error("Lỗi tạo đặt phòng:", err);
    }
  };

  // ── Tóm tắt thống kê ──
  const tongDatPhong = datPhongs.length;
  const choXacNhan = datPhongs.filter((b) => b.status === "PENDING").length;
  const dangLuuTru = datPhongs.filter((b) => b.status === "CHECKED_IN").length;
  const daTraPhong = datPhongs.filter((b) => b.status === "CHECKED_OUT").length;

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Quản lý Đặt phòng"
          subtitle="Theo dõi và xử lý đặt phòng, nhận phòng, trả phòng"
        />

        <main className="flex-1 overflow-auto p-6">
          {/* ── Tiêu đề & nút Tạo mới ── */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Danh sách đặt phòng</h2>
              <p className="text-sm text-muted-foreground">
                Tổng cộng {tongDatPhong} đặt phòng
              </p>
            </div>
            <Button id="btn-tao-dat-phong" onClick={() => setMoDialog(true)}>
              <Plus className="mr-2 size-4" />
              Tạo đặt phòng mới
            </Button>
          </div>

          {/* ── Thống kê nhanh ── */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 p-3">
                  <CalendarDays className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đặt phòng</p>
                  <h3 className="text-2xl font-bold">{tongDatPhong}</h3>
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
                  <h3 className="text-2xl font-bold">{choXacNhan}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-emerald-100 p-3">
                  <CheckCircle className="size-6 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đang lưu trú</p>
                  <h3 className="text-2xl font-bold">{dangLuuTru}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-purple-100 p-3">
                  <DollarSign className="size-6 text-purple-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã trả phòng</p>
                  <h3 className="text-2xl font-bold">{daTraPhong}</h3>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Bảng danh sách ── */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách đặt phòng</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {dangTai ? (
                <p className="p-6 text-center text-muted-foreground">
                  Đang tải dữ liệu...
                </p>
              ) : datPhongs.length === 0 ? (
                <p className="p-6 text-center text-muted-foreground">
                  Chưa có đặt phòng nào.
                </p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-4 text-left">Khách hàng</th>
                      <th className="p-4 text-left">Phòng</th>
                      <th className="p-4 text-left">Thời gian</th>
                      <th className="p-4 text-left">Nguồn</th>
                      <th className="p-4 text-left">Tổng tiền</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {datPhongs.map((dp) => (
                      <tr key={dp.id} className="border-b hover:bg-muted/40">
                        <td className="p-4">
                          <p className="font-medium">{dp.customerName}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {dp.customerPhone}
                          </p>
                        </td>

                        <td className="p-4">
                          <Badge variant="outline">
                            Phòng {dp.room.roomNumber}
                          </Badge>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {dp.room.roomType.name}
                          </p>
                        </td>

                        <td className="p-4 font-mono text-xs">
                          <p>{dp.checkInDate}</p>
                          <p className="text-muted-foreground">
                            → {dp.checkOutDate}
                          </p>
                        </td>

                        <td className="p-4 text-xs">
                          {dp.bookingSource || "Walk-in"}
                        </td>

                        <td className="p-4 font-semibold font-mono text-emerald-700">
                          {formatTienTe(dp.totalAmount)}
                        </td>

                        <td className="p-4">
                          <Badge className={mauTrangThai(dp.status)}>
                            {nhanTrangThai(dp.status)}
                          </Badge>
                        </td>

                        <td className="p-4">
                          <div className="flex justify-end gap-2">
                            {/* Xác nhận */}
                            {dp.status === "PENDING" && (
                              <Button
                                id={`btn-xac-nhan-${dp.id}`}
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  capNhatTrangThai(dp.id, "CONFIRMED")
                                }
                              >
                                <CheckCircle className="mr-1 size-4" />
                                Xác nhận
                              </Button>
                            )}

                            {/* Nhận phòng */}
                            {dp.status === "CONFIRMED" && (
                              <Button
                                id={`btn-nhan-phong-${dp.id}`}
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  capNhatTrangThai(dp.id, "CHECKED_IN")
                                }
                              >
                                <LogIn className="mr-1 size-4" />
                                Nhận phòng
                              </Button>
                            )}

                            {/* Trả phòng → mở Modal Thanh Toán */}
                            {dp.status === "CHECKED_IN" && (
                              <Button
                                id={`btn-tra-phong-${dp.id}`}
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => moTraPhong(dp)}
                              >
                                <LogOut className="mr-1 size-4" />
                                Trả phòng
                              </Button>
                            )}

                            {/* Hủy */}
                            {(dp.status === "PENDING" ||
                              dp.status === "CONFIRMED") && (
                                <Button
                                  id={`btn-huy-${dp.id}`}
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    capNhatTrangThai(dp.id, "CANCELLED")
                                  }
                                >
                                  <XCircle className="mr-1 size-4" />
                                  Hủy
                                </Button>
                              )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* ── Dialog Tạo đặt phòng mới ── */}
      <Dialog open={moDialog} onOpenChange={setMoDialog}>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Tạo đặt phòng mới</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-ten-khach">
                  Họ tên khách hàng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-ten-khach"
                  placeholder="Nguyễn Văn A"
                  value={tenKhach}
                  onChange={(e) => setTenKhach(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="input-sdt">
                  Số điện thoại <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-sdt"
                  placeholder="0901234567"
                  value={sdtKhach}
                  onChange={(e) => setSdtKhach(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="input-email">Email</Label>
              <Input
                id="input-email"
                placeholder="example@gmail.com"
                value={emailKhach}
                onChange={(e) => setEmailKhach(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-ngay-nhan">
                  Ngày nhận phòng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-ngay-nhan"
                  type="date"
                  value={ngayNhan}
                  onChange={(e) => setNgayNhan(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="input-ngay-tra">
                  Ngày trả phòng <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="input-ngay-tra"
                  type="date"
                  value={ngayTra}
                  onChange={(e) => setNgayTra(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="input-so-khach">Số khách</Label>
                <Input
                  id="input-so-khach"
                  type="number"
                  min="1"
                  value={soKhach}
                  onChange={(e) => setSoKhach(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="select-phong">
                  Chọn phòng <span className="text-red-500">*</span>
                </Label>
                <Select value={phongChon} onValueChange={setPhongChon}>
                  <SelectTrigger id="select-phong">
                    <SelectValue placeholder="Chọn phòng trống..." />
                  </SelectTrigger>
                  <SelectContent>
                    {phongs
                      .filter((r) => r.status === "AVAILABLE")
                      .map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          Phòng {p.roomNumber} – {p.roomType.name} (
                          Giờ: {formatTienTe(Number(p.roomType.hourlyPrice))} | 
                          Ngày: {formatTienTe(Number(p.roomType.dayPrice))}
                          )
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Hình thức thuê & Điều chỉnh giá */}
            {phongChon && (
              <div className="rounded-xl border bg-muted/20 p-4 space-y-4">
                <p className="font-semibold text-sm">Hình thức thuê &amp; Bảng giá</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="select-hinh-thuc">Hình thức thuê</Label>
                    <Select
                      value={hinhThucThue}
                      onValueChange={(val: any) => {
                        setHinhThucThue(val);
                        setTongTienThuong(null); // Reset manual override
                      }}
                    >
                      <SelectTrigger id="select-hinh-thuc">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Theo giờ</SelectItem>
                        <SelectItem value="daily">Theo ngày</SelectItem>
                        <SelectItem value="nightly">Qua đêm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {hinhThucThue === "hourly" && (
                    <div>
                      <Label htmlFor="input-so-gio">Số giờ thuê</Label>
                      <Input
                        id="input-so-gio"
                        type="number"
                        min="1"
                        value={soGioThue}
                        onChange={(e) => {
                          setSoGioThue(Math.max(1, Number(e.target.value) || 1));
                          setTongTienThuong(null);
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="input-gia-gio">Giá giờ</Label>
                    <Input
                      id="input-gia-gio"
                      type="number"
                      value={giaGio}
                      onChange={(e) => {
                        setGiaGio(Number(e.target.value) || 0);
                        setTongTienThuong(null);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="input-gia-ngay">Giá ngày</Label>
                    <Input
                      id="input-gia-ngay"
                      type="number"
                      value={giaNgay}
                      onChange={(e) => {
                        setGiaNgay(Number(e.target.value) || 0);
                        setTongTienThuong(null);
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="input-gia-dem">Giá đêm</Label>
                    <Input
                      id="input-gia-dem"
                      type="number"
                      value={giaDem}
                      onChange={(e) => {
                        setGiaDem(Number(e.target.value) || 0);
                        setTongTienThuong(null);
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                  <div className="flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground">Tạm tính</span>
                    <span className="text-lg font-bold text-emerald-700">
                      {formatTienTe(tinhTienTamTinh())}
                    </span>
                  </div>
                  <div>
                    <Label htmlFor="input-tong-tien-tuy-chinh">Tổng tiền tùy chỉnh (VND)</Label>
                    <Input
                      id="input-tong-tien-tuy-chinh"
                      type="number"
                      placeholder="Nhập tổng tiền mới..."
                      value={tongTienThuong === null ? "" : tongTienThuong}
                      onChange={(e) => {
                        const val = e.target.value;
                        setTongTienThuong(val === "" ? null : Number(val));
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="select-nguon">Nguồn đặt phòng</Label>
              <Select value={nguonDat} onValueChange={setNguonDat}>
                <SelectTrigger id="select-nguon">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Walk-in",
                    "Website",
                    "Booking.com",
                    "Agoda",
                    "Airbnb",
                    "Traveloka",
                    "Điện thoại",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="input-ghi-chu">Ghi chú</Label>
              <Input
                id="input-ghi-chu"
                placeholder="Yêu cầu đặc biệt..."
                value={ghiChu}
                onChange={(e) => setGhiChu(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMoDialog(false)}>
              Hủy
            </Button>
            <Button id="btn-luu-dat-phong" onClick={taoMoiDatPhong}>
              Lưu đặt phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal Thanh toán Trả phòng ── */}
      <ModalThanhToan
        booking={datPhongThanhToan}
        open={moModalThanhToan}
        onClose={() => {
          setMoModalThanhToan(false);
          setDatPhongThanhToan(null);
        }}
        onSuccess={() => {
          setMoModalThanhToan(false);
          setDatPhongThanhToan(null);
          taiDuLieu();
        }}
      />
    </div>
  );
}