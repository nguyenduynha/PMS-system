"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Utensils,
  Plus,
  Coffee,
  Car,
  Shirt,
  Waves,
} from "lucide-react";

interface HotelService {
  id: string;
  name: string;
  category: "FOOD" | "SPA" | "LAUNDRY" | "TRANSPORT" | "OTHER";
  price: number;
  unit: string;
  status: string;
}

function getIcon(category: string) {
  switch (category) {
    case "FOOD":
      return Coffee;
    case "LAUNDRY":
      return Shirt;
    case "SPA":
      return Waves;
    case "TRANSPORT":
      return Car;
    default:
      return Utensils;
  }
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function ServicesPage() {
  const [services, setServices] = useState<HotelService[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingService, setEditingService] = useState<HotelService | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState("lần");
  const [status, setStatus] = useState("ACTIVE");

  const loadData = async () => {
    try {
      const res = await fetch("/api/services");
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error("Failed to load services", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAdd = () => {
    setEditingService(null);
    setName("");
    setPrice("");
    setUnit("lần");
    setStatus("ACTIVE");
    setOpenDialog(true);
  };

  const handleOpenEdit = (service: HotelService) => {
    setEditingService(service);
    setName(service.name);
    setPrice(String(service.price));
    setUnit(service.unit);
    setStatus(service.status);
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!name || !price) {
      alert("Vui lòng nhập tên và giá dịch vụ");
      return;
    }

    try {
      const url = "/api/services";
      const method = editingService ? "PUT" : "POST";
      const body = editingService
        ? { id: editingService.id, name, price: Number(price), unit, status }
        : { name, price: Number(price), unit, status };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setOpenDialog(false);
        loadData();
      }
    } catch (err) {
      console.error("Failed to save service", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) return;
    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Failed to delete service", err);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Dịch vụ"
          subtitle="Quản lý dịch vụ khách sạn"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold font-sans">Quản lý dịch vụ</h2>
              <p className="text-sm text-muted-foreground">
                Nhà hàng, giặt ủi, spa, đưa đón sân bay...
              </p>
            </div>

            <Button onClick={handleOpenAdd}>
              <Plus className="mr-2 size-4" />
              Thêm dịch vụ
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = getIcon(service.category);

              return (
                <Card key={service.id} className="transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-primary/10 p-3 text-primary">
                        <Icon className="size-5" />
                      </div>

                      <Badge variant={service.status === "ACTIVE" ? "default" : "secondary"}>
                        {service.status === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}
                      </Badge>
                    </div>

                    <h3 className="mt-4 font-semibold text-lg line-clamp-1">
                      {service.name}
                    </h3>

                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                      {service.category}
                    </p>

                    <p className="mt-3 text-xl font-bold font-mono text-emerald-700">
                      {formatCurrency(service.price)}
                      <span className="text-xs text-muted-foreground font-normal lowercase"> / {service.unit}</span>
                    </p>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleOpenEdit(service)}
                      >
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() => handleDelete(service.id)}
                      >
                        Xóa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Danh sách dịch vụ</CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">Tên dịch vụ</th>
                    <th className="p-4 text-left">Loại dịch vụ</th>
                    <th className="p-4 text-left">Giá</th>
                    <th className="p-4 text-left">Đơn vị</th>
                    <th className="p-4 text-left">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {services.map((service) => (
                    <tr key={service.id} className="border-b hover:bg-muted/40">
                      <td className="p-4 font-medium">{service.name}</td>
                      <td className="p-4 text-muted-foreground">{service.category}</td>
                      <td className="p-4 font-semibold font-mono">{formatCurrency(service.price)}</td>
                      <td className="p-4 font-mono">{service.unit}</td>
                      <td className="p-4">
                        <Badge variant={service.status === "ACTIVE" ? "default" : "secondary"}>
                          {service.status === "ACTIVE" ? "Hoạt động" : "Ngừng"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>
                  {editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ mới"}
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div>
                  <Label>Tên dịch vụ</Label>
                  <Input
                    placeholder="Ví dụ: Giặt đồ vest, Massage mặt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Giá dịch vụ (VND)</Label>
                  <Input
                    type="number"
                    placeholder="100000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Đơn vị tính</Label>
                  <Input
                    placeholder="lần, kg, giờ, lượt..."
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Trạng thái</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Ngừng hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleSave}>
                  Lưu thay đổi
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}