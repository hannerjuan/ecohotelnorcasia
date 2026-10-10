// Marca del hotel: una hoja de guadua sobre las ondas del río.
export function LogoMark({ size = 36, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="20" fill="currentColor" />
      <path d="M20 7c-5.5 5-7 10.5-3 18 .5-5.5 3.2-9 7-11.5-2.6.2-4.3 1-5.6 2.4.2-3.3.8-6 1.6-8.9z" fill="#f6f1e9" />
      <path d="M8 27c3 0 3-2 6-2s3 2 6 2 3-2 6-2 3 2 6 2" fill="none" stroke="#d9733b" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 31.5c2.5 0 2.5-1.6 5-1.6s2.5 1.6 5 1.6 2.5-1.6 5-1.6 2.5 1.6 5 1.6" fill="none" stroke="#2f7f86" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
