"use client";

import { useState } from "react";
import Link from "next/link";
import { dbStore } from "@/lib/store";
import { AdminController } from "@/controllers/AdminController";
import { User } from "@/models/User";
import { DisputeTicket } from "@/models/DisputeTicket";

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"monitoring" | "verification" | "disputes">("monitoring");
  const [mechanics, setMechanics] = useState<User[]>(
    dbStore.users.filter((u) => u.role === "Mechanic")
  );
  const [disputes, setDisputes] = useState<DisputeTicket[]>(dbStore.disputes);
  const [toastMessage, setToastMessage] = useState("");

  const handleVerify = (id: string, action: "approve" | "reject") => {
    const res = AdminController.verifyMechanicAccount(id, action);
    setToastMessage(res.message);
    setMechanics([...dbStore.users.filter((u) => u.role === "Mechanic")]);
  };

  const handleResolveDispute = (
    id: string,
    action: "ResolvedRefund" | "ResolvedRevisit" | "Rejected",
    note: string
  ) => {
    const res = AdminController.resolveDisputeTicket(id, action, note);
    setToastMessage(res.message);
    setDisputes([...dbStore.disputes]);
  };

  return (
    <div className="w-full min-h-screen bg-surface flex flex-col p-4 md:p-8 selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-surface-container-high/60 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              admin_panel_settings
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-headline-md font-bold text-on-surface">
                ServisIn Admin Control Hub
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-bold text-[10px]">
                SUPERADMIN
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Pengawasan Operasional Makro, Verifikasi Mitra &amp; Resolusi Klaim Garansi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container"
          >
            Lihat Mode Pelanggan
          </Link>
          <Link
            href="/mechanic/dashboard"
            className="px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface text-xs font-semibold hover:bg-surface-container"
          >
            Lihat Mode Mekanik
          </Link>
          <Link
            href="/login"
            className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
            title="Keluar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              logout
            </span>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mt-4 border-b border-surface-container-high/60 pb-2">
        <button
          onClick={() => setActiveTab("monitoring")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "monitoring"
              ? "bg-primary-container text-on-primary shadow-md"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            monitoring
          </span>
          <span>Live Monitoring Makro</span>
        </button>

        <button
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "verification"
              ? "bg-primary-container text-on-primary shadow-md"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            how_to_reg
          </span>
          <span>Verifikasi Mitra Mekanik</span>
          <span className="px-1.5 py-0.2 rounded-full bg-secondary text-white text-[10px]">
            {mechanics.filter((m) => m.status === "Pending").length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("disputes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === "disputes"
              ? "bg-primary-container text-on-primary shadow-md"
              : "bg-surface-container-low text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            gavel
          </span>
          <span>Resolusi Sengketa &amp; Garansi</span>
          <span className="px-1.5 py-0.2 rounded-full bg-error text-white text-[10px]">
            {disputes.filter((d) => d.status === "Open").length}
          </span>
        </button>
      </div>

      {/* Tab 1: Live Monitoring Makro */}
      {activeTab === "monitoring" && (
        <div className="mt-4 flex flex-col gap-5">
          {/* 4 Macro KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant text-xs">
                <span>Pesanan Hari Ini</span>
                <span className="material-symbols-outlined text-primary-container">local_shipping</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface block mt-2">
                142
              </span>
              <span className="text-[11px] text-tertiary font-semibold">▲ +18% dari kemarin</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant text-xs">
                <span>Montir Online</span>
                <span className="material-symbols-outlined text-tertiary">engineering</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface block mt-2">
                58
              </span>
              <span className="text-[11px] text-tertiary font-semibold">● Siaga di 5 Wilayah Jabodetabek</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant text-xs">
                <span>Gross Transaction Value</span>
                <span className="material-symbols-outlined text-secondary">payments</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-on-surface block mt-2">
                Rp 48.2jt
              </span>
              <span className="text-[11px] text-on-surface-variant">Real-time GMV hari ini</span>
            </div>

            <div className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm">
              <div className="flex items-center justify-between text-on-surface-variant text-xs">
                <span>Platform Fee (15%)</span>
                <span className="material-symbols-outlined text-primary">account_balance</span>
              </div>
              <span className="font-headline-lg text-headline-lg font-bold text-primary block mt-2">
                Rp 7.23jt
              </span>
              <span className="text-[11px] text-tertiary font-semibold">Komisi bersih platform</span>
            </div>
          </div>

          {/* Active Orders Live Feed Table */}
          <div className="bg-surface-container-lowest rounded-2xl border border-surface-container-high/60 shadow-sm overflow-hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Live Feed Transaksi Lapangan
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Socket.IO Live Sync
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-container-low text-on-surface-variant font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">ID Order</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Mekanik</th>
                    <th className="p-3">Layanan</th>
                    <th className="p-3">Total Biaya</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container-high/60">
                  {dbStore.orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface-container-low/50">
                      <td className="p-3 font-mono font-bold text-primary">{ord.id}</td>
                      <td className="p-3 font-medium text-on-surface">Rizky Pratama (VIP)</td>
                      <td className="p-3 font-medium text-on-surface">Bambang Sudiro (BNSP)</td>
                      <td className="p-3">{ord.serviceType}</td>
                      <td className="p-3 font-bold text-on-surface">
                        Rp {ord.totalCost.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                          {ord.status}
                        </span>
                      </td>
                      <td className="p-3">
                        <Link
                          href={`/tracking?id=${ord.id}`}
                          className="text-secondary font-bold hover:underline"
                        >
                          Pantau GPS →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Verifikasi Mitra Mekanik */}
      {activeTab === "verification" && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Antrean Berkas Pengajuan Mitra Mekanik
              </h2>
              <span className="text-xs text-on-surface-variant">
                Validasi identitas KTP, SIM C/A, dan Sertifikat BNSP / APM Resmi
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {mechanics.map((m) => (
              <div
                key={m.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatarUrl}
                      alt={m.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-headline-sm text-sm font-bold text-on-surface">
                        {m.name}
                      </h3>
                      <span className="text-xs text-on-surface-variant">{m.phone}</span>
                      <span className="text-[11px] text-on-surface-variant block">{m.email}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                      m.status === "Active"
                        ? "bg-emerald-100 text-emerald-800"
                        : m.status === "Pending"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {m.status.toUpperCase()}
                  </span>
                </div>

                <div className="bg-surface-container-low p-2.5 rounded-xl text-xs flex flex-col gap-1">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Nomor KTP:</span>
                    <span className="font-mono font-semibold">3174092801900002</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Sertifikat:</span>
                    <span className="font-semibold text-tertiary">BNSP Otomotif Level IV</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Bengkel Rekanan:</span>
                    <span className="font-semibold">ServisIn Hub Jaksel</span>
                  </div>
                </div>

                {m.status === "Pending" ? (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <button
                      onClick={() => handleVerify(m.id, "reject")}
                      className="h-10 rounded-xl bg-error-container text-on-error-container font-bold text-xs hover:brightness-95"
                    >
                      ✕ Tolak Berkas
                    </button>
                    <button
                      onClick={() => handleVerify(m.id, "approve")}
                      className="h-10 rounded-xl bg-primary-container text-on-primary font-bold text-xs hover:brightness-105 shadow-md"
                    >
                      ✓ Setujui &amp; Aktivasi
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-tertiary font-semibold text-center py-1">
                    Akun Aktif &amp; Terverifikasi
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Resolusi Sengketa & Garansi */}
      {activeTab === "disputes" && (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Pusat Resolusi Komplain &amp; Klaim Garansi ServisIn
            </h2>
            <span className="text-xs text-on-surface-variant">
              Mediasi 1-klik: Refund Dana, Kunjungan Ulang Montir Senior Bebas Biaya, atau Tolak Sengketa
            </span>
          </div>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                className="bg-surface-container-lowest p-4 rounded-2xl border border-surface-container-high/60 shadow-sm flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-sm text-sm font-bold text-on-surface">
                      Tiket #{d.id}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-xs">
                      Ref: {d.orderId}
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === "Open"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {d.status}
                  </span>
                </div>

                <div className="bg-surface-container-low p-3 rounded-xl text-xs text-on-surface leading-relaxed">
                  <strong className="block text-on-surface font-semibold mb-1">
                    Kronologi Aduan Pelanggan:
                  </strong>
                  &ldquo;{d.complaintText}&rdquo;
                </div>

                {d.resolutionNote && (
                  <div className="bg-tertiary-fixed/30 p-2.5 rounded-xl text-xs text-tertiary border border-tertiary-fixed">
                    <strong>Catatan Resolusi:</strong> {d.resolutionNote}
                  </div>
                )}

                {d.status === "Open" && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() =>
                        handleResolveDispute(
                          d.id,
                          "ResolvedRefund",
                          "Refund dana 100% diproses langsung ke dompet pelanggan."
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs shadow-sm hover:brightness-105"
                    >
                      💰 Refund Dana ke Pelanggan
                    </button>

                    <button
                      onClick={() =>
                        handleResolveDispute(
                          d.id,
                          "ResolvedRevisit",
                          "Mekanik Senior ditugaskan kunjungan ulang bebas biaya di bawah klaim garansi 30 hari."
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-secondary text-on-secondary font-bold text-xs shadow-sm hover:brightness-105"
                    >
                      🔧 Kirim Ulang Montir Senior Bebas Biaya
                    </button>

                    <button
                      onClick={() =>
                        handleResolveDispute(
                          d.id,
                          "Rejected",
                          "Komplain tidak memenuhi syarat garansi pengerjaan suku cadang pihak ketiga."
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-surface-container-low text-on-surface font-bold text-xs hover:bg-surface-container"
                    >
                      ✕ Tolak Komplain
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4 animate-in slide-in-from-bottom">
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="font-bold text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
