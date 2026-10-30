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
    tier: "VIP",
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
