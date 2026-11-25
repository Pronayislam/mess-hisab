import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { api, getStoredToken, setStoredToken, setUnauthorizedHandler } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(getStoredToken()));

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  useEffect(() => {
    const existingToken = getStoredToken();
    if (!existingToken) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    api
      .me()
      .then((res) => {
        if (cancelled) return;
        setUser(res.user ?? res);
        setToken(existingToken);
      })
      .catch(() => {
        if (cancelled) return;
        setStoredToken(null);
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await api.login(username, password);
    setStoredToken(res.token);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
