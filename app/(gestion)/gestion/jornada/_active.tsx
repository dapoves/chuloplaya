"use client";

import { useState, useTransition } from "react";
import { Clock, LogIn, X as XIcon } from "lucide-react";
import { toast } from "sonner";

import { closeShift, joinShift, updateShiftStock } from "./actions";
import { StockForm, type Product, type StockSnapshot } from "./_form";
import { Heartbeat } from "./_heartbeat";
import { TeamPanel, type Participant } from "./_team";
import type { Category } from "./page";

export function JornadaActiva({
  shiftId,
  horaInicio,
  abiertaPor,
  products,
  categories,
  stockMap,
  snapshots,
  participants,
  userId,
}: {
  shiftId: string;
  horaInicio: string;
  abiertaPor: string | null;
  products: Product[];
  categories: Category[];
  stockMap: Record<string, number>;
  snapshots: Record<string, StockSnapshot>;
  participants: Participant[];
  userId: string;
}) {
  const [pending, start] = useTransition();
  const [joinPending, startJoin] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hora = new Date(horaInicio).toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const me = participants.find((p) => p.colaborador_id === userId);
  const soyParticipante = !!me && !me.left_at;

  return (
    <div className="flex flex-col gap-5">
      {soyParticipante ? <Heartbeat /> : null}

      {/* Banner jornada activa */}
      <div
        className="flex items-center justify-between gap-3 rounded-[4px] border p-4"
        style={{
          background: "rgba(10,110,158,0.08)",
          borderColor: "#0A6E9E",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "rgba(10,110,158,0.15)" }}
          >
            <Clock className="size-5" style={{ color: "#0A6E9E" }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold" style={{ color: "#0E2A38" }}>
              Jornada abierta a las {hora}
            </p>
            <p
              className="bt-mono text-[10px] uppercase tracking-[0.12em] truncate"
              style={{ color: "#8AA3AD" }}
            >
              {abiertaPor ? `Por ${abiertaPor}` : "Stock compartido"}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              if (!confirm("¿Cerrar la jornada para todo el equipo?")) return;
              setError(null);
              const res = await closeShift(shiftId);
              if (res?.error) {
                setError(res.error);
                toast.error(res.error);
              } else {
                toast.success("Jornada cerrada");
              }
            })
          }
          className="bt-stencil flex shrink-0 items-center gap-1 rounded-[4px] border px-3 py-2 text-[10px] transition-colors active:scale-95 disabled:opacity-50"
          style={{
            background: "#FFFDF8",
            borderColor: "#FF7657",
            color: "#FF7657",
          }}
        >
          <XIcon className="size-3.5" />
          {pending ? "Cerrando…" : "Cerrar"}
        </button>
      </div>

      {/* Equipo */}
      <TeamPanel
        shiftId={shiftId}
        userId={userId}
        initialParticipants={participants}
      />

      {error ? (
        <p className="text-sm font-medium" style={{ color: "#FF7657" }}>
          {error}
        </p>
      ) : null}

      {/* Stock o unirse */}
      {soyParticipante ? (
        <StockForm
          products={products}
          categories={categories}
          initial={stockMap}
          snapshots={snapshots}
          action={updateShiftStock}
          submitLabel="Guardar stock"
          emptyAllowed
        />
      ) : (
        <div
          className="flex flex-col items-center gap-4 rounded-[4px] border border-dashed py-8 text-center"
          style={{
            borderColor: "rgba(14,42,56,0.32)",
            background: "#F8F2E2",
          }}
        >
          <p className="text-sm" style={{ color: "#4B6B78" }}>
            Únete a la jornada para modificar stock y aceptar pedidos.
          </p>
          <button
            type="button"
            disabled={joinPending}
            onClick={() =>
              startJoin(async () => {
                setError(null);
                const res = await joinShift();
                if (res?.error) {
                  setError(res.error);
                  toast.error(res.error);
                } else {
                  toast.success("Te has unido a la jornada");
                }
              })
            }
            className="bt-stencil flex items-center gap-1.5 rounded-[4px] border px-5 py-2.5 text-[11px] transition-colors disabled:opacity-50 active:scale-95"
            style={{
              background: "#0E2A38",
              borderColor: "#0E2A38",
              color: "#F2EDE0",
            }}
          >
            <LogIn className="size-4" />
            {joinPending ? "Uniéndome…" : "Unirme a la jornada"}
          </button>
        </div>
      )}
    </div>
  );
}
