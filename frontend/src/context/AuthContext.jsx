import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  });

  function save({ token, user }) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  const login = async (email, password) =>
    save(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const signup = async (arg1, arg2, arg3) => {
    let payload;
    if (typeof arg1 === 'object' && arg1 !== null) {
      payload = { name: arg1.name, email: arg1.email, password: arg1.password };
    } else if (typeof arg1 === 'string' && arg1.includes('@')) {
      // Called as (email, password, name)
      payload = { email: arg1, password: arg2, name: arg3 || arg1.split('@')[0] };
    } else {
      // Called as (name, email, password)
      payload = { name: arg1, email: arg2, password: arg3 };
    }
    return save(await api('/auth/signup', { method: 'POST', body: payload }));
  };
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, setAuthSession: save }}>
      {children}
    </AuthContext.Provider>
  );
}
