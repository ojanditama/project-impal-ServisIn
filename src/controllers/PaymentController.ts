import { dbStore } from "@/lib/store";

export class PaymentController {
  public static requestMidtransPayment(orderId: string, paymentMethod: string): {
    success: boolean;
    redirectUrl?: string;
    token?: string;
    vaNumber?: string;
    qrisUrl?: string;
    message: string;
  } {
    const order = dbStore.orders.find((o) => o.id === orderId);
    if (!order) {
      return { success: false, message: "Pesanan tidak ditemukan" };
    }

    // Midtrans Snap Token & QRIS Generation Simulation
    const mockSnapToken = "snap-token-" + Math.random().toString(36).substring(2, 10);
    const mockQrisUrl =
      "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=MIDTRANS-SERVISIN-" + orderId;
    const mockVa = "827708" + Math.floor(10000000 + Math.random() * 90000000);

    return {
      success: true,
      token: mockSnapToken,
      qrisUrl: mockQrisUrl,
      vaNumber: mockVa,
      message: `Tagihan Rp ${order.totalCost.toLocaleString("id-ID")} siap dibayar via ${paymentMethod}.`,
    };
  }

  public static handleWebhookCallback(orderId: string, transactionStatus: string): boolean {
    const order = dbStore.orders.find((o) => o.id === orderId);
    if (order && (transactionStatus === "settlement" || transactionStatus === "capture")) {
      order.updateStatus("Paid");
      return true;
    }
    return false;
  }
}
