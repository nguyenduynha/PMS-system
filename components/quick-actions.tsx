"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus, CalendarPlus, ClipboardList } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    label: "New Booking",
    icon: CalendarPlus,
    href: "/bookings/new",
    description: "Create a reservation",
  },
  {
    label: "Walk-in Guest",
    icon: UserPlus,
    href: "/bookings/walk-in",
    description: "Quick check-in",
  },
  {
    label: "Room Service",
    icon: ClipboardList,
    href: "/services/new",
    description: "Add service order",
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto justify-start gap-3 p-3"
              asChild
            >
              <Link href={action.href}>
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <action.icon className="size-4 text-primary" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="text-sm font-medium">{action.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {action.description}
                  </span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
