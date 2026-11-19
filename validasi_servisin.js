/**
 * ============================================================================
 * MODUL REGEX, SANITASI, DAN VALIDASI DATA - APLIKASI SERVISIN
 * ============================================================================
 * Dokumen ini dibuat khusus untuk keperluan dokumentasi implementasi perangkat lunak (IMPAL).
 * Berisi aturan Regular Expression (Regex), fungsi pembersih data (sanitizer),
 * serta fungsi validasi field untuk pendaftaran (Register) & Login di ServisIn.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. POLA REGULAR EXPRESSION (REGEX)
// ----------------------------------------------------------------------------
export const POLA = {
  // Nomor HP / WhatsApp Indonesia: 08 / 628 / +628 lalu 8-11 digit (Standar umum)
  noHp: /^(\+62|62|0)8[1-9]\d{7,10}$/,

  // Nomor WhatsApp khusus ServisIn: tepat 11 digit angka (contoh: 08123456789)
  noHpServisIn11Digit: /^08[1-9]\d{8}$/,

  // Surel: bagian-lokal@domain.tld (wajib menyertakan '@' dan domain valid)
  surel: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/,

  // Nama Pengguna / Nama Lengkap: hanya huruf alfabet dan spasi (tanpa angka dan simbol)
  namaLengkap: /^[A-Za-z\s]+$/,

  // Kata Sandi ServisIn: minimal 6 karakter
  kataSandi: /^.{6,}$/,

  // NIK KTP (Khusus Mitra Mekanik ServisIn): tepat 16 digit angka
  nik: /^\d{16}$/,

  // Plat Nomor Kendaraan Indonesia (Booking ServisIn): contoh "B 1234 ABC"
  platNomor: /^[A-Za-z]{1,2}\s?[0-9]{1,4}\s?[A-Za-z]{1,3}$/
};

// ----------------------------------------------------------------------------
// 2. FUNGSI SANITASI / PEMBERSIH INPUT (HELPER FUNCTIONS)
// ----------------------------------------------------------------------------
export const rapikanSpasi = (t) => t.trim().replace(/\s+/g, ' ');                                // "  Siti    N " -> "Siti N"
export const hanyaAngka = (t) => t.replace(/\D/g, '');                                          // "3202-12" -> "320212"
export const filterHp = (t) => t.replace(/[^\d+]/g, '');                                        // Sisakan angka dan "+"
export const rapikanHp = (t) => t.replace(/[\s-]/g, '').replace(/^(\+62|62)(?=8)/, '0');       // "+62812..." -> "0812..."
export const filterHurufDanSpasi = (t) => t.replace(/[^a-zA-Z\s]/g, '');                        // Hapus angka dan simbol dari nama

// ----------------------------------------------------------------------------
// 3. FUNGSI VALIDASI PER FIELD (MENGEMBALIKAN PESAN ERROR ATAU NULL JIKA VALID)
// ----------------------------------------------------------------------------

/**
 * Validasi Nama Lengkap (Register & Login)
 * Aturan: Tidak boleh kosong, tidak boleh mengandung angka, tidak boleh lambang/simbol.
 */
export function periksaNama(nilai) {
  if (!nilai || !nilai.trim()) return 'Nama lengkap wajib diisi.';
  const v = rapikanSpasi(nilai);

  if (/\d/.test(v)) {
    return 'Nama tidak boleh memakai angka.';
  }
  if (/[^a-zA-Z\s]/.test(v)) {
    return 'Nama tidak boleh memakai lambang atau karakter khusus.';
  }
  if (!POLA.namaLengkap.test(v)) {
    return 'Nama hanya boleh berisi huruf dan spasi.';
  }
  return null;
}

/**
 * Validasi Nomor WhatsApp / HP ServisIn
 * Aturan: Wajib diisi, wajib tepat 11 digit angka, berikan peringatan jika < 11 atau > 11 digit.
 */
