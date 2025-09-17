import React, { useState } from "react";
import api from "../api/client"; 
import "./auth.css";
import Input from "../components/ui/Input";
import FormCard from "../components/ui/FormCard";
import Alert from "../components/ui/Alert";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
 

export default function RegisterPage({ onRegister, redirectTo = "/app" }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
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
    if (form.password && form.password.length < 8) e.password = "Lozinka mora imati najmanje 8 karaktera.";
    if (!form.password_confirmation?.trim()) e.password_confirmation = "Potvrdite lozinku.";
    if (form.password?.trim() && form.password_confirmation?.trim() && form.password !== form.password_confirmation) {
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

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Kreiranje naloga..." : "Registruj se"}
          </Button>

          <p className="meta">
            Već imaš nalog? <a href="/login">Prijavi se</a>
          </p>
        </FormCard>
      </main>

      <footer className="lp-footer" role="contentinfo">
        <p>© {new Date().getFullYear()} SalaHub • Registracija</p>
      </footer>
    </div>
  );
}
