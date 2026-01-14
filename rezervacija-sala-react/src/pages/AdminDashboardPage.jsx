import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/client";
import "./admin-dashboard.css";

/* ----------------------------- Recharts ----------------------------- */
import {
  ResponsiveContainer,
  LineChart as RLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart as RBarChart, Bar,
  PieChart, Pie, Cell
} from "recharts";

/* ----------------------------- helpers ----------------------------- */
function fmt(n) { return new Intl.NumberFormat("sr-RS").format(n ?? 0); }

const toSeries = (labels = [], data = []) =>
  labels.map((l, i) => ({ name: l, value: Number(data[i] || 0) }));

const COLORS = ["#111827", "#4b5563", "#6b7280", "#9ca3af", "#d1d5db", "#e5e7eb"];

// LINE
function LineChart({ labels = [], data = [], height = 220 }) {
  const series = toSeries(labels, data);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RLineChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={false} />
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}

// BAR
function BarChart({ labels = [], data = [], height = 220 }) {
  const series = toSeries(labels, data);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <RBarChart data={series} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" hide />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#111827" />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}

// DONUT
function DonutChart({ labels = [], data = [], height = 220 }) {
  const series = toSeries(labels, data);
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={series}
            dataKey="value"
            nameKey="name"
            innerRadius="55%"
            outerRadius="80%"
            paddingAngle={1}
          >
            {series.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ----------------------------- Users Modal ----------------------------- */
function UserModal({ open, initial, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "korisnik" });
  const [err, setErr] = useState(null);
  useEffect(() => {
    if (!open) return;
    if (initial) setForm({ name: initial.name || "", email: initial.email || "", password: "", role: initial.role || "korisnik" });
    else setForm({ name: "", email: "", password: "", role: "korisnik" });
    setErr(null);
  }, [open, initial]);

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      await onSave(form);
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || "Greška pri čuvanju.");
    }
  }

  if (!open) return null;
  return (
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-card">
        <form onSubmit={submit} className="user-form" noValidate>
          <h3>{initial ? "Izmeni korisnika" : "Novi korisnik"}</h3>
          {err && <div className="alert">{String(err)}</div>}
          <div className="field">
            <label>Ime i prezime</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
          </div>
          <div className="field">
            <label>Lozinka {initial && <span className="muted">(ostavi prazno ako ne menjaš)</span>}</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="field">
            <label>Uloga</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="korisnik">Korisnik</option>
              <option value="menadzer">Menadžer</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Otkaži</button>
            <button type="submit" className="btn btn--ghost">{initial ? "Sačuvaj" : "Kreiraj"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------- Main Page ----------------------------- */
export default function AdminDashboardPage() {
  // KPIs & charts
  const [kpi, setKpi] = useState(null);
  const [daily, setDaily] = useState({ labels: [], data: [] });
  const [topRooms, setTopRooms] = useState({ labels: [], data: [] });
  const [byType, setByType] = useState({ labels: [], data: [] });
  const [hourly, setHourly] = useState({ labels: [], data: [] });
  const [util, setUtil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("dashboard"); // dashboard | users

  // Users
  const [users, setUsers] = useState([]);
  const [uMeta, setUMeta] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  /* -------------- data loaders -------------- */
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [k, d, t, bt, h, u] = await Promise.all([
        api.get("/admin/kpis"),
        api.get("/admin/reservations/daily?days=30"),
        api.get("/admin/rooms/top?limit=10"),
        api.get("/admin/rooms/by-type"),
        api.get("/admin/hourly?days=14"),
        api.get("/admin/utilization")
      ]);
      setKpi(k.data);
      setDaily(d.data);
      setTopRooms(t.data);
      setByType(bt.data);
      setHourly(h.data);
      setUtil(u.data);
    } finally { setLoading(false); }
  }, []);

  const loadUsers = useCallback(async (page = 1, query = q) => {
    const res = await api.get(`/users`, { params: { q: query, page, per_page: 10 } });
    // Laravel paginate: { data:[], current_page, last_page, per_page, total... }
       const payload = res.data;
    const list = payload.data ?? payload; // fallback
    setUsers(list);
    setUMeta({
      current_page: payload.current_page ?? 1,
      last_page: payload.last_page ?? 1,
      per_page: payload.per_page ?? 10,
      total: payload.total ?? list.length
    });
  }, [q]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { if (tab === "users") loadUsers(1, q); }, [tab, loadUsers]);

  /* -------------- users actions -------------- */
  async function createUser(body) {
    const res = await api.post("/users", body);
    await loadUsers(uMeta.current_page, q);
    return res.data;
  }
  async function updateUser(id, body) {
    const payload = { ...body };
    if (!payload.password) delete payload.password;
    const res = await api.put(`/users/${id}`, payload);
    await loadUsers(uMeta.current_page, q);
    return res.data;
  }
  async function deleteUser(id) {
    if (!window.confirm("Obrisati korisnika?")) return;
    await api.delete(`/users/${id}`);
    const newPage = (users.length === 1 && uMeta.current_page > 1) ? uMeta.current_page - 1 : uMeta.current_page;
    await loadUsers(newPage, q);
  }

  /* -------------- render -------------- */
  return (
    <main className="admin" role="main">
      <div className="admin-head">
        <div>
          <p className="eyebrow">Administracija</p>
          <h1>Dashboard & Korisnici</h1>
          <p className="muted">Pregled ključnih metrika i upravljanje nalozima.</p>
        </div>
        <div className="tabs">
          <button className={`tab ${tab === "dashboard" ? "active" : ""}`} onClick={() => setTab("dashboard")}>Dashboard</button>
          <button className={`tab ${tab === "users" ? "active" : ""}`} onClick={() => setTab("users")}>Korisnici</button>
        </div>
      </div>

      {tab === "dashboard" && (
        <>
          {/* KPI tiles */}
          <section className="kpis">
            <div className="kpi">
              <div className="kpi-title">Korisnici</div>
              <div className="kpi-value">{kpi ? fmt(kpi.users_total) : "—"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-title">Sale (aktivne)</div>
              <div className="kpi-value">
                {kpi ? `${fmt(kpi.rooms_active)} / ${fmt(kpi.rooms_total)}` : "—"}
              </div>
            </div>
            <div className="kpi">
              <div className="kpi-title">Rezervacije (ukupno)</div>
              <div className="kpi-value">{kpi ? fmt(kpi.reservations_total) : "—"}</div>
            </div>
            <div className="kpi">
              <div className="kpi-title">Danas</div>
              <div className="kpi-value">{kpi ? fmt(kpi.reservations_today) : "—"}</div>
            </div>
          </section>

          {/* charts */}
          <div className="cards-grid">
            <div className="card">
              <div className="card-head">
                <h3>Rezervacije po danu (30d)</h3>
                <button className="btn btn--ghost" onClick={loadDashboard} disabled={loading}>Osveži</button>
              </div>
              <LineChart labels={daily.labels} data={daily.data} />
            </div>

            <div className="card">
              <div className="card-head"><h3>Top sale (po rezervacijama)</h3></div>
              <BarChart labels={topRooms.labels} data={topRooms.data} />
              <div className="legend-list">
                {topRooms.labels?.map((l, i) => (
                  <span key={i} className="legend-item"><span className="dot" /> {l} — {fmt(topRooms.data?.[i])}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Raspodela sala po tipu</h3></div>
              <div className="donut-wrap">
                <DonutChart labels={byType.labels} data={byType.data} />
                <div className="legend-col">
                  {byType.labels?.map((l, i) => (
                    <span key={i} className="legend-item"><span className={`swatch seg-${(i % 6) + 1}`} /> {l} — {fmt(byType.data?.[i])}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-head"><h3>Opterećenje po satima (14d)</h3></div>
              <BarChart labels={hourly.labels} data={hourly.data} />
            </div>

            <div className="card">
              <div className="card-head"><h3>Iskorišćenost (30d)</h3></div>
              <div className="util">
                <div className="util-row">
                  <div>Aktivnih sala</div><strong>{util ? fmt(util.active_rooms) : "—"}</strong>
                </div>
                <div className="util-row">
                  <div>Sa bar jednom rez.</div><strong>{util ? fmt(util.busy_rooms) : "—"}</strong>
                </div>
                <div className="util-row">
                  <div>Udeo</div><strong>{util ? `${Math.round(util.ratio * 100)}%` : "—"}</strong>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === "users" && (
        <section className="users">
          <div className="users-head">
            <div className="field">
              <label>Pretraga</label>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="ime, email, uloga…" />
            </div>
            <div className="actions">
              <button className="btn btn--ghost" onClick={() => loadUsers(1, q)}>Traži</button>
              <button className="btn btn--primary" onClick={() => { setEditing(null); setModalOpen(true); }}>+ Novi</button>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>ID</th><th>Ime</th><th>Email</th><th>Uloga</th><th className="right">Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr><td colSpan={5} className="center muted">Nema rezultata.</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td><span className="badge">{u.role}</span></td>
                      <td className="right">
                        <button className="btn btn--ghost" onClick={() => { setEditing(u); setModalOpen(true); }}>Izmeni</button>
                        <button className="btn btn--danger" onClick={() => deleteUser(u.id)}>Obriši</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Strana {uMeta.current_page} / {uMeta.last_page} • {fmt(uMeta.total)} zapisa</span>
              <div className="page-ctrls">
                <button className="btn btn--ghost" disabled={uMeta.current_page <= 1} onClick={() => loadUsers(1, q)}>« Prva</button>
                <button className="btn btn--ghost" disabled={uMeta.current_page <= 1} onClick={() => loadUsers(uMeta.current_page - 1, q)}>‹ Preth</button>
                <button className="btn btn--ghost" disabled={uMeta.current_page >= uMeta.last_page} onClick={() => loadUsers(uMeta.current_page + 1, q)}>Sled ›</button>
                <button className="btn btn--ghost" disabled={uMeta.current_page >= uMeta.last_page} onClick={() => loadUsers(uMeta.last_page, q)}>Posl »</button>
              </div>
            </div>
          </div>

          <UserModal
            open={modalOpen}
            initial={editing}
            onClose={() => setModalOpen(false)}
            onSave={(body) => editing ? updateUser(editing.id, body) : createUser(body)}
          />
        </section>
      )}
    </main>
  );
}
