import { NextResponse } from "next/server";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/services/userService";
import { serializeBigInt } from "@/lib/utils";

export async function GET() {
  try {
    const users = await getAllUsers();
    return NextResponse.json(serializeBigInt(users));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch users" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.fullName || !data.email || !data.role) {
      return NextResponse.json(
        { error: "Full Name, email, and role are required" },
        { status: 400 }
      );
    }
    const user = await createUser(data);
    return NextResponse.json(serializeBigInt(user));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create user" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...data } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const user = await updateUser(id, data);
    return NextResponse.json(serializeBigInt(user));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update user" },
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
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    const user = await deleteUser(id);
    return NextResponse.json(serializeBigInt(user));
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete user" },
      { status: 500 }
    );
  }
}
