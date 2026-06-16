"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarDays,
  Utensils,
  Receipt,
  Settings,
  Hotel,
  Users,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

const navigation = [
  { name: "Tổng quan", href: "/", icon: LayoutDashboard },
  { name: "Quản lý phòng", href: "/rooms", icon: BedDouble },
  { name: "Đặt phòng", href: "/bookings", icon: CalendarDays },
  { name: "Dịch vụ", href: "/services", icon: Utensils },
  { name: "Hóa đơn", href: "/invoices", icon: Receipt },
  { name: "Tài khoản", href: "/users", icon: Users },
  { name: "Thu chi", href: "/finance", icon: Wallet },
  { name: "Thống kê", href: "/reports", icon: BarChart3 },
];

const bottomNavigation = [
  { name: "Cài đặt", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "sticky left-0 top-0 flex h-screen flex-col border-r border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300",
          collapsed ? "w-20" : "w-72"
        )}
      >
        <div className="flex h-20 items-center gap-3 border-b border-slate-200 px-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-200">
            <Hotel className="size-6" />
          </div>

          {!collapsed && (
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-slate-900">
                PMS Khách Sạn
              </h1>
              <p className="truncate text-xs text-slate-500">
                Hotel Management System
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            const content = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0 transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-blue-600"
                  )}
                />

                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return content;
          })}
        </nav>

        <div className="border-t border-slate-200 p-3">
          {bottomNavigation.map((item) => {
            const isActive = pathname === item.href;

            const content = (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                )}
              >
                <item.icon
                  className={cn(
                    "size-5 shrink-0",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-blue-600"
                  )}
                />

                {!collapsed && <span>{item.name}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>{content}</TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return content;
          })}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "mt-3 h-10 w-full rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900",
              collapsed ? "justify-center" : "justify-start px-3"
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4" />
                <span className="ml-2">Thu gọn</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}