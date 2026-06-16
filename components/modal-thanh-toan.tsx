"use client";

import { useState } from "react";
import type { BookingWithRoom } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Receipt,
  CreditCard,
  Banknote,
  Building2,
  CheckCircle2,
  Loader2,
  BedDouble,
  Calendar,
} from "lucide-react";

// ─── Kiểu phương thức thanh toán ─────────────────────────────────────────────
const PHUONG_THUC = [
  { value: "CASH", label: "Tiền mặt", icon: Banknote },
  { value: "CARD", label: "Thẻ ngân hàng", icon: CreditCard },
  { value: "TRANSFER", label: "Chuyển khoản", icon: Building2 },
] as const;

// ─── Props ───────────────────────────────────────────────────────────────────
interface ModalThanhToanProps {
  booking: BookingWithRoom | null;
  open: boolean;
  onClose: () => void;
  /** Gọi lại sau khi trả phòng thành công */
  onSuccess: (bookingId: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function tinhSoDem(checkIn: string, checkOut: string): number {
  const d1 = new Date(checkIn);
  const d2 = new Date(checkOut);
  const diff = Math.ceil((d2.getTime() - d1.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

function formatTien(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Quy đổi USD → VND theo tỉ giá tham chiếu */
const TY_GIA_USD_VND = 25_000;

// ─── Component chính ─────────────────────────────────────────────────────────
export function ModalThanhToan({
  booking,
  open,
  onClose,
  onSuccess,
}: ModalThanhToanProps) {
  const [phuongThuc, setPhuongThuc] = useState<string>("CASH");
  const [giamGia, setGiamGia] = useState<number>(0);
  const [ghiChu, setGhiChu] = useState<string>("");
  const [dangXuLy, setDangXuLy] = useState<boolean>(false);
  const [thanhCong, setThanhCong] = useState<boolean>(false);
  const [loi, setLoi] = useState<string>("");

  if (!booking) return null;

  // ── Tính toán số tiền ──
  const soDem = tinhSoDem(booking.checkInDate, booking.checkOutDate);
  const tienPhong = Number(booking.totalAmount);
  const thueVAT = Math.round(tienPhong * 0.1);
  const giamGiaVND = giamGia * 1_000;
  const tongTien = Math.max(0, tienPhong + thueVAT - giamGiaVND);

  // ── Xác nhận thanh toán ──
  const xacNhanThanhToan = async () => {
    setLoi("");
    setDangXuLy(true);
    try {
      // 1️⃣ Tạo hóa đơn
      const resHD = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          subTotal: tienPhong,
          taxAmount: thueVAT,
          discount: giamGiaVND,
          totalAmount: tongTien,
          status: "PAID",
          paymentMethod: phuongThuc,
          ghiChu: ghiChu || null,
        }),
      });

      if (!resHD.ok) {
        const err = await resHD.json();
        throw new Error(err.error || "Không thể tạo hóa đơn");
      }

      // 2️⃣ Cập nhật trạng thái đặt phòng → CHECKED_OUT
      const resDP = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          status: "CHECKED_OUT",
          action: "status",
        }),
      });

      if (!resDP.ok) {
        const err = await resDP.json();
        throw new Error(err.error || "Không thể cập nhật trạng thái trả phòng");
      }

      setThanhCong(true);
      setTimeout(() => {
        setThanhCong(false);
        setGiamGia(0);
        setGhiChu("");
        onSuccess(booking.id);
        onClose();
      }, 2000);
    } catch (err: any) {
      setLoi(err.message);
    } finally {
      setDangXuLy(false);
    }
  };

  // ── Màn hình thành công ──
  if (thanhCong) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center justify-center gap-4 py-10">
            <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="size-10 text-emerald-600" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-emerald-700">
                Thanh toán thành công!
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Hóa đơn đã được ghi nhận.{" "}
                <span className="font-semibold">
                  Phòng {booking.room.roomNumber}
                </span>{" "}
                đã trả phòng.
              </p>
              <p className="mt-3 text-2xl font-bold text-emerald-800">
                {formatTien(tongTien)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Form thanh toán ──
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Receipt className="size-5 text-primary" />
            Xác nhận Trả phòng &amp; Thanh toán
          </DialogTitle>
          <DialogDescription>
            Phòng{" "}
            <span className="font-semibold text-foreground">
              {booking.room.roomNumber}
            </span>{" "}
            – Khách:{" "}
            <span className="font-semibold text-foreground">
              {booking.customerName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-1">
          {/* ── Thông tin lưu trú ── */}
          <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs mb-3">
              Thông tin lưu trú
            </p>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <BedDouble className="size-3.5" /> Loại phòng
              </span>
              <span className="font-medium">{booking.room.roomType.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" /> Nhận phòng
              </span>
              <span className="font-mono font-medium">{booking.checkInDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="size-3.5" /> Trả phòng
              </span>
              <span className="font-mono font-medium">{booking.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số đêm</span>
              <Badge variant="secondary">{soDem} đêm</Badge>
            </div>
          </div>

          {/* ── Chi tiết thanh toán ── */}
          <div className="space-y-2.5 text-sm">
            <p className="font-semibold text-muted-foreground uppercase tracking-wide text-xs">
              Chi tiết thanh toán
            </p>

            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Tiền phòng ({soDem} đêm)
              </span>
              <span className="font-medium">{formatTien(tienPhong)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Thuế VAT (10%)</span>
              <span>{formatTien(thueVAT)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Giảm giá (nghìn đồng)</span>
              <Input
                id="giam-gia-input"
                type="number"
                min={0}
                className="h-7 w-28 text-right text-sm"
                value={giamGia || ""}
                placeholder="0"
                onChange={(e) => setGiamGia(Number(e.target.value) || 0)}
              />
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <span className="text-base font-bold">Tổng thanh toán</span>
            <span className="text-xl font-bold text-emerald-700">
              {formatTien(tongTien)}
            </span>
          </div>

          {/* ── Phương thức thanh toán ── */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Phương thức thanh toán</Label>
            <div className="grid grid-cols-3 gap-2">
              {PHUONG_THUC.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  id={`pt-${value.toLowerCase()}`}
                  onClick={() => setPhuongThuc(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm transition-all ${
                    phuongThuc === value
                      ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                      : "border-border hover:bg-muted/70"
                  }`}
                >
                  <Icon className="size-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Ghi chú ── */}
          <div className="space-y-1">
            <Label htmlFor="ghi-chu-input" className="text-sm">
              Ghi chú <span className="text-muted-foreground">(tùy chọn)</span>
            </Label>
            <Input
              id="ghi-chu-input"
              placeholder="Ghi chú thêm cho hóa đơn..."
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </div>

          {/* ── Thông báo lỗi ── */}
          {loi && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              ⚠ {loi}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={dangXuLy}>
            Hủy
          </Button>
          <Button
            id="btn-xac-nhan-thanh-toan"
            onClick={xacNhanThanhToan}
            disabled={dangXuLy}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            {dangXuLy ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Đang xử lý...
              </>
            ) : (
              <>
                <Receipt className="size-4" /> Xác nhận thanh toán
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
