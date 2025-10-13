import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/client";
import ReservationForm from "../components/ReservationForm";
import "./sale.css";

/* ---------------- helpers ---------------- */
function toMin(t) { const [h,m]=String(t||"").split(":"); return (+h)*60+(+m||0); }

/* ---------------- component ---------------- */
export default function SaleCatalog() {
  const [sale, setSale]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
 
  const [query, setQuery]   = useState("");
  const [tip, setTip]       = useState("all");       // preferirani tip prostorije
  const [capMin, setCapMin] = useState("");
  const [capMax, setCapMax] = useState("");
  const [date, setDate]     = useState("");          // YYYY-MM-DD (preferencija termina)
  const [from, setFrom]     = useState("08:00");     // HH:mm (preferencija termina)
  const [to, setTo]         = useState("10:00");     // HH:mm (preferencija termina)
  const [kind, setKind]     = useState("sastanak");  // tip događaja (preferencija)
  const [people, setPeople] = useState("");          // očekivan broj učesnika (preferencija)

  // sort
  const [sortBy, setSortBy]   = useState("naziv");   // naziv | kapacitet
  const [sortDir, setSortDir] = useState("asc");     // asc | desc

  // lokalna paginacija
  const [page, setPage]     = useState(1);
  const [perPage, setPerPage] = useState(10);

  // modal rezervacije
  const [openRes, setOpenRes] = useState(null); // { sala, date, from, to, tip_dogadjaja }

  // Poeni za preporuke — SVE NA OSNOVU PREFERENCIJA
  const WEIGHTS = {
    roomTypeMatch: 3,
    eventKindHint: 2,
    capacityProximity: 5,
    activeRoom: 0.5,
    timePrefGiven: 0.5,
  };

  /* ------------ učitavanje podataka ------------ */
  const load = useCallback(async () => {
    setLoading(true); setMsg("");
    try{
      const sRes = await api.get("/sale");
      setSale(sRes.data?.data || sRes.data || []);
    }catch(e){
      setMsg("Ne mogu da učitam sale. Proveri prijavu i prava.");
    }finally{ setLoading(false); }
  }, []);
  useEffect(()=>{ load(); },[load]);

  /* ------------ dinamički tipovi ------------ */
  const tipOptions = useMemo(
    () => ["all", ...Array.from(new Set((sale||[]).map(s=>String(s.tip||"")).filter(Boolean)))],
    [sale]
  );

  /* ------------ napredna pretraga + filtracija (za tabelu) ------------ */
  const filtered = useMemo(()=>{
    let list = Array.isArray(sale) ? [...sale] : [];
    const q = query.trim().toLowerCase();

    if(q){
      list = list.filter(s=>{
        const hay = [
          s.naziv, s.tip, s.opis, String(s.kapacitet),
          s.status ? "aktivna" : "neaktivna"
        ].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }

    if(tip !== "all") list = list.filter(s => String(s.tip||"") === tip);

    const min = capMin!=="" ? Number(capMin) : null;
    const max = capMax!=="" ? Number(capMax) : null;
    if(min!==null) list = list.filter(s => Number(s.kapacitet||0) >= min);
    if(max!==null) list = list.filter(s => Number(s.kapacitet||0) <= max);

    // Sort
    list.sort((a,b)=>{
      const dir = sortDir==="asc" ? 1 : -1;
      const A = a[sortBy], B = b[sortBy];
      if(typeof A === "string" || typeof B === "string"){
        return String(A||"").localeCompare(String(B||""), "sr", {sensitivity:"base"}) * dir;
      }
      return ((Number(A)||0) - (Number(B)||0)) * dir;
    });

    return list;
  },[sale, query, tip, capMin, capMax, sortBy, sortDir]);

  /* ------------ paginacija ------------ */
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const cur = Math.min(page, totalPages);
  const start = (cur-1)*perPage, end = Math.min(start+perPage, total);
  const pageItems = filtered.slice(start, end);

  function toggleSort(col){
    if(sortBy===col) setSortDir(d=>d==="asc"?"desc":"asc");
    else { setSortBy(col); setSortDir(col==="kapacitet"?"desc":"asc"); }
  }
  function resetFilters(){
    setQuery(""); setTip("all"); setCapMin(""); setCapMax("");
    setDate(""); setFrom("08:00"); setTo("10:00"); setKind("sastanak"); setPeople("");
    setSortBy("naziv"); setSortDir("asc"); setPage(1);
  }

  /* ------------ SISTEM PREPORUKE (po preferencijama + KAPACITET KAO TVRDA OGRADA) ------------ */
  const scoredSuggestions = useMemo(()=>{
    const min = capMin!=="" ? Number(capMin) : null;
    const max = capMax!=="" ? Number(capMax) : null;

    // 1) Tvrdo filtriramo bazen kandidata po kapacitetu (ako je zadat)
    const pool = (sale||[]).filter(s => {
      const cap = Number(s.kapacitet)||0;
      if (min!==null && cap < min) return false;
      if (max!==null && cap > max) return false;
      return true;
    });

    // 2) Odredimo "ciljni" broj mesta za bodovanje blizine:
    //    people (ako uneto) inače sredina [min,max] ili jedna od granica.
    const target = (() => {
      const p = Number(people||0);
      if (p > 0) return p;
      if (min!==null && max!==null) return (min + max)/2;
      if (min!==null) return min;
      if (max!==null) return max;
      return 0; // nema cilja -> dobiće 0 poena iz tog kriterijuma
    })();

    const hasTime = Boolean(date && from && to && toMin(to) > toMin(from));

    const rankList = pool.map(s => {
      let score = 0;

      // Tip prostorije preferencija (meko)
      if (tip !== "all" && String(s.tip||"") === tip) score += WEIGHTS.roomTypeMatch;

      // Heuristika za tip događaja
      if (kind && String(s.tip||"").toLowerCase().includes(kind.toLowerCase())) {
        score += WEIGHTS.eventKindHint;
      }

      // Blizina kapaciteta cilju
      if (target > 0) {
        const delta = Math.abs((Number(s.kapacitet)||0) - target);
        const proximity = Math.max(0, WEIGHTS.capacityProximity - delta / Math.max(target, 1));
        score += proximity;
      }

      // Aktivna sala
      if (s.status) score += WEIGHTS.activeRoom;

      // Popunjene vremenske preferencije — mala prednost
      if (hasTime) score += WEIGHTS.timePrefGiven;

      return { sala: s, score };
    });

    rankList.sort((a,b)=> b.score - a.score);

    // Ako se previše suzilo pa nema kandidata, fallback na sve sale (bez kap. ograde)
    if (rankList.length === 0) {
      const fallback = (sale||[]).map(s => ({ sala:s, score:0 }));
      return fallback.slice(0,5);
    }
    return rankList.slice(0, 5);
  }, [sale, tip, kind, people, capMin, capMax, date, from, to]);

  /* ------------ auto rezerviši top predlog ------------ */
  function autoReserveTop() {
    if (scoredSuggestions.length === 0) return;
    const top = scoredSuggestions[0].sala;
    setOpenRes({
      sala: top,
      date: date || "",
      from,
      to,
      tip_dogadjaja: kind
    });
  }

  return (
    <main className="sales" role="main">
      <div className="sales-head">
        <div>
          <p className="eyebrow">Dostupne prostorije</p>
          <h1>Sale — pregled i rezervacija</h1>
          <p className="muted">
            Unesi svoje preferencije (tip prostorije, tip događaja, broj učesnika i termin).
            Preporuke poštuju <strong>Kapacitet (od/do)</strong> kao ogradu i zatim rangiraju najbolje opcije.
          </p>
        </div>
        <div className="sales-actions">
          <button className="btn btn--ghost" onClick={load}>Osveži</button>
          <button className="btn btn--ghost" onClick={resetFilters}>Reset filtera</button>
        </div>
      </div>

      {/* FILTERI / PREFERENCIJE KORISNIKA */}
      <section className="filters" aria-label="Filteri i preferencije">
        <div className="filters-grid">
          <div className="filter">
            <label className="filter-label">Pretraga</label>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Naziv, opis, status…" />
          </div>

          <div className="filter">
            <label className="filter-label">Tip prostorije (preferencija)</label>
            <select value={tip} onChange={e=>setTip(e.target.value)}>
              {tipOptions.map(t => <option key={t} value={t}>{t==="all"?"Svi tipovi":t}</option>)}
            </select>
          </div>

          <div className="filter">
            <label className="filter-label">Kapacitet (od)</label>
            <input type="number" min="1" value={capMin} onChange={e=>setCapMin(e.target.value)} placeholder="npr. 50" />
          </div>
          <div className="filter">
            <label className="filter-label">Kapacitet (do)</label>
            <input type="number" min="1" value={capMax} onChange={e=>setCapMax(e.target.value)} placeholder="npr. 80" />
          </div>

          <div className="filter">
            <label className="filter-label">Datum (preferencija)</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} />
          </div>
          <div className="filter">
            <label className="filter-label">Vreme (od–do) (preferencija)</label>
            <div className="field-row">
              <input type="time" value={from} onChange={e=>setFrom(e.target.value)} />
              <span>–</span>
              <input type="time" value={to} onChange={e=>setTo(e.target.value)} />
            </div>
          </div>

          <div className="filter">
            <label className="filter-label">Tip događaja (preferencija)</label>
            <input value={kind} onChange={e=>setKind(e.target.value)} placeholder="npr. sastanak, radionica…" />
          </div>
          <div className="filter">
            <label className="filter-label">Broj učesnika (preferencija)</label>
            <input type="number" min="1" value={people} onChange={e=>setPeople(e.target.value)} placeholder="npr. 60" />
          </div>

          <div className="filter">
            <label className="filter-label">Sortiraj</label>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="naziv">Naziv</option>
              <option value="kapacitet">Kapacitet</option>
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

      {/* PREPORUKE */}
      {(scoredSuggestions.length>0) && (
        <div className="card" style={{margin:"10px 0 14px", padding:"10px 12px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <strong>Predlog za vas (po unetim preferencijama):</strong>
            <button className="btn btn--primary" onClick={autoReserveTop}>
              Rezerviši top predlog
            </button>
          </div>

          <ul style={{margin:"8px 0 0 18px"}}>
            {scoredSuggestions.map(({ sala: s, score })=>(
              <li key={s.id} style={{marginBottom:8}}>
                <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap"}}>
                  <span>{s.naziv} — {s.tip} · kap. {s.kapacitet}</span>
                  <span className="muted">poeni: {score.toFixed(2)}</span>
                  {(date && from && to) && (
                    <span className="muted"> · termin: {date} {from}–{to}</span>
                  )}
                  <button
                    className="btn btn--ghost"
                    onClick={()=>setOpenRes({sala:s, date: date || "", from, to, tip_dogadjaja: kind})}
                  >
                    Rezerviši
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TABELA */}
      <div className="card">
        <div className="table-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th
                  className={`sortable ${sortBy==="naziv" ? `sorted ${sortDir}` : ""}`}
                  onClick={()=>toggleSort("naziv")}
                >
                  Naziv
                </th>
                <th>Tip</th>
                <th className="right sortable" onClick={()=>toggleSort("kapacitet")}>Kapacitet</th>
                <th>Status</th>
                <th>Dostupnost</th>
                <th className="right">Akcije</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length===0 ? (
                <tr><td colSpan={6} className="center muted">Nema podataka.</td></tr>
              ) : pageItems.map(s=> (
                <tr key={s.id}>
                  <td>{s.naziv}</td>
                  <td>{s.tip}</td>
                  <td className="right">{s.kapacitet}</td>
                  <td>
                    <span className={`badge ${s.status ? "badge--ok":"badge--muted"}`}>
                      {s.status ? "Aktivna":"Neaktivna"}
                    </span>
                  </td>
                  <td><span className="muted">—</span></td>
                  <td className="right">
                    <button
                      className="btn btn--primary"
                      onClick={()=>setOpenRes({sala:s, date: date || "", from, to, tip_dogadjaja: kind})}
                    >
                      Rezerviši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINACIJA */}
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
                status: "pending"
              }}
              salaName={openRes.sala.naziv}
              onCancel={()=>setOpenRes(null)}
              onSuccess={()=>{
                setOpenRes(null);
                load();
                setMsg("Rezervacija je uspešno poslata.");
              }}
            />
          </div>
        </div>
      )}
    </main>
  );
}
