"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types/database.types";
import { messageForStatus } from "@/lib/push/messages";

type ItemStatus = Database["public"]["Enums"]["item_status"];

async function notifyClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  itemId: string,
  event: ItemStatus
) {
  const msg = messageForStatus(event);
  if (!msg) return;

  const { data: item } = await supabase
    .from("order_items")
    .select("order_id")
    .eq("id", itemId)
    .maybeSingle();
  if (!item) return;

  try {
    await supabase.functions.invoke("send-push", {
      body: {
        order_id: item.order_id,
        item_id: itemId,
        event,
        title: msg.title,
        body: msg.body,
      },
    });
  } catch {
    // best-effort
  }
}

export async function acceptItem(itemId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_order_item", {
    p_item_id: itemId,
  });
  if (error) return { error: error.message };
  if (!data) return { error: "Otro colaborador ya lo aceptó." };
  await notifyClient(supabase, itemId, "aceptado");
  revalidatePath("/gestion/pedidos");
  return { ok: true };
}

export async function acceptOrder(orderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_order", {
    p_order_id: orderId,
  });
  if (error) return { error: error.message };
  if (!data) return { error: "Otro colaborador se ha adelantado." };

  // Notificar al cliente una sola vez (estado 'aceptado')
  const msg = messageForStatus("aceptado");
  if (msg) {
    try {
      await supabase.functions.invoke("send-push", {
        body: {
          order_id: orderId,
          event: "aceptado",
          title: msg.title,
          body: msg.body,
        },
      });
    } catch {
      // best-effort
    }
  }

  revalidatePath("/gestion/pedidos");
  return { ok: true, count: data };
}

export async function rejectOrder(orderId: string, motivo: string) {
  const clean = motivo.trim();
  if (clean.length < 5) {
    return { error: "El motivo debe tener al menos 5 caracteres." };
  }
  if (clean.length > 500) {
    return { error: "El motivo es demasiado largo (máx. 500)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reject_order", {
    p_order_id: orderId,
    p_motivo: clean,
  });
  if (error) return { error: error.message };

  // Push al cliente con el motivo (truncado para que entre en la notificación)
  const shortMotivo = clean.length > 120 ? clean.slice(0, 117) + "…" : clean;
  try {
    await supabase.functions.invoke("send-push", {
      body: {
        order_id: orderId,
        event: "cancelado",
        title: "Pedido cancelado",
        body: `Motivo: ${shortMotivo}`,
      },
    });
  } catch {
    // best-effort
  }

  revalidatePath("/gestion/pedidos");
  return { ok: true, count: data ?? 0 };
}

export async function setItemStatus(itemId: string, nextStatus: ItemStatus) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_item_status", {
    p_item_id: itemId,
    p_new_status: nextStatus,
  });
  if (error) return { error: error.message };
  await notifyClient(supabase, itemId, nextStatus);
  revalidatePath("/gestion/pedidos");
  return { ok: true };
}

export async function setOrderStatus(orderId: string, nextStatus: ItemStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "No autenticado." };

  const { data: items, error: fetchError } = await supabase
    .from("order_items")
    .select("id")
    .eq("order_id", orderId)
    .eq("colaborador_asignado_id", user.id)
    .not("estado", "in", "(cancelado,devuelto)");

  if (fetchError) return { error: fetchError.message };
  if (!items || items.length === 0) return { error: "No hay items para actualizar." };

  const results = await Promise.all(
    items.map((it) =>
      supabase.rpc("set_item_status", { p_item_id: it.id, p_new_status: nextStatus })
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  const msg = messageForStatus(nextStatus);
  if (msg) {
    try {
      await supabase.functions.invoke("send-push", {
        body: { order_id: orderId, event: nextStatus, title: msg.title, body: msg.body },
      });
    } catch {
      // best-effort
    }
  }

  revalidatePath("/gestion/pedidos");
  return { ok: true };
}