export function periksaHp(nilai) {
  if (!nilai || !nilai.trim()) return 'Nomor WhatsApp wajib diisi.';
  const v = nilai.trim();
  const digitSaja = hanyaAngka(v);

  // Validasi jumlah digit khusus ServisIn (11 digit)
  if (digitSaja.length < 11) {
    return `Nomor WhatsApp kurang dari 11 digit (saat ini ${digitSaja.length} digit).`;
  }
  if (digitSaja.length > 11) {
    return `Nomor WhatsApp melebihi 11 digit (saat ini ${digitSaja.length} digit).`;
  }

  // Validasi format awalan nomor HP Indonesia (08 / +62 / 62)
  const nomorNormal = rapikanHp(v);
  if (!POLA.noHpServisIn11Digit.test(nomorNormal)) {
    return 'Format nomor WhatsApp tidak valid. Gunakan awalan 08 (contoh: 08123456789).';
  }

  return null;
}

/**
 * Validasi Email / Surel
 * Aturan: Wajib diisi, wajib mengandung karakter '@', dan format domain valid.
 */
export function periksaSurel(nilai) {
  if (!nilai || !nilai.trim()) return 'Email wajib diisi.';
  const v = nilai.trim();

  if (!v.includes('@')) {
    return 'Email tidak valid (harus mengandung karakter @).';
  }
  if (!POLA.surel.test(v)) {
    return 'Format surel tidak valid (contoh: nama@domain.com).';
  }
  return null;
}

/**
 * Validasi Kata Sandi (Password)
 * Aturan: Wajib diisi, minimal 6 karakter.
 */
export function periksaKataSandi(nilai) {
  if (!nilai) return 'Kata sandi wajib diisi.';
  if (nilai.length < 6) {
    return `Kata sandi harus minimal 6 karakter (saat ini ${nilai.length} karakter).`;
  }
  return null;
}

/**
 * Validasi NIK KTP (Khusus Mitra Mekanik ServisIn)
 * Aturan: Sesuai struktur standar KTP Indonesia (16 digit angka).
 */
export function periksaNik(nilai) {
  if (!nilai || !nilai.trim()) return 'NIK wajib diisi.';
  const v = nilai.trim();

  if (!/^\d+$/.test(v)) return 'NIK hanya boleh berisi angka.';
  if (!/^\d{16}$/.test(v)) return `NIK harus tepat 16 digit (sekarang ${v.length} digit).`;
  if (!POLA.nik.test(v)) return 'NIK tidak valid: periksa kode wilayah, tanggal lahir, dan nomor urut.';
  return null;
}

/**
 * Validasi Plat Nomor Kendaraan (Order Servis)
 * Aturan: Format plat nomor polisi Indonesia (contoh: B 1234 ABC).
 */
export function periksaPlatNomor(nilai) {
  if (!nilai || !nilai.trim()) return 'Nomor plat kendaraan wajib diisi.';
  const v = rapikanSpasi(nilai).toUpperCase();

  if (!POLA.platNomor.test(v)) {
    return 'Format nomor plat tidak valid (contoh: B 1234 ABC).';
  }
  return null;
}

// ----------------------------------------------------------------------------
// 4. VALIDASI TERPADU & DETEKSI DATA DUPLIKAT (REGISTRASI SERVISIN)
// ----------------------------------------------------------------------------

