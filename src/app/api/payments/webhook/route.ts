import { NextResponse } from "next/server";
import { PaymentController } from "@/controllers/PaymentController";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const orderId = payload.order_id || payload.orderId;
    const transactionStatus = payload.transaction_status || "settlement";

    const handled = PaymentController.handleWebhookCallback(orderId, transactionStatus);

    return NextResponse.json({
      success: handled,
      orderId,
      status: transactionStatus,
      message: handled ? "Payment successfully settled and warranty activated." : "Order status updated.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
