import React, { useEffect, useMemo, useState } from "react";
import api from "../api/client";
import SaleForm from "../components/SaleForm";
import "./sale.css";

const SORTABLE = {
  id: "id",
  naziv: "naziv",
  tip: "tip",
  kapacitet: "kapacitet",
  status: "status",
};

export default function SalesAdminPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");
  const [editing, setEditing] = useState(null); // null=create, object=edit, false=closed

  // Filters & search
  const [queryRaw, setQueryRaw] = useState("");
  const [query, setQuery] = useState(""); // debounced
  const [status, setStatus] = useState("all"); // all | active | inactive
  const [tip, setTip] = useState("all"); // dinamički
  const [capMin, setCapMin] = useState("");
  const [capMax, setCapMax] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState(SORTABLE.id);
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setQuery(queryRaw.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [queryRaw]);

  // Load data
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

  // Create/Update/Delete
  async function handleCreate(payload) {
    const res = await api.post("/sale", payload);
    const created = res.data?.data || res.data;
    setItems((prev) => [created, ...prev]);
    setServerMsg("Sala je uspešno dodata.");
  }
  async function handleUpdate(id, payload) {
    const res = await api.put(`/sale/${id}`, payload);
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

  // Dinamičke opcije za "Tip"
  const tipOptions = useMemo(() => {
    const set = new Set();
    (items || []).forEach((x) => {
      if (x?.tip) set.add(String(x.tip));
    });
    return ["all", ...Array.from(set)];
  }, [items]);

  // Filtriranje + pretraga + sortiranje
  const filteredSorted = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];

    // Pretraga (query po više polja)
    if (query) {
      list = list.filter((x) => {
        const hay = [
          x?.naziv ?? "",
          x?.tip ?? "",
          x?.opis ?? "",
          String(x?.kapacitet ?? ""),
          x?.status ? "aktivna" : "neaktivna",
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(query);
      });
    }

    // Status filter
    if (status !== "all") {
      const flag = status === "active";
      list = list.filter((x) => Boolean(x?.status) === flag);
    }

    // Tip filter
    if (tip !== "all") {
      list = list.filter((x) => String(x?.tip ?? "") === tip);
    }

    // Kapacitet opseg
    const min = capMin !== "" ? Number(capMin) : null;
    const max = capMax !== "" ? Number(capMax) : null;
    if (min !== null) list = list.filter((x) => Number(x?.kapacitet ?? 0) >= min);
    if (max !== null) list = list.filter((x) => Number(x?.kapacitet ?? 0) <= max);

    // Sort
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const A = a?.[sortBy];
      const B = b?.[sortBy];

      // status kao boolean → uporedi po brojčanoj vrednosti
      if (sortBy === "status") {
        return (Number(Boolean(A)) - Number(Boolean(B))) * dir;
      }
      // stringovi
      if (typeof A === "string" || typeof B === "string") {
        return String(A ?? "").localeCompare(String(B ?? ""), "sr", { sensitivity: "base" }) * dir;
      }
      // brojevi / undefined
      return ((Number(A) || 0) - (Number(B) || 0)) * dir;
    });

    return list;
  }, [items, query, status, tip, capMin, capMax, sortBy, sortDir]);

  function toggleSort(col) {
    if (sortBy === col) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setSortDir(col === "id" ? "desc" : "asc");
    }
  }

  function resetFilters() {
    setQueryRaw("");
    setStatus("all");
    setTip("all");
    setCapMin("");
    setCapMax("");
    setSortBy(SORTABLE.id);
    setSortDir("desc");
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
            <p className="muted">
              Dodaj, izmeni ili obriši salu (naziv, tip, kapacitet, opis, status).
            </p>
          </div>

          <div className="sales-actions">
            <button className="btn btn--primary" onClick={() => setEditing({})}>
              + Nova sala
            </button>
          </div>
        </div>

        {/* FILTERI */}
        <section className="filters" aria-label="Filteri i pretraga">
          <div className="filters-grid">
            <div className="filter">
              <label className="filter-label">Pretraga</label>
              <input
                value={queryRaw}
                onChange={(e) => setQueryRaw(e.target.value)}
                placeholder="Naziv, tip, opis, status, kapacitet…"
                aria-label="Pretraga"
              />
            </div>

            <div className="filter">
              <label className="filter-label">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="all">Sve</option>
                <option value="active">Aktivna</option>
                <option value="inactive">Neaktivna</option>
              </select>
            </div>

            <div className="filter">
              <label className="filter-label">Tip</label>
              <select value={tip} onChange={(e) => setTip(e.target.value)}>
                {tipOptions.map((t) => (
                  <option key={t} value={t}>
                    {t === "all" ? "Svi tipovi" : t}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter">
              <label className="filter-label">Kapacitet (od)</label>
              <input
                type="number"
                min="1"
                placeholder="npr. 20"
                value={capMin}
                onChange={(e) => setCapMin(e.target.value)}
              />
            </div>

            <div className="filter">
              <label className="filter-label">Kapacitet (do)</label>
              <input
                type="number"
                min="1"
                placeholder="npr. 100"
                value={capMax}
                onChange={(e) => setCapMax(e.target.value)}
              />
            </div>

            <div className="filter filter-actions">
              <button type="button" className="btn btn--ghost" onClick={resetFilters}>
                Reset filtera
              </button>
              <span className="muted results-count">
                Rezultata: <strong>{filteredSorted.length}</strong>
              </span>
            </div>
          </div>
        </section>

        {serverMsg && <div className="alert alert--ok">{serverMsg}</div>}
        {loading && <div className="alert">Učitavanje...</div>}

        <div className="card">
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th
                    className={`sortable ${sortBy === "id" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("id")}
                    aria-sort={sortBy === "id" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("id")}
                  >
                    ID
                  </th>
                  <th
                    className={`sortable ${sortBy === "naziv" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("naziv")}
                    aria-sort={sortBy === "naziv" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("naziv")}
                  >
                    Naziv
                  </th>
                  <th
                    className={`sortable ${sortBy === "tip" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("tip")}
                    aria-sort={sortBy === "tip" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("tip")}
                  >
                    Tip
                  </th>
                  <th
                    className={`right sortable ${sortBy === "kapacitet" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("kapacitet")}
                    aria-sort={sortBy === "kapacitet" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("kapacitet")}
                  >
                    Kapacitet
                  </th>
                  <th
                    className={`sortable ${sortBy === "status" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("status")}
                    aria-sort={sortBy === "status" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("status")}
                  >
                    Status
                  </th>
                  <th className="right">Akcije</th>
                </tr>
              </thead>
              <tbody>
                {filteredSorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="muted center">Nema podataka.</td>
                  </tr>
                ) : (
                  filteredSorted.map((it) => (
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
