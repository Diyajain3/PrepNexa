import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API } from '../services/api.js';
import AuthShell from '../components/AuthShell.jsx';
import Button from '../components/Button.jsx';

function GoogleIcon() {
  return (
    <svg className="size-4 shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function Signup() {
  const { signup, setAuthSession } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    const err = searchParams.get('error');

    if (err) {
      setError(decodeURIComponent(err));
    } else if (token && userRaw) {
      try {
        const user = JSON.parse(decodeURIComponent(userRaw));
        setAuthSession({ token, user });
        navigate('/dashboard', { replace: true });
      } catch {
        setError('Failed to process Google sign-in session');
      }
    }
  }, [searchParams, setAuthSession, navigate]);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const valid = form.name.trim().length >= 2 && form.email && form.password.length >= 8;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!valid) return;
    setError('');
    setLoading(true);
    try {
      await signup({ name: form.name, email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleLogin() {
    window.location.href = `${API}/auth/google`;
  }

  return (
    <AuthShell
      title="Create Candidate Account"
      subtitle="Start practicing algorithmic and systems interviews."
      sideTitle="Why Practice on IntroAI"
      sidePoints={[
        '1. Language choices: Code in Python, C++, Java, or JavaScript.',
        '2. Algorithmic accuracy: Automated syntax and edge-case checking.',
        '3. Complexity evaluation: Big-O time and space analysis on every submit.',
        '4. Immediate feedback: Clear strengths, gaps, and concrete code improvements.',
      ]}
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-bold underline text-primary">
            Sign in
          </Link>
        </>
      }
    >
      {error && <div className="mb-3 text-xs text-primary font-bold">{error}</div>}

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="flex w-full items-center justify-center gap-2 border-[1.5px] border-border-dark bg-canvas py-2 px-3 text-xs font-semibold text-stone-900 rounded mb-4"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <div className="my-3 flex items-center gap-2 text-xs font-mono text-stone-500 uppercase">
        <span className="h-[1px] flex-1 bg-border" />
        <span>or</span>
        <span className="h-[1px] flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">
        <div>
          <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="wire-input text-xs"
            placeholder="Jane Doe"
            value={form.name}
            onChange={set('name')}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="wire-input text-xs"
            placeholder="candidate@example.com"
            value={form.email}
            onChange={set('email')}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-mono font-bold uppercase text-stone-600 mb-1" htmlFor="password">
            Password (min 8 characters)
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className="wire-input text-xs"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            required
          />
        </div>

        <Button
          variant="primary"
          type="submit"
          className="w-full mt-2"
          disabled={loading || !valid}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>
    </AuthShell>
  );
}
