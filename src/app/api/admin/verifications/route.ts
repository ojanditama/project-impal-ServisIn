import { NextResponse } from "next/server";
import { AdminController } from "@/controllers/AdminController";
import { dbStore } from "@/lib/store";

export async function GET() {
  const pendingMechanics = dbStore.users.filter((u) => u.role === "Mechanic");
  return NextResponse.json({
    success: true,
    mechanics: pendingMechanics,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AdminController.verifyMechanicAccount(body.mechanicId, body.action);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
