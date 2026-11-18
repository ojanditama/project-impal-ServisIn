"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";

import { User } from "@/models/User";
import { Vehicle } from "@/models/Vehicle";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User>(dbStore.users[0]);
  const [activeVeh, setActiveVeh] = useState<Vehicle | undefined>(dbStore.vehicles[0]);

  const [userTier, setUserTier] = useState<"Regular" | "VIP">("Regular");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(650000);

  useEffect(() => {
    const cur = dbStore.getCurrentUser();
    setUser(cur);
    setUserTier(dbStore.getUserTier(cur.id));
    setWalletBalance(dbStore.getCustomerBalance());
    const veh = dbStore.getActiveVehicle(cur.id);
    if (veh) setActiveVeh(veh);
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("servisin_auth_token");
      localStorage.removeItem("servisin_active_role");
      localStorage.removeItem("servisin_current_user");
    }
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="Profil Saya" />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: User Card & Quick Summary */}
          <div className="lg:col-span-4 flex flex-col gap-5 lg:sticky lg:top-24">
            {/* User Profile Card */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high/60 shadow-sm flex flex-col items-center text-center gap-3 relative">
              <div className="relative">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className={`w-24 h-24 rounded-full object-cover ring-4 shadow-md ${
                    userTier === "VIP" ? "ring-amber-400" : "ring-primary-container/30"
                  }`}
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-tertiary text-white flex items-center justify-center text-xs font-bold ring-2 ring-surface">
                  ✓
                </span>
              </div>

              <div>
                <h2 className="font-headline-md text-xl font-bold text-on-surface">
                  {user.name}
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {user.phone} • {user.email}
                </p>
              </div>

              {/* Dynamic Tier Badge */}
              {userTier === "VIP" ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-amber-950 font-extrabold text-[11px] shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    workspace_premium
                  </span>
                  <span>SERVISIN PRIORITY VIP</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-bold text-[11px]">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    person
                  </span>
                  <span>MEMBER REGULER</span>
                </div>
              )}

              {/* User Quick Metrics */}
              <div className="w-full grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-surface-container-high">
                <div className="bg-surface-container-low rounded-xl p-3 text-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    SALDO WALLET
                  </span>
                  <span className="text-sm font-bold text-secondary mt-0.5 block">
                    Rp {walletBalance.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 text-center">
                  <span className="text-[10px] text-on-surface-variant uppercase font-bold block">
                    GARASI AKTIF
                  </span>
                  <span className="text-sm font-bold text-on-surface mt-0.5 block">
                    {dbStore.vehicles.length} Kendaraan
                  </span>
                </div>
              </div>

              {/* Logout Button in Left Card */}
              <button
                type="button"
                onClick={() => setShowLogoutModal(true)}
                className="w-full mt-2 h-11 rounded-xl bg-error-container/30 border border-error/30 text-error font-bold text-xs flex items-center justify-center gap-2 hover:bg-error-container/60 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  logout
                </span>
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Status Cards & Settings Menu */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* UPGRADE PROMPT: ONLY SHOW IF NOT VIP */}
            {userTier !== "VIP" && (
              <div className="bg-gradient-to-r from-primary-container via-primary-container to-amber-500 rounded-3xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white" style={{ fontSize: 28 }}>
                      workspace_premium
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base md:text-lg">Tingkatkan ke VIP Priority</h3>
                    <p className="text-xs md:text-sm text-white/90 mt-1 max-w-xl leading-relaxed">
                      Buka kunci penuh konsultasi AI Diagnostic, bebas biaya panggil darurat 24/7, dan garansi perbaikan 365 hari.
                    </p>
                  </div>
                </div>
                <Link
                  href="/premium"
                  className="px-5 py-2.5 rounded-xl bg-white text-primary-container font-extrabold text-xs md:text-sm shadow-md hover:brightness-95 flex items-center gap-1.5 flex-shrink-0"
                >
                  <span>Upgrade Sekarang</span>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    arrow_forward
                  </span>
                </Link>
              </div>
            )}

            {/* VIP BENEFITS SUMMARY: ONLY SHOW IF VIP */}
            {userTier === "VIP" && (
              <div className="bg-amber-500/10 rounded-3xl p-6 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                      workspace_premium
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                        Keanggotaan VIP Anda Sedang Aktif
                      </h3>
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px]">
                        PRIORITY
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-on-surface-variant mt-1 leading-relaxed">
                      Nikmati AI Mechanic Diagnostic tanpa batas, garansi 365 hari, dan diskon 15% untuk setiap pemesanan.
                    </p>
                  </div>
                </div>
                <Link
                  href="/premium"
                  className="px-4 py-2 rounded-xl bg-amber-500 text-amber-950 font-bold text-xs md:text-sm hover:brightness-105 flex-shrink-0"
                >
                  Detail Langganan VIP →
                </Link>
              </div>
            )}

            {/* Active Warranty Card */}
            <div className="bg-tertiary-fixed/30 rounded-3xl p-6 border border-tertiary-fixed flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
                    verified
                  </span>
                </div>
                <div>
                  <h3 className="font-label-md text-sm md:text-base font-bold text-on-surface">
                    Garansi ServisIn {userTier === "VIP" ? "365 Hari" : "30 Hari"} Sedang Aktif
                  </h3>
                  <p className="text-xs md:text-sm text-on-surface-variant mt-0.5">
                    Kendaraan Terproteksi: <strong>{activeVeh?.model} ({activeVeh?.licensePlate})</strong>
                  </p>
                </div>
              </div>
              <Link
                href="/payment"
                className="text-xs md:text-sm font-bold text-tertiary hover:underline flex-shrink-0"
              >
                Lihat Polis Garansi →
              </Link>
            </div>

            {/* Menu List */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-on-surface-variant px-1 uppercase tracking-wider">
                Pengaturan Akun &amp; Layanan
              </span>

              <div className="bg-surface-container-lowest rounded-3xl border border-surface-container-high/60 shadow-sm overflow-hidden divide-y divide-surface-container-high/40">
                <Link
                  href="/vehicles"
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                      garage
                    </span>
                    <div>
                      <span>Garasi Kendaraan</span>
                      <span className="text-xs font-normal text-on-surface-variant block">
                        Kelola data motor, mobil, dan buku servis digital ({dbStore.vehicles.length} Unit)
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                    chevron_right
                  </span>
                </Link>

                <Link
                  href="/premium"
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 22 }}>
                      workspace_premium
                    </span>
                    <div>
                      <span>
                        {userTier === "VIP" ? "Status Langganan VIP (Aktif)" : "Upgrade ke ServisIn VIP"}
                      </span>
                      <span className="text-xs font-normal text-on-surface-variant block">
                        {userTier === "VIP"
                          ? "Perlindungan aktif hingga 1 tahun ke depan"
                          : "Akses AI Mechanic & Bebas Biaya Panggil Darurat"}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {userTier === "VIP" ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px]">
                        AKTIF
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-bold text-[10px]">
                        PROMO
                      </span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                      chevron_right
                    </span>
                  </div>
                </Link>

                <Link
                  href="/ai-diagnostic"
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                      psychology
                    </span>
                    <div>
                      <span>AI Mechanic &amp; Diagnostic</span>
                      <span className="text-xs font-normal text-on-surface-variant block">
                        Analisa keluhan mesin, bunyi gesekan, &amp; estimasi estimasi biaya otomatis
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {userTier === "VIP" ? (
                      <span className="text-xs text-tertiary font-bold">Terbuka</span>
                    ) : (
                      <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
                        lock
                      </span>
                    )}
                    <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                      chevron_right
                    </span>
                  </div>
                </Link>

                <Link
                  href="/payment"
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3.5 text-sm font-bold text-on-surface">
                    <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 22 }}>
                      receipt_long
                    </span>
                    <div>
                      <span>Riwayat Transaksi &amp; E-Faktur</span>
                      <span className="text-xs font-normal text-on-surface-variant block">
                        Pantau pembayaran servis, unduh bukti transaksi resmi PDF
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                    chevron_right
                  </span>
                </Link>

                <Link
                  href="/admin"
                  className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-3.5 text-sm font-bold text-primary">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>
                      admin_panel_settings
                    </span>
                    <div>
                      <span>Buka Admin Control Hub</span>
                      <span className="text-xs font-normal text-on-surface-variant block">
                        Superadmin dispatch monitor, manajemen mekanik, dan laporan keuangan
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 20 }}>
                    chevron_right
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

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

      {/* Mobile Bottom Navigation (Auto hidden on desktop via md:hidden) */}
      <CustomerBottomNav />
    </div>
  );
}
