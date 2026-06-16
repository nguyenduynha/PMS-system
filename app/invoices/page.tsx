"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Receipt,
  Plus,
  Eye,
  Printer,
  CreditCard,
  DollarSign,
  FileText,
} from "lucide-react";

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  bookingId: string;
  customerName: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  subTotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: string;
  paymentMethod: string;
}

function formatCurrency(value: any) {
  const number = Number(value || 0);
  return new Intl.NumberFormat("vi-VN").format(number) + "đ";
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
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/invoices");
      if (res.ok) {
        const data = await res.json();
        // Since database schema does not store roomNumber in invoices directly,
        // we can fetch bookings or default to a room label
        setInvoices(data);
      }
    } catch (err) {
      console.error("Failed to load invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = invoices
    .filter((invoice) => invoice.status === "PAID")
    .reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);

  const unpaidAmount = invoices
    .filter((invoice) => invoice.status === "UNPAID")
    .reduce((sum, invoice) => sum + Number(invoice.totalAmount || 0), 0);
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
                  <h3 className="text-2xl font-bold font-mono text-emerald-800">
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
                  <h3 className="text-2xl font-bold font-mono text-amber-800">
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
                      <td className="p-4 font-semibold font-mono text-blue-900">
                        {invoice.invoiceNumber}
                      </td>

                      <td className="p-4 font-medium">{invoice.customerName}</td>

                      <td className="p-4 font-mono">
                        <div>
                          <p>{invoice.checkIn}</p>
                          <p className="text-xs text-muted-foreground">
                            đến {invoice.checkOut}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 font-semibold font-mono text-emerald-700">
                        {formatCurrency(invoice.totalAmount)}
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