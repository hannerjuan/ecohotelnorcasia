import { useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { LogoMark } from '../components/Logo';
import { errorMessage } from '../lib/api';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const u = await login(email, password);
      navigate(u.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <form onSubmit={submit} className="card w-full max-w-md space-y-5 p-10">
        <div className="text-center">
          <LogoMark size={48} className="mx-auto mb-3 text-brand" />
          <h1 className="font-display text-4xl text-brand">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-ink/60">Acceso para el equipo del hotel</p>
        </div>
        <div>
          <label className="label">Correo</label>
          <input required type="email" autoComplete="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Contraseña</label>
          <input
            required
            type="password"
            autoComplete="current-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full py-4">
          <LogIn size={18} /> {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
