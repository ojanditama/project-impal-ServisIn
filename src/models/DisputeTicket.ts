export type DisputeStatus = "Open" | "UnderReview" | "ResolvedRefund" | "ResolvedRevisit" | "Rejected";

export class DisputeTicket {
  public id: string;
  public orderId: string;
  public customerId: string;
  public complaintText: string;
  public status: DisputeStatus;
  public resolutionNote?: string;
  public resolvedAt?: Date;
  public createdAt: Date;

  constructor(data: {
    id: string;
    orderId: string;
    customerId: string;
    complaintText: string;
    status?: DisputeStatus;
    resolutionNote?: string;
    resolvedAt?: Date;
    createdAt?: Date;
  }) {
    this.id = data.id;
    this.orderId = data.orderId;
    this.customerId = data.customerId;
    this.complaintText = data.complaintText;
    this.status = data.status || "Open";
    this.resolutionNote = data.resolutionNote;
    this.resolvedAt = data.resolvedAt;
    this.createdAt = data.createdAt || new Date();
  }

  public createTicket(): DisputeTicket {
    if (!this.orderId || !this.complaintText) {
      throw new Error("Order ID and complaint text are required");
    }
    return this;
  }

  public resolveTicket(
    resolution: "ResolvedRefund" | "ResolvedRevisit" | "Rejected",
    note: string
  ): DisputeTicket {
    this.status = resolution;
    this.resolutionNote = note;
    this.resolvedAt = new Date();
    return this;
  }
}
