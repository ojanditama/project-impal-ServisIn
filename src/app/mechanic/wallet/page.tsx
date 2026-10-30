"use client";

import { useState } from "react";
import Link from "next/link";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";

export default function MechanicWalletPage() {
  const [showBalance, setShowBalance] = useState(true);
  const [filter, setFilter] = useState<"all" | "completed" | "payout">("all");
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("500000");
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [balance, setBalance] = useState(1485000);

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(payoutAmount);
    if (amount > balance) {
      alert("Saldo tidak mencukupi");
      return;
    }
    setBalance((prev) => prev - amount);
    setIsPayoutModalOpen(false);
    setPayoutSuccess(true);
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

      {/* Profile Bar */}
      <div className="px-4 pt-3">
        <div className="bg-surface-container-lowest rounded-2xl p-3 border border-surface-container-high/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Bambang"
                className="w-11 h-11 rounded-full object-cover"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-tertiary text-white flex items-center justify-center text-[9px]">
                ✓
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-label-lg text-label-lg font-bold text-on-surface">
                  Bambang S.
                </h2>
                <span className="text-tertiary text-xs">✓</span>
              </div>
              <span className="text-[11px] text-on-surface-variant font-mono">
                ID Mitra: #SVI-8842 • Bengkel Keliling
              </span>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-primary-container text-white font-bold text-[10px] shadow-sm flex items-center gap-1">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
              workspace_premium
            </span>
            Senior Tech
          </span>
        </div>
      </div>

      {/* Dompet Saldo Utama Card (Dark Luxury) */}
      <div className="px-4 pt-3">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-5 text-white shadow-xl border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  account_balance_wallet
                </span>
              </div>
              <span className="font-label-sm text-[11px] uppercase tracking-wider text-slate-300 font-bold">
                DOMPET SALDO UTAMA
              </span>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 font-bold text-[9px] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Proteksi Garansi
            </span>
          </div>

          {/* Saldo amount with eye toggle */}
          <div className="mt-3">
            <span className="text-[11px] text-slate-400 block font-medium">Saldo Siap Ditarik</span>
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="font-headline-lg text-headline-lg font-black tracking-tight text-white">
                {showBalance ? `Rp ${balance.toLocaleString()}` : "••••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowBalance(!showBalance)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  {showBalance ? "visibility" : "visibility_off"}
                </span>
              </button>
            </div>
          </div>

          {/* Escrow pill */}
          <div className="mt-3 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="material-symbols-outlined text-amber-400" style={{ fontSize: 16 }}>
                lock_clock
              </span>
              Dalam Pengerjaan (ESCROW)
            </span>
            <span className="font-bold text-amber-300 font-mono">Rp 165.000</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              type="button"
              onClick={() => setIsPayoutModalOpen(true)}
              className="h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 shadow-lg hover:brightness-105 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                payments
              </span>
              <span>Tarik Dana</span>
            </button>

            <button
              type="button"
              onClick={() => alert("Mengunduh laporan rekap fee mingguan PDF...")}
              className="h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-label-md text-label-md font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                receipt
              </span>
              <span>Laporan</span>
            </button>
          </div>

          {/* Bank destination */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                account_balance
              </span>
              BCA •••• 8291 (Bambang S.)
            </span>
            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
              ⚡ Payout Instan 2 Menit
            </span>
          </div>
        </div>
      </div>

      {/* Performa & Insentif */}
      <div className="px-4 pt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              trending_up
            </span>
            <span>Performa &amp; Insentif</span>
          </div>
          <span className="text-xs text-on-surface-variant">Bulan Berjalan</span>
        </div>

        {/* Target harian bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-3.5 border border-surface-container-high/60 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                TARGET HARIAN
              </span>
              <span className="font-label-lg text-label-lg font-bold text-on-surface">
                4 dari 5 Order Selesai
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              +Rp 50.000
            </span>
          </div>

          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full w-4/5"></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="text-tertiary font-semibold">✓ 80% Tercapai</span>
            <span>Tinggal 1 order lagi hari ini!</span>
          </div>
        </div>

        {/* 2-col Metrics */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium">Kepuasan Pelanggan</span>
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 18 }}>
                star
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface block mt-1">
              4.92<span className="text-xs font-normal text-on-surface-variant">/5.0</span>
            </span>
            <span className="text-[10px] text-on-surface-variant block">438 ulasan bintang lima</span>
            <span className="px-1.5 py-0.2 mt-1.5 rounded bg-tertiary-fixed text-tertiary font-bold text-[9px] inline-block">
              0 komplain 7 hari
            </span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-on-surface-variant font-medium">Lisensi Resmi</span>
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                verified
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold text-on-surface block mt-1">
              BNSP Otomotif
            </span>
            <span className="text-[10px] text-on-surface-variant block">Level IV • Senior</span>
            <span className="px-1.5 py-0.2 mt-1.5 rounded bg-secondary-fixed text-secondary font-bold text-[9px] inline-block">
              Terakreditasi
            </span>
          </div>
        </div>
      </div>

      {/* Armada & Toolkit Standar BNSP */}
      <div className="px-4 pt-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              home_repair_service
            </span>
            <span>Armada &amp; Toolkit Standar BNSP</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            Siap Tanggap
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="relative rounded-2xl overflow-hidden h-28 shadow-sm border border-surface-container-high/60">
            <img
              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80"
              alt="Toolkit"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 text-white">
              <span className="text-xs font-bold">Jumper &amp; Scanner Pro</span>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden h-28 shadow-sm border border-surface-container-high/60">
            <img
              src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=400&q=80"
              alt="Motor Reaksi Cepat"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 text-white">
              <span className="text-xs font-bold">Unit Reaksi Cepat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Aktivitas Transaksi */}
      <div className="px-4 pt-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 20 }}>
              history
            </span>
            <span>Aktivitas Transaksi</span>
          </div>
          <button
            type="button"
            onClick={() => alert("Menampilkan semua riwayat transaksi.")}
            className="text-xs text-secondary font-bold hover:underline"
          >
            Lihat Semua
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 text-xs">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              filter === "all"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            Semua (28)
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              filter === "completed"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            Order Selesai
          </button>
          <button
            type="button"
            onClick={() => setFilter("payout")}
            className={`px-3 py-1.5 rounded-full font-bold transition-all ${
              filter === "payout"
                ? "bg-primary text-on-primary shadow-sm"
                : "bg-surface-container-low text-on-surface"
            }`}
          >
            Pencairan Dana
          </button>
        </div>

        {/* Transactions list */}
        <div className="flex flex-col gap-2">
          {/* Item 1 */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  bolt
                </span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Jumper Aki Darurat
                </h4>
                <span className="text-[11px] text-on-surface-variant block">
                  Toyota Innova • Hari ini, 11:20 WIB
                </span>
                <span className="text-[10px] text-tertiary font-semibold">✓ Sukses Ditarik</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-sm text-sm font-bold text-tertiary block">
                +Rp 165.000
              </span>
              <span className="text-[10px] text-on-surface-variant">Fee Bersih</span>
            </div>
          </div>

          {/* Item 2 */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  tune
                </span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Servis Berkala &amp; Tune-Up
                </h4>
                <span className="text-[11px] text-on-surface-variant block">
                  Avanza Veloz • Kemarin, 15:40 WIB
                </span>
                <span className="text-[10px] text-secondary font-semibold">✓ Selesai &amp; Dinilai ★5</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-sm text-sm font-bold text-tertiary block">
                +Rp 240.000
              </span>
              <span className="text-[10px] text-on-surface-variant">Fee Bersih</span>
            </div>
          </div>

          {/* Item 3 */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  tire_repair
                </span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Ganti Ban Tubeless Panggilan
                </h4>
                <span className="text-[11px] text-on-surface-variant block">
                  Honda Brio • Kemarin, 09:15 WIB
                </span>
                <span className="text-[10px] text-tertiary font-semibold">✓ Selesai</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-sm text-sm font-bold text-tertiary block">
                +Rp 80.000
              </span>
              <span className="text-[10px] text-on-surface-variant">Fee Bersih</span>
            </div>
          </div>

          {/* Item 4: Payout */}
          <div className="bg-surface-container-lowest p-3 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                  outbox
                </span>
              </div>
              <div>
                <h4 className="font-label-md text-label-md font-bold text-on-surface">
                  Tarik Saldo ke Rekening BCA
                </h4>
                <span className="text-[11px] text-on-surface-variant block">
                  Trx #WD-9942 • 2 hari lalu
                </span>
                <span className="text-[10px] text-tertiary font-semibold">✓ Berhasil Terkirim</span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-headline-sm text-sm font-bold text-on-surface block">
                -Rp 750.000
              </span>
              <span className="text-[10px] text-tertiary font-semibold">Bebas Admin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legalitas & Sertifikasi */}
      <div className="px-4 pt-4 pb-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-headline-sm text-headline-sm font-bold text-on-surface">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
              assignment_turned_in
            </span>
            <span>Legalitas &amp; Sertifikasi</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
            100% Sah
          </span>
        </div>

        <div className="flex flex-col gap-2 text-xs">
          <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                badge
              </span>
              <div>
                <span className="font-bold text-on-surface block">KTP Teknisi Indonesia</span>
                <span className="text-[10px] text-on-surface-variant">NIK terdaftar resmi Dukcapil</span>
              </div>
            </div>
            <span className="text-tertiary font-bold text-[11px]">✓ Terverifikasi</span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-xl border border-surface-container-high/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
              <div>
                <span className="font-bold text-on-surface block">Sertifikat Keahlian BNSP</span>
                <span className="text-[10px] text-on-surface-variant">Mekanik Roda 4 &amp; Kelistrikan</span>
              </div>
            </div>
            <span className="px-1.5 py-0.2 rounded bg-surface-container text-on-surface font-mono font-bold text-[10px]">
              s/d 2026
            </span>
          </div>
        </div>
      </div>

      {/* Payout Modal */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Tarik Saldo ke Rekening Bank
              </h3>
              <button
                onClick={() => setIsPayoutModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="flex flex-col gap-3">
              <div className="bg-surface-container-low p-3 rounded-xl text-xs">
                <span className="text-on-surface-variant block">Rekening Tujuan:</span>
                <span className="font-bold text-on-surface text-sm">
                  Bank Central Asia (BCA) - 829100293
                </span>
                <span className="text-[11px] text-slate-500 block">a.n. Bambang Sudiro</span>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Nominal Penarikan (Rp)
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  max={balance}
                  min={50000}
                  required
                  className="w-full h-12 px-3 bg-surface-container-low rounded-xl text-on-surface font-headline-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <span className="text-[11px] text-on-surface-variant block mt-1">
                  Maksimal saldo siap ditarik: Rp {balance.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:brightness-105"
              >
                Konfirmasi Penarikan Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payout Success Toast */}
      {payoutSuccess && (
        <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-emerald-400" style={{ fontSize: 24 }}>
              check_circle
            </span>
            <div className="text-xs">
              <strong className="block font-bold">Penarikan Berhasil Dikirim!</strong>
              <span>Dana telah masuk ke rekening BCA Anda secara instan.</span>
            </div>
          </div>
          <button onClick={() => setPayoutSuccess(false)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      <MechanicBottomNav />
    </div>
  );
}
