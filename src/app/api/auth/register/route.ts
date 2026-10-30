import { NextResponse } from "next/server";
import { AuthController } from "@/controllers/AuthController";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AuthController.handleRegister({
      name: body.name,
      phone: body.phone,
      email: body.email,
      password: body.password,
      role: body.role || "Customer",
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: result.user,
      message: result.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
