// src/components/ui/HeroBanner.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

const slides = [
  {
    id: 1,
    title: "Promo Akhir Tahun!",
    subtitle: "Diskon hingga 40% untuk semua produk elektronik pilihan",
    cta: "Belanja Sekarang",
    href: "/user/products", // ✅ ke semua produk
    bg: "from-[#1E2753] to-[#2d3a8c]",
    accentBg: "bg-yellow-400",
    accentText: "text-yellow-400",
    emoji: "📺",
    tag: "LIMITED OFFER",
  },
  {
    id: 2,
    title: "AC Terbaru Telah Hadir",
    subtitle: "Hemat listrik, ruangan sejuk sepanjang hari",
    cta: "Lihat Produk AC",
    href: "/user/products?category=AC", // ✅ filter kategori AC
    bg: "from-[#0f4c75] to-[#1b6ca8]",
    accentBg: "bg-sky-300",
    accentText: "text-sky-300",
    emoji: "❄️",
    tag: "NEW ARRIVAL",
  },
  {
    id: 3,
    title: "Kulkas Second Berkualitas",
    subtitle: "Kondisi mulus, harga terjangkau, garansi toko",
    cta: "Cek Stok",
    href: "/user/products?category=Kulkas", // ✅ filter kategori Kulkas
    bg: "from-[#1a1a2e] to-[#16213e]",
    accentBg: "bg-emerald-400",
    accentText: "text-emerald-400",
    emoji: "🧊",
    tag: "STOK TERBATAS",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <div className={`relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bg} transition-all duration-700`}>
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -right-5 -bottom-10 w-32 h-32 rounded-full bg-white/5" />

      <div className="absolute inset-0 flex items-center px-8 md:px-16">
        <div className="flex-1">
          <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${slide.accentBg} text-gray-900 mb-3`}>{slide.tag}</span>
          <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-2">{slide.title}</h1>
          <p className={`${slide.accentText} text-sm md:text-base mb-5 max-w-sm`}>{slide.subtitle}</p>
          <Link href={slide.href} className={`inline-flex items-center gap-2 ${slide.accentBg} text-gray-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity`}>
            {slide.cta}
          </Link>
        </div>
        <div className="hidden md:flex items-center justify-center w-52 h-52 opacity-20">
          <span className="text-9xl">{slide.emoji}</span>
        </div>
      </div>

      <button onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
      </button>
      <button onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
