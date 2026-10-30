"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function TrackingContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SRV-8942";

  const [currentStep, setCurrentStep] = useState(2); // 1: Diterima, 2: Menuju Lokasi, 3: Tiba, 4: Pengerjaan, 5: Selesai
  const [etaMinutes, setEtaMinutes] = useState(7);
  const [distanceKm, setDistanceKm] = useState(1.8);
  const [showToast, setShowToast] = useState(true);

  // Live simulation of mechanic moving closer
  useEffect(() => {
    const timer = setInterval(() => {
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
      setDistanceKm((prev) => (prev > 0.3 ? Number((prev - 0.2).toFixed(1)) : 0.2));
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateArrived = () => {
    setCurrentStep(3);
    setEtaMinutes(0);
    setDistanceKm(0);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline-sm text-label-lg font-bold text-on-surface">
            Live Mechanic Tracking
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              dark_mode
            </span>
          </button>
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/30"
          />
        </div>
      </header>

      {/* Map View Area */}
      <div className="relative h-80 w-full bg-slate-200 overflow-hidden">
        {/* Map stylized background */}
        <div
          className="absolute inset-0 bg-cover bg-center filter contrast-125 brightness-95"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-surface"></div>

        {/* Floating Pills on Map */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <div className="px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md shadow-md flex items-center gap-1.5 text-xs font-bold text-on-surface border border-surface-container-high/40">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span>Order #{orderId}</span>
          </div>
          <div className="px-3 py-1 rounded-full bg-tertiary text-on-tertiary shadow-md flex items-center gap-1.5 text-xs font-bold">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              my_location
            </span>
            <span>GPS AKTIF</span>
          </div>
        </div>

        {/* SVG Route Visualization */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 320">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3755c3" />
              <stop offset="100%" stopColor="#ff6b00" />
            </linearGradient>
          </defs>
          <path
            d="M 120 230 Q 180 200 220 150 T 280 90"
            fill="none"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            strokeDasharray="6 4"
            className="animate-pulse"
          />
        </svg>

        {/* Customer Location Pin */}
        <div className="absolute top-20 right-24 flex flex-col items-center">
          <div className="px-2 py-0.5 rounded-md bg-primary-container text-on-primary text-[10px] font-bold shadow-md mb-1 whitespace-nowrap">
            Lokasi Anda
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-lg ring-4 ring-white/80">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              directions_car
            </span>
          </div>
        </div>

        {/* Mechanic Live Pin */}
        <div className="absolute bottom-20 left-24 flex flex-col items-center">
          <div className="relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-xl ring-4 ring-white">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                two_wheeler
              </span>
            </div>
          </div>
        </div>

        {/* Floating ETA Card on bottom of map */}
        <div className="absolute bottom-3 left-4 right-4 z-10 flex items-center justify-between p-3 rounded-2xl bg-surface-container-lowest/95 backdrop-blur-xl shadow-xl border border-surface-container-high/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                timer
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-bold text-on-surface">
                <span>{etaMinutes} Menit</span>
                <span className="text-on-surface-variant font-normal text-sm">• {distanceKm} km lagi</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Montir sedang membelah jalanan menuju Anda
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulateArrived}
            title="Simulasikan montir tiba"
            className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface shadow-sm"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              my_location
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Sheet Details */}
      <div className="-mt-3 bg-surface-container-lowest rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.06)] p-4 flex flex-col gap-4 border-t border-surface-container-high/60 relative z-20">
        {/* Drag handlebar */}
        <div className="w-12 h-1 bg-surface-container-highest rounded-full mx-auto"></div>

        {/* Mechanic Profile Card */}
        <div className="bg-surface-container-low rounded-2xl p-3.5 border border-surface-container-high/60 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&h=150&q=80"
                  alt="Bambang Sudiro"
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-container/40"
                />
                <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-[10px] ring-1 ring-white">
                  ✓
                </span>
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Bambang Sudiro
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
                    BNSP Aktif
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface flex items-center gap-0.5">
                    ★ 4.9 <span className="text-on-surface-variant font-normal">(420+ Servis)</span>
                  </span>
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-[10px] font-bold uppercase tracking-wider">
              EN-ROUTE
            </span>
          </div>

          <div className="bg-surface-container rounded-xl p-2.5 flex items-center justify-between text-xs text-on-surface-variant">
            <span className="flex items-center gap-1.5 font-semibold text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                two_wheeler
              </span>
              Honda Vario 160 (B 4521 SKL)
            </span>
            <span className="flex items-center gap-1 text-tertiary font-bold text-[11px]">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                handyman
              </span>
              Toolbox Lengkap
            </span>
          </div>

          {/* 2 Contact Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:081377889900"
              className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-sm hover:brightness-105"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                call
              </span>
              <span>Telepon Montir</span>
            </a>
            <a
              href="https://wa.me/6281377889900"
              target="_blank"
              rel="noreferrer"
              className="h-11 rounded-xl bg-surface-container-high text-on-surface font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors"
            >
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                chat
              </span>
              <span>Kirim Pesan</span>
            </a>
          </div>
        </div>

        {/* 5-Tahap Status Penanganan Timeline */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Status Penanganan
            </h3>
            <span className="text-xs font-semibold text-primary">
              Langkah {currentStep} dari 5
            </span>
          </div>

          <div className="space-y-4 pt-1 pl-1">
            {/* Step 1 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10">
                ✓
              </div>
              <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-tertiary -mb-4"></div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-label-md text-label-md font-bold text-on-surface">
                    Pesanan Diterima &amp; Diverifikasi
                  </h4>
                  <span className="text-[10px] text-tertiary font-semibold">14:18 WIB</span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Dispatcher ServisIn menugaskan mekanik terdekat
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md z-10">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  near_me
                </span>
              </div>
              <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-surface-container-high -mb-4"></div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-label-md text-label-md font-bold text-primary-container">
                    Montir Menuju Lokasi
                  </h4>
                  <span className="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary font-bold text-[9px]">
                    Sedang Berjalan
                  </span>
                </div>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Pak Bambang bergerak di Jl. Gatot Subroto
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3 relative">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10 ${
                  currentStep >= 3
                    ? "bg-primary-container text-on-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                3
              </div>
              <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-surface-container-high -mb-4"></div>
              <div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                  Tiba di Titik Temu
                </h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Pengecekan fisik unit &amp; verifikasi identitas
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start gap-3 relative">
              <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm z-10">
                4
              </div>
              <div className="absolute left-3.5 top-7 bottom-0 w-0.5 bg-surface-container-high -mb-4"></div>
              <div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                  Pengerjaan &amp; Perbaikan Unit
                </h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Pemeriksaan ruang bakar, busi, dan kuras oli
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm">
                5
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                  Pemeriksaan Akhir &amp; Pembayaran
                </h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant">
                  Garansi ServisIn 30 hari aktif otomatis setelah bayar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Masalah & Kendaraan */}
        <div className="bg-surface-container-low rounded-2xl p-3.5 border border-surface-container-high/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md font-bold text-on-surface">
              Data Masalah &amp; Kendaraan
            </span>
            <Link
              href={`/payment?id=${orderId}`}
              className="text-secondary font-label-sm text-label-sm font-bold hover:underline"
            >
              Rincian Nota →
            </Link>
          </div>

          <div className="bg-surface-container-lowest p-2.5 rounded-xl border border-surface-container-high/40 flex items-start gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                construction
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  Servis Berkala &amp; Tune Up
                </span>
                <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-primary font-bold text-[9px]">
                  Prioritas
                </span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Tarikan agak berat saat mesin panas, periksa celah busi.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-container-lowest p-2 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                directions_car
              </span>
              <div>
                <span className="text-[10px] text-on-surface-variant block">UNIT MOBIL</span>
                <span className="font-bold text-on-surface">Avanza Veloz 1.5</span>
              </div>
            </div>

            <div className="bg-surface-container-lowest p-2 rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>
                pin
              </span>
              <div>
                <span className="text-[10px] text-on-surface-variant block">NOMOR POLISI</span>
                <span className="font-bold font-mono text-on-surface">B 1234 ABC</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Toast Notification */}
        {showToast && (
          <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom">
            <div className="flex items-center gap-2 text-xs">
              <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 18 }}>
                near_me
              </span>
              <span>Posisi terbaru terupdate: 6 menit (1.4 km)</span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-white/70 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Bottom Bar: Protection & Emergency SOS */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/60">
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
              shield
            </span>
            <span>Dilindungi ServisIn Proteksi 24/7</span>
          </div>

          <button
            onClick={() => alert("Sinyal Bantuan Darurat dikirimkan ke Tim Siaga ServisIn.")}
            className="px-3 py-1.5 rounded-xl bg-error-container text-error font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-sm hover:brightness-105"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              emergency
            </span>
            <span>Bantuan Darurat</span>
          </button>
        </div>
      </div>
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
