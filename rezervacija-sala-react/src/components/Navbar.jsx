import React from "react";
import { Link, NavLink } from "react-router-dom";
import "./navbar.css";

export default function Navbar() {
  // minimalno čitanje user-a/role iz localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem("user"));
  } catch {}
  const role = (user?.role || user?.data?.role || "").toLowerCase();
  const isAdminOrManager = role === "administrator" || role === "menadzer";

  return (
    <header className="lp-header" role="banner">
      <nav className="lp-nav" aria-label="Glavna navigacija">
        <Link className="brand" to="/" aria-label="Početna">
          <span className="brand__text">REZERVACIJA SALA</span>
        </Link>

        <div className="nav-actions">
          <NavLink className="btn btn--ghost" to="/">Početna</NavLink>

          {/* Vidljivo samo za administrator/menadžer */}
          {isAdminOrManager && (
            <NavLink className="btn btn--ghost" to="/sale">
              Sale (Admin)
            </NavLink>
          )}

          <NavLink className="btn btn--ghost" to="/login">Prijava</NavLink>
          <NavLink className="btn btn--primary" to="/registracija">Registracija</NavLink>
        </div>
      </nav>
    </header>
  );
}
