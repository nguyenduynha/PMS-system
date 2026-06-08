import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Settings"
          subtitle="Configure your hotel system"
        />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md">
            <CardContent className="flex flex-col items-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Settings className="size-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Settings Module</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This page will contain system settings including user management,
                room configuration, pricing rules, and integrations.
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
