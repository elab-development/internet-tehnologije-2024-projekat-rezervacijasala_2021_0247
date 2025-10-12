// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import Input from "../components/ui/Input";
import FormCard from "../components/ui/FormCard";
import Alert from "../components/ui/Alert";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

export default function LoginPage({ redirectTo = "/sale" }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "beer.bonnie@example.net", password: "password" });
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
      login({ user, token }); // snimi u context + localStorage
      setServerMsg(message || "Prijava je uspešna.");
      navigate(redirectTo, { replace: true });
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
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <main className="auth" role="main">
        <FormCard
          onSubmit={handleSubmit}
          eyebrow="Prijava"
          title="Dobrodošli nazad"
          subtitle="Ulogujte se da nastavite sa rezervacijama, salama i preporukama."
        >
          {serverMsg && (
            <Alert kind={serverMsg.toLowerCase().includes("greš") || serverMsg.toLowerCase().includes("pogreš") ? "danger" : "ok"}>
              {serverMsg}
            </Alert>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
            error={errors.email}
          />

          <PasswordInput
            label="Lozinka"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Unesite lozinku"
            autoComplete="current-password"
            required
            error={errors.password}
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Prijavljivanje..." : "Prijavi se"}
          </Button>

          <p className="meta">
            Nemaš nalog? <a href="/registracija">Registruj se</a>
          </p>
        </FormCard>
      </main>
    </div>
  );
}
