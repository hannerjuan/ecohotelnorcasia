import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays, Search, Users } from 'lucide-react';
import { toIso } from '../lib/format';

registerLocale('es', es);
const DAY = 86_400_000;

// Buscador de disponibilidad: lleva a /cabanas con las fechas y personas elegidas.
export function SearchBar({ initial }: { initial?: { checkIn?: Date | null; checkOut?: Date | null; guests?: number } }) {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date | null>(initial?.checkIn ?? null);
  const [checkOut, setCheckOut] = useState<Date | null>(initial?.checkOut ?? null);
  const [guests, setGuests] = useState(initial?.guests ?? 2);

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams({ guests: String(guests) });
    if (checkIn && checkOut) {
      p.set('checkIn', toIso(checkIn));
      p.set('checkOut', toIso(checkOut));
    }
    navigate(`/cabanas?${p}`);
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-2 text-ink shadow-2xl shadow-black/20 md:grid-cols-[1fr_1fr_0.8fr_auto]">
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-sand">
        <CalendarDays size={18} className="shrink-0 text-river" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold tracking-widest text-ink/45 uppercase">Llegada</span>
          <DatePicker
            selected={checkIn}
            onChange={(d: Date | null) => {
              setCheckIn(d);
              if (d && (!checkOut || checkOut <= d)) setCheckOut(new Date(d.getTime() + 2 * DAY));
            }}
            minDate={new Date()}
            locale="es"
            dateFormat="d MMM yyyy"
            placeholderText="Elige fecha"
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-ink/40"
          />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-sand">
        <CalendarDays size={18} className="shrink-0 text-river" />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold tracking-widest text-ink/45 uppercase">Salida</span>
          <DatePicker
            selected={checkOut}
            onChange={(d: Date | null) => setCheckOut(d)}
            minDate={checkIn ? new Date(checkIn.getTime() + DAY) : new Date(Date.now() + DAY)}
            locale="es"
            dateFormat="d MMM yyyy"
            placeholderText="Elige fecha"
            className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-medium placeholder:text-ink/40"
          />
        </span>
      </label>
      <label className="flex items-center gap-3 rounded-xl px-4 py-2.5 hover:bg-sand">
        <Users size={18} className="shrink-0 text-river" />
        <span className="flex-1">
          <span className="block text-[10px] font-bold tracking-widest text-ink/45 uppercase">Personas</span>
          <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-transparent text-sm font-semibold outline-none">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
            ))}
          </select>
        </span>
      </label>
      <button className="btn-primary px-6 text-base">
        <Search size={18} /> Buscar
      </button>
    </form>
  );
}
