"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function setFraudulent(clienteId: string, value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_fraudulent: value })
    .eq("id", clienteId);
  if (error) return { error: error.message };
  revalidatePath("/gestion/clientes");
  return { ok: true };
}
