"use client";

import { useState } from "react";
import { hasPermission, useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; 
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutGrid, Edit, Plus, Trash2, Wifi, Tv, Wind, Wine, Fence, 
  UtensilsCrossed, Sofa, Bath, Lock, Coffee, Shirt, Search,
  Bed, Check, Wrench, Sparkles, AlertCircle, CalendarRange
} from "lucide-react"; 
import { RoomStatusBadge } from "@/components/room-status-badge";
import { BookingTimeline } from "@/components/booking-timeline";
import { RoomWithType, Amenity } from "@/lib/types";

// Ánh xạ các icon tiện nghi trực tiếp trong component
const amenityIcons: Record<string, React.ElementType> = { 
  Wifi, 
  Tv, 
  Wind, 
  Wine, 
  Fence, 
  UtensilsCrossed, 
  Sofa, 
  Bath, 
  Lock, 
  Coffee, 
  Shirt 
};

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function getRoomAmenities(room: any): string[] {
  return room.amenities && room.amenities.length > 0
    ? room.amenities
    : (room.roomType?.amenities || []);
}

function getFlagEmoji(nationality: string) {
  if (!nationality) return "🇻🇳";
  const name = nationality.toLowerCase().trim();
  if (name.includes("việt nam") || name.includes("vietnam")) return "🇻🇳";
  if (name.includes("ireland") || name.includes("ai len")) return "🇮🇪";
  if (name.includes("mỹ") || name.includes("usa") || name.includes("america") || name.includes("united states")) return "🇺🇸";
  if (name.includes("anh") || name.includes("uk") || name.includes("united kingdom") || name.includes("britain")) return "🇬🇧";
  if (name.includes("pháp") || name.includes("france")) return "🇫🇷";
  if (name.includes("đức") || name.includes("germany")) return "🇩🇪";
  if (name.includes("hàn quốc") || name.includes("korea")) return "🇰🇷";
  if (name.includes("nhật") || name.includes("japan")) return "🇯🇵";
  if (name.includes("trung quốc") || name.includes("china")) return "🇨🇳";
  if (name.includes("nga") || name.includes("russia")) return "🇷🇺";
  if (name.includes("úc") || name.includes("australia")) return "🇦🇺";
  if (name.includes("singapore")) return "🇸🇬";
  if (name.includes("canada")) return "🇨🇦";
  return "🏳️";
}

function getStatusStyles(status: string, isReserved: boolean) {
  if (status === "MAINTENANCE") {
    return {
      cardBg: "from-amber-500/5 to-amber-500/10 dark:from-amber-950/10 dark:to-amber-950/20",
      border: "border-amber-200 dark:border-amber-900/40 hover:border-amber-300",
      accentBar: "bg-amber-500",
      statusText: "text-amber-600 dark:text-amber-400",
      badgeText: "text-amber-700 dark:text-amber-300 border-amber-200/50",
      label: "Bảo trì",
      icon: Wrench
    };
  }
  if (status === "DIRTY") {
    return {
      cardBg: "from-slate-500/5 to-slate-500/10 dark:from-slate-900/10 dark:to-slate-900/20",
      border: "border-slate-200 dark:border-slate-800 hover:border-slate-300",
      accentBar: "bg-slate-500",
      statusText: "text-slate-500 dark:text-slate-400",
      badgeText: "text-slate-600 dark:text-slate-300 border-slate-200",
      label: "Cần dọn dẹp",
      icon: Sparkles
    };
  }
  if (status === "OCCUPIED") {
    return {
      cardBg: "from-red-500/5 to-red-500/10 dark:from-red-950/10 dark:to-red-950/20",
      border: "border-red-200 dark:border-red-900/40 hover:border-red-300",
      accentBar: "bg-red-500",
      statusText: "text-red-600 dark:text-red-400",
      badgeText: "text-red-700 dark:text-red-300 border-red-200/50",
      label: "Có khách",
      icon: Bed
    };
  }
  if (status === "RESERVED" || isReserved) {
    return {
      cardBg: "from-blue-500/5 to-blue-500/10 dark:from-blue-950/10 dark:to-blue-950/20",
      border: "border-blue-200 dark:border-blue-900/40 hover:border-blue-300",
      accentBar: "bg-blue-500",
      statusText: "text-blue-600 dark:text-blue-400",
      badgeText: "text-blue-700 dark:text-blue-300 border-blue-200/50",
      label: "Đã đặt",
      icon: Bed
    };
  }
  return {
    cardBg: "from-emerald-500/5 to-emerald-500/10 dark:from-emerald-950/10 dark:to-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-900/40 hover:border-emerald-300",
    accentBar: "bg-emerald-500",
    statusText: "text-emerald-600 dark:text-emerald-400",
    badgeText: "text-emerald-700 dark:text-emerald-300 border-emerald-200/50",
    label: "Phòng trống",
    icon: Check
  };
}

