import { NextResponse } from "next/server";
import { GeminiService } from "@/lib/gemini";
import { dbStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const queryText = body.queryText || "";
    const activeVeh = dbStore.vehicles.find((v) => v.isActive) || dbStore.vehicles[0];

    const result = await GeminiService.analyzeVehicleTelemetry(queryText, {
      brand: activeVeh.brand,
      model: activeVeh.model,
      year: activeVeh.year,
      odometerKm: activeVeh.odometerKm,
    });

    return NextResponse.json({
      success: true,
      diagnostic: result,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
