import { useState, type FormEvent } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { ConfirmModal, Modal } from '../../components/Modal';
import { Empty, Loading } from '../../components/States';
import { api, errorMessage } from '../../lib/api';
import { money } from '../../lib/format';
import { useFetch } from '../../lib/useFetch';
import type { MenuItem } from '../../types';

const EMPTY = { name: '', description: '', category: '', price: 0, available: true, sortOrder: 0 };
type Form = typeof EMPTY;

export default function AdminMenu() {
  const { data, loading, reload } = useFetch<MenuItem[]>('/menu?all=true');
  const [editing, setEditing] = useState<{ id: string | null; form: Form } | null>(null);
  const [toDelete, setToDelete] = useState<MenuItem | null>(null);
  const [error, setError] = useState('');
  const categories = [...new Set((data ?? []).map((i) => i.category))];
  const set = (patch: Partial<Form>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } });

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    try {
      if (editing.id) await api.put(`/menu/${editing.id}`, editing.form);
      else await api.post('/menu', editing.form);
      setEditing(null);
      reload();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-display text-3xl text-brand">Menú del restaurante</h2>
        <button className="btn-primary" onClick={() => setEditing({ id: null, form: EMPTY })}><Plus size={18} /> Nuevo plato</button>
      </div>
      {loading ? (
        <Loading />
      ) : !data?.length ? (
        <Empty message="El menú está vacío." />
      ) : (
        <div className="card divide-y divide-brand/10">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="font-semibold">
                  {item.name} {!item.available && <span className="chip ml-2 bg-red-50 text-red-600">No disponible</span>}
                </p>
                <p className="text-sm text-ink/50">{item.category} · {money(item.price)}</p>
              </div>
              <div className="flex gap-2">
                <button className="btn bg-sand px-3 py-2 text-brand" onClick={() => setEditing({ id: item.id, form: { ...item } })} aria-label="Editar"><Edit2 size={16} /></button>
                <button className="btn bg-red-50 px-3 py-2 text-red-600" onClick={() => setToDelete(item)} aria-label="Eliminar"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && (
        <Modal title={editing.id ? 'Editar plato' : 'Nuevo plato'} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="label">Nombre</label>
              <input required className="input" value={editing.form.name} onChange={(e) => set({ name: e.target.value })} />
            </div>
            <div>
              <label className="label">Categoría</label>
              <input required list="menu-categories" className="input" placeholder="Desayunos, Platos fuertes, Bebidas..." value={editing.form.category} onChange={(e) => set({ category: e.target.value })} />
              <datalist id="menu-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label className="label">Descripción</label>
              <textarea rows={2} className="input resize-none" value={editing.form.description} onChange={(e) => set({ description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Precio (COP)</label>
                <input required type="number" min={0} className="input" value={editing.form.price} onChange={(e) => set({ price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">Orden</label>
                <input type="number" className="input" value={editing.form.sortOrder} onChange={(e) => set({ sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-brand" checked={editing.form.available} onChange={(e) => set({ available: e.target.checked })} />
              Disponible
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" className="btn-outline" onClick={() => setEditing(null)}>Cancelar</button>
              <button className="btn-primary">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
      {toDelete && (
        <ConfirmModal
          title="¿Eliminar plato?"
          message={`Se eliminará "${toDelete.name}" del menú.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await api.delete(`/menu/${toDelete.id}`);
            setToDelete(null);
            reload();
          }}
        />
      )}
    </div>
  );
}
