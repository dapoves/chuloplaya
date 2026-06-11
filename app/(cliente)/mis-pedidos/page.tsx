import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

import { Icon } from "../_icons/icon";
import { ScreenShell } from "../_components/screen-shell";
import { TopBar } from "../_components/top-bar";

type ItemStatus = Database["public"]["Enums"]["item_status"];
type OrderStatus = Database["public"]["Enums"]["order_status"];

const STATUS_LABEL: Record<ItemStatus, string> = {
  enviado: "Enviado",
  aceptado: "Aceptado",
  en_camino: "En camino",
  entregado: "Entregado",
  pendiente_devolucion: "Esperando recogida",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
};

const ACTIVE: ItemStatus[] = [
  "enviado",
  "aceptado",
  "en_camino",
  "entregado",
  "pendiente_devolucion",
];

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  activo: "En curso",
  completado: "Completado",
  cancelado: "Cancelado",
};

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function MisPedidosPage(props: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageRaw } = await props.searchParams;
  const page = Math.max(1, Number(pageRaw) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <ScreenShell>
        <TopBar title="Mis pedidos" />
        <div style={{ padding: "0 22px 30px" }}>
          <p style={{ color: "var(--cp-ink-soft)" }}>
            No hay sesión activa. Haz un pedido primero.
          </p>
        </div>
      </ScreenShell>
    );
  }

  const { data: orders, count } = await supabase
    .from("orders")
    .select(
      "id, created_at, estado, ubicacion_texto, motivo_cancelacion, order_items(estado, cantidad, product:products(nombre))",
      { count: "exact" }
    )
    .eq("cliente_id", user.id)
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <ScreenShell>
      <TopBar title="Mis pedidos" sub={count ? `${count} en total` : undefined} />
      <div
        style={{
          flex: 1,
          padding: "0 22px 30px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {(!orders || orders.length === 0) && (
          <div
            style={{
              padding: "20px 18px",
              background: "var(--cp-surface)",
              borderRadius: "var(--cp-card-radius)",
              boxShadow: "var(--cp-shadow-sm)",
              color: "var(--cp-ink-soft)",
              fontSize: 14,
            }}
          >
            Aún no tienes pedidos. Cuando hagas uno, aparecerá aquí con todo el
            detalle.
          </div>
        )}

        {orders?.map((o, i) => {
          const items = o.order_items ?? [];
          const hasActive = items.some((it) => ACTIVE.includes(it.estado));
          const created = new Date(o.created_at);
          const dateLabel = created.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
          const itemsSummary = items
            .map(
              (it) =>
                `${it.cantidad}× ${it.product?.nombre ?? "Producto"} · ${STATUS_LABEL[it.estado]}`
            )
            .slice(0, 3)
            .join(" · ");
          const more = items.length > 3 ? ` +${items.length - 3} más` : "";

          return (
            <Link
              key={o.id}
              href={`/pedido/${o.id}`}
              className="cp-touchable cp-anim-list-item"
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                background: "var(--cp-surface)",
                borderRadius: "var(--cp-card-radius)",
                boxShadow: "var(--cp-shadow-sm)",
                textDecoration: "none",
                color: "var(--cp-ink)",
                "--i": Math.min(i, 8),
              } as React.CSSProperties}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 11,
                  background: hasActive
                    ? "var(--cp-primary-10)"
                    : "rgba(14,42,56,0.06)",
                  color: hasActive ? "var(--cp-primary)" : "var(--cp-ink-soft)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name="receipt" size={20} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontWeight: 700,
                    fontSize: 14.5,
                  }}
                >
                  <span>#{o.id.slice(0, 8).toUpperCase()}</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 999,
                      background: hasActive
                        ? "var(--cp-accent-14)"
                        : "rgba(14,42,56,0.06)",
                      color: hasActive
                        ? "var(--cp-accent)"
                        : "var(--cp-ink-soft)",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {hasActive ? "Activo" : ORDER_STATUS_LABEL[o.estado]}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--cp-ink-soft)",
                    marginTop: 2,
                  }}
                >
                  {dateLabel}
                  {o.ubicacion_texto ? ` · ${o.ubicacion_texto}` : ""}
                </div>
                {itemsSummary && (
                  <div
                    style={{
                      fontSize: 12.5,
                      color: "var(--cp-ink-faint)",
                      marginTop: 4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {itemsSummary}
                    {more}
                  </div>
                )}
                {o.motivo_cancelacion ? (
                  <div
                    style={{
                      marginTop: 8,
                      padding: "8px 10px",
                      borderRadius: 10,
                      background: "rgba(220, 38, 38, 0.08)",
                      color: "rgb(153, 27, 27)",
                      fontSize: 12.5,
                      lineHeight: 1.35,
                      whiteSpace: "normal",
                    }}
                  >
                    <strong style={{ display: "block", fontSize: 11.5, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                      Pedido cancelado
                    </strong>
                    {o.motivo_cancelacion}
                  </div>
                ) : null}
              </div>
              <Icon name="chevron" size={18} color="var(--cp-ink-faint)" />
            </Link>
          );
        })}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 8,
              fontSize: 13,
            }}
          >
            {page > 1 ? (
              <Link
                href={`/mis-pedidos?page=${page - 1}`}
                style={{ color: "var(--cp-primary)", fontWeight: 700 }}
              >
                ← Anterior
              </Link>
            ) : (
              <span />
            )}
            <span style={{ color: "var(--cp-ink-soft)" }}>
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                href={`/mis-pedidos?page=${page + 1}`}
                style={{ color: "var(--cp-primary)", fontWeight: 700 }}
              >
                Siguiente →
              </Link>
            ) : (
              <span />
            )}
          </div>
        )}
      </div>
    </ScreenShell>
  );
}
