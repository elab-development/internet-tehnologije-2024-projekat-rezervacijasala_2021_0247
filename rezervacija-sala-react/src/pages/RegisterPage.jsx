import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import api from "../api/client";
import "./auth.css";

export default function RegisterPage({ onRegister, redirectTo = "/app" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const firstError = (v) => (Array.isArray(v) ? v[0] : v);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: null }));
    setServerMsg("");
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = "Unesite ime i prezime.";
    if (!form.email?.trim()) e.email = "Unesite email.";
    if (!form.password?.trim()) e.password = "Unesite lozinku.";
    if (form.password && form.password.length < 8)
      e.password = "Lozinka mora imati najmanje 8 karaktera.";
    if (!form.password_confirmation?.trim())
      e.password_confirmation = "Potvrdite lozinku.";
    if (
      form.password?.trim() &&
      form.password_confirmation?.trim() &&
      form.password !== form.password_confirmation
    ) {
      e.password_confirmation = "Lozinke se ne poklapaju.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerMsg("");
    try {
      const res = await api.post("/registracija", {
        name: form.name,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      const { user, token, message } = res.data || {};
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (typeof onRegister === "function") onRegister({ user, token });

      setServerMsg(message || "Registracija je uspešna!");
      window.location.assign(redirectTo);
    } catch (err) {
      if (err?.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setServerMsg("Proverite polja i pokušajte ponovo.");
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

      <main className="auth" role="main">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <div className="auth-head">
            <p className="eyebrow">Registracija</p>
            <h1>Kreiraj nalog</h1>
            <p className="muted">Popuni podatke da započneš sa radom u aplikaciji.</p>
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
            <label htmlFor="name">Ime i prezime</label>
            <input
              className={errors.name ? "invalid" : ""}
              id="name"
              type="text"
              name="name"
              placeholder="Petar Petrović"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              required
            />
            {errors.name && <p className="error">{firstError(errors.name)}</p>}
          </div>

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
            {errors.email && <p className="error">{firstError(errors.email)}</p>}
          </div>

          <div className="field">
            <label htmlFor="password">Lozinka</label>
            <div className="password-wrap">
              <input
                className={errors.password ? "invalid" : ""}
                id="password"
                type={showPwd ? "text" : "password"}
                name="password"
                placeholder="Najmanje 8 karaktera"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {errors.password && <p className="error">{firstError(errors.password)}</p>}
          </div>

          <div className="field">
            <label htmlFor="password_confirmation">Potvrda lozinke</label>
            <div className="password-wrap">
              <input
                className={errors.password_confirmation ? "invalid" : ""}
                id="password_confirmation"
                type={showPwd2 ? "text" : "password"}
                name="password_confirmation"
                placeholder="Ponovite lozinku"
                value={form.password_confirmation}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="btn-eye"
                onClick={() => setShowPwd2((s) => !s)}
                aria-label={showPwd2 ? "Sakrij lozinku" : "Prikaži lozinku"}
                title={showPwd2 ? "Sakrij lozinku" : "Prikaži lozinku"}
              >
                {showPwd2 ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password_confirmation && (
              <p className="error">{firstError(errors.password_confirmation)}</p>
            )}
          </div>

          <button className="btn btn--primary w-100" type="submit" disabled={loading}>
            {loading ? "Kreiranje naloga..." : "Registruj se"}
          </button>

          <p className="meta">
            Već imaš nalog? <a href="/login">Prijavi se</a>
          </p>
        </form>
      </main>

      <footer className="lp-footer" role="contentinfo">
        <p>© {new Date().getFullYear()} SalaHub • Registracija</p>
      </footer>
    </div>
  );
}
