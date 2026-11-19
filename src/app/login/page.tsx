"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthController } from "@/controllers/AuthController";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registeredParam = searchParams.get("registered") === "1";
  const initialRole = (searchParams.get("role") as "Customer" | "Mechanic" | "Admin") || "Customer";
  const initialIdentifier = searchParams.get("identifier") || "";

  const [role, setRole] = useState<"Customer" | "Mechanic" | "Admin">(initialRole);
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState(
    registeredParam ? "Pendaftaran berhasil! Akun Anda siap digunakan untuk login." : ""
  );
  const [loading, setLoading] = useState(false);

  // Field errors & touched states
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialIdentifier) {
      setIdentifier(initialIdentifier);
    }
  }, [initialIdentifier]);

  const roleHints = {
    Customer: "Masuk untuk pesan montir darurat 24/7 dan jadwalkan servis berkala.",
    Mechanic: "Masuk ke sistem penerimaan order darurat & pelacakan rute montir.",
    Admin: "Akses panel monitoring transaksi makro & verifikasi mitra teknisi.",
  };

  const validateLoginField = (fieldName: string, value: string): string => {
    switch (fieldName) {
      case "identifier": {
        const val = value.trim();
        if (!val) {
          return role === "Admin"
            ? "Email administrator wajib diisi tidak boleh kosong."
            : "Email atau nomor WhatsApp wajib diisi tidak boleh kosong.";
        }
        // If it looks like a phone number (only digits, spaces, plus, dashes)
        const isDigitsOnly = /^[0-9+\s-]+$/.test(val);
        const cleanDigits = val.replace(/[^0-9]/g, "");
        if (isDigitsOnly && !val.includes("@")) {
          if (cleanDigits.length < 11) {
            return `Nomor WhatsApp kurang dari 11 digit (saat ini ${cleanDigits.length} digit).`;
          }
          if (cleanDigits.length > 11) {
            return `Nomor WhatsApp lebih dari 11 digit (saat ini ${cleanDigits.length} digit, maksimal 11 digit).`;
          }
        } else {
          // It's treated as an email
          if (!val.includes("@")) {
            return "Alamat email tidak valid (harus mengandung karakter '@').";
          }
        }
        return "";
      }
      case "password":
        if (!value) {
          return "Kata sandi wajib diisi tidak boleh kosong.";
        }
        if (value.length < 6) {
          return `Kata sandi kurang dari 6 karakter (saat ini ${value.length} karakter, minimal 6 karakter).`;
        }
        return "";
      default:
        return "";
    }
  };

  const handleRoleChange = (selected: "Customer" | "Mechanic" | "Admin") => {
    setRole(selected);
    setError("");
    setFieldErrors({});
    setSuccessMsg("");
  };

  const handleAutoFillDemo = (targetRole: "Customer" | "Mechanic" | "Admin") => {
    setRole(targetRole);
    if (targetRole === "Customer") {
      setIdentifier("081298453210");
      setPassword("password123");
    } else if (targetRole === "Mechanic") {
      setIdentifier("081377889900");
      setPassword("password123");
    } else {
      setIdentifier("admin@servisin.id");
      setPassword("admin123");
    }
    setFieldErrors({});
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const identErr = validateLoginField("identifier", identifier);
    const passErr = validateLoginField("password", password);
    const errs: Record<string, string> = {};
    if (identErr) errs.identifier = identErr;
    if (passErr) errs.password = passErr;

    setFieldErrors(errs);
    setTouched({ identifier: true, password: true });

    if (identErr || passErr) {
      setError(identErr || passErr);
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      const res = await AuthController.handleLogin({
        identifier,
        password,
        role,
      });

      setLoading(false);
      if (res.success) {
        if (role === "Customer") {
          router.push("/dashboard");
        } else if (role === "Mechanic") {
          router.push("/mechanic/dashboard");
        } else {
          router.push("/admin");
        }
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Terjadi kendala koneksi ke database.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex flex-col justify-between p-4 selection:bg-primary-fixed selection:text-on-primary-fixed">
      <div className="flex flex-col w-full pb-6">
        {/* Brand / Identity Header Section */}
        <div className="flex flex-col items-center text-center px-4 pt-6 pb-2">
          <div className="relative w-24 h-24 mb-3 flex items-center justify-center rounded-2xl bg-surface-container-lowest shadow-md">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary font-headline-lg shadow-sm">
              <span className="material-symbols-outlined text-4xl">car_repair</span>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-tertiary items-center justify-center text-on-tertiary">
                <span className="material-symbols-outlined text-body-sm font-body-sm" style={{ fontSize: 13 }}>
                  verified
                </span>
              </span>
            </span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low mb-2">
            <span className="w-2 h-2 rounded-full bg-primary-container"></span>
            <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
              Aplikasi Resmi Bantuan Otomotif
            </span>
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Selamat Datang di ServisIn
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xs mt-1">
            Layanan Servis &amp; Derek Darurat Kendaraan Terpercaya
          </p>
        </div>

        {/* Role Selector (Segmented Control) */}
        <div className="px-1 mt-3">
          <div className="bg-surface-container p-1 rounded-xl flex items-center gap-1 relative shadow-inner">
            <button
              onClick={() => handleRoleChange("Customer")}
              type="button"
              className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 font-label-md text-label-md ${
                role === "Customer"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                directions_car
              </span>
              <span className="truncate">Pelanggan</span>
            </button>

            <button
              onClick={() => handleRoleChange("Mechanic")}
              type="button"
              className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 font-label-md text-label-md ${
                role === "Mechanic"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                build
              </span>
              <span className="truncate">Mekanik</span>
            </button>

            <button
              onClick={() => handleRoleChange("Admin")}
              type="button"
              className={`flex-1 py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 font-label-md text-label-md ${
                role === "Admin"
                  ? "bg-surface-container-lowest text-primary shadow-sm font-semibold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                admin_panel_settings
              </span>
              <span className="truncate">Admin</span>
            </button>
          </div>

          {/* Dynamic Role Context Hint */}
          <div className="mt-2.5 flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm">
            <span className="material-symbols-outlined text-secondary" style={{ fontSize: 16 }}>
              info
            </span>
            <span>{roleHints[role]}</span>
          </div>
        </div>

        {/* Main Card Form */}
        <div className="px-1 mt-3">
          <form
            noValidate
            onSubmit={handleLogin}
            className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex flex-col gap-4 border border-surface-container-high/40"
          >
            {/* Quick Demo Test Bar */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-surface-container-low text-xs border border-surface-container-high/60">
              <span className="text-on-surface-variant font-medium">Uji Coba Cepat:</span>
              <button
                type="button"
                onClick={() => handleAutoFillDemo(role)}
                className="px-2.5 py-1 bg-surface-container-lowest text-primary font-bold rounded-lg border border-primary/20 hover:bg-primary-fixed/40 transition-colors"
              >
                Isi Otomatis Akun {role}
              </button>
            </div>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-body-sm flex items-center gap-2 border border-emerald-300">
                <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2 border border-error/30">
                <span className="material-symbols-outlined text-error">error</span>
                <span className="font-bold">{error}</span>
              </div>
            )}

            {/* Input: Email / WhatsApp */}
            <div className="flex flex-col gap-1.5">
              <label
                className="font-label-md text-label-md text-on-surface flex items-center justify-between"
                htmlFor="identifier-input"
              >
                <span>
                  {role === "Admin" ? "Email Administrator" : "Email atau Nomor WhatsApp"}
                </span>
                <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-1">
                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                    lock
                  </span>{" "}
                  Terproteksi
                </span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-on-surface-variant flex items-center pointer-events-none">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    badge
                  </span>
                </span>
                <input
                  id="identifier-input"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    const val = e.target.value;
                    setIdentifier(val);
                    if (touched.identifier) {
                      setFieldErrors((prev) => ({ ...prev, identifier: validateLoginField("identifier", val) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, identifier: true }));
                    setFieldErrors((prev) => ({ ...prev, identifier: validateLoginField("identifier", identifier) }));
                  }}
                  placeholder={role === "Admin" ? "admin@servisin.id" : "081298453210 atau contoh@email.com"}
                  className={`w-full h-12 pl-11 pr-4 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none transition-all ${
                    touched.identifier && fieldErrors.identifier
                      ? "bg-error-container/10 border border-error ring-1 ring-error"
                      : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
                  }`}
                />
              </div>
              {touched.identifier && fieldErrors.identifier && (
                <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
                    error
                  </span>
                  {fieldErrors.identifier}
                </span>
              )}
            </div>

            {/* Input: Password */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="password-input">
                Kata Sandi
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-on-surface-variant flex items-center pointer-events-none">
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    vpn_key
                  </span>
                </span>
                <input
                  id="password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    if (touched.password) {
                      setFieldErrors((prev) => ({ ...prev, password: validateLoginField("password", val) }));
                    }
                  }}
                  onBlur={() => {
                    setTouched((prev) => ({ ...prev, password: true }));
                    setFieldErrors((prev) => ({ ...prev, password: validateLoginField("password", password) }));
                  }}
                  placeholder="Masukkan kata sandi (minimal 6 karakter)"
                  className={`w-full h-12 pl-11 pr-12 rounded-xl text-on-surface font-body-md text-body-md placeholder:text-on-surface-variant/60 focus:outline-none transition-all ${
                    touched.password && fieldErrors.password
                      ? "bg-error-container/10 border border-error ring-1 ring-error"
                      : "bg-surface-container-low focus:ring-2 focus:ring-primary-container"
                  }`}
                />
                <button
                  type="button"
                  aria-label="Tampilkan atau sembunyikan kata sandi"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 p-2 text-on-surface-variant hover:text-on-surface flex items-center transition-colors"
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
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-primary-container accent-primary-container focus:ring-0"
                />
                <span className="font-body-sm text-body-sm text-on-surface">Ingat Saya</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Fitur reset kata sandi telah dikirimkan via WhatsApp OTP.")}
                className="font-label-md text-label-md text-secondary hover:underline"
              >
                Lupa Kata Sandi?
              </button>
            </div>

            {/* Submit CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all hover:brightness-105 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                    login
                  </span>
                  <span>Masuk Sekarang</span>
                </>
              )}
            </button>

            {/* Role-based Registration Switch */}
            <div className="text-center pt-1">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Belum punya akun?{" "}
                <Link
                  href="/register"
                  className="font-label-md text-label-md text-primary font-bold hover:underline"
                >
                  Daftar akun baru
                </Link>
              </p>
            </div>

            {/* Alternative Social / SSO Divider */}
            <div className="flex items-center gap-3 my-0.5">
              <span className="flex-1 h-px bg-surface-container-high"></span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Atau masuk dengan
              </span>
              <span className="flex-1 h-px bg-surface-container-high"></span>
            </div>

            {/* Google Social Button */}
            <button
              type="button"
              onClick={() => {
                alert("Simulasi OAuth Google berhasil. Mengalihkan ke Beranda...");
                router.push("/dashboard");
              }}
              className="w-full h-12 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-2.5 transition-colors border border-surface-container-high/60"
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
          </form>
        </div>
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="px-1 pb-4">
        <div className="bg-surface-container-high/60 rounded-xl p-3 flex items-center gap-3 border border-surface-container-highest">
          <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-tertiary flex-shrink-0 shadow-sm">
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              verified_user
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Garansi Servis 30 Hari
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
              Teknisi &amp; Montir tersertifikasi standar BNSP dengan suku cadang original bergaransi resmi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full max-w-md mx-auto min-h-screen bg-surface flex items-center justify-center p-4">
          <div className="w-8 h-8 border-3 border-primary-container border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
