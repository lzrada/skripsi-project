"use client";

import { useState, useEffect } from "react";
import { slides } from "./slides";
import SlideContent from "./SlideContent";
import SlideControls from "./SlideControls";

const AUTOPLAY_INTERVAL = 4000;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden bg-slate-900" suppressHydrationWarning>
      <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/5 z-10 pointer-events-none" />

      <div className="absolute -right-5 -bottom-10 w-32 h-32 rounded-full bg-white/5 z-10 pointer-events-none" />

      {slides.map((slide, i) => (
        <div key={slide.id} aria-hidden={i !== current} className={`absolute inset-0 bg-gradient-to-r ${slide.bg} transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"}`}>
          <SlideContent slide={slide} />
        </div>
      ))}

      <SlideControls total={slides.length} current={current} onPrev={prev} onNext={next} onDotClick={setCurrent} />
    </div>
  );
}
