"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";

export default function CustomerProfilePage() {
  const router = useRouter();
  const user = dbStore.users[0];
  const activeVeh = dbStore.vehicles[0];

  const [userTier, setUserTier] = useState<"Regular" | "VIP">("Regular");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(650000);

  useEffect(() => {
    setUserTier(dbStore.getUserTier());
    setWalletBalance(dbStore.getCustomerBalance());
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("servisin_auth_token");
      localStorage.removeItem("servisin_active_role");
      // Keep wallet and tier or clear as needed
    }
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-28 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-3">
        <Link
          href="/dashboard"
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </Link>
        <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
          Profil Saya
        </h1>
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-error transition-colors"
          title="Keluar dari Akun"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            logout
          </span>
        </button>
      </div>

      {/* User Card */}
      <div className="mt-2 bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col items-center text-center gap-2 relative">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className={`w-20 h-20 rounded-full object-cover ring-4 shadow-md ${
              userTier === "VIP" ? "ring-amber-400" : "ring-primary-container/30"
            }`}
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary text-white flex items-center justify-center text-xs">
            ✓
          </span>
        </div>

        <h2 className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
          {user.name}
        </h2>
        <span className="text-xs text-on-surface-variant -mt-1">{user.phone} • {user.email}</span>

        {/* Dynamic Tier Badge */}
        {userTier === "VIP" ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-amber-950 font-bold text-[10px] mt-1 shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
              workspace_premium
            </span>
            <span>SERVISIN PRIORITY VIP MEMBER</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[10px] mt-1">
            <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
              person
            </span>
            <span>MEMBER REGULER</span>
          </div>
        )}
      </div>

      {/* UPGRADE PROMPT: ONLY SHOW IF NOT VIP */}
      {userTier !== "VIP" && (
        <div className="mt-4 bg-gradient-to-r from-primary-container via-primary-container to-amber-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex flex-col gap-0.5 max-w-[210px]">
            <span className="font-bold text-xs">Tingkatkan ke VIP Priority</span>
            <span className="text-[11px] text-white/90 leading-tight">
              Buka kunci AI Diagnostic &amp; Bebas biaya panggil darurat 24/7.
            </span>
          </div>
          <Link
            href="/premium"
            className="px-3.5 py-2 rounded-xl bg-white text-primary-container font-bold text-xs shadow-sm hover:brightness-95 flex items-center gap-1"
          >
            <span>Upgrade</span>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
              arrow_forward
            </span>
          </Link>
        </div>
      )}

      {/* VIP BENEFITS SUMMARY: ONLY SHOW IF VIP */}
      {userTier === "VIP" && (
        <div className="mt-4 bg-amber-500/10 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                workspace_premium
              </span>
            </div>
            <div>
              <h3 className="font-label-md text-label-md font-bold text-on-surface">
                Keanggotaan VIP Aktif
              </h3>
              <span className="text-[11px] text-on-surface-variant">
                AI Diagnostic Bebas Akses &amp; Garansi 365 Hari
              </span>
            </div>
          </div>
          <Link
            href="/premium"
            className="text-xs font-bold text-amber-600 hover:underline"
          >
            Detail VIP →
          </Link>
        </div>
      )}

      {/* Garansi Card */}
      <div className="mt-3 bg-tertiary-fixed/30 rounded-2xl p-4 border border-tertiary-fixed flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              verified
            </span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md font-bold text-on-surface">
              Garansi ServisIn {userTier === "VIP" ? "365 Hari" : "30 Hari"} Aktif
            </h3>
            <span className="text-[11px] text-on-surface-variant">
              Unit: {activeVeh?.model} ({activeVeh?.licensePlate})
            </span>
          </div>
        </div>
        <Link
          href="/payment"
          className="text-xs font-bold text-tertiary hover:underline"
        >
          Lihat Polis →
        </Link>
      </div>

      {/* Menu Sections */}
      <div className="mt-4 flex flex-col gap-2">
        <span className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider">
          Pengaturan Akun &amp; Layanan
        </span>

        <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden divide-y divide-surface-container-high/40">
          <Link
            href="/vehicles"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                garage
              </span>
              <span>Garasi Kendaraan ({dbStore.vehicles.length} Unit)</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </Link>

          {/* Conditional VIP Link in Menu */}
          <Link
            href="/premium"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
              <span>
                {userTier === "VIP" ? "Status Langganan VIP (Aktif)" : "Upgrade ke ServisIn VIP"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {userTier === "VIP" ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[9px]">
                  AKTIF
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[9px]">
                  PROMO
                </span>
              )}
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                chevron_right
              </span>
            </div>
          </Link>

          <Link
            href="/ai-diagnostic"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: 20 }}>
                psychology
              </span>
              <span>AI Mechanic &amp; Diagnostic</span>
            </div>
            <div className="flex items-center gap-1.5">
              {userTier === "VIP" ? (
                <span className="text-[10px] text-tertiary font-bold">Terbuka</span>
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 16 }}>
                  lock
                </span>
              )}
              <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                chevron_right
              </span>
            </div>
          </Link>

          <Link
            href="/payment"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
                receipt_long
              </span>
              <span>Riwayat Transaksi &amp; E-Faktur</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </Link>

          <Link
            href="/admin"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-primary">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                admin_panel_settings
              </span>
              <span>Buka Admin Control Hub (Superadmin)</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-5">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)}
          className="w-full h-12 rounded-2xl bg-error-container/40 border border-error/30 text-error font-label-lg font-bold flex items-center justify-center gap-2 hover:bg-error-container/60 active:scale-95 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            logout
          </span>
          <span>Keluar dari Akun (Logout)</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
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
              Apakah Anda yakin ingin keluar dari akun <strong>{user.name}</strong>? Anda perlu login kembali untuk mengakses riwayat servis dan dompet digital Anda.
            </p>

            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full h-11 rounded-xl bg-error text-white font-label-md font-bold shadow-md hover:brightness-105 active:scale-95 transition-all"
              >
                Ya, Keluar Akun
              </button>
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="w-full h-10 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-xs font-semibold hover:bg-surface-container-high"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <CustomerBottomNav />
    </div>
  );
}
