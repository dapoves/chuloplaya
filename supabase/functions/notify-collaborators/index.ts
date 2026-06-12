// Edge Function: notify-collaborators
//
// Envía push a los colaboradores activos en la jornada actual cuando entra un
// nuevo pedido. Validamos JWT del llamante (cualquier usuario autenticado puede
// disparar este aviso desde su flujo de checkout) y luego usamos service_role
// para leer participants + push_subscriptions.

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

type RequestBody = {
  order_id: string;
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
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? serviceKey;
  if (!supabaseUrl || !serviceKey) {
    return new Response("missing supabase env", { status: 500, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });

  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response("invalid jwt", { status: 401, headers: corsHeaders });
  }

  let payload: RequestBody;
  try {
    payload = (await req.json()) as RequestBody;
  } catch {
    return new Response("invalid body", { status: 400, headers: corsHeaders });
  }
  if (!payload.order_id) {
    return new Response("order_id required", { status: 400, headers: corsHeaders });
  }

  const vapidPublic = Deno.env.get("VAPID_PUBLIC_KEY");
  const vapidPrivate = Deno.env.get("VAPID_PRIVATE_KEY");
  const vapidSubject = Deno.env.get("VAPID_SUBJECT");
  if (!vapidPublic || !vapidPrivate || !vapidSubject) {
    return new Response("missing VAPID env", { status: 500, headers: corsHeaders });
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Verificar que el pedido existe (gating ligero)
  const { data: order } = await admin
    .from("orders")
    .select("id, cliente_id")
    .eq("id", payload.order_id)
    .maybeSingle();
  if (!order) {
    return new Response("order not found", { status: 404, headers: corsHeaders });
  }

  // Solo el dueño del pedido (cliente) o un colaborador/admin puede disparar el aviso
  if (order.cliente_id !== user.id) {
    const { data: caller } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (caller?.role !== "colaborador" && caller?.role !== "admin") {
      return new Response("forbidden", { status: 403, headers: corsHeaders });
    }
  }

  // Participantes activos hoy
  const today = new Date().toISOString().slice(0, 10);
  const { data: shift } = await admin
    .from("shifts")
    .select("id")
    .eq("fecha", today)
    .eq("activo", true)
    .maybeSingle();
  if (!shift) {
    return Response.json({ sent: 0, reason: "no_active_shift" }, { headers: corsHeaders });
  }

  const { data: participants } = await admin
    .from("shift_participants")
    .select("colaborador_id")
    .eq("shift_id", shift.id)
    .is("left_at", null);
  const userIds = (participants ?? []).map((p) => p.colaborador_id);
  if (userIds.length === 0) {
    return Response.json({ sent: 0, reason: "no_participants" }, { headers: corsHeaders });
  }

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, subscription_json")
    .in("user_id", userIds);

  if (!subs || subs.length === 0) {
    return Response.json({ sent: 0, reason: "no_subscriptions" }, { headers: corsHeaders });
  }

  const notification = JSON.stringify({
    title: payload.title || "Nuevo pedido en cola",
    body: payload.body || "Entra a /gestion/pedidos para aceptarlo.",
    url: "/gestion/pedidos",
    tag: `new-order-${payload.order_id}`,
  });

  const results = await Promise.allSettled(
    subs.map((s) =>
      webpush.sendNotification(
        s.subscription_json as unknown as webpush.PushSubscription,
        notification
      )
    )
  );

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

  // Telegram: avisar a todos los chats registrados
  let telegramSent = 0;
  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (botToken) {
    const { data: orderDetail } = await admin
      .from("orders")
      .select(
        `ubicacion_texto,
         cliente:profiles!cliente_id(display_name, phone),
         order_items(cantidad, product:products(nombre))`
      )
      .eq("id", payload.order_id)
      .maybeSingle();

    const clienteName =
      (orderDetail?.cliente as any)?.display_name || "Cliente";
    const clientePhone = (orderDetail?.cliente as any)?.phone || "";
    const ubicacion = orderDetail?.ubicacion_texto || "No especificada";

    const productLines = ((orderDetail?.order_items as any[]) ?? []).map(
      (it: any) =>
        `  • ${it.cantidad}x ${it.product?.nombre ?? "Producto"}`
    );

    const telegramMsg =
      `🆕 <b>Nuevo pedido</b>\n\n` +
      `👤 ${clienteName}${clientePhone ? ` (${clientePhone})` : ""}\n` +
      `📍 ${ubicacion}\n\n` +
      productLines.join("\n") +
      `\n\n📋 <a href="https://chuloplaya.vercel.app/gestion/pedidos">Abrir pedidos</a>`;

    const { data: chats } = await admin
      .from("telegram_chats")
      .select("chat_id")
      .eq("active", true);

    if (chats && chats.length > 0) {
      const tgResults = await Promise.allSettled(
        chats.map((c) =>
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: c.chat_id,
              text: telegramMsg,
              parse_mode: "HTML",
            }),
          })
        )
      );
      telegramSent = tgResults.filter((r) => r.status === "fulfilled").length;
    }
  }

  return Response.json(
    { sent, removed: toRemove.length, telegramSent },
    { headers: corsHeaders }
  );
});
