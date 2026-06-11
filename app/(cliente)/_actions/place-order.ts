"use server";

import { revalidatePath } from "next/cache";

import { ensureClientSession } from "@/lib/supabase/ensure-session";

export type PlaceOrderInput = {
  name: string;
  phone: string;
  email: string;
  notes: string;
  method: "gps" | "manual";
  spot: string;
  lat: number | null;
  lng: number | null;
  items: Array<{
    productId: string;
    cantidad: number;
    dur: "medio" | "dia" | "horas";
    hours: number;
  }>;
};

export type PlaceOrderResult =
  | { ok: true; orderId: string; isAnonymous: boolean }
  | { ok: false; error: string };

/**
 * Crea un pedido (orders + order_items) en estado inicial 'enviado'.
 * Garantiza que haya sesión (anon si hace falta) y persiste el teléfono en
 * el profile. Devuelve también si el usuario es anónimo para que el cliente
 * decida si mostrarle la oferta de crear cuenta.
 */
export async function placeOrder(
  input: PlaceOrderInput
): Promise<PlaceOrderResult> {
  if (input.items.length === 0) {
    return { ok: false, error: "El carrito está vacío." };
  }
  if (!input.name.trim() || !input.phone.trim()) {
    return { ok: false, error: "Faltan datos de contacto." };
  }
  if (input.method === "manual" && !input.spot.trim()) {
    return { ok: false, error: "Indica dónde dejar el material." };
  }
  if (input.method === "gps" && (input.lat == null || input.lng == null)) {
    return { ok: false, error: "No hemos detectado tu ubicación GPS." };
  }

  const { user, supabase } = await ensureClientSession();
  const isAnonymous: boolean = Boolean(user.is_anonymous);

  // Actualizar el teléfono en el profile (created por el trigger handle_new_user).
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ phone: input.phone.trim() })
    .eq("id", user.id);
  if (profileError) {
    return { ok: false, error: `No se pudo guardar tu teléfono: ${profileError.message}` };
  }

  // Texto de ubicación: combinamos spot + notas para que el repartidor vea
  // todo junto. Si es GPS, el repartidor también recibe lat/lng aparte.
  const ubicacionTexto = (
    input.method === "manual"
      ? [input.spot, input.notes].filter(Boolean).join(" · ")
      : [`Cliente: ${input.name}`, input.notes].filter(Boolean).join(" · ")
  ).slice(0, 500);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      cliente_id: user.id,
      ubicacion_lat: input.lat,
      ubicacion_lng: input.lng,
      ubicacion_texto: ubicacionTexto,
    })
    .select("id")
    .single();
  if (orderError || !order) {
    return {
      ok: false,
      error: `No se pudo crear el pedido: ${orderError?.message ?? "vacío"}`,
    };
  }

  const itemsPayload = input.items.map((it) => ({
    order_id: order.id,
    product_id: it.productId,
    cantidad: it.cantidad,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemsPayload);
  if (itemsError) {
    // Mejor esfuerzo: limpiar la orden huérfana.
    await supabase.from("orders").delete().eq("id", order.id);
    return {
      ok: false,
      error: `No se pudieron añadir productos: ${itemsError.message}`,
    };
  }

  // Aviso (best-effort) a colaboradores activos. Si falla, no rompemos el flujo.
  try {
    await supabase.functions.invoke("notify-collaborators", {
      body: {
        order_id: order.id,
        title: "Nuevo pedido en cola",
        body: `${input.items.length} producto${input.items.length === 1 ? "" : "s"} esperando.`,
      },
    });
  } catch {
    // ignorar
  }

  revalidatePath("/gestion/pedidos");
  return { ok: true, orderId: order.id, isAnonymous };
}
