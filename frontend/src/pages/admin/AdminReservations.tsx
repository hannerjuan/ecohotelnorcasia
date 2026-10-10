import { useEffect, useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  List,
  MessageCircle,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ConfirmModal, Modal } from '../../components/Modal';
import { Empty, ErrorState, Loading } from '../../components/States';
import { api, errorMessage } from '../../lib/api';
import { STATUS_LABEL, STATUS_STYLE, money, nights, prettyDate, toIso } from '../../lib/format';
import { whatsappUrl } from '../../lib/settings';
import { useFetch } from '../../lib/useFetch';
import type { Cabin, Reservation, ReservationDetail, ReservationStatus } from '../../types';
import { RESERVATIONS_CHANGED } from './AdminLayout';

interface Filters {
  cabinId: string;
  status: '' | ReservationStatus;
  from: string;
  to: string;
  q: string;
}

export default function AdminReservations() {
  const [filters, setFilters] = useState<Filters>({ cabinId: '', status: '', from: '', to: '', q: '' });
  const query = useMemo(() => {
    const p = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => v && p.set(k, v));
    return p.toString();
  }, [filters]);
  const reservations = useFetch<Reservation[]>(`/reservations?${query}`);
  const cabins = useFetch<Cabin[]>('/cabins');
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Reservation | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const reload = () => reservations.reload();
    window.addEventListener(RESERVATIONS_CHANGED, reload);
    return () => window.removeEventListener(RESERVATIONS_CHANGED, reload);
  }, [reservations.reload]);

  async function setStatus(id: string, status: ReservationStatus) {
    setActionError('');
    try {
      await api.patch(`/reservations/${id}/status`, { status });
      reservations.reload();
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function remove() {
    if (!toDelete) return;
    await api.delete(`/reservations/${toDelete.id}`);
    setToDelete(null);
    reservations.reload();
  }

  const counts = (reservations.data ?? []).reduce(
    (acc, r) => ({ ...acc, [r.status]: acc[r.status] + 1 }),
    { pending: 0, confirmed: 0, cancelled: 0 } as Record<ReservationStatus, number>,
  );

  return (
    <div>
      <div className="card mb-6 p-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
          <div className="relative md:col-span-2">
            <Search size={16} className="absolute top-1/2 left-3 -translate-y-1/2 text-ink/40" />
            <input
              className="input pl-9"
              placeholder="Buscar por nombre, WhatsApp o código"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <select className="input" value={filters.cabinId} onChange={(e) => setFilters({ ...filters, cabinId: e.target.value })}>
            <option value="">Todas las cabañas</option>
            {cabins.data?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            className="input"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value as Filters['status'] })}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="cancelled">Canceladas</option>
          </select>
          <input type="date" className="input" title="Desde" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <input type="date" className="input" title="Hasta" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2 text-xs">
            {(Object.keys(counts) as ReservationStatus[]).map((s) => (
              <span key={s} className={`chip ${STATUS_STYLE[s]}`}>{STATUS_LABEL[s]}: {counts[s]}</span>
            ))}
            {Object.values(filters).some(Boolean) && (
              <button className="chip bg-sand text-ink/60" onClick={() => setFilters({ cabinId: '', status: '', from: '', to: '', q: '' })}>
                <X size={12} /> Limpiar filtros
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="flex rounded-full bg-sand p-1">
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm ${view === 'list' ? 'bg-white text-brand shadow' : 'text-ink/50'}`}
              >
                <List size={16} /> Lista
              </button>
              <button
                onClick={() => setView('calendar')}
                className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-sm ${view === 'calendar' ? 'bg-white text-brand shadow' : 'text-ink/50'}`}
              >
                <CalendarIcon size={16} /> Calendario
              </button>
            </div>
            <a href={`/api/reservations/export.csv?${query}`} className="btn-outline py-2 text-sm">
              <Download size={16} /> Exportar CSV
            </a>
          </div>
        </div>
      </div>

      {actionError && <ErrorState message={actionError} />}

      {reservations.loading && !reservations.data ? (
        <Loading />
      ) : reservations.error ? (
        <ErrorState message={reservations.error} />
      ) : view === 'calendar' ? (
        <ReservationCalendar reservations={reservations.data ?? []} onOpen={setDetailId} />
      ) : !reservations.data?.length ? (
        <Empty message="No hay reservas con estos filtros." />
      ) : (
        <div className="space-y-4">
          {reservations.data.map((r) => {
            const n = nights(r.checkIn, r.checkOut);
            return (
              <div key={r.id} className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-xl">{r.guestName}</h3>
                    <span className={`chip ${STATUS_STYLE[r.status]}`}>{STATUS_LABEL[r.status]}</span>
                  </div>
                  <p className="text-sm text-ink/60">
                    <strong className="text-brand">{r.cabinName}</strong> · {prettyDate(r.checkIn)} → {prettyDate(r.checkOut)} · {n}{' '}
                    {n === 1 ? 'noche' : 'noches'} · {r.guests} pers.
                  </p>
                  <p className="text-xs text-ink/40">Solicitada el {prettyDate(r.createdAt, "d MMM yyyy, h:mm a")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === 'pending' && (
                    <>
                      <button onClick={() => setStatus(r.id, 'confirmed')} className="btn bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">
                        <Check size={16} /> Confirmar
                      </button>
                      <button onClick={() => setStatus(r.id, 'cancelled')} className="btn bg-red-50 px-4 py-2 text-sm text-red-700 hover:bg-red-100">
                        <X size={16} /> Cancelar
                      </button>
                    </>
                  )}
                  {r.status !== 'pending' && (
                    <button onClick={() => setStatus(r.id, 'pending')} className="btn bg-sand px-4 py-2 text-sm text-ink/70" title="Volver a pendiente">
                      <RotateCcw size={16} /> Pendiente
                    </button>
                  )}
                  <a
                    href={whatsappUrl(r.whatsappNumber, `Hola ${r.guestName}, te escribimos sobre tu reserva en ${r.cabinName}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-[#25D366]/10 px-3 py-2 text-[#128C7E]"
                    title="Escribir por WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                  <button onClick={() => setDetailId(r.id)} className="btn bg-sand px-3 py-2 text-brand" title="Ver detalle">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => setToDelete(r)} className="btn bg-sand px-3 py-2 text-red-600" title="Eliminar">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailId && (
        <ReservationDetailModal
          id={detailId}
          onClose={() => setDetailId(null)}
          onStatus={async (s) => {
            await setStatus(detailId, s);
            setDetailId(null);
          }}
        />
      )}
      {toDelete && (
        <ConfirmModal
          title="¿Eliminar reserva?"
          message={`Se eliminará la reserva de ${toDelete.guestName}. Esta acción no se puede deshacer.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}

function ReservationDetailModal({ id, onClose, onStatus }: { id: string; onClose: () => void; onStatus: (s: ReservationStatus) => void }) {
  const { data, loading } = useFetch<ReservationDetail>(`/reservations/${id}`);
  return (
    <Modal title="Detalle de la reserva" onClose={onClose}>
      {loading || !data ? (
        <Loading />
      ) : (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className={`chip ${STATUS_STYLE[data.status]}`}>{STATUS_LABEL[data.status]}</span>
            <span className="font-mono text-xs text-ink/40">{data.id}</span>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-ink/50">Huésped</dt><dd className="font-semibold">{data.guestName}</dd></div>
            <div><dt className="text-ink/50">WhatsApp</dt><dd className="font-semibold">{data.whatsappNumber}</dd></div>
            <div><dt className="text-ink/50">Cabaña</dt><dd className="font-semibold">{data.cabinName}</dd></div>
            <div><dt className="text-ink/50">Personas</dt><dd className="font-semibold">{data.guests}</dd></div>
            <div><dt className="text-ink/50">Llegada</dt><dd className="font-semibold">{prettyDate(data.checkIn)}</dd></div>
            <div><dt className="text-ink/50">Salida</dt><dd className="font-semibold">{prettyDate(data.checkOut)}</dd></div>
          </dl>
          {data.notes && <p className="rounded-xl bg-sand p-3 text-sm text-ink/70">{data.notes}</p>}
          <div className="rounded-2xl bg-sand p-4 text-sm">
            <div className="flex justify-between"><span>{money(data.cabin.price)} × {data.nights} {data.nights === 1 ? 'noche' : 'noches'}</span><span>{money(data.total)}</span></div>
            <div className="mt-2 flex justify-between border-t border-brand/10 pt-2 text-lg font-bold text-brand"><span>Total</span><span>{money(data.total)}</span></div>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {data.status !== 'confirmed' && (
              <button className="btn bg-green-600 text-white hover:bg-green-700" onClick={() => onStatus('confirmed')}><Check size={16} /> Confirmar</button>
            )}
            {data.status !== 'cancelled' && (
              <button className="btn bg-red-50 text-red-700 hover:bg-red-100" onClick={() => onStatus('cancelled')}><X size={16} /> Cancelar</button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function ReservationCalendar({ reservations, onOpen }: { reservations: Reservation[]; onOpen: (id: string) => void }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const active = reservations.filter((r) => r.status !== 'cancelled');
  // Una reserva ocupa las noches desde la llegada hasta el día anterior a la salida.
  const onDay = (day: Date) => {
    const iso = toIso(day);
    return active.filter((r) => r.checkIn <= iso && iso < r.checkOut);
  };

  return (
    <div className="card p-6">
      <div className="mb-6 flex items-center justify-between">
        <button className="rounded-full p-2 hover:bg-sand" onClick={() => setMonth(addMonths(month, -1))} aria-label="Mes anterior"><ChevronLeft /></button>
        <h3 className="font-display text-2xl text-brand capitalize">{format(month, 'MMMM yyyy', { locale: es })}</h3>
        <button className="rounded-full p-2 hover:bg-sand" onClick={() => setMonth(addMonths(month, 1))} aria-label="Mes siguiente"><ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold tracking-widest text-ink/40 uppercase">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => <div key={d} className="py-2">{d}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const items = onDay(day);
          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 rounded-xl border p-1.5 text-left ${isSameMonth(day, month) ? 'border-brand/10 bg-white' : 'border-transparent bg-sand/50 opacity-50'}`}
            >
              <div className={`mb-1 text-xs font-semibold ${isToday(day) ? 'inline-block rounded-full bg-brand px-1.5 text-white' : 'text-ink/50'}`}>
                {day.getDate()}
              </div>
              <div className="space-y-1">
                {items.slice(0, 3).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => onOpen(r.id)}
                    title={`${r.guestName} · ${r.cabinName}`}
                    className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium ${STATUS_STYLE[r.status]}`}
                  >
                    {r.cabinName}: {r.guestName}
                  </button>
                ))}
                {items.length > 3 && <div className="text-[10px] text-ink/50">+{items.length - 3} más</div>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-ink/50">Se muestran reservas pendientes y confirmadas por noche ocupada.</p>
    </div>
  );
}
