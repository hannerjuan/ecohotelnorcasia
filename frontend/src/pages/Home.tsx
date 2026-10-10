import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Anchor, ArrowRight, Calendar, Coffee, MapPin, Trees, Users, Utensils, Waves } from 'lucide-react';
import { HotelMap } from '../components/HotelMap';
import { Stars } from '../components/Stars';
import { useFetch } from '../lib/useFetch';
import { useSettings } from '../lib/settings';
import { imageOr, money, prettyDate } from '../lib/format';
import type { Activity, Cabin, Review } from '../types';

const FALLBACK_HERO = [
  'https://images.unsplash.com/photo-1541410965313-d53b3c16ef17?auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1544253915-0810168cb729?auto=format&fit=crop&w=1920&q=80',
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.6 },
};

export default function Home() {
  const { settings } = useSettings();
  const cabins = useFetch<Cabin[]>('/cabins?featured=true&limit=3');
  const activities = useFetch<Activity[]>('/activities?limit=4');
  const testimonials = useFetch<Review[]>('/reviews/featured');
  const hero = settings.heroImages.length ? settings.heroImages : FALLBACK_HERO;
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % hero.length), 6000);
    return () => clearInterval(t);
  }, [hero.length]);

  return (
    <div className="flex flex-col">
      {/* Portada con carrusel */}
      <section className="relative flex h-[85vh] items-center justify-center overflow-hidden md:h-[90vh]">
        <div className="absolute inset-0">
          {hero.map((src, i) => (
            <motion.img
              key={src}
              src={src}
              alt=""
              initial={false}
              animate={{ opacity: slide % hero.length === i ? 1 : 0, scale: slide % hero.length === i ? 1.08 : 1 }}
              transition={{ opacity: { duration: 1.5 }, scale: { duration: 8, ease: 'linear' } }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ))}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative z-10 mx-auto max-w-5xl px-6 text-center"
        >
          <h1 className="serif mb-6 text-4xl leading-tight text-white drop-shadow-2xl sm:text-6xl md:text-8xl">
            UN REFUGIO EN EL BOSQUE
            <span className="mt-4 block text-xl font-light text-white/90 italic sm:text-2xl md:text-4xl">
              En el corazón de Norcasia, Caldas. Junto al majestuoso Río La Miel.
            </span>
          </h1>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/cabanas" className="btn-primary w-full px-10 py-4 text-lg shadow-2xl sm:w-auto">
              DESCUBRE LAS CABAÑAS
            </Link>
            <a
              href="#nosotros"
              className="w-full rounded-full border border-white/50 px-8 py-4 text-sm font-medium tracking-widest text-white uppercase backdrop-blur-md transition hover:bg-white/20 sm:w-auto"
            >
              Saber más
            </a>
          </div>
        </motion.div>
        {hero.length > 1 && (
          <div className="absolute bottom-16 left-1/2 z-20 flex -translate-x-1/2 gap-4">
            {hero.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${slide % hero.length === i ? 'w-10 bg-white' : 'w-3 bg-white/40'}`}
                aria-label={`Ir a la imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Nosotros */}
      <section id="nosotros" className="overflow-hidden bg-white py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-20 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div {...fadeUp} className="relative">
            <img
              src={hero[1 % hero.length]}
              alt="Río La Miel"
              className="aspect-[3/4] h-[560px] w-full rounded-full object-cover shadow-2xl"
            />
            <div className="absolute -right-6 -bottom-8 hidden max-w-xs rounded-[40px] bg-olive p-10 text-white shadow-xl md:block">
              <Waves className="mb-4" size={32} />
              <h3 className="serif mb-2 text-2xl">Aguas cristalinas</h3>
              <p className="text-sm font-light opacity-80">El Río La Miel ofrece uno de los paisajes más puros de Colombia.</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <span className="eyebrow">Descubre Norcasia</span>
            <h2 className="serif mb-8 text-5xl leading-tight text-olive md:text-6xl">{settings.hotelName} en el corazón de Caldas</h2>
            <p className="mb-8 text-lg leading-relaxed text-ink/70">
              Ubicados en Norcasia, Caldas, somos el portal a una de las maravillas naturales más impresionantes de Colombia: el Río
              La Miel. Nuestras cabañas construidas en bambú y guadua se integran con el bosque tropical, ofreciendo una
              experiencia de descanso sostenible.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-olive/10 p-3 text-olive"><Trees /></div>
                <div>
                  <h4 className="font-bold text-olive">100% sostenible</h4>
                  <p className="text-sm text-ink/50">Construcción ecológica</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-olive/10 p-3 text-olive"><Anchor /></div>
                <div>
                  <h4 className="font-bold text-olive">Aventura</h4>
                  <p className="text-sm text-ink/50">Tours en lancha y pesca</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cabañas destacadas */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16 flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Tu estancia</span>
              <h2 className="serif text-5xl text-olive">Cabañas de ensueño</h2>
            </div>
            <Link to="/cabanas" className="flex items-center gap-2 font-bold text-olive hover:underline">
              Ver todas <ArrowRight size={20} />
            </Link>
          </motion.div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {(cabins.data ?? []).map((c, i) => (
              <motion.div key={c.id} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <Link to={`/cabanas/${c.id}`} className="group card flex h-full flex-col overflow-hidden transition hover:shadow-2xl">
                  <div className="h-80 overflow-hidden">
                    <img
                      src={imageOr(c.imageUrl, c.id, 800, 1000)}
                      alt={c.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8">
                    <h3 className="serif mb-2 text-2xl text-olive">{c.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-ink/50">
                      <span className="flex items-center gap-1"><Users size={14} /> {c.capacity} pers.</span>
                      <span className="font-bold text-olive">{money(c.price)} / noche</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gastronomía */}
      <section className="overflow-hidden bg-white py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <motion.div {...fadeUp}>
            <span className="eyebrow">Del campo a la mesa</span>
            <h2 className="serif mb-6 text-5xl leading-tight text-olive md:text-6xl">Gastronomía sostenible</h2>
            <p className="mb-8 text-lg leading-relaxed text-ink/70">
              Nuestro restaurante fusiona la tradición culinaria colombiana con técnicas modernas, usando ingredientes frescos de
              nuestra huerta orgánica y de agricultores locales de Norcasia.
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-cream p-3 text-olive"><Utensils size={24} /></div>
                <div>
                  <h4 className="mb-1 text-xl font-bold text-olive">Menú degustación</h4>
                  <p className="text-sm text-ink/70">Un viaje de 5 tiempos por los sabores del Magdalena Medio.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-cream p-3 text-olive"><Coffee size={24} /></div>
                <div>
                  <h4 className="mb-1 text-xl font-bold text-olive">Café de origen especial</h4>
                  <p className="text-sm text-ink/70">Tostado en casa. El despertar perfecto frente al río.</p>
                </div>
              </div>
            </div>
            <Link to="/menu" className="btn-primary mt-10 px-8 py-4">
              Ver menú completo
            </Link>
          </motion.div>
          <motion.div {...fadeUp} className="relative grid h-[560px] grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1580476262798-bddd9f4b7369?auto=format&fit=crop&w=900&q=80"
              alt="Plato típico del río"
              className="mt-12 h-full w-full rounded-3xl object-cover shadow-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&w=900&q=80"
              alt="Café de origen"
              className="-mt-4 h-full w-full rounded-3xl object-cover shadow-xl"
            />
            <div className="absolute top-1/2 left-1/2 flex h-36 w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-4 border-cream bg-white shadow-2xl">
              <span className="serif text-3xl text-olive">100%</span>
              <span className="text-center text-[10px] font-bold tracking-widest text-ink/50 uppercase">Local y de río</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonios (reseñas reales destacadas desde el panel) */}
      {(testimonials.data?.length ?? 0) > 0 && (
        <section className="bg-olive py-24 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div {...fadeUp} className="mb-16 text-center">
              <span className="mb-4 block text-sm font-bold tracking-[0.2em] text-cream uppercase">Testimonios</span>
              <h2 className="serif text-5xl">Memorias de nuestros huéspedes</h2>
            </motion.div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.data!.slice(0, 3).map((r, i) => (
                <motion.div
                  key={r.id}
                  {...fadeUp}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-md"
                >
                  <div className="mb-6 text-cream"><Stars value={r.rating} /></div>
                  <p className="mb-8 leading-relaxed text-white/90 italic">"{r.comment}"</p>
                  <div className="flex items-center justify-between border-t border-white/20 pt-4">
                    <span className="font-bold">{r.guestName}</span>
                    <span className="text-xs tracking-widest text-white/50 uppercase">{prettyDate(r.createdAt, 'MMMM yyyy')}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Actividades */}
      <section className="bg-cream py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp} className="mb-16 text-center">
            <span className="eyebrow">Experiencias</span>
            <h2 className="serif text-5xl text-olive">Actividades y aventuras</h2>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {(activities.data ?? []).map((a, i) => (
              <motion.div key={a.id} {...fadeUp} transition={{ duration: 0.5, delay: i * 0.1 }}>
                <Link to="/actividades" className="group relative block h-[420px] overflow-hidden rounded-[32px] shadow-lg">
                  <img
                    src={imageOr(a.imageUrl, a.id, 600, 900)}
                    alt={a.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 w-full p-8">
                    <h3 className="serif mb-2 text-2xl text-white">{a.name}</h3>
                    <p className="mb-4 line-clamp-2 text-sm text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                      {a.description}
                    </p>
                    <div className="flex items-center justify-between text-white">
                      <span className="text-xs font-bold tracking-widest uppercase">{a.duration}</span>
                      <span className="font-bold">{a.cost > 0 ? money(a.cost) : 'Incluido'}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Ubicación */}
      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <h2 className="serif mb-8 text-5xl text-olive">Ubicación del hotel</h2>
            <p className="mb-8 text-lg text-ink/70">
              Estamos en el municipio de Norcasia, Caldas. Un destino rodeado de selva tropical y ríos de aguas esmeralda.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-olive p-3 text-white"><MapPin size={20} /></div>
                <div>
                  <h4 className="font-bold text-olive">Dirección</h4>
                  <p className="text-sm text-ink/50">{settings.address}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-olive p-3 text-white"><Calendar size={20} /></div>
                <div>
                  <h4 className="font-bold text-olive">Cómo llegar</h4>
                  <p className="text-sm text-ink/50">A unas 5 horas de Bogotá o Medellín</p>
                </div>
              </div>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-12 inline-flex items-center gap-2 font-bold text-olive hover:underline"
            >
              Abrir en Google Maps <ArrowRight size={20} />
            </a>
          </div>
          <div className="relative z-0 h-[500px] overflow-hidden rounded-[40px] border-8 border-cream shadow-2xl lg:col-span-2">
            <HotelMap lat={settings.latitude} lng={settings.longitude} name={settings.hotelName} cabins={cabins.data ?? []} />
          </div>
        </div>
      </section>
    </div>
  );
}

