import { STORE_CONFIG } from "@/constants/shipping";

export interface ShippingResult {
  distanceKm: number;
  fee: number;
  isFree: boolean;
  label: string;
  estimasi: string;
}

const WILAYAH: Record<string, { lat: number; lng: number }> = {
  kepanjenkidul: { lat: -8.098, lng: 112.162 },
  "kepanjen kidul": { lat: -8.098, lng: 112.162 },
  karangsari: { lat: -8.101, lng: 112.158 },
  kepanjenlor: { lat: -8.094, lng: 112.16 },
  "kepanjen lor": { lat: -8.094, lng: 112.16 },
  pakunden: { lat: -8.096, lng: 112.155 },
  tanggung: { lat: -8.092, lng: 112.164 },
  tlumpu: { lat: -8.102, lng: 112.165 },

  sananwetan: { lat: -8.087, lng: 112.172 },
  bendogerit: { lat: -8.085, lng: 112.17 },
  gedog: { lat: -8.083, lng: 112.175 },
  klampok: { lat: -8.08, lng: 112.173 },
  rembang: { lat: -8.081, lng: 112.169 },
  sananrejo: { lat: -8.088, lng: 112.174 },
  karangtengah: { lat: -8.086, lng: 112.176 },

  // Kecamatan Sukorejo
  sukorejo: { lat: -8.105, lng: 112.172 },
  turi: { lat: -8.108, lng: 112.17 },
  tanjungsari: { lat: -8.107, lng: 112.175 },

  // Nama umum Kota Blitar
  blitar: { lat: -8.0957, lng: 112.1687 },
  "kota blitar": { lat: -8.0957, lng: 112.1687 },

  // ── KABUPATEN BLITAR — kecamatan terdekat (~10–30 km) ────────────────────
  "kabupaten blitar": { lat: -8.1059, lng: 112.168 },
  nglegok: { lat: -8.061, lng: 112.208 },
  garum: { lat: -8.053, lng: 112.226 },
  kanigoro: { lat: -8.104, lng: 112.128 },
  sanankulon: { lat: -8.075, lng: 112.134 },
  ponggok: { lat: -7.987, lng: 112.189 },
  srengat: { lat: -8.027, lng: 112.091 },
  wonodadi: { lat: -8.052, lng: 112.059 },
  udanawu: { lat: -8.018, lng: 112.039 },
  kademangan: { lat: -8.158, lng: 112.112 },
  sutojayan: { lat: -8.207, lng: 112.038 },
  panggungrejo: { lat: -8.242, lng: 111.972 },
  bakung: { lat: -8.277, lng: 112.162 },
  binangun: { lat: -8.248, lng: 112.212 },
  wates: { lat: -8.213, lng: 112.282 },
  talun: { lat: -8.157, lng: 112.215 },
  selopuro: { lat: -8.176, lng: 112.258 },
  selorejo: { lat: -8.124, lng: 112.301 },
  wlingi: { lat: -8.131, lng: 112.321 },
  doko: { lat: -8.156, lng: 112.349 },
  kesamben: { lat: -8.118, lng: 112.373 },

  tulungagung: { lat: -8.0653, lng: 111.902 },
  "kota tulungagung": { lat: -8.0653, lng: 111.902 },
  kediri: { lat: -7.848, lng: 111.968 },
  "kota kediri": { lat: -7.848, lng: 111.968 },
  "kabupaten kediri": { lat: -7.8169, lng: 111.968 },
  malang: { lat: -7.9666, lng: 112.6326 },
  "kota malang": { lat: -7.9666, lng: 112.6326 },
  "kabupaten malang": { lat: -8.1845, lng: 112.6155 },
  trenggalek: { lat: -8.049, lng: 111.7085 },
};

const FLAT_FEE: Record<string, { fee: number; estimasi: string }> = {
  tulungagung: { fee: 15_000, estimasi: "1–2 hari" },
  "kota tulungagung": { fee: 15_000, estimasi: "1–2 hari" },
  trenggalek: { fee: 20_000, estimasi: "1–2 hari" },
  kediri: { fee: 20_000, estimasi: "1–2 hari" },
  "kota kediri": { fee: 20_000, estimasi: "1–2 hari" },
  "kabupaten kediri": { fee: 20_000, estimasi: "1–2 hari" },
  malang: { fee: 25_000, estimasi: "2–3 hari" },
  "kota malang": { fee: 25_000, estimasi: "2–3 hari" },
  "kabupaten malang": { fee: 25_000, estimasi: "2–3 hari" },
};

function normalize(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ");
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function lookupKoords(input: string): { lat: number; lng: number } | null {
  const key = normalize(input);
  if (WILAYAH[key]) return WILAYAH[key];
  for (const [k, v] of Object.entries(WILAYAH)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
}

function lookupFlat(input: string): { fee: number; estimasi: string } | null {
  const key = normalize(input);
  if (FLAT_FEE[key]) return FLAT_FEE[key];
  for (const [k, v] of Object.entries(FLAT_FEE)) {
    if (k.includes(key) || key.includes(k)) return v;
  }
  return null;
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

export function hitungOngkirDariNamaWilayah(input: string): ShippingResult | null {
  if (!input.trim()) return null;

  const flat = lookupFlat(input);
  if (flat) {
    return {
      distanceKm: 0,
      fee: flat.fee,
      isFree: false,
      label: "Ongkir flat — antar toko",
      estimasi: flat.estimasi,
    };
  }

  const coords = lookupKoords(input);
  if (!coords) return null;

  return calculateShipping(coords.lat, coords.lng);
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  return lookupKoords(address);
}

export function geocodeFromLocal(input: string): { lat: number; lng: number } | null {
  return lookupKoords(input);
}

export function getFlatFee(input: string): number | null {
  return lookupFlat(input)?.fee ?? null;
}
