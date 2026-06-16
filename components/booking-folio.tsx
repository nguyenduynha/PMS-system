"use client";

import { useState, useEffect, useCallback } from "react";
import type { BookingFolio, BookingServiceItem, PriceType, RoomWithType, Service } from "@/lib/types";
import { format, differenceInDays, differenceInHours, addDays, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Users,
  Calendar,
  CreditCard,
  BedDouble,
  ArrowRightLeft,
  CalendarPlus,
  Phone,
  FileText,
  User,
  CheckCircle,
  Plus,
  Trash2,
  Clock,
  Sun,
  Moon,
  Loader2,
  Receipt,
  Mail,
  PercentCircle,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

function calcRoomAmount(priceType: PriceType, folio: BookingFolio): number {
  const checkIn = parseISO(folio.checkInDate);
  const checkOut = parseISO(folio.checkOutDate);
  const rt = folio.room.roomType;

  if (priceType === "hourly") {
    const hours = Math.max(1, differenceInHours(checkOut, checkIn));
    return hours * rt.hourlyPrice;
  }
  if (priceType === "day") {
    const days = Math.max(1, differenceInDays(checkOut, checkIn));
    return days * rt.dayPrice;
  }
  // night
  const nights = Math.max(1, differenceInDays(checkOut, checkIn));
  return nights * rt.nightPrice;
}

function calcServiceTotal(services: BookingServiceItem[]): number {
  return services.reduce((sum, s) => sum + s.totalAmount, 0);
}

function calcInvoice(
  roomAmount: number,
  serviceTotal: number,
  taxRate: number,
  discount: number
) {
  const subTotal = roomAmount + serviceTotal;
  const taxAmount = Math.round(subTotal * (taxRate / 100));
  const totalAmount = Math.max(0, subTotal + taxAmount - discount);
  return { subTotal, taxAmount, totalAmount };
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface BookingFolioDialogProps {
  folio: BookingFolio | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtendStay: (bookingId: string, newCheckOutDate: string, newTotalAmount: number) => void;
  onChangeRoom: (bookingId: string, newRoomId: string) => void;
  onFolioUpdate?: () => void;
  initialTab?: "info" | "services" | "invoice" | "actions";
}

// ─── Component ────────────────────────────────────────────────────────────────

export function BookingFolioDialog({
  folio: initialFolio,
  open,
  onOpenChange,
  onExtendStay,
  onChangeRoom,
  onFolioUpdate,
  initialTab = "info",
}: BookingFolioDialogProps) {
  const [folio, setFolio] = useState<BookingFolio | null>(initialFolio);
  const [activeTab, setActiveTab] = useState(initialTab);

  // State cho loại giá
  const [priceType, setPriceType] = useState<PriceType>("night");

  // State gia hạn
  const [extendDays, setExtendDays] = useState(1);

  // State đổi phòng
  const [availableRooms, setAvailableRooms] = useState<RoomWithType[]>([]);
  const [selectedNewRoom, setSelectedNewRoom] = useState("");

  // State thêm dịch vụ
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [serviceQty, setServiceQty] = useState(1);
  const [isAddingService, setIsAddingService] = useState(false);
  const [addServiceOpen, setAddServiceOpen] = useState(false);

  // State hóa đơn
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [taxRate] = useState(10);
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  const [invoiceSaved, setInvoiceSaved] = useState(false);

  // Load lại folio từ API
  const reloadFolio = useCallback(async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings?roomId=${folio?.room.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data) setFolio(data);
      }
    } catch (err) {
      console.error("Lỗi reload folio:", err);
    }
  }, [folio?.room.id]);

  useEffect(() => {
    if (initialFolio) {
      setFolio(initialFolio);
      setPriceType((initialFolio.priceType as PriceType) ?? "night");
      setDiscount(0);
      setExtendDays(1);
      setSelectedNewRoom("");
      setActiveTab(initialTab);  // dùng initialTab thay vì hardcode "info"
      setInvoiceSaved(false);
      // Nếu đã có hóa đơn → load discount từ invoice
      if (initialFolio.invoice) {
        setDiscount(initialFolio.invoice.discount ?? 0);
      }
    }
  }, [initialFolio, initialTab]);

  // Load danh sách dịch vụ & phòng trống
  useEffect(() => {
    if (!open) return;
    fetch("/api/services")
      .then((r) => r.json())
      .then((data) => setAllServices(Array.isArray(data) ? data : []))
      .catch(() => { });

    if (initialFolio) {
      fetch(`/api/rooms`)
        .then((r) => r.json())
        .then((data) => {
          const rooms = (data.rooms || []) as RoomWithType[];
          setAvailableRooms(
            rooms.filter(
              (r) =>
                r.status === "AVAILABLE" &&
                r.roomTypeId === initialFolio.room.roomTypeId &&
                r.id !== initialFolio.room.id
            )
          );
        })
        .catch(() => { });
    }
  }, [open, initialFolio]);

  if (!folio) return null;

  const checkIn = parseISO(folio.checkInDate);
  const checkOut = parseISO(folio.checkOutDate);
  const stayNights = Math.max(1, differenceInDays(checkOut, checkIn));

  const roomAmount = calcRoomAmount(priceType, folio);
  const serviceTotal = calcServiceTotal(folio.bookingServices);
  const { subTotal, taxAmount, totalAmount } = calcInvoice(roomAmount, serviceTotal, taxRate, discount);

  const newCheckOutDate = addDays(checkOut, extendDays);
  const rt = folio.room.roomType;
  const unitPrice =
    priceType === "hourly" ? rt.hourlyPrice : priceType === "day" ? rt.dayPrice : rt.nightPrice;

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handlePriceTypeChange = async (pt: PriceType) => {
    setPriceType(pt);
    try {
      await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_price_type", id: folio.id, priceType: pt }),
      });
    } catch { }
  };

  const handleAddService = async () => {
    if (!selectedServiceId || serviceQty < 1) return;
    setIsAddingService(true);
    try {
      const res = await fetch("/api/booking-services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: folio.id,
          serviceId: selectedServiceId,
          quantity: serviceQty,
        }),
      });
      if (res.ok) {
        const newBs = await res.json();
        setFolio((prev) =>
          prev
            ? { ...prev, bookingServices: [...prev.bookingServices, newBs] }
            : prev
        );
        setSelectedServiceId("");
        setServiceQty(1);
        setAddServiceOpen(false);
        onFolioUpdate?.();
      }
    } catch (err) {
      console.error("Lỗi thêm dịch vụ:", err);
    } finally {
      setIsAddingService(false);
    }
  };

  const handleRemoveService = async (bookingServiceId: string) => {
    try {
      const res = await fetch(`/api/booking-services?id=${bookingServiceId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setFolio((prev) =>
          prev
            ? {
              ...prev,
              bookingServices: prev.bookingServices.filter((s) => s.id !== bookingServiceId),
            }
            : prev
        );
        onFolioUpdate?.();
      }
    } catch (err) {
      console.error("Lỗi xóa dịch vụ:", err);
    }
  };

  const handleUpsertInvoice = async () => {
    setIsSavingInvoice(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: folio.id,
          subTotal,
          taxAmount,
          discount,
          totalAmount,
          status: "PAID",
          paymentMethod,
        }),
      });
      if (res.ok) {
        const inv = await res.json();
        setFolio((prev) => (prev ? { ...prev, invoice: inv } : prev));
        setInvoiceSaved(true);
        onFolioUpdate?.();
        setTimeout(() => setInvoiceSaved(false), 3000);
      }
    } catch (err) {
      console.error("Lỗi lưu hóa đơn:", err);
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleExtendStay = () => {
    const additionalCost =
      priceType === "hourly"
        ? extendDays * 24 * rt.hourlyPrice
        : priceType === "day"
          ? extendDays * rt.dayPrice
          : extendDays * rt.nightPrice;
    onExtendStay(folio.id, format(newCheckOutDate, "yyyy-MM-dd"), folio.totalAmount + additionalCost);
  };

  const selectedServiceObj = allServices.find((s) => s.id === selectedServiceId);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur px-6 py-4">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                <BedDouble className="size-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold">
                  Booking Folio – Phòng {folio.room.roomNumber}
                </DialogTitle>
                <DialogDescription asChild>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-xs">{folio.room.roomType.name}</Badge>
                    <span className="text-muted-foreground text-xs">|</span>
                    <span className="text-xs text-muted-foreground">Booking #{folio.id}</span>
                    <Badge
                      variant={folio.status === "CHECKED_IN" ? "default" : "outline"}
                      className={cn(
                        "text-xs",
                        folio.status === "CHECKED_IN" && "bg-emerald-500 text-white"
                      )}
                    >
                      {folio.status === "CHECKED_IN" ? "Đang lưu trú" : folio.status}
                    </Badge>
                  </div>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          <Tabs
            value={activeTab}
            onValueChange={(value) =>
              setActiveTab(
                value as "info" | "services" | "invoice" | "actions"
              )
            }
          >
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="info" className="gap-1.5 text-xs sm:text-sm">
                <User className="size-3.5" />
                <span className="hidden sm:inline">Thông tin</span>
              </TabsTrigger>
              <TabsTrigger value="services" className="gap-1.5 text-xs sm:text-sm">
                <FileText className="size-3.5" />
                <span className="hidden sm:inline">Dịch vụ</span>
                {folio.bookingServices.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-xs">
                    {folio.bookingServices.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="invoice" className="gap-1.5 text-xs sm:text-sm">
                <Receipt className="size-3.5" />
                <span className="hidden sm:inline">Hóa đơn</span>
                {folio.invoice && <CheckCircle className="size-3 text-emerald-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="actions" className="gap-1.5 text-xs sm:text-sm">
                <ArrowRightLeft className="size-3.5" />
                <span className="hidden sm:inline">Tác vụ</span>
              </TabsTrigger>
            </TabsList>

            {/* ── TAB 1: THÔNG TIN LƯU TRÚ ────────────────────────────────── */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Thông tin khách */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <User className="size-4 text-primary" />
                      Thông tin khách
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                        <User className="size-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{folio.customerName}</p>
                        <p className="text-xs text-muted-foreground">Khách chính</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="size-3.5" />
                      <span>{folio.customerPhone}</span>
                    </div>
                    {folio.customerEmail && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="size-3.5" />
                        <span>{folio.customerEmail}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="size-3.5" />
                      <span>{folio.guestCount} khách</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Thông tin phòng & thời gian */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                      <Calendar className="size-4 text-primary" />
                      Lịch lưu trú
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <div className="flex-1 rounded-lg bg-muted/60 p-2.5 text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">Nhận phòng</p>
                        <p className="font-semibold">{format(checkIn, "dd/MM/yyyy", { locale: vi })}</p>
                      </div>
                      <div className="flex items-center text-muted-foreground">→</div>
                      <div className="flex-1 rounded-lg bg-muted/60 p-2.5 text-center">
                        <p className="text-xs text-muted-foreground mb-0.5">Trả phòng</p>
                        <p className="font-semibold">{format(checkOut, "dd/MM/yyyy", { locale: vi })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-lg border py-2">
                      <Moon className="size-4 text-indigo-500" />
                      <span className="font-semibold">{stayNights} đêm</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span>Loại phòng: </span>
                        <span className="font-medium text-foreground">{rt.name}</span>
                      </div>
                      <div>
                        <span>Sức chứa: </span>
                        <span className="font-medium text-foreground">{rt.capacity} khách</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chọn loại giá */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="size-4 text-primary" />
                    Loại giá áp dụng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={priceType}
                    onValueChange={(v) => handlePriceTypeChange(v as PriceType)}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: "hourly", label: "Giá giờ", price: rt.hourlyPrice, icon: Clock, unit: "/giờ" },
                      { value: "day", label: "Giá ngày", price: rt.dayPrice, icon: Sun, unit: "/ngày" },
                      { value: "night", label: "Giá đêm", price: rt.nightPrice, icon: Moon, unit: "/đêm" },
                    ].map(({ value, label, price, icon: Icon, unit }) => (
                      <Label
                        key={value}
                        htmlFor={`price-${value}`}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all",
                          priceType === value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={value} id={`price-${value}`} className="sr-only" />
                        <Icon className="size-5" />
                        <div className="text-center">
                          <p className="text-xs font-medium">{label}</p>
                          <p className="text-sm font-bold">{formatCurrency(price)}</p>
                          <p className="text-xs opacity-70">{unit}</p>
                        </div>
                      </Label>
                    ))}
                  </RadioGroup>

                  <Separator className="my-4" />

                  <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Đơn giá</span>
                      <span className="font-medium">{formatCurrency(unitPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        {priceType === "hourly"
                          ? `× ${Math.max(1, differenceInHours(checkOut, checkIn))} giờ`
                          : `× ${stayNights} ${priceType === "day" ? "ngày" : "đêm"}`}
                      </span>
                      <span className="font-bold text-primary">{formatCurrency(roomAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── TAB 2: DỊCH VỤ ───────────────────────────────────────────── */}
            <TabsContent value="services" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Dịch vụ đã sử dụng</h3>
                  <p className="text-xs text-muted-foreground">
                    Tổng: {formatCurrency(serviceTotal)}
                  </p>
                </div>

                <Popover open={addServiceOpen} onOpenChange={setAddServiceOpen}>
                  <PopoverTrigger asChild>
                    <Button size="sm" className="gap-2">
                      <Plus className="size-3.5" />
                      Thêm dịch vụ
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm">Chọn dịch vụ</h4>
                      <div className="space-y-2">
                        <Label className="text-xs">Dịch vụ</Label>
                        <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chọn dịch vụ..." />
                          </SelectTrigger>
                          <SelectContent>
                            {allServices
                              .filter((s) => s.status === "ACTIVE")
                              .map((s) => (
                                <SelectItem key={s.id} value={s.id}>
                                  <div className="flex items-center justify-between w-full gap-4">
                                    <span>{s.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {formatCurrency(s.price)}/{s.unit}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-xs">Số lượng</Label>
                        <Input
                          type="number"
                          min={1}
                          value={serviceQty}
                          onChange={(e) => setServiceQty(Math.max(1, parseInt(e.target.value) || 1))}
                          className="h-9"
                        />
                      </div>

                      {selectedServiceObj && (
                        <div className="rounded-lg bg-muted/60 p-2.5 text-xs space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Đơn giá</span>
                            <span>{formatCurrency(selectedServiceObj.price)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Thành tiền</span>
                            <span className="text-primary">
                              {formatCurrency(selectedServiceObj.price * serviceQty)}
                            </span>
                          </div>
                        </div>
                      )}

                      <Button
                        className="w-full h-9"
                        disabled={!selectedServiceId || isAddingService}
                        onClick={handleAddService}
                      >
                        {isAddingService ? (
                          <Loader2 className="size-3.5 animate-spin mr-2" />
                        ) : (
                          <Plus className="size-3.5 mr-2" />
                        )}
                        Thêm
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên dịch vụ</TableHead>
                      <TableHead className="text-right">Đơn giá</TableHead>
                      <TableHead className="text-center">Số lượng</TableHead>
                      <TableHead className="text-right">Thành tiền</TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {folio.bookingServices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          <div className="flex flex-col items-center gap-2">
                            <FileText className="size-8 opacity-30" />
                            <p>Chưa có dịch vụ nào</p>
                            <p className="text-xs">Nhấn "Thêm dịch vụ" để thêm</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      folio.bookingServices.map((bs) => (
                        <TableRow key={bs.id}>
                          <TableCell className="font-medium">
                            <div>
                              <p>{bs.serviceName}</p>
                              <p className="text-xs text-muted-foreground">/{bs.serviceUnit}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {formatCurrency(bs.price)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary">{bs.quantity}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {formatCurrency(bs.totalAmount)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="size-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemoveService(bs.id)}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {folio.bookingServices.length > 0 && (
                <div className="flex justify-end">
                  <div className="rounded-lg bg-muted/60 px-4 py-2 text-sm">
                    <span className="text-muted-foreground">Tổng dịch vụ: </span>
                    <span className="font-bold text-primary">{formatCurrency(serviceTotal)}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* ── TAB 3: HÓA ĐƠN ──────────────────────────────────────────── */}
            <TabsContent value="invoice" className="space-y-4">
              {folio.invoice && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <CheckCircle className="size-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">
                    Hóa đơn {folio.invoice.invoiceNumber} đã được tạo
                  </span>
                  <Badge variant="outline" className="ml-auto text-xs">
                    {folio.invoice.status}
                  </Badge>
                </div>
              )}

              {invoiceSaved && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                  <CheckCircle className="size-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700 dark:text-emerald-400">
                    Hóa đơn đã được lưu thành công!
                  </span>
                </div>
              )}

              {/* Chi tiết tính tiền */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <Receipt className="size-4 text-primary" />
                    Chi tiết hóa đơn
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {/* Tiền phòng */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Tiền phòng</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(unitPrice)} ×{" "}
                        {priceType === "hourly"
                          ? `${Math.max(1, differenceInHours(checkOut, checkIn))} giờ`
                          : `${stayNights} ${priceType === "day" ? "ngày" : "đêm"}`}
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(roomAmount)}</span>
                  </div>

                  {/* Tiền dịch vụ */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground">Tiền dịch vụ</p>
                      <p className="text-xs text-muted-foreground">
                        {folio.bookingServices.length} dịch vụ
                      </p>
                    </div>
                    <span className="font-semibold">{formatCurrency(serviceTotal)}</span>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-semibold">{formatCurrency(subTotal)}</span>
                  </div>

                  {/* Thuế */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <PercentCircle className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Thuế ({taxRate}%)</span>
                    </div>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>

                  {/* Giảm giá */}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Giảm giá</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-xs">-</span>
                      <Input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                        className="h-8 w-32 text-right"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">VND</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between text-base font-bold">
                    <span>Tổng thanh toán</span>
                    <span className="text-xl text-primary">{formatCurrency(totalAmount)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Phương thức thanh toán */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <CreditCard className="size-4 text-primary" />
                    Phương thức thanh toán
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="grid grid-cols-3 gap-3"
                  >
                    {[
                      { value: "CASH", label: "Tiền mặt" },
                      { value: "CARD", label: "Thẻ ngân hàng" },
                      { value: "TRANSFER", label: "Chuyển khoản" },
                    ].map(({ value, label }) => (
                      <Label
                        key={value}
                        htmlFor={`pay-${value}`}
                        className={cn(
                          "flex items-center justify-center gap-2 rounded-lg border-2 p-3 cursor-pointer text-sm font-medium transition-all",
                          paymentMethod === value
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={value} id={`pay-${value}`} className="sr-only" />
                        {label}
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>

              <Button
                className="w-full gap-2 h-11"
                disabled={isSavingInvoice}
                onClick={handleUpsertInvoice}
              >
                {isSavingInvoice ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : folio.invoice ? (
                  <CheckCircle className="size-4" />
                ) : (
                  <Receipt className="size-4" />
                )}
                {folio.invoice ? "Cập nhật hóa đơn" : "Tạo hóa đơn & Thanh toán"}
              </Button>
            </TabsContent>

            {/* ── TAB 4: TÁC VỤ (GIA HẠN / ĐỔI PHÒNG) ───────────────────── */}
            <TabsContent value="actions" className="space-y-4">
              {/* Gia hạn */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <CalendarPlus className="size-4 text-primary" />
                    Gia hạn lưu trú
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs">Ngày trả phòng hiện tại</Label>
                      <div className="mt-1.5 flex h-9 items-center rounded-md border bg-muted px-3 text-sm">
                        {format(checkOut, "dd/MM/yyyy", { locale: vi })}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="extend-days" className="text-xs">
                        Gia hạn thêm (đêm)
                      </Label>
                      <Input
                        id="extend-days"
                        type="number"
                        min={1}
                        max={30}
                        value={extendDays}
                        onChange={(e) => setExtendDays(Math.max(1, parseInt(e.target.value) || 1))}
                        className="mt-1.5 h-9"
                      />
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted/60 p-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày trả phòng mới</span>
                      <span className="font-medium">{format(newCheckOutDate, "dd/MM/yyyy", { locale: vi })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Chi phí thêm ({extendDays} ×{" "}
                        {formatCurrency(
                          priceType === "hourly" ? rt.hourlyPrice * 24 : priceType === "day" ? rt.dayPrice : rt.nightPrice
                        )})
                      </span>
                      <span className="font-medium text-amber-600">
                        +
                        {formatCurrency(
                          priceType === "hourly"
                            ? extendDays * 24 * rt.hourlyPrice
                            : priceType === "day"
                              ? extendDays * rt.dayPrice
                              : extendDays * rt.nightPrice
                        )}
                      </span>
                    </div>
                  </div>

                  <Button onClick={handleExtendStay} className="w-full gap-2" variant="outline">
                    <CalendarPlus className="size-4" />
                    Xác nhận gia hạn
                  </Button>
                </CardContent>
              </Card>

              {/* Đổi phòng */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                    <ArrowRightLeft className="size-4 text-primary" />
                    Đổi phòng
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground mb-1">Phòng hiện tại</p>
                    <div className="flex items-center gap-2">
                      <BedDouble className="size-4 text-primary" />
                      <span className="font-semibold">Phòng {folio.room.roomNumber}</span>
                      <Badge variant="outline" className="text-xs">
                        Tầng {folio.room.floor}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Chọn phòng mới (cùng loại {rt.name})</Label>
                    {availableRooms.length > 0 ? (
                      <Select value={selectedNewRoom} onValueChange={setSelectedNewRoom}>
                        <SelectTrigger className="mt-1.5 h-9">
                          <SelectValue placeholder="Chọn phòng..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRooms.map((room) => (
                            <SelectItem key={room.id} value={room.id}>
                              Phòng {room.roomNumber} – Tầng {room.floor}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1.5 flex items-center justify-center rounded-lg border border-dashed py-6 text-center">
                        <div>
                          <BedDouble className="size-6 text-muted-foreground mx-auto mb-1" />
                          <p className="text-sm text-muted-foreground">Không có phòng trống cùng loại</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {selectedNewRoom && (
                    <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800 dark:bg-emerald-950/30">
                      <CheckCircle className="size-4 text-emerald-600" />
                      <span className="text-sm text-emerald-700 dark:text-emerald-400">
                        Sẽ chuyển sang phòng{" "}
                        {availableRooms.find((r) => r.id === selectedNewRoom)?.roomNumber}
                      </span>
                    </div>
                  )}

                  <Button
                    onClick={() => selectedNewRoom && onChangeRoom(folio.id, selectedNewRoom)}
                    disabled={!selectedNewRoom}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <ArrowRightLeft className="size-4" />
                    Xác nhận đổi phòng
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
