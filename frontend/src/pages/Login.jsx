import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Button from '../components/Button.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to continue practicing."
      footer={<>New here? <Link to="/signup" className="font-bold text-aubergine underline decoration-marigold decoration-2 underline-offset-4">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="notice" role="alert">{error}</p>}
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className="input mb-4" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="current-password" className="input mb-6" placeholder="Your password" value={form.password} onChange={set('password')} required />
        <Button variant="primary" type="submit" className="w-full" disabled={loading || !form.email || !form.password}>
          {loading ? 'Logging in...' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  );
}