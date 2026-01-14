import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/client";
import "./admin-preporuke.css";

/* utils */
function toISO(d) {
  if (!d) return "";
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ""; }
}
function hhmm(t) { return String(t || "").slice(0, 5); } // od "HH:mm:ss" napravi "HH:mm"

export default function AdminPreporuke() {
  // data
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // filters/sort
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("datum"); // datum | vreme_od | korisnik | sala | dogadjaj
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  // pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // inline edit
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    sala_id: "",
    datum: "",
    vreme_od: "",
    vreme_do: "",
    tip_dogadjaja: "",
  });

  // action states
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setMsg("");
    try {
      const res = await api.get("/preporuke");
      // backend može vratiti {data:[...]} ili direktno [...]
      const data = res?.data?.data || res?.data || [];
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setMsg("Ne mogu da učitam preporuke (proveri autentikaciju/permission).");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  function startEdit(row) {
    setEditId(row.id);
    setForm({
      sala_id: row.sala_id ?? "",
      datum: toISO(row.datum) || "",
      vreme_od: hhmm(row.vreme_od),
      vreme_do: hhmm(row.vreme_do),
      tip_dogadjaja: row.tip_dogadjaja || "",
    });
  }
  function cancelEdit() {
    setEditId(null);
    setForm({ sala_id:"", datum:"", vreme_od:"", vreme_do:"", tip_dogadjaja:"" });
  }

  async function saveEdit(id) {
    setSaving(true); setMsg("");
    try {
      const payload = {
        sala_id: String(form.sala_id).trim(),
        datum: form.datum,
        vreme_od: form.vreme_od,
        vreme_do: form.vreme_do,
        tip_dogadjaja: form.tip_dogadjaja,
      };
      await api.put(`/preporuke/${id}`, payload);

      // optimistički update
      setItems(prev => prev.map(x => x.id === id ? {
        ...x,
        sala_id: payload.sala_id,
        datum: payload.datum,
        vreme_od: payload.vreme_od,
        vreme_do: payload.vreme_do,
        tip_dogadjaja: payload.tip_dogadjaja,
      } : x));

      setMsg("Preporuka je uspešno ažurirana.");
      cancelEdit();
    } catch (e) {
      const er = e?.response?.data?.errors;
      if (er) {
        const flat = Object.values(er).flat().join(" ");
        setMsg(flat || "Greška pri ažuriranju.");
      } else {
        setMsg(e?.response?.data?.message || "Greška pri ažuriranju.");
      }
    } finally { setSaving(false); }
  }

  async function remove(id) {
    if (!window.confirm("Obrisati preporuku?")) return;
    setDeletingId(id); setMsg("");
    try {
      await api.delete(`/preporuke/${id}`);
      setItems(prev => prev.filter(x => x.id !== id));
      setMsg("Preporuka je obrisana.");
    } catch (e) {
      setMsg(e?.response?.data?.message || "Ne mogu da obrišem preporuku.");
    } finally { setDeletingId(null); }
  }

  // filter + sort (koristimo user_name i sala_naziv)
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = [...items];

    if (query) {
      list = list.filter(r => {
        const userName = r.user_name || String(r.user_id || "");
        const salaName = r.sala_naziv || String(r.sala_id || "");
        const hay = [
          userName, salaName, r.tip_dogadjaja, r.vreme_od, r.vreme_do, String(r.id)
        ].join(" ").toLowerCase();
        return hay.includes(query);
      });
    }
    if (dateFrom) list = list.filter(r => (toISO(r.datum) || "") >= dateFrom);
    if (dateTo)   list = list.filter(r => (toISO(r.datum) || "") <= dateTo);

    list.sort((a,b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const aUser = String(a.user_name || "").toLowerCase();
      const bUser = String(b.user_name || "").toLowerCase();
      const aSala = String(a.sala_naziv || "").toLowerCase();
      const bSala = String(b.sala_naziv || "").toLowerCase();

      switch (sortBy) {
        case "korisnik": return aUser.localeCompare(bUser, "sr") * dir;
        case "sala":     return aSala.localeCompare(bSala, "sr") * dir;
        case "dogadjaj": return String(a.tip_dogadjaja||"").localeCompare(String(b.tip_dogadjaja||""), "sr") * dir;
        case "vreme_od": return String(hhmm(a.vreme_od)).localeCompare(String(hhmm(b.vreme_od)), "sr") * dir;
        case "datum":
        default:
          return String(toISO(a.datum)||"").localeCompare(String(toISO(b.datum)||""), "sr") * dir;
      }
    });

    return list;
  }, [items, q, dateFrom, dateTo, sortBy, sortDir]);

  // pagination
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cur = Math.min(page, totalPages);
  const start = (cur - 1) * perPage;
  const end = Math.min(start + perPage, total);
  const pageItems = filtered.slice(start, end);

  function toggleSort(col) {
    if (sortBy === col) setSortDir(d => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir(col === "datum" ? "desc" : "asc"); }
  }

  return (
    <main className="admin-prep" role="main">
      <div className="admin-prep__head">
        <div>
          <p className="eyebrow">Administracija</p>
          <h1>Preporuke — pregled, uređivanje i brisanje</h1>
          <p className="muted">Ova strana je dostupna samo administratorima.</p>
        </div>
        <div className="admin-prep__actions">
          <button className="btn btn--ghost" onClick={load}>Osveži</button>
        </div>
      </div>

      {/* FILTERS */}
      <section className="admin-prep__filters" aria-label="Filteri">
        <div className="filters-grid">
          <div className="filter">
            <label className="filter-label">Pretraga</label>
            <input
              value={q}
              onChange={e=>{ setQ(e.target.value); setPage(1); }}
              placeholder="Korisnik, sala, događaj, ID…"
            />
          </div>

          <div className="filter">
            <label className="filter-label">Datum od</label>
            <input type="date" value={dateFrom} onChange={e=>{ setDateFrom(e.target.value); setPage(1); }} />
          </div>

          <div className="filter">
            <label className="filter-label">Datum do</label>
            <input type="date" value={dateTo} onChange={e=>{ setDateTo(e.target.value); setPage(1); }} />
          </div>

          <div className="filter">
            <label className="filter-label">Sortiraj</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="datum">Datum</option>
              <option value="vreme_od">Vreme od</option>
              <option value="korisnik">Korisnik</option>
              <option value="sala">Sala</option>
              <option value="dogadjaj">Događaj</option>
            </select>
          </div>

          <div className="filter">
            <label className="filter-label">Smer</label>
            <select value={sortDir} onChange={e=>setSortDir(e.target.value)}>
              <option value="asc">Rastuće</option>
              <option value="desc">Opadajuće</option>
            </select>
          </div>
        </div>
      </section>

      {msg && <div className="alert">{msg}</div>}
      {loading && <div className="alert">Učitavanje…</div>}

      {/* TABLE */}
      <div className="card">
        <div className="table-wrap">
          <table className="tbl admin-prep__table">
            <thead>
              <tr>
                <th>ID</th>
                <th className={`sortable ${sortBy==="korisnik"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("korisnik")}>Korisnik</th>
                <th className={`sortable ${sortBy==="sala"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("sala")}>Sala</th>
                <th className={`sortable ${sortBy==="dogadjaj"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("dogadjaj")}>Događaj</th>
                <th className={`sortable ${sortBy==="datum"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("datum")}>Datum</th>
                <th className={`sortable ${sortBy==="vreme_od"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("vreme_od")}>Vreme</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 ? (
                <tr><td colSpan={7} className="center muted">Nema preporuka za prikaz.</td></tr>
              ) : pageItems.map(r => {
                const isEditing = editId === r.id;
                const userLabel = r.user_name || `#${r.user_id}`;
                const salaLabel = r.sala_naziv || `sala_id: ${r.sala_id}`;

                return (
                  <tr key={r.id}>
                    <td className="muted">#{r.id}</td>
                    <td>{userLabel}</td>
                    <td>
                      {isEditing ? (
                        <input
                          className="w-120"
                          value={form.sala_id}
                          onChange={e=>setForm(f=>({...f, sala_id:e.target.value}))}
                          placeholder="sala_id"
                        />
                      ) : salaLabel}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          className="w-160"
                          value={form.tip_dogadjaja}
                          onChange={e=>setForm(f=>({...f, tip_dogadjaja:e.target.value}))}
                          placeholder="npr. sastanak"
                        />
                      ) : (r.tip_dogadjaja || "—")}
                    </td>
                    <td>
                      {isEditing ? (
                        <input
                          type="date"
                          value={form.datum}
                          onChange={e=>setForm(f=>({...f, datum:e.target.value}))}
                        />
                      ) : (toISO(r.datum) || "—")}
                    </td>
                    <td>
                      {isEditing ? (
                        <div className="field-row">
                          <input
                            type="time"
                            value={form.vreme_od}
                            onChange={e=>setForm(f=>({...f, vreme_od:e.target.value}))}
                          />
                          <span>–</span>
                          <input
                            type="time"
                            value={form.vreme_do}
                            onChange={e=>setForm(f=>({...f, vreme_do:e.target.value}))}
                          />
                        </div>
                      ) : (
                        <span>{hhmm(r.vreme_od)}–{hhmm(r.vreme_do)}</span>
                      )}
                    </td>
                    <td className="right">
                      {!isEditing ? (
                        <>
                          <button className="btn btn--ghost" onClick={()=>startEdit(r)}>Uredi</button>
                          <button
                            className="btn btn--danger"
                            disabled={deletingId===r.id}
                            onClick={()=>remove(r.id)}
                          >
                            {deletingId===r.id ? "Brišem…" : "Obriši"}
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn--primary"
                            disabled={saving}
                            onClick={()=>saveEdit(r.id)}
                          >
                            {saving ? "Čuvam…" : "Sačuvaj"}
                          </button>
                          <button className="btn btn--ghost" onClick={cancelEdit}>Otkaži</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <div className="page-size">
          <label>Prikaži:</label>
          <select value={perPage} onChange={e=>{setPerPage(+e.target.value); setPage(1);}}>
            {[5,10,20,50,100].map(n=><option key={n} value={n}>{n}/str</option>)}
          </select>
        </div>
        <div className="page-info"><span>Prikaz {total===0?0:start+1}–{end} od {total}</span></div>
        <div className="page-ctrls">
          <button className="btn btn--ghost" onClick={()=>setPage(1)} disabled={cur===1}>« Prva</button>
          <button className="btn btn--ghost" onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={cur===1}>‹ Prethodna</button>
          <button className="btn btn--ghost" onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={cur===totalPages}>Sledeća ›</button>
          <button className="btn btn--ghost" onClick={()=>setPage(totalPages)} disabled={cur===totalPages}>Poslednja »</button>
        </div>
      </div>
    </main>
  );
}
