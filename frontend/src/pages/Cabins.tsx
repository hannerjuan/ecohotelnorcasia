import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2, Star, Users, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { SearchBar } from '../components/SearchBar';
import { Empty, ErrorState, Loading } from '../components/States';
import { useFetch } from '../lib/useFetch';
import { imageOr, money, nights, prettyDate, toDate } from '../lib/format';
import type { Cabin } from '../types';

export default function Cabins() {
  const [params] = useSearchParams();
  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');
  const guests = Number(params.get('guests')) || undefined;
  const searching = Boolean(checkIn && checkOut);
  const { data, loading, error } = useFetch<Cabin[]>(`/cabins?${params.toString()}`);
  const n = searching ? nights(checkIn!, checkOut!) : 0;
  // Las disponibles primero.
  const sorted = [...(data ?? [])].sort((a, b) => Number(b.available ?? true) - Number(a.available ?? true));
  const availableCount = sorted.filter((c) => c.available !== false).length;

  return (
    <div>
      <PageHeader eyebrow="Hospedaje" title={<>Nuestras <em className="text-accent">cabañas</em></>} text="Espacios en guadua para descansar en armonía con el bosque y el río.">
        <div className="max-w-4xl">
          <SearchBar
            key={params.toString()}
            initial={{ checkIn: checkIn ? toDate(checkIn) : null, checkOut: checkOut ? toDate(checkOut) : null, guests }}
          />
        </div>
      </PageHeader>

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {searching && data && (
          <p className="mb-8 text-ink/70">
            <strong className="text-brand">{availableCount} {availableCount === 1 ? 'cabaña disponible' : 'cabañas disponibles'}</strong> del{' '}
            {prettyDate(checkIn!)} al {prettyDate(checkOut!)} ({n} {n === 1 ? 'noche' : 'noches'}){guests ? ` para ${guests} ${guests === 1 ? 'persona' : 'personas'}` : ''}.{' '}
            <Link to="/cabanas" className="font-semibold text-river underline">Ver todas</Link>
          </p>
        )}
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState message={error} />
        ) : !sorted.length ? (
          <Empty message={guests ? `No tenemos cabañas para ${guests} personas.` : 'Pronto publicaremos nuestras cabañas.'} />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {sorted.map((c, i) => {
              const query = searching ? `?checkIn=${checkIn}&checkOut=${checkOut}` : '';
              return (
                <motion.div key={c.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link
                    to={`/cabanas/${c.id}${query}`}
                    className={`group card flex h-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-xl ${c.available === false ? 'opacity-60' : ''}`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={imageOr(c.imageUrl, c.id)} alt={c.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                      {c.available !== undefined && (
                        <span className={`chip absolute top-4 left-4 ${c.available ? 'bg-white text-green-700' : 'bg-white text-red-600'}`}>
                          {c.available ? <CheckCircle2 size={14} /> : <XCircle size={14} />} {c.available ? 'Disponible' : 'Ocupada en esas fechas'}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-grow flex-col p-6">
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <h2 className="font-display text-2xl text-brand">{c.name}</h2>
                        {c.averageRating != null && (
                          <span className="flex items-center gap-1 text-sm font-bold text-brand">
                            <Star size={14} className="fill-accent text-accent" /> {c.averageRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mb-5 line-clamp-2 text-sm text-ink/60">{c.description}</p>
                      <div className="mb-6 flex flex-wrap gap-2">
                        <span className="chip bg-river/10 text-river"><Users size={12} /> Hasta {c.capacity}</span>
                        {c.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="chip bg-sand text-ink/60">{a}</span>
                        ))}
                      </div>
                      <div className="mt-auto flex items-end justify-between border-t border-ink/5 pt-4">
                        <div>
                          <p className="text-lg font-bold text-brand">{money(searching ? c.price * n : c.price)}</p>
                          <p className="text-xs text-ink/50">{searching ? `${n} ${n === 1 ? 'noche' : 'noches'}` : 'por noche'}</p>
                        </div>
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sand text-brand transition group-hover:bg-accent group-hover:text-white">
                          <ArrowUpRight size={18} />
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
