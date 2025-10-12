import React, { useMemo } from "react";
import "./floor-map.css";

 
export default function FloorMap({ sale, isFree, date, from, to, onReserve, cellSize = 32 }) {
  const byFloor = useMemo(() => {
    const m = new Map();
    (sale || []).forEach(s => {
      const f = Number(s.floor ?? 0);
      if (!m.has(f)) m.set(f, []);
      m.get(f).push(s);
    });
    // sortiraj po spratu (npr. prizemlje=0, pa 1,2…)
    return Array.from(m.entries()).sort((a,b)=>a[0]-b[0]);
  }, [sale]);

  // izračunaj potrebnu "mrežu" po spratu (max X/Y)
  function bounds(rooms) {
    let maxX=0, maxY=0;
    rooms.forEach(r=>{
      const x = Number(r.layout_x||0), y = Number(r.layout_y||0);
      const w = Math.max(1, Number(r.layout_w||1)), h = Math.max(1, Number(r.layout_h||1));
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    return {cols: Math.max(10, maxX), rows: Math.max(6, maxY)};
  }

  return (
    <section className="floor-section">
      {byFloor.map(([floor, rooms])=>{
        const {cols, rows} = bounds(rooms);
        return (
          <div key={floor} className="floor-card">
            <div className="floor-head">
              <h2>Sprat {floor}</h2>
              <div className="legend">
                <span className="dot free" /> Slobodna
                <span className="dot busy" /> Zauzeta
                <span className="dot inactive" /> Neaktivna
              </div>
            </div>

            <div
              className="floor-canvas"
              style={{
                "--cell": `${cellSize}px`,
                width: `calc(${cols} * var(--cell))`,
                height: `calc(${rows} * var(--cell))`,
              }}
              role="group"
              aria-label={`Mapa sprata ${floor}`}
            >
              {/* pozadinske mrežne linije (opciono) */}
              {[...Array(rows)].map((_,y)=>
                <div key={`r${y}`} className="grid-row" style={{ top: y*cellSize }} />
              )}
              {[...Array(cols)].map((_,x)=>
                <div key={`c${x}`} className="grid-col" style={{ left: x*cellSize }} />
              )}

              {rooms.map(r=>{
                const x = Number(r.layout_x||0), y = Number(r.layout_y||0);
                const w = Math.max(1, Number(r.layout_w||1)), h = Math.max(1, Number(r.layout_h||1));
                const active = Boolean(r.status);
                const hasTerm = Boolean(date && from && to);
                const free = hasTerm ? isFree(r, date, from, to) : null;

                let state = "inactive";
                if (active) state = free===null ? "unknown" : (free ? "free" : "busy");

                return (
                  <button
                    key={r.id}
                    className={`room ${state}`}
                    style={{
                      left: x*cellSize, top: y*cellSize,
                      width: w*cellSize, height: h*cellSize,
                    }}
                    title={`${r.naziv} • ${r.tip||""}\nKap: ${r.kapacitet||"-"}\n${free===null?"(bez termina)":(free?"Slobodna":"Zauzeta")}`}
                    onClick={()=> active && (free!==false) && onReserve?.(r)}
                    aria-label={`${r.naziv}, kapacitet ${r.kapacitet||"-"}, ${state}`}
                  >
                    <div className="room-name">{r.naziv}</div>
                    <div className="room-meta">
                      <span className="chip">{r.kapacitet||"-"}</span>
                      <span className={`chip ${state}`}>
                        {state==="free"?"Slobodna": state==="busy"?"Zauzeta": state==="inactive"?"Neaktivna":"?"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
