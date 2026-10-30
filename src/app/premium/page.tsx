"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PremiumUpgradePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpgrade = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-12 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-2">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </Link>

        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Upgrade Akun Premium Vip
        </h1>

        <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-container/30">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Hero Luxury VIP Card */}
      <div className="mt-2 relative overflow-hidden rounded-3xl bg-gradient-to-br from-inverse-surface via-[#3d2719] to-on-primary-container p-6 text-center text-white shadow-xl">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 mx-auto flex items-center justify-center text-on-primary-container shadow-lg mb-2 relative">
          <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
            workspace_premium
          </span>
          <span className="absolute -bottom-1 px-2 py-0.2 rounded-full bg-black/60 text-amber-300 font-bold text-[8px] uppercase tracking-widest">
            VIP GOLD
          </span>
        </div>

        <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-amber-100 tracking-tight mt-2">
          ServisIn Priority VIP
        </h2>
        <p className="font-body-sm text-[12px] text-amber-100/80 mt-1 max-w-xs mx-auto leading-relaxed">
          Perlindungan Total &amp; Layanan Eksklusif Tanpa Khawatir di Setiap Perjalanan Anda.
        </p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md mt-3.5 text-[11px] font-semibold text-emerald-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>18.400+ Pengemudi Terlindungi Aktif</span>
        </div>
      </div>

      {/* Privilese Khusus Member */}
      <div className="mt-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Privilese Khusus Member
          </h3>
          <span className="font-label-sm text-secondary font-bold text-[11px]">
            4 Manfaat Utama
          </span>
        </div>

        {/* Benefit 1: Roadside SOS */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center font-bold text-xs flex-shrink-0">
            SOS
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
              Bebas Biaya Roadside SOS 24/7
            </h4>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Bebas biaya panggilan darurat di mana saja dan kapan saja. Hemat hingga Rp 150rb per panggilan.
            </p>
          </div>
        </div>

        {/* Benefit 2: Senior Mechanic */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              engineering
            </span>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
              Montir Senior Sertifikasi BNSP
            </h4>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Antrean prioritas utama dispatch teknisi handal dengan waktu respon cepat &lt;10 menit ke lokasi Anda.
            </p>
          </div>
        </div>

        {/* Benefit 3: AI Diagnostic */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              auto_fix_high
            </span>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
              Akses Tanpa Batas AI Diagnostic
            </h4>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Scan telemetri sensor real-time &amp; sistem prediksi pintar degradasi komponen sebelum mogok.
            </p>
          </div>
        </div>

        {/* Benefit 4: Discount */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface-container text-primary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              local_offer
            </span>
          </div>
          <div>
            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
              Diskon Tambahan 15% Servis &amp; Part
            </h4>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Berlaku untuk seluruh jasa mekanik dan suku cadang orisinil di 450+ bengkel mitra resmi nasional.
            </p>
          </div>
        </div>
      </div>

      {/* Pilih Periode Proteksi */}
      <div className="mt-5 flex flex-col gap-2.5">
        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Pilih Periode Proteksi
        </h3>

        {/* Annual Plan */}
        <div
          onClick={() => setSelectedPlan("annual")}
          className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedPlan === "annual"
              ? "bg-surface-container-low border-primary-container ring-2 ring-primary-container/20 shadow-md"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-[10px] tracking-wide shadow-sm">
            HEMAT 35% • BEST VALUE
          </span>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "annual" ? "border-primary" : "border-surface-container-highest"
                }`}
              >
                {selectedPlan === "annual" && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
              </div>
              <div>
                <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Paket 1 Tahun VIP
                </h4>
                <span className="text-[11px] text-on-surface-variant">
                  Ditagih Rp 468.000 / tahun
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-md text-headline-md font-bold text-primary">
                Rp 39.000
              </span>
              <span className="text-[10px] text-on-surface-variant block">/ bulan</span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-surface-container-high/60 flex items-center gap-1.5 text-xs text-tertiary font-semibold">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              verified
            </span>
            <span>Bonus: Gratis 1x Uji Emisi &amp; Tune Up Lengkap</span>
          </div>
        </div>

        {/* Monthly Plan */}
        <div
          onClick={() => setSelectedPlan("monthly")}
          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
            selectedPlan === "monthly"
              ? "bg-surface-container-low border-primary-container ring-2 ring-primary-container/20 shadow-md"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === "monthly" ? "border-primary" : "border-surface-container-highest"
                }`}
              >
                {selectedPlan === "monthly" && <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>}
              </div>
              <div>
                <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Paket Bulanan
                </h4>
                <span className="text-[11px] text-on-surface-variant">
                  Fleksibel, batalkan kapan saja
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-md text-headline-md font-bold text-on-surface">
                Rp 59.000
              </span>
              <span className="text-[10px] text-on-surface-variant block">/ bulan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonial Card */}
      <div className="mt-4 bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5 text-amber-500">
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
            <span>★</span>
          </div>
          <span className="text-[10px] text-on-surface-variant">2 hari lalu</span>
        </div>
        <p className="font-body-sm text-xs text-on-surface italic leading-relaxed">
          &ldquo;Mobil sempat mati total di tol Cipularang tengah malam. Begitu pencet tombol VIP, montir senior tiba hanya dalam 9 menit. Ganti aki beres di tempat tanpa biaya derek sama sekali!&rdquo;
        </p>
        <div className="flex items-center gap-2 mt-1">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&h=80&q=80"
            alt="Bambang"
            className="w-7 h-7 rounded-full object-cover"
          />
          <div className="flex flex-col">
            <span className="font-label-md text-xs font-bold text-on-surface">Bambang Haryanto</span>
            <span className="text-[9px] text-on-surface-variant">
              Member VIP sejak 2023 • Honda CR-V
            </span>
          </div>
        </div>
      </div>

      {/* Garansi Uang Kembali */}
      <div className="mt-3 bg-tertiary-fixed/30 rounded-2xl p-3 flex items-center gap-3 border border-tertiary-fixed">
        <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
            verified_user
          </span>
        </div>
        <div>
          <h4 className="font-label-md text-label-md font-bold text-on-surface">
            Garansi 7 Hari Uang Kembali
          </h4>
          <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
            Batal kapan saja tanpa syarat jika tidak puas dengan layanan kami.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="mt-5">
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-70"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                workspace_premium
              </span>
              <span>Tingkatkan ke VIP Sekarang</span>
            </>
          )}
        </button>

        <span className="text-[11px] text-center text-on-surface-variant block mt-2">
          Aman • Terenkripsi • Aktivasi Instan Otomatis
        </span>
      </div>

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                workspace_premium
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Selamat Datang di VIP!
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
              Akun Anda kini berstatus <strong>ServisIn Priority VIP</strong> dengan masa garansi 30 hari penuh, bebas biaya SOS, dan AI tanpa batas.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full h-12 mt-2 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:brightness-105"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
