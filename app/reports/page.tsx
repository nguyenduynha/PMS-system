import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  CalendarCheck,
  DollarSign,
  Hotel,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Doanh thu hôm nay",
    value: "12.500.000đ",
    description: "+8% so với hôm qua",
    icon: DollarSign,
  },
  {
    title: "Tổng đặt phòng",
    value: "128",
    description: "Trong tháng này",
    icon: CalendarCheck,
  },
  {
    title: "Công suất phòng",
    value: "76%",
    description: "Phòng đang được sử dụng",
    icon: Hotel,
  },
  {
    title: "Khách lưu trú",
    value: "42",
    description: "Khách đang ở hiện tại",
    icon: Users,
  },
];

const revenueData = [
  { month: "T1", revenue: 45 },
  { month: "T2", revenue: 60 },
  { month: "T3", revenue: 52 },
  { month: "T4", revenue: 78 },
  { month: "T5", revenue: 90 },
  { month: "T6", revenue: 72 },
];

const bookingSources = [
  { source: "Walk-in", value: 35 },
  { source: "Booking.com", value: 28 },
  { source: "Agoda", value: 18 },
  { source: "Airbnb", value: 12 },
  { source: "Website", value: 7 },
];

const recentReports = [
  {
    name: "Báo cáo doanh thu ngày",
    date: "02/06/2026",
    status: "Hoàn thành",
  },
  {
    name: "Báo cáo công suất phòng",
    date: "01/06/2026",
    status: "Hoàn thành",
  },
  {
    name: "Báo cáo đặt phòng OTA",
    date: "31/05/2026",
    status: "Đang xử lý",
  },
];

export default function ReportsPage() {
  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Thống kê"
          subtitle="Theo dõi doanh thu, đặt phòng và hiệu suất vận hành khách sạn"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Tổng quan thống kê</h2>
              <p className="text-sm text-muted-foreground">
                Dữ liệu mô phỏng phục vụ cho giao diện PMS khách sạn
              </p>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title}>
                  <CardContent className="flex items-center justify-between p-5">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {item.title}
                      </p>
                      <h3 className="mt-2 text-2xl font-bold">
                        {item.value}
                      </h3>
                      <p className="mt-1 text-xs text-green-600">
                        {item.description}
                      </p>
                    </div>

                    <div className="rounded-full bg-primary/10 p-3">
                      <Icon className="size-6 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="mb-6 grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="size-5" />
                  Doanh thu 6 tháng gần nhất
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="flex h-64 items-end gap-4">
                  {revenueData.map((item) => (
                    <div
                      key={item.month}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <div
                        className="w-full rounded-t bg-primary"
                        style={{ height: `${item.revenue * 2}px` }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="size-5" />
                  Nguồn đặt phòng
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                {bookingSources.map((item) => (
                  <div key={item.source}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{item.source}</span>
                      <span className="font-medium">{item.value}%</span>
                    </div>

                    <div className="h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Báo cáo gần đây</CardTitle>
            </CardHeader>

            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left">Tên báo cáo</th>
                    <th className="py-3 text-left">Ngày tạo</th>
                    <th className="py-3 text-left">Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {recentReports.map((report) => (
                    <tr key={report.name} className="border-b">
                      <td className="py-3 font-medium">{report.name}</td>
                      <td className="py-3">{report.date}</td>
                      <td className="py-3">{report.status}</td>
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