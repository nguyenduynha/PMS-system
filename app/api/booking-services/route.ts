import { NextResponse } from "next/server";
import { addServiceToBooking, removeServiceFromBooking } from "@/lib/services/bookingService";
import { serializeBigInt } from "@/lib/utils";

// POST /api/booking-services – Thêm dịch vụ vào booking
export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.bookingId || !data.serviceId || !data.quantity) {
      return NextResponse.json(
        { error: "Thiếu bookingId, serviceId hoặc quantity" },
        { status: 400 }
      );
    }

    const bookingService = await addServiceToBooking({
      bookingId: String(data.bookingId),
      serviceId: String(data.serviceId),
      quantity: Number(data.quantity),
    });

    return NextResponse.json(serializeBigInt(bookingService), { status: 201 });
  } catch (error: any) {
    console.error("[API /booking-services POST]", error);
    return NextResponse.json(
      { error: error.message || "Không thể thêm dịch vụ" },
      { status: 500 }
    );
  }
}

// DELETE /api/booking-services?id=X – Xóa dịch vụ
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Thiếu id của booking service" }, { status: 400 });
    }

    await removeServiceFromBooking(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API /booking-services DELETE]", error);
    return NextResponse.json(
      { error: error.message || "Không thể xóa dịch vụ" },
      { status: 500 }
    );
  }
}
