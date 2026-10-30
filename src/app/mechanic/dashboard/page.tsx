"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";

export default function MechanicDashboardPage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);
  const [countdown, setCountdown] = useState(24);
  const [hasIncoming, setHasIncoming] = useState(true);

  useEffect(() => {
    if (!hasIncoming || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [hasIncoming, countdown]);

  const handleAcceptOrder = () => {
    router.push("/mechanic/navigation");
  };

  const handleDeclineOrder = () => {
    setHasIncoming(false);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col pb-20 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              car_repair
            </span>
          </div>
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
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px] flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              verified
            </span>
            BNSP
          </span>
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              light_mode
            </span>
          </button>
          <Link href="/mechanic/wallet" className="relative">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Mekanik"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-surface"></span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="px-4 pt-3 flex flex-col gap-4">
        {/* Availability Toggle Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              ></span>
              <h2 className="font-headline-sm text-label-lg font-bold text-on-surface">
                {isOnline ? "SIAP ORDER: ONLINE" : "STATUS: OFFLINE"}
              </h2>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
              {isOnline
                ? "Terhubung ke Sistem Dispatcher Pintar"
                : "Aktifkan untuk mulai menerima order masuk"}
            </p>
          </div>

          {/* Switch toggle */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`w-14 h-8 rounded-full p-1 transition-colors flex items-center ${
              isOnline ? "bg-emerald-500 justify-end" : "bg-surface-container-highest justify-start"
            }`}
          >
            <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-[10px] font-bold text-slate-800">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                power_settings_new
              </span>
            </div>
          </button>
        </div>

        {/* GPS & Radar Info */}
        {isOnline && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="flex items-center gap-1.5 text-primary-container font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                radar
              </span>
              Radar: Radius 7 km
            </span>
            <span className="flex items-center gap-1.5 text-tertiary font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                my_location
              </span>
              GPS Akurasi 3m (Aman)
            </span>
          </div>
        )}

        {/* Incoming Emergency Dispatch Card */}
        {isOnline && hasIncoming && (
          <div className="bg-surface-container-lowest rounded-2xl border-2 border-primary-container shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95">
            {/* Top countdown bar */}
            <div className="bg-primary-container text-on-primary px-4 py-2 flex items-center justify-between font-bold text-xs">
              <span className="flex items-center gap-1.5 uppercase tracking-wider">
                <span className="material-symbols-outlined animate-pulse" style={{ fontSize: 18 }}>
                  emergency
                </span>
                PANGGILAN DARURAT MASUK!
              </span>
              <span className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md">
                ⏱ {countdown}s
              </span>
            </div>

            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center gap-1 w-fit">
                    <span className="material-symbols-outlined" style={{ fontSize: 12 }}>
                      bolt
                    </span>
                    AKI SOAK / MOGOK TOTAL
                  </span>
                  <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                    Toyota Innova Reborn
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-on-surface-variant block font-medium">
                    Penghasilan Bersih
                  </span>
                  <span className="font-headline-sm text-headline-sm font-bold text-tertiary">
                    Rp 165.000
                  </span>
                  <span className="text-[10px] text-primary-container font-bold block">
                    + Tip Darurat Rp 25k
                  </span>
                </div>
              </div>

              {/* Customer info */}
              <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      person
                    </span>
                  </div>
                  <div>
                    <span className="font-label-md text-label-md font-bold text-on-surface block">
                      Ibu Farida Ananda
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-mono">
                      B 2045 SKL • Silver Metallic
                    </span>
                  </div>
                </div>

                <a
                  href="tel:081298453210"
                  className="w-9 h-9 rounded-xl bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    call
                  </span>
                </a>
              </div>

              {/* Location */}
              <div className="bg-surface-container-low rounded-xl p-3 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-primary-container flex-shrink-0" style={{ fontSize: 20 }}>
                  near_me
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Jl. Gatot Subroto No. 88
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary-fixed text-secondary font-bold">
                      1.4 km • 5 mnt
                    </span>
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    Bahu jalan tol sebelum flyover Semanggi arah Kuningan.
                  </p>
                </div>
              </div>

              {/* Keluhan */}
              <div className="bg-surface-container-low rounded-xl p-3 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 20 }}>
                  warning
                </span>
                <p className="text-[11px] text-on-surface-variant leading-snug">
                  <strong className="text-on-surface">Keluhan:</strong> &ldquo;Mesin mogok tidak mau distarter di bahu jalan, indikator aki merah menyala. Perlu jumper aki darurat atau siap aki baru 55Ah.&rdquo;
                </p>
              </div>

              {/* 2 Decision Buttons */}
              <div className="grid grid-cols-5 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDeclineOrder}
                  className="col-span-2 h-12 rounded-xl bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-bold hover:bg-surface-container transition-colors"
                >
                  ✕ Lewatkan
                </button>
                <button
                  type="button"
                  onClick={handleAcceptOrder}
                  className="col-span-3 h-12 rounded-xl bg-primary-container text-on-primary font-headline-sm text-label-lg font-bold flex items-center justify-center gap-1.5 shadow-lg hover:brightness-105 active:scale-[0.99] transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    check_circle
                  </span>
                  <span>TERIMA ORDER ({countdown}s)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Kinerja Hari Ini Bento Grid */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Kinerja Hari Ini
            </h3>
            <span className="text-xs text-on-surface-variant">Update: 14.32 WIB</span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-on-surface-variant block font-medium">
                  Pendapatan Bersih
                </span>
                <span className="font-headline-lg text-headline-lg font-bold text-on-surface">
                  Rp 485.000
                </span>
                <span className="text-xs text-tertiary font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check_circle
                  </span>
                  3 pesanan selesai tuntas
                </span>
              </div>

              <Link
                href="/mechanic/wallet"
                className="w-12 h-12 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center shadow-sm hover:scale-105 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  account_balance_wallet
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-surface-container-high/60 text-center">
              <div className="bg-surface-container-low p-2 rounded-xl">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                  schedule
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface block mt-0.5">
                  5j 20m
                </span>
                <span className="text-[10px] text-on-surface-variant">Jam Online</span>
              </div>

              <div className="bg-surface-container-low p-2 rounded-xl">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                  verified
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface block mt-0.5">
                  98%
                </span>
                <span className="text-[10px] text-on-surface-variant">Rasio Terima</span>
              </div>

              <div className="bg-surface-container-low p-2 rounded-xl">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 18 }}>
                  star
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface block mt-0.5">
                  4.9<span className="text-xs font-normal text-on-surface-variant">/5.0</span>
                </span>
                <span className="text-[10px] text-on-surface-variant">142 Ulasan</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Potensial Sekitar */}
        <div className="flex flex-col gap-2.5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                explore
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Order Potensial Sekitar
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
              2 Tersedia
            </span>
          </div>

          {/* Item 1 */}
          <div
            onClick={() => router.push("/mechanic/navigation")}
            className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  tune
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">
                    Tune Up &amp; Ganti Oli
                  </h4>
                  <span className="text-xs font-bold text-primary">Rp 120.000</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block">
                  Honda CR-V Turbo • Garasi Rumah
                </span>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5">
                  <span className="text-secondary font-semibold">📍 2.8 km (Kuningan Barat)</span>
                  <span>•</span>
                  <span>Fleksibel (1 Jam lagi)</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
              chevron_right
            </span>
          </div>

          {/* Item 2 */}
          <div
            onClick={() => router.push("/mechanic/navigation")}
            className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  tire_repair
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">
                    Tambal Ban Tubeless Darurat
                  </h4>
                  <span className="text-xs font-bold text-primary">Rp 85.000</span>
                </div>
                <span className="text-[11px] text-on-surface-variant block">
                  Mitsubishi Pajero Dakar • Parkir Ruko
                </span>
                <div className="flex items-center gap-2 text-[10px] text-on-surface-variant mt-0.5">
                  <span className="text-secondary font-semibold">📍 3.5 km (Mampang)</span>
                  <span>•</span>
                  <span>Ban Kanan Belakang Bocor</span>
                </div>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
              chevron_right
            </span>
          </div>
        </div>
      </div>

      <MechanicBottomNav />
    </div>
  );
}
