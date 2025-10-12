import React, { useEffect, useMemo, useState, useCallback } from "react";
import api from "../api/client";
import ReservationForm from "../components/ReservationForm";
import "./sale.css";
 
function toMin(t) { const [h,m]=String(t||"").split(":"); return (+h)*60+(+m||0); }
function overlaps(aFrom,aTo,bFrom,bTo){ return Math.max(aFrom,bFrom) < Math.min(aTo,bTo); }

export default function SaleCatalog() {
  const [sale, setSale] = useState([]);
  const [rez, setRez]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const [tip, setTip] = useState("all");
  const [capMin, setCapMin] = useState("");
  const [capMax, setCapMax] = useState("");
  const [date, setDate] = useState("");         // YYYY-MM-DD
  const [from, setFrom] = useState("08:00");    // HH:mm
  const [to, setTo]     = useState("10:00");    // HH:mm
  const [kind, setKind] = useState("sastanak"); // tip događaja (za preporuku)
  const [people, setPeople] = useState("");     // očekivan broj učesnika (za preporuku)
  const [sortBy, setSortBy] = useState("naziv");// naziv | kapacitet
  const [sortDir, setSortDir] = useState("asc");// asc|desc

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [openRes, setOpenRes] = useState(null); // {sala}
  
  const load = useCallback(async () => {
    setLoading(true); setMsg("");
    try{
      const [sRes, rRes] = await Promise.all([
        api.get("/sale"),
        api.get("/rezervacije") // zahteva auth (korisnik/menadzer)
      ]);
      setSale(sRes.data?.data || sRes.data || []);
      setRez(rRes.data?.data || rRes.data || []);
    }catch(e){
      setMsg("Ne mogu da učitam sale/rezervacije. Proveri prijavu i prava.");
    }finally{ setLoading(false); }
  }, []);
  useEffect(()=>{ load(); },[load]);

  // Dinamički tipovi
  const tipOptions = useMemo(() => ["all", ...Array.from(new Set((sale||[]).map(s=>String(s.tip||"")).filter(Boolean)) )], [sale]);

  // Da li je sala slobodna u datom terminu
  const isFree = useCallback((sala, datumISO, tFrom, tTo) => {
    if(!datumISO) return true; // ako nema datuma, ne filtriramo po zauzeću
    const F = toMin(tFrom), T = toMin(tTo);
    const todayRez = rez.filter(r => String(r.sala_id) === String(sala.id) && String(r.datum) === String(datumISO));
    return todayRez.every(r => !overlaps(F, T, toMin(r.vreme_od), toMin(r.vreme_do)));
  }, [rez]);

  // Napredna filtracija + pretraga + raspoloživost
  const filtered = useMemo(()=>{
    let list = Array.isArray(sale) ? [...sale] : [];
    const q = query.trim().toLowerCase();
    if(q){
      list = list.filter(s=>{
        const hay = [s.naziv, s.tip, s.opis, String(s.kapacitet), s.status ? "aktivna":"neaktivna"].join(" ").toLowerCase();
        return hay.includes(q);
      });
    }
    if(tip !== "all") list = list.filter(s => String(s.tip||"") === tip);

    const min = capMin!==""? Number(capMin):null;
    const max = capMax!==""? Number(capMax):null;
    if(min!==null) list = list.filter(s => Number(s.kapacitet||0) >= min);
    if(max!==null) list = list.filter(s => Number(s.kapacitet||0) <= max);

    // Raspoloživost (ako je zadat datum i raspon vremena)
    if(date && from && to){
      list = list.filter(s => isFree(s, date, from, to));
    }

    // Sort
    list.sort((a,b)=>{
      const dir = sortDir==="asc"?1:-1;
      const A = a[sortBy], B = b[sortBy];
      if(typeof A === "string" || typeof B === "string"){
        return String(A||"").localeCompare(String(B||""), "sr", {sensitivity:"base"}) * dir;
      }
      return ((Number(A)||0) - (Number(B)||0)) * dir;
    });

    return list;
  },[sale, query, tip, capMin, capMax, date, from, to, sortBy, sortDir, isFree]);

  // Paginacija
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

  // Heuristička PREPORUKA: prvo slobodne, pa tip koji se poklapa, pa najbliži kapacitetu "people"
  const suggestions = useMemo(()=>{
    const need = Number(people||0) || 0;
    const base = filtered.filter(s => (!date || isFree(s, date, from, to)));
    const score = (s) => {
      let sc = 0;
      if(date && from && to && isFree(s, date, from, to)) sc += 5;
      if(tip !== "all" && String(s.tip||"")===tip) sc += 2;
      if(kind && String(s.tip||"").toLowerCase().includes(kind.toLowerCase())) sc += 1;
      if(need>0) sc += Math.max(0, 3 - Math.abs((s.kapacitet||0)-need)/Math.max(need,1));
      if(s.status) sc += 0.5;
      return sc;
    };
    return [...base].sort((a,b)=> score(b)-score(a)).slice(0,3);
  },[filtered, date, from, to, tip, kind, people, isFree]);

  return (
    <main className="sales" role="main">
      <div className="sales-head">
        <div>
          <p className="eyebrow">Dostupne prostorije</p>
          <h1>Sale — pregled i rezervacija</h1>
          <p className="muted">Napredna pretraga po tipu, kapacitetu i slobodnim terminima. Pametna preporuka na osnovu vaših potreba.</p>
        </div>
        <div className="sales-actions">
          <button className="btn btn--ghost" onClick={load}>Osveži</button>
          <button className="btn btn--ghost" onClick={resetFilters}>Reset filtera</button>
        </div>
      </div>

      {/* FILTERI */}
      <section className="filters" aria-label="Filteri i pretraga">
        <div className="filters-grid">
          <div className="filter">
            <label className="filter-label">Pretraga</label>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Naziv, opis, status…" />
          </div>

          <div className="filter">
            <label className="filter-label">Tip prostorije</label>
            <select value={tip} onChange={e=>setTip(e.target.value)}>
              {tipOptions.map(t => <option key={t} value={t}>{t==="all"?"Svi tipovi":t}</option>)}
            </select>
          </div>

          <div className="filter">
            <label className="filter-label">Kapacitet (od)</label>
            <input type="number" min="1" value={capMin} onChange={e=>setCapMin(e.target.value)} placeholder="npr. 10" />
          </div>
          <div className="filter">
            <label className="filter-label">Kapacitet (do)</label>
            <input type="number" min="1" value={capMax} onChange={e=>setCapMax(e.target.value)} placeholder="npr. 100" />
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
            <label className="filter-label">Tip događaja (preporuka)</label>
            <input value={kind} onChange={e=>setKind(e.target.value)} placeholder="npr. sastanak, radionica…" />
          </div>
          <div className="filter">
            <label className="filter-label">Broj učesnika (preporuka)</label>
            <input type="number" min="1" value={people} onChange={e=>setPeople(e.target.value)} placeholder="npr. 25" />
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
      {(suggestions.length>0) && (
        <div className="card" style={{margin:"10px 0 14px", padding:"10px 12px"}}>
          <strong>Predlog za vas:</strong>
          <ul style={{margin:"8px 0 0 18px"}}>
            {suggestions.map(s=>(
              <li key={s.id}>
                {s.naziv} — {s.tip} · kap. {s.kapacitet}{" "}
                <button className="btn btn--ghost" onClick={()=>setOpenRes({sala:s, date, from, to, tip_dogadjaja: kind})}>Rezerviši</button>
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
                <th className={`sortable ${sortBy==="naziv"?`sorted ${sortDir}`:""}`} onClick={()=>toggleSort("naziv")}>Naziv</th>
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
              ) : pageItems.map(s=> {
                const free = (!date||!from||!to) ? null : isFree(s, date, from, to);
                return (
                  <tr key={s.id}>
                    <td>{s.naziv}</td>
                    <td>{s.tip}</td>
                    <td className="right">{s.kapacitet}</td>
                    <td>
                      <span className={`badge ${s.status ? "badge--ok":"badge--muted"}`}>
                        {s.status ? "Aktivna":"Neaktivna"}
                      </span>
                    </td>
                    <td>
                      {free===null ? <span className="muted">—</span> : (
                        <span className={`badge ${free?"badge--ok":"badge--muted"}`}>
                          {free?"Slobodna":"Zauzeta"}
                        </span>
                      )}
                    </td>
                    <td className="right">
                      <button
                        className="btn btn--primary"
                        disabled={free===false || !s.status}
                        onClick={()=>setOpenRes({sala:s, date, from, to, tip_dogadjaja: kind})}
                      >
                        Rezerviši
                      </button>
                    </td>
                  </tr>
                );
              })}
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
