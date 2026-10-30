# ServisIn — Platform Layanan Servis & Derek Darurat Kendaraan On-Demand

Aplikasi ServisIn dibangun mengacu ketat pada **Dokumen Perancangan Perangkat Lunak (DPPL)**, **Class Diagram**, serta desain antarmuka dari **Stitch UI**.

---

## 🚀 Fitur yang Telah Diimplementasikan

### 1. Autentikasi & Profil Kendaraan
- [x] **Multi-Role Login** (`/login`): Segmented control untuk Pelanggan, Mekanik, dan Admin dengan routing dinamis serta simulasi Google OAuth.
- [x] **Registrasi Multi-Role** (`/register`): Pendaftaran terpisah Pemilik Kendaraan & Mitra Mekanik (Pending status), meter kekuatan sandi 4-segmen, promo accordion, dan proteksi 256-bit.
- [x] **Manajemen Garasi Digital** (`/vehicles`): Kartu unit aktif (Avanza Veloz), indikator kesehatan unit (94%), telemetri oli/pajak/ban, riwayat servis, aktivasi kendaraan utama, serta modal penambahan unit baru.

### 2. Pemesanan Servis, Matching, & Tracking (Pelanggan)
- [x] **Customer Dashboard** (`/dashboard`): Tombol SOS Siaga 24/7 (Jumper Aki, Derek Towing, Ganti Ban), kartu live tracking aktif (#SRV-8942), 6 grid layanan populer, jadwal berkala, garansi 30 hari, serta carousel promo.
- [x] **Booking Servis Berkala & Darurat** (`/booking`): 3-step progress flow, pemilihan paket (Tune-Up 32 titik), bundling suku cadang oli Shell, pemilihan lokasi (Rumah vs Kantor), preferensi montir BNSP Level IV, estimasi biaya garansi pasti, dan floating CTA.
- [x] **Live Mechanic Tracking & ETA** (`/tracking`): Peta geospasial real-time, rute dinamis, pin lokasi montir & pelanggan beranimasi, floating ETA card (7 menit • 1.8 km), bottom sheet profil montir (Bambang Sudiro, 4.9★), timeline status 5-tahap, dan kontak darurat.
- [x] **Pembayaran Digital & Billing** (`/payment`): Rincian biaya transparan (100% terbuka), penerapan kupon voucher ROADSIDECARE40, 4 metode pembayaran (ServisIn Wallet, QRIS instan, Virtual Account, Kartu Kredit), simulasi Midtrans Snap & webhook settlement, dan modal sukses lunas.

### 3. Monetisasi & Fitur AI (Freemium)
- [x] **Upgrade ServisIn Priority VIP** (`/premium`): Dark luxury hero banner (18.400+ member aktif), 4 privilese khusus member, pilihan paket Tahunan (Hemat 35%) & Bulanan, ulasan pelanggan, dan aktivasi otomatis instan.
- [x] **AI Diagnostic Chatbot** (`/ai-diagnostic`): ServisBot AI v4.8 Neural, integrasi prompt Google Gemini / mesin diagnosa telemetri, card diagnosa kerusakan (Fan belt vs Magnetic clutch probabilitas 88%), estimasi biaya & urgensi, tombol pintas diagnosa cepat, dan CTA langsung ke pembuatan order booking.

### 4. Operasional Lapangan Mitra (Aplikasi Mekanik)
- [x] **Dispatch Dashboard Mekanik** (`/mechanic/dashboard`): Toggle switch Online/Offline, indikator radar GPS radius 7 km, kartu panggilan darurat masuk dengan hitung mundur timer 24 detik, bento grid kinerja harian (Rp 485.000, 5j 20m online, 98% penerimaan), dan daftar order potensial sekitar.
- [x] **Navigasi & Job Stepper** (`/mechanic/navigation`): HUD belokan jalan turn-by-turn ("350m Belok Kiri"), peta lokasi mobil mogok di bahu jalan tol, profil pelanggan Ibu Farida Ananda (#EMG-9842), 4-tahap job stepper (Menuju Lokasi -> Tiba di TKP -> Diagnosa -> Selesai), tombol unggah foto spidometer, katalog penambahan suku cadang, dan tombol SOS darurat montir.
- [x] **Dompet Saldo & Pendapatan** (`/mechanic/wallet`): Kartu saldo utama (Rp 1.485.000) dengan show/hide visibility, saldo escrow pengerjaan berjalan, target harian bonus insentif +Rp 50.000, armada & toolkit standar BNSP, filter riwayat transaksi, sertifikasi legalitas KTP/BNSP, dan modal penarikan instan ke rekening BCA.

### 5. Administrasi, Pengawasan & Resolusi Sengketa (Admin Web)
- [x] **Admin Control Hub** (`/admin`):
  - **Live Monitoring Makro**: 4 KPI real-time (Total Pesanan 142, Montir Online 58, GMV Rp 48.2jt, Komisi Platform 15% Rp 7.23jt) dan tabel feed order live.
  - **Verifikasi Mitra Mekanik**: Review antrean berkas (KTP, SIM, Sertifikat BNSP) dengan tombol 1-klik "Setujui & Aktivasi" atau "Tolak Berkas".
  - **Pusat Resolusi Sengketa & Garansi**: Review aduan pelanggan dan aksi resolusi 1-klik (Refund Dana 100%, Kirim Ulang Montir Senior Bebas Biaya, atau Tolak Komplain).

---

## 🏛️ Arsitektur MVC & Class Diagram

```
src/
├── app/                      # VIEW LAYER (App Router)
│   ├── login/                # Autentikasi multi-role
│   ├── register/             # Registrasi pelanggan & mekanik
│   ├── dashboard/            # Dashboard pelanggan utama
│   ├── vehicles/             # Manajemen profil kendaraan
│   ├── booking/              # Pemesanan servis berkala / SOS
│   ├── tracking/             # Live tracking montir geospasial
│   ├── payment/              # Pembayaran servis Midtrans billing
│   ├── premium/              # Upgrade akun VIP
│   ├── ai-diagnostic/        # Chatbot diagnostik Gemini AI
│   ├── mechanic/
│   │   ├── dashboard/        # Radar & dispatch order mekanik
│   │   ├── navigation/       # Navigasi & job stepper lapangan
│   │   └── wallet/           # Dompet saldo & penarikan dana
│   └── admin/                # Admin macro control hub
├── components/               # BOUNDARY LAYER
│   ├── CustomerBottomNav.tsx # Navigasi bawah pelanggan (5 tab + elevated FAB)
│   └── MechanicBottomNav.tsx # Navigasi bawah mitra mekanik (5 tab)
├── controllers/              # CONTROLLER LAYER
│   ├── AuthController.ts     # handleRegister, handleLogin
│   ├── OrderController.ts    # createServiceOrder, matchNearestMechanic
│   ├── PaymentController.ts  # requestMidtransPayment, handleWebhookCallback
│   └── AdminController.ts    # verifyMechanicAccount, resolveDisputeTicket
├── models/                   # ENTITY LAYER
│   ├── User.ts               # User entity & methods
│   ├── Vehicle.ts            # Vehicle garasi entity & methods
│   ├── ServiceOrder.ts       # ServiceOrder tracking entity & methods
│   ├── PremiumSubscription.ts# VIP subscription & warranty checks
│   ├── AIChatbot.ts          # AI Gemini prompt & diagnostic engine
│   └── DisputeTicket.ts      # Tiket sengketa & komplain garansi
└── lib/                      # INFRASTRUCTURE LAYER
    └── store.ts              # Global reactive state & PostGIS simulation
```

---

## 💻 Menjalankan Aplikasi

Aplikasi dapat dijalankan secara lokal dengan:
```bash
npm run dev
```
Buka browser pada: `http://localhost:3000`
