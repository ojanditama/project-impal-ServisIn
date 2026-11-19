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

  const links = [
    { href: "/mechanic/dashboard", label: "Radar", icon: "radar", active: isRadar },
    { href: "/mechanic/orders", label: "Pesanan", icon: "build", active: isOrders },
    { href: "/mechanic/navigation", label: "Peta", icon: "near_me", active: isNav },
    { href: "/mechanic/wallet", label: "Dompet", icon: "account_balance_wallet", active: isWallet },
    { href: "/mechanic/profile", label: "Profil", icon: "badge", active: isProfile },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40 md:hidden bg-surface/90 backdrop-blur-xl border-t border-surface-container-high/60 flex items-center justify-around px-2 shadow-lg"
        style={{ height: 64 }}
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center justify-center flex-1 min-h-[44px] min-w-[44px] py-1.5 transition-colors ${
              link.active ? "text-primary-container font-semibold" : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span
              className={`material-symbols-outlined ${link.active ? "fill-icon" : ""}`}
              style={{ fontSize: 24 }}
            >
              {link.icon}
            </span>
            <span className="font-label-sm text-label-sm mt-0.5">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Top Nav */}
      <nav className="hidden md:flex sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60">
        <div className="w-full max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Left: Brand */}
          <Link href="/mechanic/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                car_repair
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-lg font-black tracking-tight text-on-surface">
                ServisIn
              </span>
              <span className="px-1.5 py-0.2 rounded bg-secondary text-on-secondary font-bold text-[10px]">
                MITRA
              </span>
            </div>
          </Link>

          {/* Center: Nav Links */}
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  link.active
                    ? "bg-secondary-fixed/60 text-secondary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right: BNSP Badge + Avatar */}
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[10px]">
              BNSP
            </span>
            <Link href="/mechanic/profile">
              <img
                src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                alt="Mekanik"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-primary-container/40 hover:ring-primary transition-all"
              />
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
}
