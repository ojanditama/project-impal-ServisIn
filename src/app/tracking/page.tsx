"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import { dbStore } from "@/lib/store";
import { SupabaseService } from "@/lib/supabase";
import { ServiceOrder } from "@/models/ServiceOrder";
import { Vehicle } from "@/models/Vehicle";

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SRV-8942";

  const [order, setOrder] = useState<ServiceOrder | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [currentStep, setCurrentStep] = useState(2); // 1: Diterima, 2: Menuju Lokasi, 3: Tiba, 4: Pengerjaan, 5: Selesai
  const [etaMinutes, setEtaMinutes] = useState(7);
  const [distanceKm, setDistanceKm] = useState(1.8);
  const [showToast, setShowToast] = useState(true);
  const [toastMessage, setToastMessage] = useState(
    "Telemetri terverifikasi: Montir sedang menuju lokasi garasi Anda."
  );

  const applyStatus = (rawStatus: string) => {
    const st = (rawStatus || "").toUpperCase();
    if (st === "DISPATCHED" || st === "PENDING") {
      setCurrentStep(1);
    } else if (st === "ACCEPTED") {
      setCurrentStep(2);
    } else if (st === "ARRIVED") {
      setCurrentStep(3);
      setEtaMinutes(0);
      setDistanceKm(0);
      setToastMessage("🔔 Montir Bambang Sudiro sudah sampai di titik garasi Anda!");
      setShowToast(true);
    } else if (st === "DIAGNOSING" || st === "IN_PROGRESS" || st === "INPROGRESS") {
      setCurrentStep(4);
      setEtaMinutes(0);
      setDistanceKm(0);
      setToastMessage("🔧 Pengerjaan servis sedang berlangsung oleh teknisi BNSP.");
      setShowToast(true);
    } else if (st === "COMPLETED" || st === "PAID") {
      setCurrentStep(5);
      setEtaMinutes(0);
      setDistanceKm(0);
      setToastMessage("✅ Servis telah selesai dengan baik! Silakan lakukan pembayaran.");
      setShowToast(true);
    }
  };

  // Poll order status & listen for local cross-tab updates
  useEffect(() => {
    const loadOrderData = () => {
      const orders = dbStore.getOrders();
      const found = orders.find((o) => o.id === orderId) || orders[0];
      if (found) {
        setOrder(found);
        applyStatus(found.status);

        // Find vehicle
        const vList = dbStore.getVehicles();
        const vFound = vList.find((v) => v.id === found.vehicleId) || vList[0];
        if (vFound) setVehicle(vFound);
      }

      // Background sync from Supabase
      SupabaseService.getOrder(orderId)
        .then((sbOrd) => {
          if (sbOrd && sbOrd.status) {
            applyStatus(sbOrd.status);
            if (found && found.status !== sbOrd.status) {
              dbStore.updateOrderStatus(orderId, sbOrd.status);
            }
          }
        })
        .catch(() => {});
    };

    loadOrderData();
    const interval = setInterval(loadOrderData, 2000);

    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes("servisin")) {
        loadOrderData();
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", onStorage);
    };
  }, [orderId]);

  // Live simulation of mechanic moving closer (only while en-route / step 2)
  useEffect(() => {
    if (currentStep !== 2) return;
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
      setDistanceKm((prev) => (prev > 0.3 ? Number((prev - 0.2).toFixed(1)) : 0.2));
    }, 12000);
    return () => clearInterval(timer);
  }, [currentStep]);

  const handleSimulateArrived = () => {
    setCurrentStep(3);
    setEtaMinutes(0);
    setDistanceKm(0);
    setToastMessage("🔔 Simulasi: Montir telah tiba di titik garasi Anda!");
    setShowToast(true);
    if (order) {
      dbStore.updateOrderStatus(order.id, "Arrived");
      SupabaseService.updateOrderStatus(order.id, "ARRIVED").catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="Live Mechanic Tracking" />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 pb-24 md:pb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                GPS LIVE TELEMETRI AKTIF
              </span>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl font-extrabold text-on-surface mt-1">
              Pantau Posisi &amp; Perjalanan Montir
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface font-mono text-xs font-bold">
              Order ID: #{orderId}
            </span>
          </div>
        </div>

        {/* 12-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Map View */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="relative h-[340px] sm:h-[420px] lg:h-[540px] w-full rounded-3xl bg-slate-200 overflow-hidden shadow-lg border border-surface-container-high/60">
              {/* Map stylized background */}
              <div
                className="absolute inset-0 bg-cover bg-center filter contrast-125 brightness-95"
                style={{
                  backgroundImage:
                    "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
                }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-transparent to-surface/90"></div>

              {/* Floating Pills on Map */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="px-3.5 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-md flex items-center gap-2 text-xs font-bold text-on-surface border border-surface-container-high/40">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
                  <span>Order #{orderId}</span>
                </div>
                <div className="px-3.5 py-1.5 rounded-full bg-tertiary text-on-tertiary shadow-md flex items-center gap-1.5 text-xs font-bold">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    my_location
                  </span>
                  <span>GPS RADAR AKTIF</span>
                </div>
              </div>

              {/* SVG Route Visualization */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 500 400" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3755c3" />
                    <stop offset="100%" stopColor="#ff6b00" />
                  </linearGradient>
                </defs>
                <path
                  d="M 120 300 Q 220 250 280 180 T 380 90"
                  fill="none"
                  stroke="url(#routeGrad)"
                  strokeWidth="6"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Customer Location Pin */}
              <div className="absolute top-20 right-28 flex flex-col items-center">
                <div className="px-2.5 py-1 rounded-md bg-primary text-on-primary text-[10px] font-bold shadow-md mb-1 whitespace-nowrap">
                  Lokasi Garasi Anda
                </div>
                <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl ring-4 ring-white/90">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    directions_car
                  </span>
                </div>
              </div>

              {/* Mechanic Live Pin */}
              <div className="absolute bottom-28 left-24 flex flex-col items-center">
                <div className="relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <div className="w-11 h-11 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xl ring-4 ring-white">
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                      two_wheeler
                    </span>
                  </div>
                </div>
              </div>

              {/* Floating ETA Card on bottom of map */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-xl border border-surface-container-high/60">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                      currentStep >= 3
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-primary-fixed text-primary"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                      {currentStep >= 5
                        ? "task_alt"
                        : currentStep === 4
                        ? "construction"
                        : currentStep === 3
                        ? "check_circle"
                        : "timer"}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-bold text-base md:text-lg text-on-surface">
                      {currentStep === 1 && <span>Menunggu Konfirmasi</span>}
                      {currentStep === 2 && (
                        <>
                          <span>{etaMinutes} Menit</span>
                          <span className="text-on-surface-variant font-normal text-xs md:text-sm">
                            • {distanceKm} km lagi
                          </span>
                        </>
                      )}
                      {currentStep === 3 && (
                        <span className="text-emerald-700 flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Mekanik Tiba di Lokasi!
                        </span>
                      )}
                      {currentStep === 4 && (
                        <span className="text-primary">Servis Sedang Dikerjakan</span>
                      )}
                      {currentStep >= 5 && (
                        <span className="text-emerald-600">Servis Selesai</span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">
                      {currentStep === 1 && "Dispatcher sedang menugaskan montir terdekat ke lokasi Anda."}
                      {currentStep === 2 && "Pak Bambang Sudiro sedang bergerak menuju lokasi garasi Anda."}
                      {currentStep === 3 && "Pak Bambang sudah sampai di depan rumah/garasi. Harap temui montir."}
                      {currentStep === 4 && "Montir sedang melakukan inspeksi & perbaikan kendaraan sesuai SOP."}
                      {currentStep >= 5 && "Pengerjaan selesai. Silakan periksa hasil servis & lakukan pembayaran."}
                    </span>
                  </div>
                </div>
                {currentStep < 3 && (
                  <button
                    type="button"
                    onClick={handleSimulateArrived}
                    title="Simulasikan montir tiba"
                    className="px-3 py-2 rounded-xl bg-surface-container-low text-xs font-bold text-on-surface hover:bg-surface-container shadow-sm flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      done_all
                    </span>
                    <span className="hidden sm:inline">Simulasi Tiba</span>
                  </button>
                )}
                {currentStep >= 5 && (
                  <Link
                    href={`/payment?id=${orderId}`}
                    className="px-4 py-2.5 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md hover:brightness-105 flex items-center gap-1"
                  >
                    <span>Bayar Sekarang</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      arrow_forward
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Notification Toast */}
            {showToast && (
              <div
                className={`rounded-2xl p-4 shadow-xl flex items-center justify-between text-white transition-all ${
                  currentStep >= 3 ? "bg-emerald-800" : "bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5 text-xs md:text-sm">
                  <span
                    className="material-symbols-outlined text-emerald-300"
                    style={{ fontSize: 20 }}
                  >
                    {currentStep >= 3 ? "verified" : "near_me"}
                  </span>
                  <span>{toastMessage}</span>
                </div>
                <button
                  onClick={() => setShowToast(false)}
                  className="text-white/70 hover:text-white text-xs font-bold px-2 py-1"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Mechanic Profile, Timeline, & Order Details */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Mechanic Profile Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 md:p-6 border border-surface-container-high/60 shadow-md flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80"
                      alt="Bambang Sudiro"
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-primary-container/40"
                    />
                    <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-xs font-bold ring-2 ring-white">
                      ✓
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                      Bambang Sudiro
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold text-[10px]">
                        BNSP Level IV
                      </span>
                      <span className="text-xs font-semibold text-on-surface flex items-center gap-0.5">
                        ★ 4.9 <span className="text-on-surface-variant font-normal">(420+ Servis)</span>
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                    currentStep >= 3
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-primary-fixed text-primary"
                  }`}
                >
                  {currentStep >= 5
                    ? "SELESAI"
                    : currentStep === 4
                    ? "SERVIS AKTIF"
                    : currentStep === 3
                    ? "TIBA DI LOKASI"
                    : currentStep === 2
                    ? "EN-ROUTE"
                    : "MENUNGGU"}
                </span>
              </div>

              <div className="bg-surface-container-low rounded-2xl p-3 flex items-center justify-between text-xs text-on-surface-variant">
                <span className="flex items-center gap-2 font-semibold text-on-surface">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    two_wheeler
                  </span>
                  Honda Vario 160 (B 4521 SKL)
                </span>
                <span className="flex items-center gap-1 text-tertiary font-bold text-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    handyman
                  </span>
                  Toolbox Siap
                </span>
              </div>

              {/* 2 Contact Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:081377889900"
                  className="h-12 rounded-xl bg-secondary text-on-secondary font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm hover:brightness-105 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    call
                  </span>
                  <span>Hubungi Telepon</span>
                </a>
                <a
                  href="https://wa.me/6281377889900"
                  target="_blank"
                  rel="noreferrer"
                  className="h-12 rounded-xl bg-surface-container-high text-on-surface font-bold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
                >
                  <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                    chat
                  </span>
                  <span>Kirim WhatsApp</span>
                </a>
              </div>
            </div>

            {/* 5-Step Status Penanganan Timeline */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 md:p-6 border border-surface-container-high/60 shadow-md flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
                <h3 className="font-headline-sm text-sm md:text-base font-bold text-on-surface">
                  Tahapan Status Penanganan
                </h3>
                <span className="text-xs font-bold text-primary">
                  Langkah {currentStep} dari 5
                </span>
              </div>

              <div className="space-y-4 pt-2 pl-1">
                {/* Step 1 */}
                <div className="flex items-start gap-3 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10 ${
                      currentStep >= 1 ? "bg-tertiary text-on-tertiary" : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    ✓
                  </div>
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                      currentStep >= 2 ? "bg-tertiary" : "bg-surface-container-high"
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs md:text-sm text-on-surface">
                        Pesanan Diterima &amp; Diverifikasi
                      </h4>
                      <span className="text-[10px] text-tertiary font-semibold">Terkonfirmasi</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Dispatcher menugaskan mekanik spesialis terdekat
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex items-start gap-3 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md z-10 ${
                      currentStep > 2
                        ? "bg-tertiary text-on-tertiary"
                        : currentStep === 2
                        ? "bg-primary text-on-primary animate-pulse"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 2 ? (
                      "✓"
                    ) : (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        near_me
                      </span>
                    )}
                  </div>
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                      currentStep >= 3 ? "bg-tertiary" : "bg-surface-container-high"
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-xs md:text-sm ${
                          currentStep === 2 ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        Montir Menuju Lokasi
                      </h4>
                      {currentStep === 2 && (
                        <span className="px-2 py-0.2 rounded-full bg-primary-fixed text-primary font-bold text-[10px]">
                          Sedang Berjalan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Pak Bambang bergerak di rute tercepat dengan GPS aktif
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex items-start gap-3 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10 ${
                      currentStep > 3
                        ? "bg-tertiary text-on-tertiary"
                        : currentStep === 3
                        ? "bg-emerald-600 text-white animate-bounce"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 3 ? (
                      "✓"
                    ) : currentStep === 3 ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        location_on
                      </span>
                    ) : (
                      "3"
                    )}
                  </div>
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                      currentStep >= 4 ? "bg-tertiary" : "bg-surface-container-high"
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-xs md:text-sm ${
                          currentStep === 3 ? "text-emerald-700" : "text-on-surface"
                        }`}
                      >
                        Tiba di Titik Garasi
                      </h4>
                      {currentStep === 3 && (
                        <span className="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          Sudah Sampai
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Pemeriksaan fisik unit kendaraan &amp; verifikasi data
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex items-start gap-3 relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10 ${
                      currentStep > 4
                        ? "bg-tertiary text-on-tertiary"
                        : currentStep === 4
                        ? "bg-primary text-on-primary animate-pulse"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 4 ? (
                      "✓"
                    ) : currentStep === 4 ? (
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        build
                      </span>
                    ) : (
                      "4"
                    )}
                  </div>
                  <div
                    className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-4 ${
                      currentStep >= 5 ? "bg-tertiary" : "bg-surface-container-high"
                    }`}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-xs md:text-sm ${
                          currentStep === 4 ? "text-primary" : "text-on-surface"
                        }`}
                      >
                        Pengerjaan Servis &amp; Tune Up
                      </h4>
                      {currentStep === 4 && (
                        <span className="px-2 py-0.2 rounded-full bg-primary-fixed text-primary font-bold text-[10px]">
                          Sedang Dikerjakan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Pemeriksaan 32 titik mesin, pembersihan komponen, &amp; suku cadang
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                      currentStep >= 5
                        ? "bg-tertiary text-on-tertiary"
                        : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {currentStep >= 5 ? "✓" : "5"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className={`font-bold text-xs md:text-sm ${
                          currentStep >= 5 ? "text-tertiary" : "text-on-surface"
                        }`}
                      >
                        QC Inspeksi &amp; Pembayaran
                      </h4>
                      {currentStep >= 5 && (
                        <span className="px-2 py-0.2 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px]">
                          Tuntas
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Garansi ServisIn 30 hari aktif otomatis setelah selesai
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Details & Emergency SOS */}
            <div className="bg-surface-container-low rounded-3xl p-5 border border-surface-container-high/60 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs md:text-sm text-on-surface">
                  Data Servis &amp; Kendaraan
                </span>
                <Link
                  href={`/payment?id=${orderId}`}
                  className="text-secondary font-bold text-xs hover:underline"
                >
                  Rincian Pembayaran →
                </Link>
              </div>

              <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/40 flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    construction
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs md:text-sm text-on-surface">
                      {order?.serviceType || "Servis Berkala & Tune Up"}
                    </span>
                    {order?.isVIP && (
                      <span className="px-2 py-0.2 rounded bg-secondary-fixed text-secondary font-bold text-[9px]">
                        VIP PRIORITAS
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Unit: {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Toyota Avanza Veloz (B 1234 ABC)"}
                  </p>
                  <p className="text-xs font-bold text-primary mt-1">
                    Total: Rp {(order?.totalCost || 299000).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-surface-container-high">
                <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                    shield
                  </span>
                  Terproteksi Garansi Resmi
                </span>

                <button
                  onClick={() => alert("Sinyal bantuan darurat dikirimkan ke Tim Siaga ServisIn 24 Jam.")}
                  className="px-3.5 py-1.5 rounded-xl bg-error-container text-error font-bold text-xs flex items-center gap-1.5 hover:bg-error-container/80 transition-colors"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    emergency
                  </span>
                  <span>Bantuan Darurat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
