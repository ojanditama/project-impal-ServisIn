"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";
import { ServiceOrder } from "@/models/ServiceOrder";
import { SupabaseService } from "@/lib/supabase";

function MechanicNavigationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SRV-8942";

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [currentStep, setCurrentStep] = useState(2); // 1: Menuju Lokasi, 2: Tiba di TKP, 3: Diagnosa & Pengerjaan, 4: Selesai
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    const orders = dbStore.getOrders();
    const found = orders.find((o) => o.id === orderId) || orders[0];
    if (found) {
      setOrder(found);
      const st = (found.status || "").toUpperCase();
      if (st === "ARRIVED") setCurrentStep(3);
      else if (st === "IN_PROGRESS" || st === "INPROGRESS") setCurrentStep(4);
      else if (st === "COMPLETED") setCurrentStep(4);
      else setCurrentStep(2);
    }
  }, [orderId]);

  const customer = order
    ? dbStore.users.find((u) => u.id === order.customerId) || dbStore.users[0]
    : dbStore.users[0];

  const vehicle = order
    ? dbStore.vehicles.find((v) => v.id === order.vehicleId) || dbStore.vehicles[0]
    : dbStore.vehicles[0];

  const handleStepAction = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      if (order) {
        dbStore.updateOrderStatus(order.id, "Arrived");
        SupabaseService.updateOrderStatus(order.id, "ARRIVED").catch(() => {});
      }
      setToastMessage("Geofence valid! Status: Mekanik Tiba di Lokasi Garasi.");
    } else if (currentStep === 3) {
      setCurrentStep(4);
      if (order) {
        dbStore.updateOrderStatus(order.id, "InProgress");
        SupabaseService.updateOrderStatus(order.id, "IN_PROGRESS").catch(() => {});
      }
      setToastMessage("Diagnosa & pengerjaan tersimpan. Lanjut ke finalisasi.");
    } else if (currentStep === 4) {
      if (order) {
        dbStore.updateOrderStatus(order.id, "Completed");
        SupabaseService.updateOrderStatus(order.id, "COMPLETED").catch(() => {});
      }
      setToastMessage("Pekerjaan tuntas! Menuju ke dompet mekanik...");
      setTimeout(() => {
        router.push("/mechanic/wallet");
      }, 1000);
    }
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-20 md:pb-8 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Top Header (Mobile only, desktop uses top nav) */}
      <header className="md:hidden sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/mechanic/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <div className="flex items-center gap-1.5">
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              ServisIn
            </span>
            <span className="px-1.5 py-0.2 rounded bg-secondary text-on-secondary font-bold text-[10px]">
              MITRA
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px]">
            BNSP
          </span>
          <Link href="/mechanic/profile">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Mekanik"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40"
            />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-3 md:py-6 flex flex-col gap-4">
        {/* Turn-by-turn HUD (Navigation Banner) */}
        <div>
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center font-bold shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                turn_left
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-headline-sm font-bold">350 m</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-600/70 text-emerald-100 font-bold text-[9px] uppercase">
                  LANCAR
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 truncate max-w-[190px]">
                Belok Kiri ke Jalur Lambat Jl. Gatot Subroto
              </p>
            </div>
          </div>

          <div className="text-right pl-2 border-l border-slate-700">
            <span className="font-headline-sm text-sm font-bold text-primary-fixed block">
              4 mnt
            </span>
            <span className="text-[10px] text-slate-400">1.2 km lagi</span>
          </div>
        </div>
        </div>

        {/* 2-Column Grid on Desktop: Map & Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Left Column: GPS Map Area */}
          <div className="relative h-72 lg:h-[460px] w-full bg-slate-200 rounded-2xl overflow-hidden shadow-sm border border-surface-container-high/60">
        <div
          className="absolute inset-0 bg-cover bg-center filter contrast-125"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-surface/90"></div>

        {/* GPS status */}
        <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center gap-1.5 text-[11px] font-bold text-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>RADAR GPS STABIL • Akurasi ± 3m</span>
        </div>

        {/* Recenter & Map Buttons */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={() => alert("Peta recentered ke lokasi montir.")}
            className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-slate-800"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              my_location
            </span>
          </button>
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noreferrer"
            className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-primary-container"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              map
            </span>
          </a>
        </div>

        {/* Destination callout */}
        <div className="absolute bottom-3 left-3 right-3 z-10 p-2.5 rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
              location_on
            </span>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block uppercase">
                TITIK KEDATANGAN PELANGGAN
              </span>
              <span className="text-xs font-bold text-slate-800">
                {order ? order.locationCoord.address : "Jl. Sudirman No. 42, Menteng, Jakarta Pusat"}
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-bold text-[10px]">
            Rute Aktif
          </span>
        </div>
          </div>

          {/* Right Column: Customer Info & Stepper */}
          <div className="flex flex-col gap-4">
            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={customer.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"}
                  alt={customer.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/30"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {customer.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="text-amber-500 font-bold">★ 5.0</span>
                  <span>•</span>
                  <span>{order?.isVIP ? "Member VIP Priority" : "Pelanggan Terverifikasi"}</span>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-mono font-bold text-[11px]">
              #{order?.id || orderId}
            </span>
          </div>

          {/* Vehicle info */}
          <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                directions_car
              </span>
              <span>{vehicle.brand} {vehicle.model}</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded">
              {vehicle.licensePlate}
            </span>
          </div>

          {/* Service & Complaint */}
          <div className="bg-surface-container-low rounded-xl p-2.5 border border-surface-container-high/60 flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-on-surface flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-base">
                  build
                </span>
                {order?.serviceType || "Servis Berkala & Tune Up"}
              </span>
              <span className="font-bold text-tertiary">
                Rp {order ? order.totalCost.toLocaleString("id-ID") : "299.000"}
              </span>
            </div>
            {order?.notes && (
              <p className="text-[11px] text-on-surface-variant leading-snug mt-1">
                <strong className="text-on-surface font-semibold">Catatan:</strong> {order.notes}
              </p>
            )}
          </div>

          {/* Contact buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={`tel:${customer.phone}`}
              className="h-11 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                call
              </span>
              <span>Telepon Langsung</span>
            </a>

            <a
              href={`https://wa.me/62${customer.phone.replace(/^0/, "")}`}
              target="_blank"
              rel="noreferrer"
              className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                chat
              </span>
              <span>Kirim Chat WA</span>
            </a>
          </div>
        </div>

        {/* Progres Servis Lapangan (Stepper 4 Stages) */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Progres Servis Lapangan
            </h3>
            <span className="font-label-sm text-primary font-bold text-[10px] uppercase">
              TAHAP {currentStep} DARI 4
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-center">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold shadow-sm">
                ✓
              </div>
              <span className="text-[10px] font-semibold text-tertiary">Menuju Lokasi</span>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                  currentStep >= 2
                    ? "bg-primary-container text-on-primary ring-4 ring-primary-container/20"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {currentStep > 2 ? "✓" : "2"}
              </div>
              <span className="text-[10px] font-semibold text-on-surface">Tiba di TKP</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                  currentStep >= 3
                    ? "bg-primary-container text-on-primary ring-4 ring-primary-container/20"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {currentStep > 3 ? "✓" : "3"}
              </div>
              <span className="text-[10px] font-semibold text-on-surface">Pengerjaan</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${
                  currentStep >= 4
                    ? "bg-primary-container text-on-primary ring-4 ring-primary-container/20"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                4
              </div>
              <span className="text-[10px] font-semibold text-on-surface">Selesai</span>
            </div>
          </div>

          {/* Action button based on current step */}
          <button
            type="button"
            onClick={handleStepAction}
            className="w-full h-12 mt-2 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all"
          >
            {currentStep === 2 && (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  location_on
                </span>
                <span>Konfirmasi: Sudah Tiba di Lokasi</span>
              </>
            )}
            {currentStep === 3 && (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  build
                </span>
                <span>Selesaikan Pengerjaan &amp; QC Servis</span>
              </>
            )}
            {currentStep === 4 && (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  check_circle
                </span>
                <span>Pekerjaan Tuntas • Masuk ke Dompet</span>
              </>
            )}
          </button>
        </div>
      </div>
      </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-4 right-4 z-50 bg-slate-900 text-white p-3 rounded-xl shadow-xl flex items-center justify-between text-xs animate-in slide-in-from-bottom">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-slate-400 font-bold ml-2">
            ✕
          </button>
        </div>
      )}

      <MechanicBottomNav />
    </div>
  );
}

export default function MechanicNavigationPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <MechanicNavigationContent />
    </Suspense>
  );
}
