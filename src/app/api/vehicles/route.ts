import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";
import { Vehicle } from "@/models/Vehicle";

export async function GET() {
  return NextResponse.json({
    success: true,
    vehicles: dbStore.vehicles,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVeh = new Vehicle({
      id: "veh-" + Date.now(),
      userId: body.userId || "usr-cst-001",
      brand: body.brand,
      model: body.model,
      year: body.year || 2022,
      licensePlate: body.licensePlate,
      isActive: Boolean(body.isActive),
      odometerKm: body.odometerKm || 20000,
      healthPercent: 95,
      color: body.color || "Hitam",
    });

    dbStore.vehicles.push(newVeh);

    return NextResponse.json({
      success: true,
      vehicle: newVeh,
      message: "Kendaraan berhasil ditambahkan ke garasi digital.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
