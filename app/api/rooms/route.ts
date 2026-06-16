import { NextResponse } from "next/server";
import { getRoomsWithTypes, getRoomTypes, updateRoomStatus } from "@/lib/services/roomService";
import { serializeBigInt } from "@/lib/utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await getRoomsWithTypes();
    const roomTypes = await getRoomTypes();
    return NextResponse.json(serializeBigInt({ rooms, roomTypes }));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json(
        { error: "Room ID and status are required" },
        { status: 400 }
      );
    }
    const updated = await updateRoomStatus(id, status);
    return NextResponse.json(serializeBigInt(updated));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update room status" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.roomNumber || !body.floor || !body.roomTypeId) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin phòng" },
        { status: 400 }
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        roomNumber: body.roomNumber,
        floor: Number(body.floor),
        status: body.status || "AVAILABLE",
        roomTypeId: BigInt(body.roomTypeId),
      },
      include: {
        roomType: true,
      },
    });

    return NextResponse.json(serializeBigInt(newRoom));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Không thể tạo phòng" },
      { status: 500 }
    );
  }
}