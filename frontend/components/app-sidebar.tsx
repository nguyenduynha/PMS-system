"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  BedDouble,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Contact,
  LayoutDashboard,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
  Utensils,
  Wallet,
  Warehouse,
} from "lucide-react";
import { useAuth, hasPermission } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigationGroups = [
  {
    label: "Điều hành",
    items: [
      { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard, permission: "DASHBOARD_VIEW" },
      { name: "Quản lý phòng", href: "/rooms", icon: BedDouble, permission: "ROOM_VIEW" },
      { name: "Đặt phòng", href: "/bookings", icon: CalendarDays, permission: "BOOKING_VIEW" },
      { name: "Khách hàng", href: "/customers", icon: Contact, permission: "CUSTOMER_VIEW" },
    ],
  },
  {
    label: "Nghiệp vụ",
    items: [
      { name: "Dịch vụ", href: "/services", icon: Utensils, permission: "SERVICE_VIEW" },
      { name: "Hóa đơn", href: "/invoices", icon: Receipt, permission: "INVOICE_VIEW" },
      { name: "Quản lý kho", href: "/inventory", icon: Warehouse, permission: "INVENTORY_VIEW" },
      { name: "Thu chi", href: "/finance", icon: Wallet, permission: "FINANCE_VIEW" },
      { name: "Thống kê", href: "/reports", icon: BarChart3, permission: "REPORT_VIEW" },
    ],
  },
  {
    label: "Hệ thống",
    items: [
      { name: "Tài khoản & phân quyền", href: "/users", icon: Users, permission: "USER_VIEW" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "relative z-50 flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-sidebar-foreground shadow-sm transition-[width] duration-300",
          collapsed ? "w-[76px]" : "w-[272px]"
        )}
      >
        <div className={cn("flex h-[76px] shrink-0 items-center border-b border-white/10", collapsed ? "justify-center px-3" : "gap-3 px-5")}>
          <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-white p-1.5">
            <Image src="/hospicore-mark.svg" alt="HospiCore" width={32} height={32} priority />
            <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-[#0f1f3d] bg-emerald-400" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[16px] font-bold tracking-tight text-white">HospiCore</span>
              </div>
              <p className="mt-0.5 truncate text-[10px] font-medium tracking-wide text-slate-400">HOSPITALITY SOLUTIONS</p>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto overflow-x-hidden px-3 py-5">
          {navigationGroups.map((group) => {
            const visibleItems = group.items.filter((item) => user && hasPermission(user, item.permission));
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.label}>
                {!collapsed && (
                  <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
                    {group.label}
                  </p>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const active = isActive(item.href);
                    const navLink = (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "group relative flex h-11 items-center rounded-xl text-[13px] font-semibold transition-all duration-200",
                          collapsed ? "justify-center px-2" : "gap-3 px-3",
                          active
                            ? "bg-slate-800 text-white"
                            : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                        )}
                      >
                        {active && <span className="absolute left-0 h-6 w-1 rounded-r-full bg-blue-500" />}
                        <span className={cn(
                          "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                          active ? "bg-slate-700 text-blue-300" : "text-slate-400 group-hover:text-slate-200"
                        )}>
                          <item.icon className="size-[18px]" strokeWidth={2} />
                        </span>
                        {!collapsed && <span className="truncate">{item.name}</span>}
                        {!collapsed && active && <ChevronRight className="ml-auto size-3.5 text-slate-400" />}
                      </Link>
                    );

                    return collapsed ? (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>{navLink}</TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12} className="font-medium">{item.name}</TooltipContent>
                      </Tooltip>
                    ) : navLink;
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-slate-700 bg-slate-800/60 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <ShieldCheck className="size-4 text-emerald-400" />
                Hệ thống an toàn
              </div>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">Phiên làm việc đang được bảo vệ</p>
            </div>
          )}
          <Link
            href="/settings"
            className={cn(
              "flex h-10 items-center rounded-xl text-[13px] font-semibold text-slate-300 transition-colors hover:bg-white/[0.07] hover:text-white",
              collapsed ? "justify-center" : "gap-3 px-3",
              isActive("/settings") && "bg-white/[0.08] text-white"
            )}
          >
            <Settings className="size-[18px] shrink-0 text-slate-400" />
            {!collapsed && <span>Cài đặt hệ thống</span>}
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed((value) => !value)}
            className={cn(
              "mt-1 h-10 w-full rounded-xl text-slate-400 hover:bg-white/[0.07] hover:text-white",
              collapsed ? "justify-center px-0" : "justify-start gap-3 px-3"
            )}
            aria-label={collapsed ? "Mở rộng thanh điều hướng" : "Thu gọn thanh điều hướng"}
          >
            {collapsed ? <ChevronRight className="size-[18px]" /> : <><ChevronLeft className="size-[18px]" /><span className="text-xs font-semibold">Thu gọn menu</span></>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
