"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import CustomerBottomNav from "@/components/CustomerBottomNav";
import { dbStore } from "@/lib/store";
import { Vehicle } from "@/models/Vehicle";
import { SupabaseService } from "@/lib/supabase";

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [newBrand, setNewBrand] = useState("Honda");
  const [newModel, setNewModel] = useState("HR-V RS Turbo 1.5");
  const [newPlate, setNewPlate] = useState("B 8899 WXY");
  const [newYear, setNewYear] = useState(2023);

  const handleOpenModal = () => {
    const randomNum = Math.floor(1000 + Math.random() * 8999);
    const suffixes = ["WXY", "KLM", "PQR", "STU", "ZXC", "ABC"];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    setNewPlate(`B ${randomNum} ${randomSuffix}`);
    setModalError("");
    setIsModalOpen(true);
  };

  useEffect(() => {
    const currentUser = dbStore.getCurrentUser();
    // 1. Initial state from local store
    const localVehs = dbStore.getVehicles(currentUser.id);
    setVehicles(localVehs);

    // 2. Fetch from Supabase
    SupabaseService.getVehicles(currentUser.id)
      .then((sbVehs) => {
        if (Array.isArray(sbVehs) && sbVehs.length > 0) {
          const mapped = sbVehs.map(
            (v) =>
              new Vehicle({
                id: v.id,
                userId: v.userId,
                brand: v.brand,
                model: v.model,
                year: v.year,
                licensePlate: v.licensePlate,
                isActive: Boolean(v.isActive),
                odometerKm: v.odometerKm,
                healthPercent: v.healthPercent,
                color: v.color,
                imageUrl: v.imageUrl,
                lastServiceDate: v.lastServiceDate,
              })
          );
          setVehicles(mapped);
          dbStore.setVehicles(mapped);
        }
      })
      .catch((err) => {
        console.warn("[VehiclesPage] Supabase sync notice:", err);
      });
  }, []);

  const handleSetActive = async (id: string) => {
    const currentUser = dbStore.getCurrentUser();
    // Optimistic local update
    dbStore.setActiveVehicle(currentUser.id, id);
    setVehicles([...dbStore.getVehicles(currentUser.id)]);

    // Supabase sync
    try {
      await SupabaseService.setActiveVehicle(currentUser.id, id);
      setSuccessToast("Kendaraan utama berhasil diperbarui di database Supabase.");
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      console.warn("[VehiclesPage] Supabase error setActiveVehicle:", err);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setModalError("");
    const currentUser = dbStore.getCurrentUser();
    const newVehId = "veh-" + Date.now();
    const cleanPlate = newPlate.trim().toUpperCase();

    const newVeh = new Vehicle({
      id: newVehId,
      userId: currentUser.id,
      brand: newBrand,
      model: newModel,
      year: newYear,
      licensePlate: cleanPlate,
      isActive: vehicles.length === 0,
      odometerKm: 12000,
      healthPercent: 96,
      color: "Putih Mutiara",
    });

    // 1. Persist to Supabase
    try {
      const res = await SupabaseService.createVehicle({
        id: newVehId,
        userId: currentUser.id,
        brand: newBrand,
        model: newModel,
        year: newYear,
        licensePlate: cleanPlate,
        isActive: vehicles.length === 0,
        color: "Putih Mutiara",
        odometerKm: 12000,
        healthPercent: 96,
      });

      if (!res.success) {
        setSaving(false);
        setModalError(res.error || "Gagal menyimpan kendaraan ke database Supabase.");
        return;
      }
    } catch (err: any) {
      setSaving(false);
      setModalError(err?.message || "Gagal menghubungi database Supabase.");
      return;
    }

    // 2. Persist locally upon verified Supabase success
    dbStore.addVehicle(newVeh);
    const updated = dbStore.getVehicles(currentUser.id);
    setVehicles(updated);
    setSaving(false);
    setIsModalOpen(false);
    setSuccessToast(`Kendaraan ${newBrand} ${newModel} (${cleanPlate}) berhasil tersimpan di Supabase!`);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const primaryVehicle = vehicles.find((v) => v.isActive) || vehicles[0];
  const otherVehicles = vehicles.filter((v) => v.id !== primaryVehicle?.id);

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title="Garasi Kendaraan" />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 pb-24 md:pb-12">
        {/* Section Title & Add Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs uppercase font-extrabold tracking-wider text-primary">
                GARASI DIGITAL SERVISIN
              </span>
              <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary text-[10px] font-bold">
                {vehicles.length} Kendaraan Terdaftar
              </span>
            </div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl font-extrabold text-on-surface mt-1">
              Armada &amp; Rekam Medis Kendaraan
            </h1>
          </div>

          <button
            onClick={handleOpenModal}
            className="h-11 px-5 rounded-xl bg-primary-container text-on-primary font-bold text-xs md:text-sm flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all self-start sm:self-auto"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              add
            </span>
            <span>Tambah Unit Baru</span>
          </button>
        </div>

        {/* Real-time Supabase Toast Notice */}
        {successToast && (
          <div className="mb-6 p-4 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed font-bold text-xs md:text-sm flex items-center gap-2 border border-tertiary shadow-sm animate-in fade-in">
            <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
              check_circle
            </span>
            <span>{successToast}</span>
          </div>
        )}

        {/* Primary Active Vehicle Showcase Card */}
        {primaryVehicle && (
          <div className="bg-surface-container-lowest rounded-3xl p-5 md:p-8 shadow-md border border-surface-container-high/60 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-surface-container-high">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                    directions_car
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-bold text-[10px]">
                      KENDARAAN UTAMA
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px] font-semibold">
                      Tahun {primaryVehicle.year} • {primaryVehicle.color}
                    </span>
                  </div>
                  <h2 className="font-headline-sm text-xl md:text-2xl font-bold text-on-surface mt-1">
                    {primaryVehicle.brand} {primaryVehicle.model}
                  </h2>
                </div>
              </div>

              <div className="bg-surface-container-high px-4 py-2 rounded-xl text-center font-mono font-extrabold text-base md:text-lg text-on-surface self-start md:self-auto">
                {primaryVehicle.licensePlate}
              </div>
            </div>

            {/* Split Showcase Grid: Image & Health on Left, Telemetry & Actions on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Left Column: Photo & Health Status */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="relative h-56 md:h-64 rounded-2xl overflow-hidden shadow-inner border border-surface-container-high/40">
                  <img
                    src={primaryVehicle.imageUrl}
                    alt={primaryVehicle.model}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-4 text-white">
                    <div className="flex items-center gap-2 text-xs md:text-sm font-semibold">
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                        speed
                      </span>
                      <span>{primaryVehicle.odometerKm.toLocaleString()} km</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl bg-black/50 backdrop-blur-md">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        calendar_today
                      </span>
                      <span>Servis Terakhir: {primaryVehicle.lastServiceDate}</span>
                    </div>
                  </div>
                </div>

                {/* Health Bar */}
                <div className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface font-semibold text-xs md:text-sm">
                      <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
                        check_circle
                      </span>
                      <span>Indeks Kesehatan Unit</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-xs">
                      Kondisi Prima ({primaryVehicle.healthPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                    <div
                      className="h-full bg-tertiary rounded-full transition-all duration-500"
                      style={{ width: `${primaryVehicle.healthPercent}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Right Column: 3 Telemetry Metrics & Booking Buttons */}
              <div className="lg:col-span-6 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/40">
                    <div className="w-10 h-10 rounded-xl bg-primary-fixed text-primary mx-auto flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        oil_barrel
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block font-medium">Ganti Oli</span>
                    <span className="text-sm font-bold text-primary mt-0.5 block">800 km lagi</span>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/40">
                    <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-secondary mx-auto flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        badge
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block font-medium">Pajak STNK</span>
                    <span className="text-sm font-bold text-secondary mt-0.5 block">3 Bulan lagi</span>
                  </div>

                  <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/40">
                    <div className="w-10 h-10 rounded-xl bg-tertiary-fixed text-tertiary mx-auto flex items-center justify-center mb-2">
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        tire_repair
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant block font-medium">Tekanan Ban</span>
                    <span className="text-sm font-bold text-tertiary mt-0.5 block">32 PSI Ideal</span>
                  </div>
                </div>

                {/* Primary Booking Button */}
                <button
                  onClick={() => router.push(`/booking?vehicle=${primaryVehicle.id}`)}
                  className="w-full h-13 py-3.5 rounded-xl bg-primary text-on-primary font-bold text-sm md:text-base flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all hover:brightness-105"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    calendar_month
                  </span>
                  <span>Jadwalkan Tune Up / Servis Kendaraan</span>
                </button>

                {/* 2-col Secondary Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => alert("Histori servis komplit tercatat di database ServisIn.")}
                    className="h-11 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      history
                    </span>
                    <span>Riwayat Servis</span>
                  </button>
                  <button
                    onClick={() => alert("Formulir sunting data kendaraan terbuka.")}
                    className="h-11 rounded-xl bg-surface-container-low text-on-surface font-semibold text-xs md:text-sm flex items-center justify-center gap-2 hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                      edit
                    </span>
                    <span>Sunting Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Unit Tersimpan Lainnya (Desktop Responsive Grid) */}
        <div className="mt-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-headline-sm text-lg md:text-xl font-bold text-on-surface">
                Unit Tersimpan Lainnya
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Kendaraan sekunder dalam garasi keluarga Anda
              </p>
            </div>
            <span className="px-3 py-1 bg-surface-container-high rounded-full font-bold text-xs text-on-surface-variant">
              {otherVehicles.length} Unit
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherVehicles.map((veh) => (
              <div
                key={veh.id}
                className="bg-surface-container-lowest rounded-3xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                          two_wheeler
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-on-surface">
                          {veh.brand} {veh.model}
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {veh.year} • {veh.color}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 bg-surface-container-high rounded text-on-surface font-mono text-xs font-bold">
                      {veh.licensePlate}
                    </span>
                  </div>

                  <div className="relative h-40 rounded-2xl overflow-hidden">
                    <img src={veh.imageUrl} alt={veh.model} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
                  <button
                    onClick={() => handleSetActive(veh.id)}
                    className="text-secondary font-bold text-xs flex items-center gap-1.5 hover:underline"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      swap_horiz
                    </span>
                    <span>Jadikan Kendaraan Utama</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSetActive(veh.id);
                      router.push(`/booking?vehicle=${veh.id}`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs flex items-center gap-1 hover:brightness-105 shadow-sm"
                  >
                    <span>Servis Unit Ini</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Routine Protection Banner */}
        <div className="mt-8 bg-surface-container-low rounded-3xl p-6 border border-surface-container-high/60 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center flex-shrink-0 shadow-md">
            <span className="material-symbols-outlined" style={{ fontSize: 26 }}>
              shield
            </span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-sm md:text-base text-on-surface">
              ServisIn Proteksi Rutin Aktif
            </h4>
            <p className="text-xs md:text-sm text-on-surface-variant leading-relaxed mt-0.5">
              Notifikasi berkala dikirim otomatis via WhatsApp &amp; Push Alert 7 hari sebelum masa servis rutin atau masa berlaku pajak STNK Anda habis.
            </p>
          </div>
        </div>
      </main>

      {/* Modal: Tambah Unit Kendaraan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <h3 className="font-bold text-base text-on-surface">
                Tambah Unit Kendaraan Baru
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="flex flex-col gap-3">
              {modalError && (
                <div className="p-3 rounded-xl bg-error-container text-on-error-container text-xs font-semibold flex items-center gap-2 border border-error/30 animate-in fade-in">
                  <span className="material-symbols-outlined text-error" style={{ fontSize: 18 }}>error</span>
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Merk Kendaraan
                </label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Contoh: Toyota / Honda / Suzuki"
                  required
                  className="w-full h-11 px-3.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-on-surface block mb-1">
                  Model &amp; Varian
                </label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Contoh: HR-V RS Turbo 1.5"
                  required
                  className="w-full h-11 px-3.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="B 1234 XYZ"
                    required
                    className="w-full h-11 px-3.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-on-surface block mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    placeholder="2023"
                    required
                    className="w-full h-11 px-3.5 bg-surface-container-low rounded-xl text-xs md:text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-xl text-on-surface-variant text-[11px] font-semibold border border-surface-container-high/60">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 16 }}>
                  cloud_sync
                </span>
                <span>Tersinkronisasi otomatis ke Database Supabase</span>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full h-12 mt-2 rounded-xl bg-primary text-on-primary font-bold text-xs md:text-sm shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                      progress_activity
                    </span>
                    <span>Menyimpan ke Supabase...</span>
                  </>
                ) : (
                  <span>Simpan Kendaraan Baru</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Customer Bottom Nav (Auto hidden on desktop via md:hidden) */}
      <CustomerBottomNav />
    </div>
  );
}
