import { dbStore } from "@/lib/store";

export class AdminController {
  public static verifyMechanicAccount(
    mechanicId: string,
    action: "approve" | "reject"
  ): { success: boolean; message: string } {
    const mechanic = dbStore.users.find(
      (u) => u.id === mechanicId && u.role === "Mechanic"
    );

    if (!mechanic) {
      return { success: false, message: "Mitra mekanik tidak ditemukan" };
    }

    if (action === "approve") {
      mechanic.status = "Active";
      return {
        success: true,
        message: `Mekanik ${mechanic.name} berhasil diverifikasi dan diaktifkan.`,
      };
    } else {
      mechanic.status = "Rejected";
      return {
        success: true,
        message: `Pengajuan mitra mekanik ${mechanic.name} telah ditolak.`,
      };
    }
  }

  public static resolveDisputeTicket(
    ticketId: string,
    resolution: "ResolvedRefund" | "ResolvedRevisit" | "Rejected",
    note: string
  ): { success: boolean; message: string } {
    const ticket = dbStore.disputes.find((d) => d.id === ticketId);
    if (!ticket) {
      return { success: false, message: "Tiket komplain tidak ditemukan" };
    }

    ticket.resolveTicket(resolution, note);

    let msg = `Tiket ${ticketId} berhasil diselesaikan.`;
    if (resolution === "ResolvedRefund") {
      msg = `Refund dana 100% diproses ke dompet pelanggan untuk tiket ${ticketId}.`;
    } else if (resolution === "ResolvedRevisit") {
      msg = `Mekanik Senior berhasil dijadwalkan ulang bebas biaya untuk tiket ${ticketId}.`;
    }

    return { success: true, message: msg };
  }
}
