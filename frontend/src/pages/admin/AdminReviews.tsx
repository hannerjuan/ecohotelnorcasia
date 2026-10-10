import { useState } from 'react';
import { Star, Trash2 } from 'lucide-react';
import { ConfirmModal } from '../../components/Modal';
import { Empty, Loading } from '../../components/States';
import { Stars } from '../../components/Stars';
import { api } from '../../lib/api';
import { prettyDate } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import type { Review } from '../../types';

export default function AdminReviews() {
  const { data, loading, reload } = useFetch<Review[]>('/reviews');
  const [toDelete, setToDelete] = useState<Review | null>(null);

  async function toggleFeatured(r: Review) {
    await api.patch(`/reviews/${r.id}`, { featured: !r.featured });
    reload();
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="serif text-3xl text-olive">Reseñas</h2>
        <p className="text-sm text-ink/60">Marca con la estrella las reseñas que quieres mostrar como testimonios en la página de inicio.</p>
      </div>
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <Empty message="Aún no hay reseñas." />
      ) : (
        <div className="space-y-4">
          {data.map((r) => (
            <div key={r.id} className="card flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 flex flex-wrap items-center gap-3">
                  <strong className="text-olive">{r.guestName}</strong>
                  <span className="text-olive"><Stars value={r.rating} size={14} /></span>
                  <span className="text-xs text-ink/40">{r.cabin?.name} · {prettyDate(r.createdAt)}</span>
                </div>
                <p className="text-sm text-ink/70">{r.comment}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  onClick={() => toggleFeatured(r)}
                  className={`btn px-4 py-2 text-sm ${r.featured ? 'bg-olive text-white' : 'bg-cream text-ink/60'}`}
                  title="Mostrar en el inicio"
                >
                  <Star size={16} className={r.featured ? 'fill-white' : ''} /> {r.featured ? 'Destacada' : 'Destacar'}
                </button>
                <button onClick={() => setToDelete(r)} className="btn bg-red-50 px-3 py-2 text-red-600" aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {toDelete && (
        <ConfirmModal
          title="¿Eliminar reseña?"
          message={`Se eliminará la reseña de ${toDelete.guestName}.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await api.delete(`/reviews/${toDelete.id}`);
            setToDelete(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
