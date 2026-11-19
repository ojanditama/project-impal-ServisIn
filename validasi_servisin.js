// 1. POLA REGEX
export const POLA = {
  noHp: /^08\d{9}$/,            // Format 11 digit WhatsApp (contoh: 08123456789)
  surel: /^.+@.+\..+$/,         // Format email (wajib ada @ dan domain)
  nama: /^[a-zA-Z\s]+$/,        // Hanya huruf dan spasi (tanpa angka/simbol)
  sandi: /^.{6,}$/,             // Minimal 6 karakter
  nik: /^\d{16}$/               // Tepat 16 digit angka
};

// 2. SANITASI DATA (.replace)
export const rapikanSpasi = (t) => t.trim().replace(/\s+/g, ' ');                         // "  Budi   N " -> "Budi N"
export const hanyaAngka = (t) => t.replace(/\D/g, '');                                   // Ambil angka saja
export const rapikanHp = (t) => t.replace(/[\s-]/g, '').replace(/^(\+62|62)/, '0');        // "+62812..." -> "0812..."

// 3. VALIDASI DATA (.test)
export function periksaNama(v) {
  if (!v) return 'Nama wajib diisi.';
  if (!POLA.nama.test(v)) return 'Nama tidak boleh memakai angka atau lambang.';
  return null;
}

export function periksaHp(v) {
  if (!v) return 'Nomor WhatsApp wajib diisi.';
  const digit = hanyaAngka(v);
  if (digit.length < 11) return `Nomor WhatsApp kurang dari 11 digit (${digit.length} digit).`;
  if (digit.length > 11) return `Nomor WhatsApp lebih dari 11 digit (${digit.length} digit).`;
  if (!POLA.noHp.test(rapikanHp(v))) return 'Format WhatsApp salah (harus awalan 08).';
  return null;
}

export function periksaSurel(v) {
  if (!v) return 'Email wajib diisi.';
  if (!v.includes('@')) return 'Email harus ada karakter @.';
  if (!POLA.surel.test(v)) return 'Format email tidak valid.';
  return null;
}

export function periksaKataSandi(v) {
  if (!v) return 'Kata sandi wajib diisi.';
  if (!POLA.sandi.test(v)) return 'Kata sandi minimal 6 karakter.';
  return null;
}

export function periksaNik(v) {
  if (!v) return 'NIK wajib diisi.';
  if (!/^\d+$/.test(v)) return 'NIK hanya boleh berisi angka.';
  if (!POLA.nik.test(v)) return `NIK harus tepat 16 digit (sekarang ${v.length} digit).`;
  return null;
}
