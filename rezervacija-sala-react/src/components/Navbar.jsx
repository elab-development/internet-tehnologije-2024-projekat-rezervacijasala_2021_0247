
import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { user, role, isAuthenticated, isAdminOrManager, logout } = useAuth();
  const [loadingOut, setLoadingOut] = useState(false);

  async function handleLogout() {
    if (loadingOut) return;
    setLoadingOut(true);
    try {
      await logout();
    } finally {
      setLoadingOut(false);
    }
  }

  return (
    <header className="lp-header" role="banner">
      <nav className="lp-nav" aria-label="Glavna navigacija">
        <Link className="brand" to="/" aria-label="Početna">
          <span className="brand__text">REZERVACIJA SALA</span>
        </Link>

        <div className="nav-actions">
          <NavLink className="btn btn--ghost" to="/">Početna</NavLink>

          {/* Admin/menadžer vidi Admin sekciju */}
          {isAdminOrManager && (
            <NavLink className="btn btn--ghost" to="/sale">
              Sale (Admin)
            </NavLink>
          )}

          {!isAuthenticated ? (
            <>
              <NavLink className="btn btn--ghost" to="/login">Prijava</NavLink>
              <NavLink className="btn btn--primary" to="/registracija">Registracija</NavLink>
            </>
          ) : (
            <>
              <div className="nav-user">
                <div className="avatar" aria-hidden="true">
                  {(user?.name || user?.data?.name || "U")
                    .slice(0, 1)
                    .toUpperCase()}
                </div>
                <div className="user-meta">
                  <span className="user-name">{user?.name || user?.data?.name || "Korisnik"}</span>
                  <span className="user-role">{role || "korisnik"}</span>
                </div>
              </div>
              <button
                className="btn btn--danger"
                onClick={handleLogout}
                disabled={loadingOut}
                title="Odjavi se"
              >
                {loadingOut ? "Odjavljivanje..." : "Odjavi se"}
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
