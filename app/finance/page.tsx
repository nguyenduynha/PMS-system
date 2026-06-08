import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";

const transactions = [
  {
    id: 1,
    code: "TC-001",
    type: "INCOME",
    category: "Tiền phòng",
    description: "Thu tiền phòng 101 - Nguyễn Văn A",
    amount: 1320000,
    date: "02/06/2026",
    createdBy: "Lễ tân",
  },
  {
    id: 2,
    code: "TC-002",
    type: "INCOME",
    category: "Dịch vụ",
    description: "Thu tiền giặt ủi và minibar",
    amount: 250000,
    date: "02/06/2026",
    createdBy: "Lễ tân",
  },
  {
    id: 3,
    code: "TC-003",
    type: "EXPENSE",
    category: "Bảo trì",
    description: "Sửa máy lạnh phòng 203",
    amount: 500000,
    date: "03/06/2026",
    createdBy: "Quản lý",
  },
  {
    id: 4,
    code: "TC-004",
    type: "EXPENSE",
    category: "Vật tư",
    description: "Mua khăn tắm và đồ dùng phòng",
    amount: 800000,
    date: "03/06/2026",
    createdBy: "Quản lý",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function getTypeLabel(type: string) {
  if (type === "INCOME") return "Thu";
  if (type === "EXPENSE") return "Chi";
  return type;
}

function getTypeClass(type: string) {
  if (type === "INCOME") return "bg-green-100 text-green-700";
  if (type === "EXPENSE") return "bg-red-100 text-red-700";
  return "bg-muted text-muted-foreground";
}

function getTypeIcon(type: string) {
  if (type === "INCOME") return ArrowDownCircle;
  return ArrowUpCircle;
}

export default function FinancePage() {
  const totalIncome = transactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);

  const profit = totalIncome - totalExpense;

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Thu chi"
          subtitle="Quản lý khoản thu, khoản chi và lợi nhuận khách sạn"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quản lý thu chi</h2>
              <p className="text-sm text-muted-foreground">
                Theo dõi doanh thu, chi phí và lợi nhuận trong quá trình vận hành
              </p>
            </div>

            <Button>
              <Plus className="mr-2 size-4" />
              Thêm giao dịch
            </Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-green-100 p-3">
                  <TrendingUp className="size-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng thu</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(totalIncome)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-red-100 p-3">
                  <TrendingDown className="size-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng chi</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(totalExpense)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 p-3">
                  <Wallet className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lợi nhuận</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(profit)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="size-5" />
                Danh sách giao dịch thu chi
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">Mã giao dịch</th>
                    <th className="p-4 text-left">Loại</th>
                    <th className="p-4 text-left">Danh mục</th>
                    <th className="p-4 text-left">Nội dung</th>
                    <th className="p-4 text-left">Số tiền</th>
                    <th className="p-4 text-left">Ngày</th>
                    <th className="p-4 text-left">Người tạo</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((item) => {
                    const TypeIcon = getTypeIcon(item.type);

                    return (
                      <tr key={item.id} className="border-b hover:bg-muted/40">
                        <td className="p-4 font-medium">{item.code}</td>

                        <td className="p-4">
                          <Badge className={getTypeClass(item.type)}>
                            <TypeIcon className="mr-1 size-3" />
                            {getTypeLabel(item.type)}
                          </Badge>
                        </td>

                        <td className="p-4">{item.category}</td>

                        <td className="p-4">{item.description}</td>

                        <td className="p-4 font-semibold">
                          {formatCurrency(item.amount)}
                        </td>

                        <td className="p-4">{item.date}</td>

                        <td className="p-4">{item.createdBy}</td>

                        <td className="p-4">
                          <div className="flex justify-end">
                            <Button variant="outline" size="sm">
                              <Eye className="mr-1 size-4" />
                              Xem
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}