// Định nghĩa Props cho Component
interface RoomsTabProps {
  rooms: RoomWithType[];
  filteredRooms: RoomWithType[];
  allRoomsCount: number;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  floorFilter: string;
  setFloorFilter: (val: string) => void;
  typeFilter: string;
  setTypeFilter: (val: string) => void;
  filterOptions: any[];
  floors: number[];
  roomTypes: any[];
  amenities: Amenity[];
  viewMode: "grid" | "list" | "timeline";
  setViewMode: (val: "grid" | "list" | "timeline") => void;
  formatCurrency: (val: number) => string;
  onRoomClick: (room: RoomWithType) => void;
  onTimelineCreate: (roomId: string, checkInDate: Date, checkOutDate: Date) => void;
  onSaveRoom: (roomData: any) => void; 
  onDeleteRoom: (roomId: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export function RoomsTab({
  rooms,
  filteredRooms, statusFilter, setStatusFilter,
  allRoomsCount,
  floorFilter, setFloorFilter, typeFilter, setTypeFilter,
  filterOptions, floors, roomTypes, amenities, viewMode, setViewMode,
  formatCurrency, onRoomClick, onTimelineCreate, onSaveRoom, onDeleteRoom,
  searchQuery, setSearchQuery
}: RoomsTabProps) {
  const { user } = useAuth();
  const canCreateRoom = hasPermission(user, "ROOM_CREATE");
  const canUpdateRoom = hasPermission(user, "ROOM_UPDATE");
  const canDeleteRoom = hasPermission(user, "ROOM_DELETE");
  const canUpdateStatus = hasPermission(user, "ROOM_STATUS");
  const canUpdatePrice = hasPermission(user, "ROOM_PRICE");
  const canCreateBooking = hasPermission(user, "BOOKING_CREATE");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    roomCode: "",
    roomNumber: "",
    floor: "",
    roomTypeId: "",
    pricePerNight: "",
    maxGuests: "2",
    status: "AVAILABLE",
    description: "",
    amenityIds: [] as string[]
  });

  const stats = (rooms || []).reduce(
    (acc, r) => {
      const activeBooking = r.bookings?.[0];
      
      let displayStatus = r.status;
      let isReserved = false;
      
      if (activeBooking) {
        if (activeBooking.status === "CHECKED_IN") {
          displayStatus = "OCCUPIED";
        } else if (activeBooking.status === "PENDING" || activeBooking.status === "CONFIRMED") {
          if (r.status === "AVAILABLE" || r.status === "OCCUPIED") {
            isReserved = true;
            displayStatus = "RESERVED";
          }
        }
      }
      
      if (displayStatus === "MAINTENANCE") {
        acc.maintenance += 1;
      } else if (displayStatus === "DIRTY") {
        acc.dirty += 1;
      } else if (displayStatus === "OCCUPIED") {
        acc.occupied += 1;
        if (activeBooking && new Date(activeBooking.checkOutDate).toDateString() === new Date().toDateString()) {
          acc.pendingDeparture += 1;
        }
      } else if (displayStatus === "RESERVED") {
        acc.reserved += 1;
        if (activeBooking && new Date(activeBooking.checkInDate).toDateString() === new Date().toDateString()) {
          acc.pendingArrival += 1;
        }
      } else {
        acc.available += 1;
      }
      return acc;
    },
    { available: 0, reserved: 0, pendingArrival: 0, occupied: 0, pendingDeparture: 0, dirty: 0, maintenance: 0 }
  );

