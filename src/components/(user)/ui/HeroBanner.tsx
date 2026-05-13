"use client";

import { useState, useEffect } from "react";
import { slides } from "./slides";
import SlideContent from "./SlideContent";
import SlideControls from "./SlideControls";

const AUTOPLAY_INTERVAL = 4000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % slides.length), AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [mounted]);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  if (!mounted) {
    return <div className="relative w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden bg-slate-900" />;
  }

  return (
    <div className="relative w-full h-64 sm:h-80 md:h-[380px] lg:h-[420px] rounded-2xl overflow-hidden bg-slate-900 shadow-xl shadow-slate-900/20">
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 z-10 pointer-events-none" />
      <div className="absolute -right-5 -bottom-10 w-32 h-32 rounded-full bg-white/5 z-10 pointer-events-none" />

      {slides.map((slide, i) => (
        <div key={slide.id} aria-hidden={i !== current} className={`absolute inset-0 bg-linear-to-r ${slide.bg} transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <SlideContent slide={slide} />
        </div>
      ))}

      <SlideControls total={slides.length} current={current} onPrev={prev} onNext={next} onDotClick={setCurrent} />
    </div>
  );
}
