import React, { createContext, useContext, useEffect, useState } from 'react';
import { loginUser, registerUser, fetchMe } from '../services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('wf_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('wf_token');
    if (!token) { setLoading(false); return; }
    fetchMe()
      .then(({ user }) => { setUser(user); localStorage.setItem('wf_user', JSON.stringify(user)); })
      .catch(() => { localStorage.removeItem('wf_token'); localStorage.removeItem('wf_user'); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await loginUser({ email, password });
    localStorage.setItem('wf_token', token);
    localStorage.setItem('wf_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await registerUser(payload);
    localStorage.setItem('wf_token', token);
    localStorage.setItem('wf_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('wf_token');
    localStorage.removeItem('wf_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
