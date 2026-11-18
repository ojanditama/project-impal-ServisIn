import { User } from "@/models/User";
import { Vehicle } from "@/models/Vehicle";
import { ServiceOrder } from "@/models/ServiceOrder";
import { PremiumSubscription } from "@/models/PremiumSubscription";
import { DisputeTicket } from "@/models/DisputeTicket";
import { SupabaseService } from "@/lib/supabase";

// Initial Demo Seed Data
const initialUsers: User[] = [
  new User({
    id: "usr-cst-001",
    name: "Rizky Pratama",
    phone: "081298453210",
    email: "rizky.pratama@gmail.com",
    passwordHash: "password123",
    role: "Customer",
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80",
    tier: "Regular",
  }),
  new User({
    id: "usr-mec-001",
    name: "Bambang Sudiro",
    phone: "081377889900",
    email: "bambang.sudiro@servisin.id",
    passwordHash: "password123",
    role: "Mechanic",
    status: "Active",
    rating: 4.92,
    bnspCertified: true,
    avatarUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80",
  }),
  new User({
    id: "usr-adm-001",
    name: "Admin Pusat ServisIn",
    phone: "081100223344",
    email: "admin@servisin.id",
    passwordHash: "admin123",
    role: "Admin",
    status: "Active",
    avatarUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&h=200&q=80",
  }),
];

const initialVehicles: Vehicle[] = [
  new Vehicle({
    id: "veh-001",
    userId: "usr-cst-001",
    brand: "Toyota",
    model: "Avanza Veloz 1.5 AT",
    year: 2021,
    licensePlate: "B 1234 ABC",
    isActive: true,
    odometerKm: 34200,
    healthPercent: 94,
    color: "Silver Metalik",
    imageUrl:
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80",
    lastServiceDate: "12 Mei 2024",
  }),
  new Vehicle({
    id: "veh-002",
    userId: "usr-cst-001",
    brand: "Honda",
    model: "Beat 110cc CBS",
    year: 2022,
    licensePlate: "B 5678 XYZ",
    isActive: false,
    odometerKm: 14500,
    healthPercent: 88,
    color: "Hitam Glossy",
    imageUrl:
      "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    lastServiceDate: "10 Mar 2024",
  }),
];

const initialOrders: ServiceOrder[] = [
  new ServiceOrder({
    id: "SRV-8942",
    customerId: "usr-cst-001",
    mechanicId: "usr-mec-001",
    vehicleId: "veh-001",
    serviceType: "Servis Berkala & Tune Up",
    locationCoord: {
      lat: -6.2088,
      lng: 106.8456,
      address: "Jl. Sudirman No. 42, RT 04 / RW 02, Menteng, Jakarta Pusat",
    },
    status: "Dispatched",
    totalCost: 349000,
    isEmergency: false,
    isVIP: true,
    items: [
      { name: "Jasa Tune Up & 32 Pengecekan", price: 299000 },
      { name: "Oli Mesin Shell Helix Ultra 4L", price: 50000 },
      { name: "Biaya Kunjungan Mekanik (PROMO)", price: 0 },
    ],
    notes:
      "Tarikan gas bawah agak berat saat mesin panas, tolong periksa celah busi dan filter udara.",
  }),
];

const initialDisputes: DisputeTicket[] = [
  new DisputeTicket({
    id: "DSP-1002",
    orderId: "SRV-8821",
    customerId: "usr-cst-001",
    complaintText:
      "Setelah servis ganti van belt kemarin, ada bunyi dengung kecil saat rpm 2500. Garansi masih 28 hari aktif.",
    status: "Open",
  }),
];

export interface WalletTransaction {
  id: string;
  type: "TOPUP" | "PAYMENT";
  amount: number;
  description: string;
  timestamp: string;
  method?: string;
  orderId?: string;
}

export interface CustomerWalletData {
  balance: number;
  pin: string;
  history: WalletTransaction[];
}

// Global In-Memory and Persisted Storage
class ServisInDataStore {
  public users: User[] = [...initialUsers];
  public vehicles: Vehicle[] = [...initialVehicles];
  public orders: ServiceOrder[] = [...initialOrders];
  public subscriptions: PremiumSubscription[] = [
    new PremiumSubscription({
      id: "sub-001",
      userId: "usr-cst-001",
      planType: "Annual",
      warrantyDays: 30,
    }),
  ];
  public disputes: DisputeTicket[] = [...initialDisputes];
  public mechanicOnline: boolean = true;
  public mechanicLocation = { lat: -6.215, lng: 106.832, address: "Jl. Gatot Subroto" };

