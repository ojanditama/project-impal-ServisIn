import { dbStore } from "@/lib/store";
import { User, UserRole, UserStatus } from "@/models/User";
import { SupabaseService } from "@/lib/supabase";

export class AuthController {
  public static async handleRegister(data: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: "Customer" | "Mechanic";
    ktpNumber?: string;
    bnspCertNumber?: string;
  }): Promise<{ success: boolean; user?: User; message: string }> {
    if (!data.name || !data.phone || !data.password) {
      return { success: false, message: "Semua kolom wajib diisi lengkap." };
    }

    // 1. Check existing in local store
    const existing = dbStore.findUserByPhoneOrEmail(data.phone);
    if (existing) {
      return {
        success: false,
        message: "Nomor WhatsApp / telepon ini sudah terdaftar.",
      };
    }

    const newUserId = "usr-" + Date.now();
    const newUser = new User({
      id: newUserId,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.phone}@servisin.id`,
      passwordHash: data.password,
      role: data.role,
      status: data.role === "Mechanic" ? "Pending" : "Active",
      tier: "Regular",
    });

    newUser.register();

    // 2. Persist to Supabase Database
    try {
      const syncRes = await SupabaseService.registerUser({
        id: newUserId,
        name: data.name,
        phone: data.phone,
        email: data.email || `${data.phone}@servisin.id`,
        password: data.password,
        role: data.role,
        ktpNumber: data.ktpNumber,
        bnspCertNumber: data.bnspCertNumber,
      });

      if (!syncRes.success) {
        console.warn("[AuthController] Supabase sync warning:", syncRes.error);
        return {
          success: false,
          message: syncRes.error || "Gagal menyimpan akun ke database Supabase.",
        };
      }
    } catch (e: any) {
      console.warn("[AuthController] Failed to reach Supabase during registration:", e);
      return {
        success: false,
        message: `Koneksi ke Supabase gagal: ${e?.message || "Periksa koneksi Anda"}`,
      };
    }

    // 3. Save to local store & persist
    dbStore.addUser(newUser);
    dbStore.setCurrentUser(newUser);

    return {
      success: true,
      user: newUser,
      message:
        data.role === "Mechanic"
          ? "Pendaftaran berhasil! Akun teknisi tersinkronkan ke Supabase dan sedang diverifikasi."
          : "Pendaftaran berhasil! Akun tersinkronkan ke Supabase. Selamat datang di ServisIn.",
    };
  }

  public static async handleLogin(credentials: {
    identifier: string;
    password: string;
    role: "Customer" | "Mechanic" | "Admin";
  }): Promise<{ success: boolean; user?: User; message: string }> {
    // 1. Check local store first (by name, email, or phone)
    const cleanIdent = credentials.identifier.trim().toLowerCase();
    const cleanDigits = credentials.identifier.replace(/[^0-9]/g, "");
    let user = dbStore.getUsers().find(
      (u) =>
        (u.name.toLowerCase() === cleanIdent ||
          u.email.toLowerCase() === cleanIdent ||
          (cleanDigits.length >= 8 && u.phone.replace(/[^0-9]/g, "").includes(cleanDigits))) &&
        u.role.toLowerCase() === credentials.role.toLowerCase()
    );

    // 2. If not found in local store, query Supabase
    if (!user) {
      try {
        const sbUser = await SupabaseService.findUser(credentials.identifier, credentials.role);
        if (sbUser) {
          const roleMapped: UserRole =
            sbUser.role === "MECHANIC" ? "Mechanic" : sbUser.role === "ADMIN" ? "Admin" : "Customer";
          const statusMapped: UserStatus =
            sbUser.status === "PENDING"
              ? "Pending"
              : sbUser.status === "SUSPENDED"
              ? "Suspended"
              : sbUser.status === "REJECTED"
              ? "Rejected"
              : "Active";

          user = new User({
            id: sbUser.id,
            name: sbUser.name,
            phone: sbUser.phone,
            email: sbUser.email,
            passwordHash: sbUser.passwordHash || credentials.password,
            role: roleMapped,
            status: statusMapped,
            tier: sbUser.tier === "VIP" ? "VIP" : "Regular",
            avatarUrl: sbUser.avatarUrl,
            rating: sbUser.rating,
            bnspCertified: sbUser.bnspCertified,
          });

          // Sync into local store
          dbStore.addUser(user);
        }
      } catch (err) {
        console.warn("[AuthController] Supabase lookup error:", err);
      }
    }

    if (!user) {
      return {
        success: false,
        message: `Akun ${credentials.role} dengan data tersebut tidak ditemukan di database.`,
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

    // Save as active logged-in user
    dbStore.setCurrentUser(user);

    return { success: true, user, message: "Login berhasil." };
  }
}
