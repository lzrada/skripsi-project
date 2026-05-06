"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoltLightning, faChevronLeft, faChevronRight, faStore, faTv } from "@fortawesome/free-solid-svg-icons";

const slides = [
  {
    id: 1,
    title: "Selamat Datang di Rizky Elektronik",
    subtitle: "Toko elektronik terpercaya Blitar & sekitarnya — kini hadir online",
    cta: "Belanja Sekarang",
    href: "/user/products",
    bg: "from-[#1E2753] to-[#2d3a8c]",
    accentBg: "bg-yellow-400",
    accentText: "text-yellow-400",
    emoji: <FontAwesomeIcon icon={faStore} className="text-gray-400" />,
    tag: "RESMI ONLINE",
  },
  {
    id: 2,
    title: "Promo Elektronik Pilihan",
    subtitle: "Diskon spesial untuk TV,Kipas Angin, Kulkas, dan Mesin Cuci berkualitas",
    cta: "Lihat Promo",
    href: "/user/products",
    bg: "from-[#0f4c75] to-[#1b6ca8]",
    accentBg: "bg-sky-300",
    accentText: "text-sky-300",
    emoji: <FontAwesomeIcon icon={faTv} className="text-gray-400" />,
    tag: "DISKON SPESIAL",
  },
  {
    id: 3,
    title: "Stok Terjaga, Harga Transparan",
    subtitle: "Cek ketersediaan barang secara real-time — tidak perlu telepon toko",
    cta: "Cek Produk",
    href: "/user/products",
    bg: "from-[#1a1a2e] to-[#16213e]",
    accentBg: "bg-emerald-400",
    accentText: "text-emerald-400",
    emoji: <FontAwesomeIcon icon={faBoltLightning} className="text-gray-400" />,
    tag: "STOK REAL-TIME",
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
    <div className={`relative w-full h-64 mt-24 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r ${slide.bg} transition-all duration-700`}>
      {/* Dekorasi lingkaran latar */}
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

      {/* Tombol navigasi */}
      <button onClick={prev} aria-label="Sebelumnya" className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
      </button>
      <button onClick={next} aria-label="Selanjutnya" className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors">
        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
      </button>

      {/* Indikator slide */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
