"use client";

import Link from "next/link";
import MechanicBottomNav from "@/components/MechanicBottomNav";
import { dbStore } from "@/lib/store";

export default function MechanicOrdersPage() {
  const orders = dbStore.orders;

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-24 selection:bg-primary-fixed selection:text-on-primary-fixed">
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
            Daftar Tugas &amp; Pesanan
          </h1>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-xs">
          Mitra Lapangan
        </span>
      </div>

      {/* Orders List */}
      <div className="flex flex-col gap-3 mt-4">
        {orders.map((ord) => (
          <div
            key={ord.id}
            className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-primary text-xs">
                #{ord.id}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-[10px]">
                {ord.status}
              </span>
            </div>

            <div>
              <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                {ord.serviceType}
              </h3>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                📍 {ord.locationCoord.address}
              </p>
            </div>

            <div className="bg-surface-container-low p-2 rounded-xl flex items-center justify-between text-xs">
              <span className="text-on-surface-variant">Total Biaya Pengerjaan:</span>
              <span className="font-bold text-on-surface">
                Rp {ord.totalCost.toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href={`/mechanic/navigation`}
                className="h-10 rounded-xl bg-primary-container text-on-primary font-label-md text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm hover:brightness-105"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  near_me
                </span>
                <span>Buka Navigasi</span>
              </Link>

              <Link
                href={`/tracking?id=${ord.id}`}
                className="h-10 rounded-xl bg-surface-container-low text-on-surface font-label-md text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  visibility
                </span>
                <span>Lihat GPS</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <MechanicBottomNav />
    </div>
  );
}
