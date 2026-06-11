"use client";

import { useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteCategory, updateCategory } from "./actions";

type Row = {
  id: string;
  nombre: string;
  slug: string;
  orden: number;
  activo: boolean;
  count: number;
};

export function CategoriasTable({ rows: initialRows }: { rows: Row[] }) {
  const [rows, setRows] = useState(initialRows);
  const [pending, start] = useTransition();

  useEffect(() => {
    setRows(initialRows);
  }, [initialRows]);
  const [error, setError] = useState<string | null>(null);

  function persist(id: string, patch: Partial<Row>) {
    setRows((cur) =>
      cur.map((r) => (r.id === id ? { ...r, ...patch } : r))
    );
    start(async () => {
      setError(null);
      const res = await updateCategory(id, {
        nombre: patch.nombre,
        activo: patch.activo,
        orden: patch.orden,
      });
      if ("error" in res && res.error) {
        setError(res.error);
        toast.error(res.error);
      }
    });
  }

  function move(id: string, direction: -1 | 1) {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const swap = rows[idx + direction];
    if (!swap) return;
    const a = rows[idx];
    persist(a.id, { orden: swap.orden });
    persist(swap.id, { orden: a.orden });
    setRows((cur) => {
      const copy = [...cur];
      copy[idx] = swap;
      copy[idx + direction] = a;
      return copy;
    });
  }

  if (rows.length === 0) {
    return (
      <p
        className="rounded-[4px] border border-dashed py-8 text-center text-sm italic"
        style={{ borderColor: "rgba(14,42,56,0.32)", color: "#4B6B78", background: "#F8F2E2" }}
      >
        No hay categorías todavía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((r, idx) => (
        <article
          key={r.id}
          className="bt-anim-rise rounded-[4px] border"
          style={{
            ["--i" as never]: idx,
            background: r.activo ? "#FFFDF8" : "#F8F2E2",
            borderColor: r.activo ? "rgba(14,42,56,0.32)" : "rgba(14,42,56,0.12)",
            opacity: r.activo ? 1 : 0.7,
            boxShadow: "0 1px 0 rgba(14,42,56,0.06)",
          }}
        >
          <div className="flex items-center gap-2 p-3 pb-0">
            {/* Orden */}
            <div className="flex flex-col items-center gap-0.5">
              <button
                type="button"
                disabled={idx === 0 || pending}
                onClick={() => move(r.id, -1)}
                aria-label="Subir"
                className="rounded-[3px] p-1.5 transition-colors disabled:opacity-30"
                style={{ color: "#4B6B78" }}
              >
                <ArrowUp className="size-4" />
              </button>
              <GripVertical className="size-3" style={{ color: "#8AA3AD" }} />
              <button
                type="button"
                disabled={idx === rows.length - 1 || pending}
                onClick={() => move(r.id, 1)}
                aria-label="Bajar"
                className="rounded-[3px] p-1.5 transition-colors disabled:opacity-30"
                style={{ color: "#4B6B78" }}
              >
                <ArrowDown className="size-4" />
              </button>
            </div>

            {/* Nombre editable + slug */}
            <div className="flex-1 min-w-0">
              <input
                value={r.nombre}
                onChange={(e) =>
                  setRows((cur) =>
                    cur.map((x) => (x.id === r.id ? { ...x, nombre: e.target.value } : x))
                  )
                }
                onBlur={(e) => {
                  const cleaned = e.target.value.trim();
                  if (cleaned && cleaned !== initialRows.find((x) => x.id === r.id)?.nombre) {
                    persist(r.id, { nombre: cleaned });
                  }
                }}
                className="w-full border-none bg-transparent text-base font-semibold outline-none"
                style={{ color: "#0E2A38" }}
              />
              <span
                className="bt-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: "#8AA3AD" }}
              >
                /{r.slug} · {r.count} {r.count === 1 ? "producto" : "productos"}
              </span>
            </div>
          </div>

          {/* Controles */}
          <div
            className="mt-2 flex items-center justify-between border-t px-3 py-2.5"
            style={{ borderColor: "rgba(14,42,56,0.08)" }}
          >
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <span
                className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors"
                style={{
                  background: r.activo ? "#0A6E9E" : "#E6DEC9",
                  borderColor: r.activo ? "#075578" : "rgba(14,42,56,0.18)",
                }}
              >
                <input
                  type="checkbox"
                  checked={r.activo}
                  onChange={(e) => persist(r.id, { activo: e.target.checked })}
                  className="sr-only"
                />
                <span
                  className="block h-4.5 w-4.5 rounded-full shadow-sm transition-transform"
                  style={{
                    width: 18,
                    height: 18,
                    background: "#fff",
                    transform: r.activo ? "translateX(22px)" : "translateX(3px)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }}
                />
              </span>
              <span
                className="bt-stencil text-[10px]"
                style={{ color: r.activo ? "#0A6E9E" : "#8AA3AD" }}
              >
                {r.activo ? "Activa" : "Inactiva"}
              </span>
            </label>

            <button
              type="button"
              disabled={pending}
              onClick={() => {
                if (!confirm(`¿Eliminar "${r.nombre}"?`)) return;
                start(async () => {
                  setError(null);
                  const res = await deleteCategory(r.id);
                  if ("error" in res && res.error) {
                    setError(res.error);
                    toast.error(res.error);
                    return;
                  }
                  toast.success("Categoría eliminada");
                  setRows((cur) => cur.filter((x) => x.id !== r.id));
                });
              }}
              className="flex items-center gap-1 rounded-[3px] px-2.5 py-1.5 text-[10px] transition-colors"
              style={{ color: "#FF7657" }}
            >
              <Trash2 className="size-3.5" />
              <span className="bt-stencil">Borrar</span>
            </button>
          </div>
        </article>
      ))}
      {error ? (
        <p className="text-sm font-medium" style={{ color: "#FF7657" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
