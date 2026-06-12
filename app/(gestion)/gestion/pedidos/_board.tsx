"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  Timer,
  User,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";

import { createRealtimeClient } from "@/lib/supabase/realtime";
import type { Database } from "@/lib/types/database.types";

import { acceptOrder, setOrderStatus } from "./actions";
import { DevueltoModal } from "./_devuelto-modal";
import { RejectModal } from "./_reject-modal";

type ItemStatus = Database["public"]["Enums"]["item_status"];

export type PedidoItem = {
  id: string;
  cantidad: number;
  estado: ItemStatus;
  hora_devolucion: string | null;
  created_at: string;
  updated_at: string;
  colaborador_asignado_id: string | null;
  product: { id: string; nombre: string; precio: number } | null;
  order: {
    id: string;
    ubicacion_lat: number | null;
    ubicacion_lng: number | null;
    ubicacion_texto: string | null;
    created_at: string;
    cliente: {
      id: string;
      phone: string | null;
      display_name: string | null;
      is_fraudulent: boolean;
    } | null;
  } | null;
  colaborador: { id: string; display_name: string | null } | null;
  cliente_email: string | null;
};

type PedidoGroup = {
  orderId: string;
  cliente: PedidoItem["order"] extends infer T
    ? T extends { cliente: infer C }
      ? C
      : never
    : never;
  email: string | null;
  ubicacion: {
    lat: number | null;
    lng: number | null;
    texto: string | null;
  };
  receivedAt: string;
  items: PedidoItem[];
  asignados: { id: string; display_name: string | null }[];
};

const STATUS_LABEL: Record<ItemStatus, string> = {
  enviado: "Nuevo",
  aceptado: "Aceptado",
  en_camino: "En camino",
  entregado: "Entregado",
  pendiente_devolucion: "Recogida",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
};

const STATUS_CHIP: Record<ItemStatus, string> = {
  enviado: "bt-chip bt-chip-accent",
  aceptado: "bt-chip bt-chip-primary",
  en_camino: "bt-chip bt-chip-primary",
  entregado: "bt-chip bt-chip-success",
  pendiente_devolucion: "bt-chip bt-chip-coral",
  devuelto: "bt-chip bt-chip-muted",
  cancelado: "bt-chip bt-chip-coral",
};

function nextStatus(
  current: ItemStatus
): { label: string; next: ItemStatus } | null {
  switch (current) {
    case "aceptado":
      return { label: "En camino", next: "en_camino" };
    case "en_camino":
      return { label: "Marcar entregado", next: "entregado" };
    default:
      return null;
  }
}

function formatPrice(amount: number): string {
  return amount % 1 === 0 ? `${amount}€` : `${amount.toFixed(2)}€`;
}

function formatHoraDevolucion(raw: string): string {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) {
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  }
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return raw;
}

function isDevolucionPast(raw: string): boolean {
  const d = new Date(raw);
  if (!isNaN(d.getTime())) return d.getTime() < Date.now();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (match) {
    const now = new Date();
    const target = new Date();
    target.setHours(Number(match[1]), Number(match[2]), 0, 0);
    return now > target;
  }
  return false;
}

