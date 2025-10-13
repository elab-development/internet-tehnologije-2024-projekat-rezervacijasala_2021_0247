import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
  const { user, role, isAuthenticated, isAdmin, isAdminOrManager, logout } = useAuth();
  const [loadingOut, setLoadingOut] = useState(false);

  async function handleLogout() {
    if (loadingOut) return;
    setLoadingOut(true);
    try { await logout(); } finally { setLoadingOut(false); }
  }

  const displayName = user?.name || user?.data?.name || "Korisnik";
  const initials = (displayName || "U").slice(0, 1).toUpperCase();

  return (
    <header className="lp-header" role="banner">
      <nav className="lp-nav" aria-label="Glavna navigacija">
        <Link className="brand" to="/" aria-label="Početna">
          <span className="brand__text">REZERVACIJA SALA</span>
        </Link>

        <div className="nav-actions">
          {/* Uvek vidljivo */}
          <NavLink className="btn btn--ghost" to="/">Početna</NavLink>
          <NavLink className="btn btn--ghost" to="/katalog">Katalog</NavLink>
          <NavLink className="btn btn--ghost" to="/floor-plan">Raspored sala</NavLink>

          {/* Samo Admin/Manager */}
          {isAdminOrManager && (
            <>
            <NavLink className="btn btn--ghost" to="/sale">Sale (Admin)</NavLink>
             <NavLink className="btn btn--ghost" to="/admin">Admin</NavLink>
              <NavLink className="btn btn--ghost" to="/admin/rezervacije">Rezervacije (Admin)</NavLink>
              <NavLink className="btn btn--ghost" to="/admin/preporuke">Preporuke (Admin)</NavLink>
              </>
          )}

       

          {!isAuthenticated ? (
            <>
              <NavLink className="btn btn--ghost" to="/login">Prijava</NavLink>
              <NavLink className="btn btn--ghost" to="/registracija">Registracija</NavLink>
            </>
          ) : (
            <>
              <div className="nav-user">
                <div className="avatar" aria-hidden="true">{initials}</div>
                <div className="user-meta">
                  <span className="user-name">{displayName}</span>
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
