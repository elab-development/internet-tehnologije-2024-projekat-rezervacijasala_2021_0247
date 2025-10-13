import React, { useState } from "react";
import api from "../api/client";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import FormCard from "../components/ui/FormCard";
import Alert from "../components/ui/Alert";
import "./auth.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError]   = useState(null);
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e){
    e.preventDefault();
    setError(null); setServerMsg("");
    if(!email.trim()){ setError("Unesite email."); return; }
    setLoading(true);
    try{
      // Laravel: PasswordController@posaljiLink
      const res = await api.post("/lozinka/posalji-link", { email });
      setServerMsg(res?.data?.message || "Proverite email sanduče.");
    }catch(err){
      const msg = err?.response?.data?.message || "Neuspešno slanje linka.";
      setServerMsg(msg);
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="lp">
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <main className="auth" role="main">
        <FormCard
          onSubmit={handleSubmit}
          eyebrow="Reset lozinke"
          title="Zaboravljena lozinka"
          subtitle="Unesite email i poslaćemo vam link za promenu lozinke."
        >
          {serverMsg && (
            <Alert kind={/neusp|greš|pogreš/i.test(serverMsg) ? "danger":"ok"}>
              {serverMsg}
            </Alert>
          )}

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            autoComplete="email"
            required
            error={error}
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? "Šaljem link..." : "Pošalji link"}
          </Button>

          <p className="meta">
            Znaš lozinku? <a href="/login">Prijavi se</a>
          </p>
        </FormCard>
      </main>
    </div>
  );
}
