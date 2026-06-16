"use client";

import { useEffect, useState } from "react";
import type { ElementType } from "react";
import type {
  RoomWithType,
  RoomStatus,
  PriceType,
  MaintenanceRecordWithDetails,
  Amenity,
  BookingFolio,
  User,
} from "@/lib/types";
import { BookingFolioDialog } from "@/components/booking-folio";
import { cn } from "@/lib/utils";
import { format, differenceInDays, differenceInHours, parseISO } from "date-fns";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { RoomStatusBadge } from "@/components/room-status-badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutGrid,
  List,
  Users,
  Wifi,
  Tv,
  Wind,
  Wine,
  Bath,
  UtensilsCrossed,
  Sofa,
  Edit,
  Wrench,
  Plus,
  Lock,
  Coffee,
  Shirt,
  Fence,
  DoorOpen,
  Pencil,
  Trash2,
  CheckCircle,
  Clock,
  Sun,
  Moon,
  BedDouble,
} from "lucide-react";

const amenityIcons: Record<string, ElementType> = {
  Wifi,
  Tv,
  Wind,
  Wine,
  Bath,
  UtensilsCrossed,
  Sofa,
  Lock,
  Coffee,
  Shirt,
  Fence,
  DoorOpen,
};

const amenityNameToIcon: Record<string, string> = {
  WiFi: "Wifi",
  TV: "Tv",
  "Điều hòa": "Wind",
  Minibar: "Wine",
  "Ban công": "Fence",
  "Dịch vụ phòng": "UtensilsCrossed",
  "Phòng khách": "Sofa",
  Jacuzzi: "Bath",
};

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Phòng trống" },
  { value: "OCCUPIED", label: "Đang có khách" },
  { value: "DIRTY", label: "Cần dọn phòng" },
  { value: "MAINTENANCE", label: "Đang bảo trì" },
];

const filterOptions = [
  { value: "all", label: "Tất cả phòng" },
  { value: "AVAILABLE", label: "Phòng trống" },
  { value: "OCCUPIED", label: "Đang có khách" },
  { value: "DIRTY", label: "Cần dọn phòng" },
  { value: "MAINTENANCE", label: "Đang bảo trì" },
];

const amenityCategories = [
  "COMFORT",
  "ENTERTAINMENT",
  "BATHROOM",
  "KITCHEN",
  "OUTDOOR",
] as const;

const categoryLabels: Record<string, string> = {
  COMFORT: "Tiện nghi",
  ENTERTAINMENT: "Giải trí",
  BATHROOM: "Phòng tắm",
  KITCHEN: "Đồ dùng phòng",
  OUTDOOR: "Ngoài trời",
};

const availableIcons = [
  { name: "Wifi", icon: Wifi },
  { name: "Tv", icon: Tv },
  { name: "Wind", icon: Wind },
  { name: "Wine", icon: Wine },
  { name: "Bath", icon: Bath },
  { name: "UtensilsCrossed", icon: UtensilsCrossed },
  { name: "Sofa", icon: Sofa },
  { name: "Lock", icon: Lock },
  { name: "Coffee", icon: Coffee },
  { name: "Shirt", icon: Shirt },
  { name: "Fence", icon: Fence },
  { name: "DoorOpen", icon: DoorOpen },
];

const initialAmenities: Amenity[] = [
  { id: "a-1", name: "WiFi miễn phí", icon: "Wifi", category: "COMFORT" },
  { id: "a-2", name: "Tivi", icon: "Tv", category: "ENTERTAINMENT" },
  { id: "a-3", name: "Máy điều hòa", icon: "Wind", category: "COMFORT" },
  { id: "a-4", name: "Minibar", icon: "Wine", category: "KITCHEN" },
  { id: "a-5", name: "Ban công", icon: "Fence", category: "OUTDOOR" },
];

