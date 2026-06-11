"use client";

import { useState } from "react";
import { CalendarClock, Copy, Package } from "lucide-react";

import { openShift } from "./actions";
import { StockForm, type Product } from "./_form";
import type { Category } from "./page";

export function OpenShiftCard({
  products,
  categories,
  initial,
  lastDateISO,
}: {
  products: Product[];
  categories: Category[];
  initial: Record<string, number>;
  lastDateISO: string | null;
}) {
  const hasInitial = Object.values(initial).some((v) => v > 0);
  const [useLast, setUseLast] = useState(hasInitial);
  const [showForm, setShowForm] = useState(false);

  const formInitial = useLast ? initial : {};

  const lastDate = lastDateISO
    ? new Date(lastDateISO + "T00:00:00").toLocaleDateString("es-ES", {
        day: "numeric",
        month: "long",
      })
    : null;

  const totalLast = Object.values(initial).reduce((a, b) => a + b, 0);
  const productsWithStock = Object.values(initial).filter((v) => v > 0).length;

  if (!showForm) {
    return (
      <div className="flex flex-col gap-3">
        {/* CTA principal */}
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="group flex items-center gap-4 rounded-[4px] border p-5 text-left transition-colors active:scale-[0.98]"
          style={{
            background: "#0E2A38",
            borderColor: "#0E2A38",
            color: "#F2EDE0",
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(255,194,60,0.2)" }}
          >
            <Package className="size-6" style={{ color: "#FFC23C" }} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="bt-display text-lg">Abrir jornada</span>
            <p className="mt-0.5 text-sm" style={{ color: "rgba(242,237,224,0.7)" }}>
              Carga el stock del día para empezar a recibir pedidos.
            </p>
          </div>
        </button>

        {/* Shortcut: última jornada */}
        {hasInitial && lastDate && (
          <div
            className="flex items-center gap-3 rounded-[4px] border p-4"
            style={{
              background: "#FFFDF8",
              borderColor: "rgba(14,42,56,0.32)",
            }}
          >
            <CalendarClock className="size-5 shrink-0" style={{ color: "#0A6E9E" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#0E2A38" }}>
                Última jornada: {lastDate}
              </p>
              <p
                className="bt-mono text-[10px] uppercase tracking-[0.12em]"
                style={{ color: "#8AA3AD" }}
              >
                {productsWithStock} productos · {totalLast} uds
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setUseLast(true); setShowForm(true); }}
              className="bt-stencil flex items-center gap-1 rounded-[4px] border px-3 py-2 text-[10px] transition-colors active:scale-95"
              style={{
                background: "#0A6E9E",
                borderColor: "#075578",
                color: "#fff",
              }}
            >
              <Copy className="size-3.5" />
              Copiar stock
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Toggle usar stock anterior */}
      {hasInitial && lastDate && (
        <div
          className="flex items-center justify-between gap-3 rounded-[4px] border p-3"
          style={{
            background: useLast ? "rgba(10,110,158,0.08)" : "#FFFDF8",
            borderColor: useLast ? "#0A6E9E" : "rgba(14,42,56,0.32)",
          }}
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#0E2A38" }}>
              Stock del {lastDate}
            </p>
            <p
              className="bt-mono text-[10px] uppercase tracking-[0.12em]"
              style={{ color: "#8AA3AD" }}
            >
              {productsWithStock} productos · {totalLast} uds
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUseLast((v) => !v)}
            className="bt-stencil shrink-0 rounded-[4px] border px-3 py-2 text-[10px] transition-colors"
            style={{
              background: useLast ? "#0A6E9E" : "#FFFDF8",
              color: useLast ? "#fff" : "#4B6B78",
              borderColor: useLast ? "#075578" : "rgba(14,42,56,0.32)",
            }}
          >
            {useLast ? "Activado" : "Usar"}
          </button>
        </div>
      )}

      <StockForm
        key={useLast ? "last" : "empty"}
        products={products}
        categories={categories}
        initial={formInitial}
        action={openShift}
        submitLabel="Abrir jornada"
      />
    </div>
  );
}
