import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../api/client";
import "./auth.css";

export default function LoginPage({ onLogin, redirectTo = "/app" }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setServerMsg("");
  };

  const validate = () => {
    const e = {};
    if (!form.email?.trim()) e.email = "Unesite email.";
    if (!form.password?.trim()) e.password = "Unesite lozinku.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerMsg("");
    try {
      const res = await api.post("/prijava", {
        email: form.email,
        password: form.password,
      });

      const { user, token, message } = res.data || {};
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (typeof onLogin === "function") onLogin({ user, token });

      setServerMsg(message || "Prijava je uspešna.");
      window.location.assign(redirectTo);
    } catch (err) {
      if (err?.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setServerMsg("Proverite polja i pokušajte ponovo.");
      } else if (err?.response?.status === 401) {
        setServerMsg(err.response.data?.message || "Pogrešni podaci za prijavu.");
      } else {
        setServerMsg("Došlo je do greške. Pokušajte ponovo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lp">
      {/* Pozadinski blubovi */}
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* NEMA NAVBAR-A */}

      <main className="auth" role="main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-head">
            <p className="eyebrow">Prijava</p>
            <h1>Dobrodošli nazad</h1>
            <p className="muted">
              Ulogujte se da nastavite sa rezervacijama, salama i preporukama.
            </p>
          </div>

          {serverMsg && (
            <div
              className={`alert ${
                serverMsg.toLowerCase().includes("greš") ||
                serverMsg.toLowerCase().includes("pogreš")
                  ? "alert--danger"
                  : "alert--ok"
              }`}
              role="status"
            >
              {serverMsg}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className={errors.email ? "invalid" : ""}
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
            {errors.email && <p className="error">{errors.email}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Lozinka</label>
            <div className="password-wrap">
              <input
                className={errors.password ? "invalid" : ""}
                id="password"
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Unesite lozinku"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Sakrij lozinku" : "Prikaži lozinku"}
                title={showPwd ? "Sakrij lozinku" : "Prikaži lozinku"}
              >
                {showPwd ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && <p className="error">{errors.password}</p>}
          </div>

          <button className="btn btn--primary w-100" type="submit" disabled={loading}>
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </button>

          <p className="meta">
            Nemaš nalog? <a href="/registracija">Registruj se</a>
          </p>
        </form>
      </main>

    
    </div>
  );
}