export default function RoomsPage() {
  const [rooms, setRooms] = useState<RoomWithType[]>([]);
  const [roomTypes, setRoomTypes] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<RoomStatus | "">("")

  // ── Booking Folio (phòng OCCUPIED) ──
  const [selectedFolio, setSelectedFolio] = useState<BookingFolio | null>(null);
  const [isFolioOpen, setIsFolioOpen] = useState(false);
  const [folioInitialTab, setFolioInitialTab] = useState<"info" | "services" | "invoice" | "actions">("info");

  // ── Tạo Booking (phòng AVAILABLE) ──
  const [isCreateBookingOpen, setIsCreateBookingOpen] = useState(false);
  const [bookingTargetRoom, setBookingTargetRoom] = useState<RoomWithType | null>(null);
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    guestCount: "1",
    checkInDate: today,
    checkOutDate: tomorrow,
    priceType: "night" as PriceType,
    bookingSource: "WALK_IN",
  });
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecordWithDetails[]
  >([]);
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomId: "",
    description: "",
    staffId: "",
    repairCost: "",
  });

  const [staffList, setStaffList] = useState<User[]>([]);

  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [isAmenityDialogOpen, setIsAmenityDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [amenityForm, setAmenityForm] = useState({
    name: "",
    icon: "",
    category: "" as Amenity["category"] | "",
  });

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [roomForm, setRoomForm] = useState({
    roomNumber: "",
    floor: "",
    roomTypeId: "",
    status: "AVAILABLE" as RoomStatus,
  });

  const loadData = async () => {
    try {
      const resRooms = await fetch("/api/rooms");

      if (resRooms.ok) {
        const data = await resRooms.json();
        setRooms(data.rooms || []);
        setRoomTypes(data.roomTypes || []);
      }

      const resMaint = await fetch("/api/maintenance");

      if (resMaint.ok) {
        const records = await resMaint.json();
        setMaintenanceRecords(records || []);
      }

      const resUsers = await fetch("/api/users");

      if (resUsers.ok) {
        const users = await resUsers.json();
        setStaffList(users || []);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu quản lý phòng:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (amount: any) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const maintenanceStaff = staffList.filter((u) => u.role === "MAINTENANCE");

  const availableRoomsForMaintenance = rooms.filter(
    (room) => room.status !== "MAINTENANCE"
  );

  const filteredRooms = rooms.filter((room: any) => {
    if (statusFilter !== "all" && room.status !== statusFilter) return false;
    if (floorFilter !== "all" && String(room.floor) !== floorFilter) return false;
    if (typeFilter !== "all" && String(room.roomTypeId) !== typeFilter) return false;
    return true;
  });

  const floors = [...new Set(rooms.map((room: any) => room.floor))]
    .filter(Boolean)
    .sort((a: any, b: any) => Number(a) - Number(b));

  const handleRoomClick = async (room: RoomWithType) => {
    if (room.status === "OCCUPIED") {
      try {
        const res = await fetch(`/api/bookings?roomId=${room.id}`);
        if (res.ok) {
          const folio = await res.json();
          if (folio && folio.id) {
            setSelectedFolio(folio);
            setFolioInitialTab("info");
            setIsFolioOpen(true);
            return;
          }
        }
      } catch (err) {
        console.error("Lỗi tải thông tin đặt phòng:", err);
      }
      // Phòng OCCUPIED nhưng không có booking trong DB (seed data)
      // ⇒ Mở form tạo booking để người dùng có thể thêm dịch vụ
      setBookingTargetRoom(room);
      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      setBookingForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        guestCount: "1",
        checkInDate: todayStr,
        checkOutDate: tomorrowStr,
        priceType: "night",
        bookingSource: "WALK_IN",
      });
      setIsCreateBookingOpen(true);
      return;
    }

    if (room.status === "AVAILABLE") {
      setBookingTargetRoom(room);
      const todayStr = new Date().toISOString().split("T")[0];
      const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];
      setBookingForm({
        customerName: "",
        customerPhone: "",
        customerEmail: "",
        guestCount: "1",
        checkInDate: todayStr,
        checkOutDate: tomorrowStr,
        priceType: "night",
        bookingSource: "WALK_IN",
      });
      setIsCreateBookingOpen(true);
      return;
    }

    setSelectedRoom(room);
    setNewStatus(room.status);
    setIsDialogOpen(true);
  };

  // Tính tiền phòng dự kiến khi tạo booking
  const calcEstimatedAmount = (): number => {
    if (!bookingTargetRoom) return 0;
    const rt = bookingTargetRoom.roomType;
    try {
      const checkIn = parseISO(bookingForm.checkInDate);
      const checkOut = parseISO(bookingForm.checkOutDate);
      if (bookingForm.priceType === "hourly") {
        const hours = Math.max(1, differenceInHours(checkOut, checkIn));
        return hours * rt.hourlyPrice;
      }
      if (bookingForm.priceType === "day") {
        const days = Math.max(1, differenceInDays(checkOut, checkIn));
        return days * rt.dayPrice;
      }
      const nights = Math.max(1, differenceInDays(checkOut, checkIn));
      return nights * rt.nightPrice;
    } catch {
      return 0;
    }
  };

  const handleCreateBookingSubmit = async () => {
    if (!bookingTargetRoom) return;
    if (!bookingForm.customerName || !bookingForm.customerPhone || !bookingForm.checkInDate || !bookingForm.checkOutDate) {
      alert("Vui lòng điền đầy đủ tên khách, SĐT và ngày lưu trú");
      return;
    }
    setIsCreatingBooking(true);
    try {
      const totalAmount = calcEstimatedAmount();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: bookingTargetRoom.id,
          checkInDate: bookingForm.checkInDate,
          checkOutDate: bookingForm.checkOutDate,
          customerName: bookingForm.customerName.trim(),
          customerPhone: bookingForm.customerPhone.trim(),
          customerEmail: bookingForm.customerEmail.trim() || undefined,
          guestCount: Number(bookingForm.guestCount) || 1,
          priceType: bookingForm.priceType,
          totalAmount,
          status: "CHECKED_IN",
          bookingSource: bookingForm.bookingSource,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Không thể tạo đặt phòng");
        return;
      }
      setIsCreateBookingOpen(false);
      loadData();
      // Mở ngay folio của booking vừa tạo và chuyển thẳng sang tab Dịch vụ
      if (data && data.id) {
        setSelectedFolio(data);
        setFolioInitialTab("services");
        setIsFolioOpen(true);
      }
    } catch (err) {
      console.error("Lỗi tạo booking:", err);
      alert("Có lỗi xảy ra khi tạo đặt phòng");
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!roomForm.roomNumber || !roomForm.floor || !roomForm.roomTypeId) {
      alert("Vui lòng nhập đầy đủ số phòng, tầng và loại phòng");
      return;
    }

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomNumber: roomForm.roomNumber.trim(),
          floor: Number(roomForm.floor),
          roomTypeId: String(roomForm.roomTypeId),
          status: roomForm.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Không thể tạo phòng");
        return;
      }

      setRoomForm({
        roomNumber: "",
        floor: "",
        roomTypeId: "",
        status: "AVAILABLE",
      });

      setIsAddRoomOpen(false);
      loadData();
    } catch (error) {
      console.error("Lỗi tạo phòng:", error);
      alert("Có lỗi xảy ra khi tạo phòng");
    }
  };

  const handleExtendStay = async (
    bookingId: string,
    newCheckOutDate: string,
    newTotalAmount: number
  ) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "extend",
          id: bookingId,
          newCheckOutDate,
          newTotalAmount,
        }),
      });

      if (res.ok) {
        setIsFolioOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Lỗi gia hạn lưu trú:", err);
    }
  };

  const handleChangeRoom = async (bookingId: string, newRoomId: string) => {
    try {
      const res = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "change_room",
          id: bookingId,
          newRoomId,
        }),
      });

      if (res.ok) {
        setIsFolioOpen(false);
        setSelectedFolio(null);
        loadData();
      }
    } catch (err) {
      console.error("Lỗi đổi phòng:", err);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRoom || !newStatus) return;

    try {
      const res = await fetch("/api/rooms", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedRoom.id, status: newStatus }),
      });

      if (res.ok) {
        setIsDialogOpen(false);
        setSelectedRoom(null);
        setNewStatus("");
        loadData();
      }
    } catch (err) {
      console.error("Lỗi cập nhật trạng thái phòng:", err);
    }
  };

  const handleStartMaintenance = () => {
    setMaintenanceForm({
      roomId: "",
      description: "",
      staffId: "",
      repairCost: "",
    });
    setIsMaintenanceDialogOpen(true);
  };

  const handleCreateMaintenance = async () => {
    if (
      !maintenanceForm.roomId ||
      !maintenanceForm.description ||
      !maintenanceForm.staffId
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bảo trì");
      return;
    }

    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: maintenanceForm.roomId,
          description: maintenanceForm.description,
          staffId: maintenanceForm.staffId,
          repairCost: parseFloat(maintenanceForm.repairCost) || 0,
        }),
      });

      if (res.ok) {
        setIsMaintenanceDialogOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Lỗi tạo phiếu bảo trì:", err);
    }
  };

  const handleCompleteMaintenance = async (recordId: string) => {
    try {
      const res = await fetch("/api/maintenance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: recordId }),
      });

      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Lỗi hoàn tất bảo trì:", err);
    }
  };

  const handleAddAmenity = () => {
    setEditingAmenity(null);
    setAmenityForm({ name: "", icon: "", category: "" });
    setIsAmenityDialogOpen(true);
  };

  const handleEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setAmenityForm({
      name: amenity.name,
      icon: amenity.icon,
      category: amenity.category,
    });
    setIsAmenityDialogOpen(true);
  };

  const handleSaveAmenity = () => {
    if (!amenityForm.name || !amenityForm.icon || !amenityForm.category) return;

    if (editingAmenity) {
      setAmenities((prev) =>
        prev.map((item) =>
          item.id === editingAmenity.id
            ? {
              ...item,
              name: amenityForm.name,
              icon: amenityForm.icon,
              category: amenityForm.category as Amenity["category"],
            }
            : item
        )
      );
    } else {
      const newAmenity: Amenity = {
        id: `a-${Date.now()}`,
        name: amenityForm.name,
        icon: amenityForm.icon,
        category: amenityForm.category as Amenity["category"],
      };

      setAmenities((prev) => [...prev, newAmenity]);
    }

    setIsAmenityDialogOpen(false);
  };

  const handleDeleteAmenity = (amenityId: string) => {
    setAmenities((prev) => prev.filter((item) => item.id !== amenityId));
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Quản lý phòng và bảo trì"
          subtitle={`${rooms.length} phòng | ${maintenanceRecords.filter((r) => r.status === "IN_PROGRESS").length
            } phiếu bảo trì đang xử lý`}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="rooms" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="rooms" className="gap-2">
                <DoorOpen className="size-4" />
                Phòng
              </TabsTrigger>

              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench className="size-4" />
                Bảo trì
              </TabsTrigger>

              <TabsTrigger value="amenities" className="gap-2">
                <Wifi className="size-4" />
                Tiện nghi
              </TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {filterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={floorFilter} onValueChange={setFloorFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Tầng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả tầng</SelectItem>
                      {floors.map((floor: any) => (
                        <SelectItem key={String(floor)} value={String(floor)}>
                          Tầng {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[170px]">
                      <SelectValue placeholder="Loại phòng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại phòng</SelectItem>
                      {roomTypes.map((type: any) => (
                        <SelectItem key={String(type.id)} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button onClick={() => setIsAddRoomOpen(true)}>
                    <Plus className="mr-2 size-4" />
                    Tạo phòng
                  </Button>

                  <Tabs
                    value={viewMode}
                    onValueChange={(value) =>
                      setViewMode(value as "grid" | "list")
                    }
                  >
                    <TabsList>
                      <TabsTrigger value="list" className="gap-2">
                        <List className="size-4" />
                        <span className="hidden sm:inline">Bảng</span>
                      </TabsTrigger>

                      <TabsTrigger value="grid" className="gap-2">
                        <LayoutGrid className="size-4" />
                        <span className="hidden sm:inline">Lưới</span>
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Đang hiển thị {filteredRooms.length} / {rooms.length} phòng
              </p>

              {viewMode === "list" && (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Số phòng</TableHead>
                        <TableHead>Loại phòng</TableHead>
                        <TableHead>Tầng</TableHead>
                        <TableHead>Tiện nghi</TableHead>
                        <TableHead>Sức chứa</TableHead>
                        <TableHead>Giá phòng</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead className="text-right">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredRooms.map((room: any) => (
                        <TableRow key={String(room.id)}>
                          <TableCell className="font-semibold">
                            {room.roomNumber}
                          </TableCell>

                          <TableCell>
                            <Badge variant="outline">{room.roomType?.name}</Badge>
                          </TableCell>

                          <TableCell>Tầng {room.floor}</TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              {(room.roomType?.amenities || [])
                                .slice(0, 4)
                                .map((amenity: string) => {
                                  const iconName =
                                    amenityNameToIcon[amenity] || "Wifi";
                                  const Icon = amenityIcons[iconName] || Wifi;

                                  return (
                                    <div
                                      key={amenity}
                                      className="flex size-6 items-center justify-center rounded bg-muted"
                                      title={amenity}
                                    >
                                      <Icon className="size-3 text-muted-foreground" />
                                    </div>
                                  );
                                })}

                              {(room.roomType?.amenities || []).length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{room.roomType.amenities.length - 4}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="size-4 text-muted-foreground" />
                              <span>{room.roomType?.capacity} khách</span>
                            </div>
                          </TableCell>

                          <TableCell className="font-medium">
                            <div className="space-y-1 text-sm">
                              <div>
                                Giờ: {formatCurrency(room.roomType?.hourlyPrice)}
                              </div>
                              <div>
                                Ngày: {formatCurrency(room.roomType?.dayPrice)}
                              </div>
                              <div>
                                Đêm: {formatCurrency(room.roomType?.nightPrice)}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <RoomStatusBadge status={room.status} />
                          </TableCell>

                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRoomClick(room)}
                            >
                              <Edit className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {viewMode === "grid" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredRooms.map((room: any) => (
                    <Card
                      key={String(room.id)}
                      className={cn(
                        "cursor-pointer border transition-shadow hover:shadow-md",

                        room.status === "AVAILABLE" &&
                        "bg-emerald-700 border-emerald-800 text-white",

                        room.status === "OCCUPIED" &&
                        "bg-blue-700 border-blue-800 text-white",

                        room.status === "DIRTY" &&
                        "bg-amber-600 border-amber-700 text-white",

                        room.status === "MAINTENANCE" &&
                        "bg-red-700 border-red-800 text-white"
                      )}
                      onClick={() => handleRoomClick(room)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">
                              Phòng {room.roomNumber}
                            </h3>

                            <p className="text-sm text-white/80">
                              Tầng {room.floor} - {room.roomType?.name}
                            </p>
                          </div>

                          <RoomStatusBadge status={room.status} />
                        </div>

                        <div className="mt-4 flex items-center gap-1 text-sm text-white/80">
                          <Users className="size-4" />
                          <span>{room.roomType?.capacity} khách</span>
                        </div>

                        <div className="mt-4 space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-white/80">
                              Giá giờ:
                            </span>

                            <span className="font-semibold">
                              {formatCurrency(room.roomType?.hourlyPrice)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-white/80">
                              Giá ngày:
                            </span>

                            <span className="font-semibold">
                              {formatCurrency(room.roomType?.dayPrice)}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-white/80">
                              Giá đêm:
                            </span>

                            <span className="font-semibold">
                              {formatCurrency(room.roomType?.nightPrice)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <LayoutGrid className="size-8 text-muted-foreground" />
                  </div>

                  <h3 className="mt-4 text-lg font-semibold">
                    Không tìm thấy phòng
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Hãy thử thay đổi bộ lọc để xem thêm kết quả.
                  </p>

                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setStatusFilter("all");
                      setFloorFilter("all");
                      setTypeFilter("all");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Danh sách bảo trì</h2>
                  <p className="text-sm text-muted-foreground">
                    Theo dõi và quản lý các công việc bảo trì phòng
                  </p>
                </div>

                <Button onClick={handleStartMaintenance}>
                  <Plus className="mr-2 size-4" />
                  Tạo phiếu bảo trì
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Mô tả sự cố</TableHead>
                      <TableHead>Ngày bắt đầu</TableHead>
                      <TableHead>Nhân viên phụ trách</TableHead>
                      <TableHead className="text-right">Chi phí</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {maintenanceRecords.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          Chưa có phiếu bảo trì nào
                        </TableCell>
                      </TableRow>
                    ) : (
                      maintenanceRecords.map((record: any) => (
                        <TableRow key={String(record.id)}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">
                                {record.room?.roomNumber}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {record.room?.roomType?.name}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            <p
                              className="max-w-[300px] truncate"
                              title={record.description}
                            >
                              {record.description}
                            </p>
                          </TableCell>

                          <TableCell>
                            {record.startDate
                              ? format(new Date(record.startDate), "dd/MM/yyyy")
                              : "Chưa có"}
                          </TableCell>

                          <TableCell>{record.staff?.name}</TableCell>

                          <TableCell className="text-right font-medium">
                            {formatCurrency(record.repairCost)}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant={
                                record.status === "COMPLETED"
                                  ? "default"
                                  : "secondary"
                              }
                              className={cn(
                                record.status === "COMPLETED" &&
                                "bg-emerald-100 text-emerald-800",
                                record.status === "IN_PROGRESS" &&
                                "bg-amber-100 text-amber-800"
                              )}
                            >
                              {record.status === "IN_PROGRESS" && (
                                <Clock className="mr-1 size-3" />
                              )}

                              {record.status === "COMPLETED" && (
                                <CheckCircle className="mr-1 size-3" />
                              )}

                              {record.status === "IN_PROGRESS"
                                ? "Đang xử lý"
                                : "Hoàn thành"}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right">
                            {record.status === "IN_PROGRESS" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  handleCompleteMaintenance(record.id)
                                }
                              >
                                <CheckCircle className="mr-1 size-3" />
                                Hoàn tất
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Quản lý tiện nghi</h2>
                  <p className="text-sm text-muted-foreground">
                    Thêm, sửa, xóa và phân loại tiện nghi phòng
                  </p>
                </div>

                <Button onClick={handleAddAmenity}>
                  <Plus className="mr-2 size-4" />
                  Thêm tiện nghi
                </Button>
              </div>

              <div className="grid gap-6">
                {amenityCategories.map((category) => {
                  const categoryAmenities = amenities.filter(
                    (item) => item.category === category
                  );

                  if (categoryAmenities.length === 0) return null;

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">
                          {categoryLabels[category]}
                        </CardTitle>
                        <CardDescription>
                          {categoryAmenities.length} tiện nghi
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                          {categoryAmenities.map((amenity) => {
                            const Icon = amenityIcons[amenity.icon] || Wifi;

                            return (
                              <div
                                key={amenity.id}
                                className="group flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/10">
                                    <Icon className="size-4 text-primary" />
                                  </div>

                                  <span className="font-medium">
                                    {amenity.name}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0"
                                    onClick={() => handleEditAmenity(amenity)}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>

                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="size-8 p-0 text-destructive hover:text-destructive"
                                    onClick={() =>
                                      handleDeleteAmenity(amenity.id)
                                    }
                                  >
                                    <Trash2 className="size-3.5" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cập nhật trạng thái phòng</DialogTitle>
            <DialogDescription>
              {selectedRoom && (
                <>
                  Phòng {selectedRoom.roomNumber} - {selectedRoom.roomType.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Trạng thái hiện tại
                  </span>
                  <div className="mt-1">
                    <RoomStatusBadge status={selectedRoom.status} />
                  </div>
                </div>

                <div>
                  <span className="text-muted-foreground">Tầng</span>
                  <p className="mt-1 font-medium">Tầng {selectedRoom.floor}</p>
                </div>

                <div>
                  <span className="text-muted-foreground">Sức chứa</span>
                  <p className="mt-1 font-medium">
                    {selectedRoom.roomType.capacity} khách
                  </p>
                </div>


              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái mới</label>

                <Select
                  value={newStatus}
                  onValueChange={(value) => setNewStatus(value as RoomStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>

                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Hủy
            </Button>

            <Button
              onClick={handleStatusUpdate}
              disabled={!newStatus || newStatus === selectedRoom?.status}
            >
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isMaintenanceDialogOpen}
        onOpenChange={setIsMaintenanceDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phiếu bảo trì</DialogTitle>
            <DialogDescription>
              Tạo phiếu bảo trì mới và phân công nhân viên xử lý
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chọn phòng</label>

              <Select
                value={maintenanceForm.roomId}
                onValueChange={(value) =>
                  setMaintenanceForm((prev) => ({
                    ...prev,
                    roomId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn phòng cần bảo trì" />
                </SelectTrigger>

                <SelectContent>
                  {availableRoomsForMaintenance.map((room: any) => (
                    <SelectItem key={String(room.id)} value={String(room.id)}>
                      Phòng {room.roomNumber} - {room.roomType?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Mô tả sự cố</label>

              <Textarea
                placeholder="Nhập nội dung sự cố cần bảo trì..."
                value={maintenanceForm.description}
                onChange={(event) =>
                  setMaintenanceForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nhân viên phụ trách</label>

              <Select
                value={maintenanceForm.staffId}
                onValueChange={(value) =>
                  setMaintenanceForm((prev) => ({
                    ...prev,
                    staffId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhân viên" />
                </SelectTrigger>

                <SelectContent>
                  {maintenanceStaff.map((staff: any) => (
                    <SelectItem key={String(staff.id)} value={String(staff.id)}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Chi phí dự kiến</label>

              <Input
                type="number"
                placeholder="Nhập chi phí"
                value={maintenanceForm.repairCost}
                onChange={(event) =>
                  setMaintenanceForm((prev) => ({
                    ...prev,
                    repairCost: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsMaintenanceDialogOpen(false)}
            >
              Hủy
            </Button>

            <Button
              onClick={handleCreateMaintenance}
              disabled={
                !maintenanceForm.roomId ||
                !maintenanceForm.description ||
                !maintenanceForm.staffId
              }
            >
              Tạo phiếu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAmenityDialogOpen} onOpenChange={setIsAmenityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAmenity ? "Sửa tiện nghi" : "Thêm tiện nghi"}
            </DialogTitle>

            <DialogDescription>
              {editingAmenity
                ? "Cập nhật thông tin tiện nghi"
                : "Tạo tiện nghi mới cho loại phòng"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên tiện nghi</label>

              <Input
                placeholder="Ví dụ: Hồ bơi, Két sắt, Máy sấy tóc..."
                value={amenityForm.name}
                onChange={(event) =>
                  setAmenityForm((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục</label>

              <Select
                value={amenityForm.category}
                onValueChange={(value) =>
                  setAmenityForm((prev) => ({
                    ...prev,
                    category: value as Amenity["category"],
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>

                <SelectContent>
                  {amenityCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryLabels[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Biểu tượng</label>

              <div className="grid grid-cols-6 gap-2">
                {availableIcons.map(({ name, icon: Icon }) => (
                  <button
                    key={name}
                    type="button"
                    className={cn(
                      "flex size-10 items-center justify-center rounded-lg border transition-colors",
                      amenityForm.icon === name
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:bg-muted"
                    )}
                    onClick={() =>
                      setAmenityForm((prev) => ({
                        ...prev,
                        icon: name,
                      }))
                    }
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAmenityDialogOpen(false)}
            >
              Hủy
            </Button>

            <Button
              onClick={handleSaveAmenity}
              disabled={
                !amenityForm.name ||
                !amenityForm.icon ||
                !amenityForm.category
              }
            >
              {editingAmenity ? "Lưu thay đổi" : "Thêm tiện nghi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo phòng mới</DialogTitle>
            <DialogDescription>
              Nhập thông tin phòng cần thêm vào hệ thống. Giá phòng sẽ lấy theo
              loại phòng.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Số phòng</label>
              <Input
                placeholder="Ví dụ: 407"
                value={roomForm.roomNumber}
                onChange={(event) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    roomNumber: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tầng</label>
              <Input
                type="number"
                placeholder="Ví dụ: 4"
                value={roomForm.floor}
                onChange={(event) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    floor: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loại phòng</label>
              <Select
                value={roomForm.roomTypeId}
                onValueChange={(value) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    roomTypeId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại phòng" />
                </SelectTrigger>

                <SelectContent>
                  {roomTypes.map((type: any) => (
                    <SelectItem key={String(type.id)} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select
                value={roomForm.status}
                onValueChange={(value) =>
                  setRoomForm((prev) => ({
                    ...prev,
                    status: value as RoomStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="AVAILABLE">Phòng trống</SelectItem>
                  <SelectItem value="DIRTY">Cần dọn phòng</SelectItem>
                  <SelectItem value="MAINTENANCE">Đang bảo trì</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handleCreateRoom}>Tạo phòng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog Tạo Booking Mới (phòng AVAILABLE) ── */}
      <Dialog open={isCreateBookingOpen} onOpenChange={setIsCreateBookingOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <BedDouble className="size-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle>Tạo đặt phòng mới</DialogTitle>
                <DialogDescription>
                  {bookingTargetRoom && (
                    <>
                      Phòng {bookingTargetRoom.roomNumber} – {bookingTargetRoom.roomType.name} – Tầng {bookingTargetRoom.floor}
                    </>
                  )}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Thông tin khách */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Users className="size-4 text-primary" />
                Thông tin khách
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tên khách hàng *</Label>
                  <Input
                    placeholder="Nguyễn Văn A"
                    value={bookingForm.customerName}
                    onChange={(e) => setBookingForm((p) => ({ ...p, customerName: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Số điện thoại *</Label>
                  <Input
                    placeholder="0912 345 678"
                    value={bookingForm.customerPhone}
                    onChange={(e) => setBookingForm((p) => ({ ...p, customerPhone: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={bookingForm.customerEmail}
                    onChange={(e) => setBookingForm((p) => ({ ...p, customerEmail: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Số khách</Label>
                  <Input
                    type="number"
                    min={1}
                    max={bookingTargetRoom?.roomType.capacity ?? 10}
                    value={bookingForm.guestCount}
                    onChange={(e) => setBookingForm((p) => ({ ...p, guestCount: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Ngày lưu trú */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                Thời gian lưu trú
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Ngày nhận phòng *</Label>
                  <Input
                    type="date"
                    value={bookingForm.checkInDate}
                    onChange={(e) => setBookingForm((p) => ({ ...p, checkInDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Ngày trả phòng *</Label>
                  <Input
                    type="date"
                    value={bookingForm.checkOutDate}
                    onChange={(e) => setBookingForm((p) => ({ ...p, checkOutDate: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Loại giá */}
            {bookingTargetRoom && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Sun className="size-4 text-primary" />
                  Loại giá
                </h4>
                <RadioGroup
                  value={bookingForm.priceType}
                  onValueChange={(v) => setBookingForm((p) => ({ ...p, priceType: v as PriceType }))}
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { value: "hourly", label: "Giá giờ", price: bookingTargetRoom.roomType.hourlyPrice, icon: Clock, unit: "/giờ" },
                    { value: "day", label: "Giá ngày", price: bookingTargetRoom.roomType.dayPrice, icon: Sun, unit: "/ngày" },
                    { value: "night", label: "Giá đêm", price: bookingTargetRoom.roomType.nightPrice, icon: Moon, unit: "/đêm" },
                  ].map(({ value, label, price, icon: Icon, unit }) => (
                    <Label
                      key={value}
                      htmlFor={`booking-price-${value}`}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 cursor-pointer transition-all",
                        bookingForm.priceType === value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={value} id={`booking-price-${value}`} className="sr-only" />
                      <Icon className="size-4" />
                      <p className="text-xs font-medium">{label}</p>
                      <p className="text-sm font-bold">{formatCurrency(price)}</p>
                      <p className="text-xs opacity-60">{unit}</p>
                    </Label>
                  ))}
                </RadioGroup>

                {/* Preview tiền */}
                <div className="rounded-lg bg-muted/60 p-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tiền phòng dự kiến</span>
                  <span className="font-bold text-primary text-base">{formatCurrency(calcEstimatedAmount())}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Nguồn booking */}
            <div className="space-y-1.5">
              <Label className="text-xs">Nguồn đặt phòng</Label>
              <Select
                value={bookingForm.bookingSource}
                onValueChange={(v) => setBookingForm((p) => ({ ...p, bookingSource: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WALK_IN">Walk-in (Trực tiếp)</SelectItem>
                  <SelectItem value="PHONE">Điện thoại</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="AGENT">Đại lý</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateBookingOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleCreateBookingSubmit}
              disabled={isCreatingBooking || !bookingForm.customerName || !bookingForm.customerPhone}
              className="gap-2"
            >
              {isCreatingBooking ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle className="size-4" />
                  Nhận phòng ngay
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookingFolioDialog
        folio={selectedFolio}
        open={isFolioOpen}
        onOpenChange={setIsFolioOpen}
        onExtendStay={handleExtendStay}
        onChangeRoom={handleChangeRoom}
        onFolioUpdate={loadData}
        initialTab={folioInitialTab}
      />
    </div>
  );
}