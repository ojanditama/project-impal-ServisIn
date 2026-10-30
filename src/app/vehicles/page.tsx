"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { dbStore } from "@/lib/store";
import { Vehicle } from "@/models/Vehicle";

export default function VehiclesPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>(dbStore.vehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBrand, setNewBrand] = useState("Honda");
  const [newModel, setNewModel] = useState("HR-V RS Turbo 1.5");
  const [newPlate, setNewPlate] = useState("B 9876 XYZ");
  const [newYear, setNewYear] = useState(2023);

  const handleSetActive = (id: string) => {
    const updated = vehicles.map((v) => {
      v.isActive = v.id === id;
      return v;
    });
    setVehicles([...updated]);
    dbStore.vehicles = [...updated];
  };

  const handleAddVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newVeh = new Vehicle({
      id: "veh-" + Date.now(),
      userId: "usr-cst-001",
      brand: newBrand,
      model: newModel,
      year: newYear,
      licensePlate: newPlate,
      isActive: false,
      odometerKm: 12000,
      healthPercent: 96,
      color: "Putih Mutiara",
    });

    const updated = [...vehicles, newVeh];
    setVehicles(updated);
    dbStore.vehicles = updated;
    setIsModalOpen(false);
  };

  const primaryVehicle = vehicles.find((v) => v.isActive) || vehicles[0];
  const otherVehicles = vehicles.filter((v) => v.id !== primaryVehicle?.id);

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 pb-12 selection:bg-primary-fixed selection:text-on-primary-fixed">
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
          Manajemen Profil Kendaraan
        </h1>

        <Link href="/premium" className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary-container/30">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"
            alt="Profil"
            className="w-full h-full object-cover"
          />
        </Link>
      </div>

      {/* Section Title & Add Button */}
      <div className="flex items-center justify-between mt-3 mb-2">
        <div>
          <span className="font-label-sm text-[10px] uppercase font-bold tracking-wider text-primary">
            GARASI DIGITAL
          </span>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
            Armada Saya
          </h2>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-10 px-3.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            add
          </span>
          <span>Tambah Unit</span>
        </button>
      </div>

      {/* Primary Active Vehicle Card */}
      {primaryVehicle && (
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-md border border-surface-container-high/60 flex flex-col gap-3.5 mt-2">
          {/* Top row */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                  directions_car
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-secondary-fixed text-secondary font-label-sm text-[10px] font-bold">
                    UTAMA
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-[10px]">
                    {primaryVehicle.year} • {primaryVehicle.color}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface mt-0.5">
                  {primaryVehicle.brand} {primaryVehicle.model}
                </h3>
              </div>
            </div>

            <div className="bg-surface-container-high px-2.5 py-1 rounded-lg text-center font-mono font-bold text-label-md text-on-surface">
              {primaryVehicle.licensePlate}
            </div>
          </div>

          {/* Photo Banner */}
          <div className="relative h-44 rounded-xl overflow-hidden shadow-inner">
            <img
              src={primaryVehicle.imageUrl}
              alt={primaryVehicle.model}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-between p-3 text-white">
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  speed
                </span>
                <span>{primaryVehicle.odometerKm.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg bg-black/40 backdrop-blur-md">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  calendar_today
                </span>
                <span>Servis: {primaryVehicle.lastServiceDate}</span>
              </div>
            </div>
          </div>

          {/* Status Kesehatan Unit */}
          <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface font-label-md text-label-md font-semibold">
                <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 20 }}>
                  check_circle
                </span>
                <span>Status Kesehatan Unit</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm font-bold">
                Kondisi Prima ({primaryVehicle.healthPercent}%)
              </span>
            </div>

            <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary rounded-full"
                style={{ width: `${primaryVehicle.healthPercent}%` }}
              ></div>
            </div>
          </div>

          {/* 3 Telemetry Grid */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container-high/40">
              <div className="w-7 h-7 rounded-lg bg-primary-fixed text-primary-container mx-auto flex items-center justify-center mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  oil_barrel
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant block font-medium">Ganti Oli</span>
              <span className="text-xs font-bold text-primary-container">800 km lg</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container-high/40">
              <div className="w-7 h-7 rounded-lg bg-secondary-fixed text-secondary mx-auto flex items-center justify-center mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  badge
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant block font-medium">Pajak STNK</span>
              <span className="text-xs font-bold text-secondary">3 Bln lagi</span>
            </div>

            <div className="bg-surface-container-low p-2.5 rounded-xl border border-surface-container-high/40">
              <div className="w-7 h-7 rounded-lg bg-tertiary-fixed text-tertiary mx-auto flex items-center justify-center mb-1">
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                  tire_repair
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant block font-medium">Tekanan Ban</span>
              <span className="text-xs font-bold text-tertiary">32 PSI Ideal</span>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => router.push(`/booking?vehicle=${primaryVehicle.id}`)}
            className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all hover:brightness-105"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
              calendar_month
            </span>
            <span>Jadwalkan Tune Up</span>
          </button>

          {/* 2-col Secondary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => alert("Histori servis komplit tercatat di cloud ServisIn.")}
              className="h-10 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                history
              </span>
              <span>Riwayat Servis</span>
            </button>
            <button
              onClick={() => alert("Formulir sunting data kendaraan terbuka.")}
              className="h-10 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                edit
              </span>
              <span>Sunting Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Unit Tersimpan Lainnya */}
      <div className="mt-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
            Unit Tersimpan Lainnya
          </h3>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {otherVehicles.length} Kendaraan
          </span>
        </div>

        {otherVehicles.map((veh) => (
          <div
            key={veh.id}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined" style={{ fontSize: 22 }}>
                    two_wheeler
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface">
                      {veh.brand} {veh.model}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-[10px] font-bold">
                      Siap Pakai
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">
                    {veh.year} • {veh.color}
                  </span>
                </div>
              </div>

              <span className="px-2 py-0.5 bg-surface-container-high rounded text-on-surface font-mono text-xs font-bold">
                {veh.licensePlate}
              </span>
            </div>

            <div className="relative h-32 rounded-xl overflow-hidden">
              <img src={veh.imageUrl} alt={veh.model} className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={() => handleSetActive(veh.id)}
                className="text-secondary font-label-md text-label-md font-bold flex items-center gap-1.5 hover:underline"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  swap_horiz
                </span>
                <span>Jadikan Kendaraan Utama</span>
              </button>

              <button
                onClick={() => alert("Menu opsi kendaraan.")}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  more_vert
                </span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Routine Protection Banner */}
      <div className="mt-5 bg-surface-container-low rounded-2xl p-4 border border-surface-container-high/60 flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0 shadow-md">
          <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
            shield
          </span>
        </div>
        <div className="flex flex-col">
          <h4 className="font-label-lg text-label-lg font-bold text-on-surface">
            ServisIn Proteksi Rutin Aktif
          </h4>
          <p className="font-body-sm text-[11px] text-on-surface-variant leading-tight mt-0.5">
            Notifikasi berkala via WhatsApp &amp; Push Alert sebelum masa servis atau pajak STNK habis.
          </p>
        </div>
      </div>

      {/* Modal: Tambah Unit Kendaraan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-surface-container-lowest w-full max-w-md rounded-t-3xl sm:rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-surface-container-high/60 pb-3">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Tambah Unit Kendaraan
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="flex flex-col gap-3">
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Merk Kendaraan
                </label>
                <input
                  type="text"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="Contoh: Toyota / Honda / Suzuki"
                  required
                  className="w-full h-11 px-3 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Model &amp; Varian
                </label>
                <input
                  type="text"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  placeholder="Contoh: HR-V RS Turbo 1.5"
                  required
                  className="w-full h-11 px-3 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">
                    Plat Nomor
                  </label>
                  <input
                    type="text"
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                    placeholder="B 1234 XYZ"
                    required
                    className="w-full h-11 px-3 bg-surface-container-low rounded-xl text-on-surface font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary-container uppercase"
                  />
                </div>
                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">
                    Tahun Pembuatan
                  </label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    placeholder="2023"
                    required
                    className="w-full h-11 px-3 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full h-12 mt-2 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold shadow-md hover:brightness-105"
              >
                Simpan Kendaraan Baru
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
