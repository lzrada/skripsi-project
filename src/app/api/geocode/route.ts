import { NextRequest, NextResponse } from "next/server";

const STORE_LAT = -8.04765;
const STORE_LNG = 112.21233;
const FREE_RADIUS_KM = 10;
const RATE_PER_KM = 3_000;
const MIN_FEE = 15_000;
const MAX_FEE = 100_000;

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Pilih hasil Nominatim yang paling spesifik (kecamatan/suburb > kota > provinsi)
function pickBestResult(results: any[]): any {
  if (!results || results.length === 0) return null;

  // Urutan prioritas tipe Nominatim dari paling spesifik ke paling umum
  const priority = ["suburb", "quarter", "neighbourhood", "village", "town", "municipality", "city", "county", "state"];

  for (const type of priority) {
    const match = results.find((r: any) => r.type === type || (r.class === "place" && r.type === type));
    if (match) return match;
  }

  return results[0]; // fallback ke hasil pertama
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ error: "Query kosong" }, { status: 400 });
  }

  try {
    // Tambah "Jawa Timur" sebagai konteks agar hasil lebih relevan untuk area toko
    const query = encodeURIComponent(`${q.trim()}, Jawa Timur, Indonesia`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=5&countrycodes=id&accept-language=id&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "RizqiElektronik-Skripsi/1.0 (contact: admin@Rizqi-elektronik.com)",
        Accept: "application/json",
      },
      next: { revalidate: 600 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding service tidak tersedia" }, { status: 502 });
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json({ found: false });
    }

    const best = pickBestResult(data);
    if (!best) return NextResponse.json({ found: false });

    const destLat = parseFloat(best.lat);
    const destLng = parseFloat(best.lon);
    const displayName = best.display_name as string;

    const distanceKm = haversineKm(STORE_LAT, STORE_LNG, destLat, destLng);
    const isFree = distanceKm <= FREE_RADIUS_KM;

    let fee = 0;
    if (!isFree) {
      const extraKm = distanceKm - FREE_RADIUS_KM;
      fee = Math.round(extraKm * RATE_PER_KM);
      fee = Math.max(fee, MIN_FEE);
      fee = Math.min(fee, MAX_FEE);
    }

    let estimasi: string;
    if (distanceKm <= FREE_RADIUS_KM) {
      estimasi = "Hari ini – 1 hari";
    } else if (distanceKm <= 50) {
      estimasi = "1–2 hari";
    } else if (distanceKm <= 150) {
      estimasi = "2–3 hari";
    } else {
      estimasi = "3–5 hari";
    }

    return NextResponse.json({
      found: true,
      lat: destLat,
      lng: destLng,
      displayName,
      distanceKm: Math.round(distanceKm * 10) / 10,
      fee,
      isFree,
      label: `~${distanceKm.toFixed(1)} km dari toko`,
      estimasi,
    });
  } catch (err) {
    console.error("[geocode] error:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
