import { NextResponse } from "next/server";
import {
  getAllRecords,
  createRecord,
  completeRecord,
} from "@/lib/services/maintenanceService";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const records = await getAllRecords();
    return NextResponse.json(serializeBigInt(records));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch maintenance records" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.roomId || !data.description || !data.staffId) {
      return NextResponse.json(
        { error: "Room ID, description, and staff ID are required" },
        { status: 400 }
      );
    }
    const record = await createRecord(data);
    return NextResponse.json(serializeBigInt(record));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to start maintenance" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Maintenance record ID is required" },
        { status: 400 }
      );
    }
    const record = await completeRecord(id);
    return NextResponse.json(serializeBigInt(record));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to complete maintenance" },
      { status: 500 }
    );
  }
}
