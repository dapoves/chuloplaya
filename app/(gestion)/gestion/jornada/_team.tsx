"use client";

import { useEffect, useState, useTransition } from "react";
import { LogIn, LogOut } from "lucide-react";
import { toast } from "sonner";

import { createRealtimeClient } from "@/lib/supabase/realtime";

import { joinShift, leaveShift } from "./actions";

export type Participant = {
  colaborador_id: string;
  display_name: string | null;
  joined_at: string;
  last_seen_at: string;
  left_at: string | null;
};

const ACTIVE_THRESHOLD_MS = 90 * 1000;

function isOnline(p: Participant): boolean {
  if (p.left_at) return false;
  return Date.now() - new Date(p.last_seen_at).getTime() < ACTIVE_THRESHOLD_MS;
}

function nameInitial(p: Participant): string {
  const n = p.display_name?.trim();
  if (n) return n[0]!.toUpperCase();
  return "?";
}

export function TeamPanel({
  shiftId,
  userId,
  initialParticipants,
}: {
  shiftId: string;
  userId: string;
  initialParticipants: Participant[];
}) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [, setTick] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: ReturnType<Awaited<ReturnType<typeof createRealtimeClient>>["channel"]> | null = null;

    (async () => {
      const supabase = await createRealtimeClient();
      if (cancelled) return;

      channel = supabase
        .channel(`shift_participants:${shiftId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "shift_participants",
            filter: `shift_id=eq.${shiftId}`,
          },
          async () => {
            const { data } = await supabase
              .from("shift_participants")
              .select(
                "colaborador_id, joined_at, last_seen_at, left_at, profiles!shift_participants_colaborador_id_fkey ( display_name )"
              )
              .eq("shift_id", shiftId);

            if (!data) return;
            type Row = {
              colaborador_id: string;
              joined_at: string;
              last_seen_at: string;
              left_at: string | null;
              profiles: { display_name: string | null } | null;
            };
            const mapped = (data as unknown as Row[]).map((r) => ({
              colaborador_id: r.colaborador_id,
              joined_at: r.joined_at,
              last_seen_at: r.last_seen_at,
              left_at: r.left_at,
              display_name: r.profiles?.display_name ?? null,
            }));
            setParticipants(mapped);
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [shiftId]);

  const me = participants.find((p) => p.colaborador_id === userId);
  const soyParticipante = !!me && !me.left_at;
  const activos = participants.filter((p) => !p.left_at);

  return (
    <div
      className="flex flex-col gap-3 rounded-[4px] border p-4"
      style={{
        background: "#FFFDF8",
        borderColor: "rgba(14,42,56,0.32)",
        boxShadow: "0 1px 0 rgba(14,42,56,0.06)",
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold" style={{ color: "#0E2A38" }}>
            Equipo en jornada
          </p>
          <p
            className="bt-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: "#8AA3AD" }}
          >
            {activos.length} {activos.length === 1 ? "persona activa" : "personas activas"}
          </p>
        </div>
        {soyParticipante ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                setError(null);
                const res = await leaveShift();
                if (res?.error) {
                  setError(res.error);
                  toast.error(res.error);
                } else {
                  toast.success("Has salido de la jornada");
                }
              })
            }
            className="bt-stencil flex items-center gap-1 rounded-[4px] border px-3 py-1.5 text-[10px] transition-colors active:scale-95 disabled:opacity-50"
            style={{
              background: "#FFFDF8",
              borderColor: "rgba(14,42,56,0.32)",
              color: "#4B6B78",
            }}
          >
            <LogOut className="size-3.5" />
            Salir
          </button>
        ) : (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
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
            className="bt-stencil flex items-center gap-1 rounded-[4px] border px-3 py-1.5 text-[10px] transition-colors active:scale-95 disabled:opacity-50"
            style={{
              background: "#0E2A38",
              borderColor: "#0E2A38",
              color: "#F2EDE0",
            }}
          >
            <LogIn className="size-3.5" />
            Unirme
          </button>
        )}
      </div>

      {activos.length === 0 ? (
        <p className="text-sm italic" style={{ color: "#8AA3AD" }}>
          Nadie está activo ahora. Únete para empezar.
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {activos.map((p) => {
            const online = isOnline(p);
            const isMe = p.colaborador_id === userId;
            return (
              <div
                key={p.colaborador_id}
                className="flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{
                  background: isMe ? "rgba(10,110,158,0.08)" : "#F8F2E2",
                  borderColor: isMe ? "#0A6E9E" : "rgba(14,42,56,0.12)",
                }}
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-full text-xs font-bold"
                  style={{
                    background: "#0E2A38",
                    color: "#F2EDE0",
                  }}
                >
                  {nameInitial(p)}
                </span>
                <span className="text-sm" style={{ color: "#0E2A38" }}>
                  {p.display_name || "Colaborador"}
                  {isMe ? " (tú)" : ""}
                </span>
                <span
                  className="size-2 rounded-full"
                  style={{
                    background: online ? "#1F8A55" : "rgba(14,42,56,0.2)",
                  }}
                  title={online ? "Activo ahora" : "Inactivo"}
                />
              </div>
            );
          })}
        </div>
      )}

      {error ? (
        <p className="text-sm font-medium" style={{ color: "#FF7657" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
