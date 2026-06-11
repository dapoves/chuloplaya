import { createClient } from "@/lib/supabase/server";

import { PedidosBoard, type PedidoItem } from "./_board";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: items } = await supabase
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
    .in("estado", [
      "enviado",
      "aceptado",
      "en_camino",
      "entregado",
      "pendiente_devolucion",
    ])
    .order("created_at", { ascending: true });

  const orderIds = Array.from(
    new Set((items ?? []).map((i) => i.order?.id).filter(Boolean) as string[])
  );

  let emailMap = new Map<string, { email: string; display_name: string | null }>();
  if (orderIds.length > 0) {
    const { data: emails } = await supabase.rpc("order_client_emails", {
      p_order_ids: orderIds,
    });
    if (emails) {
      emailMap = new Map(
        emails.map((e) => [
          e.order_id,
          { email: e.email, display_name: e.display_name },
        ])
      );
    }
  }

  const enriched: PedidoItem[] = (items ?? []).map((it) => {
    const orderId = it.order?.id;
    const extra = orderId ? emailMap.get(orderId) : undefined;
    return {
      ...it,
      cliente_email: extra?.email ?? null,
    } as PedidoItem;
  });

  // Contador histórico: pedidos únicos atendidos por el usuario (todos los estados)
  const { data: myAssignments } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("colaborador_asignado_id", user.id);
  const myOrdersTotal = new Set(
    (myAssignments ?? []).map((r) => r.order_id)
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acepta pedidos nuevos y gestiona los que tienes en curso. Verás también lo que está llevando el equipo.
        </p>
      </header>

      <PedidosBoard
        initialItems={enriched}
        userId={user.id}
        myOrdersTotal={myOrdersTotal}
      />
    </div>
  );
}
