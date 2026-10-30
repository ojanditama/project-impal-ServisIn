"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechanicBottomNav from "@/components/MechanicBottomNav";

export default function MechanicNavigationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(2); // 1: Menuju Lokasi, 2: Tiba di TKP, 3: Diagnosa, 4: Selesai
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [addedPart, setAddedPart] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleStepAction = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
      setToastMessage("Geofence valid! Status: Mekanik Tiba di TKP.");
    } else if (currentStep === 3) {
      setCurrentStep(4);
      setToastMessage("Diagnosa tersimpan. Lanjut ke finalisasi pekerjaan.");
    } else if (currentStep === 4) {
      setToastMessage("Pekerjaan tuntas! Menuju ke dompet mekanik...");
      setTimeout(() => {
        router.push("/mechanic/wallet");
      }, 1000);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col pb-24 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-surface/85 backdrop-blur-xl border-b border-surface-container-high/40 px-4 h-14 flex items-center justify-between">
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
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Mekanik"
            className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40"
          />
        </div>
      </header>

      {/* Turn-by-turn HUD (Navigation Banner) */}
      <div className="p-3">
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

      {/* GPS Map Area */}
      <div className="relative h-64 w-full bg-slate-200 overflow-hidden">
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
                TITIK KENDARAAN MOGOK
              </span>
              <span className="text-xs font-bold text-slate-800">
                Km 07+400 Bahu Kiri Depan Menara Gatot Subroto
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-secondary-fixed text-secondary font-bold text-[10px]">
            Rute Aktif
          </span>
        </div>
      </div>

      {/* Customer Profile & Emergency Card */}
      <div className="px-4 pt-3 flex flex-col gap-3">
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&h=120&q=80"
                  alt="Ibu Farida"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-primary-container/30"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-1 ring-white"></span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Ibu Farida Ananda
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
                  <span className="text-amber-500 font-bold">★ 5.0</span>
                  <span>•</span>
                  <span>Pelanggan Terverifikasi</span>
                </div>
              </div>
            </div>

            <span className="px-2.5 py-1 rounded-full bg-secondary-fixed text-secondary font-mono font-bold text-[11px]">
              #EMG-9842
            </span>
          </div>

          {/* Vehicle info */}
          <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                directions_car
              </span>
              <span>Toyota Innova Reborn 2.4 V</span>
            </div>
            <span className="px-2 py-0.5 bg-slate-900 text-white font-mono font-bold text-[10px] rounded">
              B 2045 SKL
            </span>
          </div>

          {/* Complaint */}
          <div className="bg-error-container/20 rounded-xl p-2.5 border border-error-container/40 flex items-start gap-2 text-xs">
            <span className="material-symbols-outlined text-error flex-shrink-0" style={{ fontSize: 18 }}>
              warning
            </span>
            <p className="text-on-surface leading-snug">
              <strong className="text-error font-semibold">KELUHAN DARURAT:</strong> Aki Drop / Mesin Mati Mendadak di Lajur Luar. Bawa jumper starter pack &amp; Aki Cadangan 12V 60Ah GS Astra.
            </p>
          </div>

          {/* Contact buttons */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href="tel:081298453210"
              className="h-11 rounded-xl bg-tertiary text-on-tertiary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                call
              </span>
              <span>Telepon Langsung</span>
            </a>

            <a
              href="https://wa.me/6281298453210"
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
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  pin_drop
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  currentStep >= 2 ? "text-primary-container" : "text-on-surface-variant"
                }`}
              >
                Tiba di TKP
              </span>
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
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  construction
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  currentStep >= 3 ? "text-primary-container" : "text-on-surface-variant"
                }`}
              >
                Diagnosa
              </span>
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
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  receipt_long
                </span>
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  currentStep >= 4 ? "text-primary-container" : "text-on-surface-variant"
                }`}
              >
                Selesai/Billing
              </span>
            </div>
          </div>

          {/* Dynamic Big Action CTA */}
          <div className="pt-2">
            <button
              onClick={handleStepAction}
              className="w-full h-14 rounded-xl bg-primary-container text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                {currentStep === 2
                  ? "pin_drop"
                  : currentStep === 3
                  ? "construction"
                  : "check_circle"}
              </span>
              <span>
                {currentStep === 2
                  ? "KONFIRMASI TIBA DI LOKASI"
                  : currentStep === 3
                  ? "MULAI PENGERJAAN & PERBAIKAN"
                  : "SELESAIKAN ORDER & TERBITKAN NOTA"}
              </span>
            </button>
            <span className="text-[10px] text-center text-on-surface-variant block mt-1.5">
              {currentStep === 2
                ? "Sentuh saat Anda telah memarkirkan motor/mobil servis di samping kendaraan pelanggan."
                : "Unggah foto spidometer dan part sebelum menuntaskan pesanan."}
            </span>
          </div>
        </div>

        {/* 2 Field Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          {/* Foto Spido */}
          <button
            type="button"
            onClick={() => {
              setPhotoUploaded(true);
              setToastMessage("Foto spidometer & unit berhasil diunggah ke bukti cloud.");
            }}
            className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm flex flex-col justify-between text-left h-24 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 24 }}>
                photo_camera
              </span>
              <span
                className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                  photoUploaded ? "bg-tertiary text-on-tertiary" : "bg-primary-fixed text-primary"
                }`}
              >
                {photoUploaded ? "Tersimpan ✓" : "Wajib"}
              </span>
            </div>
            <div>
              <span className="font-label-md text-xs font-bold text-on-surface block">
                Foto Spidometer &amp; Unit
              </span>
              <span className="text-[10px] text-on-surface-variant">Sebelum pengerjaan</span>
            </div>
          </button>

          {/* Tambah Komponen */}
          <button
            type="button"
            onClick={() => {
              setAddedPart(true);
              setToastMessage("Aki GS Astra 55Ah ditambahkan ke rincian faktur pelanggan (+Rp 850.000).");
            }}
            className="p-3 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm flex flex-col justify-between text-left h-24 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 24 }}>
                add_shopping_cart
              </span>
              <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface-variant font-bold text-[9px]">
                {addedPart ? "Ditambahkan ✓" : "+ Katalog"}
              </span>
            </div>
            <div>
              <span className="font-label-md text-xs font-bold text-on-surface block">
                Tambah Komponen
              </span>
              <span className="text-[10px] text-on-surface-variant">Aki, kabel, klem, fuse</span>
            </div>
          </button>
        </div>

        {/* SOS Emergency Montir Bar */}
        <div className="bg-error-container/30 border border-error-container rounded-2xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-error text-on-error flex items-center justify-center font-bold text-xs">
              SOS
            </div>
            <div>
              <h4 className="font-label-md text-xs font-bold text-on-error-container">
                Bantuan Darurat Montir
              </h4>
              <p className="text-[10px] text-on-error-container/80">
                Kondisi lalu lintas bahaya / butuh towing
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Sinyal SOS terkirim ke Pusat Kendali ServisIn!")}
            className="px-3.5 py-2 rounded-xl bg-error text-on-error font-bold text-xs shadow-md hover:brightness-110"
          >
            SOS
          </button>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="bg-slate-900 text-white rounded-xl p-3 text-xs flex items-center justify-between shadow-xl">
            <span>{toastMessage}</span>
            <button onClick={() => setToastMessage("")} className="font-bold ml-2">
              ✕
            </button>
          </div>
        )}
      </div>

      <MechanicBottomNav />
    </div>
  );
}
