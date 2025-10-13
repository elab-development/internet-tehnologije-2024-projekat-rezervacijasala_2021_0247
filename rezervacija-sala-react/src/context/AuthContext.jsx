import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

 
function normalizeRole(raw) {
  return (raw || "").toString().trim().toLowerCase();
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Inicijalno čitanje iz localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });

  // Izvuci rolu iz user objekta (podržava i user.data.role)
  const role = normalizeRole(user?.role || user?.data?.role);

  // Pomoćni booleans
  const isAuthenticated = Boolean(token);
  const isAdmin   = role === "administrator" || role === "admin";
  const isManager = role === "menadzer" || role === "manager";
  const isAdminOrManager = isAdmin || isManager;

  function login({ user: u, token: t }) {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
  }

  async function logout() {
    try {
      await api.post("/odjava"); // Laravel Sanctum ruta
    } catch {
      // ignorišemo grešku — ionako čistimo lokalni state
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      setUser(null);
      navigate("/login", { replace: true });
    }
  }

  // Helperi za granularne provere
  const hasRole = (r) => normalizeRole(r) === role;
  const hasAnyRole = (...roles) => roles.map(normalizeRole).includes(role);

  const value = useMemo(() => ({
    // raw podaci
    user,
    token,
    role,
    isAuthenticated,

    // zgodni booleans
    isAdmin,
    isManager,
    isAdminOrManager,

    // helper funkcije
    hasRole,
    hasAnyRole,

    // akcije
    login,
    logout
  }), [user, token, role, isAuthenticated, isAdmin, isManager]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