  const roomsByFloor = filteredRooms.reduce<Record<string, RoomWithType[]>>((groups, room) => {
    const floor = String(room.floor);
    if (!groups[floor]) groups[floor] = [];
    groups[floor].push(room);
    return groups;
  }, {});

  const timelineBookings = filteredRooms.flatMap((room: any) =>
    (room.bookings || []).map((booking: any) => ({ ...booking, roomId: room.id })),
  );

  const openForm = (room?: RoomWithType) => {
    if (room) {
      setEditingRoom(room);
      setFormData({
        roomCode: room.id || "", 
        roomNumber: room.roomNumber,
        floor: room.floor.toString(),
        roomTypeId: room.roomTypeId,
        pricePerNight: (room.pricePerNight ?? room.roomType.pricePerNight).toString(),
        maxGuests: (room.capacity ?? room.roomType.capacity ?? 2).toString(), 
        status: room.status,
        description: room.note || "",
        // Lấy danh sách ID tiện nghi bằng cách so khớp tên tiện nghi của phòng (không phân biệt hoa thường)
        amenityIds: amenities
          .filter((a) => getRoomAmenities(room).some((dbName: string) => dbName.toLowerCase() === a.name.toLowerCase()))
          .map((a) => a.id)
      });
    } else {
      setEditingRoom(null);
      setFormData({
        roomCode: "", roomNumber: "", floor: "", roomTypeId: "",
        pricePerNight: "", maxGuests: "2", status: "AVAILABLE", description: "",
        amenityIds: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleAmenityChange = (amenityId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenityIds: checked 
        ? [...prev.amenityIds, amenityId] 
        : prev.amenityIds.filter(id => id !== amenityId)
    }));
  };

  const handleSave = () => {
    onSaveRoom({ ...formData, id: editingRoom?.id });
    setIsDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3 text-xs font-semibold md:text-sm">
        <button 
          onClick={() => setStatusFilter("all")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "all"
              ? "bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>🟣 Tất cả ({allRoomsCount})</span>
        </button>

        <button 
          onClick={() => setStatusFilter("AVAILABLE")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "AVAILABLE"
              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>🟢 Trống ({stats.available})</span>
        </button>

        <button 
          onClick={() => setStatusFilter("RESERVED")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "RESERVED"
              ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>🔵 Đã đặt ({stats.reserved})</span>
        </button>

        <button 
          onClick={() => setStatusFilter("OCCUPIED")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "OCCUPIED"
              ? "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>🔴 Có khách ({stats.occupied})</span>
        </button>

        <button 
          onClick={() => setStatusFilter("DIRTY")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "DIRTY"
              ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>⚫ Bẩn ({stats.dirty})</span>
        </button>

        <button 
          onClick={() => setStatusFilter("MAINTENANCE")} 
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${
            statusFilter === "MAINTENANCE"
              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300"
              : "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
          }`}
        >
          <span>🛠️ Bảo trì ({stats.maintenance})</span>
        </button>
      </div>

      {/* Bộ lọc */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {/* Lọc trạng thái */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
                {filterOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.value === "all" ? "Tất cả trạng thái" : opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {/* Lọc tầng */}
          <Select value={floorFilter} onValueChange={setFloorFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Tất cả tầng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả tầng</SelectItem>
              {floors.map((fl) => (
                <SelectItem key={fl} value={fl.toString()}>
                  Tầng {fl}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Lọc loại phòng */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tất cả loại phòng" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả loại phòng</SelectItem>
              {roomTypes.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-60">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm số phòng, loại..."
              className="pl-9 h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {canCreateRoom && (
            <Button onClick={() => openForm()} className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Thêm phòng
            </Button>
          )}
        </div>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list" | "timeline")}>
          <TabsList>
            <TabsTrigger value="grid"><LayoutGrid className="size-4 mr-2" /> Lưới</TabsTrigger>
            <TabsTrigger value="timeline"><CalendarRange className="size-4 mr-2" /> Timeline</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent variant="right" className="overflow-hidden sm:max-w-[640px]">
          <DialogHeader className="p-6 pb-4 border-b shrink-0">
            <DialogTitle className="text-xl font-bold">
              {editingRoom ? `Chỉnh sửa phòng: ${editingRoom.roomNumber}` : "Thêm phòng mới"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-6 py-4 min-h-0">
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Mã phòng (Hệ thống tự tạo nếu bỏ trống)</Label>
                <Input placeholder="Tự động" value={formData.roomCode} onChange={(e) => setFormData({...formData, roomCode: e.target.value})} disabled={!!editingRoom} />
              </div>
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Số phòng *</Label>
                <Input placeholder="101" value={formData.roomNumber} onChange={(e) => setFormData({...formData, roomNumber: e.target.value})} />
              </div>
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Tầng *</Label>
                <Input type="number" value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} />
              </div>
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Loại phòng *</Label>
                <Select 
                  value={formData.roomTypeId} 
                  onValueChange={(val) => {
                    const selectedType = roomTypes.find(t => t.id === val);
                    if (selectedType) {
                      setFormData(prev => ({
                        ...prev,
                        roomTypeId: val,
                        pricePerNight: selectedType.pricePerNight?.toString() || prev.pricePerNight,
                        maxGuests: selectedType.capacity?.toString() || prev.maxGuests,
                        amenityIds: amenities
                          .filter(a => selectedType.amenities?.some((dbName: string) => dbName.toLowerCase() === a.name.toLowerCase()))
                          .map(a => a.id)
                      }));
                    } else {
                      setFormData(prev => ({ ...prev, roomTypeId: val }));
                    }
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Chọn loại phòng" /></SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Giá mỗi đêm (VNĐ) *</Label>
                <Input type="number" value={formData.pricePerNight} disabled={!canUpdatePrice} onChange={(e) => setFormData({...formData, pricePerNight: e.target.value})} />
              </div>
              <div className="space-y-2 text-left">
                <Label className="font-semibold">Số người tối đa *</Label>
                <Input type="number" value={formData.maxGuests} onChange={(e) => setFormData({...formData, maxGuests: e.target.value})} />
              </div>

              <div className="col-span-2 space-y-3 text-left">
                <Label className="font-semibold text-primary">Tiện nghi phòng</Label>
                <div className="grid grid-cols-3 gap-3 border p-3 rounded-md bg-muted/20">
                  {amenities.map((amenity: Amenity) => {
                    const Icon = amenityIcons[amenity.icon] || Wifi;
                    return (
                      <div key={amenity.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`amenity-${amenity.id}`} 
                          checked={formData.amenityIds.includes(amenity.id)}
                          onCheckedChange={(checked) => handleAmenityChange(amenity.id, !!checked)}
                        />
                        <label htmlFor={`amenity-${amenity.id}`} className="text-sm cursor-pointer flex items-center gap-2">
                          <Icon className="size-3.5 text-muted-foreground" />
                          {amenity.name}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2 col-span-2 text-left">
                <Label className="font-semibold">Mô tả</Label>
                <Textarea 
                  placeholder="Mô tả chi tiết..." 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 border-t bg-muted/10 shrink-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="px-8 bg-primary">Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hiển thị danh sách */}
      {viewMode === "timeline" ? (
        <Card className="overflow-hidden py-0">
          <BookingTimeline
            bookings={timelineBookings}
            rooms={filteredRooms}
            loading={false}
            canCreate={canCreateBooking}
            onCreate={onTimelineCreate}
            onBookingClick={(booking) => {
              const room = rooms.find((item) => item.id === booking.roomId);
              if (room) onRoomClick(room);
            }}
          />
        </Card>
      ) : viewMode === "list" ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phòng</TableHead>
                <TableHead>Loại & Tiện nghi</TableHead>
                <TableHead>Tầng</TableHead>
                <TableHead>Giá / đêm</TableHead>
                <TableHead>Thông tin đồng bộ</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRooms.map((room: any) => {
                const activeBooking = room.bookings?.[0];
                const activeMaintenance = room.maintenance?.[0];
                
                let displayStatus = room.status;
                let isReserved = false;
                
                if (activeBooking) {
                  if (activeBooking.status === "CHECKED_IN") {
                    displayStatus = "OCCUPIED";
                  } else if (activeBooking.status === "PENDING" || activeBooking.status === "CONFIRMED") {
                    isReserved = true;
                    displayStatus = "RESERVED";
                  }
                }

                return (
                  <TableRow key={room.id}>
                    <TableCell className="font-bold">{room.roomNumber}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="outline">{room.roomType.name}</Badge>
                        <div className="flex gap-1 mt-1">
                           {amenities
                            .filter((a) => getRoomAmenities(room).some((dbName: string) => dbName.toLowerCase() === a.name.toLowerCase()))
                            .slice(0, 4)
                            .map((a: Amenity) => {
                              const Icon = amenityIcons[a.icon] || Wifi;
                              return <Icon key={a.id} className="size-3.5 text-muted-foreground" />;
                            })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Tầng {room.floor}</TableCell>
                    <TableCell>{formatCurrency(room.pricePerNight ?? room.roomType.pricePerNight)}</TableCell>
                    <TableCell>
                      {displayStatus === "OCCUPIED" && activeBooking ? (
                        <span className="text-xs text-amber-700 font-medium">
                          👤 Khách: {activeBooking.customerName} (đến {formatDate(activeBooking.checkOutDate)})
                        </span>
                      ) : displayStatus === "RESERVED" && activeBooking ? (
                        <span className="text-xs text-purple-700 font-medium">
                          📅 Đã đặt: {activeBooking.customerName} (từ {formatDate(activeBooking.checkInDate)})
                        </span>
                      ) : displayStatus === "MAINTENANCE" && activeMaintenance ? (
                        <span className="text-xs text-destructive font-medium">
                          🔧 Bảo trì: {activeMaintenance.description}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell><RoomStatusBadge status={displayStatus} /></TableCell>
                    <TableCell className="text-right space-x-1">
                      {canUpdateStatus && room.status === "DIRTY" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8 text-xs font-semibold mr-2"
                          onClick={() => onSaveRoom({
                            id: room.id,
                            roomNumber: room.roomNumber,
                            floor: room.floor,
                            status: "AVAILABLE",
                            roomTypeId: room.roomTypeId,
                            pricePerNight: room.pricePerNight ?? room.roomType.pricePerNight,
                            maxGuests: room.capacity ?? room.roomType.capacity ?? 2,
                            description: room.note || ""
                          })}
                        >
                          Đã dọn dẹp
                        </Button>
                      )}
                      {canCreateBooking && displayStatus === "AVAILABLE" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50 h-8 text-xs font-semibold mr-2"
                          onClick={() => onRoomClick(room)}
                        >
                          Đặt nhanh
                        </Button>
                      )}
                      {(displayStatus === "OCCUPIED" || displayStatus === "RESERVED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 h-8 text-xs font-semibold mr-2"
                          onClick={() => onRoomClick(room)}
                        >
                          Thao tác
                        </Button>
                      )}
                      {(canUpdateRoom || canDeleteRoom) && (
                        <>
                          {canUpdateRoom && <Button variant="ghost" size="sm" onClick={() => openForm(room)}><Edit className="size-4" /></Button>}
                          {canDeleteRoom && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onDeleteRoom(room.id)}><Trash2 className="size-4" /></Button>}
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="space-y-7">
          {Object.keys(roomsByFloor).length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
              Không có phòng phù hợp với bộ lọc.
            </div>
          ) : Object.entries(roomsByFloor)
            .sort(([left], [right]) => Number(left) - Number(right))
            .map(([floor, floorRooms]) => (
              <section key={floor} className="space-y-3">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold uppercase text-slate-800 dark:text-slate-100">Tầng {floor}</h2>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {floorRooms.length} phòng
                  </span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                  {floorRooms.map((room: any) => {
                    const activeBooking = room.bookings?.[0];
                    const activeMaintenance = room.maintenance?.[0];
                    let displayStatus = room.status;
                    let isReserved = false;

                    if (activeBooking?.status === "CHECKED_IN") displayStatus = "OCCUPIED";
                    if (["PENDING", "CONFIRMED"].includes(activeBooking?.status)) {
                      displayStatus = "RESERVED";
                      isReserved = true;
                    }

                    const styles = getStatusStyles(displayStatus, isReserved);
                    const StatusIcon = styles.icon;
                    const sideColor =
                      displayStatus === "AVAILABLE" ? "bg-emerald-600" :
                      displayStatus === "RESERVED" ? "bg-blue-600" :
                      displayStatus === "OCCUPIED" ? "bg-rose-600" :
                      displayStatus === "DIRTY" ? "bg-slate-600" : "bg-amber-600";

                    return (
                      <Card
                        key={room.id}
                        className="group relative flex min-h-[128px] cursor-pointer flex-row overflow-hidden rounded-xl border bg-card p-0 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => onRoomClick(room)}
                      >
                        <div className={`flex w-[96px] shrink-0 flex-col items-center justify-between p-3 text-center text-white ${sideColor}`}>
                          <p className="w-full truncate text-[10px] font-semibold" title={room.roomType.name}>{room.roomType.name}</p>
                          <p className="text-2xl font-black tracking-tight">{room.roomNumber}</p>
                          <div className="flex items-center gap-1 text-[10px] font-semibold">
                            <StatusIcon className="size-4" />
                            <span>{styles.label}</span>
                          </div>
                        </div>

                        <div className="flex min-w-0 flex-1 flex-col justify-center p-3.5">
                          {displayStatus === "AVAILABLE" ? (
                            <div className="text-center">
                              <p className="font-bold text-emerald-600">Phòng trống</p>
                              <p className="mt-1 text-xs text-muted-foreground">Sẵn sàng · {room.capacity ?? room.roomType.capacity ?? 2} khách</p>
                              <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                {formatCurrency(Number(room.pricePerNight ?? room.roomType.pricePerNight))}
                              </p>
                            </div>
                          ) : activeBooking && ["OCCUPIED", "RESERVED"].includes(displayStatus) ? (
                            <div className="min-w-0 space-y-1">
                              <p className="flex items-center gap-1.5 truncate font-bold" title={activeBooking.customerName}>
                                <span>{getFlagEmoji(activeBooking.nationality)}</span>
                                <span className="truncate">{activeBooking.customerName}</span>
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {formatDate(activeBooking.checkInDate)} - {formatDate(activeBooking.checkOutDate)}
                              </p>
                              <p className="truncate text-xs text-slate-600 dark:text-slate-300">
                                {activeBooking.bookingSource === "WALK_IN" ? "Walk-in" : activeBooking.bookingSource}
                              </p>
                              <p className="text-xs font-semibold">
                                {formatCurrency(Number(activeBooking.totalAmount || room.pricePerNight || room.roomType.pricePerNight))}
                              </p>
                              {displayStatus === "RESERVED" && (
                                <p className="pt-1 text-[11px] font-bold text-emerald-600">Bấm vào phòng để nhận phòng</p>
                              )}
                            </div>
                          ) : displayStatus === "DIRTY" ? (
                            <div className="text-center">
                              <p className="font-bold text-slate-700 dark:text-slate-200">Phòng cần dọn</p>
                              <p className="mt-1 text-xs text-muted-foreground">Chờ bộ phận buồng phòng xử lý</p>
                              {canUpdateStatus && <p className="mt-2 text-[11px] font-semibold text-emerald-600">Bấm để cập nhật</p>}
                            </div>
                          ) : (
                            <div className="text-center">
                              <p className="font-bold text-amber-700 dark:text-amber-400">Đang bảo trì</p>
                              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{activeMaintenance?.description || "Đang tạm khóa phòng"}</p>
                            </div>
                          )}

                          {canUpdateRoom && (
                            <button
                              className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-primary group-hover:opacity-100"
                              onClick={(event) => { event.stopPropagation(); openForm(room); }}
                              title="Sửa thông tin phòng"
                            >
                              <Edit className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
        </div>
      )}
    </div>
  );
}
