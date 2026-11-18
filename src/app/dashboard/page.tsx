"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";
import { User } from "@/models/User";
import { Vehicle } from "@/models/Vehicle";
import { ServiceOrder } from "@/models/ServiceOrder";
import { SupabaseService } from "@/lib/supabase";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User>(dbStore.users[0]);
  const [activeOrder, setActiveOrder] = useState<ServiceOrder | undefined>(dbStore.orders[0]);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | undefined>(dbStore.vehicles[0]);

  // ServisIn Wallet state
  const [walletBalance, setWalletBalance] = useState<number>(650000);
  const [showBalance, setShowBalance] = useState<boolean>(true);
  const [userTier, setUserTier] = useState<"Regular" | "VIP">("Regular");
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [topUpAmount, setTopUpAmount] = useState<number>(100000);
  const [topUpMethod, setTopUpMethod] = useState<"qris" | "va">("qris");
  const [topUpStep, setTopUpStep] = useState<"nominal" | "payment">("nominal");
  const [topUpSuccess, setTopUpSuccess] = useState<boolean>(false);
  const [generatedTopUpVa, setGeneratedTopUpVa] = useState<string>("8277 0892 4118 7632");
  const [copiedTopUpVa, setCopiedTopUpVa] = useState<boolean>(false);

  useEffect(() => {
    const user = dbStore.getCurrentUser();
    setCurrentUser(user);
    setWalletBalance(dbStore.getCustomerBalance());
    setUserTier(dbStore.getUserTier(user.id));

    // Load active vehicle locally
    const veh = dbStore.getActiveVehicle(user.id);
    if (veh) setActiveVehicle(veh);

    // Sync vehicle from Supabase
    SupabaseService.getVehicles(user.id)
      .then((sbVehs) => {
        if (Array.isArray(sbVehs) && sbVehs.length > 0) {
          const mapped = sbVehs.map(
            (v) =>
              new Vehicle({
                id: v.id,
                userId: v.userId,
                brand: v.brand,
                model: v.model,
                year: v.year,
                licensePlate: v.licensePlate,
                isActive: Boolean(v.isActive),
                odometerKm: v.odometerKm,
                healthPercent: v.healthPercent,
                color: v.color,
                imageUrl: v.imageUrl,
                lastServiceDate: v.lastServiceDate,
              })
          );
          dbStore.setVehicles(mapped);
          const act = dbStore.getActiveVehicle(user.id) || mapped.find((v) => v.isActive) || mapped[0];
          if (act) setActiveVehicle(act);
        }
      })
      .catch(() => {});

    // Load orders
    const orders = dbStore.getOrders();
    if (orders.length > 0) {
      setActiveOrder(orders[0]);
    }
  }, []);

  const handleOpenTopUp = () => {
    setTopUpStep("nominal");
    setTopUpSuccess(false);
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    setGeneratedTopUpVa(`8277 ${randomSuffix.slice(0, 4)} ${randomSuffix.slice(4, 8)}`);
    setShowTopUpModal(true);
  };

  const handleConfirmTopUpPayment = () => {
    const newBal = dbStore.topUpCustomerWallet(
      topUpAmount,
      topUpMethod === "qris" ? "QRIS Instan" : "BCA Virtual Account"
    );
    setWalletBalance(newBal);
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUpModal(false);
      setTopUpStep("nominal");
    }, 1800);
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-24 md:pb-12 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Universal Responsive Navbar */}
      <AppNavbar />

      {/* Main Responsive Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 pt-4 md:pt-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT / PRIMARY COLUMN (Span 8 on Desktop)                                  */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-8 flex flex-col gap-5">
            {/* User Greeting & Location */}
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold">
                    Halo, {currentUser.name || "Rizky Pratama"}
                  </h1>
                  <span className="text-2xl">👋</span>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-xs md:text-sm mt-0.5">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>
                    location_on
                  </span>
                  <span className="truncate max-w-[280px] sm:max-w-md">
                    Jl. Sudirman No. 42, Menteng, Jakarta Pusat
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                    expand_more
                  </span>
                </div>
              </div>

              {/* Mobile Notification bell */}
              <Link
                href="/notifications"
                className="md:hidden w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface relative"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  notifications
                </span>
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container"></span>
              </Link>
            </div>

            {/* Mobile-Only Active Vehicle Pill (On desktop it is featured in right sidebar) */}
            <div className="lg:hidden bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between border border-surface-container-high/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    directions_car
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {activeVehicle?.model || "Toyota Avanza Veloz 1.5"}
                    </span>
                    <span className="px-1.5 py-0.2 bg-surface-container-highest text-on-surface font-mono text-[10px] rounded font-bold">
                      {activeVehicle?.licensePlate || "B 1234 ABC"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1 text-tertiary font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Sehat
                    </span>
                    <span>•</span>
                    <span>Odo 34.200 km</span>
                  </div>
                </div>
              </div>
              <Link
                href="/vehicles"
                className="font-label-md text-label-md text-secondary font-bold hover:underline px-2 py-1"
              >
                Ganti
              </Link>
            </div>

            {/* Mobile-Only ServisIn Wallet Card */}
            <div className="lg:hidden bg-gradient-to-r from-surface-container-lowest via-surface-container-low to-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/70 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant">
                      DOMPET DIGITAL RESMI
                    </span>
                    <span className="font-label-md text-xs font-bold text-on-surface">
                      ServisIn Wallet
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href="/premium"
                    className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold transition-all ${
                      userTier === "VIP"
                        ? "bg-amber-400 text-amber-950 shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary"
                    }`}
                  >
                    {userTier === "VIP" ? "★ VIP MEMBER" : "REGULER • UPGRADE"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      {showBalance ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-end justify-between pt-1">
                <div>
                  <span className="text-[10px] text-on-surface-variant font-medium block">
                    Saldo Aktif Anda
                  </span>
                  <span className="font-headline-lg text-2xl font-black text-on-surface">
                    {showBalance ? `Rp ${walletBalance.toLocaleString("id-ID")}` : "Rp ••••••••"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenTopUp}
                    className="h-9 px-3.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      add_circle
                    </span>
                    <span>Top Up</span>
                  </button>
                  <Link
                    href="/payment?id=SRV-8942"
                    className="h-9 px-3 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-bold flex items-center gap-1 hover:bg-surface-container-high"
                  >
                    <span>Bayar</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* SOS Emergency Banner (Responsive Desktop Wide) */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-container via-primary-container to-primary p-5 md:p-6 text-on-primary shadow-[0_12px_28px_rgba(255,107,0,0.28)]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                      emergency
                    </span>
                  </div>
                  <div>
                    <h2 className="font-headline-sm text-lg md:text-xl font-black text-on-primary">
                      Butuh Bantuan Darurat di Jalan?
                    </h2>
                    <span className="text-xs text-on-primary/80 hidden sm:inline-block">
                      Layanan derek &amp; montir darurat bergaransi resmi
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-black/25 backdrop-blur-md text-white font-label-sm text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>SIAGA 24/7</span>
                </span>
              </div>

              <p className="font-body-sm text-xs md:text-sm text-on-primary/95 mb-4 leading-relaxed max-w-2xl">
                Mobil mogok di tol, aki mati tiba-tiba, atau ban kempes? Teknisi darurat tersertifikasi siap meluncur ke lokasimu dalam waktu singkat &lt;15 menit.
              </p>

              {/* Quick SOS category pills */}
              <div className="grid grid-cols-3 gap-2.5 md:gap-3.5 mb-4">
                <button
                  onClick={() => router.push("/booking?type=jumper&emergency=true")}
                  className="py-2.5 px-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all group"
                >
                  <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform" style={{ fontSize: 24 }}>
                    bolt
                  </span>
                  <span className="font-label-sm text-xs text-white font-bold mt-1">
                    Jumper Aki
                  </span>
                  <span className="text-[10px] text-white/75 hidden md:block">Siaga Cepat</span>
                </button>

                <button
                  onClick={() => router.push("/booking?type=towing&emergency=true")}
                  className="py-2.5 px-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all group"
                >
                  <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform" style={{ fontSize: 24 }}>
                    local_shipping
                  </span>
                  <span className="font-label-sm text-xs text-white font-bold mt-1">
                    Derek / Towing
                  </span>
                  <span className="text-[10px] text-white/75 hidden md:block">Flatbed Hidrolik</span>
                </button>

                <button
                  onClick={() => router.push("/booking?type=tire&emergency=true")}
                  className="py-2.5 px-2 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all group"
                >
                  <span className="material-symbols-outlined text-white group-hover:scale-110 transition-transform" style={{ fontSize: 24 }}>
                    tire_repair
                  </span>
                  <span className="font-label-sm text-xs text-white font-bold mt-1">
                    Ganti Ban
                  </span>
                  <span className="text-[10px] text-white/75 hidden md:block">Tambal Tubeless</span>
                </button>
              </div>

              {/* Big CTA */}
              <button
                onClick={() => router.push("/booking?emergency=true")}
                className="w-full h-12 md:h-13 rounded-2xl bg-surface-container-lowest text-primary-container font-label-lg text-sm md:text-base font-black flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.99] transition-all hover:bg-surface-container-low"
              >
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
                  phone_in_talk
                </span>
                <span>Panggil Montir Darurat Sekarang</span>
              </button>
            </div>

            {/* Live Tracking Card (Active Order) */}
            {activeOrder && (
              <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                    <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                      PESANAN SEDANG BERLANGSUNG
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 bg-surface-container-low text-on-surface-variant font-mono font-bold text-xs rounded-full">
                    #{activeOrder.id}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                      {activeOrder.serviceType}
                    </h3>
                    <span className="font-body-sm text-xs text-on-surface-variant">
                      Toyota Avanza Veloz (B 1234 ABC) • Jl. Sudirman No. 42
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-on-surface-variant block">Estimasi Kedatangan</span>
                    <span className="font-headline-sm text-base md:text-lg text-primary-container font-black">
                      ~ 8 Menit (1.4 km)
                    </span>
                  </div>
                </div>

                {/* Mechanic strip */}
                <div className="bg-surface-container-low rounded-2xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                        alt="Mekanik"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-[10px]">
                        ✓
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-sm font-bold text-on-surface">
                          Bambang Sudiro
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-tertiary-container/20 text-tertiary font-bold text-[10px] flex items-center gap-0.5">
                          4.9 ★ BNSP
                        </span>
                      </div>
                      <span className="font-body-sm text-xs text-on-surface-variant">
                        Honda Vario 160 (B 4521 SKL)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href="tel:081377889900"
                      className="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary hover:bg-secondary-fixed shadow-sm transition-colors"
                      title="Telepon Montir"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        call
                      </span>
                    </a>
                    <a
                      href="https://wa.me/6281377889900"
                      target="_blank"
                      rel="noreferrer"
                      className="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-tertiary hover:bg-tertiary-fixed shadow-sm transition-colors"
                      title="Chat WhatsApp"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        chat
                      </span>
                    </a>
                  </div>
                </div>

                {/* Progress Bar & Peta Live Button */}
                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-on-surface-variant mb-1">
                      <span>Montir Menuju Lokasi</span>
                      <span>75% perjalanan</span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                    </div>
                  </div>

                  <Link
                    href="/tracking"
                    className="px-4 py-2.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 flex-shrink-0"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      near_me
                    </span>
                    <span>Buka Peta Live</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Kategori Layanan Populer (Desktop: 4 columns, Mobile: 2 columns) */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
                    Kategori Layanan Populer
                  </h2>
                  <span className="text-xs text-on-surface-variant">
                    Teknisi tersertifikasi datang langsung ke garasi atau lokasi Anda
                  </span>
                </div>
                <Link
                  href="/booking"
                  className="font-label-md text-xs font-bold text-secondary hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    arrow_forward
                  </span>
                </Link>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-3.5">
                {/* 1. Ganti Oli */}
                <div
                  onClick={() => router.push("/booking?category=oli")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md hover:border-primary-container cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary-container group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        oil_barrel
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
                      Hemat 20%
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Ganti Oli Mesin
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Shell, Castrol, Mobil1
                    </p>
                  </div>
                </div>

                {/* 2. Ban & Tubeless */}
                <div
                  onClick={() => router.push("/booking?category=ban")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md hover:border-secondary cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        tire_repair
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold">
                      Cepat 20m
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Ban &amp; Tubeless
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Tambal, isi nitrogen
                    </p>
                  </div>
                </div>

                {/* 3. Servis & Jumper Aki */}
                <div
                  onClick={() => router.push("/booking?category=aki")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md hover:border-primary cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/40 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        bolt
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-bold">
                      Siaga
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Servis &amp; Aki
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Tes voltase &amp; jumper
                    </p>
                  </div>
                </div>

                {/* 4. Derek & Towing */}
                <div
                  onClick={() => router.push("/booking?category=derek")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md hover:border-error cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        local_shipping
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-error-container text-error font-bold">
                      24 Jam
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Derek &amp; Towing
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Flatbed tol &amp; kota
                    </p>
                  </div>
                </div>

                {/* 5. Tune-Up Mesin */}
                <div
                  onClick={() => router.push("/booking?category=tuneup")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md hover:border-tertiary cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        tune
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold">
                      Komplit
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Tune-Up Mesin
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      32 titik cek &amp; busi
                    </p>
                  </div>
                </div>

                {/* 6. AI Diagnostik */}
                <div
                  onClick={() => router.push("/ai-diagnostic")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-secondary/40 shadow-sm hover:shadow-md hover:border-secondary cursor-pointer transition-all flex flex-col justify-between h-36 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        auto_fix_high
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold">
                      AI Pintar
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      AI Diagnostik
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Analisis suara &amp; sensor
                    </p>
                  </div>
                </div>

                {/* 7. AC Mobil */}
                <div
                  onClick={() => router.push("/booking?category=ac")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        ac_unit
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                      Dingin
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Servis AC Mobil
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Freon, filter kabin
                    </p>
                  </div>
                </div>

                {/* 8. Inspeksi Pra-Beli */}
                <div
                  onClick={() => router.push("/booking?category=inspeksi")}
                  className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        verified_user
                      </span>
                    </div>
                    <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-bold">
                      150 Titik
                    </span>
                  </div>
                  <div>
                    <h3 className="font-label-lg text-xs md:text-sm font-bold text-on-surface">
                      Inspeksi Pra-Beli
                    </h3>
                    <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                      Cek bekas tabrak/banjir
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo & Paket Spesial (Desktop: 2 columns grid, Mobile: horizontal scroll) */}
            <div className="flex flex-col gap-3 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
                    Promo &amp; Paket Spesial
                  </h3>
                  <span className="text-xs text-on-surface-variant">
                    Penawaran hemat servis berkala resmi
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Card 1 */}
                <div className="rounded-3xl bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-all">
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"
                      alt="Paket Mudik"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[10px]">
                      DISKON 35%
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-label-lg text-sm font-bold text-on-surface">
                        Paket Servis Mudik Nyaman
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                        Cek 32 titik mesin, tune up komplit, gratis cuci busi &amp; cuci ruang mesin.
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container-high/50">
                      <span className="font-headline-sm text-base font-bold text-primary-container">
                        Rp 349.000
                      </span>
                      <button
                        onClick={() => router.push("/booking?promo=mudik")}
                        className="px-3.5 py-1.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold hover:brightness-105 active:scale-95 transition-all"
                      >
                        Klaim Promo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="rounded-3xl bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 shadow-sm flex flex-col sm:flex-row hover:shadow-md transition-all">
                  <div className="relative w-full sm:w-48 h-40 sm:h-auto flex-shrink-0">
                    <img
                      src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80"
                      alt="Tune Up Komplit"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[10px]">
                      GRATIS VOUCHER
                    </span>
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <h4 className="font-label-lg text-sm font-bold text-on-surface">
                        Tune Up + Carbon Cleaner
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 line-clamp-2">
                        Performa responsif seketika, pembersihan ruang bakar mesin kerak karbon.
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-container-high/50">
                      <span className="font-headline-sm text-base font-bold text-primary-container">
                        Rp 480.000
                      </span>
                      <button
                        onClick={() => router.push("/booking?promo=tuneup")}
                        className="px-3.5 py-1.5 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold hover:brightness-105 active:scale-95 transition-all"
                      >
                        Klaim Promo
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT / SIDEBAR COLUMN (Span 4 on Desktop, Sticky)                        */}
          {/* ========================================================================= */}
          <div className="hidden lg:flex lg:col-span-4 flex-col gap-5 sticky top-20">
            {/* Desktop ServisIn Wallet Card */}
            <div className="bg-gradient-to-br from-surface-container-lowest via-surface-container-low to-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/70 flex flex-col gap-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant">
                      DOMPET DIGITAL RESMI
                    </span>
                    <span className="font-headline-sm text-sm font-bold text-on-surface">
                      ServisIn Wallet
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href="/premium"
                    className={`px-2.5 py-1 rounded-full font-label-sm text-[10px] font-bold transition-all ${
                      userTier === "VIP"
                        ? "bg-amber-400 text-amber-950 shadow-sm"
                        : "bg-surface-container-high text-on-surface-variant hover:bg-primary-container hover:text-on-primary"
                    }`}
                  >
                    {userTier === "VIP" ? "★ VIP MEMBER" : "REGULER"}
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowBalance(!showBalance)}
                    className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {showBalance ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[11px] text-on-surface-variant font-medium block">
                  Saldo Aktif Anda
                </span>
                <span className="font-headline-lg text-3xl font-black text-on-surface tracking-tight">
                  {showBalance ? `Rp ${walletBalance.toLocaleString("id-ID")}` : "Rp ••••••••"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleOpenTopUp}
                  className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    add_circle
                  </span>
                  <span>Top Up Saldo</span>
                </button>
                <Link
                  href="/payment?id=SRV-8942"
                  className="h-11 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1 hover:bg-surface-container-high transition-all"
                >
                  <span>Bayar Tagihan</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            {/* Desktop Active Vehicle Garasi Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    directions_car
                  </span>
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    Kendaraan Aktif
                  </span>
                </div>
                <Link
                  href="/vehicles"
                  className="text-xs font-bold text-secondary hover:underline"
                >
                  Kelola Garasi →
                </Link>
              </div>

              <div className="relative rounded-2xl overflow-hidden h-32 bg-slate-900 shadow-inner">
                <img
                  src={activeVehicle?.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80"}
                  alt="Mobil"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
                  <div>
                    <span className="font-bold text-sm block">
                      {activeVehicle?.model || "Toyota Avanza Veloz 1.5"}
                    </span>
                    <span className="text-[11px] text-white/80 font-mono">
                      {activeVehicle?.licensePlate || "B 1234 ABC"} • {activeVehicle?.year || 2021}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px]">
                    {activeVehicle?.healthPercent || 94}% SEHAT
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-surface-container-low p-3 rounded-2xl text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Odometer:</span>
                  <span className="font-bold text-on-surface font-mono">
                    {activeVehicle?.odometerKm?.toLocaleString() || "34.200"} km
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block">Servis Terakhir:</span>
                  <span className="font-bold text-on-surface">
                    {activeVehicle?.lastServiceDate || "12 Mei 2024"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop AI Diagnostic Quick Access */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-3xl p-5 border border-secondary/30 shadow-sm flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    psychology
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-sm text-sm font-bold text-on-surface">
                      AI Mechanic Virtual
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-secondary text-on-secondary text-[8px] font-bold">
                      v4.8
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    Deteksi suara &amp; keluhan mesin otomatis
                  </span>
                </div>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Kendaraan ada bunyi decit atau getaran aneh? Tanyakan langsung ke AI untuk diagnosa awal &amp; estimasi biaya.
              </p>

              <button
                onClick={() => router.push("/ai-diagnostic")}
                className="w-full h-10 rounded-xl bg-surface-container-lowest border border-secondary text-secondary font-label-md text-xs font-bold hover:bg-secondary hover:text-on-secondary active:scale-95 transition-all flex items-center justify-center gap-1.5 mt-1"
              >
                <span>Mulai Konsultasi AI</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  arrow_forward
                </span>
              </button>
            </div>

            {/* 24/7 Hotline Strip */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
                  headset_mic
                </span>
                <div>
                  <span className="font-bold text-on-surface block">Customer Care 24/7</span>
                  <span className="text-[11px] text-on-surface-variant">Bantuan &amp; Pengaduan Layanan</span>
                </div>
              </div>
              <a
                href="https://wa.me/6281298453210"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-tertiary text-on-tertiary font-bold text-xs hover:brightness-105"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* DASHBOARD TOP UP MODAL (WITH QRIS & VIRTUAL ACCOUNT)                     */}
      {/* ========================================================================= */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    add_card
                  </span>
                </div>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {topUpStep === "nominal" ? "Top Up ServisIn Wallet" : "Konfirmasi Pembayaran Top Up"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            {/* Current Balance Bar */}
            <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Saldo saat ini:</span>
              <span className="font-headline-sm font-bold text-on-surface">
                Rp {walletBalance.toLocaleString("id-ID")}
              </span>
            </div>

            {topUpStep === "nominal" ? (
              <>
                {/* Nominal Chips */}
                <div>
                  <span className="text-xs font-bold text-on-surface block mb-2">
                    Pilih Nominal Top Up:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[50000, 100000, 250000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 px-1 rounded-xl font-bold text-xs transition-all border ${
                          topUpAmount === amt
                            ? "bg-secondary text-on-secondary border-secondary shadow-sm"
                            : "bg-surface-container-lowest border-surface-container-high text-on-surface hover:bg-surface-container-low"
                        }`}
                      >
                        Rp {(amt / 1000).toLocaleString("id-ID")}rb
                      </button>
                    ))}
                  </div>

                  {/* Custom Nominal */}
                  <div className="mt-2.5">
                    <span className="text-[11px] text-on-surface-variant font-medium block mb-1">
                      Atau ketik nominal sendiri:
                    </span>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 font-bold text-xs text-on-surface-variant">
                        Rp
                      </span>
                      <input
                        type="number"
                        value={topUpAmount || ""}
                        onChange={(e) => setTopUpAmount(Number(e.target.value))}
                        className="w-full h-10 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface font-bold text-xs focus:outline-none focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Top Up Method Selection */}
                <div>
                  <span className="text-xs font-bold text-on-surface block mb-2">
                    Pilih Metode Top Up:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setTopUpMethod("qris")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        topUpMethod === "qris"
                          ? "bg-secondary-fixed/50 border-secondary text-secondary ring-2 ring-secondary/20"
                          : "bg-surface-container-lowest border-surface-container-high text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                        qr_code_2
                      </span>
                      <span className="font-bold text-xs">QRIS Instan</span>
                      <span className="text-[10px] text-on-surface-variant">GoPay/OVO/BCA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTopUpMethod("va")}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                        topUpMethod === "va"
                          ? "bg-secondary-fixed/50 border-secondary text-secondary ring-2 ring-secondary/20"
                          : "bg-surface-container-lowest border-surface-container-high text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                        account_balance
                      </span>
                      <span className="font-bold text-xs">Virtual Account</span>
                      <span className="text-[10px] text-on-surface-variant">BCA / Mandiri / BRI</span>
                    </button>
                  </div>
                </div>

                {/* Continue button */}
                <button
                  type="button"
                  onClick={() => setTopUpStep("payment")}
                  disabled={topUpAmount < 10000}
                  className="w-full mt-2 h-11 rounded-xl bg-secondary text-on-secondary font-label-md font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <span>Lanjutkan Top Up Rp {topUpAmount.toLocaleString("id-ID")}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                </button>
              </>
            ) : (
              <>
                {/* Step 2: Payment Display */}
                {topUpMethod === "qris" ? (
                  <div className="flex flex-col items-center gap-2.5">
                    <span className="text-xs font-bold text-on-surface">
                      Scan QRIS ServisIn di Bawah:
                    </span>
                    <div className="bg-white rounded-2xl p-2 border-2 border-secondary/30 shadow-inner flex flex-col items-center">
                      <div className="w-[200px] aspect-[3/4.2] rounded-xl overflow-hidden">
                        <img
                          src="/images/qris-servisin.jpg"
                          alt="QRIS ServisIn"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono mt-1">
                        SERVISIN INDONESIA • NMID: ID1020038472910
                      </span>
                    </div>

                    <div className="w-full bg-surface-container-low rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                        TOTAL PEMBAYARAN
                      </span>
                      <span className="font-headline-md text-base font-black text-primary">
                        Rp {topUpAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <span className="text-xs font-bold text-on-surface">
                      Nomor Virtual Account Top Up:
                    </span>
                    <div className="bg-surface-container-low rounded-2xl p-3 border border-surface-container-high flex flex-col gap-2">
                      <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high">
                        <span className="font-mono text-base font-bold text-on-surface tracking-wider">
                          {generatedTopUpVa}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(generatedTopUpVa.replace(/\s/g, ""));
                            setCopiedTopUpVa(true);
                            setTimeout(() => setCopiedTopUpVa(false), 2000);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-bold flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                            content_copy
                          </span>
                          {copiedTopUpVa ? "Tersalin!" : "Salin"}
                        </button>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">
                        Bank: <strong>BCA / Prima Network</strong> (Verifikasi Otomatis)
                      </span>
                    </div>

                    <div className="w-full bg-surface-container-low rounded-xl p-2.5 text-center">
                      <span className="text-[10px] text-on-surface-variant block uppercase font-bold">
                        NOMINAL TRANSFER TEPAT
                      </span>
                      <span className="font-headline-md text-base font-black text-primary">
                        Rp {topUpAmount.toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                )}

                {/* Success feedback */}
                {topUpSuccess && (
                  <div className="p-2.5 rounded-xl bg-tertiary-fixed text-tertiary text-xs font-bold flex items-center gap-2 justify-center animate-in zoom-in-95">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      verified
                    </span>
                    <span>Top Up Berhasil! Saldo Bertambah.</span>
                  </div>
                )}

                {/* Confirmation Action */}
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirmTopUpPayment}
                    className="w-full h-11 rounded-xl bg-tertiary text-on-tertiary font-label-md font-bold hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      check_circle
                    </span>
                    <span>Saya Sudah Bayar (Konfirmasi Saldo)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTopUpStep("nominal")}
                    className="w-full h-9 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-xs font-semibold hover:bg-surface-container-high"
                  >
                    Kembali Ganti Nominal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Customer Bottom Navigation (Visible on Mobile only) */}
      <CustomerBottomNav />
    </div>
  );
}
