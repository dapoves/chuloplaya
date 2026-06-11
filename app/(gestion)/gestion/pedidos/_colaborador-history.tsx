import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  ShieldAlert,
  User,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

const PAGE_SIZE = 20;

type ItemStatus = Database["public"]["Enums"]["item_status"];

const STATUS_LABEL: Record<ItemStatus, string> = {
  enviado: "Nuevo",
  aceptado: "Aceptado",
  en_camino: "En camino",
  entregado: "Entregado",
  pendiente_devolucion: "Recogida",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
};

const STATUS_CHIP: Record<ItemStatus, { bg: string; color: string; border: string }> = {
  enviado: { bg: "rgba(255,194,60,0.20)", color: "#0E2A38", border: "rgba(0,0,0,0.18)" },
  aceptado: { bg: "#0A6E9E", color: "#fff", border: "#075578" },
  en_camino: { bg: "#0A6E9E", color: "#fff", border: "#075578" },
  entregado: { bg: "rgba(31,138,85,0.14)", color: "#1F8A55", border: "#1F8A55" },
  pendiente_devolucion: { bg: "rgba(255,118,87,0.14)", color: "#FF7657", border: "#FF7657" },
  devuelto: { bg: "#E6DEC9", color: "#4B6B78", border: "rgba(14,42,56,0.12)" },
  cancelado: { bg: "rgba(255,118,87,0.14)", color: "#FF7657", border: "#FF7657" },
};

