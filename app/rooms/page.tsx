"use client";

import { useState } from "react";
import type { RoomWithType, RoomStatus, MaintenanceRecordWithDetails, Amenity, MaintenanceStatus, BookingFolio } from "@/lib/types";
import { 
  getRoomsWithTypes, 
  roomTypes, 
  getMaintenanceRecordsWithDetails, 
  getMaintenanceStaff,
  amenities as initialAmenities,
  rooms as allRooms,
  getBookingFolioByRoomId,
  bookings,
} from "@/lib/mock-data";
import { BookingFolioDialog } from "@/components/booking-folio";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { RoomStatusBadge } from "@/components/room-status-badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";

const amenityIcons: Record<string, React.ElementType> = {
  Wifi: Wifi,
  Tv: Tv,
  Wind: Wind,
  Wine: Wine,
  Bath: Bath,
  UtensilsCrossed: UtensilsCrossed,
  Sofa: Sofa,
  Lock: Lock,
  Coffee: Coffee,
  Shirt: Shirt,
  Fence: Fence,
  DoorOpen: DoorOpen,
};

const amenityNameToIcon: Record<string, string> = {
  "WiFi": "Wifi",
  "TV": "Tv",
  "Air Conditioning": "Wind",
  "Mini Bar": "Wine",
  "Balcony": "Fence",
  "Room Service": "UtensilsCrossed",
  "Living Room": "Sofa",
  "Jacuzzi": "Bath",
};

