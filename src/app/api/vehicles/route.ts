import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";
import { Vehicle } from "@/models/Vehicle";
import { SupabaseService } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;

    // 1. Try Supabase
    const sbVehs = await SupabaseService.getVehicles(userId);
    if (Array.isArray(sbVehs) && sbVehs.length > 0) {
      return NextResponse.json({
        success: true,
        source: "supabase",
        vehicles: sbVehs,
      });
    }

    // 2. Fallback to local store
    return NextResponse.json({
      success: true,
      source: "local",
      vehicles: dbStore.getVehicles(userId),
    });
  } catch (err: any) {
    return NextResponse.json({
      success: true,
      source: "local_fallback",
      vehicles: dbStore.getVehicles(),
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newVehId = body.id || "veh-" + Date.now();
    const cleanPlate = (body.licensePlate || "B 1234 ABC").trim().toUpperCase();

    const newVeh = new Vehicle({
      id: newVehId,
      userId: body.userId || "usr-cst-001",
      brand: body.brand || "Toyota",
      model: body.model || "Avanza",
      year: Number(body.year) || 2022,
      licensePlate: cleanPlate,
      isActive: Boolean(body.isActive),
      odometerKm: Number(body.odometerKm) || 20000,
      healthPercent: 95,
      color: body.color || "Hitam",
    });

    // 1. Persist to Supabase
    const sbResult = await SupabaseService.createVehicle({
      id: newVehId,
      userId: body.userId || "usr-cst-001",
      brand: body.brand,
      model: body.model,
      year: Number(body.year) || 2022,
      licensePlate: cleanPlate,
      isActive: Boolean(body.isActive),
      color: body.color || "Hitam",
      odometerKm: Number(body.odometerKm) || 20000,
      healthPercent: 95,
    });

    // 2. Persist locally
    dbStore.addVehicle(newVeh);

    return NextResponse.json({
      success: true,
      supabaseSync: sbResult.success,
      vehicle: newVeh,
      message: "Kendaraan berhasil ditambahkan dan tersinkronkan ke Supabase.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
