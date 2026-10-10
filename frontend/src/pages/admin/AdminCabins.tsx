import { useState, type FormEvent } from 'react';
import { Edit2, Plus, Star, Trash2, Users } from 'lucide-react';
import { GalleryField, ImageField, splitList } from '../../components/ImageFields';
import { ConfirmModal, Modal } from '../../components/Modal';
import { Empty, Loading } from '../../components/States';
import { api, errorMessage } from '../../lib/api';
import { imageOr, money } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import type { Cabin } from '../../types';

const EMPTY = {
  name: '',
  description: '',
  price: 0,
  capacity: 2,
  amenities: '',
  imageUrl: '',
  galleryUrls: [] as string[],
  latitude: '',
  longitude: '',
  featured: true,
};
type Form = typeof EMPTY;

export default function AdminCabins() {
  const { data, loading, reload } = useFetch<Cabin[]>('/cabins');
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [toDelete, setToDelete] = useState<Cabin | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const open = (c?: Cabin) =>
    setEditing({
      id: c?.id ?? null,
      form: c
        ? {
            ...c,
            amenities: c.amenities.join(', '),
            latitude: c.latitude?.toString() ?? '',
            longitude: c.longitude?.toString() ?? '',
          }
        : EMPTY,
    });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const f = editing.form;
    const body = {
      name: f.name,
      description: f.description,
      price: Number(f.price),
      capacity: Number(f.capacity),
      amenities: splitList(f.amenities),
      imageUrl: f.imageUrl,
      galleryUrls: f.galleryUrls,
      latitude: f.latitude === '' ? null : Number(f.latitude),
      longitude: f.longitude === '' ? null : Number(f.longitude),
      featured: f.featured,
    };
    setSaving(true);
    setError('');
    try {
      if (editing.id) await api.put(`/cabins/${editing.id}`, body);
      else await api.post('/cabins', body);
      setEditing(null);
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  const set = (patch: Partial<Form>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="serif text-3xl text-olive">Cabañas</h2>
        <button className="btn-primary" onClick={() => open()}><Plus size={18} /> Nueva cabaña</button>
      </div>
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <Empty message="Aún no hay cabañas. Crea la primera." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((c) => (
            <div key={c.id} className="card overflow-hidden">
              <img src={imageOr(c.imageUrl, c.id)} alt={c.name} className="h-44 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="serif text-xl text-olive">{c.name}</h3>
                  {c.featured && <span className="chip bg-olive/10 text-olive"><Star size={12} /> Inicio</span>}
                </div>
                <p className="mb-4 text-sm text-ink/60">
                  {money(c.price)} / noche · <Users size={12} className="inline" /> {c.capacity}
                </p>
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 py-2 text-sm" onClick={() => open(c)}><Edit2 size={14} /> Editar</button>
                  <button className="btn bg-red-50 px-4 py-2 text-red-600" onClick={() => setToDelete(c)} aria-label="Eliminar"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Editar cabaña' : 'Nueva cabaña'} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Nombre</label>
              <input required className="input" value={editing.form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div>
              <label className="label">Precio por noche (COP)</label>
              <input required type="number" min={1} className="input" value={editing.form.price} onChange={(e) => set({ price: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Capacidad (personas)</label>
              <input required type="number" min={1} className="input" value={editing.form.capacity} onChange={(e) => set({ capacity: Number(e.target.value) })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción</label>
              <textarea required rows={4} className="input resize-none" value={editing.form.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Comodidades (separadas por coma)</label>
              <input className="input" placeholder="Wifi, Café, Vista al Río" value={editing.form.amenities} onChange={(e) => set({ amenities: e.target.value })} />
            </div>
            <div>
              <label className="label">Latitud (mapa)</label>
              <input className="input" placeholder="5.5786" value={editing.form.latitude} onChange={(e) => set({ latitude: e.target.value })} />
            </div>
            <div>
              <label className="label">Longitud (mapa)</label>
              <input className="input" placeholder="-74.8943" value={editing.form.longitude} onChange={(e) => set({ longitude: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <ImageField label="Imagen principal" value={editing.form.imageUrl} onChange={(imageUrl) => set({ imageUrl })} />
            </div>
            <div className="md:col-span-2">
              <GalleryField value={editing.form.galleryUrls} onChange={(galleryUrls) => set({ galleryUrls })} />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" className="accent-olive" checked={editing.form.featured} onChange={(e) => set({ featured: e.target.checked })} />
              Mostrar en la página de inicio
            </label>
            {error && <p className="text-sm text-red-600 md:col-span-2">{error}</p>}
            <div className="flex justify-end gap-3 md:col-span-2">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button>
              <button disabled={saving} className="btn-primary">{saving ? 'Guardando...' : 'Guardar'}</button>
            </div>
          </form>
        </Modal>
      )}
      {toDelete && (
        <ConfirmModal
          title="¿Eliminar cabaña?"
          message={`Se eliminará "${toDelete.name}" junto con sus reservas y reseñas. Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await api.delete(`/cabins/${toDelete.id}`);
            setToDelete(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
