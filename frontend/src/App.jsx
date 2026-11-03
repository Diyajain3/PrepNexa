import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]); // new page starts at the top
  return <AppRoutes />;
}