import { dbStore } from "@/lib/store";
import { ServiceOrder, ServiceOrderProps } from "@/models/ServiceOrder";
import { User } from "@/models/User";

export class OrderController {
  public static matchNearestMechanic(
    location: { lat: number; lng: number },
    isVIP: boolean = false
  ): { mechanic: User; etaMinutes: number; distanceKm: number } {
    // Spatial Matching algorithm using Mock PostGIS ST_Distance calculation
    const onlineMechanics = dbStore.users.filter(
      (u) =>
        u.role === "Mechanic" &&
        u.status === "Active" &&
        (!isVIP || (u.rating && u.rating >= 4.8))
    );

    const selectedMechanic = onlineMechanics[0] || dbStore.users.find((u) => u.role === "Mechanic");

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
      customerId: data.customerId,
      mechanicId: match.mechanic.id,
      vehicleId: data.vehicleId,
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
    dbStore.orders.unshift(newOrder);

    return {
      success: true,
      order: newOrder,
      message: `Montir ${match.mechanic.name} (Level BNSP) berhasil ditugaskan! Estimasi tiba ${match.etaMinutes} menit.`,
    };
  }
}
