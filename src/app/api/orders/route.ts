import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";
import { OrderController } from "@/controllers/OrderController";

export async function GET() {
  return NextResponse.json({
    success: true,
    orders: dbStore.orders,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = OrderController.createServiceOrder({
      customerId: body.customerId || "usr-cst-001",
      vehicleId: body.vehicleId || dbStore.vehicles[0]?.id,
      serviceType: body.serviceType || "Servis Berkala",
      locationCoord: body.locationCoord || {
        lat: -6.2088,
        lng: 106.8456,
        address: "Jl. Sudirman No. 42, Jakarta",
      },
      totalCost: body.totalCost || 299000,
      items: body.items,
      notes: body.notes,
      isEmergency: body.isEmergency,
      isVIP: body.isVIP,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
