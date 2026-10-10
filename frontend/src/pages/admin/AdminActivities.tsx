import { useState, type FormEvent } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { GalleryField, ImageField, splitList } from '../../components/ImageFields';
import { ConfirmModal, Modal } from '../../components/Modal';
import { Empty, Loading } from '../../components/States';
import { api, errorMessage } from '../../lib/api';
import { DIFFICULTY_LABEL, imageOr, money } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import type { Activity, Difficulty } from '../../types';

const EMPTY = {
  name: '',
  description: '',
  details: '',
  cost: 0,
  duration: '',
  difficulty: 'facil' as Difficulty,
  imageUrl: '',
  galleryUrls: [] as string[],
  includes: '',
};
type Form = typeof EMPTY;

export default function AdminActivities() {
  const { data, loading, reload } = useFetch<Activity[]>('/activities');
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [toDelete, setToDelete] = useState<Activity | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const open = (a?: Activity) => setEditing({ id: a?.id ?? null, form: a ? { ...a, includes: a.includes.join(', ') } : EMPTY });
  const set = (patch: Partial<Form>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const { form } = editing;
    const body = { ...form, cost: Number(form.cost), includes: splitList(form.includes) };
    setSaving(true);
    setError('');
    try {
      if (editing.id) await api.put(`/activities/${editing.id}`, body);
      else await api.post('/activities', body);
      setEditing(null);
      reload();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="serif text-3xl text-olive">Actividades</h2>
        <button className="btn-primary" onClick={() => open()}><Plus size={18} /> Nueva actividad</button>
      </div>
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <Empty message="Aún no hay actividades." />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((a) => (
            <div key={a.id} className="card overflow-hidden">
              <img src={imageOr(a.imageUrl, a.id)} alt={a.name} className="h-44 w-full object-cover" />
              <div className="p-6">
                <h3 className="serif text-xl text-olive">{a.name}</h3>
                <p className="mb-4 text-sm text-ink/60">
                  {a.cost > 0 ? money(a.cost) : 'Incluido'} · {a.duration} · {DIFFICULTY_LABEL[a.difficulty]}
                </p>
                <div className="flex gap-2">
                  <button className="btn-outline flex-1 py-2 text-sm" onClick={() => open(a)}><Edit2 size={14} /> Editar</button>
                  <button className="btn bg-red-50 px-4 py-2 text-red-600" onClick={() => setToDelete(a)} aria-label="Eliminar"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={editing.id ? 'Editar actividad' : 'Nueva actividad'} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="label">Nombre</label>
              <input required className="input" placeholder="Ej: Recorrido en lancha" value={editing.form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Descripción corta</label>
              <input required className="input" value={editing.form.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="label">Detalles</label>
              <textarea required rows={4} className="input resize-none" value={editing.form.details} onChange={(e) => set({ details: e.target.value })} />
            </div>
            <div>
              <label className="label">Costo adicional (0 = incluido)</label>
              <input type="number" min={0} className="input" value={editing.form.cost} onChange={(e) => set({ cost: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Duración</label>
              <input className="input" placeholder="Ej: 3 horas" value={editing.form.duration} onChange={(e) => set({ duration: e.target.value })} />
            </div>
            <div>
              <label className="label">Dificultad</label>
              <select className="input" value={editing.form.difficulty} onChange={(e) => set({ difficulty: e.target.value as Difficulty })}>
                {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Incluye (separado por coma)</label>
              <input className="input" placeholder="Guía, Chaleco, Refrigerio" value={editing.form.includes} onChange={(e) => set({ includes: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <ImageField label="Imagen principal" value={editing.form.imageUrl} onChange={(imageUrl) => set({ imageUrl })} />
            </div>
            <div className="md:col-span-2">
              <GalleryField value={editing.form.galleryUrls} onChange={(galleryUrls) => set({ galleryUrls })} />
            </div>
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
          title="¿Eliminar actividad?"
          message={`Se eliminará "${toDelete.name}". Esta acción no se puede deshacer.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await api.delete(`/activities/${toDelete.id}`);
            setToDelete(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
