import { useMemo, useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import {
  AlertCircle,
  CalendarCheck,
  CheckCircle2,
  ChevronLeft,
  Coffee,
  Grid,
  Mountain,
  Send,
  Sparkles,
  Star,
  Users,
  Waves,
  Wifi,
  Wind,
} from 'lucide-react';
import { Lightbox } from '../components/Lightbox';
import { ErrorState, Loading } from '../components/States';
import { Stars } from '../components/Stars';
import { api, errorMessage } from '../lib/api';
import { imageOr, money, nights, prettyDate, toDate, toIso } from '../lib/format';
import { useFetch } from '../lib/useFetch';
import type { BookedRange, Cabin, Review } from '../types';

registerLocale('es', es);
const DAY = 86_400_000;

function amenityIcon(name: string) {
  const n = name.toLowerCase();
  if (n.includes('wifi')) return <Wifi size={16} />;
  if (n.includes('café') || n.includes('cafe')) return <Coffee size={16} />;
  if (n.includes('aire')) return <Wind size={16} />;
  if (n.includes('montaña')) return <Mountain size={16} />;
  if (n.includes('río') || n.includes('rio')) return <Waves size={16} />;
  return <CheckCircle2 size={16} />;
}

// Huecos libres de al menos 2 noches entre reservas confirmadas, a partir de mañana.
function recommendedDates(booked: { start: Date; end: Date }[]) {
  const out: { start: Date; end: Date | null }[] = [];
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);
  let current = cursor;
  for (const b of booked) {
    if (current < b.start && (b.start.getTime() - current.getTime()) / DAY >= 2) {
      out.push({ start: new Date(current), end: new Date(b.start) });
    }
    if (current < b.end) current = new Date(b.end);
  }
  if (out.length < 3) out.push({ start: new Date(current), end: null });
  return out.slice(0, 3);
}

