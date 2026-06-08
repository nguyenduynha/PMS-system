import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Receipt,
  Plus,
  Eye,
  Printer,
  CreditCard,
  DollarSign,
  FileText,
} from "lucide-react";

const invoices = [
  {
    id: 1,
    invoiceNumber: "INV-001",
    customerName: "Nguyễn Văn A",
    roomNumber: "101",
    checkIn: "01/06/2026",
    checkOut: "03/06/2026",
    subTotal: 1200000,
    tax: 120000,
    discount: 0,
    total: 1320000,
    status: "PAID",
    paymentMethod: "Tiền mặt",
  },
  {
    id: 2,
    invoiceNumber: "INV-002",
    customerName: "Trần Thị B",
    roomNumber: "203",
    checkIn: "02/06/2026",
    checkOut: "04/06/2026",
    subTotal: 1800000,
    tax: 180000,
    discount: 100000,
    total: 1880000,
    status: "UNPAID",
    paymentMethod: "Chưa thanh toán",
  },
  {
    id: 3,
    invoiceNumber: "INV-003",
    customerName: "Lê Văn C",
    roomNumber: "305",
    checkIn: "30/05/2026",
    checkOut: "02/06/2026",
    subTotal: 2400000,
    tax: 240000,
    discount: 200000,
    total: 2440000,
    status: "PAID",
    paymentMethod: "Chuyển khoản",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + "đ";
}

function getStatusLabel(status: string) {
  if (status === "PAID") return "Đã thanh toán";
  if (status === "UNPAID") return "Chưa thanh toán";
  if (status === "CANCELLED") return "Đã hủy";
  return status;
}

function getStatusClass(status: string) {
  if (status === "PAID") return "bg-green-100 text-green-700";
  if (status === "UNPAID") return "bg-amber-100 text-amber-700";
  if (status === "CANCELLED") return "bg-red-100 text-red-700";
  return "bg-muted text-muted-foreground";
}

export default function InvoicesPage() {
  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const unpaidAmount = invoices
    .filter((invoice) => invoice.status === "UNPAID")
    .reduce((sum, invoice) => sum + invoice.total, 0);

  return (
    <div className="flex h-screen bg-background">
      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader
          title="Hóa đơn"
          subtitle="Quản lý hóa đơn, thanh toán và doanh thu khách sạn"
        />

        <main className="flex-1 overflow-auto p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Quản lý hóa đơn</h2>
              <p className="text-sm text-muted-foreground">
                Theo dõi hóa đơn thanh toán của khách lưu trú
              </p>
            </div>

            <Button>
              <Plus className="mr-2 size-4" />
              Tạo hóa đơn
            </Button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-blue-100 p-3">
                  <Receipt className="size-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tổng hóa đơn</p>
                  <h3 className="text-2xl font-bold">{invoices.length}</h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-green-100 p-3">
                  <DollarSign className="size-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Đã thu</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(totalRevenue)}
                  </h3>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-4 p-5">
                <div className="rounded-full bg-amber-100 p-3">
                  <CreditCard className="size-6 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chưa thu</p>
                  <h3 className="text-2xl font-bold">
                    {formatCurrency(unpaidAmount)}
                  </h3>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-5" />
                Danh sách hóa đơn
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-4 text-left">Số hóa đơn</th>
                    <th className="p-4 text-left">Khách hàng</th>
                    <th className="p-4 text-left">Phòng</th>
                    <th className="p-4 text-left">Thời gian lưu trú</th>
                    <th className="p-4 text-left">Tổng tiền</th>
                    <th className="p-4 text-left">Thanh toán</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>

                <tbody>
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/40">
                      <td className="p-4 font-medium">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="p-4">{invoice.customerName}</td>

                      <td className="p-4">
                        <Badge variant="outline">Phòng {invoice.roomNumber}</Badge>
                      </td>

                      <td className="p-4">
                        <div>
                          <p>{invoice.checkIn}</p>
                          <p className="text-xs text-muted-foreground">
                            đến {invoice.checkOut}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 font-semibold">
                        {formatCurrency(invoice.total)}
                      </td>

                      <td className="p-4">{invoice.paymentMethod}</td>

                      <td className="p-4">
                        <Badge className={getStatusClass(invoice.status)}>
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="mr-1 size-4" />
                            Xem
                          </Button>

                          <Button variant="outline" size="sm">
                            <Printer className="mr-1 size-4" />
                            In
                          </Button>
                        </div>
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