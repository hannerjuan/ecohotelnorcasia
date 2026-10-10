import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './lib/auth';
import { SettingsProvider } from './lib/settings';
import Activities from './pages/Activities';
import CabinDetail from './pages/CabinDetail';
import Cabins from './pages/Cabins';
import Home from './pages/Home';
import { Privacy, Rules } from './pages/Legal';
import Login from './pages/Login';
import Menu from './pages/Menu';
import NotFound from './pages/NotFound';
import { Loading } from './components/States';

// El panel de administración se carga aparte para que el sitio público pese menos.
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminReservations = lazy(() => import('./pages/admin/AdminReservations'));
const AdminCabins = lazy(() => import('./pages/admin/AdminCabins'));
const AdminActivities = lazy(() => import('./pages/admin/AdminActivities'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminMenu = lazy(() => import('./pages/admin/AdminMenu'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Suspense fallback={<Loading />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="cabanas" element={<Cabins />} />
              <Route path="cabanas/:id" element={<CabinDetail />} />
              <Route path="actividades" element={<Activities />} />
              <Route path="menu" element={<Menu />} />
              <Route path="privacidad" element={<Privacy />} />
              <Route path="reglas" element={<Rules />} />
              <Route path="ingresar" element={<Login />} />
              <Route path="admin" element={<AdminLayout />}>
                <Route index element={<AdminReservations />} />
                <Route path="cabanas" element={<AdminCabins />} />
                <Route path="actividades" element={<AdminActivities />} />
                <Route path="resenas" element={<AdminReviews />} />
                <Route path="menu" element={<AdminMenu />} />
                <Route path="configuracion" element={<AdminSettings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </AuthProvider>
  );
}
