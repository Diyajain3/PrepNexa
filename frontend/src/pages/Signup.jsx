import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AuthShell from '../components/AuthShell.jsx';
import Button from '../components/Button.jsx';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name.trim().length >= 2 && form.email && form.password.length >= 8;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signup(form.name.trim(), form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. No card needed."
      footer={<>Already have an account? <Link to="/login" className="font-bold text-aubergine underline decoration-marigold decoration-2 underline-offset-4">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate>
        {error && <p className="notice" role="alert">{error}</p>}
        <label className="label" htmlFor="name">Name</label>
        <input id="name" autoComplete="name" className="input mb-4" placeholder="Your name" value={form.name} onChange={set('name')} required />
        <label className="label" htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="email" className="input mb-4" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
        <label className="label" htmlFor="password">Password</label>
        <input id="password" type="password" autoComplete="new-password" className="input" placeholder="At least 8 characters" value={form.password} onChange={set('password')} required />
        <p className="mt-1.5 mb-6 text-xs text-aubergine/60">Use 8 or more characters.</p>
        <Button variant="cta" type="submit" className="w-full" disabled={loading || !valid}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
    </AuthShell>
  );
}