const statusOptions: { value: RoomStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "DIRTY", label: "Dirty" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const filterOptions = [
  { value: "all", label: "All Rooms" },
  { value: "AVAILABLE", label: "Available" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "DIRTY", label: "Dirty" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

const amenityCategories = ["COMFORT", "ENTERTAINMENT", "BATHROOM", "KITCHEN", "OUTDOOR"] as const;

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

export default function RoomsPage() {
  // Room state
  const [rooms, setRooms] = useState<RoomWithType[]>(getRoomsWithTypes());
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [floorFilter, setFloorFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<RoomWithType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<RoomStatus | "">("");

  // Booking Folio state
  const [selectedFolio, setSelectedFolio] = useState<BookingFolio | null>(null);
  const [isFolioOpen, setIsFolioOpen] = useState(false);
  const [bookingsState, setBookingsState] = useState(bookings);

  // Maintenance state
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordWithDetails[]>(
    getMaintenanceRecordsWithDetails()
  );
  const [isMaintenanceDialogOpen, setIsMaintenanceDialogOpen] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    roomId: "",
    description: "",
    staffId: "",
    repairCost: "",
  });

  // Amenity state
  const [amenities, setAmenities] = useState<Amenity[]>(initialAmenities);
  const [isAmenityDialogOpen, setIsAmenityDialogOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | null>(null);
  const [amenityForm, setAmenityForm] = useState({
    name: "",
    icon: "",
    category: "" as Amenity["category"] | "",
  });

  const maintenanceStaff = getMaintenanceStaff();
  const availableRoomsForMaintenance = rooms.filter(r => r.status !== "MAINTENANCE");

  const filteredRooms = rooms.filter((room) => {
    if (statusFilter !== "all" && room.status !== statusFilter) return false;
    if (floorFilter !== "all" && room.floor !== parseInt(floorFilter)) return false;
    if (typeFilter !== "all" && room.roomTypeId !== typeFilter) return false;
    return true;
  });

  const floors = [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b);

  const handleRoomClick = (room: RoomWithType) => {
    // If room is occupied, open the Booking Folio instead
    if (room.status === "OCCUPIED") {
      const folio = getBookingFolioByRoomId(room.id);
      if (folio) {
        setSelectedFolio(folio);
        setIsFolioOpen(true);
        return;
      }
    }
    // Otherwise open the regular status update dialog
    setSelectedRoom(room);
    setNewStatus(room.status);
    setIsDialogOpen(true);
  };

  // Booking Folio handlers
  const handleExtendStay = (bookingId: string, newCheckOutDate: string, newTotalAmount: number) => {
    setBookingsState((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, checkOutDate: newCheckOutDate, totalAmount: newTotalAmount }
          : b
      )
    );
    // Update the folio state
    if (selectedFolio && selectedFolio.id === bookingId) {
      setSelectedFolio({
        ...selectedFolio,
        checkOutDate: newCheckOutDate,
        totalAmount: newTotalAmount,
      });
    }
    setIsFolioOpen(false);
  };

  const handleChangeRoom = (bookingId: string, newRoomId: string) => {
    const oldRoomId = selectedFolio?.room.id;
    
    // Update booking with new room
    setBookingsState((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, roomId: newRoomId } : b))
    );
    
    // Update room statuses
    setRooms((prev) =>
      prev.map((room) => {
        if (room.id === oldRoomId) {
          return { ...room, status: "DIRTY" as RoomStatus };
        }
        if (room.id === newRoomId) {
          return { ...room, status: "OCCUPIED" as RoomStatus };
        }
        return room;
      })
    );
    
    setIsFolioOpen(false);
    setSelectedFolio(null);
  };

  const handleStatusUpdate = () => {
    if (!selectedRoom || !newStatus) return;

    setRooms((prev) =>
      prev.map((room) =>
        room.id === selectedRoom.id ? { ...room, status: newStatus } : room
      )
    );
    setIsDialogOpen(false);
    setSelectedRoom(null);
    setNewStatus("");
  };

  // Maintenance handlers
  const handleStartMaintenance = () => {
    setMaintenanceForm({ roomId: "", description: "", staffId: "", repairCost: "" });
    setIsMaintenanceDialogOpen(true);
  };

  const handleCreateMaintenance = () => {
    if (!maintenanceForm.roomId || !maintenanceForm.description || !maintenanceForm.staffId) return;

    const room = rooms.find(r => r.id === maintenanceForm.roomId);
    const staff = maintenanceStaff.find(s => s.id === maintenanceForm.staffId);
    if (!room || !staff) return;

    const newRecord: MaintenanceRecordWithDetails = {
      id: `mr-${Date.now()}`,
      roomId: maintenanceForm.roomId,
      description: maintenanceForm.description,
      startDate: new Date().toISOString().split("T")[0],
      repairCost: parseFloat(maintenanceForm.repairCost) || 0,
      status: "IN_PROGRESS",
      staffId: maintenanceForm.staffId,
      room: room,
      staff: staff,
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);
    setRooms(prev => prev.map(r => r.id === maintenanceForm.roomId ? { ...r, status: "MAINTENANCE" as RoomStatus } : r));
    setIsMaintenanceDialogOpen(false);
  };

  const handleCompleteMaintenance = (recordId: string) => {
    setMaintenanceRecords(prev => prev.map(r => {
      if (r.id === recordId) {
        return { ...r, status: "COMPLETED" as MaintenanceStatus, endDate: new Date().toISOString().split("T")[0] };
      }
      return r;
    }));
    
    const record = maintenanceRecords.find(r => r.id === recordId);
    if (record) {
      setRooms(prev => prev.map(r => r.id === record.roomId ? { ...r, status: "AVAILABLE" as RoomStatus } : r));
    }
  };

  // Amenity handlers
  const handleAddAmenity = () => {
    setEditingAmenity(null);
    setAmenityForm({ name: "", icon: "", category: "" });
    setIsAmenityDialogOpen(true);
  };

  const handleEditAmenity = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setAmenityForm({ name: amenity.name, icon: amenity.icon, category: amenity.category });
    setIsAmenityDialogOpen(true);
  };

  const handleSaveAmenity = () => {
    if (!amenityForm.name || !amenityForm.icon || !amenityForm.category) return;

    if (editingAmenity) {
      setAmenities(prev => prev.map(a => 
        a.id === editingAmenity.id 
          ? { ...a, name: amenityForm.name, icon: amenityForm.icon, category: amenityForm.category as Amenity["category"] }
          : a
      ));
    } else {
      const newAmenity: Amenity = {
        id: `a-${Date.now()}`,
        name: amenityForm.name,
        icon: amenityForm.icon,
        category: amenityForm.category as Amenity["category"],
      };
      setAmenities(prev => [...prev, newAmenity]);
    }
    setIsAmenityDialogOpen(false);
  };

  const handleDeleteAmenity = (amenityId: string) => {
    setAmenities(prev => prev.filter(a => a.id !== amenityId));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Room & Maintenance Management"
          subtitle={`${rooms.length} rooms | ${maintenanceRecords.filter(r => r.status === "IN_PROGRESS").length} active maintenance`}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="rooms" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="rooms" className="gap-2">
                <DoorOpen className="size-4" />
                Rooms
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="gap-2">
                <Wrench className="size-4" />
                Maintenance
              </TabsTrigger>
              <TabsTrigger value="amenities" className="gap-2">
                <Wifi className="size-4" />
                Amenities
              </TabsTrigger>
            </TabsList>

            {/* ROOMS TAB */}
            <TabsContent value="rooms" className="space-y-6">
              {/* Filters & View Toggle */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
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
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Floors</SelectItem>
                      {floors.map((floor) => (
                        <SelectItem key={floor} value={floor.toString()}>
                          Floor {floor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Room Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {roomTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                

                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
                  <TabsList>
                    <TabsTrigger value="list" className="gap-2">
                      <List className="size-4" />
                      <span className="hidden sm:inline">Table</span>
                    </TabsTrigger>
                    <TabsTrigger value="grid" className="gap-2">
                      <LayoutGrid className="size-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Results Count */}
              <p className="text-sm text-muted-foreground">
                Showing {filteredRooms.length} of {rooms.length} rooms
              </p>

              {/* DataTable View */}
              {viewMode === "list" && (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Room No.</TableHead>
                        <TableHead>Room Type</TableHead>
                        <TableHead>Floor</TableHead>
                        <TableHead>Amenities</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Price/Night</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRooms.map((room) => (
                        <TableRow key={room.id}>
                          <TableCell className="font-semibold">{room.roomNumber}</TableCell>
                          <TableCell>
                            <Badge variant={
                              room.roomType.name === "Suite" ? "default" :
                              room.roomType.name === "Deluxe" ? "secondary" : "outline"
                            }>
                              {room.roomType.name}
                            </Badge>
                          </TableCell>
                          <TableCell>Floor {room.floor}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              {room.roomType.amenities.slice(0, 4).map((amenity) => {
                                const iconName = amenityNameToIcon[amenity] || "Wifi";
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
                              {room.roomType.amenities.length > 4 && (
                                <span className="text-xs text-muted-foreground">
                                  +{room.roomType.amenities.length - 4}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="size-4 text-muted-foreground" />
                              <span>{room.roomType.capacity}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(room.roomType.pricePerNight)}
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

              {/* Grid View */}
              {viewMode === "grid" && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredRooms.map((room) => (
                    <Card
                      key={room.id}
                      className="cursor-pointer transition-shadow hover:shadow-md"
                      onClick={() => handleRoomClick(room)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Room {room.roomNumber}</h3>
                            <p className="text-sm text-muted-foreground">
                              Floor {room.floor} - {room.roomType.name}
                            </p>
                          </div>
                          <RoomStatusBadge status={room.status} />
                        </div>

                        <div className="mt-4 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Users className="size-4" />
                            <span>{room.roomType.capacity} guests</span>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(room.roomType.pricePerNight)}/night
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {room.roomType.amenities.slice(0, 4).map((amenity) => {
                            const iconName = amenityNameToIcon[amenity] || "Wifi";
                            const Icon = amenityIcons[iconName] || Wifi;
                            return (
                              <div
                                key={amenity}
                                className="flex size-7 items-center justify-center rounded bg-muted"
                                title={amenity}
                              >
                                <Icon className="size-3.5 text-muted-foreground" />
                              </div>
                            );
                          })}
                          {room.roomType.amenities.length > 4 && (
                            <div className="flex size-7 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                              +{room.roomType.amenities.length - 4}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {filteredRooms.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <LayoutGrid className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No rooms found</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try adjusting your filters to see more results.
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
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* MAINTENANCE TAB */}
            <TabsContent value="maintenance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Maintenance Records</h2>
                  <p className="text-sm text-muted-foreground">
                    Track and manage room maintenance activities
                  </p>
                </div>
                <Button onClick={handleStartMaintenance}>
                  <Plus data-icon="inline-start" />
                  Start Maintenance
                </Button>
              </div>

              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead className="min-w-[250px]">Description</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="text-right">Repair Cost</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {maintenanceRecords.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                          No maintenance records found
                        </TableCell>
                      </TableRow>
                    ) : (
                      maintenanceRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{record.room.roomNumber}</span>
                              <Badge variant="outline" className="text-xs">
                                {record.room.roomType.name}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="max-w-[300px] truncate" title={record.description}>
                              {record.description}
                            </p>
                          </TableCell>
                          <TableCell>{format(new Date(record.startDate), "MMM dd, yyyy")}</TableCell>
                          <TableCell>{record.staff.name}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(record.repairCost)}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={record.status === "COMPLETED" ? "default" : "secondary"}
                              className={cn(
                                record.status === "COMPLETED" && "bg-emerald-100 text-emerald-800",
                                record.status === "IN_PROGRESS" && "bg-amber-100 text-amber-800"
                              )}
                            >
                              {record.status === "IN_PROGRESS" && <Clock className="mr-1 size-3" />}
                              {record.status === "COMPLETED" && <CheckCircle className="mr-1 size-3" />}
                              {record.status === "IN_PROGRESS" ? "In Progress" : "Completed"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {record.status === "IN_PROGRESS" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteMaintenance(record.id)}
                              >
                                <CheckCircle data-icon="inline-start" />
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Card>

              {/* Maintenance Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Jobs</p>
                        <p className="text-2xl font-bold">
                          {maintenanceRecords.filter(r => r.status === "IN_PROGRESS").length}
                        </p>
                      </div>
                      <div className="rounded-full bg-amber-100 p-3">
                        <Clock className="size-5 text-amber-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Completed This Month</p>
                        <p className="text-2xl font-bold">
                          {maintenanceRecords.filter(r => r.status === "COMPLETED").length}
                        </p>
                      </div>
                      <div className="rounded-full bg-emerald-100 p-3">
                        <CheckCircle className="size-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Repair Cost</p>
                        <p className="text-2xl font-bold">
                          {formatCurrency(maintenanceRecords.reduce((sum, r) => sum + r.repairCost, 0))}
                        </p>
                      </div>
                      <div className="rounded-full bg-blue-100 p-3">
                        <Wrench className="size-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* AMENITIES TAB */}
            <TabsContent value="amenities" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Amenity Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Add, edit, and organize room amenities by category
                  </p>
                </div>
                <Button onClick={handleAddAmenity}>
                  <Plus data-icon="inline-start" />
                  Add Amenity
                </Button>
              </div>

              {/* Amenities Grid by Category */}
              <div className="grid gap-6">
                {amenityCategories.map((category) => {
                  const categoryAmenities = amenities.filter(a => a.category === category);
                  if (categoryAmenities.length === 0) return null;

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">{category}</CardTitle>
                        <CardDescription>
                          {categoryAmenities.length} {categoryAmenities.length === 1 ? "amenity" : "amenities"}
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
                                  <span className="font-medium">{amenity.name}</span>
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
                                    onClick={() => handleDeleteAmenity(amenity.id)}
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

              {/* Empty Categories Notice */}
              {amenityCategories.filter(cat => amenities.some(a => a.category === cat)).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-4">
                    <Wifi className="size-8 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">No amenities yet</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get started by adding your first amenity.
                  </p>
                  <Button className="mt-4" onClick={handleAddAmenity}>
                    <Plus data-icon="inline-start" />
                    Add Amenity
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>

      {/* Room Status Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Room Status</DialogTitle>
            <DialogDescription>
              {selectedRoom && (
                <>
                  Room {selectedRoom.roomNumber} - {selectedRoom.roomType.name}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRoom && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Current Status</span>
                  <div className="mt-1">
                    <RoomStatusBadge status={selectedRoom.status} />
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Floor</span>
                  <p className="mt-1 font-medium">Floor {selectedRoom.floor}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity</span>
                  <p className="mt-1 font-medium">{selectedRoom.roomType.capacity} guests</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Price</span>
                  <p className="mt-1 font-medium">{formatCurrency(selectedRoom.roomType.pricePerNight)}/night</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">New Status</label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as RoomStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
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

              <div className="space-y-2">
                <span className="text-sm font-medium">Amenities</span>
                <div className="flex flex-wrap gap-2">
                  {selectedRoom.roomType.amenities.map((amenity) => {
                    const iconName = amenityNameToIcon[amenity] || "Wifi";
                    const Icon = amenityIcons[iconName] || Wifi;
                    return (
                      <div
                        key={amenity}
                        className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs"
                      >
                        <Icon className="size-3" />
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate} disabled={!newStatus || newStatus === selectedRoom?.status}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Start Maintenance Dialog */}
      <Dialog open={isMaintenanceDialogOpen} onOpenChange={setIsMaintenanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Maintenance</DialogTitle>
            <DialogDescription>
              Create a new maintenance record and assign staff
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Room</label>
              <Select 
                value={maintenanceForm.roomId} 
                onValueChange={(v) => setMaintenanceForm(prev => ({ ...prev, roomId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoomsForMaintenance.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      Room {room.roomNumber} - {room.roomType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Description</label>
              <Textarea 
                placeholder="Describe the maintenance issue..."
                value={maintenanceForm.description}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Staff</label>
              <Select 
                value={maintenanceForm.staffId} 
                onValueChange={(v) => setMaintenanceForm(prev => ({ ...prev, staffId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {maintenanceStaff.map((staff) => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estimated Repair Cost</label>
              <Input 
                type="number"
                placeholder="0.00"
                value={maintenanceForm.repairCost}
                onChange={(e) => setMaintenanceForm(prev => ({ ...prev, repairCost: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsMaintenanceDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateMaintenance}
              disabled={!maintenanceForm.roomId || !maintenanceForm.description || !maintenanceForm.staffId}
            >
              Start Maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Amenity Add/Edit Dialog */}
      <Dialog open={isAmenityDialogOpen} onOpenChange={setIsAmenityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAmenity ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
            <DialogDescription>
              {editingAmenity ? "Update amenity details" : "Create a new amenity for room types"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Amenity Name</label>
              <Input 
                placeholder="e.g., Swimming Pool"
                value={amenityForm.name}
                onChange={(e) => setAmenityForm(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={amenityForm.category} 
                onValueChange={(v) => setAmenityForm(prev => ({ ...prev, category: v as Amenity["category"] }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {amenityCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Icon</label>
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
                    onClick={() => setAmenityForm(prev => ({ ...prev, icon: name }))}
                  >
                    <Icon className="size-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAmenityDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAmenity}
              disabled={!amenityForm.name || !amenityForm.icon || !amenityForm.category}
            >
              {editingAmenity ? "Save Changes" : "Add Amenity"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Booking Folio Dialog */}
      <BookingFolioDialog
        folio={selectedFolio}
        open={isFolioOpen}
        onOpenChange={setIsFolioOpen}
        onExtendStay={handleExtendStay}
        onChangeRoom={handleChangeRoom}
      />
    </div>
  );
}
