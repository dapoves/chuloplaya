"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export type StockItem = { product_id: string; cantidad: number };

export type JornadaState = { error?: string; ok?: string } | null;

function parseItems(formData: FormData): StockItem[] {
  const raw = formData.getAll("items") as string[];
  return raw
    .map((s) => {
      try {
        const o = JSON.parse(s);
        return { product_id: String(o.product_id), cantidad: Number(o.cantidad) };
      } catch {
        return null;
      }
    })
    .filter((x): x is StockItem => !!x);
}

export async function openShift(
  _prev: JornadaState,
  formData: FormData
): Promise<JornadaState> {
  const supabase = await createClient();
  const items = parseItems(formData).filter((i) => i.cantidad > 0);

  if (items.length === 0) {
    return { error: "Carga al menos una unidad de un producto." };
  }

  const { error } = await supabase.rpc("open_shift", {
    items: items as unknown as never,
  });
  if (error) return { error: error.message };

  revalidatePath("/gestion/jornada");
  return { ok: "Jornada abierta." };
}

export async function updateShiftStock(
  _prev: JornadaState,
  formData: FormData
): Promise<JornadaState> {
  const supabase = await createClient();
  const items = parseItems(formData);

  const { error } = await supabase.rpc("update_shift_stock", {
    items: items as unknown as never,
  });
  if (error) return { error: error.message };

  revalidatePath("/gestion/jornada");
  revalidatePath("/catalogo");
  return { ok: "Stock actualizado." };
}

export async function joinShift(): Promise<JornadaState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("join_shift");
  if (error) return { error: error.message };
  revalidatePath("/gestion/jornada");
  return { ok: "Te has unido a la jornada." };
}

export async function leaveShift(): Promise<JornadaState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_shift");
  if (error) return { error: error.message };
  revalidatePath("/gestion/jornada");
  return { ok: "Has salido de la jornada." };
}

export async function heartbeat(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("heartbeat_shift");
}

export async function closeShift(shiftId: string): Promise<JornadaState> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("close_shift", { p_shift_id: shiftId });
  if (error) return { error: error.message };
  revalidatePath("/gestion/jornada");
  return { ok: "Jornada cerrada." };
}