/**
 * Memvalidasi form registrasi lengkap dan memeriksa apakah data sudah terdaftar sebelumnya.
 * @param {Object} data - { nama, email, phone, password, role, nik }
 * @param {Array} daftarUserTersimpan - Daftar akun yang sudah ada di database ServisIn
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export function validasiRegistrasiServisIn(data, daftarUserTersimpan = []) {
  const errors = {};

  // 1. Cek Nama
  const errNama = periksaNama(data.nama);
  if (errNama) errors.nama = errNama;

  // 2. Cek WhatsApp & Duplikasi
  const errHp = periksaHp(data.phone);
  if (errHp) {
    errors.phone = errHp;
  } else {
    const hpBersih = rapikanHp(data.phone);
    const hpDuplikat = daftarUserTersimpan.some(
      (u) => rapikanHp(u.phone || '') === hpBersih
    );
    if (hpDuplikat) {
      errors.phone = 'Nomor WhatsApp ini sudah terdaftar! Gunakan nomor lain atau silakan login.';
    }
  }

  // 3. Cek Email & Duplikasi
  const errSurel = periksaSurel(data.email);
  if (errSurel) {
    errors.email = errSurel;
  } else {
    const emailBersih = (data.email || '').trim().toLowerCase();
    const emailDuplikat = daftarUserTersimpan.some(
      (u) => (u.email || '').trim().toLowerCase() === emailBersih
    );
    if (emailDuplikat) {
      errors.email = 'Alamat email ini sudah terdaftar! Gunakan email lain atau silakan login.';
    }
  }

  // 4. Cek Kata Sandi
  const errPassword = periksaKataSandi(data.password);
  if (errPassword) errors.password = errPassword;

  // 5. Cek NIK jika mendaftar sebagai Mekanik
  if (data.role === 'mechanic') {
    const errNik = periksaNik(data.nik);
    if (errNik) errors.nik = errNik;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// ----------------------------------------------------------------------------
// 5. DEMO PENGUJIAN OTOMATIS (TEST RUNNER UNTUK DOKUMENTASI / SCREENSHOT)
// ----------------------------------------------------------------------------
function jalankanDemoPengujian() {
  console.log("=================================================================");
  console.log(" HASIL PENGUJIAN MODUL VALIDASI SERVISIN (IMPAL)");
  console.log("=================================================================\n");

  // Simulasi Database Tersimpan
  const dbDummy = [
    { nama: "Budi Santoso", email: "budi@gmail.com", phone: "08123456789", role: "customer" }
  ];

  console.log("[1] Uji Validasi Nama:");
  console.log("  - 'Budi123'      ->", periksaNama("Budi123"));
  console.log("  - 'Budi@Santoso'  ->", periksaNama("Budi@Santoso"));
  console.log("  - 'Budi Santoso'  ->", periksaNama("Budi Santoso") === null ? "VALID (OK)" : "ERROR");

  console.log("\n[2] Uji Validasi WhatsApp (Wajib 11 Digit):");
  console.log("  - '0812345678' (10 digit)    ->", periksaHp("0812345678"));
  console.log("  - '081234567890' (12 digit)  ->", periksaHp("081234567890"));
  console.log("  - '08123456789' (11 digit)   ->", periksaHp("08123456789") === null ? "VALID (OK)" : "ERROR");

  console.log("\n[3] Uji Validasi Email:");
  console.log("  - 'budi.gmail.com' (tanpa @) ->", periksaSurel("budi.gmail.com"));
  console.log("  - 'budi@gmail.com' (valid)   ->", periksaSurel("budi@gmail.com") === null ? "VALID (OK)" : "ERROR");

  console.log("\n[4] Uji Validasi Password:");
  console.log("  - '12345' (5 karakter)       ->", periksaKataSandi("12345"));
  console.log("  - 'secret123' (>= 6)         ->", periksaKataSandi("secret123") === null ? "VALID (OK)" : "ERROR");

  console.log("\n[5] Uji Pendaftaran dengan Data Duplikat:");
  const testDuplikat = validasiRegistrasiServisIn({
    nama: "Budi Baru",
    email: "budi@gmail.com",    // Email sudah terdaftar
    phone: "08123456789",       // Nomor sudah terdaftar
    password: "password123",
    role: "customer"
  }, dbDummy);
  console.log("  - Status Valid  :", testDuplikat.isValid);
  console.log("  - Pesan Ditolak :", testDuplikat.errors);

  console.log("\n=================================================================");
  console.log(" SELURUH PENGUJIAN SELESAI");
  console.log("=================================================================");
}

// Jalankan demo saat file dieksekusi langsung
if (typeof process !== 'undefined' && process.argv && process.argv[1] && process.argv[1].includes('validasi_servisin.js')) {
  jalankanDemoPengujian();
}
