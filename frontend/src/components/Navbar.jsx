import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Mic } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const linkClass = ({ isActive }) =>
  `group relative py-1 text-[0.95rem] font-semibold text-aubergine ${isActive ? 'is-active' : ''}`;

function NavItem({ to, children, onClick }) {
  return (
    <NavLink to={to} end className={linkClass} onClick={onClick}>
      {children}
      <span className="absolute -bottom-0.5 left-0 h-0.5 w-full origin-left scale-x-0 bg-marigold transition-transform duration-300 group-hover:scale-x-100 group-[.is-active]:scale-x-100" />
    </NavLink>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const handleLogout = () => { logout(); close(); navigate('/'); };

  return (
    <header className="sticky top-0 z-50 border-b border-aubergine/15 bg-silver/80 backdrop-blur-xl">
      <div className="container-x flex h-[72px] items-center justify-between">
        <Link to="/" onClick={close} className="flex items-center gap-2.5 font-display text-xl font-bold text-aubergine">
          <span className="grid size-9 place-items-center rounded-xl bg-aubergine text-marigold">
            <Mic size={18} />
          </span>
          IntroAI
        </Link>

        {/* Desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          <NavItem to="/">Home</NavItem>
          {user && <NavItem to="/dashboard">Dashboard</NavItem>}
          {/* TODO (Phase 2): Resume ATS, Progress, Leaderboard */}
          {user ? (
            <Button variant="secondary" size="sm" onClick={handleLogout}>Log out</Button>
          ) : (
            <>
              <NavItem to="/login">Log in</NavItem>
              <Button variant="cta" size="sm" to="/signup">Start free</Button>
            </>
          )}
        </nav>

        <button
          className="cursor-pointer p-2 text-aubergine md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="overflow-hidden border-t border-aubergine/15 md:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="container-x grid gap-2 py-4">
              <Button variant="secondary" to="/" onClick={close}>Home</Button>
              {user ? (
                <>
                  <Button variant="secondary" to="/dashboard" onClick={close}>Dashboard</Button>
                  <Button variant="primary" onClick={handleLogout}>Log out</Button>
                </>
              ) : (
                <>
                  <Button variant="secondary" to="/login" onClick={close}>Log in</Button>
                  <Button variant="cta" to="/signup" onClick={close}>Start free</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}