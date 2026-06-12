// Edge Function: telegram-webhook
//
// Recibe actualizaciones del bot de Telegram vía webhook.
// Maneja /start para registrar chats de colaboradores/admins.
// Maneja /stop para desregistrarse.
//
// Variables esperadas (Supabase → Functions → Secrets):
//   - TELEGRAM_BOT_TOKEN

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  }

  const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!botToken || !supabaseUrl || !serviceKey) {
    return new Response("missing env", { status: 500, headers: corsHeaders });
  }

  let update: TelegramUpdate;
  try {
    update = await req.json();
  } catch {
    return new Response("invalid body", { status: 400, headers: corsHeaders });
  }

  const message = update.message;
  if (!message?.text || !message.chat) {
    return Response.json({ ok: true });
  }

  const chatId = String(message.chat.id);
  const text = message.text.trim();
  const firstName = message.from?.first_name ?? "";
  const username = message.from?.username ?? "";

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  if (text === "/start") {
    const { error } = await admin
      .from("telegram_chats")
      .upsert(
        {
          chat_id: chatId,
          name: firstName || username || chatId,
          active: true,
        },
        { onConflict: "chat_id" }
      );

    const reply = error
      ? "❌ Error al registrarte. Inténtalo de nuevo."
      : `✅ ¡Registrado! Recibirás avisos de nuevos pedidos y devoluciones.\n\nUsa /stop para dejar de recibir avisos.`;

    await sendTelegram(botToken, chatId, reply);
    return Response.json({ ok: true });
  }

  if (text === "/stop") {
    await admin
      .from("telegram_chats")
      .update({ active: false })
      .eq("chat_id", chatId);

    await sendTelegram(botToken, chatId, "🔕 Avisos desactivados. Usa /start para reactivarlos.");
    return Response.json({ ok: true });
  }

  if (text === "/status") {
    const { data } = await admin
      .from("telegram_chats")
      .select("active")
      .eq("chat_id", chatId)
      .maybeSingle();

    const status = data?.active
      ? "🔔 Avisos activados"
      : "🔕 Avisos desactivados";
    await sendTelegram(botToken, chatId, status);
    return Response.json({ ok: true });
  }

  await sendTelegram(
    botToken,
    chatId,
    "Comandos disponibles:\n/start — Activar avisos\n/stop — Desactivar avisos\n/status — Ver estado"
  );

  return Response.json({ ok: true });
});

async function sendTelegram(token: string, chatId: string, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

type TelegramUpdate = {
  message?: {
    text?: string;
    chat: { id: number };
    from?: { first_name?: string; username?: string };
  };
};
