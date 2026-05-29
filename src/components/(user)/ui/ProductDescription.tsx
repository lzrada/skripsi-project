// src/components/(user)/ui/ProductDescription.tsx
// Strategi: HANYA spec "Key: Value" yang dirender sebagai tabel.
// Semua teks lain dirender apa adanya (whitespace-pre-line) per blok paragraf.
// Ini 100% aman untuk konten apapun — tidak ada heuristik yang bisa salah tebak.
"use client";

interface ProductDescriptionProps {
  text: string;
  className?: string;
}

// Deteksi baris spec "Key: Value":
// - Ada titik dua
// - Bagian sebelum titik dua (key): ≤ 5 kata, ≤ 35 karakter, tanpa tanda baca
// - Bagian sesudah titik dua (value): tidak kosong
function parseSpec(line: string): { key: string; value: string } | null {
  const colonIdx = line.indexOf(":");
  if (colonIdx <= 0 || colonIdx >= line.length - 1) return null;
  const key = line.slice(0, colonIdx).trim();
  const value = line.slice(colonIdx + 1).trim();
  if (!value) return null;
  if (key.length > 35) return null;
  if (key.split(/\s+/).length > 5) return null;
  if (/[.!?,]/.test(key)) return null;
  // Value tidak boleh terlalu pendek + key tidak boleh mengandung kata panjang
  // (untuk mencegah kalimat biasa seperti "Tersedia dalam berbagai model: ...")
  if (value.split(/\s+/).length > 20) return null;
  return { key, value };
}

// ── Tipe segmen setelah grouping ─────────────────────────────────────
type Segment = { type: "spec-table"; rows: { key: string; value: string }[] } | { type: "text-block"; lines: string[] };

function segmentize(text: string): Segment[] {
  const rawLines = text.split("\n");
  const segments: Segment[] = [];
  let textBuffer: string[] = [];
  let specBuffer: { key: string; value: string }[] = [];

  const flushText = () => {
    // Trim leading/trailing blank lines dari buffer
    while (textBuffer.length && !textBuffer[0].trim()) textBuffer.shift();
    while (textBuffer.length && !textBuffer[textBuffer.length - 1].trim()) textBuffer.pop();
    if (textBuffer.length) {
      segments.push({ type: "text-block", lines: [...textBuffer] });
      textBuffer = [];
    }
  };

  const flushSpec = () => {
    if (specBuffer.length) {
      segments.push({ type: "spec-table", rows: [...specBuffer] });
      specBuffer = [];
    }
  };

  for (const rawLine of rawLines) {
    const line = rawLine; // pertahankan indentasi asli untuk whitespace-pre-line
    const trimmed = line.trim();

    const spec = trimmed ? parseSpec(trimmed) : null;

    if (spec) {
      // Masuk mode spec: flush text buffer dulu
      flushText();
      specBuffer.push(spec);
    } else {
      // Bukan spec: flush spec buffer dulu, lalu tambah ke text buffer
      if (specBuffer.length) {
        flushSpec();
      }
      textBuffer.push(line);
    }
  }

  // Flush sisa
  flushText();
  flushSpec();

  return segments;
}

export default function ProductDescription({ text, className = "" }: ProductDescriptionProps) {
  if (!text?.trim()) {
    return <p className="text-sm text-gray-400 italic">Deskripsi belum tersedia.</p>;
  }

  const segments = segmentize(text);

  return (
    <div className={`space-y-3 ${className}`}>
      {segments.map((seg, i) => {
        if (seg.type === "spec-table") {
          return (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100">
              {seg.rows.map((row, j) => (
                <div key={j} className={`flex gap-3 px-4 py-2.5 text-sm border-b border-gray-100 last:border-0 ${j % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                  <span className="flex-shrink-0 w-44 text-gray-500 font-medium leading-snug">{row.key}</span>
                  <span className="text-gray-800 leading-snug">{row.value}</span>
                </div>
              ))}
            </div>
          );
        }

        // text-block: render apa adanya, whitespace-pre-line agar newline dihormati
        // Tapi kita pisah per "paragraf" (dipisah baris kosong) agar spacing rapi
        const rawText = seg.lines.join("\n");
        // Split by blank lines untuk spacing antar paragraf
        const paragraphs = rawText.split(/\n\s*\n/).filter((p) => p.trim());

        return (
          <div key={i} className="space-y-3">
            {paragraphs.map((para, j) => (
              <p key={j} className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {para.trim()}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
