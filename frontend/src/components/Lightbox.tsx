import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  images: string[];
  index: number;
  onIndex: (i: number) => void;
  onClose: () => void;
  alt: string;
}

export function Lightbox({ images, index, onIndex, onClose, alt }: Props) {
  const prev = () => onIndex((index - 1 + images.length) % images.length);
  const next = () => onIndex((index + 1) % images.length);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  });

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/95 p-4" onClick={onClose}>
      <button className="absolute top-6 right-6 p-2 text-white/70 hover:text-white" onClick={onClose} aria-label="Cerrar">
        <X size={32} />
      </button>
      {images.length > 1 && (
        <button
          className="absolute left-4 rounded-full bg-black/30 p-4 text-white/70 hover:text-white md:left-8"
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          aria-label="Anterior"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      <img
        src={images[index]}
        alt={alt}
        className="max-h-[85vh] max-w-full rounded-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <button
          className="absolute right-4 rounded-full bg-black/30 p-4 text-white/70 hover:text-white md:right-8"
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          aria-label="Siguiente"
        >
          <ChevronRight size={32} />
        </button>
      )}
      <div className="absolute bottom-6 text-sm tracking-widest text-white/70">
        {index + 1} / {images.length}
      </div>
    </div>
  );
}
