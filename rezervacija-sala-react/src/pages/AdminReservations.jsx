import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/client";
import "./admin-reservations.css";

/* helperi */
const fmtTime = (t) => (t || "").slice(0,5);
const toQuery = (obj) =>
  Object.entries(obj)
    .filter(([,v]) => v !== undefined && v !== null && v !== "" && v !== "all")
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

const STATUS_OPTS = [
  { value: "pending",  label: "Na čekanju" },
  { value: "approved", label: "Odobrena" },
  { value: "rejected", label: "Odbijena" },
  { value: "cancelled", label: "Otkazana" },
];

export default function AdminReservations() {
  /* data state */
  const [rows, setRows] = useState([]);
  const [pages, setPages] = useState({ page: 1, per_page: 10, total: 0, last_page: 1 });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  /* lists for filters */
  const [sale, setSale] = useState([]);

  /* filters */
  const [q, setQ] = useState("");
  const [fSala, setFSala] = useState("all");
  const [fStatus, setFStatus] = useState("all");
  const [fDate, setFDate] = useState("");

  /* selection for bulk actions */
  const [selected, setSelected] = useState(new Set());

  /* edit modal */
  const [editing, setEditing] = useState(null); // rezervacija ili null

  const loadSale = useCallback(async ()=>{
    try {
      const sRes = await api.get("/sale");
      setSale(sRes.data?.data || sRes.data || []);
    } catch {}
  },[]);
  useEffect(()=>{ loadSale(); }, [loadSale]);

const load = useCallback(async (page = pages.page, per_page = pages.per_page) => {
  setLoading(true); setMsg("");

  const query = {
    page, per_page,
    tip_dogadjaja: q || undefined,
    sala_id: fSala !== "all" ? fSala : undefined,
    status: fStatus !== "all" ? fStatus : undefined,
    datum: fDate || undefined,
  };
  const url = "/rezervacije/paginacija?" + toQuery(query);

  try {
    const res = await api.get(url);
    const data = res.data;                 // <- ceo paginator objekat
    const rowsArr = Array.isArray(data.data) ? data.data : []; // <- uvek niz

    setRows(rowsArr);
    setPages({
      page: Number(data.current_page ?? page),
      per_page: Number(data.per_page ?? per_page), // backend vraća string "10"
      total: Number(data.total ?? rowsArr.length),
      last_page: Number(data.last_page ?? 1),
    });
  } catch (e) {
    setMsg("Neuspešno učitavanje rezervacija.");
    setRows([]);
  } finally {
    setLoading(false);
    setSelected(new Set());
  }
}, [q, fSala, fStatus, fDate, pages.page, pages.per_page]);


  useEffect(()=>{ load(1, pages.per_page); }, [q, fSala, fStatus, fDate]); // refetch na promenu filtera

  const refreshSamePage = () => load(pages.page, pages.per_page);

  /* actions */
  const changeStatus = async (row, status) => {
    const prev = rows;
    setRows(r => r.map(x => x.id === row.id ? { ...x, status } : x));
    try {
      await api.put(`/rezervacije/${row.id}`, { ...row, status });
    } catch {
      setRows(prev); // rollback
    }
  };

  const removeRow = async (row) => {
    if (!window.confirm("Obrisati rezervaciju #" + row.id + "?")) return;
    const prev = rows;
    setRows(r => r.filter(x => x.id !== row.id));
    try {
      await api.delete(`/rezervacije/${row.id}`);
      refreshSamePage();
    } catch {
      setRows(prev);
      alert("Brisanje nije uspelo.");
    }
  };

  const bulkUpdate = async (status) => {
    if (selected.size === 0) return;
    if (!window.confirm(`Promeni status za ${selected.size} rezervacija?`)) return;
    // optimistički
    const ids = Array.from(selected);
    const prev = rows;
    setRows(r => r.map(x => ids.includes(x.id) ? { ...x, status } : x));
    try {
      await Promise.all(ids.map(id => {
        const row = rows.find(x => x.id === id);
        return api.put(`/rezervacije/${id}`, { ...row, status });
      }));
      setSelected(new Set());
    } catch {
      setRows(prev);
      alert("Bulk izmena nije uspela.");
    }
  };

    const exportCsv = async () => {
    
    const query = {
        tip_dogadjaja: q || undefined,
        sala_id: fSala !== "all" ? fSala : undefined,
        status: fStatus !== "all" ? fStatus : undefined,
        datum: fDate || undefined,
    };
    const url = "/rezervacije/export/csv?" + toQuery(query);

    try {
        const res = await api.get(url, { responseType: "blob" });

        // napravi Blob i smisleno ime fajla iz header-a (ako ga backend šalje)
        const blob = new Blob([res.data], { type: "text/csv;charset=utf-8;" });
        let filename = "rezervacije.csv";
        const cd = res.headers["content-disposition"];
        if (cd) {
        const m = cd.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
        if (m && m[1]) filename = decodeURIComponent(m[1]);
        }

        // triggeruj download
        const link = document.createElement("a");
        const objUrl = window.URL.createObjectURL(blob);
        link.href = objUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(objUrl);
    } catch (e) {
        console.error(e);
        alert("Izvoz nije uspeo.");
    }
    };


  const toggleOne = (id) => {
    setSelected(s => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  };

  const toggleAll = (checked) => {
    if (!checked) { setSelected(new Set()); return; }
    setSelected(new Set(rows.map(r => r.id)));
  };

  const pageTo = (p) => {
    const clamp = Math.max(1, Math.min(pages.last_page, p));
    load(clamp, pages.per_page);
  };

  const perPageChange = (n) => {
    load(1, Number(n));
  };

  /* UI helpers */
  const salaName = useCallback((id) => {
    const s = sale.find(x => String(x.id) === String(id));
    return s?.naziv || `#${id}`;
  }, [sale]);

  return (
    <main className="admin-res">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Administracija</p>
          <h1>Rezervacije — pregled i upravljanje</h1>
          <p className="muted">Pretraga, filteri, uređivanje, odobravanje, brisanje i izvoz u CSV.</p>
        </div>
        <div className="head-actions">
          <button className="btn" onClick={exportCsv}>Izvezi CSV</button>
          <button className="btn btn--ghost" onClick={refreshSamePage}>Osveži</button>
        </div>
      </div>

      {/* FILTERI */}
      <section className="filters">
        <div className="filters-grid">
          <div className="filter">
            <label>Pretraga po tipu događaja</label>
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="npr. konferencija" />
          </div>
          <div className="filter">
            <label>Sala</label>
            <select value={fSala} onChange={(e)=>setFSala(e.target.value)}>
              <option value="all">Sve sale</option>
              {sale.map(s => <option key={s.id} value={s.id}>{s.naziv}</option>)}
            </select>
          </div>
          <div className="filter">
            <label>Status</label>
            <select value={fStatus} onChange={(e)=>setFStatus(e.target.value)}>
              <option value="all">Svi statusi</option>
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div className="filter">
            <label>Datum</label>
            <input type="date" value={fDate} onChange={(e)=>setFDate(e.target.value)} />
          </div>
          <div className="filter filter-actions">
            <div className="bulk">
              <span>Bulk status:</span>
              <select onChange={(e)=> e.target.value && bulkUpdate(e.target.value)} defaultValue="">
                <option value="" disabled>— izaberi —</option>
                {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {msg && <div className="alert">{msg}</div>}
      {loading && <div className="alert">Učitavanje…</div>}

      {/* TABELA */}
      <div className="card table-wrap">
        <table className="tbl">
          <thead>
            <tr>
              <th className="center" style={{width:36}}>
                <input
                  type="checkbox"
                  checked={selected.size === rows.length && rows.length>0}
                  onChange={(e)=>toggleAll(e.target.checked)}
                />
              </th>
              <th>ID</th>
              <th>Sala</th>
              <th>Datum</th>
              <th>Vreme</th>
              <th>Tip događaja</th>
              <th>Status</th>
              <th className="right">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan="8" className="center muted">Nema rezultata.</td>
              </tr>
            )}
            {rows.map(row => (
              <tr key={row.id}>
                <td className="center">
                  <input
                    type="checkbox"
                    checked={selected.has(row.id)}
                    onChange={()=>toggleOne(row.id)}
                  />
                </td>
                <td>{row.id}</td>
                <td title={`Sala ID: ${row.sala_id}`}>{salaName(row.sala_id)}</td>
                <td>{row.datum}</td>
                <td>{fmtTime(row.vreme_od)}–{fmtTime(row.vreme_do)}</td>
                <td>{row.tip_dogadjaja}</td>
                <td>
                  <span className={`badge ${row.status}`}>
                    {STATUS_OPTS.find(o=>o.value===row.status)?.label || row.status}
                  </span>
                  <select
                    className="inline-status"
                    value={row.status}
                    onChange={(e)=>changeStatus(row, e.target.value)}
                  >
                    {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
                <td className="right actions">
                  <button className="btn btn--ghost" onClick={()=>setEditing(row)}>Uredi</button>
                  <button className="btn btn--danger" onClick={()=>removeRow(row)}>Obriši</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIJA */}
      <div className="pagination">
        <div className="page-size">
          <span>Po strani:</span>
          <select value={pages.per_page} onChange={(e)=>perPageChange(e.target.value)}>
            {[10,20,30,50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div className="page-ctrls">
          <button className="btn" onClick={()=>pageTo(1)} disabled={pages.page<=1}>« Prva</button>
          <button className="btn" onClick={()=>pageTo(pages.page-1)} disabled={pages.page<=1}>‹ Nazad</button>
          <span className="page-info">Strana {pages.page} / {pages.last_page}</span>
          <button className="btn" onClick={()=>pageTo(pages.page+1)} disabled={pages.page>=pages.last_page}>Napred ›</button>
          <button className="btn" onClick={()=>pageTo(pages.last_page)} disabled={pages.page>=pages.last_page}>Poslednja »</button>
        </div>
      </div>

      {/* MODAL: Edit rezervacije */}
      {editing && (
        <EditModal
          initial={editing}
          sale={sale}
          onClose={()=>setEditing(null)}
          onSave={async (data)=>{
            try {
              await api.put(`/rezervacije/${editing.id}`, data);
              setEditing(null);
              refreshSamePage();
            } catch {
              alert("Čuvanje nije uspelo.");
            }
          }}
        />
      )}
    </main>
  );
}

/* ---------- Edit modal ---------- */
function EditModal({ initial, sale, onClose, onSave }) {
  const [form, setForm] = useState({
    sala_id: initial.sala_id,
    datum: initial.datum,
    vreme_od: initial.vreme_od?.slice(0,5) || "",
    vreme_do: initial.vreme_do?.slice(0,5) || "",
    tip_dogadjaja: initial.tip_dogadjaja || "",
    status: initial.status || "pending",
  });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({
        ...form,
        vreme_od: form.vreme_od,
        vreme_do: form.vreme_do,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h3>Uredi rezervaciju #{initial.id}</h3>
        <form onSubmit={submit} className="edit-form">
          <div className="form-row">
            <label>Sala</label>
            <select
              value={form.sala_id}
              onChange={(e)=>setForm(f=>({...f, sala_id: e.target.value}))}
              required
            >
              {sale.map(s => <option key={s.id} value={s.id}>{s.naziv}</option>)}
            </select>
          </div>
          <div className="form-row">
            <label>Datum</label>
            <input type="date" value={form.datum} onChange={(e)=>setForm(f=>({...f, datum: e.target.value}))} required />
          </div>
          <div className="form-row two">
            <div>
              <label>Vreme od</label>
              <input type="time" value={form.vreme_od} onChange={(e)=>setForm(f=>({...f, vreme_od: e.target.value}))} required />
            </div>
            <div>
              <label>Vreme do</label>
              <input type="time" value={form.vreme_do} onChange={(e)=>setForm(f=>({...f, vreme_do: e.target.value}))} required />
            </div>
          </div>
          <div className="form-row">
            <label>Tip događaja</label>
            <input value={form.tip_dogadjaja} onChange={(e)=>setForm(f=>({...f, tip_dogadjaja: e.target.value}))} required />
          </div>
          <div className="form-row">
            <label>Status</label>
            <select value={form.status} onChange={(e)=>setForm(f=>({...f, status: e.target.value}))}>
              {STATUS_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Otkaži</button>
            <button type="submit" className="btn" disabled={saving}>{saving ? "Čuvam…" : "Sačuvaj"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
