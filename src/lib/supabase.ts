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
  private static getHeaders(prefer?: string) {
    return {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: prefer || "return=representation",
    };
  }

  // =========================================================================
  // USER METHODS
  // =========================================================================

  /**
   * Register/Insert a new user in Supabase with duplicate pre-check
   */
  public static async registerUser(user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    password: string;
    role: "Customer" | "Mechanic" | "Admin";
    avatarUrl?: string;
    rating?: number;
    bnspCertified?: boolean;
    ktpNumber?: string;
    bnspCertNumber?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // 1. Pre-check in Supabase for duplicate phone or email
      try {
        const cleanUserPhone = user.phone.replace(/[^0-9]/g, "");
        const cleanUserEmail = user.email.trim().toLowerCase();

        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/User?or=(phone.like.*${cleanUserPhone}*,email.ilike.${encodeURIComponent(cleanUserEmail)})&select=id,phone,email`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );

        if (checkRes.ok) {
          const existingUsers = await checkRes.json();
          if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            const matchedEmail = existingUsers.some(
              (u: any) => u.email && u.email.trim().toLowerCase() === cleanUserEmail
            );
            const matchedPhone = existingUsers.some((u: any) => {
              const uPhone = (u.phone || "").replace(/[^0-9]/g, "");
              return uPhone === cleanUserPhone || (cleanUserPhone.length >= 8 && uPhone.includes(cleanUserPhone));
            });

            if (matchedEmail && matchedPhone) {
              return {
                success: false,
                error: `Pendaftaran ditolak: Alamat email (${user.email}) dan nomor WhatsApp (${user.phone}) sudah terdaftar di sistem. Silakan langsung masuk ke akun Anda.`,
              };
            }

            if (matchedEmail) {
              return {
                success: false,
                error: `Pendaftaran ditolak: Alamat email (${user.email}) sudah terdaftar di sistem. Silakan gunakan email lain atau masuk ke akun Anda.`,
              };
            }

            if (matchedPhone) {
              return {
                success: false,
                error: `Pendaftaran ditolak: Nomor WhatsApp (${user.phone}) sudah terdaftar di sistem. Silakan gunakan nomor lain atau masuk ke akun Anda.`,
              };
            }
          }
        }
      } catch (errCheck) {
        console.warn("[Supabase] Pre-check user duplicate notice:", errCheck);
      }

      // 2. Pre-check duplicate KTP for Mechanic
      if (user.role === "Mechanic" && user.ktpNumber) {
        try {
          const ktpCheck = await fetch(
            `${SUPABASE_URL}/rest/v1/MechanicProfile?ktpNumber=eq.${encodeURIComponent(user.ktpNumber)}&select=id,ktpNumber`,
            {
              headers: {
                apikey: SUPABASE_ANON_KEY,
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
              },
            }
          );
          if (ktpCheck.ok) {
            const existingKtp = await ktpCheck.json();
            if (Array.isArray(existingKtp) && existingKtp.length > 0) {
              return {
                success: false,
                error: `Pendaftaran ditolak: Nomor KTP (${user.ktpNumber}) sudah terdaftar sebagai mitra teknisi lain.`,
              };
            }
          }
        } catch (ktpErr) {
          console.warn("[Supabase] KTP pre-check notice:", ktpErr);
        }
      }

      const dbRole = user.role.toUpperCase(); // 'CUSTOMER' | 'MECHANIC' | 'ADMIN'
      const dbStatus = user.role === "Mechanic" ? "PENDING" : "ACTIVE";
      const dbTier = "REGULAR";

      const payload = {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        passwordHash: user.password,
        role: dbRole,
        status: dbStatus,
        tier: dbTier,
        avatarUrl:
          user.avatarUrl ||
          (user.role === "Mechanic"
            ? "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80"
            : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80"),
        rating: user.rating ?? (user.role === "Mechanic" ? 4.9 : 4.9),
        bnspCertified: user.bnspCertified ?? (user.role === "Mechanic"),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/User`, {
        method: "POST",
        headers: this.getHeaders("return=representation"),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[Supabase] Failed to register user:", res.status, errorText);
        let friendlyError = errorText;
        if (
          errorText.includes("User_phone_key") ||
          (errorText.includes("phone") && (errorText.includes("duplicate") || errorText.includes("unique")))
        ) {
          friendlyError = `Pendaftaran ditolak: Nomor WhatsApp (${user.phone}) sudah terdaftar di database Supabase.`;
        } else if (
          errorText.includes("User_email_key") ||
          (errorText.includes("email") && (errorText.includes("duplicate") || errorText.includes("unique")))
        ) {
          friendlyError = `Pendaftaran ditolak: Alamat email (${user.email}) sudah terdaftar di database Supabase.`;
        } else {
          friendlyError = `Pendaftaran ditolak: Data pengguna sudah terdaftar di database.`;
        }
        return { success: false, error: friendlyError };
      }

      const data = await res.json();

      // If mechanic, also register MechanicProfile
      if (user.role === "Mechanic") {
        try {
          await fetch(`${SUPABASE_URL}/rest/v1/MechanicProfile`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({
              userId: user.id,
              ktpNumber: user.ktpNumber || "3174092801900002",
              bnspCertNumber: user.bnspCertNumber || "BNSP-2024-MEK-889",
              workshopName: "Mitra Bengkel ServisIn",
              isOnline: true,
              walletBalance: 0,
              escrowBalance: 0,
            }),
          });
        } catch (profileErr) {
          console.warn("[Supabase] Notice creating MechanicProfile:", profileErr);
        }
      }

      return { success: true, data };
    } catch (err: any) {
      console.warn("[Supabase] Error executing registerUser:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Find a user in Supabase by email or phone
   */
  public static async findUser(
    identifier: string,
    role?: "Customer" | "Mechanic" | "Admin"
  ): Promise<any | null> {
    try {
      const cleanPhone = identifier.replace(/[^0-9]/g, "");
      const cleanEmail = identifier.trim().toLowerCase();
      const cleanName = identifier.trim();

      let query = `${SUPABASE_URL}/rest/v1/User?select=*`;
      if (cleanPhone.length >= 8) {
        query += `&or=(email.ilike.${cleanEmail},phone.like.*${cleanPhone}*,name.ilike.*${cleanName}*)`;
      } else {
        query += `&or=(email.ilike.${cleanEmail},name.ilike.*${cleanName}*)`;
      }

      if (role) {
        query += `&role=eq.${role.toUpperCase()}`;
      }

      const res = await fetch(query, {
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
      console.warn("[Supabase] findUser error:", err);
    }
    return null;
  }

  /**
   * Get all users from Supabase
   */
  public static async getAllUsers(): Promise<any[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/User?select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Supabase] getAllUsers error:", err);
    }
    return [];
  }

  // =========================================================================
  // VEHICLE METHODS
  // =========================================================================

  /**
   * Get vehicles from Supabase (optionally by userId)
   */
  public static async getVehicles(userId?: string): Promise<any[]> {
    try {
      let query = `${SUPABASE_URL}/rest/v1/Vehicle?select=*&order=isActive.desc,createdAt.desc`;
      if (userId) {
        query += `&userId=eq.${userId}`;
      }
      const res = await fetch(query, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Supabase] getVehicles error:", err);
    }
    return [];
  }

  /**
   * Create a new Vehicle record in Supabase
   */
  public static async createVehicle(vehicle: {
    id?: string;
    userId: string;
    brand: string;
    model: string;
    year: number;
    licensePlate: string;
    color?: string;
    isActive?: boolean;
    odometerKm?: number;
    healthPercent?: number;
    imageUrl?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      let targetUserId = vehicle.userId || "usr-cst-001";

      // 1. Ensure targetUserId exists in Supabase to prevent foreign key violation
      try {
        const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/User?id=eq.${targetUserId}&select=id`, {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        });
        if (checkRes.ok) {
          const rows = await checkRes.json();
          if (!rows || rows.length === 0) {
            // Target user not in Supabase, fallback to default customer usr-cst-001
            targetUserId = "usr-cst-001";
          }
        }
      } catch (checkErr) {
        console.warn("[Supabase] Notice checking User foreign key:", checkErr);
      }

      const payload = {
        id: vehicle.id || "veh-" + Date.now(),
        userId: targetUserId,
        brand: vehicle.brand,
        model: vehicle.model,
        year: Number(vehicle.year) || 2023,
        licensePlate: vehicle.licensePlate.toUpperCase(),
        color: vehicle.color || "Silver Metalik",
        isActive: Boolean(vehicle.isActive),
        odometerKm: Number(vehicle.odometerKm) || 15000,
        healthPercent: Number(vehicle.healthPercent) || 95,
        imageUrl:
          vehicle.imageUrl ||
          "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
        lastServiceDate: new Date().toISOString(),
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/Vehicle`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[Supabase] Failed to insert Vehicle:", res.status, errorText);
        let friendlyError = errorText;
        if (errorText.includes("Vehicle_licensePlate_key") || (errorText.includes("licensePlate") && errorText.includes("duplicate"))) {
          friendlyError = `Plat nomor "${vehicle.licensePlate}" sudah terdaftar di database Supabase.`;
        }
        return { success: false, error: friendlyError };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      console.warn("[Supabase] Error executing createVehicle:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Set a vehicle as active in Supabase (and deactivate others for this user)
   */
  public static async setActiveVehicle(userId: string, vehicleId: string): Promise<boolean> {
    try {
      // 1. Set all user's vehicles to isActive = false
      await fetch(`${SUPABASE_URL}/rest/v1/Vehicle?userId=eq.${userId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: false, updatedAt: new Date().toISOString() }),
      });

      // 2. Set target vehicle to isActive = true
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Vehicle?id=eq.${vehicleId}`, {
        method: "PATCH",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ isActive: true, updatedAt: new Date().toISOString() }),
      });

      return res.ok;
    } catch (err) {
      console.warn("[Supabase] setActiveVehicle error:", err);
      return false;
    }
  }

  /**
   * Delete a vehicle from Supabase
   */
  public static async deleteVehicle(vehicleId: string): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Vehicle?id=eq.${vehicleId}`, {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      return res.ok;
    } catch (err) {
      console.warn("[Supabase] deleteVehicle error:", err);
      return false;
    }
  }

  // =========================================================================
  // SERVICE ORDER METHODS
  // =========================================================================

  /**
   * Insert a ServiceOrder into Supabase
   */
  public static async createOrder(order: any): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Normalize OrderStatus to match Supabase enum
      const validStatuses = [
        "PENDING",
        "DISPATCHED",
        "ACCEPTED",
        "ARRIVED",
        "DIAGNOSING",
        "IN_PROGRESS",
        "COMPLETED",
        "PAID",
        "CANCELLED",
      ];
      const rawStatus = (order.status || "DISPATCHED").toUpperCase();
      const status = validStatuses.includes(rawStatus) ? rawStatus : "DISPATCHED";

      const payload = {
        id: order.id,
        orderNumber: order.id,
        customerId: order.customerId || "usr-cst-001",
        mechanicId: order.mechanicId || "usr-mec-001",
        vehicleId: order.vehicleId || "veh-001",
        serviceType: order.serviceType || "Servis Berkala & Tune Up",
        status: status,
        totalCost: Number(order.totalCost) || 299000,
        isEmergency: Boolean(order.isEmergency),
        isVIP: Boolean(order.isVIP),
        pickupLat: order.locationCoord?.lat || -6.2088,
        pickupLng: order.locationCoord?.lng || 106.8456,
        pickupAddress:
          order.locationCoord?.address ||
          "Jl. Sudirman No. 42, RT 04 / RW 02, Menteng, Jakarta Pusat",
        accessNotes: order.notes || null,
        itemsJson: order.items || [],
        diagnosticNotes: order.notes || null,
      };

      const res = await fetch(`${SUPABASE_URL}/rest/v1/ServiceOrder?on_conflict=id`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn("[Supabase] Failed to insert ServiceOrder:", res.status, errorText);
        return { success: false, error: errorText };
      }

      const data = await res.json();
      return { success: true, data };
    } catch (err: any) {
      console.warn("[Supabase] Error executing createOrder:", err.message);
      return { success: false, error: err.message };
    }
  }

  /**
   * Fetch all orders from Supabase
   */
  public static async getOrders(): Promise<any[]> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/ServiceOrder?select=*&order=createdAt.desc`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Supabase] getOrders error:", err);
    }
    return [];
  }

  /**
   * Update ServiceOrder status in Supabase
   */
  public static async updateOrderStatus(
    orderId: string,
    status:
      | "PAID"
      | "COMPLETED"
      | "CANCELLED"
      | "IN_PROGRESS"
      | "ACCEPTED"
      | "DISPATCHED"
      | "PENDING"
      | "ARRIVED"
      | "DIAGNOSING"
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
          status: status.toUpperCase(),
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

  // =========================================================================
  // PAYMENT TRANSACTION METHODS
  // =========================================================================

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

  // =========================================================================
  // VIP & SUBSCRIPTION METHODS
  // =========================================================================

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

  // =========================================================================
  // WALLET METHODS
  // =========================================================================

  /**
   * Fetch wallet balance & pin from Supabase
   */
  public static async getWallet(userId: string = "usr-cst-001"): Promise<{ balance: number; pin: string } | null> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/Wallet?userId=eq.${userId}&select=*`, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      if (res.ok) {
        const rows = await res.json();
        if (rows && rows.length > 0) {
          return { balance: Number(rows[0].balance) || 0, pin: rows[0].pin || "123456" };
        }
      }
    } catch (err) {
      console.warn("[Supabase] getWallet error:", err);
    }
    return null;
  }

  /**
   * Top up wallet in Supabase & record WalletTransaction
   */
  public static async topUpWallet(
    userId: string = "usr-cst-001",
    amount: number,
    method: string = "QRIS"
  ): Promise<{ success: boolean; newBalance: number }> {
    try {
      // 1. Get current wallet
      const current = await this.getWallet(userId);
      const currentBalance = current ? current.balance : 650000;
      const newBalance = currentBalance + amount;

      // 2. Upsert Wallet
      await fetch(`${SUPABASE_URL}/rest/v1/Wallet?on_conflict=userId`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId: userId,
          balance: newBalance,
          pin: current ? current.pin : "123456",
          updatedAt: new Date().toISOString(),
        }),
      });

      // 3. Record WalletTransaction
      await fetch(`${SUPABASE_URL}/rest/v1/WalletTransaction`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId: userId,
          type: "TOPUP",
          amount: amount,
          description: `Top Up Saldo via ${method}`,
          method: method,
        }),
      });

      return { success: true, newBalance };
    } catch (err) {
      console.warn("[Supabase] topUpWallet error:", err);
      return { success: false, newBalance: 0 };
    }
  }

  /**
   * Deduct wallet in Supabase & record WalletTransaction
   */
  public static async deductWallet(
    userId: string = "usr-cst-001",
    amount: number,
    orderId?: string
  ): Promise<boolean> {
    try {
      const current = await this.getWallet(userId);
      const currentBalance = current ? current.balance : 650000;
      if (currentBalance < amount) return false;
      const newBalance = currentBalance - amount;

      await fetch(`${SUPABASE_URL}/rest/v1/Wallet?on_conflict=userId`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId: userId,
          balance: newBalance,
          pin: current ? current.pin : "123456",
          updatedAt: new Date().toISOString(),
        }),
      });

      await fetch(`${SUPABASE_URL}/rest/v1/WalletTransaction`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify({
          userId: userId,
          type: "PAYMENT",
          amount: -amount,
          description: `Pembayaran Servis #${orderId || "SRV-8942"}`,
          orderId: orderId || null,
        }),
      });

      return true;
    } catch (err) {
      console.warn("[Supabase] deductWallet error:", err);
      return false;
    }
  }
}
