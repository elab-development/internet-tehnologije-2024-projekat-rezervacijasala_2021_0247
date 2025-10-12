import React, { useEffect, useState } from "react";

export default function SaleForm({ initial = null, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    naziv: "",
    tip: "",
    kapacitet: "",
    opis: "",
    status: true, // podrazumevano aktivna

    // Raspored (defaulti)
    floor: 0,
    layout_x: 0,
    layout_y: 0,
    layout_w: 1,
    layout_h: 1,
  });
  const [errors, setErrors] = useState({});

  // >>> BITNO: edit mod samo ako postoji ID
  const isEdit = Boolean(initial && initial.id);

  useEffect(() => {
    if (initial) {
      setForm({
        naziv: initial.naziv ?? "",
        tip: initial.tip ?? "",
        kapacitet: initial.kapacitet ?? "",
        opis: initial.opis ?? "",
        status: Boolean(initial.status),

        floor: Number(initial.floor ?? 0),
        layout_x: Number(initial.layout_x ?? 0),
        layout_y: Number(initial.layout_y ?? 0),
        layout_w: Number(initial.layout_w ?? 1),
        layout_h: Number(initial.layout_h ?? 1),
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

    // Validacija rasporeda
    const isInt = (v) => Number.isInteger(Number(v));
    const nz = (v) => v !== "" && v !== null && v !== undefined;

    if (!nz(form.floor) || !isInt(form.floor) || Number(form.floor) < 0) {
      e.floor = "Sprat mora biti ceo broj (min 0).";
    }
    if (!nz(form.layout_x) || !isInt(form.layout_x) || Number(form.layout_x) < 0) {
      e.layout_x = "X koordinata mora biti ceo broj (min 0).";
    }
    if (!nz(form.layout_y) || !isInt(form.layout_y) || Number(form.layout_y) < 0) {
      e.layout_y = "Y koordinata mora biti ceo broj (min 0).";
    }
    if (!nz(form.layout_w) || !isInt(form.layout_w) || Number(form.layout_w) < 1) {
      e.layout_w = "Širina mora biti ceo broj (min 1).";
    }
    if (!nz(form.layout_h) || !isInt(form.layout_h) || Number(form.layout_h) < 1) {
      e.layout_h = "Visina mora biti ceo broj (min 1).";
    }

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

      floor: Number(form.floor),
      layout_x: Number(form.layout_x),
      layout_y: Number(form.layout_y),
      layout_w: Number(form.layout_w),
      layout_h: Number(form.layout_h),
    };
    await onSubmit?.(payload);
  }

  return (
    <form className="sale-form" onSubmit={submit} noValidate>
      <div className="auth-head">
        <p className="eyebrow">{isEdit ? "Izmena sale" : "Nova sala"}</p>
        <h2>{isEdit ? `Ažuriraj: ${initial?.naziv ?? ""}` : "Dodaj salu"}</h2>
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

      {/* Raspored na mapi */}
      <fieldset className="fieldset">
        <legend>Raspored na mapi</legend>

        <div className="field">
          <label htmlFor="floor">Sprat</label>
          <input
            id="floor"
            name="floor"
            type="number"
            min="0"
            step="1"
            className={errors.floor ? "invalid" : ""}
            placeholder="npr. 0 (prizemlje)"
            value={form.floor}
            onChange={handleChange}
            required
          />
          {errors.floor && <p className="error">{errors.floor}</p>}
        </div>

        <div className="field field-row-3">
          <div className="field">
            <label htmlFor="layout_x">X (kolona)</label>
            <input
              id="layout_x"
              name="layout_x"
              type="number"
              min="0"
              step="1"
              className={errors.layout_x ? "invalid" : ""}
              placeholder="npr. 0"
              value={form.layout_x}
              onChange={handleChange}
              required
            />
            {errors.layout_x && <p className="error">{errors.layout_x}</p>}
          </div>

          <div className="field">
            <label htmlFor="layout_y">Y (red)</label>
            <input
              id="layout_y"
              name="layout_y"
              type="number"
              min="0"
              step="1"
              className={errors.layout_y ? "invalid" : ""}
              placeholder="npr. 0"
              value={form.layout_y}
              onChange={handleChange}
              required
            />
            {errors.layout_y && <p className="error">{errors.layout_y}</p>}
          </div>

          <div className="field">
            <label htmlFor="layout_w">Širina (ćelije)</label>
            <input
              id="layout_w"
              name="layout_w"
              type="number"
              min="1"
              step="1"
              className={errors.layout_w ? "invalid" : ""}
              placeholder="npr. 2"
              value={form.layout_w}
              onChange={handleChange}
              required
            />
            {errors.layout_w && <p className="error">{errors.layout_w}</p>}
          </div>

          <div className="field">
            <label htmlFor="layout_h">Visina (ćelije)</label>
            <input
              id="layout_h"
              name="layout_h"
              type="number"
              min="1"
              step="1"
              className={errors.layout_h ? "invalid" : ""}
              placeholder="npr. 2"
              value={form.layout_h}
              onChange={handleChange}
              required
            />
            {errors.layout_h && <p className="error">{errors.layout_h}</p>}
          </div>
        </div>
      </fieldset>

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
          {isEdit ? "Sačuvaj izmene" : "Dodaj salu"}
        </button>
      </div>
    </form>
  );
}
