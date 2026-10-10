import { useEffect, useState } from 'react';
import { Navigate, NavLink, Outlet } from 'react-router-dom';
import { Bell, BellOff, CalendarDays, Compass, Home, MessageSquare, Settings, UtensilsCrossed } from 'lucide-react';
import { Loading } from '../../components/States';
import { useAuth } from '../../lib/auth';
import type { Reservation } from '../../types';

const TABS = [
  { to: '/admin', label: 'Reservas', icon: CalendarDays, end: true },
  { to: '/admin/cabanas', label: 'Cabañas', icon: Home },
  { to: '/admin/actividades', label: 'Actividades', icon: Compass },
  { to: '/admin/resenas', label: 'Reseñas', icon: MessageSquare },
  { to: '/admin/menu', label: 'Menú', icon: UtensilsCrossed },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export const RESERVATIONS_CHANGED = 'ecohotel:reservations-changed';

// Escucha los eventos en tiempo real del servidor y avisa de nuevas reservas.
function useReservationEvents(onNew: (r: Reservation) => void) {
  useEffect(() => {
    const source = new EventSource('/api/admin/events', { withCredentials: true });
    const changed = () => window.dispatchEvent(new Event(RESERVATIONS_CHANGED));
    source.addEventListener('reservation.created', (e) => {
      onNew(JSON.parse((e as MessageEvent).data));
      changed();
    });
    source.addEventListener('reservation.updated', changed);
    source.addEventListener('reservation.deleted', changed);
    return () => source.close();
  }, [onNew]);
}

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [toast, setToast] = useState<Reservation | null>(null);
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'denied');

  const [onNew] = useState(() => (r: Reservation) => {
    setToast(r);
    setTimeout(() => setToast(null), 8000);
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification('Nueva solicitud de reserva', {
        body: `${r.guestName} · ${r.cabinName} (${r.checkIn} → ${r.checkOut})`,
        icon: '/favicon.svg',
      });
    }
  });
  useReservationEvents(onNew);

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/ingresar" replace />;
  if (user.role !== 'admin') return <div className="font-display p-20 text-center text-2xl">Acceso denegado</div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl text-brand">Panel de administración</h1>
          <p className="text-ink/60">Hola, {user.name}</p>
        </div>
        {permission === 'granted' ? (
          <span className="chip bg-green-100 text-green-800"><Bell size={14} /> Notificaciones activas</span>
        ) : (
          <button
            className="btn-outline py-2 text-sm"
            onClick={async () => typeof Notification !== 'undefined' && setPermission(await Notification.requestPermission())}
          >
            <BellOff size={16} /> Activar notificaciones
          </button>
        )}
      </div>
      <nav className="mb-8 flex gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                isActive ? 'bg-brand text-white shadow' : 'text-ink/60 hover:text-brand'
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
      {toast && (
        <div className="fixed right-6 bottom-6 z-[1600] max-w-sm rounded-2xl bg-brand p-5 text-white shadow-2xl">
          <p className="flex items-center gap-2 font-bold"><Bell size={16} /> Nueva solicitud de reserva</p>
          <p className="mt-1 text-sm opacity-90">
            {toast.guestName} · {toast.cabinName} ({toast.checkIn} → {toast.checkOut})
          </p>
        </div>
      )}
    </div>
  );
}
