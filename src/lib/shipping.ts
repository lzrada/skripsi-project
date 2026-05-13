import { STORE_CONFIG } from "@/constants/shipping";

export interface ShippingResult {
  distanceKm: number;
  fee: number;
  isFree: boolean;
  label: string;
  estimasi: string;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateShipping(destLat: number, destLng: number): ShippingResult {
  const { lat: storeLat, lng: storeLng, freeShippingRadiusKm, ratePerKm, minimumShippingFee, maximumShippingFee, estimasiDalamRadius, estimasiLuarRadius } = STORE_CONFIG;

  const distanceKm = haversineKm(storeLat, storeLng, destLat, destLng);
  const isFree = distanceKm <= freeShippingRadiusKm;

  if (isFree) {
    return {
      distanceKm,
      fee: 0,
      isFree: true,
      label: `~${distanceKm.toFixed(1)} km dari toko`,
      estimasi: estimasiDalamRadius,
    };
  }

  const extraKm = distanceKm - freeShippingRadiusKm;
  let fee = Math.round(extraKm * ratePerKm);
  fee = Math.max(fee, minimumShippingFee);
  if (maximumShippingFee !== null) fee = Math.min(fee, maximumShippingFee);

  return {
    distanceKm,
    fee,
    isFree: false,
    label: `~${distanceKm.toFixed(1)} km dari toko`,
    estimasi: estimasiLuarRadius,
  };
}

export async function hitungOngkirDariNamaWilayah(input: string): Promise<ShippingResult | null> {
  if (!input.trim()) return null;

  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(input.trim())}`, { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    if (!data.found) return null;

    return {
      distanceKm: data.distanceKm,
      fee: data.fee,
      isFree: data.isFree,
      label: data.label,
      estimasi: data.estimasi,
    };
  } catch {
    return null;
  }
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address.trim()) return null;
  try {
    const res = await fetch(`/api/geocode?q=${encodeURIComponent(address.trim())}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.found) return null;
    return { lat: data.lat, lng: data.lng };
  } catch {
    return null;
  }
}

export function geocodeFromLocal(): null {
  return null;
}
export function getFlatFee(): null {
  return null;
}
