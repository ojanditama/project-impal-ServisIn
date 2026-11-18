import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "@/lib/supabase";
import { dbStore } from "@/lib/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, amount, method, vaNumber, qrisUrl, status } = body;

    if (!orderId || !amount || !method) {
      return NextResponse.json(
        { success: false, message: "Missing required payment fields" },
        { status: 400 }
      );
    }

    // 1. Update in-memory dbStore
    const order = dbStore.orders.find((o) => o.id === orderId);
    if (order) {
      order.updateStatus("Paid");
    }

    // 2. Persist to Supabase
    const result = await SupabaseService.recordPayment({
      orderId,
      amount: Number(amount),
      method,
      vaNumber,
      qrisUrl,
      status: status || "SETTLEMENT",
      settledAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil dicatat ke database Supabase",
      orderId,
      supabaseStatus: result.success ? "synced" : "local_fallback",
      data: result.data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ success: false, message: "orderId required" }, { status: 400 });
  }

  const payment = await SupabaseService.getPayment(orderId);
  return NextResponse.json({ success: true, payment });
}
