import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/services/userService";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Tài khoản không tồn tại" },
        { status: 401 }
      );
    }

    // Verify hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Mật khẩu không đúng" },
        { status: 401 }
      );
    }

    // Return user metadata
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Đăng nhập thất bại" },
      { status: 500 }
    );
  }
}
