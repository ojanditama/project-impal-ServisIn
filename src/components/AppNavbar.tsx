"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { dbStore } from "@/lib/store";

interface AppNavbarProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  rightAction?: React.ReactNode;
}

export default function AppNavbar({
  title,
  showBack = false,
  backHref = "/dashboard",
  rightAction,
}: AppNavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState<number>(650000);
  const [userTier, setUserTier] = useState<"Regular" | "VIP">("Regular");
  const user = dbStore.users[0];

  useEffect(() => {
    setWalletBalance(dbStore.getCustomerBalance());
    setUserTier(dbStore.getUserTier());
  }, [pathname]);

  const navLinks = [
    { name: "Beranda", href: "/dashboard", icon: "home" },
    { name: "Kendaraan", href: "/vehicles", icon: "directions_car" },
    { name: "Booking", href: "/booking", icon: "calendar_clock", isCta: true },
    { name: "AI Diag", href: "/ai-diagnostic", icon: "auto_fix_high", badge: "VIP" },
    { name: "Profil", href: "/profile", icon: "person" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/60 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo or Mobile Back */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <Link
              href={backHref}
              className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
              title="Kembali"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_back
              </span>
            </Link>
          ) : null}

          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-all">
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                car_repair
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-lg font-black tracking-tight text-on-surface">
                  ServisIn
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-primary-fixed text-primary font-bold text-[9px] uppercase tracking-wider">
                  Official
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant font-medium -mt-0.5">
                On-Demand Vehicle Service
              </span>
            </div>
          </Link>

          {title && (
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-surface-container-high/80">
              <span className="font-label-md text-xs font-bold text-on-surface-variant">
                / {title}
              </span>
            </div>
          )}
        </div>

        {/* Center: Desktop Navigation Links (Hidden on mobile) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((link) => {
            if (link.isCta) {
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-primary text-on-primary shadow-md shadow-primary/25 hover:brightness-105 active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </Link>
              );
            }

            const isActive =
              link.href === "/dashboard"
                ? pathname === "/dashboard" || pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {link.icon}
                </span>
                <span>{link.name}</span>
                {link.badge && (
                  <span className="px-1.5 py-0.2 rounded-full bg-secondary text-on-secondary text-[8px] font-black uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Quick Actions & Profile */}
        <div className="flex items-center gap-2.5">
          {/* Desktop Wallet Quick Bar */}
          <Link
            href="/payment?id=SRV-8942"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container border border-surface-container-high transition-all"
            title="Lihat ServisIn Wallet"
          >
            <div className="w-6 h-6 rounded-lg bg-secondary text-on-secondary flex items-center justify-center">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                account_balance_wallet
              </span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-on-surface-variant font-bold uppercase leading-none">
                Wallet
              </span>
              <span className="text-xs font-bold text-on-surface leading-tight font-mono">
                Rp {walletBalance.toLocaleString("id-ID")}
              </span>
            </div>
          </Link>

          {/* SOS Hotline Button (Desktop) */}
          <Link
            href="/booking?emergency=true"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-error-container/40 hover:bg-error-container/60 border border-error/30 text-error text-xs font-bold transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
            <span>SOS 24/7</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface relative transition-colors"
            title="Notifikasi"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              notifications
            </span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-container"></span>
          </Link>

          {/* Custom right action if passed */}
          {rightAction}

          {/* Profile & Avatar */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-container transition-all"
            title="Profil Pengguna"
          >
            <div className="relative">
              <img
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"}
                alt="Profil"
                className={`w-9 h-9 rounded-full object-cover ring-2 ${
                  userTier === "VIP" ? "ring-amber-400" : "ring-primary-container/40"
                }`}
              />
              <span
                className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-surface ${
                  userTier === "VIP" ? "bg-amber-400" : "bg-tertiary"
                }`}
              ></span>
            </div>

            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-on-surface leading-tight truncate max-w-[110px]">
                {user?.name || "Rizky Pratama"}
              </span>
              <span className="text-[10px] text-amber-600 font-bold uppercase leading-none">
                {userTier === "VIP" ? "★ VIP Member" : "Reguler"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
