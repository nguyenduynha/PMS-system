import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/services/invoiceService";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(serializeBigInt(stats));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
