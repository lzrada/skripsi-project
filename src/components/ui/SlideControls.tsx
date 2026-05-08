import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

interface SlideControlsProps {
  total: number;
  current: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (index: number) => void;
}

export default function SlideControls({ total, current, onPrev, onNext, onDotClick }: SlideControlsProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <button
        onClick={onPrev}
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors pointer-events-auto"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="w-3 h-3" />
      </button>

      <button
        onClick={onNext}
        aria-label="Selanjutnya"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-colors pointer-events-auto"
      >
        <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto">
        {Array.from({ length: total }).map((_, i) => (
          <button key={i} onClick={() => onDotClick(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? "w-6 bg-white" : "w-1.5 bg-white/40"}`} />
        ))}
      </div>
    </div>
  );
}
