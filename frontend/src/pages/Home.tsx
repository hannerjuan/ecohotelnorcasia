import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Clock, Coffee, Compass, Leaf, MapPin, Quote, Sprout, Star, Users, Waves } from 'lucide-react';
import { HotelMap } from '../components/HotelMap';
import { SearchBar } from '../components/SearchBar';
import { Stars } from '../components/Stars';
import { useFetch } from '../lib/useFetch';
import { useSettings } from '../lib/settings';
import { imageOr, money } from '../lib/format';
import type { Activity, Cabin, Review } from '../types';

const FALLBACK_HERO = [
  'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1544253915-0810168cb729?auto=format&fit=crop&w=1920&q=80',
];

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.6, ease: 'easeOut' as const },
};

const PILLARS = [
  { icon: Leaf, title: 'Hecho en guadua', text: 'Arquitectura bioclimática que respira con el bosque.' },
  { icon: Waves, title: 'A orillas del río', text: 'Pozos de agua cristalina a pocos pasos de tu cabaña.' },
  { icon: Sprout, title: 'Cocina de huerta', text: 'Ingredientes propios y de productores de Norcasia.' },
  { icon: Compass, title: 'Guías locales', text: 'Recorridos con quienes mejor conocen el territorio.' },
];

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: React.ReactNode; action?: React.ReactNode }) {
  return (
    <motion.div {...reveal} className="mb-12 flex flex-wrap items-end justify-between gap-6">
      <div>
        <span className="eyebrow"><span className="h-px w-6 bg-accent" /> {eyebrow}</span>
        <h2 className="font-display max-w-2xl text-4xl leading-[1.05] text-brand md:text-5xl">{title}</h2>
      </div>
      {action}
    </motion.div>
  );
}

