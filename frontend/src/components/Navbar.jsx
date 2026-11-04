import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
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
        <Link to="/" className="font-mono text-base font-bold text-stone-900 flex items-center gap-2">
          <span className="border-[1.5px] border-border-dark px-1.5 py-0.5 text-xs bg-surface-card">
            AI
          </span>
          <span>IntroAI</span>
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          <NavLink to="/" className="text-sm font-semibold text-stone-800 hover:text-primary">
            Overview
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
          className="border-[1.5px] border-border-dark px-2 py-1 text-xs font-mono sm:hidden"
          onClick={() => setOpen(!open)}
        >
          Menu
        </button>
      </div>

      {open && (
        <div className="border-t-[1.5px] border-border-dark bg-surface-card p-4 sm:hidden">
          <div className="grid gap-2">
            <Link to="/" onClick={() => setOpen(false)} className="text-sm font-semibold py-1">
              Overview
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
