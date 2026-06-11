// Edge Function: send-push
//
// Envia una notificación push a todas las subscripciones del cliente dueño del
// pedido referenciado. Solo aceptamos invocaciones desde usuarios con rol
// `colaborador` o `admin` (verificado vía JWT). Las VAPID keys vienen de
// variables de entorno configuradas en el dashboard de Supabase.
//
// Variables esperadas (Project Settings → Functions → Secrets):
//   - VAPID_PUBLIC_KEY
//   - VAPID_PRIVATE_KEY
//   - VAPID_SUBJECT     (formato "mailto:dueno@dominio")
//
// SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY los inyecta el runtime.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type RequestBody = {
  order_id: string;
  item_id?: string;
  event: string;
  title?: string;
  body?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  }

  const auth = req.headers.get("authorization");
  if (!auth) {
    return new Response("missing auth", { status: 401, headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response("missing supabase env", { status: 500, headers: corsHeaders });
  }

  // Cliente con JWT del usuario para validar el rol (RLS).
  const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response("invalid jwt", { status: 401, headers: corsHeaders });
  }

  const { data: callerProfile } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (callerProfile?.role !== "admin" && callerProfile?.role !== "colaborador") {
    return new Response("forbidden", { status: 403, headers: corsHeaders });
  }

  let payload: RequestBody;
  try {
    payload = (await req.json()) as RequestBody;
  } catch {
    return new Response("invalid body", { status: 400, headers: corsHeaders });
  }

  if (!payload.order_id || !payload.event) {
    return new Response("order_id and event required", { status: 400, headers: corsHeaders });
  }

  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (!vapidPublic || !vapidPrivate || !vapidSubject) {
    return new Response("missing VAPID env", { status: 500, headers: corsHeaders });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  // Cliente service-role para leer subscriptions del cliente dueño del pedido.
  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const { data: order } = await admin
    .from("orders")
    .select("cliente_id")
    .eq("id", payload.order_id)
    .maybeSingle();
  if (!order) {
    return new Response("order not found", { status: 404, headers: corsHeaders });
  }

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, subscription_json")
    .eq("user_id", order.cliente_id);

  if (!subs || subs.length === 0) {
    return Response.json({ sent: 0 }, { headers: corsHeaders });
  }

  const notification = JSON.stringify({
    title: payload.title || titleFor(payload.event),
    body: payload.body || bodyFor(payload.event),
    url: `/pedido/${payload.order_id}`,
    tag: `order-${payload.order_id}`,
  });

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        s.subscription_json as unknown as webpush.PushSubscription,
        notification
      )
    )
  );

  // Limpia subscripciones expiradas/inválidas.
  const toRemove: string[] = [];
  results.forEach((r, i) => {
    if (r.status !== "rejected") return;
    const reason = r.reason as { statusCode?: number } | undefined;
    if (reason?.statusCode === 404 || reason?.statusCode === 410) {
      toRemove.push(subs[i].id);
    }
  });
  if (toRemove.length > 0) {
    await admin.from("push_subscriptions").delete().in("id", toRemove);
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return Response.json(
    { sent, removed: toRemove.length },
    { headers: corsHeaders }
  );
});

function titleFor(event: string): string {
  switch (event) {
    case "aceptado":
      return "¡Pedido aceptado!";
    case "en_camino":
      return "Tu pedido va de camino";
    case "entregado":
      return "Pedido entregado";
    case "pendiente_devolucion":
      return "Hora de recoger";
    case "devuelto":
      return "Material recogido";
    case "cancelado":
      return "Pedido cancelado";
    default:
      return "Chulo Playa";
  }
}

function bodyFor(event: string): string {
  switch (event) {
    case "aceptado":
      return "Estamos preparando tu material.";
    case "en_camino":
      return "El repartidor está saliendo hacia tu sitio.";
    case "entregado":
      return "Disfruta de la playa.";
    case "pendiente_devolucion":
      return "Pasamos a recoger el material en breve.";
    case "devuelto":
      return "¡Hasta la próxima!";
    case "cancelado":
      return "Hemos cancelado tu pedido. Contáctanos si es un error.";
    default:
      return "Tu pedido se ha actualizado.";
  }
}
