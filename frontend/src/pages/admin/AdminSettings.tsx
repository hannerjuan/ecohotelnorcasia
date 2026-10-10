import { useEffect, useState, type FormEvent } from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { GalleryField } from '../../components/ImageFields';
import { ConfirmModal } from '../../components/Modal';
import { api, errorMessage } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { prettyDate } from '../../lib/format';
import { useSettings } from '../../lib/settings';
import { useFetch } from '../../lib/useFetch';
import type { HotelSettings, User } from '../../types';

export default function AdminSettings() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <HotelForm />
      <div className="space-y-8">
        <AdminUsers />
        <PasswordForm />
      </div>
    </div>
  );
}

function Feedback({ message }: { message: { ok: boolean; text: string } | null }) {
  if (!message) return null;
  return <p className={`text-sm font-medium ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>;
}

function HotelForm() {
  const { settings, setSettings } = useSettings();
  const [form, setForm] = useState<HotelSettings>(settings);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  useEffect(() => setForm(settings), [settings]);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      const saved = await api.put<HotelSettings>('/settings', form);
      setSettings(saved);
      setMessage({ ok: true, text: 'Configuración guardada' });
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) });
    }
  }

  return (
    <form onSubmit={save} className="card space-y-4 p-8">
      <h2 className="font-display text-3xl text-brand">Datos del hotel</h2>
      <div>
        <label className="label">Nombre</label>
        <input required className="input" value={form.hotelName} onChange={(e) => setForm({ ...form, hotelName: e.target.value })} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">WhatsApp de reservas</label>
          <input required className="input" placeholder="573001234567" value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} />
        </div>
        <div>
          <label className="label">Correo</label>
          <input required type="email" className="input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="label">Dirección</label>
        <input required className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Latitud</label>
          <input required type="number" step="any" className="input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: Number(e.target.value) })} />
        </div>
        <div>
          <label className="label">Longitud</label>
          <input required type="number" step="any" className="input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: Number(e.target.value) })} />
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm text-ink/60">Fotos de la portada (carrusel del inicio)</p>
        <GalleryField value={form.heroImages} onChange={(heroImages) => setForm({ ...form, heroImages })} />
      </div>
      <Feedback message={message} />
      <button className="btn-primary">Guardar cambios</button>
    </form>
  );
}

function AdminUsers() {
  const { user } = useAuth();
  const { data, reload } = useFetch<User[]>('/users');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);

  async function create(e: FormEvent) {
    e.preventDefault();
    try {
      await api.post('/users', { ...form, role: 'admin' });
      setForm({ name: '', email: '', password: '' });
      setMessage({ ok: true, text: 'Administrador creado' });
      reload();
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) });
    }
  }

  return (
    <div className="card space-y-4 p-8">
      <h2 className="font-display text-3xl text-brand">Administradores</h2>
      <ul className="divide-y divide-brand/10">
        {data?.filter((u) => u.role === 'admin').map((u) => (
          <li key={u.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-semibold">{u.name} {u.id === user?.id && <span className="text-xs text-ink/40">(tú)</span>}</p>
              <p className="text-xs text-ink/50">{u.email} · desde {u.createdAt && prettyDate(u.createdAt)}</p>
            </div>
            {u.id !== user?.id && (
              <button className="btn bg-red-50 px-3 py-2 text-red-600" onClick={() => setToDelete(u)} aria-label="Eliminar"><Trash2 size={16} /></button>
            )}
          </li>
        ))}
      </ul>
      <form onSubmit={create} className="space-y-3 border-t border-brand/10 pt-4">
        <input required className="input" placeholder="Nombre" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" className="input" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required type="password" minLength={8} className="input" placeholder="Contraseña (mínimo 8 caracteres)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Feedback message={message} />
        <button className="btn-outline"><UserPlus size={16} /> Agregar administrador</button>
      </form>
      {toDelete && (
        <ConfirmModal
          title="¿Eliminar administrador?"
          message={`${toDelete.name} ya no podrá entrar al panel.`}
          onClose={() => setToDelete(null)}
          onConfirm={async () => {
            await api.delete(`/users/${toDelete.id}`);
            setToDelete(null);
            reload();
          }}
        />
      )}
    </div>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/auth/password', form);
      setForm({ currentPassword: '', newPassword: '' });
      setMessage({ ok: true, text: 'Contraseña actualizada' });
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) });
    }
  }

  return (
    <form onSubmit={save} className="card space-y-3 p-8">
      <h2 className="font-display text-3xl text-brand">Cambiar mi contraseña</h2>
      <input required type="password" className="input" placeholder="Contraseña actual" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
      <input required type="password" minLength={8} className="input" placeholder="Nueva contraseña" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
      <Feedback message={message} />
      <button className="btn-outline">Actualizar contraseña</button>
    </form>
  );
}
