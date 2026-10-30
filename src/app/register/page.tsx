"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthController } from "@/controllers/AuthController";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<"Customer" | "Mechanic">("Customer");
  const [name, setName] = useState("Budi Pratama");
  const [phone, setPhone] = useState("81298453210");
  const [email, setEmail] = useState("budi.pratama@email.com");
  const [vehicleType, setVehicleType] = useState("Mobil (MPV, SUV, Sedan, City Car)");
  const [mechanicSpec, setMechanicSpec] = useState("Mekanik Mobil BNSP Level III / IV");
  const [ktpNumber, setKtpNumber] = useState("3174092801900002");
  const [password, setPassword] = useState("rahasia12345");
  const [confirmPassword, setConfirmPassword] = useState("rahasia12345");
  const [showPassword, setShowPassword] = useState(false);
  const [promoExpanded, setPromoExpanded] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<"ID" | "EN">("ID");

  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState(["8", "8", "9", "9"]);
  const [otpTimer, setOtpTimer] = useState(45);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Mechanic Pending Modal state
  const [showMechanicPendingModal, setShowMechanicPendingModal] = useState(false);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError("Silakan setujui Syarat & Ketentuan dan Kebijakan Privasi.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate OTP sent to WhatsApp
    setTimeout(() => {
      setLoading(false);
      setShowOtpModal(true);
    }, 600);
  };

  const handleConfirmOtp = () => {
    setVerifyingOtp(true);

    setTimeout(() => {
      const fullPhone = "0" + phone.replace(/^0+/, "");
      const res = AuthController.handleRegister({
        name,
        phone: fullPhone,
        email,
        password,
        role: role === "Customer" ? "Customer" : "Mechanic",
      });

      setVerifyingOtp(false);
      setShowOtpModal(false);

      if (res.success) {
        if (role === "Customer") {
          // Redirect to login with prefilled success or dashboard
          router.push(`/login?registered=1&role=Customer&identifier=${encodeURIComponent(fullPhone)}`);
        } else {
          // Show Mechanic Pending Verification alert
          setShowMechanicPendingModal(true);
        }
      } else {
        setError(res.message);
      }
    }, 700);
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

      {/* Registration Form */}
      <form onSubmit={handleRegisterSubmit} className="mt-4 flex flex-col gap-3.5 pb-8">
        {error && (
          <div className="p-3 rounded-xl bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
            <span className="material-symbols-outlined text-error">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Nama Lengkap */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Nama Lengkap</label>
            <span className="text-secondary font-label-sm text-label-sm">Sesuai KTP/STNK</span>
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
              onChange={(e) => setName(e.target.value)}
              placeholder="Budi Pratama"
              required
              className="w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
        </div>

        {/* WhatsApp Phone */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Nomor WhatsApp / HP Aktif</label>
            <span className="text-tertiary font-label-sm text-label-sm flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                check_circle
              </span>{" "}
              OTP Instan
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
                onChange={(e) => setPhone(e.target.value)}
                placeholder="81298453210"
                required
                className="w-full h-12 px-3.5 pr-10 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container"
              />
              <span className="absolute right-3 text-tertiary">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  chat
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Alamat Email */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="font-label-md text-label-md text-on-surface">Alamat Email</label>
            <span className="text-on-surface-variant font-label-sm text-label-sm">Opsional (e-faktur garansi)</span>
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
              onChange={(e) => setEmail(e.target.value)}
              placeholder="budi.pratama@email.com"
              className="w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl text-on-surface font-body-md placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
          </div>
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
                <span className="text-secondary font-label-sm text-label-sm font-semibold">Validasi Dukcapil</span>
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
                  onChange={(e) => setKtpNumber(e.target.value)}
                  placeholder="3174xxxxxxxxxxxx"
                  required
                  className="w-full h-12 pl-11 pr-4 bg-surface-container-low rounded-xl text-on-surface font-mono text-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
                />
              </div>
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
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••••••"
              required
              className="w-full h-12 pl-11 pr-11 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
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
          {/* Password strength meter */}
          <div className="flex items-center justify-between mt-1">
            <span className="font-label-sm text-label-sm text-on-surface-variant">Kekuatan Sandi</span>
            <span className="font-label-sm text-label-sm text-tertiary flex items-center gap-1 font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                shield
              </span>{" "}
              Sangat Kuat
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-0.5">
            <div className="h-1.5 bg-tertiary rounded-full"></div>
            <div className="h-1.5 bg-tertiary rounded-full"></div>
            <div className="h-1.5 bg-tertiary rounded-full"></div>
            <div className="h-1.5 bg-tertiary rounded-full"></div>
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
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••••••"
              required
              className="w-full h-12 pl-11 pr-11 bg-surface-container-low rounded-xl text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container"
            />
            {confirmPassword && confirmPassword === password && (
              <span className="absolute right-3 text-tertiary flex items-center">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                  check_circle
                </span>
              </span>
            )}
          </div>
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
        <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-lg hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-70 mt-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Daftar &amp; Kirim Kode OTP</span>
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

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest max-w-sm w-full rounded-3xl p-6 text-center shadow-2xl flex flex-col items-center gap-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed text-primary-container flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
                sms
              </span>
            </div>

            <div>
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                Verifikasi Kode OTP
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-snug">
                Kode verifikasi instan 4-digit telah dikirimkan ke nomor WhatsApp{" "}
                <strong className="text-on-surface">+62 {phone}</strong>
              </p>
            </div>

            {/* OTP input boxes */}
            <div className="flex justify-center gap-3 my-1">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otpCode];
                    newOtp[idx] = e.target.value;
                    setOtpCode(newOtp);
                  }}
                  className="w-12 h-14 rounded-xl bg-surface-container-low text-center text-xl font-bold font-mono text-on-surface border-2 border-primary-container/40 focus:border-primary-container focus:outline-none"
                />
              ))}
            </div>

            <span className="text-[11px] text-on-surface-variant">
              Kirim ulang kode dalam <strong className="text-primary">{otpTimer}s</strong>
            </span>

            <button
              onClick={handleConfirmOtp}
              disabled={verifyingOtp}
              className="w-full h-12 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg font-bold flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-70"
            >
              {verifyingOtp ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Verifikasi &amp; Lanjutkan</span>
              )}
            </button>

            <button
              onClick={() => setShowOtpModal(false)}
              className="text-xs text-on-surface-variant hover:text-on-surface"
            >
              Ubah Nomor Telepon
            </button>
          </div>
        </div>
      )}

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
