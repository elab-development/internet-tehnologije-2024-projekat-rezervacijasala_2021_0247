import React, { useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import Input from "../components/ui/Input";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import FormCard from "../components/ui/FormCard";
import Alert from "../components/ui/Alert";
import "./auth.css";

export default function ResetPasswordPage({ redirectTo="/login" }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(()=> params.get("token") || "", [params]);
  const emailFromLink = useMemo(()=> params.get("email") || "", [params]);

  const [form, setForm] = useState({
    email: emailFromLink,
    password: "",
    password_confirmation: "",
  });
  const [errors, setErrors] = useState({});
  const [serverMsg, setServerMsg] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e){
    setForm(f=>({ ...f, [e.target.name]: e.target.value }));
    setErrors(er=>({ ...er, [e.target.name]: null }));
    setServerMsg("");
  }

  async function onSubmit(e){
    e.preventDefault();
    setServerMsg(""); setErrors({});
    if(!form.email) return setErrors({ email:"Unesite email." });
    if(!form.password) return setErrors({ password:"Unesite lozinku." });
    if(form.password.length < 8) return setErrors({ password:"Najmanje 8 karaktera." });
    if(form.password !== form.password_confirmation) return setErrors({ password_confirmation:"Lozinke se ne poklapaju." });

    setLoading(true);
    try{
      // Laravel: PasswordController@restartujLozinku
      const res = await api.post("/lozinka/reset", {
        token,
        email: form.email,
        password: form.password,
        password_confirmation: form.password_confirmation
      });
      setServerMsg(res?.data?.message || "Lozinka promenjena.");
      // kratka pauza pa na login
      setTimeout(()=> navigate(redirectTo, { replace:true }), 900);
    }catch(err){
      if(err?.response?.status === 422){
        setErrors(err.response.data?.errors || {});
        setServerMsg("Proverite polja i pokušajte ponovo.");
      }else{
        setServerMsg(err?.response?.data?.message || "Neuspešno resetovanje lozinke.");
      }
    }finally{
      setLoading(false);
    }
  }

  const tokenInvalid = !token;

  return (
    <div className="lp">
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" /><div className="blob blob-2" /><div className="blob blob-3" />
      </div>

      <main className="auth" role="main">
        <FormCard
          onSubmit={onSubmit}
          eyebrow="Reset lozinke"
          title="Postavi novu lozinku"
          subtitle={tokenInvalid ? "Token nedostaje ili je neispravan." : "Unesite novu lozinku za svoj nalog."}
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
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
            error={errors.email}
            disabled={!!emailFromLink}
          />

          <PasswordInput
            label="Nova lozinka"
            name="password"
            value={form.password}
            onChange={onChange}
            placeholder="Najmanje 8 karaktera"
            autoComplete="new-password"
            required
            error={errors.password}
          />

          <PasswordInput
            label="Potvrda lozinke"
            name="password_confirmation"
            value={form.password_confirmation}
            onChange={onChange}
            placeholder="Ponovite lozinku"
            autoComplete="new-password"
            required
            error={errors.password_confirmation}
          />

          <Button type="submit" variant="primary" fullWidth disabled={loading || tokenInvalid}>
            {loading ? "Snimam..." : "Sačuvaj novu lozinku"}
          </Button>

          <p className="meta">
            Vrati se na <a href="/login">Prijavu</a>
          </p>
        </FormCard>
      </main>
    </div>
  );
}
