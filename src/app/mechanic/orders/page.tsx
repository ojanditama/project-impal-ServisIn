"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";
import { ServiceOrder } from "@/models/ServiceOrder";
import { SupabaseService } from "@/lib/supabase";

export default function MechanicOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);

  const refreshOrders = () => {
    setOrders(dbStore.getOrders());
  };

  useEffect(() => {
    // 1. Local orders
    refreshOrders();

    // 2. Poll & sync from Supabase
    const interval = setInterval(() => {
      refreshOrders();
      SupabaseService.getOrders()
        .then((sbOrders) => {
          if (Array.isArray(sbOrders) && sbOrders.length > 0) {
            sbOrders.forEach((so) => {
              dbStore.addOrder(
                new ServiceOrder({
                  id: so.id,
                  customerId: so.customerId,
                  mechanicId: so.mechanicId,
                  vehicleId: so.vehicleId,
                  serviceType: so.serviceType,
                  status: so.status,
                  totalCost: so.totalCost,
                  isEmergency: so.isEmergency,
                  isVIP: so.isVIP,
                  locationCoord: {
                    lat: so.pickupLat,
                    lng: so.pickupLng,
                    address: so.pickupAddress,
                  },
                  items: so.itemsJson || [],
                  notes: so.diagnosticNotes || "",
                })
              );
            });
            refreshOrders();
          }
        })
        .catch(() => {});
    }, 2500);

    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("servisin")) {
        refreshOrders();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const handleAcceptOrder = (orderId: string) => {
    dbStore.updateOrderStatus(orderId, "Accepted");
    SupabaseService.updateOrderStatus(orderId, "ACCEPTED").catch(() => {});
    refreshOrders();
    router.push(`/mechanic/navigation?id=${orderId}`);
  };

  const handleDeclineOrder = (orderId: string) => {
    dbStore.updateOrderStatus(orderId, "Cancelled");
    SupabaseService.updateOrderStatus(orderId, "CANCELLED").catch(() => {});
    refreshOrders();
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-20 md:pb-8 selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="w-full max-w-5xl mx-auto p-4 md:px-8 md:py-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-3 border-b border-surface-container-high/60">
        <div className="flex items-center gap-2">
          <Link
            href="/mechanic/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Daftar Tugas &amp; Pesanan
          </h1>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
          {orders.length} Tugas
        </span>
      </div>

      {/* Orders List */}
      <div className="flex flex-col md:grid md:grid-cols-2 gap-3 mt-4">
        {orders.length === 0 ? (
          <div className="bg-surface-container-lowest rounded-2xl p-6 text-center border border-surface-container-high/60 text-on-surface-variant flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-on-surface-variant">
              inbox
            </span>
            <p className="text-xs">Belum ada pesanan aktif saat ini.</p>
          </div>
        ) : (
          orders.map((ord) => {
            const customer = dbStore.users.find((u) => u.id === ord.customerId) || dbStore.users[0];
            const vehicle = dbStore.vehicles.find((v) => v.id === ord.vehicleId) || dbStore.vehicles[0];

            return (
              <div
                key={ord.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-primary text-xs">
                      #{ord.id}
                    </span>
                    {ord.isEmergency && (
                      <span className="px-1.5 py-0.2 rounded bg-error-container text-error text-[9px] font-bold">
                        SOS DARURAT
                      </span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      ord.status === "Completed"
                        ? "bg-tertiary-fixed text-tertiary"
                        : ord.status === "Cancelled"
                        ? "bg-error-container text-error"
                        : "bg-primary-fixed text-primary"
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                    {ord.serviceType}
                  </h3>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant mt-1">
                    <span className="font-semibold text-on-surface">{customer.name}</span>
                    <span>•</span>
                    <span className="font-mono">{vehicle.brand} {vehicle.model} ({vehicle.licensePlate})</span>
                  </div>
                  <p className="font-body-sm text-[11px] text-on-surface-variant mt-1">
                    📍 {ord.locationCoord.address}
                  </p>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">Total Biaya Pengerjaan:</span>
                  <span className="font-bold text-on-surface">
                    Rp {ord.totalCost.toLocaleString("id-ID")}
                  </span>
                </div>

                {ord.status === "Dispatched" || ord.status === "Pending" ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDeclineOrder(ord.id)}
                      className="h-10 rounded-xl bg-surface-container-high text-error font-label-md text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-highest transition-colors"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        close
                      </span>
                      <span>Tolak Order</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(ord.id)}
                      className="h-10 rounded-xl bg-primary text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-105 transition-all"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        check_circle
                      </span>
                      <span>Terima Pesanan</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/mechanic/navigation?id=${ord.id}`}
                      className="h-10 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        near_me
                      </span>
                      <span>Buka Navigasi</span>
                    </Link>

                    <Link
                      href={`/tracking?id=${ord.id}`}
                      className="h-10 rounded-xl bg-surface-container-low text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        visibility
                      </span>
                      <span>Lihat GPS</span>
                    </Link>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      </div>

      <MechanicBottomNav />
    </div>
  );
}
