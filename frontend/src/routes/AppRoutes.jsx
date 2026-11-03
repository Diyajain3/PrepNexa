import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout.jsx';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import Landing from '../pages/Landing.jsx';
import Login from '../pages/Login.jsx';
import Signup from '../pages/Signup.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import Interview from '../pages/Interview.jsx';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/interview/:sessionId" element={<ProtectedRoute><Interview /></ProtectedRoute>} />
        {/* TODO (Phase 2): /resume-ats, /progress, /leaderboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}