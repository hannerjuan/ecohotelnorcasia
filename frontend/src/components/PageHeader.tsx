import type { ReactNode } from 'react';

export function PageHeader({ eyebrow, title, text, children }: { eyebrow: string; title: ReactNode; text?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-brand text-white">
      <svg className="absolute -right-20 -bottom-10 h-64 w-[36rem] text-white/5" viewBox="0 0 600 200" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M0 ${60 + i * 35} q75 -30 150 0 t150 0 t150 0 t150 0`} fill="none" stroke="currentColor" strokeWidth="10" />
        ))}
      </svg>
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <span className="eyebrow"><span className="h-px w-6 bg-accent" /> {eyebrow}</span>
        <h1 className="font-display max-w-3xl text-4xl leading-[1.05] md:text-6xl">{title}</h1>
        {text && <p className="mt-4 max-w-2xl text-lg text-white/70">{text}</p>}
        {children && <div className="mt-10">{children}</div>}
      </div>
    </section>
  );
}
