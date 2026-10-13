import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../utils/api';

// Backend auth (Express + JWT httpOnly cookie). The user object lives only in
// React state/memory; the JWT itself is never accessible to JavaScript.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Restore the session on startup: the browser sends the httpOnly cookie.
  useEffect(() => {
    let cancelled = false;
    api
      .get('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email, password, remember = true) => {
    try {
      const data = await api.post('/auth/login', { email, password, remember });
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة!' };
    }
  };

  const register = async ({ name, email, password, confirmPassword }) => {
    if (!name.trim()) {
      return { ok: false, error: 'يرجى إدخال الاسم!' };
    }
    if (password !== confirmPassword) {
      return { ok: false, error: 'كلمتا المرور غير متطابقتين!' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'كلمة المرور يجب أن لا تقل عن 6 خانات!' };
    }

    try {
      const data = await api.post('/auth/register', {
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      setUser(data.user);
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: err.message || 'تعذر إنشاء الحساب، حاول مرة أخرى!', warning: err.status === 409 };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, authLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