function folioFromId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export async function ColaboradorHistory({
  colaboradorId,
  title,
  subtitle,
  backHref,
  basePageHref,
  page,
}: {
  colaboradorId: string;
  title: string;
  subtitle: string;
  backHref: string;
  basePageHref: (p: number) => string;
  page: number;
}) {
  const supabase = await createClient();

  const { data: assignments } = await supabase
    .from("order_items")
    .select("order_id, estado, cantidad, product:products(precio)")
    .eq("colaborador_asignado_id", colaboradorId);

  const allItems = assignments ?? [];
  const uniqueOrderIds = Array.from(
    new Set(allItems.map((r) => r.order_id))
  );
  const total = uniqueOrderIds.length;

  const ordersByStatus = new Map<string, Set<ItemStatus>>();
  for (const it of allItems) {
    if (!ordersByStatus.has(it.order_id))
      ordersByStatus.set(it.order_id, new Set());
    ordersByStatus.get(it.order_id)!.add(it.estado);
  }
  let kpiEntregados = 0;
  let kpiRechazados = 0;
  for (const [, statuses] of ordersByStatus) {
    const arr = [...statuses];
    if (arr.every((s) => s === "entregado" || s === "devuelto"))
      kpiEntregados++;
    else if (arr.every((s) => s === "cancelado")) kpiRechazados++;
  }
  const kpiDinero = allItems.reduce(
    (acc, it) => acc + it.cantidad * Number(it.product?.precio ?? 0),
    0
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE;
  const pageIds = uniqueOrderIds.slice(from, from + PAGE_SIZE);

  const { data: orders } =
    pageIds.length > 0
      ? await supabase
          .from("orders")
          .select(
            `id, created_at, ubicacion_lat, ubicacion_lng, ubicacion_texto,
             motivo_cancelacion,
             cliente:profiles(id, phone, display_name, is_fraudulent),
             order_items(id, cantidad, estado, colaborador_asignado_id,
                         product:products(id, nombre))`
          )
          .in("id", pageIds)
          .order("created_at", { ascending: false })
      : { data: [] };

  return (
    <div className="flex flex-col gap-6">
      {/* Volver */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 self-start rounded-[3px] px-1 py-1 text-sm font-semibold transition-colors"
        style={{ color: "#0A6E9E" }}
      >
        <ArrowLeft className="size-4" />
        Volver
      </Link>

      {/* Header */}
      <header>
        <p
          className="bt-mono text-[10px] uppercase tracking-[0.32em]"
          style={{ color: "#8AA3AD" }}
        >
          Historial
        </p>
        <h1
          className="bt-display mt-1 text-2xl md:text-3xl"
          style={{ color: "#0E2A38" }}
        >
          {title}
        </h1>
        <p className="mt-1 text-sm" style={{ color: "#4B6B78" }}>
          {subtitle}
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-2">
        <HistoryKpi label="Pedidos" value={String(total)} bar="#0A6E9E" />
        <HistoryKpi label="Entregados" value={String(kpiEntregados)} bar="#1F8A55" />
        <HistoryKpi label="Rechazados" value={String(kpiRechazados)} bar="#FF7657" />
        <HistoryKpi label="Facturado" value={`${kpiDinero.toFixed(0)}€`} bar="#FFC23C" />
      </div>

      {/* Listado */}
      {orders && orders.length > 0 ? (
        <div className="flex flex-col gap-4">
          {orders.map((o, i) => {
            const mine = (o.order_items ?? []).filter(
              (it) => it.colaborador_asignado_id === colaboradorId
            );
            const myStatuses = new Set(mine.map((it) => it.estado));
            const isCancelled = mine.every(
              (it) => it.estado === "cancelado"
            );
            const allDelivered = mine.every(
              (it) => it.estado === "devuelto" || it.estado === "entregado"
            );
            const mapsUrl =
              o.ubicacion_lat && o.ubicacion_lng
                ? `https://www.google.com/maps?q=${o.ubicacion_lat},${o.ubicacion_lng}`
                : null;

            const statusChip = isCancelled
              ? { label: "Cancelado", bg: "rgba(255,118,87,0.14)", color: "#FF7657", border: "#FF7657" }
              : allDelivered
                ? { label: "Completado", bg: "rgba(31,138,85,0.14)", color: "#1F8A55", border: "#1F8A55" }
                : { label: "En curso", bg: "rgba(255,194,60,0.20)", color: "#0E2A38", border: "rgba(0,0,0,0.18)" };

            return (
              <article
                key={o.id}
                className="bt-card bt-anim-rise"
                style={{ ["--i" as never]: i }}
              >
                <span className="bt-folio">
                  Folio · {folioFromId(o.id)}
                </span>
                <div className="flex flex-col gap-3 p-4 pt-5">
                  {/* Cabecera */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="size-4" style={{ color: "#4B6B78" }} />
                        <span
                          className="bt-display truncate text-[15px]"
                          style={{ color: "#0E2A38" }}
                        >
                          {o.cliente?.display_name || "Sin cuenta"}
                        </span>
                        {o.cliente?.is_fraudulent ? (
                          <span
                            className="bt-chip"
                            style={{
                              background: "rgba(255,118,87,0.14)",
                              color: "#FF7657",
                              borderColor: "#FF7657",
                            }}
                          >
                            <ShieldAlert className="size-3" /> Fraude
                          </span>
                        ) : null}
                      </div>
                      <span
                        className="bt-mono text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: "#8AA3AD" }}
                      >
                        {new Date(o.created_at).toLocaleString("es-ES", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span
                        className="bt-chip"
                        style={{
                          background: statusChip.bg,
                          color: statusChip.color,
                          borderColor: statusChip.border,
                        }}
                      >
                        {statusChip.label}
                      </span>
                      <span
                        className="bt-mono text-[9px] uppercase tracking-[0.18em]"
                        style={{ color: "#8AA3AD" }}
                      >
                        {mine.length}/{o.order_items?.length ?? 0} ítems
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <ul className="flex flex-col gap-1.5">
                    {mine.map((it) => {
                      const chip = STATUS_CHIP[it.estado];
                      return (
                        <li
                          key={it.id}
                          className="flex items-center justify-between gap-2 rounded-[3px] border px-3 py-2"
                          style={{
                            borderColor: "rgba(14,42,56,0.12)",
                            background: "rgba(248,242,226,0.6)",
                          }}
                        >
                          <div className="flex items-center gap-2 text-sm min-w-0">
                            <span
                              className="bt-mono shrink-0 font-semibold"
                              style={{ color: "#0E2A38" }}
                            >
                              ×{it.cantidad}
                            </span>
                            <span className="truncate" style={{ color: "#0E2A38" }}>
                              {it.product?.nombre ?? "—"}
                            </span>
                          </div>
                          <span
                            className="bt-chip shrink-0"
                            style={{
                              background: chip.bg,
                              color: chip.color,
                              borderColor: chip.border,
                            }}
                          >
                            {STATUS_LABEL[it.estado]}
                          </span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Contacto */}
                  {(o.ubicacion_texto || mapsUrl || o.cliente?.phone) && (
                    <div
                      className="flex flex-col gap-1.5 rounded-[3px] border p-3 text-sm"
                      style={{
                        borderColor: "rgba(14,42,56,0.12)",
                        background: "#F2EDE0",
                      }}
                    >
                      {o.ubicacion_texto ? (
                        <div className="flex items-center gap-2" style={{ color: "#0E2A38" }}>
                          <MapPin className="size-4 shrink-0" style={{ color: "#4B6B78" }} />
                          <span>{o.ubicacion_texto}</span>
                        </div>
                      ) : null}
                      {mapsUrl ? (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener"
                          className="flex items-center gap-2 font-semibold underline-offset-2 hover:underline"
                          style={{ color: "#0A6E9E" }}
                        >
                          <MapPin className="size-4 shrink-0" /> GPS
                        </a>
                      ) : null}
                      {o.cliente?.phone ? (
                        <a
                          href={`tel:${o.cliente.phone}`}
                          className="flex items-center gap-2 font-semibold underline-offset-2 hover:underline"
                          style={{ color: "#0A6E9E" }}
                        >
                          <Phone className="size-4 shrink-0" /> {o.cliente.phone}
                        </a>
                      ) : null}
                    </div>
                  )}

                  {/* Motivo cancelación */}
                  {o.motivo_cancelacion && myStatuses.has("cancelado") ? (
                    <div
                      className="rounded-[3px] border p-3 text-sm"
                      style={{
                        borderColor: "#FF7657",
                        background: "rgba(255,118,87,0.08)",
                      }}
                    >
                      <div
                        className="bt-stencil text-[10px]"
                        style={{ color: "#FF7657" }}
                      >
                        Motivo de cancelación
                      </div>
                      <div className="mt-1" style={{ color: "#0E2A38" }}>
                        {o.motivo_cancelacion}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <p
          className="rounded-[4px] border border-dashed py-10 text-center text-sm italic"
          style={{
            borderColor: "rgba(14,42,56,0.32)",
            color: "#4B6B78",
            background: "#F8F2E2",
          }}
        >
          No hay pedidos registrados.
        </p>
      )}

      {/* Paginación */}
      {totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <span
            className="bt-mono text-[10px] uppercase tracking-[0.22em]"
            style={{ color: "#8AA3AD" }}
          >
            Pág. {page}/{totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Link
              href={basePageHref(Math.max(1, page - 1))}
              aria-disabled={page === 1}
              className="rounded-[3px] border p-2 transition-colors"
              style={{
                borderColor: "rgba(14,42,56,0.32)",
                background: "#FFFDF8",
                color: page === 1 ? "#8AA3AD" : "#0E2A38",
                pointerEvents: page === 1 ? "none" : undefined,
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <ChevronLeft className="size-5" />
            </Link>
            <Link
              href={basePageHref(Math.min(totalPages, page + 1))}
              aria-disabled={page === totalPages}
              className="rounded-[3px] border p-2 transition-colors"
              style={{
                borderColor: "rgba(14,42,56,0.32)",
                background: "#FFFDF8",
                color: page === totalPages ? "#8AA3AD" : "#0E2A38",
                pointerEvents: page === totalPages ? "none" : undefined,
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <ChevronRight className="size-5" />
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HistoryKpi({
  label,
  value,
  bar,
}: {
  label: string;
  value: string;
  bar: string;
}) {
  return (
    <div
      className="relative flex items-stretch overflow-hidden rounded-[4px] border"
      style={{
        borderColor: "rgba(14,42,56,0.32)",
        background: "#FFFDF8",
        boxShadow: "0 1px 0 rgba(14,42,56,0.06)",
      }}
    >
      <span
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{ background: bar }}
      />
      <div className="flex flex-1 flex-col gap-0.5 p-3 pl-4">
        <span
          className="bt-stencil text-[10px]"
          style={{ color: "#4B6B78" }}
        >
          {label}
        </span>
        <span
          className="bt-mono text-2xl font-bold leading-tight"
          style={{ color: "#0E2A38" }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
