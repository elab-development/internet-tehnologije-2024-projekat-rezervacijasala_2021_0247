import React, { useEffect, useState } from "react";

export default function SaleForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    naziv: "",
    tip: "",
    kapacitet: "",
    opis: "",
    status: true, // podrazumevano aktivna
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initial) {
      setForm({
        naziv: initial.naziv ?? "",
        tip: initial.tip ?? "",
        kapacitet: initial.kapacitet ?? "",
        opis: initial.opis ?? "",
        status: Boolean(initial.status),
      });
    }
  }, [initial]);

  function validate() {
    const e = {};
    if (!form.naziv?.trim()) e.naziv = "Unesite naziv sale.";
    if (!form.tip?.trim()) e.tip = "Unesite tip sale.";
    if (form.kapacitet === "" || form.kapacitet === null) e.kapacitet = "Unesite kapacitet.";
    if (form.kapacitet !== "" && (!Number.isInteger(Number(form.kapacitet)) || Number(form.kapacitet) < 1)) {
      e.kapacitet = "Kapacitet mora biti ceo broj (min 1).";
    }
    if (typeof form.status !== "boolean") e.status = "Status je obavezan.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((prev) => ({ ...prev, [name]: null }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      naziv: form.naziv.trim(),
      tip: form.tip.trim(),
      kapacitet: Number(form.kapacitet),
      opis: form.opis?.trim() || null,
      status: !!form.status,
    };
    await onSubmit?.(payload);
  }

  return (
    <form className="sale-form" onSubmit={submit} noValidate>
      <div className="auth-head">
        <p className="eyebrow">{initial ? "Izmena sale" : "Nova sala"}</p>
        <h2>{initial ? `Ažuriraj: ${initial.naziv ?? ""}` : "Dodaj salu"}</h2>
        <p className="muted">Popuni obavezna polja i sačuvaj.</p>
      </div>

      <div className="field">
        <label htmlFor="naziv">Naziv</label>
        <input
          id="naziv"
          name="naziv"
          type="text"
          className={errors.naziv ? "invalid" : ""}
          placeholder="npr. Sala 1"
          value={form.naziv}
          onChange={handleChange}
          required
        />
        {errors.naziv && <p className="error">{errors.naziv}</p>}
      </div>

      <div className="field">
        <label htmlFor="tip">Tip</label>
        <input
          id="tip"
          name="tip"
          type="text"
          className={errors.tip ? "invalid" : ""}
          placeholder="npr. Konferencijska, Bioskopska…"
          value={form.tip}
          onChange={handleChange}
          required
          list="tip-suggestions"
        />
        <datalist id="tip-suggestions">
          <option value="Konferencijska" />
          <option value="Bioskopska" />
          <option value="Radionica" />
          <option value="Sastanacka" />
          <option value="Multimedijalna" />
        </datalist>
        {errors.tip && <p className="error">{errors.tip}</p>}
      </div>

      <div className="field">
        <label htmlFor="kapacitet">Kapacitet</label>
        <input
          id="kapacitet"
          name="kapacitet"
          type="number"
          min="1"
          step="1"
          className={errors.kapacitet ? "invalid" : ""}
          placeholder="npr. 50"
          value={form.kapacitet}
          onChange={handleChange}
          required
        />
        {errors.kapacitet && <p className="error">{errors.kapacitet}</p>}
      </div>

      <div className="field">
        <label htmlFor="opis">Opis <span className="muted">(opciono)</span></label>
        <textarea
          id="opis"
          name="opis"
          rows={3}
          placeholder="Dodatne informacije o sali…"
          value={form.opis}
          onChange={handleChange}
        />
      </div>

      <div className="field field-row">
        <label htmlFor="status" className="label-inline">Aktivna</label>
        <input
          id="status"
          name="status"
          type="checkbox"
          checked={!!form.status}
          onChange={handleChange}
        />
        {errors.status && <p className="error">{errors.status}</p>}
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn--ghost" onClick={onCancel}>Otkaži</button>
        <button type="submit" className="btn btn--primary">
          {initial ? "Sačuvaj izmene" : "Dodaj salu"}
        </button>
      </div>
    </form>
  );
}
