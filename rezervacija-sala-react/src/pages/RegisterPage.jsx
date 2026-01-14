// src/pages/RegisterPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import "./auth.css";

import Input from "../components/ui/Input";
import FormCard from "../components/ui/FormCard";
import Alert from "../components/ui/Alert";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage({ redirectTo = "/sale" }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingRandom, setLoadingRandom] = useState(false);
  const [avatar, setAvatar] = useState(null); // dekorativno, ne šaljemo backendu

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
    if (form.password && form.password.length < 8) e.password = "Lozinka mora imati najmanje 8 karaktera.";
    if (!form.password_confirmation?.trim()) e.password_confirmation = "Potvrdite lozinku.";
    if (form.password?.trim() && form.password_confirmation?.trim() && form.password !== form.password_confirmation) {
      e.password_confirmation = "Lozinke se ne poklapaju.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  async function fillWithRandom() {
    setLoadingRandom(true);
    setServerMsg("");
    try {
      const r = await fetch("https://randomuser.me/api/?nat=gb,us,fr,de,au");
      const d = await r.json();
      const u = d?.results?.[0];
      if (!u) throw new Error("No user");

      setForm((f) => ({
        ...f,
        name: `${u.name.first} ${u.name.last}`,
        email: u.email,
      }));
      setAvatar(u.picture?.thumbnail || u.picture?.medium || null);
      setServerMsg("Popunio sam ime i email nasumičnim korisnikom.");
    } catch {
      setServerMsg("Nije moguće preuzeti nasumičnog korisnika.");
    } finally {
      setLoadingRandom(false);
    }
  }

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
      // upiši u AuthContext + localStorage
      login({ user, token });

      setServerMsg(message || "Registracija je uspešna!");
      navigate(redirectTo, { replace: true }); // -> /sale
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
        <FormCard
          onSubmit={handleSubmit}
          eyebrow="Registracija"
          title="Kreiraj nalog"
          subtitle="Popuni podatke da započneš sa radom u aplikaciji."
        >
          {serverMsg && (
            <Alert kind={serverMsg.toLowerCase().includes("greš") || serverMsg.toLowerCase().includes("pogreš") ? "danger" : "ok"}>
              {serverMsg}
            </Alert>
          )}

          {/* Dekorativni preview avatara (ako ga imamo iz random user-a) */}
          {avatar && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <img
                src={avatar}
                alt="Avatar podrazumevanog korisnika"
                style={{ width: 40, height: 40, borderRadius: 12, border: "1px solid var(--border)" }}
              />
              <span className="muted" style={{ fontSize: 13 }}>Nasumičan avatar (nije obavezan, služi kao primer)</span>
            </div>
          )}

          <Input
            label="Ime i prezime"
            name="name"
            type="text"
            placeholder="Petar Petrović"
            value={form.name}
            onChange={handleChange}
            autoComplete="name"
            required
            error={firstError(errors.name)}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            error={firstError(errors.email)}
          />

          <PasswordInput
            label="Lozinka"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Najmanje 8 karaktera"
            autoComplete="new-password"
            required
            error={firstError(errors.password)}
          />

          <PasswordInput
            label="Potvrda lozinke"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={handleChange}
            placeholder="Ponovite lozinku"
            autoComplete="new-password"
            required
            error={firstError(errors.password_confirmation)}
          />

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <Button type="button" variant="ghost" onClick={fillWithRandom} disabled={loading || loadingRandom}>
              {loadingRandom ? "Učitavam..." : "🎲 Popuni nasumičnim korisnikom"}
            </Button>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Kreiranje naloga..." : "Registruj se"}
            </Button>
          </div>

          <p className="meta">
            Već imaš nalog? <a href="/login">Prijavi se</a>
          </p>
        </FormCard>
      </main>

   
    </div>
  );
}
