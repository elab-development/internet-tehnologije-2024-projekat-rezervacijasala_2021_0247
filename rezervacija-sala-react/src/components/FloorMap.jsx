import React, { useMemo, useRef } from "react";
import {
  DndContext,
  useDraggable,
  useSensors,
  useSensor,
  PointerSensor,
  TouchSensor,
  DragEndEvent,
  DragMoveEvent,
} from "@dnd-kit/core";
import { restrictToParentElement } from "@dnd-kit/modifiers";
import "./floor-map.css";

/* helpers */
function num(...vals) {
  for (const v of vals) {
    if (v === 0 || v === "0") return 0;
    if (v !== undefined && v !== null && v !== "") return Number(v);
  }
  return undefined;
}
function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

/* Draggable tile */
function RoomTile({ r, state, x, y, w, h, cellSize, editable }) {
  const id = String(r.id);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: !editable,
  });

  // dok vučemo, koristimo transform iz dnd-kita (slobodan pomeraj u obe ose)
  const style = {
    left: x * cellSize,
    top:  y * cellSize,
    width:  w * cellSize,
    height: h * cellSize,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`room ${state} ${editable ? "draggable" : ""} ${isDragging ? "dragging" : ""}`}
      style={style}
      title={editable ? "Prevuci da promeniš poziciju" : undefined}
      aria-label={`${r.naziv||"Sala"}, kapacitet ${r.kapacitet||"-"}, ${state}`}
    >
      <div className="room-name">{r.naziv || r.name || "Sala"}</div>
      <div className="room-meta">
        <span className="chip">{r.kapacitet||"-"}</span>
        <span className={`chip ${state}`}>
          {state==="free"?"Slobodna": state==="busy"?"Zauzeta": state==="inactive"?"Neaktivna":"?"}
        </span>
      </div>
    </div>
  );
}

export default function FloorMap({
  sale, isFree, date, from, to, onReserve, cellSize = 32,
  editable = false, onDrop
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 3 } }),
    useSensor(TouchSensor,   { activationConstraint: { distance: 3 } }),
  );

  const byFloor = useMemo(() => {
    const m = new Map();
    (sale || []).forEach(s => {
      const raw = s.floor ?? s.sprat ?? 0;
      const f = Number(raw);
      if (!m.has(f)) m.set(f, []);
      m.get(f).push(s);
    });
    return Array.from(m.entries()).sort((a,b)=>a[0]-b[0]);
  }, [sale]);

  function bounds(rooms) {
    let maxX=0, maxY=0;
    rooms.forEach((r, i) => {
      const x = num(r.layout_x, r.layoutX, r.x, r.col) ?? (i % 10);
      const y = num(r.layout_y, r.layoutY, r.y, r.row) ?? Math.floor(i / 10);
      const w = Math.max(1, num(r.layout_w, r.layoutW, r.w, r.width) ?? 1);
      const h = Math.max(1, num(r.layout_h, r.layoutH, r.h, r.height) ?? 1);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    });
    return { cols: Math.max(10, maxX), rows: Math.max(6, maxY) };
  }

  return (
    <section className="floor-section">
      {byFloor.map(([floor, rooms])=>{
        const {cols, rows} = bounds(rooms);

        // Drop: snap na grid (X i Y), pa pozovi onDrop
        function handleDragEnd(event /** @type {DragEndEvent} */) {
          if (!editable) return;
          const { active, delta } = event;
          const id = active?.id;
          if (!id) return;
          const r = rooms.find(rr => String(rr.id) === String(id));
          if (!r) return;

          const x = num(r.layout_x, r.layoutX, r.x, r.col) ?? 0;
          const y = num(r.layout_y, r.layoutY, r.y, r.row) ?? 0;
          const w = Math.max(1, num(r.layout_w, r.layoutW, r.w, r.width) ?? 1);
          const h = Math.max(1, num(r.layout_h, r.layoutH, r.h, r.height) ?? 1);

          // delta.x i delta.y su u pikselima → pretvorimo u ćelije i zaokružimo
          const nx = clamp(x + Math.round((delta?.x || 0) / cellSize), 0, cols - w);
          const ny = clamp(y + Math.round((delta?.y || 0) / cellSize), 0, rows - h);

          if ((nx !== x || ny !== y) && onDrop) {
            onDrop(r.id, { floor: Number(r.floor ?? floor), layout_x: nx, layout_y: ny });
          }
        }

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

            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToParentElement]} /* zadržava u platnu, ali dozvoljava X i Y */
            >
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
                {/* grid lines */}
                {[...Array(rows)].map((_,y)=>
                  <div key={`r${y}`} className="grid-row" style={{ top: y*cellSize }} />
                )}
                {[...Array(cols)].map((_,x)=>
                  <div key={`c${x}`} className="grid-col" style={{ left: x*cellSize }} />
                )}

                {rooms.map((r, i)=>{
                  const x = (num(r.layout_x, r.layoutX, r.x, r.col) ?? (i % 10));
                  const y = (num(r.layout_y, r.layoutY, r.y, r.row) ?? Math.floor(i / 10));
                  const w = Math.max(1, num(r.layout_w, r.layoutW, r.w, r.width) ?? 1);
                  const h = Math.max(1, num(r.layout_h, r.layoutH, r.h, r.height) ?? 1);

                  const active = r.status === true || r.status === 1 || String(r.status).toLowerCase().includes("aktiv");
                  const hasTerm = Boolean(date && from && to);
                  const free = hasTerm ? isFree(r, date, from, to) : null;
                  let state = "inactive";
                  if (active) state = free===null ? "unknown" : (free ? "free" : "busy");

                  // važno: NEMA spoljnog wrapper-a oko RoomTile (taj wrapper ume da “poravna” visinu i kvari pomeranje po Y)
                  return (
                    <RoomTile
                      key={r.id ?? `${floor}-${i}`}
                      r={r}
                      state={state}
                      x={x} y={y} w={w} h={h}
                      cellSize={cellSize}
                      editable={editable}
                    />
                  );
                })}
              </div>
            </DndContext>
          </div>
        );
      })}
    </section>
  );
}
