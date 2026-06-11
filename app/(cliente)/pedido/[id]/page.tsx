import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { TrackingLive, type TrackingItem } from "./_live";

export const dynamic = "force-dynamic";

export default async function PedidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const { data: order } = await supabase
    .from("orders")
    .select("id, cliente_id, ubicacion_texto, created_at, motivo_cancelacion")
    .eq("id", id)
    .maybeSingle();
  if (!order || order.cliente_id !== user.id) notFound();

  const { data: items } = await supabase
    .from("order_items")
    .select(
      "id, cantidad, estado, hora_devolucion, product:products(id, nombre, categoria, precio, slug), colaborador:profiles!colaborador_asignado_id(display_name)"
    )
    .eq("order_id", id)
    .order("created_at", { ascending: true });

  const initial: TrackingItem[] = (items ?? []).map((it) => ({
    id: it.id,
    cantidad: it.cantidad,
    estado: it.estado,
    horaDevolucion: it.hora_devolucion,
    productNombre: it.product?.nombre ?? "—",
    productCategoria: it.product?.categoria ?? "extras",
    productPrecio: Number(it.product?.precio ?? 0),
    colaboradorNombre: it.colaborador?.display_name ?? null,
  }));

  return (
    <TrackingLive
      orderId={order.id}
      ubicacionTexto={order.ubicacion_texto}
      motivoCancelacion={order.motivo_cancelacion}
      initialItems={initial}
    />
  );
}
