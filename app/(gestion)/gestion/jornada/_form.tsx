"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Package, Plus, Search, X } from "lucide-react";
import { toast } from "sonner";

import type { JornadaState } from "./actions";
import type { Category } from "./page";

export type Product = { id: string; nombre: string; precio: number; category_id: string | null };
export type StockSnapshot = {
  product_id: string;
  cargado: number;
  alquilado: number;
  disponible: number;
};

type FormAction = (
  prev: JornadaState,
  formData: FormData
) => Promise<JornadaState>;

export function StockForm({
  products,
  categories,
  initial,
  action,
  submitLabel = "Guardar",
  emptyAllowed = false,
  snapshots,
}: {
  products: Product[];
  categories: Category[];
  initial: Record<string, number>;
  action: FormAction;
  submitLabel?: string;
  emptyAllowed?: boolean;
  snapshots?: Record<string, StockSnapshot>;
}) {
  const [state, formAction, pending] = useActionState<JornadaState, FormData>(
    action,
    null
  );

  useEffect(() => {
    if (state?.ok) toast.success(state.ok);
    if (state?.error) toast.error(state.error);
  }, [state]);

  const [qty, setQty] = useState<Record<string, number>>(() => {
    const o: Record<string, number> = {};
    products.forEach((p) => (o[p.id] = initial[p.id] ?? 0));
    return o;
  });

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    let list = products;
    if (catFilter) {
      list = list.filter((p) => p.category_id === catFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.nombre.toLowerCase().includes(q));
    }
    return list;
  }, [products, search, catFilter]);

  const total = Object.values(qty).reduce((a, b) => a + b, 0);
  const withStock = products.filter((p) => (qty[p.id] ?? 0) > 0).length;

  if (products.length === 0) {
    return (
      <p
        className="rounded-[4px] border border-dashed py-8 text-center text-sm italic"
        style={{ borderColor: "rgba(14,42,56,0.32)", color: "#4B6B78", background: "#F8F2E2" }}
      >
        No hay productos activos. Pide a un admin que cree productos primero.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {/* Búsqueda + filtro categoría */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
            style={{ color: "#8AA3AD" }}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Buscar producto…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-[4px] border py-2.5 pl-9 pr-9 text-sm outline-none transition-colors"
            style={{
              background: "#FFFDF8",
              borderColor: "rgba(14,42,56,0.32)",
              color: "#0E2A38",
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); searchRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5"
              style={{ color: "#8AA3AD" }}
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setCatFilter(null)}
              className="bt-stencil shrink-0 rounded-full border px-3 py-1 text-[10px] transition-colors"
              style={{
                background: catFilter === null ? "#0E2A38" : "#FFFDF8",
                color: catFilter === null ? "#F2EDE0" : "#4B6B78",
                borderColor: catFilter === null ? "#0E2A38" : "rgba(14,42,56,0.32)",
              }}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCatFilter(catFilter === c.id ? null : c.id)}
                className="bt-stencil shrink-0 rounded-full border px-3 py-1 text-[10px] transition-colors"
                style={{
                  background: catFilter === c.id ? "#0A6E9E" : "#FFFDF8",
                  color: catFilter === c.id ? "#fff" : "#4B6B78",
                  borderColor: catFilter === c.id ? "#075578" : "rgba(14,42,56,0.32)",
                }}
              >
                {c.nombre}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de productos */}
      {filtered.length === 0 ? (
        <p
          className="rounded-[4px] border border-dashed py-6 text-center text-sm italic"
          style={{ borderColor: "rgba(14,42,56,0.32)", color: "#8AA3AD", background: "#F8F2E2" }}
        >
          Sin resultados{search ? ` para "${search}"` : ""}.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p, i) => {
            const snap = snapshots?.[p.id];
            const minPermitido = snap?.alquilado ?? 0;
            const current = qty[p.id] ?? 0;
            const tooLow = snap ? current < minPermitido : false;
            const hasQty = current > 0;

            return (
              <article
                key={p.id}
                className="bt-anim-rise rounded-[4px] border transition-colors"
                style={{
                  ["--i" as never]: i,
                  background: hasQty ? "#FFFDF8" : "#F8F2E2",
                  borderColor: hasQty ? "rgba(14,42,56,0.32)" : "rgba(14,42,56,0.12)",
                  boxShadow: hasQty ? "0 1px 0 rgba(14,42,56,0.06)" : "none",
                }}
              >
                <div className="flex items-center gap-3 p-3">
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate text-[15px] font-semibold"
                      style={{ color: "#0E2A38" }}
                    >
                      {p.nombre}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="bt-mono text-[11px]"
                        style={{ color: "#4B6B78" }}
                      >
                        {p.precio.toFixed(2)}€
                      </span>
                      {snap && (
                        <>
                          <span style={{ color: "rgba(14,42,56,0.18)" }}>·</span>
                          <span
                            className="bt-mono text-[10px] uppercase tracking-[0.12em]"
                            style={{ color: "#8AA3AD" }}
                          >
                            {snap.disponible} disp · {snap.alquilado} alq
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-0">
                    <button
                      type="button"
                      onClick={() =>
                        setQty((q) => ({
                          ...q,
                          [p.id]: Math.max(0, (q[p.id] ?? 0) - 1),
                        }))
                      }
                      aria-label="Quitar uno"
                      className="flex h-10 w-10 items-center justify-center rounded-l-[4px] border transition-colors active:scale-95"
                      style={{
                        background: "#FFFDF8",
                        borderColor: "rgba(14,42,56,0.32)",
                        color: current === 0 ? "#8AA3AD" : "#0E2A38",
                      }}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span
                      className="bt-mono flex h-10 w-12 items-center justify-center border-y text-lg font-bold"
                      style={{
                        borderColor: "rgba(14,42,56,0.32)",
                        background: hasQty ? "#fff" : "#F8F2E2",
                        color: hasQty ? "#0E2A38" : "#8AA3AD",
                      }}
                    >
                      {current}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQty((q) => ({ ...q, [p.id]: (q[p.id] ?? 0) + 1 }))
                      }
                      aria-label="Añadir uno"
                      className="flex h-10 w-10 items-center justify-center rounded-r-[4px] border transition-colors active:scale-95"
                      style={{
                        background: "#0A6E9E",
                        borderColor: "#075578",
                        color: "#fff",
                      }}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  <input
                    type="hidden"
                    name="items"
                    value={JSON.stringify({
                      product_id: p.id,
                      cantidad: current,
                    })}
                  />
                </div>

                {tooLow && (
                  <div
                    className="bt-mono border-t px-3 py-1.5 text-[10px] uppercase tracking-[0.12em]"
                    style={{
                      borderColor: "rgba(255,118,87,0.3)",
                      background: "rgba(255,118,87,0.08)",
                      color: "#FF7657",
                    }}
                  >
                    Mínimo {minPermitido} (ya alquilado)
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Todos los hidden inputs para productos no visibles */}
      {products.filter((p) => !filtered.includes(p)).map((p) => (
        <input
          key={p.id}
          type="hidden"
          name="items"
          value={JSON.stringify({
            product_id: p.id,
            cantidad: qty[p.id] ?? 0,
          })}
        />
      ))}

      {/* Barra fija de acción */}
      <div
        className="sticky bottom-20 z-[5] flex items-center justify-between gap-3 rounded-[4px] border p-3 md:static md:bottom-auto"
        style={{
          background: "#FFFDF8",
          borderColor: "rgba(14,42,56,0.32)",
          boxShadow: "0 -4px 16px rgba(14,42,56,0.10)",
        }}
      >
        <div className="flex flex-col">
          <span className="text-sm font-semibold" style={{ color: "#0E2A38" }}>
            {total} uds
          </span>
          <span
            className="bt-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#8AA3AD" }}
          >
            {withStock} productos
          </span>
        </div>
        <button
          type="submit"
          disabled={pending || (!emptyAllowed && total === 0)}
          className="bt-stencil rounded-[4px] border px-5 py-2.5 text-[11px] transition-colors disabled:opacity-50"
          style={{
            background: "#0E2A38",
            borderColor: "#0E2A38",
            color: "#F2EDE0",
          }}
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
