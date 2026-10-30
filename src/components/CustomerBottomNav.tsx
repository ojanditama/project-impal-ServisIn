"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CustomerBottomNav() {
  const pathname = usePathname();

  const isHome = pathname === "/" || pathname === "/dashboard";
  const isVehicle = pathname.startsWith("/vehicles");
  const isBooking = pathname.startsWith("/booking");
  const isAiDiag = pathname.startsWith("/ai-diagnostic");
  const isProfile = pathname.startsWith("/premium") || pathname.startsWith("/profile");

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 h-16 flex items-center justify-around px-2 shadow-lg">
      <Link
        href="/dashboard"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isHome ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isHome ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          home
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Beranda</span>
      </Link>

      <Link
        href="/vehicles"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isVehicle ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isVehicle ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          directions_car
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Kendaraan</span>
      </Link>

      {/* Center Elevated FAB */}
      <Link
        href="/booking"
        className="flex flex-col items-center justify-center flex-1 -mt-5 group"
      >
        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-[0_4px_16px_rgba(255,107,0,0.4)] group-active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
            calendar_clock
          </span>
        </div>
        <span className="font-label-sm text-label-sm text-primary-container font-bold mt-1">
          Booking
        </span>
      </Link>

      <Link
        href="/ai-diagnostic"
        className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
          isAiDiag ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <div className="relative">
          <span
            className={`material-symbols-outlined ${isAiDiag ? "fill-icon" : ""}`}
            style={{ fontSize: 24 }}
          >
            auto_fix_high
          </span>
          <span className="absolute -top-1 -right-3 text-[9px] font-bold px-1 rounded-full bg-secondary text-on-secondary">
            VIP
          </span>
        </div>
        <span className="font-label-sm text-label-sm mt-0.5">AI Diag</span>
      </Link>

      <Link
        href="/premium"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isProfile ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isProfile ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          person
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Profil</span>
      </Link>
    </nav>
  );
}