function formatElapsed(fromISO: string): string {
  const diffMs = Date.now() - new Date(fromISO).getTime();
  const mins = Math.max(0, Math.floor(diffMs / 60000));
  if (mins < 1) return "ahora";
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function folioFromId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

function groupItems(items: PedidoItem[]): PedidoGroup[] {
  const map = new Map<string, PedidoGroup>();
  for (const it of items) {
    if (!it.order) continue;
    const key = it.order.id;
    if (!map.has(key)) {
      map.set(key, {
        orderId: key,
        cliente: it.order.cliente,
        email: it.cliente_email,
        ubicacion: {
          lat: it.order.ubicacion_lat,
          lng: it.order.ubicacion_lng,
          texto: it.order.ubicacion_texto,
        },
        receivedAt: it.order.created_at,
        items: [],
        asignados: [],
      });
    }
    const g = map.get(key)!;
    g.items.push(it);
    if (it.colaborador && !g.asignados.some((a) => a.id === it.colaborador!.id)) {
      g.asignados.push(it.colaborador);
    }
  }
  for (const g of map.values()) {
    g.items.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return [...map.values()].sort((a, b) =>
    a.receivedAt.localeCompare(b.receivedAt)
  );
}

export function PedidosBoard({
  initialItems,
  userId,
  myOrdersTotal,
}: {
  initialItems: PedidoItem[];
  userId: string;
  myOrdersTotal: number;
}) {
  const [items, setItems] = useState<PedidoItem[]>(initialItems);
  const [sound, setSound] = useState(true);
  const knownOrderIds = useRef<Set<string>>(new Set(initialItems.map((i) => i.order?.id ?? "")));
  const [, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem("chuloplaya.gestion.pedidos.sound");
    if (stored === "off") setSound(false);
  }, []);
  useEffect(() => {
    window.localStorage.setItem(
      "chuloplaya.gestion.pedidos.sound",
      sound ? "on" : "off"
    );
  }, [sound]);

  function beep() {
    if (!sound) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.value = 0.1;
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 220);
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    let active = true;
    let cleanup: (() => void) | null = null;

    (async () => {
      const supabase = await createRealtimeClient();
      if (!active) return;
      const ch = supabase
        .channel("order_items_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "order_items" },
          async (payload) => {
            const id =
              (payload.new as { id?: string })?.id ??
              (payload.old as { id?: string })?.id;
            if (!id) return;

            if (payload.eventType === "DELETE") {
              setItems((cur) => cur.filter((x) => x.id !== id));
              return;
            }

            const { data } = await supabase
              .from("order_items")
              .select(
                `id, cantidad, estado, hora_devolucion, created_at, updated_at, colaborador_asignado_id,
                 product:products(id, nombre, precio),
                 order:orders!inner(
                   id, ubicacion_lat, ubicacion_lng, ubicacion_texto, created_at,
                   cliente:profiles(id, phone, display_name, is_fraudulent)
                 ),
                 colaborador:profiles!order_items_colaborador_asignado_id_fkey(id, display_name)`
              )
              .eq("id", id)
              .single();

            if (!data) return;
            const row = { ...data, cliente_email: null } as PedidoItem;

            const orderId = row.order?.id;
            if (
              payload.eventType === "INSERT" &&
              row.estado === "enviado" &&
              orderId &&
              !knownOrderIds.current.has(orderId)
            ) {
              knownOrderIds.current.add(orderId);
              beep();
              try {
                document.title = "🔔 " + document.title.replace(/^🔔 /, "");
              } catch {}
            }

            setItems((cur) => {
              const exists = cur.some((x) => x.id === id);
              return exists
                ? cur.map((x) => (x.id === id ? row : x))
                : [...cur, row];
            });
          }
        )
        .subscribe();
      cleanup = () => {
        supabase.removeChannel(ch);
      };
    })();

    return () => {
      active = false;
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const groups = useMemo(() => groupItems(items), [items]);

  const entrantes = useMemo(
    () =>
      groups.filter((g) =>
        g.items.every(
          (i) => i.estado === "enviado" && !i.colaborador_asignado_id
        )
      ),
    [groups]
  );
  const mios = useMemo(
    () =>
      groups.filter((g) =>
        g.items.some(
          (i) =>
            i.colaborador_asignado_id === userId &&
            ["aceptado", "en_camino", "entregado", "pendiente_devolucion"].includes(i.estado)
        )
      ),
    [groups, userId]
  );
  const equipo = useMemo(
    () =>
      groups.filter((g) => {
        if (entrantes.includes(g)) return false;
        if (mios.includes(g)) return false;
        return g.items.some(
          (i) =>
            i.colaborador_asignado_id &&
            i.colaborador_asignado_id !== userId &&
            ["aceptado", "en_camino", "entregado", "pendiente_devolucion"].includes(i.estado)
        );
      }),
    [groups, entrantes, mios, userId]
  );

  const pendientesRecogida = useMemo(
    () =>
      groups.filter((g) =>
        g.items.some((i) => i.estado === "pendiente_devolucion")
      ),
    [groups]
  );

  const [showPendientes, setShowPendientes] = useState(false);

  const entregadosHoy = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const orderIds = new Set<string>();
    for (const it of items) {
      if (
        it.estado === "entregado" &&
        it.order?.id &&
        it.updated_at.slice(0, 10) === today
      ) {
        orderIds.add(it.order.id);
      }
    }
    return orderIds.size;
  }, [items]);

  return (
    <div className="flex flex-col gap-8">
      {/* Encabezado de página */}
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="bt-mono text-[10px] uppercase tracking-[0.32em] text-[color:var(--bt-ink-faint)]">
            Cuaderno · 02
          </p>
          <h1 className="bt-display mt-1 text-3xl md:text-4xl text-[color:var(--bt-ink)]">
            Tablero de pedidos
          </h1>
        </div>
        <div className="hidden md:block bt-rule w-32" />
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiStat
          label="Mis pedidos"
          value={myOrdersTotal}
          tone="primary"
          href="/gestion/pedidos/mios"
          hint="historial"
        />
        <KpiStat
          label="Entrantes"
          value={entrantes.length}
          tone="accent"
          hint={entrantes.length > 0 ? "nuevos" : "ninguno"}
          pulse={entrantes.length > 0}
        />
        <KpiStat
          label="Recogidas"
          value={pendientesRecogida.length}
          tone="coral"
          hint={showPendientes ? "ocultar" : "ver pedidos"}
          onClick={() => setShowPendientes((s) => !s)}
        />
        <KpiStat
          label="Entregados hoy"
          value={entregadosHoy}
          tone="success"
        />
      </div>

      {/* Acciones */}
      <div className="flex items-center justify-between">
        <Link
          href="/gestion/pedidos/colaboradores"
          className="bt-stencil inline-flex items-center gap-1.5 rounded-[3px] border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] px-3 py-1.5 text-[10px] text-[color:var(--bt-ink)] transition-colors hover:bg-[color:var(--bt-ink)] hover:text-[color:var(--bt-paper)]"
        >
          <Users className="size-3.5" />
          Colaboradores
        </Link>
        <button
          type="button"
          onClick={() => setSound((s) => !s)}
          aria-label={sound ? "Silenciar" : "Activar sonido"}
          className="bt-stencil inline-flex items-center gap-1.5 rounded-[3px] border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] px-3 py-1.5 text-[10px] text-[color:var(--bt-ink)] transition-colors hover:bg-[color:var(--bt-ink)] hover:text-[color:var(--bt-paper)]"
        >
          {sound ? <Volume2 className="size-3.5" /> : <VolumeX className="size-3.5" />}
          {sound ? "Sonido" : "Silenciado"}
        </button>
      </div>

      {showPendientes && (
        <Column
          index="*"
          title="Pendientes de recogida"
          badge={pendientesRecogida.length}
          empty="No hay pedidos pendientes de recogida."
        >
          {pendientesRecogida.map((g, i) => (
            <PedidoCard
              key={g.orderId}
              i={i}
              group={g}
              mode="recogida"
              userId={userId}
            />
          ))}
        </Column>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Column
          index="A"
          title="Mis pedidos en curso"
          badge={mios.length}
          empty="No tienes pedidos en curso."
        >
          {mios.map((g, i) => (
            <PedidoCard key={g.orderId} i={i} group={g} mode="mio" userId={userId} />
          ))}
        </Column>

        <Column
          index="B"
          title="Entrantes"
          badge={entrantes.length}
          empty="No hay pedidos nuevos."
          highlight
        >
          {entrantes.map((g, i) => (
            <PedidoCard key={g.orderId} i={i} group={g} mode="entrante" userId={userId} />
          ))}
        </Column>

        <Column
          index="C"
          title="Equipo"
          badge={equipo.length}
          empty="El equipo no tiene pedidos activos."
        >
          {equipo.map((g, i) => (
            <PedidoCard key={g.orderId} i={i} group={g} mode="equipo" userId={userId} />
          ))}
        </Column>
      </div>
    </div>
  );
}

function KpiStat({
  label,
  value,
  tone,
  href,
  hint,
  onClick,
  pulse,
}: {
  label: string;
  value: number;
  tone: "primary" | "accent" | "coral" | "success";
  href?: string;
  hint?: string;
  onClick?: () => void;
  pulse?: boolean;
}) {
  const toneBar: Record<typeof tone, string> = {
    primary: "bg-[color:var(--bt-primary)]",
    accent: "bg-[color:var(--bt-accent)]",
    coral: "bg-[color:var(--bt-coral)]",
    success: "bg-[color:var(--bt-success)]",
  };
  const toneText: Record<typeof tone, string> = {
    primary: "text-[color:var(--bt-primary-deep)]",
    accent: "text-[color:var(--bt-ink)]",
    coral: "text-[color:var(--bt-coral)]",
    success: "text-[color:var(--bt-success)]",
  };

  const inner = (
    <div className="relative flex h-full items-stretch gap-3 overflow-hidden bg-[color:var(--bt-card)] p-4">
      <span className={`absolute left-0 top-0 h-full w-[3px] ${toneBar[tone]}`} />
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="bt-stencil text-[10px] text-[color:var(--bt-ink-soft)]">
            {label}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span
            className={`bt-mono text-4xl font-bold leading-none ${toneText[tone]} ${
              pulse ? "bt-anim-pulse" : ""
            }`}
          >
            {value.toString().padStart(2, "0")}
          </span>
          {hint ? (
            <span className="bt-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--bt-ink-faint)]">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );

  const wrap =
    "block border border-[color:var(--bt-line-strong)] rounded-[4px] shadow-[0_1px_0_var(--bt-line)] transition-transform hover:-translate-y-[1px]";

  if (href) {
    return (
      <Link href={href} className={wrap}>
        {inner}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${wrap} text-left w-full cursor-pointer`}>
        {inner}
      </button>
    );
  }
  return <div className={wrap}>{inner}</div>;
}

function Column({
  index,
  title,
  badge,
  empty,
  highlight,
  children,
}: {
  index: string;
  title: string;
  badge: number;
  empty: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  const empty_ = Array.isArray(children)
    ? (children as React.ReactNode[]).length === 0
    : !children;
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="bt-mono text-[11px] tracking-[0.22em] text-[color:var(--bt-ink-faint)]">
          {index}
        </span>
        <h2 className="bt-display text-lg text-[color:var(--bt-ink)]">{title}</h2>
        <span
          className={
            highlight && badge > 0
              ? "bt-mono ml-auto rounded-full bg-[color:var(--bt-accent)] px-2 py-0.5 text-[11px] text-[color:var(--bt-ink)]"
              : "bt-mono ml-auto rounded-full border border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card)] px-2 py-0.5 text-[11px] text-[color:var(--bt-ink)]"
          }
        >
          {badge.toString().padStart(2, "0")}
        </span>
      </div>
      <div className="bt-rule" />
      {empty_ ? (
        <p className="rounded-[4px] border border-dashed border-[color:var(--bt-line-strong)] bg-[color:var(--bt-card-alt)] p-4 text-sm italic text-[color:var(--bt-ink-soft)]">
          {empty}
        </p>
      ) : (
        <div className="flex flex-col gap-5">{children}</div>
      )}
    </section>
  );
}

function PedidoCard({
  group,
  mode,
  userId,
  i,
}: {
  group: PedidoGroup;
  mode: "entrante" | "mio" | "equipo" | "recogida";
  userId: string;
  i: number;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [devueltoOpen, setDevueltoOpen] = useState(false);

  const cliente = group.cliente;
  const mapsUrl =
    group.ubicacion.lat && group.ubicacion.lng
      ? `https://www.google.com/maps?q=${group.ubicacion.lat},${group.ubicacion.lng}`
      : null;

  return (
    <article
      className="bt-card bt-anim-rise"
      style={{ ["--i" as never]: i }}
    >
      <span className="bt-folio">Folio · {folioFromId(group.orderId)}</span>
      <div className="relative flex flex-col gap-4 p-5">
        {/* Cabecera cliente */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <User className="size-4 text-[color:var(--bt-ink-soft)]" />
              <span className="bt-display truncate text-base text-[color:var(--bt-ink)]">
                {cliente?.display_name || "Cliente sin cuenta"}
              </span>
              {cliente?.is_fraudulent ? (
                <span className="bt-chip bt-chip-coral">
                  <ShieldAlert className="size-3" /> Fraude
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5 bt-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--bt-ink-faint)]">
              <Timer className="size-3" />
              <span>recibido hace {formatElapsed(group.receivedAt)}</span>
            </div>
          </div>
          {(mode === "equipo" || mode === "recogida") && group.asignados.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1">
              {group.asignados.map((a) => (
                <span key={a.id} className="bt-chip bt-chip-muted">
                  {a.display_name || "?"}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {(() => {
          const devItem = group.items.find(
            (i) => i.hora_devolucion && (i.estado === "entregado" || i.estado === "pendiente_devolucion")
          );
          if (!devItem?.hora_devolucion) return null;
          const hora = formatHoraDevolucion(devItem.hora_devolucion);
          const isPast = isDevolucionPast(devItem.hora_devolucion);
          return (
            <div
              className={`flex items-center gap-2 rounded-[3px] border px-3 py-2 text-sm font-semibold ${
                isPast
                  ? "border-[color:var(--bt-coral)] bg-[color:var(--bt-coral-14)] text-[color:var(--bt-coral)]"
                  : "border-[color:var(--bt-accent)] bg-[color:var(--bt-accent-18)] text-[color:var(--bt-ink)]"
              }`}
            >
              <Clock className="size-4" />
              <span className="bt-mono uppercase tracking-[0.18em] text-[11px]">
                Devolución
              </span>
              <span className="bt-mono text-base">{hora}</span>
              {isPast ? (
                <span className="bt-mono text-[10px] uppercase tracking-[0.22em]">
                  · ¡pasada!
                </span>
              ) : null}
            </div>
          );
        })()}

        {/* Items */}
        <div className="flex flex-col gap-1">
          <ul className="flex flex-col gap-1.5">
            {group.items.map((it) => {
              const subtotal = (it.product?.precio ?? 0) * it.cantidad;
              return (
                <li
                  key={it.id}
                  className="flex items-center justify-between gap-2 rounded-[3px] border border-[color:var(--bt-line)] bg-[color:var(--bt-card-alt)]/60 px-3 py-2"
                >
                  <div className="flex items-center gap-2 text-sm min-w-0">
                    <span className="bt-mono w-8 shrink-0 text-right text-[color:var(--bt-ink)] font-semibold">
                      ×{it.cantidad}
                    </span>
                    <span className="truncate text-[color:var(--bt-ink)]">{it.product?.nombre ?? "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="bt-mono text-[11px] tabular-nums text-[color:var(--bt-ink-soft)]">
                      {formatPrice(subtotal)}
                    </span>
                    <span className={STATUS_CHIP[it.estado]}>{STATUS_LABEL[it.estado]}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          {(() => {
            const total = group.items.reduce(
              (acc, it) => acc + (it.product?.precio ?? 0) * it.cantidad,
              0
            );
            return (
              <div className="flex items-center justify-end gap-2 border-t border-[color:var(--bt-line)] pt-2">
                <span className="bt-stencil text-[10px] uppercase tracking-[0.18em] text-[color:var(--bt-ink-faint)]">
                  Total
                </span>
                <span className="bt-mono text-sm font-bold tabular-nums text-[color:var(--bt-ink)]">
                  {formatPrice(total)}
                </span>
              </div>
            );
          })()}
        </div>

        {/* CTA por modo */}
        {mode === "mio" && (() => {
          const STATUS_RANK: Record<typeof group.items[number]["estado"], number> = {
            enviado: 0, aceptado: 1, en_camino: 2, entregado: 3,
            pendiente_devolucion: 4, devuelto: 5, cancelado: 6,
          };
          const active = group.items.filter(
            (i) => i.colaborador_asignado_id === userId && i.estado !== "cancelado" && i.estado !== "devuelto"
          );
          if (active.length === 0) return null;
          const minEstado = active.reduce((min, it) =>
            STATUS_RANK[it.estado] < STATUS_RANK[min] ? it.estado : min,
            active[0].estado
          );

          if (minEstado === "entregado" || minEstado === "pendiente_devolucion") {
            return (
              <BitacoraButton tone="ink" onClick={() => setDevueltoOpen(true)}>
                Marcar devuelto
              </BitacoraButton>
            );
          }

          const groupNext = nextStatus(minEstado);
          if (!groupNext) return null;
          return (
            <BitacoraButton
              tone="ink"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  const res = await setOrderStatus(group.orderId, groupNext.next);
                  if (res.error) {
                    setError(res.error);
                    toast.error(res.error);
                  } else {
                    toast.success(`Pedido marcado como ${groupNext.label.toLowerCase()}`);
                  }
                })
              }
            >
              {groupNext.label}
            </BitacoraButton>
          );
        })()}

        {/* Info contacto */}
        {(group.ubicacion.texto || mapsUrl || cliente?.phone || group.email) && (
          <div className="flex flex-col gap-1.5 rounded-[3px] border border-[color:var(--bt-line)] bg-[color:var(--bt-paper)] p-3 text-sm">
            {group.ubicacion.texto ? (
              <div className="flex items-center gap-2 text-[color:var(--bt-ink)]">
                <MapPin className="size-4 shrink-0 text-[color:var(--bt-ink-soft)]" />
                <span>{group.ubicacion.texto}</span>
              </div>
            ) : null}
            {mapsUrl ? (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener"
                className="flex items-center gap-2 font-semibold text-[color:var(--bt-primary)] underline-offset-2 hover:underline"
              >
                <MapPin className="size-4 shrink-0" />
                Abrir GPS en mapa
              </a>
            ) : null}
            {cliente?.phone ? (
              <a
                href={`tel:${cliente.phone}`}
                className="flex items-center gap-2 font-semibold text-[color:var(--bt-primary)] underline-offset-2 hover:underline"
              >
                <Phone className="size-4 shrink-0" />
                {cliente.phone}
              </a>
            ) : null}
            {group.email ? (
              <div className="flex items-center gap-2 text-[color:var(--bt-ink-soft)]">
                <Mail className="size-4 shrink-0" />
                <span className="truncate">{group.email}</span>
              </div>
            ) : null}
          </div>
        )}

        {error ? (
          <p className="text-sm font-medium text-[color:var(--bt-coral)]">{error}</p>
        ) : null}

        {mode === "entrante" ? (
          <div className="flex gap-2">
            <BitacoraButton
              tone="accent"
              className="flex-1"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  setError(null);
                  const res = await acceptOrder(group.orderId);
                  if (res.error) {
                    setError(res.error);
                    toast.error(res.error);
                  } else {
                    toast.success("Pedido aceptado");
                  }
                })
              }
            >
              {pending
                ? "Aceptando…"
                : `Aceptar pedido (${group.items.length} ud${group.items.length === 1 ? "" : "s"})`}
            </BitacoraButton>
            <BitacoraButton
              tone="coral"
              disabled={pending}
              onClick={() => setRejectOpen(true)}
            >
              Rechazar
            </BitacoraButton>
          </div>
        ) : null}

        {mode === "recogida" && (() => {
          const pendientes = group.items.filter(
            (i) => i.estado === "pendiente_devolucion" && i.colaborador_asignado_id === userId
          );
          if (pendientes.length === 0) return null;
          return (
            <BitacoraButton tone="ink" onClick={() => setDevueltoOpen(true)}>
              Marcar devuelto
            </BitacoraButton>
          );
        })()}

        {mode === "mio" ? (
          <button
            type="button"
            className="self-end bt-stencil text-[10px] text-[color:var(--bt-coral)] underline-offset-2 hover:underline disabled:opacity-50"
            disabled={pending}
            onClick={() => setRejectOpen(true)}
          >
            Rechazar pedido
          </button>
        ) : null}

        <RejectModal
          orderId={group.orderId}
          open={rejectOpen}
          onClose={() => setRejectOpen(false)}
        />
        <DevueltoModal
          orderId={group.orderId}
          open={devueltoOpen}
          onClose={() => setDevueltoOpen(false)}
        />
      </div>
    </article>
  );
}

function BitacoraButton({
  tone,
  children,
  className = "",
  disabled,
  onClick,
}: {
  tone: "ink" | "accent" | "coral";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const styles: Record<typeof tone, string> = {
    ink: "bg-[color:var(--bt-ink)] text-[color:var(--bt-paper)] border-[color:var(--bt-ink)] hover:bg-[color:var(--bt-primary-deep)]",
    accent:
      "bg-[color:var(--bt-accent)] text-[color:var(--bt-ink)] border-[color:var(--bt-ink)] hover:bg-[color:var(--bt-ink)] hover:text-[color:var(--bt-accent)]",
    coral:
      "bg-[color:var(--bt-card)] text-[color:var(--bt-coral)] border-[color:var(--bt-coral)] hover:bg-[color:var(--bt-coral)] hover:text-[color:var(--bt-card)]",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bt-stencil inline-flex items-center justify-center gap-1.5 rounded-[3px] border px-4 py-2.5 text-[11px] transition-colors disabled:opacity-60 ${styles[tone]} ${className}`}
    >
      {children}
    </button>
  );
}
