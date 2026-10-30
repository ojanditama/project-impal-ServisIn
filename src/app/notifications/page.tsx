"use client";

import Link from "next/link";
import CustomerBottomNav from "@/components/CustomerBottomNav";

export default function NotificationsPage() {
  const notifications = [
    {
      id: "notif-1",
      title: "Mekanik Sedang Menuju Lokasi Anda",
      desc: "Bambang Sudiro (4.9★) berada di Jl. Gatot Subroto. Estimasi tiba ~7 menit.",
      time: "5 menit lalu",
      type: "tracking",
      link: "/tracking",
      icon: "near_me",
      color: "text-secondary bg-secondary-fixed",
    },
    {
      id: "notif-2",
      title: "Waktunya Ganti Oli & Tune Up",
      desc: "Avanza Veloz Anda telah menempuh 5.000 km sejak servis terakhir.",
      time: "2 jam lalu",
      type: "reminder",
      link: "/booking",
      icon: "calendar_month",
      color: "text-primary bg-primary-fixed",
    },
    {
      id: "notif-3",
      title: "Garansi Servis 30 Hari Aktif",
      desc: "Order #SRV-8942 terlindungi garansi perbaikan gratis hingga 29 November 2026.",
      time: "Kemarin",
      type: "warranty",
      link: "/payment",
      icon: "verified",
      color: "text-tertiary bg-tertiary-fixed",
    },
    {
      id: "notif-4",
      title: "Promo Roadside 35% Spesial Member",
      desc: "Gunakan voucher ROADSIDECARE40 saat checkout servis berkala.",
      time: "3 hari lalu",
      type: "promo",
      link: "/booking",
      icon: "local_offer",
      color: "text-amber-600 bg-amber-100",
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-20 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-3 border-b border-surface-container-high/60">
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Notifikasi
          </h1>
        </div>
        <button
          onClick={() => alert("Semua notifikasi ditandai telah dibaca.")}
          className="text-xs text-secondary font-bold hover:underline"
        >
          Tandai Dibaca
        </button>
      </div>

      {/* Notifications List */}
      <div className="flex flex-col gap-3 mt-4">
        {notifications.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="bg-surface-container-lowest p-3.5 rounded-2xl border border-surface-container-high/60 shadow-sm flex items-start gap-3 hover:shadow-md transition-all"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                {item.icon}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-label-md text-xs font-bold text-on-surface">
                  {item.title}
                </h3>
                <span className="text-[10px] text-on-surface-variant">{item.time}</span>
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5 leading-snug">
                {item.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <CustomerBottomNav />
    </div>
  );
}
