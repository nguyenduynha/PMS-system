import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Utensils,
  Plus,
  Coffee,
  Car,
  Shirt,
  Waves,
} from "lucide-react";

const services = [
  {
    id: 1,
    name: "Ăn sáng",
    category: "Nhà hàng",
    price: 150000,
    status: "ACTIVE",
    icon: Coffee,
  },
  {
    id: 2,
    name: "Giặt ủi",
    category: "Laundry",
    price: 50000,
    status: "ACTIVE",
    icon: Shirt,
  },
  {
    id: 3,
    name: "Spa",
    category: "Spa",
    price: 500000,
    status: "ACTIVE",
    icon: Waves,
  },
  {
    id: 4,
    name: "Đưa đón sân bay",
    category: "Transport",
    price: 300000,
    status: "ACTIVE",
    icon: Car,
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

export default function ServicesPage() {
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
              <h2 className="text-2xl font-bold">
                Quản lý dịch vụ
              </h2>

              <p className="text-sm text-muted-foreground">
                Nhà hàng, giặt ủi, spa, đưa đón sân bay...
              </p>
            </div>

            <Button>
              <Plus className="mr-2 size-4" />
              Thêm dịch vụ
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <Card key={service.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="rounded-full bg-muted p-3">
                        <Icon className="size-5" />
                      </div>

                      <Badge>
                        Hoạt động
                      </Badge>
                    </div>

                    <h3 className="mt-4 font-semibold">
                      {service.name}
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      {service.category}
                    </p>

                    <p className="mt-3 text-xl font-bold">
                      {formatCurrency(service.price)}
                    </p>

                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                      >
                        Sửa
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
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
              <CardTitle>
                Danh sách dịch vụ
              </CardTitle>
            </CardHeader>

            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="p-3 text-left">
                      Tên dịch vụ
                    </th>

                    <th className="p-3 text-left">
                      Loại
                    </th>

                    <th className="p-3 text-left">
                      Giá
                    </th>

                    <th className="p-3 text-left">
                      Trạng thái
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {services.map((service) => (
                    <tr
                      key={service.id}
                      className="border-b"
                    >
                      <td className="p-3">
                        {service.name}
                      </td>

                      <td className="p-3">
                        {service.category}
                      </td>

                      <td className="p-3">
                        {formatCurrency(service.price)}
                      </td>

                      <td className="p-3">
                        <Badge>
                          Hoạt động
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}