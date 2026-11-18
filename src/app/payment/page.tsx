"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import { PaymentController } from "@/controllers/PaymentController";
import { dbStore } from "@/lib/store";

const BANK_VAS: Record<string, { bank: string; prefix: string; name: string }> = {
  bca: { bank: "BCA", prefix: "8277", name: "BCA Virtual Account" },
  mandiri: { bank: "Mandiri", prefix: "8960", name: "Mandiri Bill / VA" },
  bri: { bank: "BRI", prefix: "1280", name: "BRIVA" },
  bni: { bank: "BNI", prefix: "9881", name: "BNI Virtual Account" },
};

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SRV-8942";

  const [paymentMethod, setPaymentMethod] = useState<"wallet" | "qris" | "va" | "cc">("wallet");
  const [coupon, setCoupon] = useState("ROADSIDECARE40");
  const [couponApplied, setCouponApplied] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  // Wallet State
  const [walletBalance, setWalletBalance] = useState<number>(650000);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");

  // QRIS Modal State
  const [showQrisModal, setShowQrisModal] = useState(false);
  const [qrisCountdown, setQrisCountdown] = useState(899); // 14m 59s

  // VA Modal State
  const [showVaModal, setShowVaModal] = useState(false);
  const [selectedBank, setSelectedBank] = useState<"bca" | "mandiri" | "bri" | "bni">("bca");
  const [generatedVa, setGeneratedVa] = useState("");
  const [copiedVa, setCopiedVa] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Top Up Modal State (if wallet balance is insufficient)
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Financial calculations
  const baseTotal = 510000;
  const discount = couponApplied ? 40000 : 0;
  const finalTotal = baseTotal - discount;

  // Sync wallet balance on mount
  useEffect(() => {
    setWalletBalance(dbStore.getCustomerBalance());
  }, []);

  // Generate dynamic random VA when opening VA or changing bank
  useEffect(() => {
    const bankInfo = BANK_VAS[selectedBank];
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000).toString();
    const formatted = `${bankInfo.prefix} ${randomSuffix.slice(0, 4)} ${randomSuffix.slice(4, 8)}`;
    setGeneratedVa(formatted);
  }, [selectedBank, showVaModal]);

  // Countdown timer for QRIS
  useEffect(() => {
    if (!showQrisModal) return;
    const interval = setInterval(() => {
      setQrisCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [showQrisModal]);

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyVa = () => {
    navigator.clipboard?.writeText(generatedVa.replace(/\s/g, ""));
    setCopiedVa(true);
    setTimeout(() => setCopiedVa(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard?.writeText(finalTotal.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  // Main pay button click: branches into appropriate modal / flow
  const handleInitiatePayment = () => {
    if (paymentMethod === "qris") {
      setShowQrisModal(true);
    } else if (paymentMethod === "va") {
      setShowVaModal(true);
    } else if (paymentMethod === "wallet") {
      setPin("");
      setPinError("");
      setShowPinModal(true);
    } else if (paymentMethod === "cc") {
      executeCompletePayment("cc");
    }
  };

  // Final execution & Supabase sync
  const executeCompletePayment = async (
    method: "wallet" | "qris" | "va" | "cc",
    enteredPin?: string,
    vaNum?: string
  ) => {
    setLoading(true);
    setPinError("");

    try {
      const res = await PaymentController.processPayment({
        orderId,
        amount: finalTotal,
        paymentMethod: method,
        vaNumber: vaNum || generatedVa,
        pin: enteredPin,
      });

      if (!res.success) {
        setPinError(res.message);
        setLoading(false);
        return;
      }

      // Also call server API route for redundant background persistence
      fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          amount: finalTotal,
          method: method.toUpperCase(),
          vaNumber: vaNum || generatedVa,
          qrisUrl: "/images/qris-servisin.jpg",
          status: "SETTLEMENT",
        }),
      }).catch(console.error);

      // Update local wallet state if wallet was used
      if (res.newBalance !== undefined) {
        setWalletBalance(res.newBalance);
      }

      setLoading(false);
      setShowPinModal(false);
      setShowQrisModal(false);
      setShowVaModal(false);
      setPaidSuccess(true);
    } catch (err: any) {
      setLoading(false);
      setPinError(err.message || "Gagal memproses pembayaran");
    }
  };

  const handleWalletPinSubmit = () => {
    if (pin.length !== 6) {
      setPinError("Masukkan 6 digit PIN akun Anda.");
      return;
    }
    executeCompletePayment("wallet", pin);
  };

  const handleTopUpConfirm = () => {
    const updated = dbStore.topUpCustomerWallet(topUpAmount, "Top Up Instan");
    setWalletBalance(updated);
    setTopUpSuccess(true);
    setTimeout(() => {
      setTopUpSuccess(false);
      setShowTopUpModal(false);
    }, 1500);
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="Pembayaran Servis" />

      {/* Main Responsive Grid Layout */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 pb-20">
        <div className="flex flex-col lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: Order Details, Itemized Costs, Voucher, QC (Span 7)          */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-7 flex flex-col gap-4">
            {/* Order Selesai Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3.5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-label-sm text-xs font-bold text-tertiary">
                    <span>ORDER SELESAI</span>
                    <span>•</span>
                    <span className="text-on-surface-variant">#{orderId}</span>
                  </div>
                  <h2 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface mt-1">
                    Toyota Avanza Veloz 1.5 MT
                  </h2>
                  <p className="font-body-sm text-xs text-on-surface-variant">
                    Servis Berkala &amp; Tune Up Rutin • Jl. Sudirman No. 42
                  </p>
                </div>

                <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed flex items-center justify-center text-tertiary shadow-sm flex-shrink-0">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                    verified
                  </span>
                </div>
              </div>

              {/* Mechanic verification strip */}
              <div className="bg-surface-container-low rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                    alt="Mekanik"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-tertiary"
                  />
                  <div className="flex flex-col">
                    <span className="font-label-md text-sm font-bold text-on-surface">
                      Bambang Susanto (BNSP Level 3)
                    </span>
                    <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      Pengerjaan Selesai &amp; Terverifikasi QC
                    </span>
                  </div>
                </div>
                <span className="text-xs text-on-surface-variant font-mono font-medium">14:25 WIB</span>
              </div>
            </div>

            {/* Rincian Biaya Transparan */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-surface-container-high/60">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
                    receipt_long
                  </span>
                  <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                    Rincian Biaya Transparan
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-xs font-bold">
                  100% Terbuka
                </span>
              </div>

              <div className="space-y-2.5 text-xs md:text-sm text-on-surface-variant">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                      engineering
                    </span>
                    Jasa Montir Standar BNSP (Tune Up)
                  </span>
                  <span className="font-semibold text-on-surface">Rp 120.000</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                      oil_barrel
                    </span>
                    Oli Mesin Full Synthetic Shell 4L
                  </span>
                  <span className="font-semibold text-on-surface">Rp 280.000</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                      filter_alt
                    </span>
                    Filter Oli OEM Toyota Asli
                  </span>
                  <span className="font-semibold text-on-surface">Rp 45.000</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                      tune
                    </span>
                    Pembersihan Throttle Body &amp; Busi
                  </span>
                  <span className="font-semibold text-on-surface">Rp 60.000</span>
                </div>

                {couponApplied && (
                  <div className="flex items-center justify-between text-tertiary font-semibold pt-1 border-t border-surface-container-high/40">
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        local_offer
                      </span>
                      Diskon Kupon ROADSIDECARE40
                    </span>
                    <span>-Rp 40.000</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/40">
                  <span className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                      verified_user
                    </span>
                    Biaya Layanan &amp; Asuransi Servis 30 Hari
                  </span>
                  <span className="font-semibold text-on-surface">Rp 5.000</span>
                </div>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="bg-surface-container-lowest rounded-3xl p-4 md:p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 font-label-md text-xs md:text-sm font-bold text-on-surface">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
                  confirmation_number
                </span>
                <span>Voucher &amp; Kupon Servis</span>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-3 text-on-surface-variant">
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      sell
                    </span>
                  </span>
                  <input
                    type="text"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                    placeholder="Masukkan kode promo"
                    className="w-full h-11 pl-9 pr-3 bg-surface-container-low rounded-xl text-on-surface font-mono font-bold text-xs uppercase focus:outline-none focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCouponApplied(true)}
                  className="px-5 h-11 bg-secondary text-on-secondary rounded-xl font-label-md text-xs font-bold hover:brightness-105 active:scale-95 transition-all"
                >
                  Terapkan
                </button>
              </div>

              {couponApplied && (
                <span className="text-xs text-tertiary font-semibold flex items-center gap-1.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    check_circle
                  </span>
                  Kupon ROADSIDECARE40 aktif (Hemat Rp 40.000)
                </span>
              )}
            </div>

            {/* QC Inspection Passed Preview */}
            <div className="relative rounded-3xl overflow-hidden h-40 shadow-sm border border-surface-container-high/60">
              <img
                src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80"
                alt="QC Inspection"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end justify-between p-4 text-white">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                  <div>
                    <span className="text-xs md:text-sm font-bold block">
                      QC Multi-point Inspection Passed (24/24)
                    </span>
                    <span className="text-[11px] text-white/80">
                      Tekanan oli, kekencangan baut roda, busi &amp; filter lolos uji
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Menampilkan dokumentasi foto suku cadang & spidometer.")}
                  className="text-xs underline font-semibold text-white/90 hover:text-white"
                >
                  Lihat Foto QC
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: Total Summary & Payment Methods (Span 5 on Desktop, Sticky)  */}
          {/* ========================================================================= */}
          <div className="w-full lg:col-span-5 flex flex-col gap-4 mt-4 lg:mt-0 lg:sticky lg:top-20">
            {/* Total tagihan card */}
            <div className="bg-gradient-to-br from-surface-container-lowest to-surface-container-low rounded-3xl p-5 shadow-sm border border-surface-container-high/70 flex flex-col gap-2">
              <span className="font-label-sm text-xs uppercase font-bold text-on-surface-variant block">
                TOTAL TAGIHAN BERSIH
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-lg text-3xl font-black text-primary">
                  Rp {finalTotal.toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  Garansi 30 Hari Aktif
                </span>
              </div>
              <span className="text-xs text-on-surface-variant mt-1">
                Termasuk PPN 11%, jasa mekanik BNSP, dan suku cadang asli.
              </span>
            </div>

            {/* Metode Pembayaran Options */}
            <div className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2 font-label-md text-sm font-bold text-on-surface">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                    payments
                  </span>
                  <span>Metode Pembayaran</span>
                </div>
                <span className="text-xs text-on-surface-variant">4 Pilihan</span>
              </div>

              {/* 1. ServisIn Wallet */}
              <div
                onClick={() => setPaymentMethod("wallet")}
                className={`p-3.5 rounded-2xl border cursor-pointer flex flex-col gap-2 transition-all ${
                  paymentMethod === "wallet"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center shadow-sm">
                      <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                        account_balance_wallet
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-label-md text-xs font-bold text-on-surface">
                          ServisIn Wallet
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary font-bold text-[9px]">
                          PIN VERIFIED
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant">
                        Saldo:{" "}
                        <strong className={walletBalance >= finalTotal ? "text-tertiary" : "text-error"}>
                          Rp {walletBalance.toLocaleString("id-ID")}
                        </strong>{" "}
                        ({walletBalance >= finalTotal ? "Cukup" : "Kurang"})
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment"
                    value="wallet"
                    checked={paymentMethod === "wallet"}
                    onChange={() => setPaymentMethod("wallet")}
                    className="w-5 h-5 accent-secondary"
                  />
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/40 text-[11px]">
                  <span className="text-on-surface-variant">PIN keamanan 6 digit (Default: 123456)</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTopUpModal(true);
                    }}
                    className="text-secondary font-bold hover:underline flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      add_circle
                    </span>
                    Top Up
                  </button>
                </div>
              </div>

              {/* 2. QRIS Instan */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "qris"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      qr_code_2
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-xs font-bold text-on-surface block">
                        QRIS Instan ServisIn
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-tertiary-fixed text-tertiary font-bold text-[9px]">
                        ASPI / GPN
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant">
                      Scan via GoPay, BCA, Mandiri, OVO, Dana
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="qris"
                  checked={paymentMethod === "qris"}
                  onChange={() => setPaymentMethod("qris")}
                  className="w-5 h-5 accent-secondary"
                />
              </label>

              {/* 3. Virtual Account */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "va"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      account_balance
                    </span>
                  </div>
                  <div>
                    <span className="font-label-md text-xs font-bold text-on-surface block">
                      Virtual Account Bank
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      BCA, Mandiri, BRI, BNI (Nomor VA Acak)
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="va"
                  checked={paymentMethod === "va"}
                  onChange={() => setPaymentMethod("va")}
                  className="w-5 h-5 accent-secondary"
                />
              </label>

              {/* 4. Kartu Kredit */}
              <label
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                  paymentMethod === "cc"
                    ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
                    : "bg-surface-container-lowest border-surface-container-high/60 hover:bg-surface-container-low"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface shadow-sm">
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      credit_card
                    </span>
                  </div>
                  <div>
                    <span className="font-label-md text-xs font-bold text-on-surface block">
                      Kartu Kredit / Debit Online
                    </span>
                    <span className="text-[11px] text-on-surface-variant">
                      Visa, Mastercard, JCB (3D Secure)
                    </span>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  value="cc"
                  checked={paymentMethod === "cc"}
                  onChange={() => setPaymentMethod("cc")}
                  className="w-5 h-5 accent-secondary"
                />
              </label>
            </div>

            {/* Submit Pay CTA */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleInitiatePayment}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary text-on-primary font-headline-sm text-base md:text-lg font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all hover:brightness-105 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                      lock
                    </span>
                    <span>
                      {paymentMethod === "qris"
                        ? "Tampilkan QRIS ServisIn"
                        : paymentMethod === "va"
                        ? "Lihat Virtual Account"
                        : paymentMethod === "wallet"
                        ? "Bayar via Wallet (PIN)"
                        : "Bayar Sekarang"}{" "}
                      • Rp {finalTotal.toLocaleString("id-ID")}
                    </span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-on-surface-variant font-medium text-center">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
                  lock
                </span>
                <span>Tersinkronisasi ke Database Supabase &amp; Enkripsi 256-bit</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. QRIS MODAL WITH UPLOADED SERVISIN QRIS IMAGE                           */}
      {/* ========================================================================= */}
      {showQrisModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-5 shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 22 }}>
                  qr_code_2
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  QRIS ServisIn Resmi
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            {/* Countdown Strip */}
            <div className="w-full bg-surface-container-low rounded-xl px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-on-surface-variant">Selesaikan dalam:</span>
              <span className="font-mono font-bold text-xs text-primary-container flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  schedule
                </span>
                {formatCountdown(qrisCountdown)}
              </span>
            </div>

            {/* Uploaded QRIS Image Display */}
            <div className="w-full bg-white rounded-2xl p-3 border-2 border-primary-container/30 shadow-inner flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[3/4.2] rounded-xl overflow-hidden shadow-sm border border-neutral-200">
                <img
                  src="/images/qris-servisin.jpg"
                  alt="QRIS ServisIn"
                  className="w-full h-full object-contain bg-white"
                />
              </div>

              <div className="mt-2 text-center">
                <span className="font-bold text-xs text-neutral-900 block">
                  SERVISIN INDONESIA
                </span>
                <span className="text-[10px] text-neutral-500 font-mono">
                  NMID: ID1020038472910 • A01
                </span>
              </div>
            </div>

            {/* Amount confirmation card */}
            <div className="w-full bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                  TOTAL TAGIHAN
                </span>
                <span className="font-headline-md text-base font-bold text-primary">
                  Rp {finalTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyAmount}
                className="text-[11px] font-bold text-secondary bg-surface-container px-2.5 py-1.5 rounded-lg hover:brightness-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  content_copy
                </span>
                {copiedAmount ? "Tersalin!" : "Salin"}
              </button>
            </div>

            {/* Instructions */}
            <div className="w-full text-left text-[11px] text-on-surface-variant bg-surface-container-low/70 rounded-xl p-2.5 space-y-1">
              <p className="font-bold text-on-surface text-[11px]">Cara Pembayaran:</p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Buka m-Banking (BCA, Mandiri, BRI, BNI) atau e-Wallet (GoPay, OVO, Dana).</li>
                <li>Pilih menu <strong>Scan / Bayar QRIS</strong>.</li>
                <li>Arahkan kamera ke kode QRIS di atas.</li>
                <li>Periksa nominal tagihan Rp {finalTotal.toLocaleString("id-ID")}, masukkan PIN Anda.</li>
              </ol>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => executeCompletePayment("qris")}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-tertiary text-on-tertiary font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      check_circle
                    </span>
                    <span>Saya Sudah Bayar</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowQrisModal(false)}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant font-label-md font-semibold text-xs hover:bg-surface-container-high"
              >
                Ganti Metode Lain
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIRTUAL ACCOUNT MODAL WITH DYNAMIC RANDOM VA NUMBERS                   */}
      {/* ========================================================================= */}
      {showVaModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container-high/60">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                  account_balance
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  Transfer Virtual Account
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowVaModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            {/* Bank Selection Tabs */}
            <div className="grid grid-cols-4 gap-1.5 bg-surface-container-low p-1 rounded-xl">
              {(["bca", "mandiri", "bri", "bni"] as const).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setSelectedBank(b)}
                  className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                    selectedBank === b
                      ? "bg-secondary text-on-secondary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {BANK_VAS[b].bank}
                </button>
              ))}
            </div>

            {/* VA Number Display Card */}
            <div className="bg-surface-container-low rounded-2xl p-4 border border-surface-container-high flex flex-col gap-2">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                NOMOR VIRTUAL ACCOUNT ({BANK_VAS[selectedBank].name})
              </span>

              <div className="flex items-center justify-between bg-surface-container-lowest rounded-xl p-3 border border-surface-container-high">
                <span className="font-mono text-base font-bold text-on-surface tracking-wider">
                  {generatedVa}
                </span>
                <button
                  type="button"
                  onClick={handleCopyVa}
                  className="px-2.5 py-1.5 rounded-lg bg-secondary text-on-secondary font-label-sm text-xs font-bold flex items-center gap-1 hover:brightness-105"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    content_copy
                  </span>
                  {copiedVa ? "Tersalin!" : "Salin"}
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-1">
                <span>Atas Nama:</span>
                <strong className="text-on-surface font-semibold">ServisIn - Order #{orderId}</strong>
              </div>
            </div>

            {/* Amount Card */}
            <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                  TOTAL TRANSFER TEPAT
                </span>
                <span className="font-headline-md text-base font-bold text-primary">
                  Rp {finalTotal.toLocaleString("id-ID")}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyAmount}
                className="text-[11px] font-bold text-secondary bg-surface-container px-2.5 py-1.5 rounded-lg hover:brightness-95 flex items-center gap-1"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                  content_copy
                </span>
                {copiedAmount ? "Tersalin!" : "Salin"}
              </button>
            </div>

            {/* Step-by-step instructions */}
            <div className="text-[11px] text-on-surface-variant bg-surface-container-low/70 rounded-xl p-3 space-y-1">
              <p className="font-bold text-on-surface text-[11px]">
                Petunjuk Transfer {BANK_VAS[selectedBank].bank}:
              </p>
              <ol className="list-decimal pl-4 space-y-0.5">
                <li>Buka aplikasi Mobile Banking atau ATM {BANK_VAS[selectedBank].bank}.</li>
                <li>Pilih menu <strong>Transfer &gt; Virtual Account</strong>.</li>
                <li>Masukkan nomor VA <strong>{generatedVa.replace(/\s/g, "")}</strong>.</li>
                <li>Periksa detail pembayaran dan konfirmasi transaksi.</li>
              </ol>
            </div>

            {/* Action CTA */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                type="button"
                onClick={() => executeCompletePayment("va", undefined, generatedVa)}
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary text-on-primary font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      sync
                    </span>
                    <span>Saya Sudah Transfer (Cek Otomatis)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowVaModal(false)}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant font-label-md font-semibold text-xs hover:bg-surface-container-high"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SERVISIN WALLET 6-DIGIT PIN VERIFICATION MODAL                         */}
      {/* ========================================================================= */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-secondary text-on-secondary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                shield_lock
              </span>
            </div>

            <div className="text-center">
              <h3 className="font-headline-sm text-lg font-bold text-on-surface">
                Masukkan PIN ServisIn Wallet
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                Otorisasi pembayaran Rp {finalTotal.toLocaleString("id-ID")}
              </p>
            </div>

            {/* Wallet Balance check */}
            {walletBalance < finalTotal ? (
              <div className="w-full bg-error-container/40 border border-error/40 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-error font-bold text-xs">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    error
                  </span>
                  <span>Saldo Wallet Tidak Mencukupi!</span>
                </div>
                <div className="text-[11px] text-on-surface-variant flex justify-between">
                  <span>Saldo Saat Ini:</span>
                  <span className="font-bold text-on-surface">Rp {walletBalance.toLocaleString("id-ID")}</span>
                </div>
                <div className="text-[11px] text-on-surface-variant flex justify-between">
                  <span>Tagihan:</span>
                  <span className="font-bold text-error">Rp {finalTotal.toLocaleString("id-ID")}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPinModal(false);
                    setShowTopUpModal(true);
                  }}
                  className="w-full mt-1 h-9 rounded-lg bg-secondary text-on-secondary font-bold text-xs hover:brightness-105 flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    add_circle
                  </span>
                  Top Up Saldo Sekarang
                </button>
              </div>
            ) : (
              <>
                {/* 6 Digit PIN Input */}
                <div className="w-full flex flex-col items-center gap-2">
                  <div className="flex justify-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((idx) => (
                      <div
                        key={idx}
                        className={`w-11 h-12 rounded-xl border flex items-center justify-center font-mono text-xl font-bold transition-all ${
                          pin[idx]
                            ? "bg-secondary-fixed/50 border-secondary text-secondary ring-2 ring-secondary/20"
                            : "bg-surface-container-low border-surface-container-high text-on-surface"
                        }`}
                      >
                        {pin[idx] ? "●" : ""}
                      </div>
                    ))}
                  </div>

                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setPin(val);
                      if (val.length === 6) setPinError("");
                    }}
                    autoFocus
                    placeholder="Ketik 6 digit PIN"
                    className="w-full h-10 mt-1 text-center bg-surface-container-low rounded-xl text-on-surface font-mono font-bold text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-secondary"
                  />

                  <div className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      info
                    </span>
                    <span>PIN Demo: <strong>123456</strong></span>
                  </div>

                  {pinError && (
                    <span className="text-xs text-error font-semibold flex items-center gap-1 text-center">
                      <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                        warning
                      </span>
                      {pinError}
                    </span>
                  )}
                </div>

                {/* Confirm and cancel */}
                <div className="w-full flex flex-col gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleWalletPinSubmit}
                    disabled={loading || pin.length !== 6}
                    className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                          check
                        </span>
                        <span>Konfirmasi Pembayaran</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant font-label-md font-semibold text-xs hover:bg-surface-container-high"
                  >
                    Batal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TOP UP WALLET MODAL                                                    */}
      {/* ========================================================================= */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-5 shadow-2xl flex flex-col gap-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-surface-container-high">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                  add_card
                </span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  Top Up ServisIn Wallet
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowTopUpModal(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  close
                </span>
              </button>
            </div>

            <div className="bg-surface-container-low rounded-xl p-3 flex justify-between items-center text-xs">
              <span className="text-on-surface-variant">Saldo saat ini:</span>
              <strong className="text-on-surface font-bold">Rp {walletBalance.toLocaleString("id-ID")}</strong>
            </div>

            <span className="text-xs font-bold text-on-surface">Pilih Nominal:</span>
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

            <div className="mt-1">
              <span className="text-[11px] text-on-surface-variant font-medium block mb-1">
                Atau nominal lain:
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

            {topUpSuccess && (
              <div className="p-2 rounded-xl bg-tertiary-fixed text-tertiary text-xs font-bold flex items-center gap-1.5 justify-center">
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  check_circle
                </span>
                <span>Top Up Berhasil! Saldo Diperbarui.</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleTopUpConfirm}
              className="w-full mt-2 h-11 rounded-xl bg-secondary text-on-secondary font-label-md font-bold hover:brightness-105 flex items-center justify-center gap-2 shadow-md"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                check
              </span>
              <span>Konfirmasi Top Up Rp {topUpAmount.toLocaleString("id-ID")}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUCCESS MODAL (SYNCED WITH SUPABASE)                                    */}
      {/* ========================================================================= */}
      {paidSuccess && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-tertiary-fixed text-tertiary flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                verified
              </span>
            </div>
            <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
              Pembayaran Berhasil!
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
              Tagihan senilai <strong>Rp {finalTotal.toLocaleString("id-ID")}</strong> telah lunas via{" "}
              {paymentMethod.toUpperCase()}.
            </p>

            <div className="w-full bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-left text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                  database
                </span>
                <div>
                  <span className="font-bold text-on-surface block text-[11px]">
                    Status Database Supabase
                  </span>
                  <span className="text-[10px] text-tertiary font-semibold">
                    Tersimpan • ServiceOrder #PAID
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-tertiary/15 text-tertiary font-mono text-[10px] font-bold">
                SETTLEMENT
              </span>
            </div>

            <div className="w-full bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Sisa Saldo Wallet:</span>
              <span className="font-bold text-on-surface font-mono">
                Rp {walletBalance.toLocaleString("id-ID")}
              </span>
            </div>

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

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
