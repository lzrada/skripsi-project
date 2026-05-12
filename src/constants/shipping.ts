export const STORE_CONFIG = {
  name: "Rizky Elektronik",
  lat: -8.0957,
  lng: 112.1687,
  freeShippingRadiusKm: 10,
  ratePerKm: 3_000,
  minimumShippingFee: 15_000,
  maximumShippingFee: 100_000 as number | null,
  estimasiDalamRadius: "Hari ini – 1 hari",
  estimasiLuarRadius: "1–2 hari",
} as const;