export default function Home() {
  const { settings } = useSettings();
  const cabins = useFetch<Cabin[]>('/cabins?featured=true&limit=3');
  const activities = useFetch<Activity[]>('/activities?limit=4');
  const testimonials = useFetch<Review[]>('/reviews/featured');
  const hero = settings.heroImages.length ? settings.heroImages : FALLBACK_HERO;
  const [slide, setSlide] = useState(0);
  const [quote, setQuote] = useState(0);
  const quotes = testimonials.data ?? [];

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % hero.length), 7000);
    return () => clearInterval(t);
  }, [hero.length]);

  return (
    <div className="flex flex-col">
      {/* Portada */}
      <section className="relative flex min-h-[92vh] flex-col justify-end overflow-hidden bg-brand-dark pt-28 pb-10">
        <AnimatePresence initial={false}>
          <motion.img
            key={hero[slide % hero.length]}
            src={hero[slide % hero.length]}
            alt=""
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/40 to-brand-dark/30" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }} className="max-w-3xl">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
              <MapPin size={14} className="text-accent" /> Norcasia, Caldas · Río La Miel
            </span>
            <h1 className="font-display text-5xl leading-[0.95] font-light text-white sm:text-6xl md:text-7xl lg:text-8xl">
              Despierta donde <em className="font-normal text-accent">canta el río</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Cabañas en guadua entre el bosque tropical y las aguas esmeralda del Río La Miel. Descanso sencillo, cocina de huerta y naturaleza a tu ritmo.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.25 }} className="mt-10 max-w-4xl">
            <SearchBar />
          </motion.div>
          {hero.length > 1 && (
            <div className="mt-8 flex items-center gap-2">
              {hero.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setSlide(i)}
                  className={`h-1 rounded-full transition-all ${slide % hero.length === i ? 'w-10 bg-accent' : 'w-4 bg-white/40 hover:bg-white/70'}`}
                  aria-label={`Ver foto ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pilares */}
      <section className="border-b border-ink/5 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-ink/5 px-4 sm:grid-cols-2 sm:divide-y-0 sm:px-6 lg:grid-cols-4 lg:divide-x lg:px-8">
          {PILLARS.map(({ icon: Icon, title, text }, i) => (
            <motion.div key={title} {...reveal} transition={{ ...reveal.transition, delay: i * 0.08 }} className="flex gap-4 py-8 lg:px-6 lg:first:pl-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-river/10 text-river"><Icon size={20} /></span>
              <div>
                <h3 className="font-bold text-brand">{title}</h3>
                <p className="text-sm text-ink/60">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <motion.div {...reveal} className="relative h-[480px] lg:col-span-6">
            <img src={hero[1 % hero.length]} alt="Río La Miel" className="absolute top-0 left-0 h-[78%] w-[72%] rounded-2xl object-cover shadow-xl" />
            <img src={hero[0]} alt="Bosque de Norcasia" className="absolute right-0 bottom-0 h-[58%] w-[52%] rounded-2xl border-8 border-sand object-cover shadow-xl" />
            <div className="absolute bottom-6 left-4 rounded-2xl bg-accent px-5 py-4 text-white shadow-lg">
              <p className="font-display text-3xl leading-none">Río La Miel</p>
              <p className="text-xs font-semibold tracking-widest uppercase opacity-80">Aguas cristalinas</p>
            </div>
          </motion.div>
          <motion.div {...reveal} className="lg:col-span-5 lg:col-start-8">
            <span className="eyebrow"><span className="h-px w-6 bg-accent" /> Nuestra casa</span>
            <h2 className="font-display mb-6 text-4xl leading-[1.05] text-brand md:text-5xl">Un refugio hecho de bosque, agua y guadua</h2>
            <p className="mb-5 text-lg leading-relaxed text-ink/70">
              {settings.hotelName} nace en Norcasia, Caldas, frente a una de las maravillas naturales de Colombia. Construimos con guadua y bambú
              para integrarnos al bosque tropical en lugar de reemplazarlo.
            </p>
            <p className="mb-8 leading-relaxed text-ink/60">
              Aquí el día empieza con el canto de las aves y termina con el sonido del río. Lo demás lo decides tú: nadar, caminar, pescar o no hacer nada.
            </p>
            <Link to="/cabanas" className="btn-dark">Conoce las cabañas <ArrowRight size={16} /></Link>
          </motion.div>
        </div>
      </section>

      {/* Cabañas */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Hospedaje"
            title={<>Cabañas para <em className="text-river">desconectarte</em></>}
            action={<Link to="/cabanas" className="btn-outline">Ver todas <ArrowRight size={16} /></Link>}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {(cabins.data ?? []).map((c, i) => (
              <motion.div key={c.id} {...reveal} transition={{ ...reveal.transition, delay: i * 0.1 }}>
                <Link to={`/cabanas/${c.id}`} className="group block">
                  <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-2xl">
                    <img src={imageOr(c.imageUrl, c.id, 800, 1000)} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className="absolute top-4 left-4 rounded-lg bg-white/95 px-3 py-1.5 text-sm font-bold text-brand">
                      {money(c.price)} <span className="font-medium text-ink/50">/ noche</span>
                    </span>
                    <span className="absolute right-4 bottom-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white opacity-0 transition group-hover:opacity-100">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl text-brand">{c.name}</h3>
                      <p className="flex items-center gap-1.5 text-sm text-ink/55"><Users size={14} /> Hasta {c.capacity} personas</p>
                    </div>
                    {c.averageRating != null && (
                      <span className="flex items-center gap-1 text-sm font-bold text-brand"><Star size={14} className="fill-accent text-accent" /> {c.averageRating.toFixed(1)}</span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Experiencias */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Experiencias"
            title="El río, el bosque y su gente"
            action={<Link to="/actividades" className="btn-outline">Todas las experiencias <ArrowRight size={16} /></Link>}
          />
          <div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-4">
            {(activities.data ?? []).map((a, i) => (
              <motion.div
                key={a.id}
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.08 }}
                className={i === 0 ? 'md:col-span-2 md:row-span-2' : i === 3 ? 'md:col-span-2' : ''}
              >
                <Link to="/actividades" className="group relative block h-full overflow-hidden rounded-2xl">
                  <img src={imageOr(a.imageUrl, a.id, 900, 700)} alt={a.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <div className="mb-2 flex gap-2 text-xs font-semibold">
                      {a.duration && <span className="flex items-center gap-1 rounded-md bg-white/15 px-2 py-1 backdrop-blur"><Clock size={12} /> {a.duration}</span>}
                      <span className="rounded-md bg-accent px-2 py-1">{a.cost > 0 ? money(a.cost) : 'Incluido'}</span>
                    </div>
                    <h3 className={`font-display ${i === 0 ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{a.name}</h3>
                    {i === 0 && <p className="mt-2 max-w-md text-sm text-white/75">{a.description}</p>}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Restaurante */}
      <section className="bg-brand text-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
          <motion.div {...reveal} className="px-4 py-20 sm:px-6 lg:px-8 lg:py-28 lg:pr-16">
            <span className="eyebrow"><span className="h-px w-6 bg-accent" /> Restaurante</span>
            <h2 className="font-display mb-6 text-4xl leading-[1.05] md:text-5xl">De la huerta a tu mesa, frente al río</h2>
            <p className="mb-10 text-lg text-white/70">
              Cocina colombiana con ingredientes de nuestra huerta y de agricultores de Norcasia: pescado de río, recetas a leña y café de origen tostado en casa.
            </p>
            <ul className="mb-10 space-y-4">
              {[
                ['Menú degustación', 'Cinco tiempos por los sabores del Magdalena Medio'],
                ['Pesca del día', 'Bocachico y especies locales preparadas al momento'],
                ['Café de origen', 'Tostado en casa para empezar el día frente al río'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-4 border-b border-white/10 pb-4">
                  <Coffee size={18} className="mt-1 shrink-0 text-accent" />
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="text-sm text-white/60">{d}</p>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/menu" className="btn-primary">Ver el menú <ArrowRight size={16} /></Link>
          </motion.div>
          <div className="relative min-h-[360px]">
            <img
              src="https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=1200&q=80"
              alt="Plato del restaurante"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Testimonios */}
      {quotes.length > 0 && (
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
            <Quote size={44} className="mx-auto mb-8 text-accent" />
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={quotes[quote % quotes.length].id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <p className="font-display mb-8 text-2xl leading-snug text-brand md:text-4xl">“{quotes[quote % quotes.length].comment}”</p>
                <footer className="flex flex-col items-center gap-2">
                  <span className="text-accent"><Stars value={quotes[quote % quotes.length].rating} /></span>
                  <span className="font-bold text-brand">{quotes[quote % quotes.length].guestName}</span>
                  {quotes[quote % quotes.length].cabin && <span className="text-sm text-ink/50">{quotes[quote % quotes.length].cabin!.name}</span>}
                </footer>
              </motion.blockquote>
            </AnimatePresence>
            {quotes.length > 1 && (
              <div className="mt-10 flex justify-center gap-3">
                <button onClick={() => setQuote((q) => (q - 1 + quotes.length) % quotes.length)} className="btn-outline h-11 w-11 p-0" aria-label="Anterior"><ChevronLeft size={18} /></button>
                <button onClick={() => setQuote((q) => (q + 1) % quotes.length)} className="btn-outline h-11 w-11 p-0" aria-label="Siguiente"><ChevronRight size={18} /></button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Ubicación */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="relative z-0 h-[520px]">
              <HotelMap lat={settings.latitude} lng={settings.longitude} name={settings.hotelName} cabins={cabins.data ?? []} />
            </div>
            <div className="card relative z-10 -mt-24 mx-4 p-8 md:absolute md:top-8 md:left-8 md:mx-0 md:mt-0 md:max-w-sm">
              <span className="eyebrow"><span className="h-px w-6 bg-accent" /> Cómo llegar</span>
              <h2 className="font-display mb-4 text-3xl text-brand">Norcasia, Caldas</h2>
              <p className="mb-6 text-sm text-ink/65">
                Un destino rodeado de selva tropical y ríos de aguas esmeralda, a unas 5 horas de Medellín o Bogotá.
              </p>
              <p className="mb-6 flex gap-2 text-sm font-semibold text-brand"><MapPin size={18} className="shrink-0 text-accent" /> {settings.address}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-dark w-full"
              >
                Abrir en Google Maps <ArrowUpRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
