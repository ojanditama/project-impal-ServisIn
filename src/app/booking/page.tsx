"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";
import { dbStore } from "@/lib/store";
import { OrderController } from "@/controllers/OrderController";
import { Vehicle } from "@/models/Vehicle";
import { SupabaseService } from "@/lib/supabase";

interface ServicePackage {
  id: string;
  name: string;
  icon: string;
  price: number;
  originalPrice: number;
  duration: string;
  tag: string;
  desc: string;
  checklist: string[];
  defaultNotes: string;
  addon: {
    name: string;
    price: number;
    desc: string;
  };
}

const SERVICE_PACKAGES: Record<string, ServicePackage> = {
  tuneup: {
    id: "tuneup",
    name: "Tune Up Berkala + 32 Titik Inspeksi",
    icon: "tune",
    price: 299000,
    originalPrice: 380000,
    duration: "75 - 90 Menit",
    tag: "TERLARIS • REKOMENDASI MONTIR",
    desc: "Pembersihan ruang bakar, kalibrasi throttle body, pembersihan busi, dan pemindaian OBD-II komputer mesin.",
    checklist: ["Cek Rem & Ban", "Scanner OBD-II", "Uji Aki Digital", "Kuras Karbon"],
    defaultNotes: "Tarikan gas bawah agak berat saat mesin panas, tolong periksa celah busi dan filter udara.",
    addon: {
      name: "Bundling Oli Mesin Shell Helix Ultra 4L Full Synthetic",
      price: 50000,
      desc: "+ Rp 50.000 (Hemat 45% dari harga normal bengkel)",
    },
  },
  oli: {
    id: "oli",
    name: "Ganti Oli Mesin & Filter Genuine OEM",
    icon: "oil_barrel",
    price: 175000,
    originalPrice: 230000,
    duration: "30 - 45 Menit",
    tag: "PERAWATAN RUTIN",
    desc: "Penggantian oli mesin baru, filter oli genuine OEM, pengecekan kekentalan, dan pembersihan filter udara.",
    checklist: ["Ganti Filter Oli", "Cek Ring Baud", "Cek Filter Udara", "Reset Indikator"],
    defaultNotes: "Jadwal ganti oli rutin 5.000 km, tolong sekalian cek volume minyak rem dan air radiator.",
    addon: {
      name: "Engine Flush Pembersih Kerak Ruang Mesin",
      price: 35000,
      desc: "+ Rp 35.000 (Pembersihan residu endapan oli lama)",
    },
  },
  mudik: {
    id: "mudik",
    name: "Paket Mudik & Perjalanan Jauh 45 Titik",
    icon: "luggage",
    price: 450000,
    originalPrice: 580000,
    duration: "90 - 120 Menit",
    tag: "GARANSI MUDIK AMAN",
    desc: "Inspeksi komprehensif sistem pengereman, kaki-kaki, suspensi, radiator, kompresor AC, aki, ban, dan kelistrikan total.",
    checklist: ["Tes Minyak Rem", "Cek Kaki-Kaki", "Kuras Radiator", "Uji Alternator"],
    defaultNotes: "Persiapan jalan luar kota / mudik 500 km, tolong pastikan rem, ban serep, dan AC dingin maksimal.",
    addon: {
      name: "Cairan Radiator Coolant Prestone 4L Asli",
      price: 45000,
      desc: "+ Rp 45.000 (Cegah overheat di kemacetan panjang)",
    },
  },
  rem: {
    id: "rem",
    name: "Servis Rem & Kaki-Kaki Komplit",
    icon: "car_repair",
    price: 220000,
    originalPrice: 290000,
    duration: "45 - 60 Menit",
    tag: "SAFETY FIRST",
    desc: "Pembersihan kampas rem depan/belakang, bleeding minyak rem, pengecekan rotor disc brake, dan perbaikan bunyi decit.",
    checklist: ["Bongkar Kaliper Rem", "Bleeding Udara", "Brake Cleaner Spray", "Cek Ketebalan Pad"],
    defaultNotes: "Rem depan bunyi berdecit saat diinjak pelan dan pedal rem terasa agak dalam.",
    addon: {
      name: "Minyak Rem DOT 4 Heavy Duty 1L",
      price: 40000,
      desc: "+ Rp 40.000 (Titik didih tinggi anti blong saat turunan)",
    },
  },
  aki: {
    id: "aki",
    name: "Servis Aki & Sistem Kelistrikan Starter",
    icon: "bolt",
    price: 180000,
    originalPrice: 250000,
    duration: "30 - 45 Menit",
    tag: "SOLUSI MOGOK",
    desc: "Pengujian voltase CCA aki, pengisian arus dinamo ampere alternator, pembersihan kutub aki, dan jumper aki darurat.",
    checklist: ["Digital CCA Tester", "Tes Dinamo Ampere", "Bersihkan Terminal", "Cek Sekring Utama"],
    defaultNotes: "Mobil susah distarter saat pagi hari dan lampu utama agak redup saat AC menyala.",
    addon: {
      name: "Aki GS Astra Hybrid Maintenance Free (Tukar Tambah)",
      price: 650000,
      desc: "+ Rp 650.000 (Garansi tukar baru 12 bulan)",
    },
  },
  diagnostic: {
    id: "diagnostic",
    name: "Diagnosa Mesin Komputerisasi & Scanner OBD-II",
    icon: "psychology",
    price: 150000,
    originalPrice: 200000,
    duration: "30 - 45 Menit",
    tag: "AI DIAGNOSTIC",
    desc: "Pemindaian sensor ECU mobil, penghapusan kode error DTC, kalibrasi sensor gas, dan rekam live telemetri mesin.",
    checklist: ["Scan Full ECU All-System", "Clear DTC Check Engine", "Kalibrasi Throttle", "Cek Sensor Oksigen"],
    defaultNotes: "Lampu indikator check engine kuning menyala di speedometer dan tarikan agak tersendat.",
    addon: {
      name: "Cairan Pembersih Sensor MAF & Throttle Body",
      price: 35000,
      desc: "+ Rp 35.000 (Pembersihan sensor aliran udara presisi)",
    },
  },
};

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmergency = searchParams.get("emergency") === "true";
  const queryService = searchParams.get("service")?.toLowerCase() || "";

  // Determine initial package based on query params
  const getInitialCategory = () => {
    if (isEmergency || queryService.includes("aki") || queryService.includes("mogok")) return "aki";
    if (queryService.includes("oli")) return "oli";
    if (queryService.includes("mudik")) return "mudik";
    if (queryService.includes("rem")) return "rem";
    if (queryService.includes("diagnos") || queryService.includes("ai")) return "diagnostic";
    return "tuneup";
  };

  const [category, setCategory] = useState<string>("tuneup");
  const [includeAddon, setIncludeAddon] = useState(true);
  const [locationType, setLocationType] = useState<"home" | "office">("home");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  // Sync category on initial load or param change
  useEffect(() => {
    const initCat = getInitialCategory();
    setCategory(initCat);
    setNotes(SERVICE_PACKAGES[initCat]?.defaultNotes || "");
  }, [searchParams]);

  // Load and sync vehicles
  useEffect(() => {
    const currentUser = dbStore.getCurrentUser();
    const allVehs = dbStore.getVehicles(currentUser.id);
    setVehicles(allVehs);

    const urlVehId = searchParams.get("vehicle");
    if (urlVehId && allVehs.some((v) => v.id === urlVehId)) {
      setSelectedVehicleId(urlVehId);
    } else {
      const active = dbStore.getActiveVehicle(currentUser.id);
      if (active) setSelectedVehicleId(active.id);
      else if (allVehs[0]) setSelectedVehicleId(allVehs[0].id);
    }

    // Background fetch from Supabase
    SupabaseService.getVehicles(currentUser.id)
      .then((sbVehs) => {
        if (Array.isArray(sbVehs) && sbVehs.length > 0) {
          const mapped = sbVehs.map((v) => new Vehicle(v));
          dbStore.setVehicles(mapped);
          setVehicles(mapped);
          if (!urlVehId) {
            const act = dbStore.getActiveVehicle(currentUser.id);
            if (act) setSelectedVehicleId(act.id);
          }
        }
      })
      .catch(() => {});
  }, [searchParams]);

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ||
    vehicles[0] ||
    dbStore.vehicles[0];

  const selectedPkg = SERVICE_PACKAGES[category] || SERVICE_PACKAGES.tuneup;
  const basePrice = selectedPkg.price;
  const addonPrice = includeAddon ? selectedPkg.addon.price : 0;
  const totalPrice = basePrice + addonPrice;

  const handleSelectCategory = (catKey: string) => {
    setCategory(catKey);
    const pkg = SERVICE_PACKAGES[catKey];
    if (pkg) {
      setNotes(pkg.defaultNotes);
    }
  };

  const handleConfirmOrder = () => {
    setLoading(true);

    setTimeout(() => {
      const currentUser = dbStore.getCurrentUser();
      const res = OrderController.createServiceOrder({
        customerId: currentUser.id,
        vehicleId: selectedVehicle.id,
        serviceType: isEmergency ? `Panggilan Darurat: ${selectedPkg.name}` : selectedPkg.name,
        locationCoord: {
          lat: -6.2088,
          lng: 106.8456,
          address:
            locationType === "home"
              ? "Jl. Sudirman No. 42, RT 04 / RW 02, Menteng, Jakarta Pusat"
              : "Kantor Pusat Menteng Bintaro, Jakarta Selatan",
        },
        totalCost: totalPrice,
        items: [
          { name: selectedPkg.name, price: basePrice },
          ...(includeAddon ? [{ name: selectedPkg.addon.name, price: selectedPkg.addon.price }] : []),
          { name: "Biaya Kunjungan Mekanik (PROMO)", price: 0 },
        ],
        notes,
        isEmergency,
        isVIP: dbStore.getUserTier(currentUser.id) === "VIP",
      });

      setLoading(false);
      if (res.success && res.order) {
        router.push(`/tracking?id=${res.order.id}`);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Universal Responsive Navbar */}
      <AppNavbar showBack={true} backHref="/dashboard" title={isEmergency ? "Panggilan Montir Darurat" : "Booking Servis Berkala"} />

      {/* Main Content Area */}
      <main className="w-full max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-8 flex-1 pb-32 lg:pb-12">
        {/* Stepper Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-2xl md:text-3xl font-extrabold text-on-surface">
              {isEmergency ? "Panggilan Montir Darurat 24/7" : "Jadwalkan Servis Berkala"}
            </h1>
            <p className="font-body-md text-xs md:text-sm text-on-surface-variant mt-1 leading-relaxed">
              {isEmergency
                ? "Mekanik terdekat langsung meluncur ke titik GPS Anda dengan estimasi tiba <15 menit."
                : "Pilih jenis layanan, tanggal & waktu fleksibel. Mekanik bersertifikasi BNSP datang langsung ke garasi Anda."}
            </p>
          </div>

          {/* 3-Step Stepper */}
          <div className="bg-surface-container-low p-2.5 rounded-2xl flex items-center gap-3 border border-surface-container-high/60 self-start md:self-auto">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-xs font-bold shadow-sm">
                1
              </span>
              <span className="text-xs font-bold text-on-surface">Pilih Servis</span>
            </div>
            <div className="w-6 h-0.5 bg-primary-container"></div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-xs font-bold">
                2
              </span>
              <span className="text-xs text-on-surface-variant hidden sm:inline">Lokasi</span>
            </div>
            <div className="w-6 h-0.5 bg-surface-container-highest"></div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-surface-container text-on-surface-variant flex items-center justify-center text-xs font-bold">
                3
              </span>
              <span className="text-xs text-on-surface-variant hidden sm:inline">Konfirmasi</span>
            </div>
          </div>
        </div>

        {/* 12-Column Desktop Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Steps & Options */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* Kendaraan Servis Card */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                    directions_car
                  </span>
                  <span>Kendaraan Terpilih</span>
                </div>
                <Link href="/vehicles" className="text-secondary font-bold text-xs hover:underline">
                  Kelola Garasi ⇄
                </Link>
              </div>

              {/* Quick Vehicle Selector if user has multiple vehicles */}
              {vehicles.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {vehicles.map((v) => {
                    const isSel = (selectedVehicle?.id === v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => {
                          setSelectedVehicleId(v.id);
                          const cur = dbStore.getCurrentUser();
                          dbStore.setActiveVehicle(cur.id, v.id);
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                          isSel
                            ? "bg-primary text-on-primary shadow-sm"
                            : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                        }`}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: 15 }}>
                          {isSel ? "check_circle" : "directions_car"}
                        </span>
                        <span>{v.brand} {v.model} ({v.licensePlate})</span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border border-surface-container-high/60 relative overflow-hidden flex items-center justify-between">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary"></div>
                <div className="flex items-center gap-3.5 pl-2">
                  <img
                    src={selectedVehicle?.imageUrl || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=150&q=80"}
                    alt={selectedVehicle?.model || "Kendaraan"}
                    className="w-16 h-14 object-cover rounded-xl border border-surface-container-high/40"
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-primary-fixed text-primary font-bold text-[10px]">
                        {selectedVehicle?.isActive ? "UNIT UTAMA" : "UNIT GARASI"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-tertiary font-bold text-[10px]">
                        Kondisi {selectedVehicle?.healthPercent ?? 94}%
                      </span>
                    </div>
                    <h3 className="font-bold text-sm md:text-base text-on-surface mt-1">
                      {selectedVehicle?.brand} {selectedVehicle?.model} {selectedVehicle?.year ? `(${selectedVehicle.year})` : ""}
                    </h3>
                    <span className="text-xs text-on-surface-variant">
                      {selectedVehicle?.licensePlate} • Odometer: {(selectedVehicle?.odometerKm ?? 34200).toLocaleString("id-ID")} km
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/vehicles")}
                  title="Ganti ke Garasi"
                  className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    swap_horiz
                  </span>
                </button>
              </div>
            </div>

            {/* Paket Pengerjaan */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                    construction
                  </span>
                  <span>Pilihan Paket Servis</span>
                </div>
                <span className="text-tertiary font-bold text-xs flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                    verified
                  </span>{" "}
                  Garansi Servis 30 Hari
                </span>
              </div>

              {/* Service Categories Selector Chips */}
              <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {Object.values(SERVICE_PACKAGES).map((pkg) => (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelectCategory(pkg.id)}
                    className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 flex-shrink-0 transition-all ${
                      category === pkg.id
                        ? "bg-primary text-on-primary shadow-md scale-[1.02]"
                        : "bg-surface-container-low text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      {pkg.icon}
                    </span>
                    <span>{pkg.name.split("+")[0].split("&")[0].trim()}</span>
                  </button>
                ))}
              </div>

              {/* Selected Package Details Card (Dynamic) */}
              <div className="bg-surface-container-lowest rounded-3xl p-5 md:p-6 shadow-sm border-2 border-primary/50 flex flex-col gap-4 relative animate-in fade-in-50">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed text-secondary font-bold text-[10px]">
                      {selectedPkg.tag}
                    </span>
                    <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface mt-1.5">
                      {selectedPkg.name}
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      {selectedPkg.desc}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs shadow-sm flex-shrink-0">
                    ✓
                  </div>
                </div>

                {/* Dynamic Checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-on-surface bg-surface-container-low p-3.5 rounded-2xl">
                  {selectedPkg.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 18 }}>
                        check_circle
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-surface-container-high/60">
                  <span className="text-xs text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                      schedule
                    </span>
                    Estimasi Pengerjaan: {selectedPkg.duration}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant line-through block">
                      Rp {selectedPkg.originalPrice.toLocaleString("id-ID")}
                    </span>
                    <span className="font-headline-md text-base md:text-lg font-bold text-primary">
                      Rp {selectedPkg.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Addon Bundling Checkbox Card */}
              <label className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-high/60 flex items-center justify-between cursor-pointer hover:bg-surface-container transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                      inventory_2
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-xs md:text-sm text-on-surface">
                      {selectedPkg.addon.name}
                    </span>
                    <span className="text-xs text-primary font-semibold">
                      {selectedPkg.addon.desc}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={includeAddon}
                  onChange={(e) => setIncludeAddon(e.target.checked)}
                  className="w-5 h-5 rounded text-primary accent-primary cursor-pointer"
                />
              </label>
            </div>

            {/* Lokasi Kedatangan */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                    location_on
                  </span>
                  <span>Lokasi Kedatangan Mekanik</span>
                </div>
                <button
                  type="button"
                  onClick={() => alert("Pilih titik koordinat baru di Google Maps.")}
                  className="text-secondary font-bold text-xs hover:underline"
                >
                  + Tambah Alamat Baru
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setLocationType("home")}
                  className={`p-3.5 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                    locationType === "home"
                      ? "bg-surface-container-lowest border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-surface-container-low border-surface-container-high/60 text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 24 }}>
                    home
                  </span>
                  <div>
                    <span className="font-bold text-xs md:text-sm text-on-surface block">
                      Rumah (Garasi)
                    </span>
                    <span className="text-[11px] text-tertiary font-semibold">Terpilih</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType("office")}
                  className={`p-3.5 rounded-2xl flex items-center gap-3 border transition-all text-left ${
                    locationType === "office"
                      ? "bg-surface-container-lowest border-primary ring-2 ring-primary/20 shadow-sm"
                      : "bg-surface-container-low border-surface-container-high/60 text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 24 }}>
                    apartment
                  </span>
                  <div>
                    <span className="font-bold text-xs md:text-sm text-on-surface block">
                      Kantor Pusat
                    </span>
                    <span className="text-[11px] text-on-surface-variant">Menteng Bintaro</span>
                  </div>
                </button>
              </div>

              {/* Address Card */}
              <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 flex flex-col gap-2.5 shadow-sm">
                <div className="flex items-start gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-secondary-fixed/40 flex items-center justify-center text-primary flex-shrink-0 border border-secondary-fixed">
                    <span className="material-symbols-outlined" style={{ fontSize: 30 }}>
                      map
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant text-[10px] font-bold">
                        ALAMAT KEDATANGAN
                      </span>
                      <button
                        type="button"
                        onClick={() => alert("Geser pin alamat di peta.")}
                        className="text-secondary text-xs font-bold hover:underline"
                      >
                        Ubah Pin GPS
                      </button>
                    </div>
                    <p className="font-bold text-sm text-on-surface mt-1">
                      {locationType === "home"
                        ? "Jl. Sudirman No. 42, RT 04 / RW 02"
                        : "Gedung Cyber 2 Tower Lt. 12"}
                    </p>
                    <p className="text-xs text-on-surface-variant">
                      {locationType === "home"
                        ? "Menteng, Jakarta Pusat, DKI Jakarta 10310"
                        : "Jl. HR Rasuna Said Blok X-5, Kuningan, Jakarta Selatan"}
                    </p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-2.5 rounded-xl text-xs text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 18 }}>
                    info
                  </span>
                  <span>Catatan akses: Garasi muat mobil, permukaan rata dengan kanopi pelindung.</span>
                </div>
              </div>
            </div>

            {/* Preferensi & Catatan Kendaraan */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: 20 }}>
                  engineering
                </span>
                <span>Preferensi Teknisi &amp; Catatan Khusus</span>
              </div>

              <div className="bg-surface-container-lowest rounded-2xl p-4 border border-surface-container-high/60 flex flex-col gap-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=120&h=120&q=80"
                      alt="Teknisi"
                      className="w-11 h-11 rounded-full object-cover ring-2 ring-primary-container/20"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">
                          Bambang Sudiro (BNSP Level IV)
                        </span>
                        <span className="px-2 py-0.5 bg-secondary-fixed text-secondary font-bold text-[10px] rounded">
                          Ahli Mesin Berpengalaman
                        </span>
                      </div>
                      <span className="text-xs text-on-surface-variant">
                        Rating 4.95/5.0 • 450+ Servis Selesai
                      </span>
                    </div>
                  </div>
                  <span className="w-6 h-6 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center text-xs font-bold">
                    ✓
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-on-surface-variant mb-1.5">
                    <span>Catatan / Gejala Kendala Mesin</span>
                    <span>Maks. 200 karakter</span>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 bg-surface-container-low rounded-xl text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary border-none leading-relaxed"
                    placeholder="Tuliskan keluhan mesin..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Price Summary & Order Action (Desktop Sidebar) */}
          <div className="lg:col-span-5 flex flex-col gap-4 lg:sticky lg:top-24">
            <div className="bg-surface-container-lowest rounded-3xl p-6 border border-surface-container-high shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-sm text-base md:text-lg font-bold text-on-surface">
                  Rincian Estimasi Biaya
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-bold text-[11px]">
                  Garansi Biaya Pasti
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-xs md:text-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span>{selectedPkg.name}</span>
                  <span className="font-semibold text-on-surface">
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                </div>
                {includeAddon && (
                  <div className="flex justify-between">
                    <span>{selectedPkg.addon.name}</span>
                    <span className="font-semibold text-on-surface">
                      Rp {selectedPkg.addon.price.toLocaleString("id-ID")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5">
                    Biaya Kunjungan Mekanik{" "}
                    <span className="px-2 py-0.2 bg-primary-fixed text-primary font-bold text-[10px] rounded">
                      PROMO
                    </span>
                  </span>
                  <span className="text-tertiary font-bold">
                    <span className="line-through text-on-surface-variant mr-1 font-normal">
                      Rp 45.000
                    </span>
                    Gratis
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-container-high flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase font-bold text-on-surface-variant block">
                    TOTAL PEMBAYARAN
                  </span>
                  <span className="font-headline-md text-xl md:text-2xl font-bold text-primary">
                    Rp {totalPrice.toLocaleString("id-ID")}
                  </span>
                </div>
                <span className="text-xs text-tertiary font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    verified
                  </span>
                  Bayar Setelah Selesai
                </span>
              </div>

              {/* Big Desktop CTA */}
              <button
                onClick={handleConfirmOrder}
                disabled={loading}
                className="w-full h-14 rounded-2xl bg-primary text-on-primary font-bold text-sm md:text-base flex items-center justify-between px-5 shadow-xl hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
              >
                <div className="text-left flex flex-col">
                  <span className="text-[10px] font-normal uppercase text-on-primary/80">
                    {selectedPkg.name}
                  </span>
                  <span>Konfirmasi Booking Sekarang</span>
                </div>
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
                    arrow_forward
                  </span>
                )}
              </button>

              <p className="text-[11px] text-center text-on-surface-variant leading-tight">
                Bebas ubah jadwal atau pembatalan hingga 2 jam sebelum kedatangan teknisi.
              </p>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-surface-container-high text-xs text-on-surface-variant">
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-secondary" style={{ fontSize: 22 }}>
                    shield
                  </span>
                  <span className="font-semibold text-[11px]">Garansi 30 Hari</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 22 }}>
                    workspace_premium
                  </span>
                  <span className="font-semibold text-[11px]">Teknisi BNSP</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: 22 }}>
                    alarm_on
                  </span>
                  <span className="font-semibold text-[11px]">On-Time Or Free</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar (Only visible on small mobile screens) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-surface/95 backdrop-blur-md border-t border-surface-container-high/60 z-40">
        <button
          onClick={handleConfirmOrder}
          disabled={loading}
          className="w-full h-14 rounded-xl bg-primary text-on-primary font-bold flex items-center justify-between px-5 shadow-lg active:scale-[0.99] transition-all hover:brightness-105 disabled:opacity-70"
        >
          <div className="text-left flex flex-col">
            <span className="text-[10px] font-normal uppercase text-on-primary/80">
              {selectedPkg.name}
            </span>
            <span>Konfirmasi Booking • Rp {totalPrice.toLocaleString("id-ID")}</span>
          </div>
          {loading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              arrow_forward
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <BookingContent />
    </Suspense>
  );
}
