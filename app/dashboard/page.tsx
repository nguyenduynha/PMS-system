import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { StatsCard } from "@/components/stats-card";
import { RoomGrid } from "@/components/room-grid";
import { RecentBookingsTable } from "@/components/recent-bookings-table";
import { QuickActions } from "@/components/quick-actions";
import {
  getDashboardStats,
  getRoomsWithTypes,
  getBookingsWithRooms,
} from "@/lib/mock-data";
import {
  BedDouble,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";


export default function DashboardPage() {
  const stats = getDashboardStats();
  const rooms = getRoomsWithTypes();
  const bookings = getBookingsWithRooms();

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Dashboard"
          subtitle="Welcome back! Here's your hotel overview."
        />
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Rooms"
              value={stats.totalRooms}
              subtitle={`${stats.availableRooms} available`}
              icon={BedDouble}
              variant="default"
            />
            <StatsCard
              title="Occupancy Rate"
              value={`${stats.occupancyRate}%`}
              subtitle={`${stats.occupiedRooms} rooms occupied`}
              icon={TrendingUp}
              trend={{ value: 8, isPositive: true }}
              variant="info"
            />
            <StatsCard
              title="Active Guests"
              value={stats.activeBookings}
              subtitle="Current check-ins"
              icon={Users}
              variant="success"
            />
            <StatsCard
              title="Today's Revenue"
              value={`$${stats.todayRevenue.toLocaleString()}`}
              subtitle="From all bookings"
              icon={DollarSign}
              trend={{ value: 12, isPositive: true }}
              variant="success"
            />
          </div>

          {/* Room Status Alert */}
          {(stats.dirtyRooms > 0 || stats.maintenanceRooms > 0) && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertCircle className="size-5 text-amber-600" />
              <div className="text-sm">
                <span className="font-medium text-amber-700">Attention needed: </span>
                <span className="text-amber-600">
                  {stats.dirtyRooms > 0 && `${stats.dirtyRooms} room${stats.dirtyRooms > 1 ? "s" : ""} need cleaning`}
                  {stats.dirtyRooms > 0 && stats.maintenanceRooms > 0 && ", "}
                  {stats.maintenanceRooms > 0 && `${stats.maintenanceRooms} room${stats.maintenanceRooms > 1 ? "s" : ""} under maintenance`}
                </span>
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {/* Room Grid - Takes 2 columns */}
            <div className="lg:col-span-2">
              <RoomGrid rooms={rooms} />
            </div>

            {/* Quick Actions - Takes 1 column */}
            <div>
              <QuickActions />
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mt-6">
            <RecentBookingsTable bookings={bookings} />
          </div>
        </main>
      </div>
    </div>
  );
}
