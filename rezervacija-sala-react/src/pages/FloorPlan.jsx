import React, { useCallback, useEffect, useMemo, useState } from "react";
import api from "../api/client";
import FloorMap from "../components/FloorMap";
import ReservationForm from "../components/ReservationForm";
import { useAuth } from "../context/AuthContext";
import "./sale.css";

/* helpers */
function toMin(t) { const [h,m]=String(t||"").split(":"); return (+h)*60+(+m||0); }
function overlaps(aFrom,aTo,bFrom,bTo){ return Math.max(aFrom,bFrom) < Math.min(aTo,bTo); }

export default function FloorPlan() {
  const { isAdmin } = useAuth();              
  const canEdit = Boolean(isAdmin);

  const [sale, setSale] = useState([]);
  const [rez, setRez] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // UI filteri
  const [floor, setFloor] = useState("all");
  const [date, setDate] = useState("");
  const [from, setFrom] = useState("08:00");
  const [to, setTo] = useState("10:00");
  const [cellSize, setCellSize] = useState(32);

  // Edit mode (drag&drop layout) – dozvoljen samo adminu
  const [editMode, setEditMode] = useState(false);

  const [openRes, setOpenRes] = useState(null); // { sala, date, from, to }

  const load = useCallback(async () => {
    setLoading(true); setMsg("");
    try {
      const sRes = await api.get("/sale");
      setSale(sRes.data?.data || sRes.data || []);
    } catch (e) {
      setSale([]);
      setMsg("Ne mogu da učitam sale.");
    }
    try {
      const rRes = await api.get("/rezervacije");
      setRez(rRes.data?.data || rRes.data || []);
    } catch (e) {
      if (e?.response?.status === 403) setRez([]);
      else setMsg(m => m || "Ne mogu da učitam rezervacije.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(()=>{ load(); },[load]);

  // Ako korisnik nije admin, osiguraj da je editMode isključen
  useEffect(() => {
    if (!canEdit && editMode) setEditMode(false);
  }, [canEdit, editMode]);

  // sprat opcije
  const floorOptions = useMemo(() => {
    const set = new Set();
    (sale||[]).forEach(s => {
      const f = s.floor ?? s.sprat;
      if (f !== null && f !== undefined) set.add(Number(f));
    });
    const arr = Array.from(set).sort((a,b)=>a-b);
    return ["all", ...arr];
  }, [sale]);

  // da li je sala slobodna u terminu
  const isFree = useCallback((sala, datumISO, tFrom, tTo) => {
    if(!datumISO) return true;
    const F = toMin(tFrom), T = toMin(tTo);
    const todayRez = rez.filter(r => String(r.sala_id) === String(sala.id) && String(r.datum) === String(datumISO));
    return todayRez.every(r => !overlaps(F, T, toMin(r.vreme_od), toMin(r.vreme_do)));
  }, [rez]);

  // filtriraj po izabranom spratu
  const shown = useMemo(() => {
    if (floor === "all") return sale;
    const f = Number(floor);
    return (sale||[]).filter(s => Number(s.floor ?? s.sprat ?? 0) === f);
  }, [sale, floor]);

  // snimi layout (PATCH /sale/{id}/layout) — samo admin
  const saveLayout = useCallback(async (id, layout) => {
    if (!canEdit) return; // hard guard
    setSale(prev => prev.map(s => s.id === id ? { ...s, ...layout } : s)); // optimistic
    try {
      await api.patch(`/sale/${id}/layout`, layout);
    } catch (e) {
      // vrati stanje ako backend odbije (npr. 403)
      await load();
      const err = e?.response?.data?.message || "Greška pri čuvanju rasporeda.";
      setMsg(err);
    }
  }, [canEdit, load]);

  const editable = canEdit && editMode; // jedino admin + uključen prekidač

  return (
    <main className="sales" role="main">
      <div className="sales-head">
        <div>
          <p className="eyebrow">Vizuelni raspored</p>
          <h1>Mapa sprata — sale u objektu</h1>
          <p className="muted">
            Klikom na sobu započni rezervaciju. {canEdit ? "U edit modu prevuci sobu po mreži." : "Samo admin može da uređuje raspored."}
          </p>
        </div>
        <div className="sales-actions" style={{display:"flex",gap:12,alignItems:"center"}}>
          {canEdit && (
            <label style={{display:"flex",gap:8,alignItems:"center",fontSize:14}}>
              <input
                type="checkbox"
                checked={editMode}
                onChange={(e)=>setEditMode(e.target.checked)}
              />
              Uredi raspored (drag & drop)
            </label>
          )}
          <button className="btn btn--ghost" onClick={load}>Osveži</button>
        </div>
      </div>

      {/* FILTERI */}
      <section className="filters" aria-label="Filteri mape">
        <div className="filters-grid">
          <div className="filter">
            <label className="filter-label">Sprat</label>
            <select value={floor} onChange={e=>setFloor(e.target.value)}>
              {floorOptions.map(f => (
                <option key={String(f)} value={String(f)}>
                  {f === "all" ? "Svi spratovi" : `Sprat ${f}`}
                </option>
              ))}
            </select>
          </div>

          <div className="filter">
            <label className="filter-label">Datum</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>

          <div className="filter">
            <label className="filter-label">Vreme (od–do)</label>
            <div className="field-row">
              <input type="time" value={from} onChange={e=>setFrom(e.target.value)} />
              <span>–</span>
              <input type="time" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
          </div>

          <div className="filter">
            <label className="filter-label">Veličina ćelije</label>
            <input
              type="range" min="20" max="60" step="4"
              value={cellSize}
              onChange={e=>setCellSize(Number(e.target.value))}
            />
          </div>
        </div>
      </section>

      {msg && <div className="alert">{msg}</div>}
      {loading && <div className="alert">Učitavanje…</div>}

      {/* MAPA */}
      <FloorMap
        sale={shown}
        isFree={isFree}
        date={date}
        from={from}
        to={to}
        cellSize={cellSize}
        editable={editable}                            // ⬅️ samo admin u edit modu
        onDrop={(salaId, layout) => canEdit && saveLayout(salaId, layout)}
        onReserve={(sala) => !editable && setOpenRes({ sala, date, from, to, tip_dogadjaja: "" })}
      />

      {/* MODAL: Rezervacija */}
      {openRes && (
        <div className="modal" role="dialog" aria-modal="true">
          <div className="modal-card">
            <ReservationForm
              initial={{
                sala_id: openRes.sala.id,
                datum: openRes.date || "",
                vreme_od: openRes.from || "",
                vreme_do: openRes.to || "",
                tip_dogadjaja: openRes.tip_dogadjaja || "",
                status: "pending",
              }}
              salaName={openRes.sala.naziv}
              onCancel={()=>setOpenRes(null)}
              onSuccess={()=>{ setOpenRes(null); load(); }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
