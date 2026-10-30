import { NextResponse } from "next/server";
import { AdminController } from "@/controllers/AdminController";
import { dbStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    success: true,
    disputes: dbStore.disputes,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = AdminController.resolveDisputeTicket(
      body.ticketId,
      body.resolution,
      body.note || "Penyelesaian klaim garansi oleh admin pusat."
    );
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
