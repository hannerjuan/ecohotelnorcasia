import { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Clock, Images, TrendingUp } from 'lucide-react';
import { Lightbox } from '../components/Lightbox';
import { Empty, ErrorState, Loading } from '../components/States';
import { DIFFICULTY_LABEL, imageOr, money } from '../lib/format';
import { useSettings, whatsappUrl } from '../lib/settings';
import { useFetch } from '../lib/useFetch';
import type { Activity } from '../types';

export default function Activities() {
  const { data, loading, error } = useFetch<Activity[]>('/activities');
  const { settings } = useSettings();
  const [gallery, setGallery] = useState<{ images: string[]; index: number; name: string } | null>(null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <span className="eyebrow">Experiencias</span>
        <h1 className="serif mb-4 text-5xl text-olive md:text-6xl">Actividades y aventuras</h1>
        <p className="mx-auto max-w-2xl text-lg text-ink/60">Explora el Río La Miel, sus cascadas y el bosque tropical con guías locales.</p>
      </div>
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorState message={error} />
      ) : !data?.length ? (
        <Empty message="Pronto publicaremos nuestras actividades." />
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {data.map((a, i) => {
            const images = [a.imageUrl, ...a.galleryUrls].filter(Boolean);
            return (
              <motion.article
                key={a.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card flex flex-col overflow-hidden"
              >
                <button
                  className="group relative h-72 overflow-hidden"
                  onClick={() => images.length && setGallery({ images, index: 0, name: a.name })}
                >
                  <img src={imageOr(a.imageUrl, a.id)} alt={a.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <span className="absolute top-4 right-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-olive">
                    {a.cost > 0 ? money(a.cost) : 'Incluido'}
                  </span>
                  {images.length > 1 && (
                    <span className="absolute bottom-4 left-4 flex items-center gap-1 rounded-full bg-black/50 px-3 py-1 text-xs text-white">
                      <Images size={14} /> {images.length} fotos
                    </span>
                  )}
                </button>
                <div className="flex flex-grow flex-col p-8">
                  <h2 className="serif mb-2 text-3xl text-olive">{a.name}</h2>
                  <p className="mb-4 font-medium text-ink/70">{a.description}</p>
                  <p className="mb-6 text-sm leading-relaxed whitespace-pre-line text-ink/60">{a.details}</p>
                  <div className="mb-6 flex flex-wrap gap-3 text-sm">
                    {a.duration && (
                      <span className="chip bg-cream text-ink/70"><Clock size={14} /> {a.duration}</span>
                    )}
                    <span className="chip bg-cream text-ink/70"><TrendingUp size={14} /> {DIFFICULTY_LABEL[a.difficulty]}</span>
                  </div>
                  {a.includes.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-2 text-xs font-bold tracking-widest text-olive uppercase">Incluye</h4>
                      <ul className="grid grid-cols-1 gap-1 text-sm text-ink/70 sm:grid-cols-2">
                        {a.includes.map((item) => (
                          <li key={item} className="flex items-center gap-2"><Check size={14} className="text-olive" /> {item}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <a
                    href={whatsappUrl(settings.whatsappNumber, `¡Hola! Quiero información sobre la actividad "${a.name}".`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline mt-auto self-start"
                  >
                    Reservar actividad
                  </a>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
      {gallery && (
        <Lightbox
          images={gallery.images}
          index={gallery.index}
          alt={gallery.name}
          onIndex={(index) => setGallery({ ...gallery, index })}
          onClose={() => setGallery(null)}
        />
      )}
    </div>
  );
}