  // =========================================================================
  // USER PERSISTENCE & HELPERS
  // =========================================================================
  public getUsers(): User[] {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("servisin_users");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((u: any) => new User(u));
          }
        }
      } catch (e) {
        console.error("Error reading servisin_users:", e);
      }
    }
    return this.users;
  }

  public addUser(user: User): void {
    const list = this.getUsers();
    const existingIndex = list.findIndex((u) => u.id === user.id || u.phone === user.phone);
    if (existingIndex >= 0) {
      list[existingIndex] = user;
    } else {
      list.push(user);
    }
    this.users = list;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_users", JSON.stringify(list));
      } catch (e) {
        console.error("Error saving servisin_users:", e);
      }
    }
  }

  public getCurrentUser(): User {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("servisin_current_user");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id) {
            return new User(parsed);
          }
        }
      } catch (e) {
        console.error("Error reading servisin_current_user:", e);
      }
    }
    return this.users[0];
  }

  public setCurrentUser(user: User): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_current_user", JSON.stringify(user));
      } catch (e) {
        console.error("Error saving servisin_current_user:", e);
      }
    }
  }

  public findUserByPhoneOrEmail(identifier: string): User | undefined {
    const allUsers = this.getUsers();
    const cleanPhone = identifier.replace(/[^0-9]/g, "");
    return allUsers.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        (cleanPhone.length >= 8 && u.phone.replace(/[^0-9]/g, "").includes(cleanPhone))
    );
  }

  // =========================================================================
  // VEHICLE PERSISTENCE & HELPERS
  // =========================================================================
  public getVehicles(userId?: string): Vehicle[] {
    let currentList = this.vehicles;
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("servisin_vehicles");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            currentList = parsed.map((v: any) => new Vehicle(v));
          }
        }
      } catch (e) {
        console.error("Error reading servisin_vehicles:", e);
      }
    }
    if (userId) {
      const filtered = currentList.filter((v) => v.userId === userId);
      return filtered.length > 0 ? filtered : currentList;
    }
    return currentList;
  }

  public setVehicles(list: Vehicle[]): void {
    this.vehicles = list;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_vehicles", JSON.stringify(list));
      } catch (e) {
        console.error("Error saving servisin_vehicles:", e);
      }
    }
  }

  public addVehicle(vehicle: Vehicle): void {
    const list = this.getVehicles();
    const existingIndex = list.findIndex(
      (v) => v.id === vehicle.id || v.licensePlate === vehicle.licensePlate
    );
    if (existingIndex >= 0) {
      list[existingIndex] = vehicle;
    } else {
      list.push(vehicle);
    }
    this.setVehicles(list);
  }

  public setActiveVehicle(userId: string, vehicleId: string): void {
    const list = this.getVehicles();
    const updated = list.map((v) => {
      v.isActive = v.id === vehicleId;
      return v;
    });
    this.setVehicles(updated);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_active_vehicle_id", vehicleId);
      } catch (e) {
        console.error(e);
      }
    }
  }

  public getActiveVehicle(userId?: string): Vehicle | undefined {
    const list = this.getVehicles(userId);
    if (typeof window !== "undefined") {
      try {
        const storedActiveId = localStorage.getItem("servisin_active_vehicle_id");
        if (storedActiveId) {
          const found = list.find((v) => v.id === storedActiveId);
          if (found) return found;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return list.find((v) => v.isActive) || list[0];
  }

  // =========================================================================
  // ORDER PERSISTENCE & HELPERS
  // =========================================================================
  public getOrders(): ServiceOrder[] {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("servisin_orders");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item: any) => new ServiceOrder(item));
          }
        }
      } catch (e) {
        console.error("Error reading servisin_orders:", e);
      }
    }
    return this.orders;
  }

  public addOrder(order: ServiceOrder): void {
    const currentOrders = this.getOrders();
    const existingIndex = currentOrders.findIndex((o) => o.id === order.id);
    if (existingIndex >= 0) {
      currentOrders[existingIndex] = order;
    } else {
      currentOrders.unshift(order);
    }
    this.orders = currentOrders;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_orders", JSON.stringify(currentOrders));
      } catch (e) {
        console.error("Error saving servisin_orders:", e);
      }
    }
  }

  public updateOrderStatus(orderId: string, status: any): void {
    const list = this.getOrders();
    const found = list.find((o) => o.id === orderId);
    if (found) {
      found.status = status;
    }
    this.orders = list;
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("servisin_orders", JSON.stringify(list));
      } catch (e) {
        console.error("Error updating servisin_orders:", e);
      }
    }
  }

  // =========================================================================
  // WALLET & VIP
  // =========================================================================
  public customerWallet: CustomerWalletData = {
    balance: 650000,
    pin: "123456",
    history: [
      {
        id: "WAL-INIT-01",
        type: "TOPUP",
        amount: 650000,
        description: "Saldo Awal ServisIn Wallet",
        timestamp: "18 Nov 2026, 09:00 WIB",
        method: "BCA Virtual Account",
      },
    ],
  };
  public mechanicWallet = {
    balance: 1485000,
    escrow: 165000,
    dailyCompleted: 4,
    dailyTarget: 5,
    hoursOnline: "5j 20m",
    acceptanceRate: "98%",
    rating: 4.92,
    todayEarnings: 485000,
  };

  public getCustomerBalance(): number {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("servisin_customer_balance");
      if (stored !== null) {
        return parseFloat(stored) || 0;
      }
    }
    return this.customerWallet.balance;
  }

  public topUpCustomerWallet(amount: number, method: string = "QRIS"): number {
    const current = this.getCustomerBalance();
    const newBalance = current + amount;
    this.customerWallet.balance = newBalance;
    if (typeof window !== "undefined") {
      localStorage.setItem("servisin_customer_balance", newBalance.toString());
      try {
        const historyJson = localStorage.getItem("servisin_wallet_history");
        const list: WalletTransaction[] = historyJson
          ? JSON.parse(historyJson)
          : [...this.customerWallet.history];
        list.unshift({
          id: "TOPUP-" + Date.now().toString(36).toUpperCase(),
          type: "TOPUP",
          amount: amount,
          description: `Top Up Saldo via ${method}`,
          timestamp: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          method,
        });
        localStorage.setItem("servisin_wallet_history", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }

    // Sync to Supabase Wallet table in background
    try {
      const curUser = this.getCurrentUser();
      SupabaseService.topUpWallet(curUser.id, amount, method).catch(() => {});
    } catch (e) {
      console.warn("Notice syncing topup to Supabase:", e);
    }

    return newBalance;
  }

  public deductCustomerWallet(amount: number, orderId?: string): boolean {
    const current = this.getCustomerBalance();
    if (current < amount) return false;
    const newBalance = current - amount;
    this.customerWallet.balance = newBalance;
    if (typeof window !== "undefined") {
      localStorage.setItem("servisin_customer_balance", newBalance.toString());
      try {
        const historyJson = localStorage.getItem("servisin_wallet_history");
        const list: WalletTransaction[] = historyJson
          ? JSON.parse(historyJson)
          : [...this.customerWallet.history];
        list.unshift({
          id: "PAY-" + Date.now().toString(36).toUpperCase(),
          type: "PAYMENT",
          amount: -amount,
          description: `Pembayaran Servis #${orderId || "SRV-8942"}`,
          timestamp: new Date().toLocaleString("id-ID", {
            dateStyle: "medium",
            timeStyle: "short",
          }),
          orderId,
        });
        localStorage.setItem("servisin_wallet_history", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }

    // Sync to Supabase Wallet table in background
    try {
      const curUser = this.getCurrentUser();
      SupabaseService.deductWallet(curUser.id, amount, orderId).catch(() => {});
    } catch (e) {
      console.warn("Notice syncing deduct to Supabase:", e);
    }

    return true;
  }

  public verifyCustomerPin(enteredPin: string): boolean {
    return enteredPin === (this.customerWallet.pin || "123456");
  }

  public getUserTier(userId: string = "usr-cst-001"): "Regular" | "VIP" {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("servisin_user_tier");
      if (stored === "VIP" || stored === "Regular") {
        return stored;
      }
    }
    const u = this.getUsers().find((u) => u.id === userId);
    return u?.tier || "Regular";
  }

  public setUserTier(tier: "Regular" | "VIP", userId: string = "usr-cst-001"): void {
    const list = this.getUsers();
    const u = list.find((u) => u.id === userId);
    if (u) {
      u.tier = tier;
    }
    this.users = list;
    if (typeof window !== "undefined") {
      localStorage.setItem("servisin_user_tier", tier);
      try {
        localStorage.setItem("servisin_users", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
    }
  }
}

// Global singleton
declare global {
  // eslint-disable-next-line no-var
  var __servisinStore: ServisInDataStore | undefined;
}

export const dbStore = globalThis.__servisinStore || new ServisInDataStore();
if (process.env.NODE_ENV !== "production") {
  globalThis.__servisinStore = dbStore;
}
