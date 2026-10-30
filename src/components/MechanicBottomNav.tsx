"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MechanicBottomNav() {
  const pathname = usePathname();

  const isRadar = pathname === "/mechanic/dashboard";
  const isOrders = pathname === "/mechanic/orders";
  const isNav = pathname === "/mechanic/navigation";
  const isWallet = pathname === "/mechanic/wallet";
  const isProfile = pathname === "/mechanic/profile";

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 h-16 flex items-center justify-around px-2 shadow-lg">
      <Link
        href="/mechanic/dashboard"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isRadar ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isRadar ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          radar
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Radar</span>
      </Link>

      <Link
        href="/mechanic/navigation"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isOrders ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isOrders ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          build
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Pesanan</span>
      </Link>

      <Link
        href="/mechanic/navigation"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isNav ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isNav ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          near_me
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Peta</span>
      </Link>

      <Link
        href="/mechanic/wallet"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isWallet ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isWallet ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          account_balance_wallet
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Dompet</span>
      </Link>

      <Link
        href="/login"
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
          isProfile ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
        }`}
      >
        <span
          className={`material-symbols-outlined ${isProfile ? "fill-icon" : ""}`}
          style={{ fontSize: 24 }}
        >
          badge
        </span>
        <span className="font-label-sm text-label-sm mt-0.5">Profil</span>
      </Link>
    </nav>
  );
}
