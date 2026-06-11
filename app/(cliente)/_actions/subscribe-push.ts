"use server";

import { createClient } from "@/lib/supabase/server";

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: { p256dh: string; auth: string };
};

export type SubscribePushResult = { ok: true } | { ok: false; error: string };

export async function subscribePush(
  subscription: PushSubscriptionPayload
): Promise<SubscribePushResult> {
  if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { ok: false, error: "Datos de subscripción incompletos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sin sesión activa." };

  // Evita duplicar la misma subscripción (mismo endpoint).
  const { data: existing } = await supabase
    .from("push_subscriptions")
    .select("id, subscription_json")
    .eq("user_id", user.id);

  const alreadyExists = (existing ?? []).some((row) => {
    const sub = row.subscription_json as { endpoint?: string } | null;
    return sub?.endpoint === subscription.endpoint;
  });

  if (alreadyExists) return { ok: true };

  const { error } = await supabase
    .from("push_subscriptions")
    .insert({
      user_id: user.id,
      subscription_json: subscription as unknown as never,
    });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function hasPushSubscription(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { head: true, count: "exact" })
    .eq("user_id", user.id);
  return Boolean(count && count > 0);
}
