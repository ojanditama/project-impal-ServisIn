export type UserRole = "Customer" | "Mechanic" | "Admin";
export type UserStatus = "Active" | "Pending" | "Suspended" | "Rejected";

export interface UserProps {
  id: string;
  name: string;
  phone: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  rating?: number;
  bnspCertified?: boolean;
  tier?: "Regular" | "VIP";
  createdAt?: Date;
}

export class User {
  public id: string;
  public name: string;
  public phone: string;
  public email: string;
  public passwordHash: string;
  public role: UserRole;
  public status: UserStatus;
  public avatarUrl: string;
  public rating: number;
  public bnspCertified: boolean;
  public tier: "Regular" | "VIP";
  public createdAt: Date;

  constructor(data: UserProps) {
    this.id = data.id;
    this.name = data.name;
    this.phone = data.phone;
    this.email = data.email;
    this.passwordHash = data.passwordHash;
    this.role = data.role;
    this.status = data.status;
    this.avatarUrl = data.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&h=200&q=80";
    this.rating = data.rating ?? 4.9;
    this.bnspCertified = data.bnspCertified ?? (data.role === "Mechanic");
    this.tier = data.tier ?? "Regular";
    this.createdAt = data.createdAt || new Date();
  }

  public register(): User {
    // Business logic for registering user
    if (!this.name || !this.phone) {
      throw new Error("Nama dan nomor telepon wajib diisi");
    }
    return this;
  }

  public login(passwordAttempt: string): boolean {
    return this.passwordHash === passwordAttempt;
  }

  public updateProfile(updates: Partial<Omit<UserProps, "id">>): User {
    if (updates.name) this.name = updates.name;
    if (updates.phone) this.phone = updates.phone;
    if (updates.email) this.email = updates.email;
    if (updates.avatarUrl) this.avatarUrl = updates.avatarUrl;
    if (updates.tier) this.tier = updates.tier;
    if (updates.status) this.status = updates.status;
    return this;
  }
}
