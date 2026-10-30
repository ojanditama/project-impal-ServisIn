export class PremiumSubscription {
  public id: string;
  public userId: string;
  public planType: "Monthly" | "Annual";
  public startDate: Date;
  public endDate: Date;
  public warrantyDays: number;
  public isActive: boolean;

  constructor(data: {
    id: string;
    userId: string;
    planType?: "Monthly" | "Annual";
    startDate?: Date;
    endDate?: Date;
    warrantyDays?: number;
    isActive?: boolean;
  }) {
    this.id = data.id;
    this.userId = data.userId;
    this.planType = data.planType || "Annual";
    this.startDate = data.startDate || new Date();
    this.warrantyDays = data.warrantyDays ?? (this.planType === "Annual" ? 30 : 14);
    this.isActive = data.isActive ?? true;

    if (data.endDate) {
      this.endDate = data.endDate;
    } else {
      const exp = new Date(this.startDate);
      if (this.planType === "Annual") {
        exp.setFullYear(exp.getFullYear() + 1);
      } else {
        exp.setMonth(exp.getMonth() + 1);
      }
      this.endDate = exp;
    }
  }

  public activateSubscription(): PremiumSubscription {
    this.isActive = true;
    return this;
  }

  public checkWarranty(): boolean {
    const now = new Date();
    return this.isActive && now <= this.endDate;
  }
}
