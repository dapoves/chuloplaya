import Link from "next/link";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";

import { Icon } from "../_icons/icon";

type ItemStatus = Database["public"]["Enums"]["item_status"];

const STATUS_LABEL: Record<ItemStatus, string> = {
  enviado: "Enviado",
  aceptado: "Aceptado",
  en_camino: "En camino",
  entregado: "Entregado",
  pendiente_devolucion: "Esperando recogida",
  devuelto: "Devuelto",
  cancelado: "Cancelado",
};

// Estados que cuentan como "activos" (el pedido sigue en curso).
const ACTIVE: ItemStatus[] = [
  "enviado",
  "aceptado",
  "en_camino",
  "entregado",
  "pendiente_devolucion",
];

/** Pedidos del usuario actual con al menos un item en estado activo. */
export async function RecentOrders() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Últimas 24h: razonable para alquileres de playa de un día.
  // eslint-disable-next-line react-hooks/purity
  const sinceIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, order_items(estado)")
    .eq("cliente_id", user.id)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: false })
    .limit(5);

  const active = (orders ?? [])
    .map((o) => {
      const items = o.order_items ?? [];
      const isActive = items.some((it) => ACTIVE.includes(it.estado));
      // Estado representativo: el más "temprano" del pipeline.
      const stateOrder: ItemStatus[] = [
        "enviado",
        "aceptado",
        "en_camino",
        "entregado",
        "pendiente_devolucion",
        "devuelto",
        "cancelado",
      ];
      const earliest = items
        .map((it) => stateOrder.indexOf(it.estado))
        .reduce((a, b) => Math.min(a, b), stateOrder.length);
      const repState: ItemStatus | null =
        earliest < stateOrder.length ? stateOrder[earliest] : null;
      return { id: o.id, isActive, repState };
    })
    .filter((o) => o.isActive);

  if (active.length === 0) return null;

  return (
    <div
      className=""
      style={{
        marginTop: 14,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      {active.map((o, i) => (
        <Link
          key={o.id}
          href={`/pedido/${o.id}`}
          className="cp-touchable cp-anim-list-item"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 16px",
            background: "var(--cp-surface)",
            borderRadius: "var(--cp-card-radius)",
            boxShadow: "var(--cp-shadow-sm)",
            textDecoration: "none",
            "--i": i,
          } as React.CSSProperties}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--cp-primary-10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon name="receipt" size={20} color="var(--cp-primary)" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{ fontWeight: 700, fontSize: 14.5, color: "var(--cp-ink)" }}
            >
              Pedido activo · #{o.id.slice(0, 8).toUpperCase()}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--cp-ink-soft)" }}>
              {o.repState ? STATUS_LABEL[o.repState] : "En curso"} · toca para
              ver el seguimiento
            </div>
          </div>
          <Icon name="chevron" size={18} color="var(--cp-ink-faint)" />
        </Link>
      ))}
    </div>
  );
}
