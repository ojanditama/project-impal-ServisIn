"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";

export default function MechanicProfilePage() {
  const router = useRouter();
  const mechanic = dbStore.users.find((u) => u.role === "Mechanic") || {
    name: "Bambang Sudiro",
    email: "bambang.sudiro@servisin.id",
    phone: "081377889900",
    rating: 4.92,
    avatarUrl:
      "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&h=200&q=80",
  };

  const wallet = dbStore.mechanicWallet;
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("servisin_auth_token");
      localStorage.removeItem("servisin_active_role");
    }
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col pb-20 md:pb-8 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      <div className="w-full max-w-2xl mx-auto p-4 md:px-8 md:py-6 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-3 border-b border-surface-container-high/60">
        <div className="flex items-center gap-2">
          <Link
            href="/mechanic/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Profil Mitra Mekanik
          </h1>
        </div>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          title="Keluar dari Akun"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            logout
          </span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="mt-3 bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col items-center text-center gap-2 relative">
        <div className="relative">
          <img
            src={mechanic.avatarUrl}
            alt={mechanic.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-container/40 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-tertiary text-white flex items-center justify-center text-xs font-bold ring-2 ring-surface">
            ✓
          </span>
        </div>

        <div>
          <h2 className="font-headline-md text-lg font-bold text-on-surface mt-1">
            {mechanic.name}
          </h2>
          <span className="text-xs text-on-surface-variant block mt-0.5">
            {mechanic.phone} • {mechanic.email}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[11px] shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            verified
          </span>
          <span>MEKANIK SENIOR LEVEL IV BNSP</span>
        </div>

        {/* 3 Metrics */}
        <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-3 border-t border-surface-container-high">
          <div className="bg-surface-container-low rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
              RATING
            </span>
            <span className="text-sm font-bold text-on-surface mt-0.5 flex items-center justify-center gap-1">
              ★ {mechanic.rating}
            </span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
              SERVIS
            </span>
            <span className="text-sm font-bold text-on-surface mt-0.5 block">
              420+
            </span>
          </div>
          <div className="bg-surface-container-low rounded-xl p-2.5 text-center">
            <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
              PENERIMAAN
            </span>
            <span className="text-sm font-bold text-tertiary mt-0.5 block">
              {wallet.acceptanceRate}
            </span>
          </div>
        </div>
      </div>

      {/* Wallet Balance Shortcut Card */}
      <Link
        href="/mechanic/wallet"
        className="mt-3 bg-gradient-to-r from-secondary-container via-secondary-container to-primary-container/80 rounded-2xl p-4 text-white shadow-md flex items-center justify-between hover:brightness-105 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-white" style={{ fontSize: 22 }}>
              account_balance_wallet
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-white/80 block">
              SALDO DOMPET MITRA
            </span>
            <span className="font-bold text-base text-white">
              Rp {wallet.balance.toLocaleString("id-ID")}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-white">
          <span>Buka Dompet</span>
          <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
            chevron_right
          </span>
        </div>
      </Link>

      {/* Sertifikasi & Kendaraan Operasional */}
      <div className="mt-3 bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 shadow-sm flex flex-col gap-3">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
          Data Legalitas &amp; Unit Operasional
        </span>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              workspace_premium
            </span>
          </div>
          <div>
            <span className="font-bold text-xs text-on-surface block">
              Sertifikat BNSP Teknik Kendaraan Ringan
            </span>
            <span className="text-[11px] text-on-surface-variant">
              No. Reg: BNSP-OTO-2024-99812 • Masa Berlaku s/d Des 2027
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2 border-t border-surface-container-high">
          <div className="w-9 h-9 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              two_wheeler
            </span>
          </div>
          <div>
            <span className="font-bold text-xs text-on-surface block">
              Kendaraan Motor Operasional
            </span>
            <span className="text-[11px] text-on-surface-variant">
              Honda Vario 160 CBS (B 4521 SKL) • Toolkit Lengkap ServisIn
            </span>
          </div>
        </div>
      </div>

      {/* Menu Options */}
      <div className="mt-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider px-1">
          Pengaturan Aplikasi Mitra
        </span>

        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden divide-y divide-surface-container-high/40">
          <Link
            href="/mechanic/orders"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                list_alt
              </span>
              <span>Daftar Riwayat Servis Selesai</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </Link>

          <Link
            href="/mechanic/dashboard"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                radar
              </span>
              <span>Radar &amp; Wilayah Tugas (Radius 7 km)</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </Link>

          <a
            href="https://wa.me/6281100223344"
            target="_blank"
            rel="noreferrer"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
                support_agent
              </span>
              <span>Hubungi Dispatcher Pusat (Admin)</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </a>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full h-11 rounded-xl bg-error-container/30 border border-error/30 text-error font-bold text-xs flex items-center justify-center gap-2 hover:bg-error-container/60 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            logout
          </span>
          <span>Keluar Akun Mitra (Logout)</span>
        </button>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-error-container text-error flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                logout
              </span>
            </div>
            <h3 className="font-headline-sm text-lg font-bold text-on-surface">
              Konfirmasi Keluar Akun
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">
              Apakah Anda ingin mengakhiri sesi kerja sebagai <strong>Bambang Sudiro</strong>? Anda tidak akan menerima sinyal radar order baru sampai Anda login kembali.
            </p>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-11 rounded-xl bg-error text-white font-bold text-xs shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                Ya, Keluar Akun
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-surface-container-high"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      </div>

      {/* Bottom Nav */}
      <MechanicBottomNav />
    </div>
  );
}
