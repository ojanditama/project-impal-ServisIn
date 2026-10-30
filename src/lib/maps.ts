/**
 * Geospatial Navigation & PostGIS ST_Distance Service
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export class MapsService {
  /**
   * PostGIS ST_Distance (Haversine formula approximation) in Kilometers
   */
  public static calculateDistanceKm(from: LatLng, to: LatLng): number {
    const R = 6371; // Earth radius in km
    const dLat = ((to.lat - from.lat) * Math.PI) / 180;
    const dLng = ((to.lng - from.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((from.lat * Math.PI) / 180) *
        Math.cos((to.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  }

  /**
   * Calculate Estimated Time of Arrival (ETA) based on city traffic speed
   */
  public static calculateEtaMinutes(distanceKm: number, isEmergency: boolean = false): number {
    // Average urban speed: 20 km/h regular, 30 km/h emergency with siren/alert
    const speedKmH = isEmergency ? 30 : 20;
    const hours = distanceKm / speedKmH;
    const minutes = Math.ceil(hours * 60);
    return Math.max(minutes, 3); // minimum 3 mins
  }

  /**
   * Google Maps Turn-by-Turn routing instructions simulation
   */
  public static getNavigationSteps(from: LatLng, to: LatLng) {
    const distance = this.calculateDistanceKm(from, to);
    return [
      {
        instruction: "Mulai perjalanan dari pos siaga mitra",
        distance: "100 m",
        duration: "1 mnt",
      },
      {
        instruction: "Belok Kiri ke Jalur Lambat Jl. Gatot Subroto",
        distance: "350 m",
        duration: "2 mnt",
      },
      {
        instruction: "Terus lurus mengikuti jalur sebelum flyover Semanggi",
        distance: "800 m",
        duration: "3 mnt",
      },
      {
        instruction: "Tiba di lokasi kendaraan mogok di bahu kiri jalan",
        distance: `${distance} km`,
        duration: `${this.calculateEtaMinutes(distance)} mnt`,
      },
    ];
  }
}
