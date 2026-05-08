import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Slide } from "./slides";

interface SlideContentProps {
  slide: Slide;
}

export default function SlideContent({ slide }: SlideContentProps) {
  return (
    <div className="absolute inset-0 flex items-center px-8 md:px-16">
      <div className="flex-1">
        <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${slide.accentBg} text-gray-900 mb-3`}>{slide.tag}</span>
        <h1 className="text-white text-2xl md:text-4xl font-bold leading-tight mb-2">{slide.title}</h1>
        <p className={`${slide.accentText} text-sm md:text-base mb-5 max-w-sm`}>{slide.subtitle}</p>
        <Link href={slide.href} className={`inline-flex items-center gap-2 ${slide.accentBg} text-gray-900 font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity`}>
          {slide.cta}
        </Link>
      </div>

      <div className="hidden md:flex items-center justify-center w-52 h-52 opacity-10">
        <FontAwesomeIcon icon={slide.icon} className="text-white text-7xl " />
      </div>
    </div>
  );
}
