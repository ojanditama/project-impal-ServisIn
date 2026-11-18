"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
    dbStore.setUserTier("VIP");
    setIsAlreadyVip(true);

    // 3. Persist to Supabase Database
    try {
      await SupabaseService.upgradeUserToVip("usr-cst-001", selectedPlan);
    } catch (e) {
      console.warn("Supabase VIP sync notice:", e);
    }

    setLoading(false);
    setShowPaymentModal(false);
    setSuccess(true);
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
          Upgrade Akun Premium VIP
        </h1>

        <Link href="/profile" className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-container/30">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </Link>
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

        {isAlreadyVip ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-amber-950 mt-3.5 text-xs font-bold shadow-md">
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              verified
            </span>
            <span>STATUS AKUN ANDA: VIP AKTIF</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md mt-3.5 text-[11px] font-semibold text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>18.400+ Pengemudi Terlindungi Aktif</span>
          </div>
        )}
      </div>

      {/* If already VIP banner */}
      {isAlreadyVip && (
        <div className="mt-4 p-4 rounded-2xl bg-tertiary-fixed/30 border border-tertiary flex flex-col gap-2">
          <div className="flex items-center gap-2 text-tertiary font-bold text-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              check_circle
            </span>
            <span>Keanggotaan VIP Anda Sedang Aktif</span>
          </div>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Anda telah menikmati seluruh fasilitas eksklusif termasuk <strong>AI Diagnostik tanpa batas</strong>, bebas biaya darurat 24/7, dan garansi perpanjangan 365 hari.
          </p>
          <div className="flex gap-2 mt-1">
            <Link
              href="/ai-diagnostic"
              className="flex-1 py-2 rounded-xl bg-tertiary text-on-tertiary font-bold text-xs text-center shadow-sm hover:brightness-105"
            >
              Gunakan AI Diagnostic
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 py-2 rounded-xl bg-surface-container text-on-surface font-bold text-xs text-center hover:bg-surface-container-high"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      )}

      {/* Privilese Khusus Member */}
      <div className="mt-5 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Privilese Khusus Member VIP
          </h3>
          <span className="font-label-sm text-secondary font-bold text-[11px]">
            4 Manfaat Utama
          </span>
        </div>

        {/* Benefit 1: AI Diagnostic UNLIMITED */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-primary-container/40 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              psychology
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
                Akses Penuh AI Mechanic &amp; Diagnostic
              </h4>
              <span className="px-1.5 py-0.2 bg-primary-container text-on-primary rounded text-[9px] font-bold">
                EKSKLUSIF VIP
              </span>
            </div>
            <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
              Konsultasi keluhan mesin tanpa batas, analisa suara/getaran, dan estimasi biaya akurat dengan AI ServisIn.
            </p>
          </div>
        </div>

        {/* Benefit 2: Roadside SOS */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center font-bold text-xs flex-shrink-0">
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

        {/* Benefit 3: Senior Mechanic */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center flex-shrink-0">
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

      {/* Pilih Periode Proteksi (Only if not already VIP) */}
      {!isAlreadyVip && (
        <>
          <div className="mt-5 flex flex-col gap-2.5">
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Pilih Periode Langganan VIP
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
                      Ditagih Rp 468.000 / tahun (Rp 39.000/bln)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-headline-md text-headline-md font-bold text-primary">
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
                      Paket 1 Bulan VIP
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

          {/* CTA Upgrade Button */}
          <div className="mt-5">
            <button
              onClick={handleOpenPayment}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-primary via-primary-container to-amber-500 text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-xl hover:brightness-105 active:scale-[0.99] transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                workspace_premium
              </span>
              <span>Lanjut Pembayaran VIP • Rp {planCost.toLocaleString("id-ID")}</span>
            </button>
            <span className="text-[11px] text-center text-on-surface-variant block mt-2">
              Aman • Tersinkronisasi ke Database Supabase • Garansi 7 Hari Uang Kembali
            </span>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* PAYMENT METHOD MODAL FOR VIP UPGRADE                                     */}
      {/* ========================================================================= */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 22 }}>
                  workspace_premium
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
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
              <div className="bg-white rounded-xl p-2 border border-secondary/30 flex flex-col items-center">
                <img
                  src="/images/qris-servisin.jpg"
                  alt="QRIS ServisIn"
                  className="w-[180px] aspect-[3/4.2] object-contain"
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
