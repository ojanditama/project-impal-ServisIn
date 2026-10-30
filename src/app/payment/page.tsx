"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentController } from "@/controllers/PaymentController";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") || "SRV-8942";

  const [paymentMethod, setPaymentMethod] = useState("wallet");
  const [coupon, setCoupon] = useState("ROADSIDECARE40");
  const [couponApplied, setCouponApplied] = useState(true);
  const [loading, setLoading] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const baseTotal = 510000;
  const discount = couponApplied ? 40000 : 0;
  const finalTotal = baseTotal - discount;

  const handlePay = () => {
    setLoading(true);

    setTimeout(() => {
      PaymentController.requestMidtransPayment(orderId, paymentMethod);
      PaymentController.handleWebhookCallback(orderId, "settlement");
      setLoading(false);
      setPaidSuccess(true);
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
          Pembayaran Servis &amp; Billing
        </h1>

        <Link href="/premium" className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-container/30">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      {/* Order Selesai Card */}
      <div className="mt-2 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-label-sm text-[10px] font-bold text-tertiary">
              <span>ORDER SELESAI</span>
              <span>•</span>
              <span className="text-on-surface-variant">#{orderId}</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
              Avanza Veloz 1.5 MT
            </h2>
            <p className="font-body-sm text-[11px] text-on-surface-variant">
              Servis Berkala &amp; Tune Up Rutin
            </p>
          </div>

          <div className="w-10 h-10 rounded-xl bg-tertiary-fixed flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              verified
            </span>
          </div>
        </div>

        {/* Mechanic verification strip */}
        <div className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
              alt="Mekanik"
              className="w-9 h-9 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-bold text-on-surface">
                Bambang Susanto (BNSP Level 3)
              </span>
              <span className="text-[10px] text-tertiary font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                Pengerjaan Selesai &amp; Terverifikasi
              </span>
            </div>
          </div>
          <span className="text-[10px] text-on-surface-variant font-mono">14:25 WIB</span>
        </div>
      </div>

      {/* Rincian Biaya Transparan */}
      <div className="mt-4 bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              receipt_long
            </span>
            <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Rincian Biaya Transparan
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
            100% Terbuka
          </span>
        </div>

        <div className="space-y-2 text-xs text-on-surface-variant">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                engineering
              </span>
              Jasa Montir Standar BNSP
            </span>
            <span className="font-semibold text-on-surface">Rp 120.000</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                oil_barrel
              </span>
              Oli Mesin Full Synthetic 4L
            </span>
            <span className="font-semibold text-on-surface">Rp 280.000</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                filter_alt
              </span>
              Filter Oli OEM Toyota
            </span>
            <span className="font-semibold text-on-surface">Rp 45.000</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                tune
              </span>
              Pembersihan Throttle Body &amp; Busi
            </span>
            <span className="font-semibold text-on-surface">Rp 60.000</span>
          </div>

          {couponApplied && (
            <div className="flex items-center justify-between text-tertiary font-semibold">
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  local_offer
                </span>
                Diskon Promo Roadside
              </span>
              <span>-Rp 40.000</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                verified_user
              </span>
              Biaya Layanan &amp; Asuransi 30 Hari
            </span>
            <span className="font-semibold text-on-surface">Rp 5.000</span>
          </div>
        </div>

        {/* Total tagihan */}
        <div className="mt-1 bg-surface-container-low rounded-xl p-3 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-[10px] uppercase font-bold text-on-surface-variant block">
              TOTAL TAGIHAN BERSIH
            </span>
            <span className="text-[10px] text-tertiary font-semibold">
              Termasuk PPN &amp; Garansi Layanan
            </span>
          </div>
          <span className="font-headline-lg text-headline-lg font-bold text-primary">
            Rp {finalTotal.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Voucher Input */}
      <div className="mt-4 bg-surface-container-lowest rounded-2xl p-3.5 shadow-sm border border-surface-container-high/60 flex flex-col gap-2">
        <div className="flex items-center gap-2 font-label-md text-label-md font-bold text-on-surface">
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
            className="px-4 h-11 bg-secondary text-on-secondary rounded-xl font-label-md text-label-md font-bold hover:brightness-105"
          >
            Terapkan
          </button>
        </div>

        {couponApplied && (
          <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              check_circle
            </span>
            Kupon ROADSIDECARE40 aktif (Hemat Rp 40.000)
          </span>
        )}
      </div>

      {/* Metode Pembayaran (4 Options) */}
      <div className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-label-md text-label-md font-bold text-on-surface">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
              payments
            </span>
            <span>Metode Pembayaran</span>
          </div>
          <span className="text-xs text-on-surface-variant">4 Pilihan</span>
        </div>

        {/* 1. ServisIn Wallet */}
        <label
          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
            paymentMethod === "wallet"
              ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                account_balance_wallet
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-label-md text-label-md font-bold text-on-surface">
                  ServisIn Wallet
                </span>
                <span className="px-1.5 py-0.2 rounded bg-primary-container text-on-primary font-bold text-[9px]">
                  REKOMENDASI
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant">
                Saldo aktif: <strong className="text-tertiary">Rp 650.000 (Cukup)</strong>
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
        </label>

        {/* 2. QRIS Instan */}
        <label
          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
            paymentMethod === "qris"
              ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                qr_code_2
              </span>
            </div>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
                QRIS Instan
              </span>
              <span className="text-[11px] text-on-surface-variant">
                GoPay, OVO, DANA, ShopeePay, LinkAja
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
          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
            paymentMethod === "va"
              ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                account_balance
              </span>
            </div>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
                Virtual Account Bank
              </span>
              <span className="text-[11px] text-on-surface-variant">
                BCA, Mandiri, BRI, BNI (Otomatis Verifikasi)
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

        {/* 4. Kartu Kredit / Debit */}
        <label
          className={`p-3 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
            paymentMethod === "cc"
              ? "bg-secondary-fixed/50 border-secondary ring-2 ring-secondary/20 shadow-sm"
              : "bg-surface-container-lowest border-surface-container-high/60"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                credit_card
              </span>
            </div>
            <div>
              <span className="font-label-md text-label-md font-bold text-on-surface block">
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

      {/* QC Inspection Passed Preview */}
      <div className="mt-4 relative rounded-2xl overflow-hidden h-36 shadow-sm border border-surface-container-high/60">
        <img
          src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"
          alt="QC Inspection"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold">
              ✓
            </span>
            <span className="text-xs font-bold">
              QC Multi-point Inspection Passed (24/24)
            </span>
          </div>
          <button
            type="button"
            onClick={() => alert("Menampilkan dokumentasi foto suku cadang & spidometer.")}
            className="text-[11px] underline font-semibold text-white/90 hover:text-white"
          >
            Lihat Foto QC
          </button>
        </div>
      </div>

      {/* Submit Pay CTA */}
      <div className="mt-5">
        <button
          onClick={handlePay}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all hover:brightness-105 disabled:opacity-70"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                lock
              </span>
              <span>Bayar Sekarang • Rp {finalTotal.toLocaleString()}</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11px] text-on-surface-variant font-medium">
          <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
            lock
          </span>
          <span>Pembayaran aman dengan enkripsi bank 256-bit</span>
        </div>
      </div>

      {/* Success Modal */}
      {paidSuccess && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
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
              Tagihan senilai <strong>Rp {finalTotal.toLocaleString()}</strong> telah lunas via{" "}
              {paymentMethod.toUpperCase()}. Garansi ServisIn 30 hari resmi aktif di akun Anda.
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

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
