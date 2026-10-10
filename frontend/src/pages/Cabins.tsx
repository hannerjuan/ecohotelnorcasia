import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Users } from 'lucide-react';
import { Empty, ErrorState, Loading } from '../components/States';
import { useFetch } from '../lib/useFetch';
import { imageOr, money } from '../lib/format';
import type { Cabin } from '../types';

export default function Cabins() {
  const { data, loading, error } = useFetch<Cabin[]>('/cabins');

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <span className="eyebrow">Tu estancia</span>
        <h1 className="serif mb-4 text-5xl text-olive md:text-6xl">Nuestras cabañas</h1>
        <p className="mx-auto max-w-2xl text-lg text-ink/60">
          Espacios en guadua diseñados para descansar en armonía con el bosque y el río.
        </p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data?.length ? (
        <Empty message="Pronto publicaremos nuestras cabañas." />
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Link to={`/cabanas/${c.id}`} className="group card flex h-full flex-col overflow-hidden transition hover:shadow-2xl">
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={imageOr(c.imageUrl, c.id)}
                    alt={c.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute top-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-olive">
                    {money(c.price)} / noche
                  </span>
                </div>
                <div className="flex flex-grow flex-col p-8">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h2 className="serif text-2xl text-olive">{c.name}</h2>
                    {c.averageRating != null && (
                      <span className="flex items-center gap-1 text-sm font-bold text-olive">
                        <Star size={14} className="fill-olive" /> {c.averageRating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <p className="mb-6 line-clamp-2 text-sm text-ink/60">{c.description}</p>
                  <div className="mt-auto flex flex-wrap gap-2">
                    <span className="chip bg-olive/10 text-olive">
                      <Users size={12} /> Hasta {c.capacity}
                    </span>
                    {c.amenities.slice(0, 3).map((a) => (
                      <span key={a} className="chip bg-cream text-ink/60">{a}</span>
                    ))}
                    {c.amenities.length > 3 && <span className="chip bg-cream text-ink/60">+{c.amenities.length - 3}</span>}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
