"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthController } from "@/controllers/AuthController";
import { dbStore } from "@/lib/store";
import { User } from "@/models/User";
import { SupabaseService } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"Customer" | "Mechanic">("Customer");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicleType, setVehicleType] = useState("Mobil (MPV, SUV, Sedan, City Car)");
  const [mechanicSpec, setMechanicSpec] = useState("Mekanik Mobil BNSP Level III / IV");
  const [ktpNumber, setKtpNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lang, setLang] = useState<"ID" | "EN">("ID");

  // Sync users from Supabase on mount for real-time duplicate checking
  useEffect(() => {
    SupabaseService.getAllUsers()
      .then((sbUsers) => {
        if (Array.isArray(sbUsers) && sbUsers.length > 0) {
          sbUsers.forEach((su) => {
            dbStore.addUser(
              new User({
                id: su.id,
                name: su.name,
                phone: su.phone,
                email: su.email,
                passwordHash: su.passwordHash || "password123",
                role: su.role === "MECHANIC" ? "Mechanic" : su.role === "ADMIN" ? "Admin" : "Customer",
                status: su.status || "Active",
                tier: su.tier || "Regular",
              })
            );
          });
        }
      })
      .catch(() => {});
  }, []);

  // Field-level error validation state
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Individual field validator
  const validateField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "name": {
        const val = value.trim();
        if (!val) return "Nama lengkap wajib diisi tidak boleh kosong.";
        const hasDigits = /\d/.test(val);
        const hasSymbols = /[^a-zA-Z\s]/.test(val);
        if (hasDigits && hasSymbols) {
          return "Nama tidak boleh memakai lambang dan angka.";
        }
        if (hasDigits) {
          return "Nama tidak boleh memakai angka.";
        }
        if (hasSymbols) {
          return "Nama tidak boleh memakai lambang.";
        }
        return "";
      }
      case "phone": {
        const cleanDigits = value.replace(/[^0-9]/g, "");
        if (!value.trim()) return "Nomor WhatsApp wajib diisi tidak boleh kosong.";
        if (cleanDigits.length < 11) {
          return `Nomor WhatsApp kurang dari 11 digit (saat ini ${cleanDigits.length} digit).`;
        }
        if (cleanDigits.length > 11) {
          return `Nomor WhatsApp lebih dari 11 digit (saat ini ${cleanDigits.length} digit, maksimal 11 digit).`;
        }
        // Check local store duplicate phone
        const duplicatePhone = dbStore.getUsers().find((u) => {
          const uDigits = u.phone.replace(/[^0-9]/g, "");
          return uDigits === cleanDigits || (cleanDigits.length >= 8 && uDigits.endsWith(cleanDigits.slice(-8)));
        });
        if (duplicatePhone) {
          return `Peringatan: Nomor WhatsApp (${value}) sudah terdaftar di sistem. Gunakan nomor lain.`;
        }
        return "";
      }
      case "email": {
        const val = value.trim().toLowerCase();
        if (!val) return "Alamat email wajib diisi tidak boleh kosong.";
        if (!val.includes("@")) return "Alamat email tidak valid (harus mengandung karakter '@').";
        // Check local store duplicate email
        const duplicateEmail = dbStore.getUsers().find(
          (u) => u.email && u.email.trim().toLowerCase() === val
        );
        if (duplicateEmail) {
          return `Peringatan: Alamat email (${value}) sudah terdaftar di sistem. Gunakan email lain.`;
        }
        return "";
      }
      case "ktpNumber": {
        if (role === "Mechanic") {
          const cleanKtp = value.replace(/[^0-9]/g, "");
          if (!value.trim()) return "Nomor KTP wajib diisi tidak boleh kosong.";
          if (cleanKtp.length < 16) return `Nomor KTP kurang dari 16 digit (saat ini ${cleanKtp.length} digit).`;
          if (cleanKtp.length > 16) return `Nomor KTP lebih dari 16 digit (saat ini ${cleanKtp.length} digit).`;
        }
        return "";
      }
      case "password":
        if (!value) return "Kata sandi wajib diisi tidak boleh kosong.";
        if (value.length < 6) return `Kata sandi kurang dari 6 karakter (saat ini ${value.length} karakter, minimal 6 karakter).`;
        return "";
      case "confirmPassword":
        if (!value) return "Ulangi kata sandi wajib diisi tidak boleh kosong.";
        if (value !== password) return "Konfirmasi kata sandi tidak cocok dengan kata sandi.";
        return "";
      default:
        return "";
    }
  };

  // Validate all fields
  const validateAll = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const nameErr = validateField("name", name);
    if (nameErr) errs.name = nameErr;

    const phoneErr = validateField("phone", phone);
    if (phoneErr) errs.phone = phoneErr;

    const emailErr = validateField("email", email);
    if (emailErr) errs.email = emailErr;

    if (role === "Mechanic") {
      const ktpErr = validateField("ktpNumber", ktpNumber);
      if (ktpErr) errs.ktpNumber = ktpErr;
    }

    const passErr = validateField("password", password);
    if (passErr) errs.password = passErr;

    const confErr = validateField("confirmPassword", confirmPassword);
    if (confErr) errs.confirmPassword = confErr;

    if (!agreeTerms) {
      errs.agreeTerms = "Silakan setujui Syarat & Ketentuan serta Kebijakan Privasi.";
    }

    return errs;
  };

  // Autofill random test user that won't conflict with Supabase
  const handleAutoFillTest = () => {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    // Standard exactly 11 digits: 81 + 9 digits = 11 digits
    const generatedPhone = "81" + randomSuffix.toString().slice(0, 9);
    setName(role === "Customer" ? "Fauzan Pelanggan Baru" : "Fauzan Mekanik Mitra");
    setPhone(generatedPhone);
    setEmail(`user_${randomSuffix}@servisin.id`);
    setKtpNumber("3174092801900002");
    setPassword("rahasia123");
    setConfirmPassword("rahasia123");
    setAgreeTerms(true);
    setFieldErrors({});
    setError("");
  };

  // Mechanic Pending Modal state
  const [showMechanicPendingModal, setShowMechanicPendingModal] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs = validateAll();
    setFieldErrors(errs);
    setTouched({
      name: true,
      phone: true,
      email: true,
      ktpNumber: true,
      password: true,
      confirmPassword: true,
      agreeTerms: true,
    });

    const errorKeys = Object.keys(errs);
    if (errorKeys.length > 0) {
      setError(errs[errorKeys[0]]);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const cleanDigits = phone.replace(/[^0-9]/g, "");
      const fullPhone = cleanDigits.startsWith("0") ? cleanDigits : "0" + cleanDigits;
      const res = await AuthController.handleRegister({
        name,
        phone: fullPhone,
        email: email || `${fullPhone}@servisin.id`,
        password,
        role: role === "Customer" ? "Customer" : "Mechanic",
        ktpNumber,
      });

      setLoading(false);

      if (res.success) {
        setSuccessMsg(res.message);
        setTimeout(() => {
          if (role === "Customer") {
            router.push(`/login?registered=1&role=Customer&identifier=${encodeURIComponent(fullPhone)}`);
          } else {
            setShowMechanicPendingModal(true);
          }
        }, 1200);
      } else {
        setError(res.message);
        if (res.message.includes("Alamat email") || res.message.includes("email") || res.message.includes("Email")) {
          setFieldErrors((prev) => ({ ...prev, email: res.message }));
        }
        if (res.message.includes("Nomor WhatsApp") || res.message.includes("telepon") || res.message.includes("phone")) {
          setFieldErrors((prev) => ({ ...prev, phone: res.message }));
        }
        if (res.message.includes("KTP")) {
          setFieldErrors((prev) => ({ ...prev, ktpNumber: res.message }));
        }
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Gagal melakukan pendaftaran ke database Supabase.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col p-4 selection:bg-primary-fixed selection:text-on-primary-fixed relative">
      {/* Top Bar with Back, Logo, and Lang Switcher */}
      <div className="flex items-center justify-between pt-2 pb-3">
        <Link
          href="/login"
          className="w-10 h-10 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            arrow_back
          </span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-lowest rounded-full shadow-sm border border-surface-container-high/40">
          <span className="material-symbols-outlined text-primary-container" style={{ fontSize: 18 }}>
            build
          </span>
          <span className="font-headline-sm text-label-md text-on-surface font-bold">ServisIn</span>
        </div>

        <div className="flex items-center bg-surface-container-low p-0.5 rounded-full border border-surface-container-high/40 text-label-sm font-semibold">
          <button
            type="button"
            onClick={() => setLang("ID")}
            className={`px-2.5 py-1 rounded-full transition-all ${
              lang === "ID"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={() => setLang("EN")}
            className={`px-2.5 py-1 rounded-full transition-all ${
              lang === "EN"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="mt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold mb-2">
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            verified
          </span>
          <span>Bebas Antre • Montir Bergaransi</span>
        </div>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-on-surface">
          Daftar Akun ServisIn
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 leading-snug">
          {role === "Customer"
            ? "Satu akun untuk rawat kendaraan, panggil mekanik bersertifikasi, dan pantau histori servis digital terintegrasi."
            : "Gabung sebagai Mitra Mekanik bersertifikasi, terima panggilan servis darurat di sekitar lokasi Anda."}
        </p>
      </div>

      {/* Role Tabs */}
      <div className="mt-4 bg-surface-container p-1 rounded-xl flex items-center gap-1 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setRole("Customer");
            setError("");
          }}
          className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all font-label-md text-label-md ${
            role === "Customer"
              ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            directions_car
          </span>
          <span>Pemilik Kendaraan</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("Mechanic");
            setError("");
          }}
          className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all font-label-md text-label-md ${
            role === "Mechanic"
              ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
              : "text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            handyman
          </span>
          <span>Mitra Mekanik</span>
        </button>
      </div>

      {/* Quick Test Autofill Bar */}
      <div className="mt-3 flex items-center justify-between p-2.5 bg-primary-fixed/50 rounded-2xl border border-primary/20">
        <div className="flex items-center gap-2 text-xs text-on-primary-fixed font-semibold">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: 18 }}>
            bolt
          </span>
          <span>Mau uji daftar user baru?</span>
        </div>
        <button
          type="button"
          onClick={handleAutoFillTest}
          className="px-3 py-1 bg-primary text-on-primary rounded-xl text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-1"
        >
          <span>Isi Data Tes Otomatis</span>
        </button>
      </div>

      {/* Registration Form */}
      <form noValidate onSubmit={handleRegisterSubmit} className="mt-4 flex flex-col gap-3.5 pb-8">
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed text-body-sm flex items-center gap-2 border border-tertiary shadow-sm">
            <span className="material-symbols-outlined text-tertiary">check_circle</span>
            <span className="font-bold">{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2 border border-error/30">
            <span className="material-symbols-outlined text-error">error</span>
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Nama Lengkap</label>
            <span className="text-secondary font-label-sm text-label-sm">Tanpa Angka &amp; Simbol</span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                person
              </span>
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                const val = e.target.value;
                setName(val);
                if (touched.name) {
                  setFieldErrors((prev) => ({ ...prev, name: validateField("name", val) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, name: true }));
                setFieldErrors((prev) => ({ ...prev, name: validateField("name", name) }));
              }}
              placeholder="Budi Pratama"
              className={`w-full h-12 pl-11 pr-4 rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
                touched.name && fieldErrors.name
                  ? "bg-error-container/10 border border-error ring-1 ring-error"
                  : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
              }`}
            />
          </div>
          {touched.name && fieldErrors.name && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.name}
            </span>
          )}
        </div>

        {/* WhatsApp Phone */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Nomor WhatsApp / HP Aktif</label>
            <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                check_circle
              </span>{" "}
              Wajib 11 Digit
            </span>
          </div>
          <div className="flex gap-2">
            <div className="h-12 px-3 bg-surface-container-low rounded-xl flex items-center gap-1.5 text-on-surface font-body-md flex-shrink-0">
              <span>🇮🇩</span>
              <span className="font-semibold">+62</span>
            </div>
            <div className="relative flex-1 flex items-center">
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  const val = e.target.value;
                  setPhone(val);
                  if (touched.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: validateField("phone", val) }));
                  }
                }}
                onBlur={() => {
                  setTouched((prev) => ({ ...prev, phone: true }));
                  setFieldErrors((prev) => ({ ...prev, phone: validateField("phone", phone) }));
                }}
                placeholder="81298453210 (11 digit)"
                className={`w-full h-12 px-3.5 pr-10 rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
                  touched.phone && fieldErrors.phone
                    ? "bg-error-container/10 border border-error ring-1 ring-error"
                    : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
                }`}
              />
              <span className="absolute right-3 text-tertiary">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  chat
                </span>
              </span>
            </div>
          </div>
          {touched.phone && fieldErrors.phone && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.phone}
            </span>
          )}
        </div>

        {/* Alamat Email */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Alamat Email</label>
            <span className="text-secondary font-label-sm text-label-sm">Wajib Mengandung @</span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                mail
              </span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                const val = e.target.value;
                setEmail(val);
                if (touched.email) {
                  setFieldErrors((prev) => ({ ...prev, email: validateField("email", val) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, email: true }));
                setFieldErrors((prev) => ({ ...prev, email: validateField("email", email) }));
              }}
              placeholder="budi.pratama@email.com"
              className={`w-full h-12 pl-11 pr-4 rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none transition-all ${
                touched.email && fieldErrors.email
                  ? "bg-error-container/10 border border-error ring-1 ring-error"
                  : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
              }`}
            />
          </div>
          {touched.email && fieldErrors.email && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.email}
            </span>
          )}
        </div>

        {/* Role-specific fields */}
        {role === "Customer" ? (
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface">Jenis Kendaraan Utama</label>
              <span className="text-on-surface-variant font-label-sm text-label-sm">Bisa tambah nanti</span>
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  directions_car
                </span>
              </span>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-12 pl-11 pr-8 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container appearance-none"
              >
                <option>Mobil (MPV, SUV, Sedan, City Car)</option>
                <option>Motor (Matic, Bebek, Sport)</option>
                <option>Kendaraan Listrik (EV / Hybrid)</option>
              </select>
              <span className="absolute right-3.5 text-on-surface-variant pointer-events-none">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  arrow_drop_down
                </span>
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface">Nomor KTP (e-KTP)</label>
                <span className="text-secondary font-label-sm text-label-sm font-semibold">16 Digit Valid</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    badge
                  </span>
                </span>
                <input
                  type="text"
                  value={ktpNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setKtpNumber(val);
                    if (touched.ktpNumber) {
                      setFieldErrors((prev) => ({ ...prev, ktpNumber: validateField("ktpNumber", val) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, ktpNumber: true }));
                    setFieldErrors((prev) => ({ ...prev, ktpNumber: validateField("ktpNumber", ktpNumber) }));
                  }}
                  placeholder="3174xxxxxxxxxxxx"
                  className={`w-full h-12 pl-11 pr-4 rounded-xl text-on-surface font-mono text-body-md focus:outline-none transition-all ${
                    touched.ktpNumber && fieldErrors.ktpNumber
                      ? "bg-error-container/10 border border-error ring-1 ring-error"
                      : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
                  }`}
                />
              </div>
              {touched.ktpNumber && fieldErrors.ktpNumber && (
                <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    error
                  </span>
                  {fieldErrors.ktpNumber}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md text-on-surface">Spesialisasi Montir</label>
                <span className="text-tertiary font-label-sm text-label-sm font-semibold">Wajib Bersertifikat</span>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    workspace_premium
                  </span>
                </span>
                <select
                  value={mechanicSpec}
                  onChange={(e) => setMechanicSpec(e.target.value)}
                  className="w-full h-12 pl-11 pr-8 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container appearance-none"
                >
                  <option>Mekanik Mobil BNSP Level III / IV</option>
                  <option>Teknisi Motor Roda Dua &amp; Injeksi</option>
                  <option>Spesialis Derek Gendong (Towing Flatbed)</option>
                  <option>Spesialis Kelistrikan &amp; Jumper Aki</option>
                </select>
              </div>
            </div>
          </>
        )}

        {/* Password */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface">Kata Sandi</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                lock
              </span>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                setPassword(val);
                if (touched.password) {
                  setFieldErrors((prev) => ({ ...prev, password: validateField("password", val) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, password: true }));
                setFieldErrors((prev) => ({ ...prev, password: validateField("password", password) }));
              }}
              placeholder="Minimal 6 karakter"
              className={`w-full h-12 pl-11 pr-11 rounded-xl text-on-surface font-body-md focus:outline-none transition-all ${
                touched.password && fieldErrors.password
                  ? "bg-error-container/10 border border-error ring-1 ring-error"
                  : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                {showPassword ? "visibility_off" : "visibility"}
              </span>
            </button>
          </div>
          {touched.password && fieldErrors.password && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.password}
            </span>
          )}

          {/* Password strength meter */}
          <div className="flex items-center justify-between mt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Kekuatan Sandi</span>
            <span
              className={`font-label-sm text-label-sm flex items-center gap-1 font-semibold ${
                password.length === 0
                  ? "text-on-surface-variant"
                  : password.length < 6
                  ? "text-error"
                  : password.length < 8
                  ? "text-amber-500"
                  : "text-tertiary"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                shield
              </span>{" "}
              {password.length === 0
                ? "Belum diisi"
                : password.length < 6
                ? "Kurang dari 6 karakter"
                : password.length < 8
                ? "Cukup Baik"
                : "Sangat Kuat"}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-0.5">
            <div
              className={`h-1.5 rounded-full transition-all ${
                password.length > 0 ? (password.length < 6 ? "bg-error" : "bg-tertiary") : "bg-surface-container-high"
              }`}
            ></div>
            <div
              className={`h-1.5 rounded-full transition-all ${
                password.length >= 6 ? "bg-tertiary" : "bg-surface-container-high"
              }`}
            ></div>
            <div
              className={`h-1.5 rounded-full transition-all ${
                password.length >= 8 ? "bg-tertiary" : "bg-surface-container-high"
              }`}
            ></div>
            <div
              className={`h-1.5 rounded-full transition-all ${
                password.length >= 10 ? "bg-tertiary" : "bg-surface-container-high"
              }`}
            ></div>
          </div>
        </div>

        {/* Ulangi Kata Sandi */}
        <div className="flex flex-col gap-1">
          <label className="font-label-md text-label-md text-on-surface">Ulangi Kata Sandi</label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-on-surface-variant pointer-events-none">
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                restart_alt
              </span>
            </span>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                const val = e.target.value;
                setConfirmPassword(val);
                if (touched.confirmPassword) {
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", val) }));
                }
              }}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, confirmPassword: true }));
                setFieldErrors((prev) => ({ ...prev, confirmPassword: validateField("confirmPassword", confirmPassword) }));
              }}
              placeholder="Ulangi kata sandi di atas"
              className={`w-full h-12 pl-11 pr-11 rounded-xl text-on-surface font-body-md focus:outline-none transition-all ${
                touched.confirmPassword && fieldErrors.confirmPassword
                  ? "bg-error-container/10 border border-error ring-1 ring-error"
                  : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
              }`}
            />
            {confirmPassword && confirmPassword === password && (
              <span className="absolute right-3 text-tertiary flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  check_circle
                </span>
              </span>
            )}
          </div>
          {touched.confirmPassword && fieldErrors.confirmPassword && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.confirmPassword}
            </span>
          )}
        </div>

        {/* Promo Accordion */}
        {role === "Customer" && (
          <div className="bg-surface-container-low rounded-xl p-3 border border-surface-container-high/40 transition-all">
            <button
              type="button"
              onClick={() => setPromoExpanded(!promoExpanded)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary-container">
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    featured_seasonal_and_gifts
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">
                    Punya Kode Promo / Referral?
                  </span>
                  <span className="font-body-sm text-body-sm text-primary">
                    Dapatkan diskon Rp 50.000 untuk servis perdana
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                {promoExpanded ? "expand_less" : "expand_more"}
              </span>
            </button>
            {promoExpanded && (
              <div className="mt-3 pt-2 border-t border-surface-container-high/60 flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  placeholder="Contoh: SERVISIN50K"
                  className="flex-1 h-10 px-3 bg-surface-container-lowest rounded-lg text-on-surface uppercase font-bold text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
                <button
                  type="button"
                  onClick={() => alert(`Kode voucher ${promoCode} berhasil dipasang!`)}
                  className="px-4 h-10 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md font-semibold"
                >
                  Terapkan
                </button>
              </div>
            )}
          </div>
        )}

        {/* Terms Checkbox */}
        <div className="flex flex-col gap-1">
          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (touched.agreeTerms) {
                  setFieldErrors((prev) => ({
                    ...prev,
                    agreeTerms: e.target.checked ? "" : "Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi.",
                  }));
                }
              }}
              className="w-5 h-5 rounded text-primary-container accent-primary-container mt-0.5"
            />
            <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
              Saya menyetujui{" "}
              <a href="#" className="text-primary font-semibold underline">
                Syarat &amp; Ketentuan
              </a>{" "}
              serta{" "}
              <a href="#" className="text-primary font-semibold underline">
                Kebijakan Privasi
              </a>{" "}
              ServisIn.
            </span>
          </label>
          {touched.agreeTerms && fieldErrors.agreeTerms && (
            <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                error
              </span>
              {fieldErrors.agreeTerms}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              <span>Mendaftarkan ke Database Supabase...</span>
            </div>
          ) : (
            <>
              <span>Daftar Akun ke Supabase</span>
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                arrow_forward
              </span>
            </>
          )}
        </button>

        {/* Google Registration */}
        <div className="flex items-center gap-3 my-0.5">
          <span className="flex-1 h-px bg-surface-container-high"></span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
            Atau daftar cepat dengan
          </span>
          <span className="flex-1 h-px bg-surface-container-high"></span>
        </div>

        <button
          type="button"
          onClick={() => {
            alert("Google Sign-In berhasil! Akun Anda telah aktif.");
            router.push("/dashboard");
          }}
          className="w-full h-12 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-md text-label-md flex items-center justify-center gap-2.5 transition-colors border border-surface-container-high/60 shadow-sm"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              fill="#EA4335"
            />
          </svg>
          <span>Lanjutkan dengan Google</span>
        </button>

        {/* Already have an account */}
        <div className="text-center pt-2">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Sudah punya akun ServisIn?{" "}
            <Link href="/login" className="font-label-md text-label-md text-primary font-bold hover:underline">
              Masuk di sini
            </Link>
          </p>
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 mt-2 py-2 px-3 rounded-full bg-surface-container-low text-on-surface-variant font-label-sm text-label-sm">
          <span className="material-symbols-outlined text-tertiary" style={{ fontSize: 16 }}>
            lock
          </span>
          <span>Enkripsi 256-bit • Jaminan Privasi Data Aman</span>
        </div>
      </form>

      {/* Mechanic Pending Verification Modal */}
      {showMechanicPendingModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: 36 }}>
                pending_actions
              </span>
            </div>

            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                STATUS: PENDING VERIFICATION
              </span>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-2">
                Pendaftaran Mitra Diterima!
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                Terima kasih, <strong>{name}</strong>! Berkas KTP dan sertifikasi keahlian Anda sedang ditinjau oleh Tim Operasional ServisIn.
              </p>
            </div>

            <div className="w-full bg-surface-container-low p-3 rounded-xl text-left text-xs flex flex-col gap-1 border border-surface-container-high/60">
              <span className="font-bold text-on-surface">Tips Pengujian:</span>
              <span className="text-[11px] text-on-surface-variant">
                Buka panel <strong className="text-secondary">Admin Hub</strong> untuk menyetujui akun mitra ini dengan 1-klik, lalu masuk ke dashboard mekanik.
              </span>
            </div>

            <div className="flex flex-col gap-2 w-full mt-1">
              <Link
                href="/admin"
                className="w-full h-12 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  admin_panel_settings
                </span>
                <span>Buka Panel Admin (Verifikasi Sekarang)</span>
              </Link>

              <Link
                href="/login"
                className="w-full h-11 rounded-xl bg-surface-container-low text-on-surface font-label-md text-label-md font-bold flex items-center justify-center hover:bg-surface-container"
              >
                Kembali ke Halaman Masuk
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
