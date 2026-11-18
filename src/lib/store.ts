import { User } from "@/models/User";
import { Vehicle } from "@/models/Vehicle";
import { ServiceOrder } from "@/models/ServiceOrder";
import { PremiumSubscription } from "@/models/PremiumSubscription";
import { DisputeTicket } from "@/models/DisputeTicket";

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

// In-Memory Global Storage (persists per runtime)
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
        const list: WalletTransaction[] = historyJson ? JSON.parse(historyJson) : [...this.customerWallet.history];
        list.unshift({
          id: "TOPUP-" + Date.now().toString(36).toUpperCase(),
          type: "TOPUP",
          amount: amount,
          description: `Top Up Saldo via ${method}`,
          timestamp: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
          method,
        });
        localStorage.setItem("servisin_wallet_history", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
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
        const list: WalletTransaction[] = historyJson ? JSON.parse(historyJson) : [...this.customerWallet.history];
        list.unshift({
          id: "PAY-" + Date.now().toString(36).toUpperCase(),
          type: "PAYMENT",
          amount: -amount,
          description: `Pembayaran Servis #${orderId || "SRV-8942"}`,
          timestamp: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }),
          orderId,
        });
        localStorage.setItem("servisin_wallet_history", JSON.stringify(list));
      } catch (e) {
        console.error(e);
      }
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
    const u = this.users.find((u) => u.id === userId);
    return u?.tier || "Regular";
  }

  public setUserTier(tier: "Regular" | "VIP", userId: string = "usr-cst-001"): void {
    const u = this.users.find((u) => u.id === userId);
    if (u) {
      u.tier = tier;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("servisin_user_tier", tier);
    }
  }

  public findUserByPhoneOrEmail(identifier: string): User | undefined {
    return this.users.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.phone.replace(/[^0-9]/g, "").includes(identifier.replace(/[^0-9]/g, ""))
    );
  }

  public getActiveVehicle(userId: string): Vehicle | undefined {
    return (
      this.vehicles.find((v) => v.userId === userId && v.isActive) ||
      this.vehicles.find((v) => v.userId === userId)
    );
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
