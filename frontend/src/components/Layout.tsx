import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronRight, Leaf, LogIn, LogOut, Menu, Shield, X } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useSettings, whatsappUrl } from '../lib/settings';
import { WhatsAppIcon } from './WhatsAppIcon';

const NAV = [
  { to: '/', label: 'Inicio' },
  { to: '/cabanas', label: 'Cabañas' },
  { to: '/actividades', label: 'Actividades' },
  { to: '/menu', label: 'Restaurante' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const isAdmin = user?.role === 'admin';
  const inAdmin = pathname.startsWith('/admin');

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `font-medium transition-colors ${isActive ? 'text-olive' : 'text-ink/70 hover:text-olive'}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-[1000] border-b border-olive/10 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Leaf className="text-olive" size={30} />
            <span className="serif text-2xl font-bold tracking-tight text-olive">{settings.hotelName}</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.to === '/'} className={linkClass}>
                {n.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={(s) => `${linkClass(s)} flex items-center gap-1`}>
                <Shield size={18} /> Admin
              </NavLink>
            )}
            {user ? (
              <button onClick={logout} className="flex items-center gap-2 font-medium text-ink/70 transition-colors hover:text-red-600">
                <LogOut size={18} /> Salir
              </button>
            ) : (
              <Link to="/ingresar" className="btn-primary py-2.5">
                <LogIn size={18} /> Ingresar
              </Link>
            )}
          </nav>

          <button onClick={() => setOpen(!open)} className="p-2 text-olive md:hidden" aria-label="Abrir menú">
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-b border-olive/10 bg-white shadow-lg md:hidden"
            >
              <div className="flex flex-col gap-5 px-6 py-6">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-olive/5 pb-2 text-xl font-medium text-ink/70"
                  >
                    {n.label} <ChevronRight size={20} className="text-olive/40" />
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-olive/5 pb-2 text-xl font-medium text-olive"
                  >
                    <span className="flex items-center gap-2">
                      <Shield size={22} /> Panel de administración
                    </span>
                    <ChevronRight size={20} className="text-olive/40" />
                  </Link>
                )}
                {user ? (
                  <button
                    onClick={() => {
                      logout();
                      setOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-50 py-4 font-medium text-red-600"
                  >
                    <LogOut size={20} /> Cerrar sesión
                  </button>
                ) : (
                  <Link to="/ingresar" onClick={() => setOpen(false)} className="btn-primary w-full py-4 text-lg">
                    <LogIn size={20} /> Iniciar sesión
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      {!inAdmin && (
        <footer className="bg-olive py-12 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <h2 className="serif mb-4 text-3xl">{settings.hotelName}</h2>
              <p className="mx-auto max-w-md font-light opacity-70">
                Un refugio sostenible en medio de la naturaleza. Vive la experiencia de la guadua y la tranquilidad.
              </p>
            </div>
            <div className="mx-auto mb-8 grid max-w-4xl grid-cols-1 gap-8 text-sm opacity-80 md:grid-cols-3">
              <div>
                <h4 className="mb-3 font-bold text-cream">Menú rápido</h4>
                <ul className="space-y-2">
                  <li><Link to="/cabanas" className="hover:text-cream hover:underline">Nuestras cabañas</Link></li>
                  <li><Link to="/actividades" className="hover:text-cream hover:underline">Experiencias y río</Link></li>
                  <li><Link to="/menu" className="hover:text-cream hover:underline">Menú del restaurante</Link></li>
                  <li><Link to="/privacidad" className="hover:text-cream hover:underline">Política de privacidad de datos</Link></li>
                  <li><Link to="/reglas" className="hover:text-cream hover:underline">Reglas de convivencia y cancelación</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-3 font-bold text-cream">Contacto</h4>
                <ul className="space-y-2">
                  <li>{settings.address}</li>
                  <li><a href={`mailto:${settings.email}`} className="hover:underline">{settings.email}</a></li>
                  <li>WhatsApp: +{settings.whatsappNumber}</li>
                </ul>
              </div>
              <div className="space-y-3">
                <p>
                  <span className="font-bold text-cream">Nuestro compromiso natural:</span>
                  <br />
                  Fomentamos el turismo responsable, el respeto por la quietud del bosque y la protección de la flora y fauna de Norcasia.
                </p>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-sm opacity-50">
              &copy; {new Date().getFullYear()} {settings.hotelName}. Todos los derechos reservados.
            </div>
          </div>
        </footer>
      )}

      {!inAdmin && (
        <a
          href={whatsappUrl(settings.whatsappNumber, `¡Hola! Quiero información sobre las cabañas en ${settings.hotelName}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed right-6 bottom-6 z-[1000] flex items-center justify-center rounded-full bg-[#25D366] p-4 text-white shadow-2xl transition-transform hover:scale-110"
          aria-label="Contactar por WhatsApp"
        >
          <WhatsAppIcon size={28} />
        </a>
      )}
    </div>
  );
}
