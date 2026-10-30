import { dbStore } from "@/lib/store";
import { User, UserProps } from "@/models/User";

export class AuthController {
  public static handleRegister(data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: "Customer" | "Mechanic";
  }): { success: boolean; user?: User; message: string } {
    if (!data.name || !data.phone || !data.password) {
      return { success: false, message: "Semua kolom wajib diisi lengkap." };
    }

    const existing = dbStore.findUserByPhoneOrEmail(data.phone);
    if (existing) {
      return {
        success: false,
        message: "Nomor WhatsApp / telepon ini sudah terdaftar.",
      };
    }

    const newUser = new User({
      id: "usr-" + Date.now(),
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone}@servisin.id`,
      passwordHash: data.password,
      role: data.role,
      status: data.role === "Mechanic" ? "Pending" : "Active",
      tier: "Regular",
    });

    newUser.register();
    dbStore.users.push(newUser);

    return {
      success: true,
      user: newUser,
      message:
        data.role === "Mechanic"
          ? "Pendaftaran berhasil! Akun teknisi sedang diverifikasi oleh admin."
          : "Pendaftaran berhasil! Selamat datang di ServisIn.",
    };
  }

  public static handleLogin(credentials: {
    identifier: string;
    password: string;
    role: "Customer" | "Mechanic" | "Admin";
  }): { success: boolean; user?: User; message: string } {
    const user = dbStore.users.find(
      (u) =>
        (u.email.toLowerCase() === credentials.identifier.toLowerCase() ||
          u.phone.includes(credentials.identifier.replace(/[^0-9]/g, ""))) &&
        u.role === credentials.role
    );

    if (!user) {
      return {
        success: false,
        message: `Akun ${credentials.role} dengan data tersebut tidak ditemukan.`,
      };
    }

    if (!user.login(credentials.password)) {
      return { success: false, message: "Kata sandi yang Anda masukkan salah." };
    }

    if (user.role === "Mechanic" && user.status === "Pending") {
      return {
        success: false,
        message:
          "Akun mekanik Anda masih dalam proses verifikasi dokumen BNSP/KTP oleh Admin.",
      };
    }

    return { success: true, user, message: "Login berhasil." };
  }
}
