 
import React, { createContext, useContext, useMemo, useState } from "react";
import api from "../api/client";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Inicijalno čitanje iz localStorage
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  });

  const role =
    (user?.role || user?.data?.role || "").toString().toLowerCase();
console.log(role)
  const isAdminOrManager = role === "administrator" || role === "menadzer";
  const isAuthenticated = Boolean(token);

  function login({ user: u, token: t }) {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
  }

  async function logout() {
    try {
      await api.post("/odjava"); // Laravel: auth:sanctum protected
    } catch {
      // Ignorišemo grešku — svejedno čistimo keš
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken("");
      setUser(null);
      navigate("/login", { replace: true });
    }
  }

  const value = useMemo(
    () => ({
      user, token, role, isAuthenticated, isAdminOrManager,
      login, logout
    }),
    [user, token, role, isAuthenticated, isAdminOrManager]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
