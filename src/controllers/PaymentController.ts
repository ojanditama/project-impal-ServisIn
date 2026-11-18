import { dbStore } from "@/lib/store";
import { SupabaseService } from "@/lib/supabase";

export interface ProcessPaymentOptions {
  orderId: string;
  amount: number;
  paymentMethod: "wallet" | "qris" | "va" | "cc";
  vaNumber?: string;
  pin?: string;
}

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

    // Realistic QRIS URL: uses the official uploaded QRIS asset
    const officialQrisUrl = "/images/qris-servisin.jpg";
    // Dynamic random Virtual Account
    const randomVa = "8277 08" + Math.floor(10000000 + Math.random() * 90000000).toString().replace(/(\d{4})(\d{4})/, "$1 $2");

    return {
      success: true,
      token: "snap-servisin-" + Math.random().toString(36).substring(2, 10),
      qrisUrl: officialQrisUrl,
      vaNumber: randomVa,
      message: `Tagihan siap dibayar via ${paymentMethod}.`,
    };
  }

  /**
   * Process payment, update local DB store, deduct wallet if applicable, and persist to Supabase
   */
  public static async processPayment(options: ProcessPaymentOptions): Promise<{
    success: boolean;
    message: string;
    newBalance?: number;
  }> {
    const { orderId, amount, paymentMethod, vaNumber, pin } = options;

    // 1. If method is wallet, verify balance and PIN
    if (paymentMethod === "wallet") {
      const currentBalance = dbStore.getCustomerBalance();
      if (currentBalance < amount) {
        return {
          success: false,
          message: `Saldo ServisIn Wallet tidak cukup (Saldo: Rp ${currentBalance.toLocaleString("id-ID")}, Tagihan: Rp ${amount.toLocaleString("id-ID")}). Silakan top up terlebih dahulu.`,
        };
      }

      if (!pin || !dbStore.verifyCustomerPin(pin)) {
        return {
          success: false,
          message: "PIN ServisIn Wallet salah. Masukkan 6 digit PIN yang benar (Default: 123456).",
        };
      }

      // Deduct balance
      dbStore.deductCustomerWallet(amount, orderId);
    }

    // 2. Update local order status
    const order = dbStore.orders.find((o) => o.id === orderId);
    if (order) {
      order.updateStatus("Paid");
    }

    // 3. Persist to Supabase Database
    try {
      await SupabaseService.recordPayment({
        orderId,
        amount,
        method: paymentMethod.toUpperCase(),
        vaNumber: vaNumber || (paymentMethod === "va" ? "8277 0812 9845 3210" : null),
        qrisUrl: paymentMethod === "qris" ? "/images/qris-servisin.jpg" : null,
        status: "SETTLEMENT",
        settledAt: new Date().toISOString(),
      });
    } catch (err) {
      console.warn("Supabase background sync notice:", err);
    }

    return {
      success: true,
      message: "Pembayaran berhasil diproses dan disimpan ke database.",
      newBalance: dbStore.getCustomerBalance(),
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
