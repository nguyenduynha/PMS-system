// Room Status Types
export type RoomStatus = "AVAILABLE" | "OCCUPIED" | "DIRTY" | "MAINTENANCE";

// Booking Status Types
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED";

// Service Category Types
export type ServiceCategory = "FOOD" | "SPA" | "LAUNDRY" | "TRANSPORT" | "OTHER";

// Price Type
export type PriceType = "hourly" | "day" | "night";

// Room Type Entity
export interface RoomType {
  id: string;
  name: string;
  hourlyPrice: number;
  dayPrice: number;
  nightPrice: number;
  capacity: number;
  description?: string | null;
  amenities: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  status: RoomStatus;
  roomTypeId: string;
  floor: number | null;
  note?: string | null;
  roomType?: RoomType;
  createdAt?: string;
  updatedAt?: string;
}

// Booking Entity
export interface Booking {
  id: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  guestCount: number;
  status: BookingStatus;
  totalAmount: number;
  priceType: PriceType;
  createdAt: string;
  bookingSource?: string;
}

// Service Entity
export interface Service {
  id: string;
  name: string;
  price: number;
  unit?: string;
  status: string;
  category: ServiceCategory;
}

// BookingService (dịch vụ đã dùng trong booking)
export interface BookingServiceItem {
  id: string;
  bookingId: string;
  serviceId: string;
  serviceName: string;
  serviceUnit: string;
  quantity: number;
  price: number;       // đơn giá tại thời điểm thêm
  totalAmount: number; // price × quantity
  createdAt: string;
}

// Invoice Entity
export interface Invoice {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  subTotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

// Invoice summary for folio display
export interface InvoiceSummary {
  roomAmount: number;
  serviceTotal: number;
  subTotal: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
}

// Maintenance Record Types
export type MaintenanceStatus = "IN_PROGRESS" | "COMPLETED";

export interface MaintenanceRecord {
  id: string;
  roomId: string;
  description: string;
  startDate: string;
  endDate?: string;
  repairCost: number;
  status: MaintenanceStatus;
  staffId: string;
}

// Staff/User Entity
export interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF" | "HOUSEKEEPING" | "MAINTENANCE";
}

// Amenity Entity
export interface Amenity {
  id: string;
  name: string;
  icon: string;
  category: "COMFORT" | "ENTERTAINMENT" | "BATHROOM" | "KITCHEN" | "OUTDOOR";
}

// Guest Entity
export interface Guest {
  id: string;
  bookingId: string;
  name: string;
  idType: "PASSPORT" | "ID_CARD" | "DRIVER_LICENSE";
  idNumber: string;
  phone: string;
  isPrimary: boolean;
}

// Extended types for UI
export interface RoomWithType extends Room {
  roomType: RoomType;
}

export interface BookingWithRoom extends Booking {
  room: RoomWithType;
}

export interface MaintenanceRecordWithDetails extends MaintenanceRecord {
  room: RoomWithType;
  staff: User;
}

// Booking Folio with all details
export interface BookingFolio extends Booking {
  room: RoomWithType;
  guests: Guest[];
  bookingServices: BookingServiceItem[];
  invoice?: Invoice | null;
}
