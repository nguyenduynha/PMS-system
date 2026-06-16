import { NextResponse } from "next/server";
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from "@/lib/services/serviceService";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const services = await getAllServices();
    return NextResponse.json(serializeBigInt(services));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch services" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.name || data.price === undefined) {
      return NextResponse.json(
        { error: "Name and price are required" },
        { status: 400 }
      );
    }
    const service = await createService(data);
    return NextResponse.json(serializeBigInt(service));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create service" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }
    const service = await updateService(id, data);
    return NextResponse.json(serializeBigInt(service));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update service" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Service ID is required" },
        { status: 400 }
      );
    }
    const service = await deleteService(id);
    return NextResponse.json(serializeBigInt(service));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete service" },
      { status: 500 }
    );
  }
}
