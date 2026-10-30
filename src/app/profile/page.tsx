"use client";

import Link from "next/link";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";

export default function CustomerProfilePage() {
  const user = dbStore.users[0];
  const activeVeh = dbStore.vehicles[0];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-24 selection:bg-primary-fixed selection:text-on-primary-fixed">
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
        <Link
          href="/login"
          className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-error"
          title="Keluar"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            logout
          </span>
        </Link>
      </div>

      {/* User Card */}
      <div className="mt-2 bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high/60 shadow-sm flex flex-col items-center text-center gap-2 relative">
        <div className="relative">
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-container/30 shadow-md"
          />
          <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-tertiary text-white flex items-center justify-center text-xs">
            ✓
          </span>
        </div>

        <h2 className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
          {user.name}
        </h2>
        <span className="text-xs text-on-surface-variant -mt-1">{user.phone} • {user.email}</span>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-primary-container text-white font-bold text-[10px] mt-1 shadow-sm">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            workspace_premium
          </span>
          SERVISIN PRIORITY VIP MEMBER
        </div>
      </div>

      {/* Garansi Card */}
      <div className="mt-4 bg-tertiary-fixed/30 rounded-2xl p-4 border border-tertiary-fixed flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
              verified
            </span>
          </div>
          <div>
            <h3 className="font-label-md text-label-md font-bold text-on-surface">
              Garansi ServisIn 30 Hari Aktif
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
          Pengaturan Akun
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

          <Link
            href="/premium"
            className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 text-xs font-bold text-on-surface">
              <span className="material-symbols-outlined text-amber-500" style={{ fontSize: 20 }}>
                workspace_premium
              </span>
              <span>Langganan ServisIn VIP</span>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: 18 }}>
              chevron_right
            </span>
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

      <CustomerBottomNav />
    </div>
  );
}
