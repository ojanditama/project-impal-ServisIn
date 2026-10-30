import { NextResponse } from "next/server";
import { OrderController } from "@/controllers/OrderController";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lat = body.lat || -6.2088;
    const lng = body.lng || 106.8456;
    const isVIP = Boolean(body.isVIP);

    const match = OrderController.matchNearestMechanic({ lat, lng }, isVIP);

    return NextResponse.json({
      success: true,
      match,
      dispatchTimerSeconds: 24,
      priorityAssigned: isVIP,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
