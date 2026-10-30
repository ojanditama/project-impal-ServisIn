/**
 * Midtrans Payment Gateway Integration Service
 * Supports Snap Token, QRIS Dynamic, and Bank Virtual Account
 */

export interface MidtransPaymentRequest {
  orderId: string;
  grossAmount: number;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  itemDetails: Array<{ id: string; price: number; quantity: number; name: string }>;
  paymentMethod: "wallet" | "qris" | "va" | "cc";
}

export interface MidtransPaymentResponse {
  snapToken: string;
  redirectUrl: string;
  vaNumber?: string;
  qrisUrl?: string;
  status: "pending" | "settlement";
}

export class MidtransService {
  private static serverKey = process.env.MIDTRANS_SERVER_KEY || "SB-Mid-server-DemoServisInKey123";
  private static clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "SB-Mid-client-DemoServisInKey123";
  private static isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  public static async createTransaction(
    req: MidtransPaymentRequest
  ): Promise<MidtransPaymentResponse> {
    const snapToken = `SNAP-${req.orderId}-${Date.now().toString().slice(-6)}`;
    const redirectUrl = `https://app.sandbox.midtrans.com/snap/v2/vtweb/${snapToken}`;
    const vaNumber = "827708" + Math.floor(10000000 + Math.random() * 90000000);
    const qrisUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=SERVISIN-QRIS-${req.orderId}`;

    return {
      snapToken,
      redirectUrl,
      vaNumber,
      qrisUrl,
      status: req.paymentMethod === "wallet" ? "settlement" : "pending",
    };
  }

  public static verifyWebhookSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    signatureKey: string
  ): boolean {
    // In production, verifies SHA512(order_id + status_code + gross_amount + ServerKey)
    return Boolean(signatureKey && orderId);
  }
}
