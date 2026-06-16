import { NextResponse } from "next/server";
import { getAllInvoices, upsertInvoice } from "@/lib/services/invoiceService";
import { serializeBigInt } from "@/lib/utils";

// GET /api/invoices – Lấy danh sách hóa đơn
export async function GET() {
  try {
    const invoices = await getAllInvoices();
    return NextResponse.json(serializeBigInt(invoices));
  } catch (error: any) {
    console.error("[API /invoices GET]", error);
    return NextResponse.json(
      { error: error.message || "Không thể tải danh sách hóa đơn" },
      { status: 500 }
    );
  }
}

// POST /api/invoices – Upsert hóa đơn (tạo mới hoặc cập nhật theo bookingId)
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.bookingId || data.totalAmount === undefined) {
      return NextResponse.json(
        { error: "Thiếu bookingId hoặc totalAmount" },
        { status: 400 }
      );
    }

    const invoice = await upsertInvoice({
      bookingId: String(data.bookingId),
      subTotal: Number(data.subTotal ?? 0),
      taxAmount: Number(data.taxAmount ?? 0),
      discount: Number(data.discount ?? 0),
      totalAmount: Number(data.totalAmount),
      status: data.status ?? "PAID",
      paymentMethod: data.paymentMethod,
      ghiChu: data.ghiChu,
    });

    return NextResponse.json(serializeBigInt(invoice), { status: 201 });
  } catch (error: any) {
    console.error("[API /invoices POST]", error);
    return NextResponse.json(
      { error: error.message || "Không thể tạo hóa đơn" },
      { status: 500 }
    );
  }
}
