"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { dbStore } from "@/lib/store";
import { OrderController } from "@/controllers/OrderController";

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";

  const [step] = useState(1);
  const [category, setCategory] = useState("tuneup");
  const [includeAddon, setIncludeAddon] = useState(true);
  const [locationType, setLocationType] = useState<"home" | "office">("home");
  const [notes, setNotes] = useState(
    "Tarikan gas bawah agak berat saat mesin panas, tolong periksa celah busi dan filter udara."
  );
  const [loading, setLoading] = useState(false);

  const basePrice = 299000;
  const addonPrice = includeAddon ? 50000 : 0;
  const totalPrice = basePrice + addonPrice;

  const handleConfirmOrder = () => {
    setLoading(true);

    setTimeout(() => {
      const activeVeh = dbStore.vehicles.find((v) => v.isActive) || dbStore.vehicles[0];
      const res = OrderController.createServiceOrder({
        customerId: "usr-cst-001",
        vehicleId: activeVeh.id,
        serviceType: isEmergency ? "Panggilan Darurat & Servis" : "Servis Berkala & Tune Up",
        locationCoord: {
          lat: -6.2088,
          lng: 106.8456,
          address: "Jl. Sudirman No. 42, RT 04 / RW 02, Menteng, Jakarta Pusat",
        },
        totalCost: totalPrice,
        items: [
          { name: "Jasa Tune Up & 32 Pengecekan", price: basePrice },
          ...(includeAddon ? [{ name: "Oli Mesin Shell Helix Ultra 4L", price: 50000 }] : []),
          { name: "Biaya Kunjungan Mekanik (PROMO)", price: 0 },
        ],
        notes,
        isEmergency,
        isVIP: true,
      });

      setLoading(false);
      if (res.success && res.order) {
        router.push(`/tracking?id=${res.order.id}`);
      }
    }, 600);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-24 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header Bar */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest rounded-full shadow-sm border border-surface-container-high/40">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>
            build
          </span>
          <span className="font-headline-sm text-label-md text-on-surface font-bold">ServisIn</span>
        </div>

        <Link href="/premium" className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-container/30">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      {/* Title */}
      <div className="mt-1">
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
          {isEmergency ? "Panggilan Montir Darurat" : "Booking Servis Berkala"}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 leading-snug">
          {isEmergency
            ? "Mekanik terdekat langsung meluncur dengan estimasi tiba <15 menit."
            : "Pilih jadwal fleksibel, mekanik andal datang langsung ke garasi Anda."}
        </p>
      </div>

      {/* 3-Step Stepper */}
      <div className="mt-3.5 bg-surface-container-low p-2 rounded-xl flex items-center justify-between border border-surface-container-high/60">
        <div className="flex items-center gap-1.5 flex-1">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant"
            }`}
          >
            1
          </span>
          <span className="font-label-sm text-label-sm font-bold text-on-surface">
            Pilih Servis
          </span>
        </div>
        <div className="w-6 h-0.5 bg-primary-container"></div>
        <div className="flex items-center gap-1.5 flex-1 justify-center">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? "bg-primary-container text-on-primary" : "bg-secondary text-on-secondary"
            }`}
          >
            2
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Waktu &amp; Lokasi
          </span>
        </div>
        <div className="w-6 h-0.5 bg-surface-container-highest"></div>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          <span className="w-6 h-6 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-xs font-bold">
            3
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            Konfirmasi
          </span>
        </div>
      </div>

      {/* Kendaraan Servis Card */}
      <div className="mt-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              directions_car
            </span>
            <span>Kendaraan Servis</span>
          </div>
          <Link href="/vehicles" className="text-secondary font-label-md text-label-md font-bold hover:underline">
            Ganti Unit ⇄
          </Link>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-surface-container-high/60 relative overflow-hidden flex items-center justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container"></div>
          <div className="flex items-center gap-3 pl-2">
            <img
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80"
              alt="Avanza"
              className="w-14 h-12 object-cover rounded-lg border border-surface-container-high/40"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-primary-fixed text-primary font-label-sm text-[9px] font-bold">
                  UNIT UTAMA
                </span>
                <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-tertiary font-label-sm text-[9px] font-bold">
                  Sehat
                </span>
              </div>
              <h3 className="font-label-lg text-label-lg font-bold text-on-surface mt-0.5">
                Toyota Avanza Veloz 1.5 AT
              </h3>
              <span className="text-[11px] text-on-surface-variant">
                B 1234 ABC • Odo: 28.450 km
              </span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              edit
            </span>
          </button>
        </div>
      </div>

      {/* Paket Pengerjaan */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              construction
            </span>
            <span>Paket Pengerjaan</span>
          </div>
          <span className="text-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              verified
            </span>{" "}
            Garansi 30 Hari
          </span>
        </div>

        {/* Categories scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setCategory("tuneup")}
            className={`px-3 py-1.5 rounded-xl font-label-md text-label-md flex items-center gap-1.5 flex-shrink-0 transition-all ${
              category === "tuneup"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              tune
            </span>
            <span>Tune Up &amp; Ringan</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory("oli")}
            className={`px-3 py-1.5 rounded-xl font-label-md text-label-md flex items-center gap-1.5 flex-shrink-0 transition-all ${
              category === "oli"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              oil_barrel
            </span>
            <span>Ganti Oli &amp; Filter</span>
          </button>

          <button
            type="button"
            onClick={() => setCategory("mudik")}
            className={`px-3 py-1.5 rounded-xl font-label-md text-label-md flex items-center gap-1.5 flex-shrink-0 transition-all ${
              category === "mudik"
                ? "bg-primary-container text-on-primary font-bold shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              luggage
            </span>
            <span>Paket Mudik</span>
          </button>
        </div>

        {/* Selected Package Details Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border-2 border-primary-container/70 flex flex-col gap-3 relative">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[10px] font-bold">
                Paling Direkomendasikan
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-1">
                Tune Up Berkala + 32 Titik Inspeksi
              </h3>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                Pembersihan ruang bakar, throttle body, busi, dan uji emisi.
              </p>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs">
              ✓
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium text-on-surface">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
                check_circle
              </span>
              <span>Gratis Cek Rem &amp; Ban</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
                check_circle
              </span>
              <span>Scanner OBD-II ECU</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
                check_circle
              </span>
              <span>Uji Kelistrikan &amp; Aki</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
                check_circle
              </span>
              <span>Kuras Karbon Vakum</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container-high/60">
            <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                schedule
              </span>
              Estimasi: 75 - 90 Menit
            </span>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant line-through block">
                Rp 380.000
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-primary-container">
                Rp {basePrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Addon Bundling Checkbox Card */}
        <label className="bg-surface-container-low p-3 rounded-xl border border-surface-container-high/60 flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary-container">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                oil_barrel
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Tambah Oli Mesin Shell Helix Ultra 4L
              </span>
              <span className="text-[11px] text-primary font-semibold">
                + Rp 50.000 (Potongan bundling hemat)
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={includeAddon}
            onChange={(e) => setIncludeAddon(e.target.checked)}
            className="w-5 h-5 rounded text-primary-container accent-primary-container"
          />
        </label>
      </div>

      {/* Lokasi Kedatangan */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              location_on
            </span>
            <span>Lokasi Kedatangan</span>
          </div>
          <button
            type="button"
            onClick={() => alert("Pilih titik koordinat baru di Google Maps.")}
            className="text-secondary font-label-md text-label-md font-bold hover:underline"
          >
            + Titik Baru
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setLocationType("home")}
            className={`p-3 rounded-xl flex items-center gap-2.5 border transition-all text-left ${
              locationType === "home"
                ? "bg-surface-container-lowest border-primary-container ring-2 ring-primary-container/20 shadow-sm"
                : "bg-surface-container-low border-surface-container-high/60 text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
              home
            </span>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
                Rumah (Garasi)
              </span>
              <span className="text-[10px] text-tertiary font-semibold">Terpilih</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setLocationType("office")}
            className={`p-3 rounded-xl flex items-center gap-2.5 border transition-all text-left ${
              locationType === "office"
                ? "bg-surface-container-lowest border-primary-container ring-2 ring-primary-container/20 shadow-sm"
                : "bg-surface-container-low border-surface-container-high/60 text-on-surface-variant"
            }`}
          >
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
              apartment
            </span>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
                Kantor Pusat
              </span>
              <span className="text-[10px] text-on-surface-variant">Menteng Bintaro</span>
            </div>
          </button>
        </div>

        {/* Address Card with Map Thumbnail */}
        <div className="bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high/60 flex flex-col gap-2 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-lg bg-secondary-fixed/40 flex items-center justify-center text-primary-container flex-shrink-0 border border-secondary-fixed">
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                map
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-label-sm text-[9px] font-bold">
                  ALAMAT LENGKAP
                </span>
                <button
                  type="button"
                  onClick={() => alert("Geser pin alamat di peta.")}
                  className="text-secondary font-label-sm text-[11px] font-bold hover:underline"
                >
                  Edit Pin
                </button>
              </div>
              <p className="font-label-md text-label-md font-bold text-on-surface mt-1">
                Jl. Sudirman No. 42, RT 04 / RW 02
              </p>
              <p className="font-body-sm text-[11px] text-on-surface-variant">
                Menteng, Jakarta Pusat, DKI Jakarta 10310
              </p>
            </div>
          </div>
          <div className="bg-surface-container-low p-2 rounded-lg text-[11px] text-on-surface-variant flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
              info
            </span>
            <span>Catatan akses: Garasi cukup untuk 2 mobil, permukaan lantai rata &amp; terlindung kanopi.</span>
          </div>
        </div>
      </div>

      {/* Preferensi & Catatan Kendaraan */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-on-surface font-label-md text-label-md font-bold">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
            engineering
          </span>
          <span>Preferensi &amp; Catatan Kendaraan</span>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high/60 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Teknisi"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-label-md text-label-md font-bold text-on-surface">
                    Mekanik Level IV BNSP
                  </span>
                  <span className="px-1.5 py-0.2 bg-secondary-fixed text-secondary font-bold text-[9px] rounded">
                    Ahli Mesin
                  </span>
                </div>
                <span className="text-[11px] text-on-surface-variant">
                  Rating 4.95/5.0 • 450+ Servis Tuntas
                </span>
              </div>
            </div>
            <span className="w-5 h-5 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs">
              ✓
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-[11px] text-on-surface-variant mb-1">
              <span>Catatan / Gejala Kerusakan (Opsional)</span>
              <span>Maks. 200 karakter</span>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 bg-surface-container-low rounded-xl text-on-surface font-body-sm text-[12px] focus:outline-none focus:ring-2 focus:ring-primary-container border-none"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Rincian Estimasi Biaya */}
      <div className="mt-4 bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Rincian Estimasi Biaya
          </h3>
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
            Garansi Biaya Pasti
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-xs text-on-surface-variant">
          <div className="flex justify-between">
            <span>Jasa Tune Up &amp; 32 Pengecekan</span>
            <span className="font-semibold text-on-surface">Rp {basePrice.toLocaleString()}</span>
          </div>
          {includeAddon && (
            <div className="flex justify-between">
              <span>Oli Shell Helix Ultra 4L (Bundling)</span>
              <span className="font-semibold text-on-surface">Rp 50.000</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Biaya Kunjungan Mekanik{" "}
              <span className="px-1.5 bg-primary-fixed text-primary font-bold text-[9px] rounded">
                PROMO
              </span>
            </span>
            <span className="text-tertiary font-bold">
              <span className="line-through text-on-surface-variant mr-1 font-normal">
                Rp 45.000
              </span>
              Gratis
            </span>
          </div>
        </div>

        <div className="pt-2.5 border-t border-surface-container-high/60 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant block">
              TOTAL PEMBAYARAN
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary-container">
              Rp {totalPrice.toLocaleString()}
            </span>
          </div>
          <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              verified
            </span>
            Bayar Setelah Selesai
          </span>
        </div>
      </div>

      {/* Trust Badges 3-col */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center py-2 text-[11px] text-on-surface-variant">
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
            shield
          </span>
          <span className="font-semibold">Garansi 30 Hari</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
            workspace_premium
          </span>
          <span className="font-semibold">Teknisi BNSP</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
            alarm_on
          </span>
          <span className="font-semibold">On-Time Or Free</span>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-surface/95 backdrop-blur-md border-t border-surface-container-high/60 z-40">
        <button
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-between px-5 shadow-[0_10px_25px_-5px_rgba(255,107,0,0.35)] active:scale-[0.99] transition-all hover:brightness-105 disabled:opacity-70"
        >
          <div className="text-left flex flex-col">
            <span className="text-[10px] font-normal uppercase text-on-primary/80">
              Servis Kunjungan Garasi
            </span>
            <span>Konfirmasi Booking</span>
          </div>
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              arrow_forward
            </span>
          )}
        </button>
        <span className="text-[10px] text-center text-on-surface-variant block mt-1.5">
          Bebas ubah jadwal atau pembatalan hingga 2 jam sebelum pengerjaan
        </span>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