export default function CabinDetail() {
  const { id } = useParams<{ id: string }>();
  const cabin = useFetch<Cabin>(`/cabins/${id}`);
  const availability = useFetch<{ booked: BookedRange[] }>(`/cabins/${id}/availability`);
  const reviews = useFetch<Review[]>(`/cabins/${id}/reviews`);
  const [lightbox, setLightbox] = useState<number | null>(null);

  if (cabin.loading) return <Loading />;
  if (cabin.error || !cabin.data) return <ErrorState message={cabin.error ?? 'Cabaña no encontrada'} />;
  const c = cabin.data;
  const images = [c.imageUrl, ...c.galleryUrls].filter(Boolean);
  if (images.length === 0) images.push(imageOr('', c.id, 1200, 1600));
  const average = reviews.data?.length ? reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/cabanas" className="mb-8 inline-flex items-center gap-2 font-medium text-olive hover:underline">
        <ChevronLeft size={20} /> Volver a las cabañas
      </Link>

      <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
        <div>
          {images.length >= 3 ? (
            <div className="relative mb-8 grid h-[480px] grid-cols-4 grid-rows-2 gap-3 overflow-hidden rounded-[40px] shadow-2xl">
              {images.slice(0, 4).map((src, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(i)}
                  className={`group relative overflow-hidden ${i === 0 ? 'col-span-2 row-span-2' : i === 1 ? 'col-span-2' : ''}`}
                >
                  <img src={src} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  {i === 3 || (i === 2 && images.length === 3) ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                      <span className="flex flex-col items-center rounded-xl bg-black/30 px-4 py-2 text-sm font-medium backdrop-blur-md">
                        <Grid size={22} className="mb-1" /> Ver todas
                      </span>
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : (
            <button onClick={() => setLightbox(0)} className="group mb-8 block w-full overflow-hidden rounded-[40px] shadow-2xl">
              <img src={images[0]} alt={c.name} className="h-[480px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </button>
          )}

          <div className="mb-6 flex flex-wrap items-end gap-6">
            <h1 className="serif text-5xl text-olive">{c.name}</h1>
            {average != null && (
              <div className="mb-1 flex items-center gap-2 rounded-2xl bg-olive/10 px-4 py-2">
                <Star className="fill-olive text-olive" size={22} />
                <span className="text-2xl leading-none font-bold text-olive">{average.toFixed(1)}</span>
                <span className="text-sm text-ink/60">
                  ({reviews.data!.length} {reviews.data!.length === 1 ? 'reseña' : 'reseñas'})
                </span>
              </div>
            )}
          </div>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2 rounded-full bg-olive/10 px-4 py-2 font-semibold text-olive">
              <Users size={20} /> Hasta {c.capacity} personas
            </span>
            <span className="text-2xl font-bold text-olive">
              {money(c.price)} <span className="text-sm font-normal text-ink/50">/ noche</span>
            </span>
          </div>
          <div className="space-y-8">
            <div>
              <h3 className="serif mb-4 text-2xl">Descripción</h3>
              <p className="leading-relaxed whitespace-pre-line text-ink/70">{c.description}</p>
            </div>
            {c.amenities.length > 0 && (
              <div>
                <h3 className="serif mb-4 text-2xl">Comodidades</h3>
                <div className="flex flex-wrap gap-3">
                  {c.amenities.map((a) => (
                    <span key={a} className="flex items-center gap-2 rounded-2xl border border-olive/10 bg-white px-4 py-2 text-sm text-ink/70 shadow-sm">
                      <span className="text-olive">{amenityIcon(a)}</span> {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <BookingForm cabin={c} booked={availability.data?.booked ?? []} />
        </div>
      </div>

      <ReviewsSection cabinId={c.id} reviews={reviews.data ?? []} average={average} onCreated={reviews.reload} />

      {lightbox != null && (
        <Lightbox images={images} index={lightbox} onIndex={setLightbox} onClose={() => setLightbox(null)} alt={c.name} />
      )}
    </div>
  );
}

function BookingForm({ cabin, booked }: { cabin: Cabin; booked: BookedRange[] }) {
  const [form, setForm] = useState({ guestName: '', whatsappNumber: '', guests: 2, notes: '' });
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [accept, setAccept] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ whatsappUrl: string; total: number; nights: number } | null>(null);

  const ranges = useMemo(() => booked.map((b) => ({ start: toDate(b.start), end: toDate(b.end) })), [booked]);
  // Una noche ocupada va de start a end-1; el día de salida queda libre para llegar.
  const checkInExcluded = ranges.map((r) => ({ start: r.start, end: new Date(r.end.getTime() - DAY) }));
  const nextBooking = checkIn ? ranges.find((r) => r.start > checkIn) : undefined;
  const recommendations = recommendedDates(ranges);

  let available: boolean | null = null;
  let availableFrom: Date | null = null;
  if (checkIn && checkOut && checkOut > checkIn) {
    const conflict = ranges.find((r) => checkIn < r.end && checkOut > r.start);
    available = !conflict;
    availableFrom = conflict?.end ?? null;
  }
  const n = checkIn && checkOut ? nights(toIso(checkIn), toIso(checkOut)) : 0;
  const tomorrow = new Date(Date.now() + DAY);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!checkIn || !checkOut) return setError('Selecciona las fechas de llegada y salida.');
    if (available === false) return setError('La cabaña no está disponible en esas fechas.');
    setSubmitting(true);
    try {
      const res = await api.post<{ whatsappUrl: string; total: number; nights: number }>('/reservations', {
        ...form,
        cabinId: cabin.id,
        checkIn: toIso(checkIn),
        checkOut: toIso(checkOut),
        acceptPrivacy: accept,
      });
      setDone(res);
      window.open(res.whatsappUrl, '_blank', 'noopener');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="card p-10 text-center">
        <CheckCircle2 size={64} className="mx-auto mb-6 text-green-600" />
        <h2 className="serif mb-4 text-3xl text-olive">¡Solicitud enviada!</h2>
        <p className="mb-2 text-ink/60">
          Registramos tu solicitud por {done.nights} {done.nights === 1 ? 'noche' : 'noches'} ({money(done.total)}).
        </p>
        <p className="mb-8 text-ink/60">Termina de confirmar tu reserva con nosotros por WhatsApp.</p>
        <a href={done.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary bg-[#25D366] hover:bg-[#1ebe5b]">
          Abrir WhatsApp
        </a>
      </div>
    );
  }

  return (
    <div className="card p-8 sm:p-10">
      <h2 className="serif mb-6 text-3xl text-olive">Reserva tu estancia</h2>

      {ranges.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="mb-2 flex items-center gap-2 text-sm font-bold text-amber-800">
            <CalendarCheck size={16} /> Fechas no disponibles
          </h4>
          <ul className="list-inside list-disc space-y-1 text-xs text-amber-700">
            {ranges.slice(0, 5).map((r, i) => (
              <li key={i}>
                {prettyDate(r.start)} al {prettyDate(r.end)}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 rounded-2xl bg-cream p-4">
        <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-olive">
          <Sparkles size={16} /> Fechas recomendadas
        </h4>
        <div className="flex flex-wrap gap-2">
          {recommendations.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setCheckIn(r.start);
                setCheckOut(r.end ?? new Date(r.start.getTime() + 2 * DAY));
              }}
              className="rounded-xl border border-olive/20 bg-white px-3 py-2 text-left text-xs font-medium text-olive transition hover:bg-olive hover:text-white"
            >
              {r.end ? `${prettyDate(r.start, 'd MMM')} – ${prettyDate(r.end, 'd MMM')}` : `Desde el ${prettyDate(r.start, 'd MMM')}`}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label className="label">Nombre completo</label>
          <input
            required
            className="input"
            placeholder="Tu nombre"
            value={form.guestName}
            onChange={(e) => setForm({ ...form, guestName: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Llegada</label>
            <DatePicker
              selected={checkIn}
              onChange={(d: Date | null) => {
                setCheckIn(d);
                if (d && checkOut && checkOut <= d) setCheckOut(null);
              }}
              minDate={new Date()}
              excludeDateIntervals={checkInExcluded}
              locale="es"
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona"
              className="input"
              required
            />
          </div>
          <div>
            <label className="label">Salida</label>
            <DatePicker
              selected={checkOut}
              onChange={(d: Date | null) => setCheckOut(d)}
              minDate={checkIn ? new Date(checkIn.getTime() + DAY) : tomorrow}
              maxDate={nextBooking?.start}
              locale="es"
              dateFormat="dd/MM/yyyy"
              placeholderText="Selecciona"
              className="input"
              required
            />
          </div>
        </div>

        {available === true && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-sm font-medium text-green-700">
            <CheckCircle2 size={18} /> ¡Disponible! {n} {n === 1 ? 'noche' : 'noches'} · {money(n * cabin.price)}
          </div>
        )}
        {available === false && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div>
              No disponible en esas fechas.
              {availableFrom && <p className="mt-1 text-xs opacity-80">Disponible a partir del {prettyDate(availableFrom)}.</p>}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">WhatsApp de contacto</label>
            <input
              required
              type="tel"
              className="input"
              placeholder="+57 300 000 0000"
              value={form.whatsappNumber}
              onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Personas</label>
            <input
              required
              type="number"
              min={1}
              max={cabin.capacity}
              className="input"
              value={form.guests}
              onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <label className="label">Comentarios (opcional)</label>
          <textarea
            rows={2}
            className="input resize-none"
            placeholder="Hora estimada de llegada, peticiones especiales..."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-ink/70">
          <input required type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 h-4 w-4 accent-olive" />
          <span>
            Acepto la{' '}
            <Link to="/privacidad" target="_blank" className="font-medium underline hover:text-olive">
              Política de Privacidad
            </Link>{' '}
            y autorizo el tratamiento de mis datos personales según la Ley 1581 de 2012 (Hábeas Data).
          </span>
        </label>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button type="submit" disabled={submitting || available === false} className="btn-primary w-full py-4 text-lg">
          <Send size={20} /> {submitting ? 'Enviando...' : 'Solicitar reserva por WhatsApp'}
        </button>
        <p className="text-center text-[10px] tracking-widest text-ink/40 uppercase">
          La reserva queda confirmada cuando el hotel te responda
        </p>
      </form>
    </div>
  );
}

function ReviewsSection({
  cabinId,
  reviews,
  average,
  onCreated,
}: {
  cabinId: string;
  reviews: Review[];
  average: number | null;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ guestName: '', comment: '', rating: 5 });
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    try {
      await api.post(`/cabins/${cabinId}/reviews`, form);
      setForm({ guestName: '', comment: '', rating: 5 });
      setMessage({ ok: true, text: '¡Gracias por tu reseña!' });
      onCreated();
    } catch (err) {
      setMessage({ ok: false, text: errorMessage(err) });
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-24 border-t border-olive/10 pt-16">
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <h2 className="serif text-4xl text-olive">Reseñas de huéspedes</h2>
        {average != null && (
          <div className="flex items-center gap-2 text-olive">
            <Star className="fill-olive" size={26} />
            <span className="text-3xl font-bold">{average.toFixed(1)}</span>
            <span className="text-ink/60">/ 5.0</span>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        <form onSubmit={submit} className="card space-y-4 p-8 lg:self-start">
          <h3 className="serif text-2xl text-olive">Deja tu reseña</h3>
          <div className="flex items-center gap-3 text-olive">
            <span className="text-sm font-medium tracking-widest text-ink/60 uppercase">Calificación</span>
            <Stars value={form.rating} size={24} onChange={(rating) => setForm({ ...form, rating })} />
          </div>
          <input required className="input" placeholder="Tu nombre" value={form.guestName} onChange={(e) => setForm({ ...form, guestName: e.target.value })} />
          <textarea
            required
            rows={4}
            className="input resize-none"
            placeholder="¿Cómo fue tu experiencia en la cabaña?"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
          />
          {message && <p className={`text-sm font-medium ${message.ok ? 'text-green-700' : 'text-red-600'}`}>{message.text}</p>}
          <button disabled={sending} className="btn-primary w-full">
            {sending ? 'Enviando...' : 'Publicar reseña'}
          </button>
        </form>
        <div className="space-y-6 lg:col-span-2">
          {reviews.length === 0 ? (
            <p className="py-8 text-center text-ink/60 italic">Aún no hay reseñas para esta cabaña. ¡Sé el primero en dejar una!</p>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="card p-8">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="mb-1 text-lg font-bold text-olive">{r.guestName}</h4>
                    <p className="text-xs tracking-widest text-ink/40 uppercase">{prettyDate(r.createdAt)}</p>
                  </div>
                  <span className="text-olive"><Stars value={r.rating} /></span>
                </div>
                <p className="leading-relaxed text-ink/70">{r.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
