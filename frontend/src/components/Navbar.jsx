import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b-[1.5px] border-border-dark bg-canvas py-3">
      <div className="container-wire flex items-center justify-between">
        <Link to="/" aria-label="PrepNexa home" className="font-mono text-base font-bold text-stone-900 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-white shadow-sm">
            <Zap size={18} fill="currentColor" aria-hidden="true" />
          </span>
          <span className="font-sans text-lg tracking-tight">PrepNexa<span className="text-primary">.</span></span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" className="text-sm font-semibold text-stone-800 hover:text-primary">
            Discover
          </NavLink>
          {user && (
            <NavLink to="/dashboard" className="text-sm font-semibold text-stone-800 hover:text-primary">
              Practice
            </NavLink>
          )}
          <a href="/#how-it-works" className="text-sm font-semibold text-stone-800 hover:text-primary">
            How it Works
          </a>

          {user ? (
            <Button variant="secondary" onClick={handleLogout}>
              Sign Out
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="secondary" to="/login">
                Sign In
              </Button>
              <Button variant="primary" to="/signup">
                Get Started
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          className="flex size-11 items-center justify-center rounded-full border border-border bg-white text-stone-900 sm:hidden"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>

      {open && (
        <div id="mobile-navigation" className="border-t border-border bg-surface-card p-4 sm:hidden">
          <div className="grid gap-3">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm font-semibold py-1">
              Discover
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="text-sm font-semibold py-1">
                  Practice Dashboard
                </Link>
                <button onClick={handleLogout} className="text-left text-sm font-semibold text-primary py-1">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="text-sm font-semibold py-1">
                  Sign In
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)} className="text-sm font-semibold text-primary py-1">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
