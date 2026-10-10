import { Star } from 'lucide-react';

export function Stars({ value, size = 16, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          aria-label={`${n} estrellas`}
        >
          <Star size={size} className={n <= value ? 'fill-current' : 'opacity-25'} />
        </button>
      ))}
    </div>
  );
}
