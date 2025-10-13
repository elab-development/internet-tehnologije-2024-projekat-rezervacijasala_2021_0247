import React, { useMemo, useState, useEffect } from "react";
import api from "../api/client";
import SaleForm from "../components/SaleForm";
import useSalesData from "../hooks/useSalesData";
import "./sale.css";

const SORTABLE = {
  id: "id",
  naziv: "naziv",
  tip: "tip",
  kapacitet: "kapacitet",
  status: "status",
  // NOVO: sprat je koristan za sortiranje/pregled
  floor: "floor",
};

export default function SalesAdminPage() {
  const { items, setItems, loading, serverMsg, setServerMsg, reload } = useSalesData();
  const [editing, setEditing] = useState(null); // null=create, object=edit, false=closed

  // -------- NOVO: podrazumevane vrednosti za novu salu --------
  const blank = {
    naziv: "",
    tip: "",
    kapacitet: 1,
    opis: "",
    status: true,
    cena: "",
    // layout polja
    floor: 0,
    layout_x: 0,
    layout_y: 0,
    layout_w: 1,
    layout_h: 1,
  };

  // Filters & search
  const [queryRaw, setQueryRaw] = useState("");
  const query = queryRaw.trim().toLowerCase();

  const [status, setStatus] = useState("all"); // all | active | inactive
  const [tip, setTip] = useState("all");       // dinamički
  const [capMin, setCapMin] = useState("");
  const [capMax, setCapMax] = useState("");

  // Sorting
  const [sortBy, setSortBy] = useState(SORTABLE.id);
  const [sortDir, setSortDir] = useState("desc"); // asc | desc

  // Pagination (lokalna)
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10); // 5,10,20,50...

  // ------ Helpers: blaga sanitizacija (bez menjanja forme) ------
  function normalizePayload(payload) {
    const n = { ...payload };

    // osiguraj numeriku i minimale
    n.kapacitet = Math.max(1, Number(n.kapacitet ?? 1));
    n.status = Boolean(n.status);

    n.floor    = Math.max(0, Number(n.floor ?? 0));
    n.layout_x = Math.max(0, Number(n.layout_x ?? 0));
    n.layout_y = Math.max(0, Number(n.layout_y ?? 0));
    n.layout_w = Math.max(1, Number(n.layout_w ?? 1));
    n.layout_h = Math.max(1, Number(n.layout_h ?? 1));

    if (n.cena !== undefined && n.cena !== null && n.cena !== "") {
      n.cena = Number(n.cena);
    } else {
      delete n.cena;
    }
    return n;
  }

  // Create/Update/Delete
  async function handleCreate(payload) {
    const body = normalizePayload({ ...blank, ...payload }); // popuni propuštena polja defaultima
    const res = await api.post("/sale", body);
    const created = res.data?.data || res.data;
    setItems((prev) => [created, ...prev]);
    setServerMsg("Sala je uspešno dodata.");
  }

  async function handleUpdate(id, payload) {
    const body = normalizePayload(payload);
    const res = await api.put(`/sale/${id}`, body);
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
    (items || []).forEach((x) => { if (x?.tip) set.add(String(x.tip)); });
    return ["all", ...Array.from(set)];
  }, [items]);

  // Filtriranje + pretraga + sortiranje
  const filteredSorted = useMemo(() => {
    let list = Array.isArray(items) ? [...items] : [];

    if (query) {
      list = list.filter((x) => {
        const hay = [
          x?.naziv ?? "",
          x?.tip ?? "",
          x?.opis ?? "",
          String(x?.kapacitet ?? ""),
          x?.status ? "aktivna" : "neaktivna",
          // NOVO: pretraga po spratu
          `sprat ${x?.floor ?? ""}`,
        ].join(" ").toLowerCase();
        return hay.includes(query);
      });
    }

    if (status !== "all") {
      const flag = status === "active";
      list = list.filter((x) => Boolean(x?.status) === flag);
    }

    if (tip !== "all") {
      list = list.filter((x) => String(x?.tip ?? "") === tip);
    }

    const min = capMin !== "" ? Number(capMin) : null;
    const max = capMax !== "" ? Number(capMax) : null;
    if (min !== null) list = list.filter((x) => Number(x?.kapacitet ?? 0) >= min);
    if (max !== null) list = list.filter((x) => Number(x?.kapacitet ?? 0) <= max);

    // Sort (dodali smo mogućnost po floor-u ako je izabran)
    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const A = a?.[sortBy];
      const B = b?.[sortBy];

      if (sortBy === "status") {
        return (Number(Boolean(A)) - Number(Boolean(B))) * dir;
      }
      if (typeof A === "string" || typeof B === "string") {
        return String(A ?? "").localeCompare(String(B ?? ""), "sr", { sensitivity: "base" }) * dir;
      }
      return ((Number(A) || 0) - (Number(B) || 0)) * dir;
    });

    return list;
  }, [items, query, status, tip, capMin, capMax, sortBy, sortDir]);

  // Resetuj na prvu stranu kad se promene filteri/sort/lista
  useEffect(() => {
    setPage(1);
  }, [queryRaw, status, tip, capMin, capMax, sortBy, sortDir, items]);

  // Paginacija
  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const currentPage = Math.min(page, totalPages);
  const startIdx = (currentPage - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, total);
  const pageItems = filteredSorted.slice(startIdx, endIdx);

  function goto(p) {
    const clamped = Math.max(1, Math.min(p, totalPages));
    setPage(clamped);
  }

  function pageWindow(totalPages, current, max = 5) {
    let start = Math.max(1, current - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    const arr = [];
    for (let i = start; i <= end; i++) arr.push(i);
    return arr;
  }

  function toggleSort(col) {
    if (sortBy === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(col); setSortDir(col === "id" ? "desc" : "asc"); }
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
            <p className="muted">Dodaj, izmeni ili obriši salu (naziv, tip, kapacitet, opis, status, <strong>sprat i koordinate</strong>).</p>
          </div>

          <div className="sales-actions">
            <button className="btn btn--ghost" onClick={reload}> Osveži</button>
            <button className="btn btn--ghost" onClick={() => setEditing({ ...blank })}>
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
                placeholder="Naziv, tip, opis, status, kapacitet, sprat…"
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
                Rezultata: <strong>{total}</strong>
              </span>
            </div>
          </div>
        </section>

        {serverMsg && <div className="alert alert--ok">{serverMsg}</div>}
        {loading && <div className="alert">Učitavanje...</div>}

        {/* Kontrole paginacije (top) */}
        <div className="pagination">
          <div className="page-size">
            <label>Prikaži:</label>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[5,10,20,50,100].map((n) => <option key={n} value={n}>{n}/str</option>)}
            </select>
          </div>
          <div className="page-info">
            <span>Prikaz {total === 0 ? 0 : startIdx + 1}–{endIdx} od {total}</span>
          </div>
          <div className="page-ctrls">
            <button className="btn btn--ghost" onClick={() => goto(1)} disabled={currentPage === 1}>« Prva</button>
            <button className="btn btn--ghost" onClick={() => goto(currentPage - 1)} disabled={currentPage === 1}>‹ Prethodna</button>
            {pageWindow(totalPages, currentPage, 5).map((p) => (
              <button
                key={p}
                className={`btn ${p === currentPage ? "btn--ghost" : "btn--ghost"} page-btn`}
                onClick={() => goto(p)}
              >
                {p}
              </button>
            ))}
            <button className="btn btn--ghost" onClick={() => goto(currentPage + 1)} disabled={currentPage === totalPages}>Sledeća ›</button>
            <button className="btn btn--ghost" onClick={() => goto(totalPages)} disabled={currentPage === totalPages}>Poslednja »</button>
          </div>
        </div>

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
                  {/* NOVO: prikaz sprata, minimalna izmena UI-a */}
                  <th
                    className={`sortable ${sortBy === "floor" ? `sorted ${sortDir}` : ""}`}
                    onClick={() => toggleSort("floor")}
                    aria-sort={sortBy === "floor" ? sortDir : "none"}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && toggleSort("floor")}
                  >
                    Sprat
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
                {pageItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="muted center">Nema podataka.</td>
                  </tr>
                ) : (
                  pageItems.map((it) => (
                    <tr key={it.id}>
                      <td>{it.id}</td>
                      <td>{it.naziv}</td>
                      <td>{it.tip}</td>
                      <td className="right">{it.kapacitet}</td>
                      <td>{it.floor ?? 0}</td>
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

        {/* Kontrole paginacije (bottom) */}
        <div className="pagination">
          <div className="page-size">
            <label>Prikaži:</label>
            <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}>
              {[5,10,20,50,100].map((n) => <option key={n} value={n}>{n}/str</option>)}
            </select>
          </div>
          <div className="page-info">
            <span>Prikaz {total === 0 ? 0 : startIdx + 1}–{endIdx} od {total}</span>
          </div>
          <div className="page-ctrls">
            <button className="btn btn--ghost" onClick={() => goto(1)} disabled={currentPage === 1}>« Prva</button>
            <button className="btn btn--ghost" onClick={() => goto(currentPage - 1)} disabled={currentPage === 1}>‹ Prethodna</button>
            {pageWindow(totalPages, currentPage, 5).map((p) => (
              <button
                key={p}
                className={`btn ${p === currentPage ? "btn--primary" : "btn--ghost"} page-btn`}
                onClick={() => goto(p)}
              >
                {p}
              </button>
            ))}
            <button className="btn btn--ghost" onClick={() => goto(currentPage + 1)} disabled={currentPage === totalPages}>Sledeća ›</button>
            <button className="btn btn--ghost" onClick={() => goto(totalPages)} disabled={currentPage === totalPages}>Poslednja »</button>
          </div>
        </div>
      </main>

      {/* Modal forma za create/update */}
      {editing !== false && editing !== null && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <SaleForm
              // NOVO: za "novu" salu šaljemo blank sa floor/layout_* da forma ima polja i default
              initial={editing && editing.id ? editing : blank}
              onCancel={() => setEditing(false)}
              onSubmit={async (payload) => {
                try {
                  if (editing && editing.id) {
                    await handleUpdate(editing.id, payload);
                  } else {
                    await handleCreate(payload);
                  }
                  setEditing(false);
                } catch (e) {
                  console.error(e);
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
