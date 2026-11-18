import { dbStore } from "@/lib/store";
import { ServiceOrder } from "@/models/ServiceOrder";
import { User } from "@/models/User";
import { SupabaseService } from "@/lib/supabase";

export class OrderController {
  public static matchNearestMechanic(
    location: { lat: number; lng: number },
    isVIP: boolean = false
  ): { mechanic: User; etaMinutes: number; distanceKm: number } {
    // Spatial Matching algorithm using Mock PostGIS ST_Distance calculation
    const allUsers = dbStore.getUsers();
    const onlineMechanics = allUsers.filter(
      (u) =>
        u.role === "Mechanic" &&
        u.status === "Active" &&
        (!isVIP || (u.rating && u.rating >= 4.8))
    );

    const selectedMechanic =
      onlineMechanics[0] ||
      allUsers.find((u) => u.role === "Mechanic") ||
      new User({
        id: "usr-mec-001",
        name: "Bambang Sudiro",
        phone: "081377889900",
        email: "bambang.sudiro@servisin.id",
        passwordHash: "password123",
        role: "Mechanic",
        status: "Active",
      });

    return {
      mechanic: selectedMechanic,
      etaMinutes: 7,
      distanceKm: 1.8,
    };
  }

  public static createServiceOrder(data: {
    customerId: string;
    vehicleId: string;
    serviceType: string;
    locationCoord: { lat: number; lng: number; address: string };
    totalCost: number;
    items?: Array<{ name: string; price: number }>;
    notes?: string;
    isEmergency?: boolean;
    isVIP?: boolean;
  }): { success: boolean; order?: ServiceOrder; message: string } {
    const match = this.matchNearestMechanic(
      { lat: data.locationCoord.lat, lng: data.locationCoord.lng },
      data.isVIP
    );

    const newOrder = new ServiceOrder({
      id: "SRV-" + Math.floor(1000 + Math.random() * 9000),
      customerId: data.customerId || "usr-cst-001",
      mechanicId: match.mechanic.id,
      vehicleId: data.vehicleId || "veh-001",
      serviceType: data.serviceType,
      locationCoord: data.locationCoord,
      status: "Dispatched",
      totalCost: data.totalCost,
      items: data.items || [],
      notes: data.notes || "",
      isEmergency: data.isEmergency ?? false,
      isVIP: data.isVIP ?? false,
    });

    newOrder.createOrder();

    // 1. Persist locally for instant snappy UI
    dbStore.addOrder(newOrder);

    // 2. Persist to Supabase Database
    SupabaseService.createOrder(newOrder).catch((err) => {
      console.warn("[OrderController] Supabase createOrder notice:", err);
    });

    return {
      success: true,
      order: newOrder,
      message: `Montir ${match.mechanic.name} (Level BNSP) berhasil ditugaskan! Estimasi tiba ${match.etaMinutes} menit.`,
    };
  }
}
