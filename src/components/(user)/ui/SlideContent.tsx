import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Slide } from "./slides";

interface SlideContentProps {
  slide: Slide;
}

export default function SlideContent({ slide }: SlideContentProps) {
  return (
    <div className="absolute inset-0 flex items-center px-8 md:px-16">
      {/* Decorative circles */}
      <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
      <div className="absolute right-20 -bottom-16 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />

      <div className="flex-1 relative z-10 ">
        <span className={`inline-block text-xs my-2 font-black px-3 py-1.5 rounded-full ${slide.accentBg} text-gray-900 mb-4 tracking-widest uppercase shadow-sm`}>{slide.tag}</span>
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-black leading-tight mb-3 drop-shadow-sm">{slide.title}</h1>
        <p className={`${slide.accentText} text-sm md:text-base mb-6 max-w-sm leading-relaxed opacity-90`}>{slide.subtitle}</p>
        <Link href={slide.href} className={`inline-flex items-center gap-2 ${slide.accentBg} text-gray-900 font-black text-sm px-4 py-4 rounded-xl hover:opacity-90 hover:scale-105 transition-all shadow-lg`}>
          {slide.cta} →
        </Link>
      </div>

      {/* Icon decoration — lebih visible */}
      <div className="hidden md:flex items-center justify-center w-56 h-56 relative z-10 flex-shrink-0">
        <div className="w-44 h-44 rounded-full bg-white/8 flex items-center justify-center">
          <FontAwesomeIcon icon={slide.icon} className="text-white w-20 h-20 text-7xl opacity-25" />
        </div>
      </div>
    </div>
  );
}
