import { NextResponse } from "next/server";
import {
  getAllBookings,
  createBooking,
  updateBookingStatus,
  updateBookingPriceType,
  extendStay,
  changeRoom,
  getBookingFolioByRoomId,
} from "@/lib/services/bookingService";
import { serializeBigInt } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");

    if (roomId) {
      const folio = await getBookingFolioByRoomId(roomId);
      return NextResponse.json(serializeBigInt(folio));
    }

    const bookings = await getAllBookings();
    return NextResponse.json(serializeBigInt(bookings));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (
      !data.roomId ||
      !data.checkInDate ||
      !data.checkOutDate ||
      !data.customerName ||
      !data.customerPhone
    ) {
      return NextResponse.json(
        { error: "Thiếu thông tin đặt phòng bắt buộc" },
        { status: 400 }
      );
    }

    const booking = await createBooking(data);
    return NextResponse.json(serializeBigInt(booking));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create booking" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, id, status, newCheckOutDate, newTotalAmount, newRoomId, priceType } = body;

    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    let result;

    if (action === "extend") {
      if (!newCheckOutDate || newTotalAmount === undefined) {
        return NextResponse.json(
          { error: "Cần newCheckOutDate và newTotalAmount" },
          { status: 400 }
        );
      }
      result = await extendStay(id, newCheckOutDate, newTotalAmount);
    } else if (action === "change_room") {
      if (!newRoomId) {
        return NextResponse.json({ error: "Cần newRoomId" }, { status: 400 });
      }
      result = await changeRoom(id, newRoomId);
    } else if (action === "update_price_type") {
      if (!priceType) {
        return NextResponse.json({ error: "Cần priceType" }, { status: 400 });
      }
      result = await updateBookingPriceType(id, priceType);
    } else if (action === "status" || status) {
      result = await updateBookingStatus(id, status);
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json(serializeBigInt(result));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update booking" },
      { status: 500 }
    );
  }
}
