export type ServiceOrderStatus =
  | "Pending"
  | "Accepted"
  | "Dispatched"
  | "Arrived"
  | "Diagnosing"
  | "InProgress"
  | "Completed"
  | "Paid"
  | "Cancelled";

export interface ServiceOrderProps {
  id: string;
  customerId: string;
  mechanicId?: string;
  vehicleId: string;
  serviceType: string;
  locationCoord: { lat: number; lng: number; address: string };
  status: ServiceOrderStatus;
  totalCost: number;
  items?: Array<{ name: string; price: number }>;
  notes?: string;
  isEmergency?: boolean;
  isVIP?: boolean;
  createdAt?: Date;
}

export class ServiceOrder {
  public id: string;
  public customerId: string;
  public mechanicId?: string;
  public vehicleId: string;
  public serviceType: string;
  public locationCoord: { lat: number; lng: number; address: string };
  public status: ServiceOrderStatus;
  public totalCost: number;
  public items: Array<{ name: string; price: number }>;
  public notes: string;
  public isEmergency: boolean;
  public isVIP: boolean;
  public createdAt: Date;

  constructor(data: ServiceOrderProps) {
    this.id = data.id;
    this.customerId = data.customerId;
    this.mechanicId = data.mechanicId;
    this.vehicleId = data.vehicleId;
    this.serviceType = data.serviceType;
    this.locationCoord = data.locationCoord;
    this.status = data.status;
    this.totalCost = data.totalCost;
    this.items = data.items || [];
    this.notes = data.notes || "";
    this.isEmergency = data.isEmergency ?? false;
    this.isVIP = data.isVIP ?? false;
    this.createdAt = data.createdAt || new Date();
  }

  public createOrder(): ServiceOrder {
    if (!this.customerId || !this.serviceType) {
      throw new Error("Customer and service type are mandatory");
    }
    return this;
  }

  public updateStatus(newStatus: ServiceOrderStatus): ServiceOrder {
    this.status = newStatus;
    return this;
  }
}
