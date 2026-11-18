"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";
import { SupabaseService } from "@/lib/supabase";

const BANK_VAS: Record<string, { bank: string; prefix: string; name: string }> = {
  bca: { bank: "BCA", prefix: "8277", name: "BCA Virtual Account" },
  mandiri: { bank: "Mandiri", prefix: "8960", name: "Mandiri Bill / VA" },
  bri: { bank: "BRI", prefix: "1280", name: "BRIVA" },
  bni: { bank: "BNI", prefix: "9881", name: "BNI Virtual Account" },
};

export default function PremiumUpgradePage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [isAlreadyVip, setIsAlreadyVip] = useState(false);
  const [walletBalance, setWalletBalance] = useState(650000);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "qris" | "va">("wallet");
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // VA State
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri" | "bni">("bca");
  const [generatedVa, setGeneratedVa] = useState("");
  const [copiedVa, setCopiedVa] = useState(false);

  // Pricing
  const planCost = selectedPlan === "annual" ? 468000 : 59000;

  useEffect(() => {
    const tier = dbStore.getUserTier();
    setIsAlreadyVip(tier === "VIP");
    setWalletBalance(dbStore.getCustomerBalance());
  }, []);

  useEffect(() => {
    const bankInfo = BANK_VAS[selectedBank];
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    setGeneratedVa(`${bankInfo.prefix} ${randomSuffix.slice(0, 4)} ${randomSuffix.slice(4, 8)}`);
  }, [selectedBank, showPaymentModal]);

  const handleOpenPayment = () => {
    setPin("");
    setPinError("");
    setShowPaymentModal(true);
  };

  const executeVipPayment = async () => {
    setLoading(true);
    setPinError("");

    // 1. Verify wallet balance & PIN if using wallet
    if (paymentMethod === "wallet") {
      const curBal = dbStore.getCustomerBalance();
      if (curBal < planCost) {
        setPinError(`Saldo tidak cukup (Saldo: Rp ${curBal.toLocaleString("id-ID")}, Dibutuhkan: Rp ${planCost.toLocaleString("id-ID")}).`);
        setLoading(false);
        return;
      }
      if (pin !== "123456") {
        setPinError("PIN ServisIn Wallet salah. Masukkan PIN yang benar (Default: 123456).");
        setLoading(false);
        return;
      }
      dbStore.deductCustomerWallet(planCost, "VIP-UPGRADE");
      setWalletBalance(dbStore.getCustomerBalance());
    }

    // 2. Set User Tier to VIP locally & in localStorage
    const currentUser = dbStore.getCurrentUser();
    dbStore.setUserTier("VIP", currentUser.id);
    setIsAlreadyVip(true);

    // 3. Persist to Supabase Database
    try {
      await SupabaseService.upgradeUserToVip(currentUser.id, selectedPlan);
    } catch (e) {
      console.warn("Supabase VIP sync notice:", e);
    }

    setLoading(false);
    setShowPaymentModal(false);
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="Upgrade Akun Premium VIP" />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 pb-24 md:pb-12">
        {/* Hero Luxury VIP Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-inverse-surface via-[#2d1a10] to-[#1a110a] p-6 md:p-10 text-white shadow-2xl border border-amber-500/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex items-center justify-center text-on-primary-container shadow-xl relative flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 44 }}>
                  workspace_premium
                </span>
                <span className="absolute -bottom-2 px-2.5 py-0.5 rounded-full bg-black/80 text-amber-300 font-extrabold text-[9px] uppercase tracking-widest border border-amber-400/40">
                  VIP GOLD
                </span>
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl font-extrabold text-amber-100 tracking-tight">
                    ServisIn Priority VIP
                  </h1>
                  <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
                    Tier Tertinggi
                  </span>
                </div>
                <p className="font-body-sm md:text-sm text-amber-100/80 mt-1 max-w-xl leading-relaxed">
                  Perlindungan total &amp; layanan eksklusif tanpa khawatir di setiap perjalanan Anda dengan mekanik master terverifikasi.
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-2">
                  {isAlreadyVip ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 text-xs font-bold shadow-md">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        verified
                      </span>
                      <span>STATUS AKUN ANDA: VIP AKTIF</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-emerald-500/20">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>18.400+ Pengemudi Terlindungi Aktif di Seluruh Indonesia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* If not VIP and on desktop, quick CTA button in hero */}
            {!isAlreadyVip && (
              <div className="hidden lg:flex flex-col items-end gap-2">
                <button
                  onClick={handleOpenPayment}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 font-bold text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    lock_open
                  </span>
                  <span>Aktifkan VIP Sekarang</span>
                </button>
                <span className="text-xs text-amber-200/70">Mulai Rp 39.000 / bulan</span>
              </div>
            )}
          </div>
        </div>

        {/* If already VIP banner */}
        {isAlreadyVip && (
          <div className="mt-6 p-6 rounded-2xl bg-tertiary-fixed/30 border border-tertiary flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                  verified
                </span>
              </div>
              <div>
                <h2 className="text-base font-bold text-tertiary">
                  Keanggotaan VIP Anda Sedang Aktif
                </h2>
                <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mt-0.5 max-w-2xl">
                  Anda telah menikmati seluruh fasilitas eksklusif termasuk <strong>AI Diagnostik tanpa batas</strong>, bebas biaya darurat 24/7, dan garansi perpanjangan suku cadang 365 hari.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Link
                href="/ai-diagnostic"
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-tertiary text-on-tertiary font-bold text-xs md:text-sm text-center shadow-sm hover:brightness-105 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  psychology
                </span>
                <span>Gunakan AI Diagnostic</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex-1 md:flex-initial px-5 py-2.5 rounded-xl bg-surface-container text-on-surface font-bold text-xs md:text-sm text-center hover:bg-surface-container-high"
              >
                Ke Beranda
              </Link>
            </div>
          </div>
        )}

        {/* Desktop Split Layout */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Benefits & Testimonials */}
          <div className={`${isAlreadyVip ? "lg:col-span-12" : "lg:col-span-7"} flex flex-col gap-6`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
                    Privilese Khusus Member VIP
                  </h3>
                  <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
                    Dapatkan keunggulan eksklusif yang dirancang khusus untuk kenyamanan berkendara Anda
                  </p>
                </div>
                <span className="hidden sm:inline-flex px-3 py-1 bg-secondary-fixed text-secondary rounded-full font-bold text-xs">
                  4 Manfaat Utama
                </span>
              </div>

              {/* Grid 4 Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Benefit 1 */}
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-primary-container/40 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                        psychology
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-label-lg font-bold text-on-surface">
                          Akses AI Mechanic
                        </h4>
                        <span className="px-1.5 py-0.2 bg-primary-container text-on-primary rounded text-[9px] font-bold">
                          VIP ONLY
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug">
                        Konsultasi keluhan mesin tanpa batas, analisa suara/getaran, dan estimasi biaya perbaikan akurat 24 jam.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 2 */}
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      SOS
                    </div>
                    <div>
                      <h4 className="font-label-lg font-bold text-on-surface">
                        Bebas Biaya Roadside SOS 24/7
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug">
                        Bebas biaya panggil darurat di mana saja &amp; kapan saja. Hemat hingga Rp 150.000 per panggilan.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 3 */}
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                        engineering
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-lg font-bold text-on-surface">
                        Montir Senior BNSP
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug">
                        Antrean prioritas utama dispatch teknisi master dengan SLA kedatangan &lt;10 menit ke titik lokasi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Benefit 4 */}
                <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-surface-container text-primary flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                        local_offer
                      </span>
                    </div>
                    <div>
                      <h4 className="font-label-lg font-bold text-on-surface">
                        Diskon 15% Servis &amp; Part
                      </h4>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug">
                        Berlaku otomatis untuk seluruh jasa mekanik dan suku cadang asli di 450+ bengkel mitra rekanan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Garansi & Kepercayaan Member */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-start gap-3">
                <span className="material-symbols-outlined text-emerald-600" style={{ fontSize: 28 }}>
                  verified_user
                </span>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Garansi 7 Hari Uang Kembali</h5>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    Jika Anda tidak puas dengan layanan VIP kami dalam 7 hari pertama, kami kembalikan 100% uang Anda tanpa pertanyaan rumit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high flex items-start gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 28 }}>
                  support_agent
                </span>
                <div>
                  <h5 className="font-bold text-xs text-on-surface">Concierge Prioritas WhatsApp</h5>
                  <p className="text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                    Customer support personal yang siap membantu booking darurat, klaim garansi part, dan reservasi bengkel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Plans & Sticky Payment CTA (Only if not already VIP) */}
          {!isAlreadyVip && (
            <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
              <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-lg flex flex-col gap-4">
                <div>
                  <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                    Pilih Periode Langganan VIP
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Pilih durasi paket yang paling hemat sesuai kebutuhan kendaraan Anda
                  </p>
                </div>

                {/* Annual Plan */}
                <div
                  onClick={() => setSelectedPlan("annual")}
                  className={`relative p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === "annual"
                      ? "bg-surface-container-low border-primary-container ring-2 ring-primary-container/20 shadow-md"
                      : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-lowest/80"
                  }`}
                >
                  <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-[10px] tracking-wide shadow-sm">
                    HEMAT 35% • TERLARIS
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
                        <h4 className="font-label-lg text-sm font-bold text-on-surface">
                          Paket 1 Tahun VIP
                        </h4>
                        <span className="text-xs text-on-surface-variant block">
                          Ditagih Rp 468.000 / tahun (Rp 39.000/bln)
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-headline-md text-base md:text-lg font-bold text-primary">
                        Rp 468.000
                      </span>
                      <span className="text-[10px] text-on-surface-variant block">/ tahun</span>
                    </div>
                  </div>
                </div>

                {/* Monthly Plan */}
                <div
                  onClick={() => setSelectedPlan("monthly")}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedPlan === "monthly"
                      ? "bg-surface-container-low border-primary-container ring-2 ring-primary-container/20 shadow-md"
                      : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-lowest/80"
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
                        <h4 className="font-label-lg text-sm font-bold text-on-surface">
                          Paket 1 Bulan VIP
                        </h4>
                        <span className="text-xs text-on-surface-variant block">
                          Fleksibel, batalkan kapan saja
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-headline-md text-base md:text-lg font-bold text-on-surface">
                        Rp 59.000
                      </span>
                      <span className="text-[10px] text-on-surface-variant block">/ bulan</span>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-surface-container-low rounded-xl p-3.5 flex flex-col gap-1.5 border border-surface-container-high">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Metode yang Tersedia:</span>
                    <span className="font-semibold text-on-surface">Wallet, QRIS, VA Bank</span>
                  </div>
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Status Verifikasi:</span>
                    <span className="font-semibold text-emerald-600">Instan Otomatis</span>
                  </div>
                  <div className="h-px bg-surface-container-high my-1"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-on-surface">Total Pembayaran:</span>
                    <span className="font-bold text-base text-primary">
                      Rp {planCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>

                {/* CTA Upgrade Button */}
                <button
                  onClick={handleOpenPayment}
                  className="w-full h-13 py-3.5 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-headline-sm text-sm md:text-base font-bold flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.99] transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    workspace_premium
                  </span>
                  <span>Lanjut Pembayaran VIP • Rp {planCost.toLocaleString("id-ID")}</span>
                </button>

                <p className="text-[11px] text-center text-on-surface-variant leading-tight">
                  Pembayaran aman &amp; otomatis tersinkronisasi ke server Supabase.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Customer Bottom Nav (Auto hidden on desktop via md:hidden) */}
      <CustomerBottomNav />

      {/* ========================================================================= */}
      {/* PAYMENT METHOD MODAL FOR VIP UPGRADE                                     */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-md w-full rounded-3xl p-6 shadow-2xl flex flex-col gap-3.5 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 24 }}>
                  workspace_premium
                </span>
                <span className="font-headline-sm text-base font-bold text-on-surface">
                  Pembayaran ServisIn VIP
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            {/* Total tagihan */}
            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                  PAKET TERPILIH
                </span>
                <span className="text-xs font-bold text-on-surface">
                  {selectedPlan === "annual" ? "Paket 1 Tahun VIP" : "Paket 1 Bulan VIP"}
                </span>
              </div>
              <span className="font-headline-md text-base font-bold text-primary">
                Rp {planCost.toLocaleString("id-ID")}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface">Pilih Metode Pembayaran:</span>

              {/* 1. Wallet */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "wallet"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      account_balance_wallet
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface block">ServisIn Wallet</span>
                    <span className="text-[10px] text-on-surface-variant">
                      Saldo: <strong>Rp {walletBalance.toLocaleString("id-ID")}</strong>{" "}
                      ({walletBalance >= planCost ? "Cukup" : "Kurang"})
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="vip_pay"
                  value="wallet"
                  checked={paymentMethod === "wallet"}
                  onChange={() => setPaymentMethod("wallet")}
                  className="w-4 h-4 accent-secondary"
                />
              </label>

              {/* 2. QRIS */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "qris"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      qr_code_2
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface block">QRIS ServisIn</span>
                    <span className="text-[10px] text-on-surface-variant">
                      GoPay, OVO, Dana, BCA, Mandiri
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="vip_pay"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={() => setPaymentMethod("qris")}
                  className="w-4 h-4 accent-secondary"
                />
              </label>

              {/* 3. VA */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "va"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-surface-container text-on-surface flex items-center justify-center">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      account_balance
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-xs text-on-surface block">Virtual Account</span>
                    <span className="text-[10px] text-on-surface-variant">
                      BCA, Mandiri, BRI, BNI (Otomatis)
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="vip_pay"
                  value="va"
                  checked={paymentMethod === "va"}
                  onChange={() => setPaymentMethod("va")}
                  className="w-4 h-4 accent-secondary"
                />
              </label>
            </div>

            {/* Details per method */}
            {paymentMethod === "wallet" && (
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
                <span className="text-xs font-bold text-on-surface">
                  Masukkan 6-Digit PIN ServisIn Wallet:
                </span>
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Ketik 6 digit PIN (Demo: 123456)"
                  className="w-full h-10 text-center bg-surface-container-lowest rounded-xl font-mono text-base font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary"
                />
                <span className="text-[10px] text-on-surface-variant text-center">
                  PIN Demo Default: <strong>123456</strong>
                </span>
              </div>
            )}

            {paymentMethod === "qris" && (
              <div className="bg-white rounded-xl p-3 border border-secondary/30 flex flex-col items-center">
                <img
                  src="/images/qris-servisin.jpg"
                  alt="QRIS ServisIn"
                  className="w-[200px] aspect-[3/4.2] object-contain"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1">
                  SERVISIN INDONESIA • NMID: ID1020038472910
                </span>
              </div>
            )}

            {paymentMethod === "va" && (
              <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
                <div className="grid grid-cols-4 gap-1 bg-surface-container p-1 rounded-lg">
                  {(["bca", "mandiri", "bri", "bni"] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBank(b)}
                      className={`py-1 text-[11px] font-bold rounded ${
                        selectedBank === b ? "bg-secondary text-on-secondary" : "text-on-surface-variant"
                      }`}
                    >
                      {BANK_VAS[b].bank}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between bg-surface-container-lowest p-2.5 rounded-lg border border-surface-container-high">
                  <span className="font-mono text-sm font-bold text-on-surface">{generatedVa}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(generatedVa.replace(/\s/g, ""));
                      setCopiedVa(true);
                      setTimeout(() => setCopiedVa(false), 2000);
                    }}
                    className="px-2 py-1 rounded bg-secondary text-on-secondary text-[11px] font-bold"
                  >
                    {copiedVa ? "Tersalin!" : "Salin"}
                  </button>
                </div>
              </div>
            )}

            {pinError && (
              <span className="text-xs text-error font-semibold text-center block">
                {pinError}
              </span>
            )}

            {/* Submit Payment */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={executeVipPayment}
                disabled={loading || (paymentMethod === "wallet" && pin.length !== 6)}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      lock
                    </span>
                    <span>Bayar &amp; Aktifkan VIP • Rp {planCost.toLocaleString("id-ID")}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="w-full h-9 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-xs font-semibold hover:bg-surface-container-high"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
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
              Pembayaran senilai <strong>Rp {planCost.toLocaleString("id-ID")}</strong> berhasil diverifikasi. Akun Anda kini berstatus <strong>ServisIn Priority VIP</strong> dan tersimpan di database Supabase.
            </p>

            <div className="w-full bg-surface-container-low rounded-xl p-2.5 text-xs text-tertiary font-bold flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                lock_open
              </span>
              <span>Fitur AI Mechanic Diagnostic Terbuka Penuh!</span>
            </div>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={() => router.push("/ai-diagnostic")}
                className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md font-bold shadow-md hover:brightness-105 flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  psychology
                </span>
                <span>Coba AI Diagnostic Sekarang</span>
              </button>
              <button
                onClick={() => router.push("/profile")}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface font-label-md text-xs font-semibold hover:bg-surface-container-high"
              >
                Lihat Profil VIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
