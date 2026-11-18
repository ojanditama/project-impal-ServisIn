// Supabase REST Client & Sync Service
// Project Ref: ylozhbazicyeazrzvbtx

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ylozhbazicyeazrzvbtx.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb3poYmF6aWN5ZWF6cnp2YnR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzk2MzYsImV4cCI6MjEwODg1NTYzNn0.SVqbsZqXHiBk4NhCo8GoMmwGkog5y4fJzvkCt0zcY-g";

export interface SupabasePaymentRecord {
  orderId: string;
  amount: number;
  method: string;
  midtransSnapToken?: string | null;
  vaNumber?: string | null;
  qrisUrl?: string | null;
  status: string;
  settledAt?: string | null;
}

export class SupabaseService {
  private static getHeaders() {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    };
  }

  /**
   * Insert or upsert payment transaction record to Supabase
   */
  public static async recordPayment(payment: SupabasePaymentRecord): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const payload = {
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        midtransSnapToken: payment.midtransSnapToken || null,
        vaNumber: payment.vaNumber || null,
        qrisUrl: payment.qrisUrl || null,
        status: payment.status || "SETTLEMENT",
        settledAt: payment.settledAt || new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/PaymentTransaction?on_conflict=orderId`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[Supabase] Failed to insert PaymentTransaction:", res.status, errorText);
        return { success: false, error: errorText };
      }

      const data = await res.json();

      // Also update ServiceOrder status to 'PAID'
      await this.updateOrderStatus(payment.orderId, "PAID");

      return { success: true, data };
    } catch (err: any) {
      console.warn("[Supabase] Error executing recordPayment:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Update ServiceOrder status in Supabase
   */
  public static async updateOrderStatus(
    orderId: string,
    status: "PAID" | "COMPLETED" | "CANCELLED" | "IN_PROGRESS" | "ACCEPTED" | "DISPATCHED" | "PENDING"
  ): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ServiceOrder?id=eq.${orderId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: status,
          updatedAt: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        console.warn("[Supabase] Failed to update ServiceOrder:", res.status);
        return false;
      }
      return true;
    } catch (err: any) {
      console.warn("[Supabase] Error updating ServiceOrder:", err.message);
      return false;
    }
  }

  /**
   * Fetch current order from Supabase
   */
  public static async getOrder(orderId: string): Promise<any | null> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ServiceOrder?id=eq.${orderId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        return rows[0] || null;
      }
    } catch (err) {
      console.warn("[Supabase] getOrder error:", err);
    }
    return null;
  }

  /**
   * Fetch payment transaction record from Supabase
   */
  public static async getPayment(orderId: string): Promise<any | null> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/PaymentTransaction?orderId=eq.${orderId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        return rows[0] || null;
      }
    } catch (err) {
      console.warn("[Supabase] getPayment error:", err);
    }
    return null;
  }

  /**
   * Upgrade user to VIP in Supabase User & PremiumSubscription tables
   */
  public static async upgradeUserToVip(
    userId: string = "usr-cst-001",
    planType: "annual" | "monthly" = "annual"
  ): Promise<boolean> {
    try {
      // 1. Update User tier in Supabase
      await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          tier: "VIP",
          updatedAt: new Date().toISOString(),
        }),
      });

      // 2. Insert or update PremiumSubscription in Supabase
      const endDate = new Date();
      if (planType === "annual") {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }

      await fetch(`${SUPABASE_URL}/rest/v1/PremiumSubscription?on_conflict=userId`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId: userId,
          planType: planType.toUpperCase(),
          warrantyDays: planType === "annual" ? 365 : 30,
          startDate: new Date().toISOString(),
          endDate: endDate.toISOString(),
          isActive: true,
        }),
      });

      return true;
    } catch (e) {
      console.warn("[Supabase] Failed to update VIP tier:", e);
      return false;
    }
  }
}
