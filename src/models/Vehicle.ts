export interface VehicleProps {
  id: string;
  userId: string;
  brand: string;
  model: string;
  year: number;
  licensePlate: string;
  isActive: boolean;
  odometerKm?: number;
  healthPercent?: number;
  color?: string;
  imageUrl?: string;
  lastServiceDate?: string;
}

export class Vehicle {
  public id: string;
  public userId: string;
  public brand: string;
  public model: string;
  public year: number;
  public licensePlate: string;
  public isActive: boolean;
  public odometerKm: number;
  public healthPercent: number;
  public color: string;
  public imageUrl: string;
  public lastServiceDate: string;

  constructor(data: VehicleProps) {
    this.id = data.id;
    this.userId = data.userId;
    this.brand = data.brand;
    this.model = data.model;
    this.year = data.year;
    this.licensePlate = data.licensePlate;
    this.isActive = data.isActive;
    this.odometerKm = data.odometerKm ?? 34200;
    this.healthPercent = data.healthPercent ?? 94;
    this.color = data.color ?? "Silver Metalik";
    this.imageUrl =
      data.imageUrl ||
      "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
    this.lastServiceDate = data.lastServiceDate || "12 Mei 2024";
  }

  public addVehicle(): Vehicle {
    if (!this.brand || !this.licensePlate) {
      throw new Error("Brand and license plate are required");
    }
    return this;
  }

  public updateVehicle(updates: Partial<VehicleProps>): Vehicle {
    Object.assign(this, updates);
    return this;
  }
}
