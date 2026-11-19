// ============================================================================
// DOKUMENTASI VALIDASI & SANITASI DATA - SERVISIN
// Menggunakan metode sederhana Regex: .test() dan .replace()
// ============================================================================

// 1. POLA REGEX SEDERHANA
export const POLA = {
  // Nomor HP / WA Indonesia diawali 08 dan memiliki 11 digit
  noHp: /^08\d{9}$/,

  // Email sederhana: ada karakter sebelum dan sesudah '@' serta domain '.'
  surel: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  // Nama: hanya huruf alfabet (a-z, A-Z) dan spasi
  nama: /^[a-zA-Z\s]+$/,

  // Kata Sandi: minimal 6 karakter
  kataSandi: /^.{6,}$/,

  // NIK KTP Mekanik: tepat 16 digit angka
  nik: /^\d{16}$/
};

// 2. FUNGSI PEMBERSIH INPUT (MENGGUNAKAN .replace())
export const rapikanSpasi = (t) => t.trim().replace(/\s+/g, ' ');                                // "  Budi   Santoso " -> "Budi Santoso"
export const hanyaAngka = (t) => t.replace(/\D/g, '');                                          // "0812-3456" -> "08123456"
export const filterHp = (t) => t.replace(/[^\d+]/g, '');                                        // Sisakan angka dan tanda "+"
export const rapikanHp = (t) => t.replace(/[\s-]/g, '').replace(/^(\+62|62)(?=8)/, '0');       // "+62812..." -> "0812..."
export const filterHuruf = (t) => t.replace(/[^a-zA-Z\s]/g, '');                                // Hapus simbol dan angka dari nama

// 3. FUNGSI VALIDASI INPUT (MENGGUNAKAN .test())

// Validasi Nama: tidak boleh kosong, tidak boleh angka & simbol
export function periksaNama(nilai) {
  const v = nilai.trim();
  if (!v) return 'Nama wajib diisi.';
  if (/\d/.test(v)) return 'Nama tidak boleh mengandung angka.';
  if (/[^a-zA-Z\s]/.test(v)) return 'Nama tidak boleh memakai lambang atau simbol.';
  if (!POLA.nama.test(v)) return 'Nama hanya boleh berupa huruf dan spasi.';
  return null;
}

// Validasi Nomor WhatsApp: wajib 11 digit
export function periksaHp(nilai) {
  const v = nilai.trim();
  const digit = hanyaAngka(v);
  if (!v) return 'Nomor WhatsApp wajib diisi.';
  if (digit.length < 11) return `Nomor WhatsApp kurang dari 11 digit (${digit.length} digit).`;
  if (digit.length > 11) return `Nomor WhatsApp lebih dari 11 digit (${digit.length} digit).`;
  if (!POLA.noHp.test(rapikanHp(v))) return 'Format nomor WhatsApp salah (contoh: 08123456789).';
  return null;
}

// Validasi Email: wajib ada @ dan format valid
export function periksaSurel(nilai) {
  const v = nilai.trim();
  if (!v) return 'Email wajib diisi.';
  if (!v.includes('@')) return 'Email harus mengandung karakter @.';
  if (!POLA.surel.test(v)) return 'Format email tidak valid (contoh: user@gmail.com).';
  return null;
}

// Validasi Kata Sandi: minimal 6 karakter
export function periksaKataSandi(nilai) {
  if (!nilai) return 'Kata sandi wajib diisi.';
  if (!POLA.kataSandi.test(nilai)) return `Kata sandi minimal 6 karakter (sekarang ${nilai.length} karakter).`;
  return null;
}

// Validasi NIK KTP (Mekanik): tepat 16 digit angka
export function periksaNik(nilai) {
  const v = nilai.trim();
  if (!v) return 'NIK wajib diisi.';
  if (!/^\d+$/.test(v)) return 'NIK hanya boleh berisi angka.';
  if (!/^\d{16}$/.test(v)) return `NIK harus tepat 16 digit (sekarang ${v.length} digit).`;
  if (!POLA.nik.test(v)) return 'NIK tidak valid.';
  return null;
}
