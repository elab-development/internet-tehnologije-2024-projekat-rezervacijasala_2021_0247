import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SaleForm from "../components/SaleForm";
import "./sale.css";

export default function SalesAdminPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [editing, setEditing] = useState(null); // null=create, object=edit, false=closed

  const filtered = useMemo(() => {
    if (!q.trim()) return items;
    const s = q.toLowerCase();
    return items.filter((x) =>
      [
        String(x?.naziv ?? "").toLowerCase(),
        String(x?.tip ?? "").toLowerCase(),
        String(x?.kapacitet ?? "").toLowerCase(),
        String(x?.status ? "aktivna" : "neaktivna"),
      ].some((v) => v.includes(s))
    );
  }, [items, q]);

  async function load() {
    setLoading(true);
    setServerMsg("");
    try {
      const res = await api.get("/sale"); // GET /api/sale
      setItems(res.data?.data || res.data || []);
    } catch (err) {
      setServerMsg("Ne mogu da učitam sale. Proveri prijavu i ulogu (administrator/menadžer).");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(payload) {
    const res = await api.post("/sale", payload); // POST /api/sale
    const created = res.data?.data || res.data;
    setItems((prev) => [created, ...prev]);
    setServerMsg("Sala je uspešno dodata.");
  }

  async function handleUpdate(id, payload) {
    const res = await api.put(`/sale/${id}`, payload); // PUT /api/sale/:id
    const updated = res.data?.data || res.data;
    setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    setServerMsg("Izmene su sačuvane.");
  }

  async function handleDelete(id) {
    if (!window.confirm("Da li sigurno želiš da obrišeš ovu salu?")) return;
    await api.delete(`/sale/${id}`);
    setItems((prev) => prev.filter((it) => it.id !== id));
    setServerMsg("Sala je obrisana.");
  }

  return (
    <div className="lp">
      {/* dekorativna pozadina po želji */}
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <main className="sales" role="main">
        <div className="sales-head">
          <div>
            <p className="eyebrow">Administracija</p>
            <h1>Sale — CRUD</h1>
            <p className="muted">Dodaj, izmeni ili obriši salu (naziv, tip, kapacitet, opis, status).</p>
          </div>

          <div className="sales-actions">
            <div className="search">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Pretraži (naziv, tip, kapacitet, status)…"
                aria-label="Pretraga"
              />
            </div>
            <button className="btn btn--primary" onClick={() => setEditing({})}>
              + Nova sala
            </button>
          </div>
        </div>

        {serverMsg && <div className="alert alert--ok">{serverMsg}</div>}
        {loading && <div className="alert">Učitavanje...</div>}

        <div className="card">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Naziv</th>
                  <th>Tip</th>
                  <th className="right">Kapacitet</th>
                  <th>Status</th>
                  <th className="right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted center">Nema podataka.</td>
                  </tr>
                ) : (
                  filtered.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.naziv}</td>
                      <td>{it.tip}</td>
                      <td className="right">{it.kapacitet}</td>
                      <td>
                        <span className={`badge ${it.status ? "badge--ok" : "badge--muted"}`}>
                          {it.status ? "Aktivna" : "Neaktivna"}
                        </span>
                      </td>
                      <td className="right actions">
                        <button className="btn btn--ghost" onClick={() => setEditing(it)}>Izmeni</button>
                        <button className="btn btn--danger" onClick={() => handleDelete(it.id)}>Obriši</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal forma za create/update */}
      {editing !== false && editing !== null && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <SaleForm
              initial={editing && editing.id ? editing : null}
              onCancel={() => setEditing(false)}
              onSubmit={async (payload) => {
                try {
                  if (editing && editing.id) {
                    await handleUpdate(editing.id, payload);
                  } else {
                    await handleCreate(payload);
                  }
                  setEditing(false);
                } catch {
                  alert("Greška pri čuvanju. Proveri prava i backend validaciju.");
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
