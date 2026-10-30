import { NextResponse } from "next/server";
import { MidtransService } from "@/lib/midtrans";
import { dbStore } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const order = dbStore.orders.find((o) => o.id === body.orderId) || dbStore.orders[0];

    const response = await MidtransService.createTransaction({
      orderId: body.orderId || order.id,
      grossAmount: body.amount || order.totalCost,
      customerDetails: {
        name: "Rizky Pratama",
        email: "rizky.pratama@gmail.com",
        phone: "081298453210",
      },
      itemDetails: [
        {
          id: "item-service",
          price: body.amount || order.totalCost,
          quantity: 1,
          name: order.serviceType,
        },
      ],
      paymentMethod: body.paymentMethod || "wallet",
    });

    return NextResponse.json({
      success: true,
      transaction: response,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
