import { NextResponse } from "next/server";
import { dbStore } from "@/lib/store";

export async function GET() {
  const totalOrders = 142;
  const onlineMechanics = dbStore.users.filter((u) => u.role === "Mechanic" && u.status === "Active").length;
  const gtvTotal = 48200000;
  const platformCommission = gtvTotal * 0.15;

  return NextResponse.json({
    success: true,
    macroStats: {
      totalOrdersDaily: totalOrders,
      onlineMechanics: Math.max(onlineMechanics, 58),
      gtvAmount: gtvTotal,
      platformFeeAmount: platformCommission,
      activeRegion: "DKI Jakarta & Bodetabek",
    },
    liveFeed: dbStore.orders,
  });
}
