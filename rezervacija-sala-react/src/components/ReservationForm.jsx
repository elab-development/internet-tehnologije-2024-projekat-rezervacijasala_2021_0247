import React, { useState } from "react";
import api from "../api/client";

export default function ReservationForm({ initial=null, salaName="", onCancel, onSuccess }) {
  const [form, setForm] = useState(initial || {
    sala_id: "",
    datum: "",
    vreme_od: "",
    vreme_do: "",
    tip_dogadjaja: "",
    status: "pending",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit(e){
    e.preventDefault();
    setBusy(true); setErr("");
    try{
      await api.post("/rezervacije", form);
      onSuccess && onSuccess();
    }catch(ex){
      const msg = ex?.response?.data?.message || "Greška pri kreiranju rezervacije.";
      setErr(msg);
    }finally{ setBusy(false); }
  }

  return (
    <form className="sale-form" onSubmit={submit}>
      <h2 style={{marginBottom:8}}>Rezervacija — {salaName || ("sala #"+form.sala_id)}</h2>

      <label className="label-inline">Datum</label>
      <input type="date" value={form.datum} onChange={e=>setForm({...form, datum:e.target.value})} required />

      <div className="field-row" style={{marginTop:8}}>
        <div style={{flex:1}}>
          <label className="label-inline">Vreme od</label>
          <input type="time" value={form.vreme_od} onChange={e=>setForm({...form, vreme_od:e.target.value})} required />
        </div>
        <div style={{flex:1}}>
          <label className="label-inline">Vreme do</label>
          <input type="time" value={form.vreme_do} onChange={e=>setForm({...form, vreme_do:e.target.value})} required />
        </div>
      </div>

      <label style={{marginTop:8}} className="label-inline">Tip događaja</label>
      <input value={form.tip_dogadjaja} onChange={e=>setForm({...form, tip_dogadjaja:e.target.value})} placeholder="npr. sastanak, radionica…" required />

      <label style={{marginTop:8}} className="label-inline">Status</label>
      <select value={form.status} onChange={e=>setForm({...form, status:e.target.value})}>
        <option value="pending">Na čekanju</option>
        <option value="confirmed">Potvrđeno</option>
      </select>

      {err && <div className="alert" style={{marginTop:10}}>{err}</div>}

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel} disabled={busy}>Otkaži</button>
        <button className="btn btn--primary" disabled={busy}>Sačuvaj</button>
      </div>
    </form>
  );
}
