import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="px-4 py-32 text-center">
      <h1 className="font-display mb-4 text-6xl text-brand">Página no encontrada</h1>
      <p className="mb-8 text-ink/60">La página que buscas no existe o fue movida.</p>
      <Link to="/" className="btn-primary">Volver al inicio</Link>
    </div>
  );
}
