import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, LogIn, LogOut, Mail, MapPin, Menu, Shield, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useSettings, whatsappUrl } from '../lib/settings';
import { LogoMark } from './Logo';
import { WhatsAppIcon } from './WhatsAppIcon';

const NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/cabanas', label: 'Cabañas' },
  { to: '/actividades', label: 'Experiencias' },
  { to: '/menu', label: 'Restaurante' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'admin';
  const inAdmin = pathname.startsWith('/admin');
  // En el inicio el encabezado flota transparente sobre la portada hasta hacer scroll.
  const overHero = pathname === '/' && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-1 text-sm font-semibold transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:rounded-full after:bg-accent after:transition-all ${
      isActive ? 'after:w-full' : 'after:w-0 hover:after:w-full'
    } ${overHero ? 'text-white' : isActive ? 'text-brand' : 'text-ink/70 hover:text-brand'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className={`top-0 z-[1000] w-full transition-colors duration-300 ${
          pathname === '/' ? 'fixed' : 'sticky'
        } ${overHero ? 'bg-transparent' : 'border-b border-ink/5 bg-sand/90 backdrop-blur-md'}`}
      >
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <LogoMark className={overHero ? 'text-white/15' : 'text-brand'} />
            <span className="leading-tight">
              <span className={`font-display block text-xl font-semibold ${overHero ? 'text-white' : 'text-brand'}`}>Madeguadua</span>
              <span className={`block text-[10px] font-bold tracking-[0.3em] uppercase ${overHero ? 'text-white/70' : 'text-ink/50'}`}>
                Ecohotel · Norcasia
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={(s) => `${linkClass(s)} flex items-center gap-1`}>
                <Shield size={16} /> Admin
              </NavLink>
            )}
            {user ? (
              <button onClick={logout} className={`flex items-center gap-1.5 text-sm font-semibold ${overHero ? 'text-white' : 'text-ink/60 hover:text-red-600'}`}>
                <LogOut size={16} /> Salir
              </button>
            ) : (
              <Link to="/cabanas" className="btn-primary py-2.5">
                Reservar
              </Link>
            )}
          </nav>

          <button
            onClick={() => setOpen(!open)}
            className={`rounded-xl p-2 md:hidden ${overHero ? 'text-white' : 'text-brand'}`}
            aria-label="Abrir menú"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-ink/5 bg-sand md:hidden"
            >
              <div className="flex flex-col gap-1 px-4 pt-2 pb-6">
                {NAV.map((n) => (
                  <Link key={n.to} to={n.to} className="font-display rounded-xl px-3 py-3 text-2xl text-brand hover:bg-white">
                    {n.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-3 font-semibold text-brand hover:bg-white">
                    <Shield size={18} /> Panel de administración
                  </Link>
                )}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <Link to="/cabanas" className="btn-primary">Reservar</Link>
                  {user ? (
                    <button onClick={logout} className="btn bg-red-50 text-red-600"><LogOut size={16} /> Salir</button>
                  ) : (
                    <Link to="/ingresar" className="btn-outline"><LogIn size={16} /> Ingresar</Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {!inAdmin && (
        <footer className="bg-brand-dark text-white">
          <div className="mx-auto max-w-7xl px-4 pt-16 pb-8 sm:px-6 lg:px-8">
            <div className="mb-14 flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-14 lg:flex-row lg:items-end">
              <h2 className="font-display max-w-xl text-4xl leading-tight font-light md:text-5xl">
                El río te espera. <em className="text-accent">Ven a escucharlo.</em>
              </h2>
              <a
                href={whatsappUrl(settings.whatsappNumber, `¡Hola! Quiero información para hospedarme en ${settings.hotelName}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary px-6 py-4 text-base"
              >
                <WhatsAppIcon size={18} /> Escríbenos por WhatsApp
              </a>
            </div>
            <div className="grid grid-cols-1 gap-10 text-sm md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="mb-4 flex items-center gap-3">
                  <LogoMark className="text-white/10" />
                  <span className="font-display text-xl">{settings.hotelName}</span>
                </div>
                <p className="max-w-sm text-white/60">
                  Cabañas en guadua junto al Río La Miel. Turismo responsable que protege el bosque, el agua y las comunidades de Norcasia.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Explora</h4>
                <ul className="space-y-2.5 text-white/75">
                  <li><Link to="/cabanas" className="hover:text-accent">Cabañas</Link></li>
                  <li><Link to="/actividades" className="hover:text-accent">Experiencias</Link></li>
                  <li><Link to="/menu" className="hover:text-accent">Restaurante</Link></li>
                  <li><Link to="/privacidad" className="hover:text-accent">Privacidad de datos</Link></li>
                  <li><Link to="/reglas" className="hover:text-accent">Convivencia y cancelación</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-xs font-bold tracking-[0.2em] text-white/40 uppercase">Contacto</h4>
                <ul className="space-y-2.5 text-white/75">
                  <li className="flex gap-2"><MapPin size={16} className="mt-0.5 shrink-0 text-accent" /> {settings.address}</li>
                  <li className="flex gap-2"><Mail size={16} className="mt-0.5 shrink-0 text-accent" /> <a href={`mailto:${settings.email}`} className="break-all hover:text-accent">{settings.email}</a></li>
                  <li className="flex gap-2"><WhatsAppIcon size={16} /> +{settings.whatsappNumber}</li>
                </ul>
              </div>
            </div>
            <div className="mt-14 flex flex-col justify-between gap-2 text-xs text-white/40 sm:flex-row">
              <span>&copy; {new Date().getFullYear()} {settings.hotelName}. Todos los derechos reservados.</span>
              <Link to="/ingresar" className="inline-flex items-center gap-1 hover:text-white">Acceso del equipo <ArrowUpRight size={12} /></Link>
            </div>
          </div>
        </footer>
      )}

      {!inAdmin && (
        <a
          href={whatsappUrl(settings.whatsappNumber, `¡Hola! Quiero información sobre las cabañas en ${settings.hotelName}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-5 bottom-5 z-[1000] flex h-14 w-14 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-xl transition-transform hover:-translate-y-1"
          aria-label="Contactar por WhatsApp"
        >
          <WhatsAppIcon size={26} />
        </a>
      )}
    </div>
  );
}
