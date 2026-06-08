"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Hotel, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Hotel className="size-7" />
          </div>

          <CardTitle className="text-2xl">Đăng nhập PMS</CardTitle>

          <p className="text-sm text-muted-foreground">
            Hệ thống quản lý khách sạn
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type="email" placeholder="admin" className="pl-9" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type="password" placeholder="Nhập mật khẩu" className="pl-9" />
            </div>
          </div>

          <Button
            className="w-full"
            onClick={() => router.push("/dashboard")}
          >
            Đăng nhập
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}