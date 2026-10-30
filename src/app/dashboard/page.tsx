"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";

export default function CustomerDashboardPage() {
  const router = useRouter();
  const [activeOrder] = useState(dbStore.orders[0]);
  const [activeVehicle] = useState(dbStore.vehicles[0]);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col pb-20 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              car_repair
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-surface">
              ServisIn
            </span>
            <span className="font-label-sm text-[10px] text-primary-container font-semibold uppercase tracking-wider">
              Pelanggan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              dark_mode
            </span>
          </button>
          <Link href="/premium" className="relative">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Profil Avatar"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-primary-container/40"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-tertiary rounded-full ring-2 ring-surface"></span>
          </Link>
        </div>
      </header>

      {/* Main Content Scroll */}
      <div className="px-4 pt-3 flex flex-col gap-4">
        {/* User Greeting & Location */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-headline-md text-headline-md text-on-surface font-bold">
                Halo, Rizky Pratama
              </h1>
              <span className="text-xl">👋</span>
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-body-sm text-body-sm mt-0.5">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 16 }}>
                location_on
              </span>
              <span className="truncate max-w-[240px]">Jl. Sudirman No. 42, Jakarta Pusat</span>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                expand_more
              </span>
            </div>
          </div>

          <Link
            href="/notifications"
            className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface relative"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              notifications
            </span>
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-container"></span>
          </Link>
        </div>

        {/* Active Vehicle Pill */}
        <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between border border-surface-container-high/60">
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

        {/* SOS Emergency Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-container via-primary-container to-primary p-4 text-on-primary shadow-[0_12px_28px_rgba(255,107,0,0.28)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                emergency
              </span>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-primary">
                Butuh Bantuan Cepat?
              </h2>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-white font-label-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              SIAGA 24/7
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-primary/90 mb-3.5 leading-snug">
            Mobil mogok, aki mati, atau ban kempes? Teknisi darurat siap meluncur ke lokasimu dalam &lt;15 menit.
          </p>

          {/* Quick SOS category pills */}
          <div className="grid grid-cols-3 gap-2 mb-3.5">
            <button
              onClick={() => router.push("/booking?type=jumper&emergency=true")}
              className="py-2 px-1 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
                bolt
              </span>
              <span className="font-label-sm text-[11px] text-white font-semibold mt-0.5">
                Jumper Aki
              </span>
            </button>

            <button
              onClick={() => router.push("/booking?type=towing&emergency=true")}
              className="py-2 px-1 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
                local_shipping
              </span>
              <span className="font-label-sm text-[11px] text-white font-semibold mt-0.5">
                Derek / Towing
              </span>
            </button>

            <button
              onClick={() => router.push("/booking?type=tire&emergency=true")}
              className="py-2 px-1 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm flex flex-col items-center justify-center text-center transition-all"
            >
              <span className="material-symbols-outlined text-white" style={{ fontSize: 20 }}>
                tire_repair
              </span>
              <span className="font-label-sm text-[11px] text-white font-semibold mt-0.5">
                Ganti Ban
              </span>
            </button>
          </div>

          {/* Big CTA */}
          <button
            onClick={() => router.push("/booking?emergency=true")}
            className="w-full h-12 rounded-xl bg-surface-container-lowest text-primary-container font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(0,0,0,0.15)] active:scale-[0.99] transition-all hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              phone_in_talk
            </span>
            <span>Panggil Montir Darurat Sekarang</span>
          </button>
        </div>

        {/* Live Tracking Card (Active Order) */}
        {activeOrder && (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md border border-surface-container-high/60 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-pulse"></span>
                <span className="font-label-sm text-[11px] uppercase tracking-wider text-secondary font-bold">
                  SEDANG BERLANGSUNG
                </span>
              </div>
              <span className="px-2 py-0.5 bg-surface-container-low text-on-surface-variant font-mono font-bold text-label-sm rounded-full">
                #{activeOrder.id}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  {activeOrder.serviceType}
                </h3>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Toyota Avanza (B 1234 ABC)
                </span>
              </div>
              <div className="text-right">
                <span className="font-label-sm text-body-sm text-on-surface-variant block">Estimasi Tiba</span>
                <span className="font-headline-sm text-headline-sm text-primary-container font-bold">
                  ~ 8 Menit
                </span>
              </div>
            </div>

            {/* Mechanic strip */}
            <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Mekanik"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary text-[10px]">
                    ✓
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      Bambang Sudiro
                    </span>
                    <span className="px-1.5 py-0.2 rounded bg-tertiary-container/20 text-tertiary font-bold text-[10px] flex items-center gap-0.5">
                      4.9 ★
                    </span>
                  </div>
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Honda Vario 160 (B 4521 SKL)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <a
                  href="tel:081377889900"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-secondary hover:bg-secondary-fixed shadow-sm"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    call
                  </span>
                </a>
                <a
                  href="https://wa.me/6281377889900"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-tertiary hover:bg-tertiary-fixed shadow-sm"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    chat
                  </span>
                </a>
              </div>
            </div>

            {/* Progress Bar & Peta Live Button */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-on-surface-variant mb-1">
                  <span>Montir Menuju Lokasi</span>
                  <span>1.4 km lagi</span>
                </div>
                <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-3/4 rounded-full"></div>
                </div>
              </div>

              <Link
                href="/tracking"
                className="px-3.5 py-2 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center gap-1 shadow-sm hover:brightness-110 flex-shrink-0"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  near_me
                </span>
                <span>Peta Live</span>
              </Link>
            </div>
          </div>
        )}

        {/* Layanan Populer */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Layanan Populer
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Teknisi tersertifikasi datang ke garasi / jalan
              </span>
            </div>
            <Link href="/booking" className="font-label-md text-label-md text-secondary font-bold hover:underline">
              Lihat Semua
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* 1. Ganti Oli */}
            <div
              onClick={() => router.push("/booking?category=oli")}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    oil_barrel
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold">
                  Hemat 20%
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Ganti Oli Mesin
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Filter &amp; oli premium
                </p>
              </div>
            </div>

            {/* 2. Ban & Tubeless */}
            <div
              onClick={() => router.push("/booking?category=ban")}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    tire_repair
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold">
                  Cepat 20m
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
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
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed-dim/40 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    bolt
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-surface-container-low text-on-surface-variant font-bold">
                  Siaga
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Servis &amp; Jumper Aki
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Tes voltase &amp; ganti baru
                </p>
              </div>
            </div>

            {/* 4. Derek & Towing */}
            <div
              onClick={() => router.push("/booking?category=derek")}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    local_shipping
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-error-container text-error font-bold">
                  24 Jam
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Derek &amp; Towing
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Flatbed aman kota &amp; tol
                </p>
              </div>
            </div>

            {/* 5. Tune-Up Mesin */}
            <div
              onClick={() => router.push("/booking?category=tuneup")}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    tune
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold">
                  Komplit
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Tune-Up Mesin
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Pembersihan ruang bakar
                </p>
              </div>
            </div>

            {/* 6. AI Diagnostik */}
            <div
              onClick={() => router.push("/ai-diagnostic")}
              className="bg-surface-container-lowest p-3.5 rounded-2xl border border-secondary/30 shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-36 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    auto_fix_high
                  </span>
                </div>
                <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold">
                  AI Pintar
                </span>
              </div>
              <div>
                <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                  AI Diagnostik
                </h3>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Scan OBD2 &amp; Suara Mesin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal Berkala Disarankan */}
        <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container-high/60 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
                calendar_today
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Jadwal Berkala Disarankan
              </h3>
            </div>
            <span className="font-label-sm text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-bold">
              Waktunya Servis
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
            Mobil Avanza Anda telah menempuh 5.000 km sejak servis terakhir. Disarankan penggantian oli transmisi dan pengecekan minyak rem sebelum perjalanan jauh.
          </p>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => router.push("/booking")}
              className="flex-1 h-10 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-sm"
            >
              Booking Jadwal Besok
            </button>
            <button
              onClick={() => alert("Pengingat servis disimpan.")}
              className="px-3 h-10 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container"
            >
              Ingatkan Nanti
            </button>
          </div>
        </div>

        {/* Garansi ServisIn 30 Hari */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
              verified
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface">
                Garansi ServisIn 30 Hari
              </h3>
              <span className="text-tertiary font-bold text-sm">✓</span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Perlindungan pengerjaan teknisi tersertifikasi, suku cadang 100% orisinil, serta jaminan perbaikan ulang gratis tanpa ribet.
            </p>
          </div>
        </div>

        {/* Promo & Paket Spesial Carousel */}
        <div className="flex flex-col gap-2 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Promo &amp; Paket Spesial
            </h3>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Geser untuk melihat
            </span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {/* Card 1 */}
            <div className="w-72 flex-shrink-0 rounded-2xl bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 shadow-sm">
              <div className="relative h-36">
                <img
                  src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"
                  alt="Paket Mudik"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[10px]">
                  DISKON 35%
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Paket Servis Mudik Nyaman
                </h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                  Cek 32 titik mesin, tune up komplit, gratis cuci busi &amp; cuci mobil.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary-container">
                    Rp 349.000
                  </span>
                  <button
                    onClick={() => router.push("/booking?promo=mudik")}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-low text-secondary font-label-md text-label-md font-bold hover:bg-secondary hover:text-on-secondary transition-all"
                  >
                    Klaim
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="w-72 flex-shrink-0 rounded-2xl bg-surface-container-lowest overflow-hidden border border-surface-container-high/60 shadow-sm">
              <div className="relative h-36">
                <img
                  src="https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80"
                  alt="Tune Up Komplit"
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[10px]">
                  GRATIS VOUCHER
                </span>
              </div>
              <div className="p-3">
                <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Tune Up + Carbon Cleaner
                </h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">
                  Performa responsif seketika, pembersihan ruang bakar mesin.
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-headline-sm text-headline-sm font-bold text-primary-container">
                    Rp 480.000
                  </span>
                  <button
                    onClick={() => router.push("/booking?promo=tuneup")}
                    className="px-3 py-1.5 rounded-xl bg-surface-container-low text-secondary font-label-md text-label-md font-bold hover:bg-secondary hover:text-on-secondary transition-all"
                  >
                    Klaim
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  );
}
